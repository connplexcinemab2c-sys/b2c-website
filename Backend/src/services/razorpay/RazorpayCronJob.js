import axios from "axios";
import moment from "moment-timezone";

import { razorpayInstance } from "./RazorpayService.js";
import { refundRazorpay } from "./RazorpayRequestHandler.js";
import {
  _handleTicketFailed,
  _handlePaymentFailedDb,
  activateSubscriptionMembership,
  checkAndGrantWelcomeGift,
  _handleBookingSuccess,
} from "./RazorpayResponseHandler.js";
import Transaction from "../../models/Transaction.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import { User } from "../../models/User.js";
import { smsSend2Digital } from "../../services/CommanService.js";
import { createLog } from "../LogsServices.js";

// ─────────────────────────────────────────────────────────────────────────────
// Time window for "stuck" transactions
//   MIN: don't touch transactions younger than this — the frontend verify
//        request may still be in flight
//   MAX: don't touch older ones — Razorpay session is definitely expired
// ─────────────────────────────────────────────────────────────────────────────
const MIN_AGE_MINUTES = 5;
const MAX_AGE_MINUTES = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Main entry — called by the CronJob in server.js
// Runs both subscription and ticket recovery concurrently.
// ─────────────────────────────────────────────────────────────────────────────
export const razorpayRecoverPendingPayments = async () => {
  console.log("[RazorpayCron] Starting pending payment recovery...");
  try {
    await Promise.all([_recoverSubscriptions(), _recoverTickets()]);
  } catch (error) {
    console.error("[RazorpayCron] Fatal error:", error);
  }
  console.log("[RazorpayCron] Done.");
};

