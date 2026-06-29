import mongoose from "mongoose";
import { User } from "../models/User.js";
import moment from "moment";
import momentTimezone from "moment-timezone";
import MembershipSubscription from "../models/SubscriptionMembership.js";
import Cinema from "../models/Cinema.js";
import Coupon from "../models/Coupons.js";
import Transaction from "../models/Transaction.js";
import SubscriptionTransaction from "../models/SubscriptionTransaction.js";
import Subscription from "../models/Subscription.js";
import RewardConfig from "../models/RewardConfig.js";

// const getNumberUptoTwoDecimal = (num) => {
//   return Number((Math.floor(num * 100) / 100).toFixed(2))
// }
const getNumberUptoTwoDecimal = (num) => {
  const fixedOnce = Number(num).toFixed(2);           
  const fixedTwice = (Math.trunc(fixedOnce * 100) / 100).toFixed(2); 
  return Number(fixedTwice);                           
};
// Get Cart without Coupons
export const getCouponCart = async (
  coupons, // Removed but kept in function signature for compatibility
  ticketTotal,
  fnbprice,
  cityId,
  cinemaObjectId,
  movieLanguage,
  autoApply, // Removed but kept for compatibility
  userId,
  deviceType,
  userTicketSpentAmount, // Removed but kept for compatibility
  quantity,
  _transId,
  _couponDetails,
  rewardCoins = 0
) => {
  const getUserDetails = await User.findOne({ _id: userId });

  let ticketCart = {
    discountAmount: 0,
    basePrice: ticketTotal > 0 ? ticketTotal : 0,
    membershipDiscount: 0,
    totalAfterDiscount: 0,
    cgst: 0,
    sgst: 0,
    coupons: [], // Empty as coupons are removed
    total: 0,
    ticketTotal: +ticketTotal,
  };
  let foodCart = {
    discountAmount: 0,
    basePrice: fnbprice > 0 ? fnbprice : 0,
    membershipDiscount: 0,
    totalAfterDiscount: 0,
    cgst: 0,
    sgst: 0,
    coupons: [], // Empty as coupons are removed
    total: 0,
    fnbTotal: +fnbprice,
  };

  const now = momentTimezone.tz("Asia/Kolkata");
  const subscriptionData = await MembershipSubscription.findOne({
    userId: getUserDetails._id,
    subscriptionEndDate: { $gt: now.toDate() },
    isActive: true,
    deletedStatus: 0,
  });

  let ticketMembershipDiscount = 0;
  if (
    subscriptionData?.subscriptionDetails &&
    subscriptionData?.subscriptionDetails.discountOnTicket
  ) {
    ticketMembershipDiscount =
      subscriptionData?.subscriptionDetails.discountOnTicket;
    ticketMembershipDiscount = getNumberUptoTwoDecimal(ticketMembershipDiscount)
  }
  let foodMembershipDiscount = 0;
  if (
    subscriptionData?.subscriptionDetails &&
    subscriptionData?.subscriptionDetails.discountOfFAndB
  ) {
    foodMembershipDiscount = subscriptionData?.subscriptionDetails.discountOfFAndB;
    foodMembershipDiscount = getNumberUptoTwoDecimal(foodMembershipDiscount)
  }

  const totalTicketPrice = getNumberUptoTwoDecimal(ticketTotal > 0 ? ticketTotal : 0);
  ticketCart.basePrice = getNumberUptoTwoDecimal(calculateBasePrice(
    totalTicketPrice,
    totalTicketPrice < 115 ? 12 : 18
  ));

  // If Ticket Base Price is less than 115, apply 12% GST; otherwise, apply 18%
  let ticketGSTPercentage = ticketCart.basePrice < 115 ? 12 : 18;

  ticketCart.membershipDiscount = getNumberUptoTwoDecimal(calculateMembershipDiscount(
    ticketMembershipDiscount,
    parseFloat(ticketCart.ticketTotal)
  ));

  ticketCart.totalAfterDiscount = ticketCart.ticketTotal - ticketCart.membershipDiscount;
  ticketCart.total =
  getNumberUptoTwoDecimal(ticketCart.totalAfterDiscount <= 0 ? 0 : ticketCart.totalAfterDiscount);
// console.log(ticketCart.total, "ticketCart.total");
  const totalFNBPrice = fnbprice > 0 ? fnbprice : 0;
  foodCart.basePrice = getNumberUptoTwoDecimal(calculateBasePrice(totalFNBPrice, 5));

  foodCart.membershipDiscount = getNumberUptoTwoDecimal(calculateMembershipDiscount(
    foodMembershipDiscount,
    foodCart.fnbTotal
  ));
  foodCart.totalAfterDiscount =
    foodCart.fnbTotal - foodCart.membershipDiscount;
  foodCart.total =
    getNumberUptoTwoDecimal(foodCart.fnbTotal - foodCart.membershipDiscount <= 0
      ? 0
      : foodCart.fnbTotal - foodCart.membershipDiscount);
// console.log(foodCart.total, "foodCart.total", foodCart.fnbTotal, foodCart.membershipDiscount);

  // Calculate and add convenience fee
  const { convenienceFees } = await Cinema.findById(cinemaObjectId, "convenienceFees");
  const totalFees = convenienceFees > 0 ? getNumberUptoTwoDecimal(convenienceFees) * quantity : 0;
  const gst = totalFees > 0 ? +(totalFees * 0.18).toFixed(2) : 0;
  const total = +(totalFees + gst).toFixed(2);

  const convenienceFeesObject = {
    convenienceFees: totalFees,
    gst,
    total,
  };

  const baseAmount = +foodCart.total + +ticketCart.total + convenienceFeesObject.total;
  const totalDiscount = +foodCart.discountAmount + +ticketCart.discountAmount;

  // Reward points discount
  let rewardDiscount = 0;
  if (rewardCoins > 0) {
    const config = await RewardConfig.findOne({});
    const conversionPoints = config?.conversionPoints ?? 100;
    const conversionValue = config?.conversionValue ?? 10;
    const maxRedemptionCap = config?.maxRedemptionCap ?? 1000;
    const coinsToApply = Math.min(Number(rewardCoins), maxRedemptionCap);
    rewardDiscount = Math.floor(coinsToApply / conversionPoints) * conversionValue;
  }

  const finalAmount = Math.max(0, Math.round((baseAmount - rewardDiscount) * 100) / 100);

  return {
    ticketCart,
    foodCart,
    finalAmount,
    totalDiscount,
    rewardDiscount,           // kept for frontend (counponCartDetails?.rewardDiscount)
    rewardCoinsRedeemed: Number(rewardCoins) || 0,
    rewardDiscountApplied: rewardDiscount,
    isCouponUsage: true,
    isOverAllCouponUsage: true,
    convenienceFeesObject,
  };
};

