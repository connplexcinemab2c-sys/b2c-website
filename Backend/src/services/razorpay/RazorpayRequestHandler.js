import dotenv from "dotenv";
dotenv.config();
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

import { razorpayInstance } from "./RazorpayService.js";
import { decryptPayment } from "../../services/CommanService.js";
import Cinema from "../../models/Cinema.js";
import Show from "../../models/Shows.js";
import Price from "../../models/Price.js";
import PricePackage from "../../models/PricePackage.js";
import Transaction from "../../models/Transaction.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import Subscription from "../../models/Subscription.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import { User } from "../../models/User.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { createLog } from "../LogsServices.js";
import { verifyMembershipCoupon } from "../CouponCartService.js";
import { buySubscriptionMembershipDirectly, razorpayBookDirectly } from "./RazorpayResponseHandler.js";

// ---------------------------------------------------------------------------
// Ticket booking — create Razorpay order
// ---------------------------------------------------------------------------

/**
 * POST /ccavRequestHandler  (same route, gateway-switched)
 *
 * Validates the booking session, creates a Razorpay order, and returns JSON
 * for the frontend to open the Razorpay checkout popup.
 *
 * Response (success):
 *   { status, message, data: { razorpayOrderId, amount, currency, keyId, transId,
 *                               cinemaId, sessionId, userId, prefill } }
 */
export const paymentRequest = async (req, res) => {
  if (process.env.ENABLE_BOOKING === "false") {
    return res.status(503).json({
      status: StatusCodes.SERVICE_UNAVAILABLE,
      message: ResponseMessage.BOOKING_DISABLED,
      data: [],
    });
  }

  try {
    const { id } = req.body;
    const salt = process.env.salt;
    const decryptBody = decryptPayment(salt, id);
    const parts = decryptBody.split("|");

    console.log(parts, "Decrypted payment request parts");

    const [
      transId,
      cinemaId,
      sessionId,
      userId,
      areaCatCode,
      quantity,
      pGroupCode,
      fAndB,
      appliedRewardPoints,
      booking_type,
    ] = parts;

    const now = moment.tz("Asia/Kolkata");

    // Check session expiry (10-minute window) + fetch finalBookingCalculation for 0-amount bypass
    const findTransaction = await Transaction.findOne(
      { initTransId: transId },
      { logs: true, finalBookingCalculation: true }
    ).sort({ createdAt: -1 });

    if (
      findTransaction &&
      Array.isArray(findTransaction.logs) &&
      findTransaction.logs.length > 0
    ) {
      const initBookingTime = findTransaction.logs[0]?.initBooking;
      if (
        initBookingTime &&
        now.diff(moment(initBookingTime), "minutes") > 10
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BOOKING_SESSION_EXPIRED,
          data: [],
        });
      }
    }

    // If full discounts / reward points bring the total to 0, bypass payment gateway
    if (findTransaction?.finalBookingCalculation?.finalAmount == 0) {
      await razorpayBookDirectly(res, userId, transId, cinemaId, sessionId);
      return;
    }

    // Mark transaction as heading to payment
    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: { userId, paymentFrom: "razorpay", booking_type },
        $push: { logs: { proceedToPay: new Date() } },
      }
    ).sort({ createdAt: -1 });

    const initBookingDetails = await Transaction.findOne({
      initTransId: transId,
      userId,
    })
      .populate("userId")
      .sort({ createdAt: -1 });

    if (!initBookingDetails) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
        data: [],
      });
    }

    const findCinema = await Cinema.findOne({ _id: initBookingDetails.cinemaId });
    const checkQuantity =
      initBookingDetails.setSeatData.strSeatInfo.split(" - ")[1].split(",")
        .length == quantity;
    const checkFAndB = initBookingDetails.foodAndBvgResponse ? true : false;
    const findSession = await Show.findOne({
      _id: initBookingDetails.showId,
      cinemaId: findCinema.cinemaId,
    });
    const checkAreaCatCode = await Price.findOne({
      areaCatCode,
      cinemaId: findCinema.cinemaId,
      pGroupCode: findSession.pGroupCode,
    });
    const areaCatCodeFromPackage = await PricePackage.findOne({
      areaCatCode,
      cinemaId: findCinema.cinemaId,
      pGroupCode: findSession.pGroupCode,
    });

    if (
      !initBookingDetails ||
      !checkQuantity ||
      checkFAndB !== JSON.parse(fAndB) ||
      (!checkAreaCatCode && !areaCatCodeFromPackage)
    ) {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "paymentStarted",
          message: "Payment Details Mismatch",
          timestamp: new Date().toISOString(),
        },
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
        data: [],
      });
    }

    const finalAmount = initBookingDetails.finalBookingCalculation?.finalAmount ?? 0;

    if (!finalAmount || finalAmount <= 0) {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType: "paymentStarted",
          message: "Invalid payment amount (negative or missing)",
          timestamp: new Date().toISOString(),
        },
      });
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
        data: [],
      });
    }

    const user = await User.findOne({ _id: initBookingDetails.userId._id });
    const userName = user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;

    // Amount in paise (Razorpay expects smallest currency unit)
    const amountInPaise =
      process.env.RAZORPAY_PAYMENT_MODE === "test"
        ? 100 // ₹1 in test mode
        : Math.round(+finalAmount * 100);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: transId,
      notes: {
        transId,
        cinemaId,
        sessionId,
        userId,
        appliedRewardPoints,
      },
    });

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      { $set: { razorpayOrderId: razorpayOrder.id } }
    ).sort({ createdAt: -1 });

    createLog({
      transaction_id: transId,
      type: "Booking",
      step: {
        success: true,
        logType: "paymentStarted",
        message: "Razorpay order created",
        razorpayOrderId: razorpayOrder.id,
        timestamp: new Date().toISOString(),
      },
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        transId,
        cinemaId,
        sessionId,
        userId,
        appliedRewardPoints,
        prefill: {
          name: userName,
          email: user.email || "",
          contact: user.mobileNumber ? `+91${user.mobileNumber}` : "",
        },
      },
    });
  } catch (error) {
    console.error("Razorpay paymentRequest error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [],
    });
  }
};

