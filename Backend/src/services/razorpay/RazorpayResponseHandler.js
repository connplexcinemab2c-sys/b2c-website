import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

import { razorpayInstance, verifyPaymentSignature, verifyWebhookSignature } from "./RazorpayService.js";
import { refundRazorpay } from "./RazorpayRequestHandler.js";
import Transaction from "../../models/Transaction.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import SubscriptionMembership from "../../models/SubscriptionMembership.js";
import SubscriptionWelcomeGift from "../../models/SubscriptionWelcomeGift.js";
import Subscription from "../../models/Subscription.js";
import CCAvenueSMSMail from "../../models/CCAvenueSMSMail.js";
import { Notification } from "../../models/Notification.js";
import { User } from "../../models/User.js";
import GeneralSetting from "../../models/GeneralSetting.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { sendToWebhookApi, smsSend2Digital } from "../../services/CommanService.js";
import { BookingFailed, bookingSuccess } from "../../utils/Mailers.js";
import { userNotification } from "../Notification.js";
import { createLog } from "../LogsServices.js";
import calculateAndSaveCoins, { processCoinRedemption } from "../../controller/user/RewardsController.js";

// ---------------------------------------------------------------------------
// Ticket booking — verify Razorpay payment & commit Vista booking
// ---------------------------------------------------------------------------
//
// REQUEST BODY (sent by frontend after Razorpay popup closes):
//   paymentStatus          : "success" | "failed" | "cancelled"
//   razorpay_payment_id    : (on success only)
//   razorpay_order_id      : (on success only)
//   razorpay_signature     : (on success only)
//   transId                : internal transaction ID
//   cinemaId               : cinema ObjectId
//   sessionId              : Vista session ID
//   userId                 : user ObjectId
//
// STATUS VALUES written to Transaction.status:
//   4  — payment received from Razorpay (before Vista commit)
//   1  — ticket fully booked (Vista CommitBookingEx succeeded)
//   3  — refunded (auto-refund after Vista failure)
//   5  — payment / booking failed
//
// LOGS written to Transaction.logs array:
//   { paymentSuccess : Date }   — payment verified by HMAC
//   { ticketBooked  : Date }   — Vista commit succeeded
//   { ticketFailed  : Date }   — Vista commit failed
//   { paymentFailed : Date }   — payment failed or session expired
//
// createLog entries (separate Logs collection):
//   logType: "paymentResponse"      — payment verify result
//   logType: "vistaBookingResponse" — Vista commit result
// ---------------------------------------------------------------------------