// ─────────────────────────────────────────────────────────────────────────────
// Find stuck SubscriptionTransactions and recover them
// ─────────────────────────────────────────────────────────────────────────────
const _recoverSubscriptions = async () => {
  const { from, to } = _timeWindow();

  const pending = await SubscriptionTransaction.find({
    paymentFrom: "razorpay",
    paymentsStatus: { $ne: true },
    status: { $nin: [1, 5] },
    createdAt: { $gte: from, $lte: to },
  });

  console.log(`[RazorpayCron] ${pending.length} stuck subscription(s) found`);

  for (const txn of pending) {
    try {
      await _processStuckSubscription(txn);
    } catch (e) {
      console.error(`[RazorpayCron] Subscription ${txn.initTransId} error:`, e.message);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Find stuck Transactions (ticket bookings) and recover them
// ─────────────────────────────────────────────────────────────────────────────
const _recoverTickets = async () => {
  const { from, to } = _timeWindow();

  const pending = await Transaction.find({
    paymentFrom: "razorpay",
    // paymentsStatus: { $ne: true },
    status: { $nin: [1, 3, 4, 5] },
    createdAt: { $gte: from, $lte: to },
  });

  console.log(`[RazorpayCron] ${pending.length} stuck ticket booking(s) found`);

  for (const txn of pending) {
    try {
      await _processStuckTicket(txn);
    } catch (e) {
      console.error(`[RazorpayCron] Ticket ${txn.initTransId} error:`, e.message);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Process a single stuck subscription
//
// Razorpay order status → action:
//   "paid"      → payment captured but frontend never called verify → activate
//   "attempted" → payment failed at gateway → mark status 5
//   "created"   → user never opened Razorpay popup → skip
// ─────────────────────────────────────────────────────────────────────────────
const _processStuckSubscription = async (txn) => {
  const transId = txn.initTransId;

  // Prefer direct fetch by stored orderId (fast); fall back to receipt search for older records
  let order;
  if (txn.razorpayOrderId) {
    order = await razorpayInstance.orders.fetch(txn.razorpayOrderId);
  } else {
    const ordersRes = await razorpayInstance.orders.all({ receipt: transId });
    order = ordersRes?.items?.[0];
  }

  if (!order) {
    console.log(`[RazorpayCron] No Razorpay order for subscription ${transId} — skipping`);
    return;
  }

  console.log(`[RazorpayCron] Subscription ${transId} — Razorpay order status: "${order.status}"`);

  if (order.status === "paid") {
    const paymentsRes = await razorpayInstance.orders.fetchPayments(order.id);
    const captured = paymentsRes?.items?.find((p) => p.status === "captured");
    if (!captured) return;

    // Idempotency — re-read before writing (another cron tick may have processed it)
    const fresh = await SubscriptionTransaction.findOne({ initTransId: transId });
    if (!fresh || fresh.status === 1 || fresh.paymentsStatus === true) return;

    await _activateSubscription(txn, order.notes || {}, captured);

  } else if (order.status === "attempted") {
    const fresh = await SubscriptionTransaction.findOne({ initTransId: transId });
    if (!fresh || fresh.status === 5) return;

    await SubscriptionTransaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: {
          paymentResponse: {
            razorpay_order_id: order.id,
            order_status: "Failed",
            cron_recovered: true,
          },
          paymentsStatus: false,
          status: 5,
        },
      }
    );
    console.log(`[RazorpayCron] Subscription ${transId} → marked failed`);
  }
  // "created" — user never opened Razorpay, nothing to do
};

// ─────────────────────────────────────────────────────────────────────────────
// Process a single stuck ticket booking
//
// Same order status logic as subscriptions.
// If paid: mark status 4, then attempt Vista commit within the session window.
// If the 10-min booking window is already expired → auto-refund.
// ─────────────────────────────────────────────────────────────────────────────
const _processStuckTicket = async (txn) => {
  const transId = txn.initTransId;

  // Prefer direct fetch by stored orderId (fast); fall back to receipt search for older records
  let order;
  if (txn.razorpayOrderId) {
    order = await razorpayInstance.orders.fetch(txn.razorpayOrderId);
  } else {
    const ordersRes = await razorpayInstance.orders.all({ receipt: transId });
    order = ordersRes?.items?.[0];
  }

  if (!order) {
    console.log(`[RazorpayCron] No Razorpay order for ticket ${transId} — skipping`);
    return;
  }

  console.log(`[RazorpayCron] Ticket ${transId} — Razorpay order status: "${order.status}"`);

  if (order.status === "paid") {
    const paymentsRes = await razorpayInstance.orders.fetchPayments(order.id);
    const captured = paymentsRes?.items?.find((p) => p.status === "captured");
    if (!captured) return;

    const fresh = await Transaction.findOne({ initTransId: transId }).sort({ createdAt: -1 });
    if (!fresh || [1, 3, 4, 5].includes(fresh.status)) return;

    await _commitTicketBooking(txn, order.notes || {}, captured);

  } else if (order.status === "attempted") {
    const fresh = await Transaction.findOne({ initTransId: transId }).sort({ createdAt: -1 });
    if (!fresh || [1, 3, 4, 5].includes(fresh.status)) return;

      const paymentResponse = {
    ...fresh.paymentResponse,
    order_status: "Failed"
  };

    await _handlePaymentFailedDb(
      transId,
      { ...paymentResponse, cron_recovered: true },
      txn.userId
    );
    console.log(`[RazorpayCron] Ticket ${transId} → marked failed`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Activate subscription from a captured payment
//
// DB writes:
//   SubscriptionTransaction  status → 1, paymentResponse, paymentsStatus: true
//   SubscriptionMembership   upsert via activateSubscriptionMembership
//   SubscriptionWelcomeGift  if plan has welcomeGift
// ─────────────────────────────────────────────────────────────────────────────
const _activateSubscription = async (txn, notes, payment) => {
  const { initTransId: transId, subscriptionId } = txn;
  const userId = notes.userId || String(txn.userId);
  const couponCode = notes.couponCode || "";
  const totalDiscount = notes.totalDiscount || "";

  const razorpayPaymentData = {
    razorpay_payment_id: payment.id,
    razorpay_order_id: payment.order_id,
    order_status: "Success",
    amount: payment.amount / 100,
    method: payment.method,
    bank: payment.bank,
    wallet: payment.wallet,
    vpa: payment.vpa,
    email: payment.email,
    contact: payment.contact,
    fee: payment.fee,
    tax: payment.tax,
    cron_recovered: true,
  };

  const updateData = {
    paymentResponse: razorpayPaymentData,
    paymentsStatus: true,
    userId,
    subscriptionId,
    status: 1,
  };

  if (couponCode && totalDiscount) {
    updateData.coupon = { couponCode, couponDiscount: totalDiscount };
  }

  await SubscriptionTransaction.findOneAndUpdate(
    { initTransId: transId },
    { $set: updateData }
  );

  await activateSubscriptionMembership({ userId, transId, subscriptionId });

  const user = await User.findById(userId).catch(() => null);
  if (user?.mobileNumber) {
    smsSend2Digital(
      "Your Connplex membership has been activated successfully! Thank you for subscribing. VCS industries limited",
      `+91${user.mobileNumber}`,
      process.env.SEND2DIGITAL_SUBSCRIPTION_CONTENTID
    ).catch(console.error);
  }

  console.log(`[RazorpayCron] Subscription ${transId} activated for userId ${userId}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// Commit ticket booking from a captured payment
//
// DB writes:
//   Transaction  status → 4 (payment received)
//   Transaction  status → 1 on Vista success   via _handleBookingSuccess
//   Transaction  status → 3 on Vista failure   via _handleTicketFailed + refund
//   Transaction  status → 5 if session expired via _handlePaymentFailedDb
// ─────────────────────────────────────────────────────────────────────────────
const _commitTicketBooking = async (txn, notes, payment) => {
  const transId = txn.initTransId;
  const userId = notes.userId || String(txn.userId);

  // cinemaId and sessionId come from the Razorpay order notes (set at order creation)
  const cinemaId = notes.cinemaId;
  const sessionId = notes.sessionId;

  const razorpayPaymentData = {
    razorpay_payment_id: payment.id,
    razorpay_order_id: payment.order_id,
    order_status: "Success",
    amount: txn.finalBookingCalculation?.finalAmount,
    method: payment.method,
    bank: payment.bank,
    wallet: payment.wallet,
    vpa: payment.vpa,
    email: payment.email,
    contact: payment.contact,
    fee: payment.fee,
    tax: payment.tax,
    cron_recovered: true,
  };

  // Mark payment received (status 4)
  await Transaction.findOneAndUpdate(
    { initTransId: transId },
    {
      $set: { paymentResponse: razorpayPaymentData, paymentsStatus: true, userId, status: 4 },
      $push: { logs: { paymentSuccess: new Date() } },
    }
  ).sort({ createdAt: -1 });

  // Enforce 10-minute booking session window from Transaction.createdAt
  const now = moment().format("HH:mm:ss");
  const windowEnd = moment(txn.createdAt).add(10, "minutes").format("HH:mm:ss");

  if (now >= windowEnd) {
    console.log(`[RazorpayCron] Ticket ${transId} session expired — auto-refunding`);
    createLog({
      transaction_id: transId,
      type: "Booking",
      step: {
        success: false,
        logType: "vistaBookingResponse",
        message: "Booking session expired (cron recovery)",
        timestamp: new Date().toISOString(),
      },
    });
    if (process.env.VISTA_TICKET_REFUND === "true") {
      await refundRazorpay(
        payment.id,
        txn.finalBookingCalculation?.finalAmount,
        transId
      ).catch(console.error);
    } else {
      await _handlePaymentFailedDb(
        transId,
        { ...razorpayPaymentData, order_status: "SessionExpired" },
        userId
      );
    }
    return;
  }

  if (process.env.VISTA_TICKET_BOOKING !== "true") {
    console.log(`[RazorpayCron] VISTA disabled — ticket ${transId} left at status 4`);
    return;
  }

  await checkAndGrantWelcomeGift(userId);

  const user = await User.findById(userId).catch(() => null);
  if (!user) return;

  const name = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
  const finalBooking = txn.finalBookingCalculation;
  const ticketTotal = (finalBooking?.ticketCart?.ticketTotal ?? 0) * 100;
  const fnbTotal = finalBooking?.foodCart?.totalAmountByBase ?? 0;
  let multipayment = `|PAYTYPE1=CW|AMOUNT1=${ticketTotal}|`;
  if (fnbTotal > 0) multipayment += `PAYTYPE2=CWFNB|AMOUNT2=${fnbTotal}|`;

  try {
    const response = await axios.request({
      method: "get",
      maxBodyLength: Infinity,
      url:
        `${process.env.VISTA_URL_BOOKING_URL}/CommitBookingEx` +
        `?strCinemaId=${cinemaId}` +
        `&strTransId=${transId}` +
        `&lngSessId=${sessionId}` +
        `&Name=${name}` +
        `&MobileNo=${user.mobileNumber}` +
        `&MultiPaymentDetails=${multipayment}`,
      headers: {},
    });

    if (response.data?.Status == 1) {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: true,
          logType: "vistaBookingResponse",
          message: "Ticket Booked Successfully (cron recovery)",
          response: response.data,
          timestamp: new Date().toISOString(),
        },
      });
      await _handleBookingSuccess(transId, response, user);
      console.log(`[RazorpayCron] Ticket ${transId} booked via Vista`);
    } else {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "vistaBookingResponse",
          message: "Ticket Booking Failed (cron recovery)",
          response: response.data,
          timestamp: new Date().toISOString(),
        },
      });
      await _handleTicketFailed(transId, razorpayPaymentData, user, userId, response.data);
      console.log(`[RazorpayCron] Ticket ${transId} Vista commit failed`);
    }
  } catch (error) {
    console.error(`[RazorpayCron] Vista commit error for ${transId}:`, error.message);
    await _handleTicketFailed(transId, razorpayPaymentData, user, userId, error?.response);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — compute createdAt date range for "stuck" transactions
// ─────────────────────────────────────────────────────────────────────────────
const _timeWindow = () => {
  const now = moment();
  return {
    from: now.clone().subtract(MAX_AGE_MINUTES, "minutes").toDate(),
    to: now.clone().subtract(MIN_AGE_MINUTES, "minutes").toDate(),
  };
};