// Calculate GST
const calculateGst = (price, gstPercentage) => {
  const gst = Number(price) - Number(price) / (1 + Number(gstPercentage) / 100);
  return gst;
};

// Calculate Base Price (Price without GST)
export const calculateBasePrice = (amount, gstPercentage) => {
  return +(amount - calculateGst(amount, gstPercentage)).toFixed(3);
};

// Calculate Membership Discount
const calculateMembershipDiscount = (percentage, price) => {
  let discountValue = (percentage * price) / 100;
  let couponDiscount = price - discountValue;
  if (price >= discountValue) {
    couponDiscount = discountValue;
  }
  return couponDiscount;
};
// Public Coupons List
export const getpublicCoupons = async (
  cityId,
  cinemaObjectId,
  movieLanguage,
  deviceType
) => {
  const coupons = await Coupon.find({
    isActive: true,
    deletedStatus: 0,
    couponFor: deviceType,
    cityId: cityId,
    cinemaObjectId: cinemaObjectId,
    movieLanguage: movieLanguage,
    couponCategory: "Public",
    couponEndDate: {
      $gte: moment().format("YYYY-MM-DD"),
    }
    // "advancedSettings.mergeWithAnotherCoupon": 1,
    // "advancedSettings.autoApplyOnCheckOut": 0,
  });

  const filteredCoupons = [];

  for (const coupon of coupons) {
    const usageCount = await Transaction.countDocuments({
      couponId: coupon._id,
    });
    if (usageCount < coupon.couponCodeOverAllUsage) {
      filteredCoupons.push(coupon);
    }
  }

  return filteredCoupons;
};



// src/services/coupon.js

function calculateDiscount(amount, coupon) {
  const parsedAmount = parseFloat(amount);
  const discountValue = parseFloat(coupon.discount);

  let discountAmount = 0;

  if (coupon.discountType === "flat") {
    discountAmount = discountValue;
  } else if (coupon.discountType === "%") {
    discountAmount = (parsedAmount * discountValue) / 100;
    if (coupon.couponUpTo !== undefined && discountAmount > coupon.couponUpTo) {
      discountAmount = coupon.couponUpTo;
    }
  }

  discountAmount = Math.min(discountAmount, parsedAmount);
  const finalAmount = parsedAmount - discountAmount;

  return {
    discountAmount,
    finalAmount,
  };
}

export const verifyMembershipCoupon = async ({ couponCode, subscriptionId, userId }) => {
  if (!couponCode || !userId || !subscriptionId) {
    throw new Error("couponCode, userId, and subscriptionId are required");
  }
const now = new Date();

const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

// console.log(todayStart, "todayStart");
// console.log(todayEnd, "todayEnd");
const coupon = await Coupon.findOne({
  couponTitle: couponCode,
  couponType: "Membership",
  isActive: true,
  deletedStatus: 0,
  couponStartDate: { $lte: todayEnd },  
  couponEndDate: { $gte: todayStart },
});

// console.log(coupon, "coupon");

  if (!coupon) {
    throw new Error("Invalid or expired coupon");
  }

  const overallUsageCount = await SubscriptionTransaction.countDocuments({
    "coupon.couponCode": couponCode,
    paymentsStatus: true,
    deletedStatus: 0,
  });

  if (
    coupon.couponCodeOverAllUsage &&
    overallUsageCount >= coupon.couponCodeOverAllUsage
  ) {
    throw new Error("Coupon usage limit reached");
  }

  const userUsageCount = await SubscriptionTransaction.countDocuments({
    "coupon.couponCode": couponCode,
    userId,
    deletedStatus: 0,
  });

  if (coupon.couponUsage && userUsageCount >= coupon.couponUsage) {
    throw new Error("You have already used this coupon the maximum number of times");
  }

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const amount = subscription.isDiscounted
    ? subscription.discountedPrice
    : subscription.price;

  const { discountAmount, finalAmount } = calculateDiscount(amount, coupon);

  // if (finalAmount <= 0) {
  //   throw new Error("Coupon discount exceeds subscription price");
  // }

  return {
    finalAmount: finalAmount <= 0 ? '0' : parseFloat(finalAmount.toFixed(2)),
    totalDiscount: parseFloat(discountAmount.toFixed(2)),
    coupon,
  };
};