export const paymentResponse = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      transId,
      cinemaId,
      sessionId,
      userId,
      paymentStatus,
      appliedRewardPoints,
      error: razorpayError, // Razorpay error object forwarded by frontend on failure
    } = req.body;

    // ── 1. Load user ──────────────────────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // ── 2. Payment failed / cancelled by user ─────────────────────────────────
    //   DB  → Transaction / SubscriptionTransaction  status: 5
    //   Log → Transaction.logs  { paymentFailed: Date }
    // ─────────────────────────────────────────────────────────────────────────
    if (paymentStatus !== "success") {
      // Build full payment response — capture every field Razorpay sends so the
      // record is useful for debugging and manual refund lookups.
      const failedPaymentData = {
        order_status: paymentStatus,
        ...(razorpay_payment_id && { razorpay_payment_id }),
        ...(razorpay_order_id && { razorpay_order_id }),
        ...(razorpayError && { error: razorpayError }),
      };

      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "paymentResponse",
          message: `Payment ${paymentStatus}`,
          error: failedPaymentData,
          timestamp: new Date().toISOString(),
        },
      });

      // DB → Transaction / SubscriptionTransaction
      //   paymentResponse  : failedPaymentData  (full Razorpay fields)
      //   paymentsStatus   : false
      //   status           : 5
      //   logs             : push { paymentFailed: Date }
      await _handlePaymentFailedDb(transId, failedPaymentData, user._id);

      // Send email + SMS for failures (not for user-cancelled)
      if (paymentStatus !== "cancelled") {
        await _sendFailureNotifications(user, transId, paymentStatus);
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Payment failed",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // ── 3. Verify HMAC-SHA256 signature ───────────────────────────────────────
    //   Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    //   No DB write here — we don't store anything for an invalid signature
    // ─────────────────────────────────────────────────────────────────────────
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "paymentResponse",
          message: "Razorpay signature verification failed",
          timestamp: new Date().toISOString(),
        },
      });

      // DB → Transaction
      //   paymentResponse  : all Razorpay fields + order_status flag
      //   paymentsStatus   : false
      //   status           : 5
      //   logs             : push { paymentFailed: Date }
      await _handlePaymentFailedDb(
        transId,
        {
          order_status: "SignatureFailed",
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        },
        user._id
      );

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Payment verification failed",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // ── 4. Signature valid — log payment confirmed ────────────────────────────
    createLog({
      transaction_id: transId,
      type: "Booking",
      step: {
        success: true,
        logType: "paymentResponse",
        message: "Payment Successful, Commit Booking Started",
        razorpay_payment_id,
        timestamp: new Date().toISOString(),
      },
    });

    // ── 5. Load booking data ──────────────────────────────────────────────────
    const bookingData = await Transaction.findOne(
      { initTransId: transId },
      { createdAt: true, paymentResponse: true, finalBookingCalculation: true }
    ).sort({ createdAt: -1 });

    if (!bookingData) {
      console.error(`Booking data not found: ${transId}`);
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Booking data not found",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // ── 6. Collect coupon IDs from booking calculation ────────────────────────
    let couponIds = [];
    bookingData.finalBookingCalculation?.ticketCart?.coupons?.forEach((c) =>
      couponIds.push(c._id)
    );
    bookingData.finalBookingCalculation?.foodCart?.coupons?.forEach((c) =>
      couponIds.push(c._id)
    );

    // ── 7. Calculate booking session window (10 minutes from Transaction.createdAt)
    const bookingStartTime = moment().format("HH:mm:ss");
    const bookingEndTime = moment(bookingData?.createdAt)
      .add(10, "minutes")
      .format("HH:mm:ss");

    console.log("bookingStartTime", bookingStartTime, "bookingEndTime", bookingEndTime, "valid:", bookingStartTime < bookingEndTime);

    // ── 8. Build Razorpay payment data object (stored in paymentResponse field)
    let fetchedPaymentTicket = {};
    try {
      fetchedPaymentTicket = await razorpayInstance.payments.fetch(razorpay_payment_id);
    } catch (e) {
      console.error("payments.fetch error (ticket):", e.message);
    }

    const razorpayPaymentData = {
      ...fetchedPaymentTicket,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_status: "Success",
      amount: bookingData.finalBookingCalculation?.finalAmount,
    };

    // ── 9. Store payment — status: 4  ─────────────────────────────────────────

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: {
          paymentResponse: razorpayPaymentData,
          paymentsStatus: true,
          userId,
          couponId: couponIds,
          status: 4,
          discountCouponStatus: true,
        },
        $push: { logs: { paymentSuccess: new Date() } },
      }
    ).sort({ createdAt: -1 });

    // ── 11. Rewards coins (fire-and-forget — must not block response) ─────────
    calculateAndSaveCoins(transId);

    // ── 12. Session window check Booking must be completed within 10 minutes of Transaction.createdAt ──────────────────────────────────────────────

    if (bookingStartTime >= bookingEndTime) {
      console.log("Booking time exceeded 10 minutes");

      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "vistaBookingResponse",
          message: "Ticket Booking Failed",
          error: "Booking time exceeded 10 minutes",
          timestamp: new Date().toISOString(),
        },
      });

      // DB → Transaction / SubscriptionTransaction  status: 5 
      // Log → Transaction.logs  { paymentFailed: Date }
      await _handlePaymentFailedDb(transId, razorpayPaymentData, userId);

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking session expired",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // ── 13. Session valid — welcome gift check (await, matches CCAvenue) ──────
    await checkAndGrantWelcomeGift(userId);

    // ── 14. Vista disabled — bypass commit (dev / staging) ───────────────────
    if (process.env.VISTA_TICKET_BOOKING !== "true") {
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking confirmed",
        redirectUrl: `/confirmation-screen?transId=${transId}`,
      });
    }

    // ── 15. Build Vista CommitBookingEx parameters ────────────────────────────
    const name = user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;

    const finalBooking = bookingData.finalBookingCalculation;
    const ticketTotal = (finalBooking?.ticketCart?.ticketTotal ?? 0) * 100;
    const fnbTotal = finalBooking?.foodCart?.totalAmountByBase ?? 0;

    let multipayment = `|PAYTYPE1=CW|AMOUNT1=${ticketTotal}|`;
    if (fnbTotal > 0) {
      multipayment += `PAYTYPE2=CWFNB|AMOUNT2=${fnbTotal}|`;
    }

    const vistaConfig = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        `${process.env.VISTA_URL_BOOKING_URL}/CommitBookingEx` +
        `?strCinemaId=${cinemaId}` +
        `&strTransId=${transId}` +
        `&lngSessId=${sessionId}` +
        `&Name=${name}` +
        `&MobileNo=${user?.mobileNumber}` +
        `&MultiPaymentDetails=${multipayment}`,
      headers: {},
    };

    console.log("VISTA request config:", vistaConfig);

    // ── 16. Call Vista — use .then/.catch (same pattern as CCAvenue) ──────────
    try {
      axios
        .request(vistaConfig)
        .then(async (response) => {
          console.log("VISTA response:", response.data);

          if (response.data?.Status == 1) {
            // ── 15a. Vista success — status: 1 ─────────────────────────────
         
            createLog({
              transaction_id: transId,
              type: "Booking",
              step: {
                success: true,
                logType: "vistaBookingResponse",
                response: response.data,
                message: "Ticket Booked Successfully",
                timestamp: new Date().toISOString(),
              },
            });

            await _handleBookingSuccess(transId, response, user);

            return res.status(StatusCodes.OK).json({
              status: StatusCodes.OK,
              message: "Booking confirmed",
              redirectUrl: `/confirmation-screen?transId=${transId}`,
            });
          } else {
            // ── 15b. Vista returned non-success Status ─────────────────────
     
            createLog({
              transaction_id: transId,
              type: "Booking",
              step: {
                success: false,
                logType: "vistaBookingResponse",
                message: "Ticket Booking Failed",
                response: response.data,
                timestamp: new Date().toISOString(),
              },
            });

            await _handleTicketFailed(
              transId,
              razorpayPaymentData,
              user,
              userId,
              response.data
            );

            return res.status(StatusCodes.OK).json({
              status: StatusCodes.OK,
              message: "Booking failed",
              redirectUrl: `/transaction-failed?transId=${transId}`,
            });
          }
        })
        .catch(async (error) => {
          // ── 15c. Vista network / HTTP error ──────────────────────────────
       
          createLog({
            transaction_id: transId,
            type: "Booking",
            step: {
              success: false,
              logType: "vistaBookingResponse",
              message: "Ticket Booking Failed",
              error: error?.message,
              timestamp: new Date().toISOString(),
            },
          });

          console.error("Error in VISTA request:", error);

          await _handleTicketFailed(
            transId,
            razorpayPaymentData,
            user,
            userId,
            error?.response
          );

          return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: "Booking failed",
            redirectUrl: `/transaction-failed?transId=${transId}`,
          });
        });
    } catch (error) {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "vistaBookingResponse",
          message: "Ticket Booking Failed",
          error: error?.message,
          timestamp: new Date().toISOString(),
        },
      });
      console.error("Error in commit booking:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  } catch (error) {
    console.error("Razorpay paymentResponse error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// ---------------------------------------------------------------------------
// Private — booking success side-effects



export const _handleBookingSuccess = async (strTransId, vistaResponse, user) => {
  await Transaction.findOneAndUpdate(
    { initTransId: strTransId },
    {
      $set: {
        commitBookingData: vistaResponse.data.data,
        status: 1,
        commitStatus: true,
        discountCouponStatus: true,
      },
      $push: { logs: { ticketBooked: new Date() } },
    }
  ).sort({ createdAt: -1 });

  const bookingDetails = await Transaction.findOne(
    { initTransId: strTransId },
    { addSeatData: 0, paymentResponse: 0, setSeatData: 0 }
  )
    .populate({ path: "cinemaId", select: ["cinemaName"] })
    .populate({ path: "movieId", select: ["name"] })
    .populate({ path: "showId", select: ["sessionRealShow", "screenName"] })
    .populate({ path: "couponId" })
    .sort({ createdAt: -1 });

  const smsUrl = `${process.env.M_TICKET_URL}/${strTransId}`;
  const movieDate = moment(bookingDetails?.showId?.sessionRealShow).format("DD-MM-YYYY");
  const message =
    `Your ticket is booked for ${bookingDetails?.movieId?.name} movie on ${movieDate}. ` +
    `Here is your ticket for quick reference: ${smsUrl} VCS industries limited`;

      if (bookingDetails.paymentsStatus === true && bookingDetails.commitStatus === true && process.env.SENDING_WHATSAPP_WEBHOOK_API == "true") {
        try {
          await sendToWebhookApi(strTransId);
        } catch (error) {
          console.error("Webhook error in ticketBooked:", error);
        }
      }

  if (user?.email) {
    await bookingSuccess({ email: user.email, url: smsUrl, message }).catch(console.error);
  }
  if (user?.mobileNumber) {
    await smsSend2Digital(
      message,
      `+91${user.mobileNumber}`,
      process.env.SEND2DIGITAL_TICKET_BOOKING_CONTENTID
    ).catch(console.error);
  }

  await new CCAvenueSMSMail({
    email: user.email,
    mobileNumber: user.mobileNumber,
    initTransId: strTransId,
  })
    .save()
    .catch(console.error);

  const title = "Ticket Booking Confirmation";
  const description = "Thank you for booking with The Connplex Smart Theatre!";
  const notificationData = await Notification.create({
    userId: user._id,
    notificationType: "User",
    title,
    text: description,
  }).catch(console.error);

  if (notificationData) {
    userNotification(user._id, title, description, notificationData._id);
  }

  // Redeem reward coins — only after booking confirmed (status=1)
  if (bookingDetails?.finalBookingCalculation?.rewardCoinsRedeemed > 0) {
    processCoinRedemption({
      userId: bookingDetails.userId,
      coinsToRedeem: bookingDetails.finalBookingCalculation.rewardCoinsRedeemed,
      transactionId: bookingDetails._id,
    }).catch((e) => {
      console.error("processCoinRedemption error:", e);
      createLog({
        transaction_id: strTransId,
        type: "Booking",
        step: {
          success: false,
          logType: "coinRedemption",
          message: "Coin redemption failed after booking confirmation",
          error: e.message,
          timestamp: new Date().toISOString(),
        },
      });
    });
  }
};

// ---------------------------------------------------------------------------
// Private — ticket-failure side-effects

export const _handleTicketFailed = async (
  strTransId,
  razorpayPaymentData,
  user,
  userId,
  vistaErrorResponse
) => {
  if (process.env.VISTA_TICKET_REFUND === "true") {
    await refundRazorpay(
      razorpayPaymentData.razorpay_payment_id,
      razorpayPaymentData.amount,
      strTransId
    ).catch(console.error);
  }

  const updated = await Transaction.findOneAndUpdate(
    { initTransId: strTransId },
    {
      $set: {
        commitBookingData: null,
        userId,
        commitStatus: false,
        vistaErrorResponse,
      },
      $push: { logs: { ticketFailed: new Date() } },
    },
    { new: true }
  ).sort({ createdAt: -1 });

  const bookingId = updated?.addSeatData?.strBookId;

  if (user?.email) {
    await BookingFailed({
      email: user.email,
      bookingId,
      transId: strTransId,
    }).catch(console.error);
  }
};


// Private — payment-failure side-effects
export const _handlePaymentFailedDb = async (strTransId, paymentData, userId) => {
  const update = {
    $set: {
      paymentResponse: paymentData,
      paymentsStatus: false,
      userId,
      status: 5,
    },
    $push: { logs: { paymentFailed: new Date() } },
  };

  let updated = await SubscriptionTransaction.findOneAndUpdate(
    { initTransId: strTransId },
    update,
    { new: true }
  ).sort({ createdAt: -1 });

  if (!updated) {
    updated = await Transaction.findOneAndUpdate(
      { initTransId: strTransId },
      update,
      { new: true }
    ).sort({ createdAt: -1 });
  }

  return updated;
};

// ---------------------------------------------------------------------------
// Private — failure notifications (email + SMS)
// Not sent for Aborted status (user cancelled without attempting payment)
// ---------------------------------------------------------------------------

const _sendFailureNotifications = async (user, strTransId, orderStatus) => {
  if (orderStatus === "Aborted") return;

  if (user?.email) {
    await BookingFailed({ email: user.email, transId: strTransId }).catch(console.error);
  }

  if (user?.mobileNumber) {
    await smsSend2Digital(
      "Due to some technical error your transaction has failed, Sorry for inconvenience. VCS industries limited",
      `+91${user.mobileNumber}`,
      process.env.SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID
    ).catch(console.error);
  }
};

// ---------------------------------------------------------------------------
// Welcome gift check
// Grants a welcome gift if user hits the ticket threshold (GeneralSetting)
//
// DB writes (only if threshold met and no gift exists):
//   SubscriptionWelcomeGift  new record with type: "ticket", collectBeforeDate: +30 days
// ---------------------------------------------------------------------------

export const checkAndGrantWelcomeGift = async (userId) => {
  try {
    if (!userId) return;

    const existingGift = await SubscriptionWelcomeGift.findOne({
      userId,
      type: "ticket",
    });
    if (existingGift) return;

    const setting = await GeneralSetting.findOne();
    if (!setting?.isWelcomeGift) return;

    const ticketRequired = setting.ticketsRequired ?? 1;
    const count = await Transaction.countDocuments({
      userId,
      paymentResponse: { $ne: null },
    });

    if (count >= ticketRequired) {
      const currentDate = moment().tz("Asia/Kolkata").startOf("day");
      const collectBeforeDate = moment(currentDate).add(30, "days").endOf("day");
      await new SubscriptionWelcomeGift({
        userId: new mongoose.Types.ObjectId(userId),
        collectBeforeDate,
        type: "ticket",
      }).save();
      console.log("Welcome gift granted for userId:", userId);
    }
  } catch (error) {
    console.error("Error in checkAndGrantWelcomeGift:", error);
  }
};

// ---------------------------------------------------------------------------
// Subscription payment — verify Razorpay payment & activate membership
// ---------------------------------------------------------------------------


export const subscriptionPaymentResponse = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      transId,
      userId,
      subscriptionId,
      couponCode,
      totalDiscount,
      paymentStatus,
      amount,
    } = req.body;

    const user = await User.findById(userId);

    // ── Payment failed / cancelled ────────────────────────────────────────────
    //   DB → SubscriptionTransaction  status: 5, paymentsStatus: false
    // ─────────────────────────────────────────────────────────────────────────
    if (paymentStatus !== "success") {
      await SubscriptionTransaction.findOneAndUpdate(
        { initTransId: transId },
        {
          $set: {
            paymentResponse: { order_status: paymentStatus },
            paymentsStatus: false,
            userId,
            subscriptionId,
            status: 5,
          },
        }
      );

      if (user?.mobileNumber) {
        await smsSend2Digital(
          "Due to some technical error your transaction has failed, Sorry for inconvenience. VCS industries limited",
          `+91${user.mobileNumber}`,
          process.env.SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID
        ).catch(console.error);
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Payment failed",
        redirectUrl: `/membership-failed?transId=${transId}`,
      });
    }

    // ── Verify HMAC signature ─────────────────────────────────────────────────
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Payment verification failed",
        redirectUrl: `/membership-failed?transId=${transId}`,
      });
    }

    // ── Activate subscription ─────────────────────────────────────────────────
    const SubscriptionData = await SubscriptionTransaction.findOne(
      { initTransId: transId },
      { subscriptionId: true }
    );

    if (!SubscriptionData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Subscription transaction not found",
        redirectUrl: `/membership-failed?transId=${transId}`,
      });
    }

    // Convert Piasa to Rupees for storage (e.g. ₹1 → 100)
    const amountInRupees = amount / 100;

    let fetchedPaymentSub = {};
    try {
      fetchedPaymentSub = await razorpayInstance.payments.fetch(razorpay_payment_id);
    } catch (e) {
      console.error("payments.fetch error (subscription):", e.message);
    }

    const razorpayPaymentData = {
      ...fetchedPaymentSub,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_status: "Success",
      amount: amountInRupees,
    };

    // ── DB → SubscriptionTransaction  status: 1 ───────────────────────────────
    const updateData = {
      paymentResponse: razorpayPaymentData,
      paymentsStatus: true,
      userId,
      subscriptionId: SubscriptionData.subscriptionId,
      status: 1,
    };

    if (couponCode && totalDiscount) {
      updateData.coupon = { couponCode, couponDiscount: totalDiscount };
    }

    await SubscriptionTransaction.findOneAndUpdate(
      { initTransId: transId },
      { $set: updateData }
    );

    // ── Activate membership ───────────────────────────────────────────────────
    await activateSubscriptionMembership({
      userId,
      transId,
      subscriptionId: SubscriptionData.subscriptionId,
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Subscription activated successfully",
      redirectUrl: `/membership-success?transId=${transId}`,
    });
  } catch (error) {
    console.error("Razorpay subscriptionPaymentResponse error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// ---------------------------------------------------------------------------
// Shared — activate subscription membership
// ---------------------------------------------------------------------------

export const activateSubscriptionMembership = async ({ userId, transId, subscriptionId }) => {
  const oldSubscribeMember = await SubscriberMembership.findOne({
    userId,
    deletedStatus: 0,
  }).sort({ createdAt: -1 });

  let previousPlanName = null;
  let newPlanName = null;

  if (oldSubscribeMember) {
    const previousPlan = await Subscription.findOne({
      _id: oldSubscribeMember.subscriptionId,
      deletedStatus: 0,
    });
    const newPlan = await Subscription.findOne({ _id: subscriptionId, deletedStatus: 0 });
    previousPlanName = previousPlan?.title ?? null;
    newPlanName = newPlan?.title ?? null;
  }

  const newUpgradePlan = !previousPlanName
    ? `Subscribed to ${newPlanName}`
    : `Upgraded from ${previousPlanName} to ${newPlanName}`;

  const subscriptionDetails = await Subscription.findOne({ _id: subscriptionId });

  const startDate = moment().tz("Asia/Kolkata").startOf("day");
  const endDate = moment(startDate)
    .add(subscriptionDetails.membershipDuration, "days")
    .endOf("day");

  const subData = {
    userId,
    initTransId: transId,
    subscriptionId,
    isActive: true,
    subscriptionDetails: {
      discountOfFAndB: subscriptionDetails.discountOfFAndB,
      discountOnTicket: subscriptionDetails.discountOnTicket,
      discountOnEcommerce: subscriptionDetails.discountOnEcommerce,
      discountOfFAndBUpTo: subscriptionDetails.discountOfFAndBUpTo,
      discountOnTicketUpTo: subscriptionDetails.discountOnTicketUpTo,
      discountOnEcommerceUpTo: subscriptionDetails.discountOnEcommerceUpTo,
      freeTicket: subscriptionDetails.freeTicket,
      priorityBooking: subscriptionDetails.priorityBooking,
      accessToExclusiveScreening: subscriptionDetails.accessToExclusiveScreening,
      guestPasses: subscriptionDetails.guestPasses,
      specialEventAccess: subscriptionDetails.specialEventAccess,
      earlyAccessToTickets: subscriptionDetails.earlyAccessToTickets,
      support: subscriptionDetails.support,
      coins: subscriptionDetails.coins,
      welcomeGift: subscriptionDetails.welcomeGift,
      price: subscriptionDetails.price,
      discountedPrice: subscriptionDetails.discountedPrice,
      isDiscounted: subscriptionDetails.isDiscounted,
      membershipDuration: subscriptionDetails.membershipDuration,
    },
    subscriptionStartDate: startDate.format("YYYY-MM-DD HH:mm:ss"),
    subscriptionEndDate: endDate.format("YYYY-MM-DD HH:mm:ss"),
    upgradePlan: !!oldSubscribeMember,
    upgradePlanDate: oldSubscribeMember ? Date.now() : null,
    upgradePretoPost: oldSubscribeMember ? newUpgradePlan : null,
  };

  await SubscriberMembership.updateMany(
    { userId, isActive: true },
    { $set: { isActive: false } }
  );

  const subscriptionMembership = await SubscriptionMembership.findOneAndUpdate(
    {
      userId: subData.userId,
      subscriptionId: subData.subscriptionId,
      isActive: true,
    },
    { $set: subData },
    { upsert: true, new: true }
  );

  if (
    subData.subscriptionDetails?.welcomeGift === "Yes" &&
    subscriptionMembership?._id
  ) {
    const currentDate = moment().tz("Asia/Kolkata").startOf("day");
    const collectBeforeDate = moment(currentDate).add(30, "days").endOf("day");
    await new SubscriptionWelcomeGift({
      userId: new mongoose.Types.ObjectId(subData.userId),
      subscriptionMembershipId: new mongoose.Types.ObjectId(subscriptionMembership._id),
      collectBeforeDate,
    }).save();
  }
};

// ---------------------------------------------------------------------------
// Ticket booking — complete directly when finalAmount == 0
// (full discounts / reward points cover the entire booking cost)
// Mirrors ccavEncResponseDirectly in CcavenueService.js
// ---------------------------------------------------------------------------

export const razorpayBookDirectly = async (res, userId, transId, cinemaId, sessionId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    const bookingData = await Transaction.findOne(
      { initTransId: transId },
      { createdAt: true, paymentResponse: true, finalBookingCalculation: true }
    ).sort({ createdAt: -1 });

    if (!bookingData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Booking data not found",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    // Collect coupon IDs
    let couponIds = [];
    bookingData.finalBookingCalculation?.ticketCart?.coupons?.forEach((c) => couponIds.push(c._id));
    bookingData.finalBookingCalculation?.foodCart?.coupons?.forEach((c) => couponIds.push(c._id));

    const bookingStartTime = moment().format("HH:mm:ss");
    const bookingEndTime = moment(bookingData.createdAt).add(10, "minutes").format("HH:mm:ss");

    const zeroPaymentData = {
      order_status: "Success",
      payment_mode: "Discount",
      amount: 0,
    };

    // Mark transaction as paid
    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: {
          paymentResponse: zeroPaymentData,
          paymentsStatus: true,
          userId,
          couponId: couponIds,
          status: 4,
          discountCouponStatus: true,
        },
        $push: { logs: { paymentSuccess: new Date() } },
      }
    ).sort({ createdAt: -1 });

    // Earn reward coins (fire-and-forget)
    calculateAndSaveCoins(transId);

    if (bookingStartTime >= bookingEndTime) {
      await _handleTicketFailed(transId, zeroPaymentData, user, userId, null);
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking session expired",
        redirectUrl: `/transaction-failed?transId=${transId}`,
      });
    }

    await checkAndGrantWelcomeGift(userId);

    if (process.env.VISTA_TICKET_BOOKING !== "true") {
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "Booking confirmed",
        redirectUrl: `/confirmation-screen?transId=${transId}`,
      });
    }

    // Vista CommitBooking
    const name = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;

    const vistaConfig = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        `${process.env.VISTA_URL_BOOKING_URL}/CommitBooking` +
        `?strCinemaId=${cinemaId}` +
        `&strTransId=${transId}` +
        `&lngSessId=${sessionId}` +
        `&Name=${name}` +
        `&MobileNo=${user?.mobileNumber}`,
      headers: {},
    };

    try {
      axios
        .request(vistaConfig)
        .then(async (response) => {
          if (response.data?.Status == 1) {
            await _handleBookingSuccess(transId, response, user);
            return res.status(StatusCodes.OK).json({
              status: StatusCodes.OK,
              message: "Booking confirmed",
              redirectUrl: `/confirmation-screen?transId=${transId}`,
            });
          } else {
            await _handleTicketFailed(transId, zeroPaymentData, user, userId, response.data);
            return res.status(StatusCodes.OK).json({
              status: StatusCodes.OK,
              message: "Booking failed",
              redirectUrl: `/transaction-failed?transId=${transId}`,
            });
          }
        })
        .catch(async (error) => {
          console.error("Error in VISTA direct booking:", error);
          await _handleTicketFailed(transId, zeroPaymentData, user, userId, error?.response);
          return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: "Booking failed",
            redirectUrl: `/transaction-failed?transId=${transId}`,
          });
        });
    } catch (error) {
      console.error("Error in razorpayBookDirectly commit:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  } catch (error) {
    console.error("razorpayBookDirectly error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

// ---------------------------------------------------------------------------
// Free subscription — activate directly (amount = 0, no Razorpay order needed)
// ---------------------------------------------------------------------------

export const buySubscriptionMembershipDirectly = async (res, data) => {
  const { userId, subscriptionId, couponCode, amount, totalDiscount } = data;
  try {
    const transId = uuidv4();

    await SubscriptionTransaction.create({
      userId,
      subscriptionId,
      initTransId: transId,
      paymentFrom: "razorpay",
      paymentResponse: {
        order_id: transId,
        order_status: "Success",
        payment_mode: "Voucher",
        amount,
      },
      paymentsStatus: true,
      status: 1,
      coupon: {
        couponCode: couponCode || "",
        totalDiscount: totalDiscount || "0",
      },
    });

    await activateSubscriptionMembership({ userId, transId, subscriptionId });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Subscription activated successfully",
      redirectUrl: `/membership-success?transId=${transId}`,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

// ---------------------------------------------------------------------------
// Razorpay webhook (optional — for async payment event verification)
// Register URL in Razorpay Dashboard → Webhooks
// Required env: RAZORPAY_WEBHOOK_SECRET
// ---------------------------------------------------------------------------

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;

    if (event === "payment.captured" && payload) {
      const transId = payload.notes?.transId;
      if (transId) {
        await Transaction.findOneAndUpdate(
          { initTransId: transId },
          { $set: { "paymentResponse.webhook_captured": true } }
        );
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