// ---------------------------------------------------------------------------
// Ticket booking — refund via Razorpay
// ---------------------------------------------------------------------------

export const refundRazorpay = async (paymentId, amount, initTransId) => {
  try {
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // convert ₹ to paise
    });

    if (refund && refund.id) {
      await Transaction.findOneAndUpdate(
        { initTransId },
        {
          $set: {
            status: 3, // Refunded
            refundResponse: refund,
            refundStatus: true,
            autoRefund: true,
          },
        }
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Subscription payment — create Razorpay order
// ---------------------------------------------------------------------------

export const subscriptionPaymentRequest = async (req, res) => {
  try {
    const userId = req.user;
    console.log(userId, ":userId")
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 400,
        message: "Invalid user ID",
        data: [],
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
        data: [],
      });
    }

    const { subscriptionId, couponCode = "" } = req.body;
    const now = moment.tz("Asia/Kolkata");

    // Prevent duplicate active subscription
    const subscribeMemberExist = await SubscriberMembership.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
      subscriptionEndDate: { $gt: now.toDate() },
      isActive: true,
      deletedStatus: 0,
    });

    if (subscribeMemberExist) {
      return res.status(StatusCodes.CONFLICT).json({
        status: StatusCodes.CONFLICT,
        message: "Subscription membership already purchased",
        data: [],
      });
    }

    const findSubscription = await Subscription.findOne({
      _id: new mongoose.Types.ObjectId(subscriptionId),
    });

    if (!findSubscription) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Subscription not found",
        data: [],
      });
    }

    // Calculate price (with or without coupon)
    let result = {
      finalAmount:
        findSubscription.isDiscounted === true
          ? findSubscription.discountedPrice
          : findSubscription.price,
      totalDiscount: 0,
    };

    if (couponCode && couponCode !== "") {
      result = await verifyMembershipCoupon({ couponCode, subscriptionId, userId });
    }

    const amount = result.finalAmount ?? null;
    const totalDiscount = result.totalDiscount ?? 0;

    // Free subscription — activate directly without payment
    if (amount <= 0) {
      await buySubscriptionMembershipDirectly(res, {
        userId,
        subscriptionId,
        couponCode,
        amount,
        totalDiscount,
      });
      return;
    }

    const transId = uuidv4();

    // Persist a pending subscription transaction
    await SubscriptionTransaction.create({
      userId,
      paymentFrom: "razorpay",
      subscriptionId,
      initTransId: transId,
    });

    const userName = user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;

    //₹1 in test mode --- IGNORE ---
    const amountInPaise =
      process.env.RAZORPAY_PAYMENT_MODE === "test"
        ? 100 // ₹1 in test mode
        : Math.round(+amount * 100);

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: transId,
      notes: {
        transId,
        userId,
        subscriptionId,
        couponCode,
        totalDiscount: String(totalDiscount),
      },
    });

    await SubscriptionTransaction.findOneAndUpdate(
      { initTransId: transId },
      { $set: { razorpayOrderId: razorpayOrder.id } }
    );

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Subscription order created successfully",
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        transId,
        userId,
        subscriptionId,
        couponCode,
        totalDiscount,
        prefill: {
          name: userName,
          email: user.email || "",
          contact: user.mobileNumber ? `+91${user.mobileNumber}` : "",
        },
      },
    });
  } catch (error) {
    console.error("Razorpay subscriptionPaymentRequest error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [],
    });
  }
};
