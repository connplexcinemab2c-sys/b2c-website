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

  const ticketMembershipDiscountVal = getNumberUptoTwoDecimal(calculateMembershipDiscount(
    ticketMembershipDiscount,
    parseFloat(ticketCart.ticketTotal)
  ));
  const foodMembershipDiscountVal = getNumberUptoTwoDecimal(calculateMembershipDiscount(
    foodMembershipDiscount,
    parseFloat(foodCart.fnbTotal)
  ));

  ticketCart.membershipDiscount = ticketMembershipDiscountVal;
  foodCart.membershipDiscount = foodMembershipDiscountVal;

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

  let cart = {
    ticketCart,
    foodCart,
    rewardCoinsRedeemed: Number(rewardCoins) || 0,
    rewardDiscountApplied: rewardDiscount,
    rewardDiscount: rewardDiscount,
    convenienceFeesObject,
    totalDiscount: 0,
    finalAmount: 0,
  };

  recalculateCartPrices(cart, 0);

  return {
    ...cart,
    isCouponUsage: true,
    isOverAllCouponUsage: true,
  };
};

export const recalculateCartPrices = (cart, couponDiscount = 0) => {
  const ticketTotal = cart.ticketCart.ticketTotal || 0;
  const ticketMembershipDiscount = cart.ticketCart.membershipDiscount || 0;

  const fnbTotal = cart.foodCart.fnbTotal || 0;
  const foodMembershipDiscount = cart.foodCart.membershipDiscount || 0;

  const rewardDiscount = cart.rewardDiscountApplied || 0;

  const ticketTotalAfterMembership = Math.max(0, ticketTotal - ticketMembershipDiscount);
  const foodTotalAfterMembership = Math.max(0, fnbTotal - foodMembershipDiscount);

  const totalDiscountToApply = couponDiscount + rewardDiscount;
  const sumAfterMembership = ticketTotalAfterMembership + foodTotalAfterMembership;

  let ticketShareOfDiscount = 0;
  let foodShareOfDiscount = 0;

  if (sumAfterMembership > 0) {
    ticketShareOfDiscount = (ticketTotalAfterMembership / sumAfterMembership) * totalDiscountToApply;
    foodShareOfDiscount = (foodTotalAfterMembership / sumAfterMembership) * totalDiscountToApply;
  }

  let finalTicketTotal = Math.max(0, ticketTotalAfterMembership - ticketShareOfDiscount);
  let finalFoodTotal = Math.max(0, foodTotalAfterMembership - foodShareOfDiscount);

  finalTicketTotal = getNumberUptoTwoDecimal(finalTicketTotal);
  finalFoodTotal = getNumberUptoTwoDecimal(finalFoodTotal);

  cart.ticketCart.discountAmount = getNumberUptoTwoDecimal(ticketMembershipDiscount + ticketShareOfDiscount);
  cart.foodCart.discountAmount = getNumberUptoTwoDecimal(foodMembershipDiscount + foodShareOfDiscount);

  cart.ticketCart.totalAfterDiscount = getNumberUptoTwoDecimal(Math.max(0, ticketTotal - cart.ticketCart.discountAmount));
  cart.ticketCart.total = cart.ticketCart.totalAfterDiscount;

  cart.foodCart.totalAfterDiscount = getNumberUptoTwoDecimal(Math.max(0, fnbTotal - cart.foodCart.discountAmount));
  cart.foodCart.total = cart.foodCart.totalAfterDiscount;

  // Recalculate CGST, SGST, and Base Price for Tickets
  const ticketGSTPercentage = finalTicketTotal < 115 ? 12 : 18;
  const ticketGstAmount = calculateGst(finalTicketTotal, ticketGSTPercentage);
  cart.ticketCart.cgst = getNumberUptoTwoDecimal(ticketGstAmount / 2);
  cart.ticketCart.sgst = cart.ticketCart.cgst;
  cart.ticketCart.basePrice = getNumberUptoTwoDecimal(finalTicketTotal - cart.ticketCart.cgst - cart.ticketCart.sgst);

  // Recalculate CGST, SGST, and Base Price for Food
  const foodGstAmount = calculateGst(finalFoodTotal, 5);
  cart.foodCart.cgst = getNumberUptoTwoDecimal(foodGstAmount / 2);
  cart.foodCart.sgst = cart.foodCart.cgst;
  cart.foodCart.basePrice = getNumberUptoTwoDecimal(finalFoodTotal - cart.foodCart.cgst - cart.foodCart.sgst);

  const convenienceFeesTotal = cart.convenienceFeesObject?.total || 0;
  cart.finalAmount = getNumberUptoTwoDecimal(finalTicketTotal + finalFoodTotal + convenienceFeesTotal);
  cart.totalDiscount = getNumberUptoTwoDecimal(couponDiscount);

  return cart;
};;

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
