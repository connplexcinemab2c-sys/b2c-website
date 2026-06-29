import Coupon from "../../models/Coupons.js";
import StatusCodes from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import mongoose from "mongoose";
import ApplyCoupon from "../../models/ApplyCoupon.js";
import AppliedCoupon from "../../models/AppliedCoupon.js";
import {
  getpublicCoupons,
  verifyMembershipCoupon,
} from "../../services/CouponCartService.js";
import moment from "moment/moment.js";
import momentTimezone from "moment-timezone";
import { applyCoupanService } from "../../services/vistaServices/promotionCoupan.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import Subscription from "../../models/Subscription.js";
// Get Coupons by Location

// Get Coupons by Location
export const groupCouponsByLocation = async (req, res) => {
  try {
    const { cityId } = req.params;
    const coupons = await Coupon.find({
      cityId: { $in: [new mongoose.Types.ObjectId(cityId)] },
      couponStartDate: { $lte: new Date() },
      couponEndDate: { $gte: new Date() },
      isActive: true,
      deletedStatus: 0,
    })
      .populate("cinemaObjectId")
      .populate("cityId")
      .sort({ couponEndDate: -1 });
    const groupedCoupons = coupons.reduce((acc, coupon) => {
      // Iterate over cityId array
      coupon.cityId.forEach((city) => {
        const region = city.region;

        // Iterate over cinemaObjectId array
        coupon.cinemaObjectId.forEach((cinema) => {
          const cinemaName = cinema.cinemaName;

          // Iterate over movieLanguage array
          coupon.movieLanguage.forEach((language) => {
            if (!acc[region]) {
              acc[region] = {};
            }
            if (!acc[region][cinemaName]) {
              acc[region][cinemaName] = {};
            }
            if (!acc[region][cinemaName][language]) {
              acc[region][cinemaName][language] = [];
            }

            acc[region][cinemaName][language].push(coupon);
          });
        });
      });

      return acc;
    }, {});

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.COUPONS_FETCHED,
      data: groupedCoupons,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

// Validate Coupon by Title
export const validateCouponByTitle = async (req, res) => {
  try {
    const {
      couponTitle,
      cityId,
      cinemaObjectId,
      movieLanguage,
      userSpentAmount,
      couponType,
    } = req.body;
    const currentDate = new Date();
    // Find matching coupons
    const coupons = await Coupon.findOne({
      couponTitle: couponTitle,
      cityId: { $in: [new mongoose.Types.ObjectId(cityId)] },
      cinemaObjectId: { $in: [new mongoose.Types.ObjectId(cinemaObjectId)] },
      couponType: couponType, // Ensuring couponType matches the request body
      movieLanguage: { $in: [movieLanguage] },
      couponType: couponType, //type: All, Ecommerce, Cinema , F%B , Subscription
      deletedStatus: 0,
      isActive: true,
      couponStartDate: { $lte: currentDate },
      couponEndDate: { $gte: currentDate },
      // couponStartDate: { $lte: new Date() },
      "assignCoupon.rangeOfSpent.spentForm": { $lte: userSpentAmount },
      "assignCoupon.rangeOfSpent.spentTo": { $gte: userSpentAmount },
    })
      .populate("cinemaObjectId")
      .populate("cityId");

    if (!coupons) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Coupon not valid",
      });
    }

    const usedCouponByUserCount = await AppliedCoupon.countDocuments({
      originalCouponId: coupons?._id,
      userId: req.user,
      isAppliedStatus: true,
    });

    const usedCouponByAllUserCount = await AppliedCoupon.countDocuments({
      originalCouponId: coupons?._id,
      isAppliedStatus: true,
    });

    // console.log(usedCouponByUserCount, ":usedCouponByUserCount" , coupons);
    // console.log(usedCouponByAllUserCount, ":usedCouponByAllUserCount");

    // const usedCouponByUserCount = await AppliedCoupon.countDocuments({
    //   couponId: { $in: coupons?._id },
    //   userId: req.user,
    // });

    // const usedCouponByAllUserCount = await ApplyCoupon.countDocuments({
    //   couponId: { $in: coupons?._id },
    // });

    if (usedCouponByUserCount >= coupons.couponUsage) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: "Coupon usage limit exceeded for this user",
      });
    }
    if (usedCouponByAllUserCount >= coupons.couponCodeOverAllUsage) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: "Coupon code usage limit exceeded overall",
      });
    }
    return res.status(200).json({
      status: StatusCodes.OK,
      message: "Coupons valid!",
      data: coupons,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
      data: [error.message],
    });
  }
};
export const getCouponList = async (req, res) => {
  try {
    let couponList = await Coupon.find({
      deletedStatus: 0,
    });

    if (!couponList) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.COUPON_LIST_NOT_FOUND,
        data: [],
      });
    }

    // Check if assignUserId is provided
    const assignUserId = req.user;

    if (!assignUserId) {
      // Filter out private coupons for normal users
      couponList = couponList.filter(
        (item) => !item.advancedSettings.privateCoupon
      );
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.COUPON_LIST,
      data: couponList,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

// Delete Applied Coupon
export const deleteAppliedCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const couponIds = id.includes(",")
      ? id.split(",").map((id) => new mongoose.Types.ObjectId(id))
      : [new mongoose.Types.ObjectId(id)];

    // Remove the specified couponId(s) from the ApplyCoupon documents
    const updatedCoupon = await ApplyCoupon.updateMany(
      { couponId: { $in: couponIds } },
      { $pull: { couponId: { $in: couponIds } } },
      { new: true }
    );

    if (!updatedCoupon || updatedCoupon.modifiedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Applied coupon(s) not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Applied coupon(s) deleted successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error deleting applied coupon:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: [error.message],
    });
  }
};

// add or upgrade the subscriber membership
export const addOrUpgradeSubscriberMembership = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    let newSubscriptionMembership;
    let previousPlanName;
    let newPlanName;
    const now = momentTimezone.tz("Asia/Kolkata");
    const subscribeMemberExist = await SubscriberMembership.findOne({
      userId: new mongoose.Types.ObjectId(req.user),
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
    } else {
      if (subscriptionId) {
        const oldSubscribeMember = await SubscriberMembership.findOne({
          userId: new mongoose.Types.ObjectId(req.user),
          deletedStatus: 0,
        }).sort({ createdAt: -1 });

        if (oldSubscribeMember) {
          const previousSubscriptionPlan = await Subscription.findOne({
            // userId: new mongoose.Types.ObjectId(req.user),
            _id: new mongoose.Types.ObjectId(oldSubscribeMember.subscriptionId),
            deletedStatus: 0,
          }).sort({ createdAt: -1 });

          const newSubscriptionPlan = await Subscription.findOne({
            // userId: new mongoose.Types.ObjectId(req.user),
            _id: new mongoose.Types.ObjectId(subscriptionId),
            deletedStatus: 0,
          });

          // console.log(previousSubscriptionPlan);
          // console.log(newSubscriptionPlan);

          previousPlanName = previousSubscriptionPlan
            ? previousSubscriptionPlan.title
            : null;

          newPlanName = newSubscriptionPlan ? newSubscriptionPlan.title : null;
        }

        const newUpgradePlan = determineUpgradeString(
          previousPlanName,
          newPlanName
        );

        newSubscriptionMembership = await new SubscriberMembership({
          userId: new mongoose.Types.ObjectId(req.user),
          subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
          upgradePlan: oldSubscribeMember ? true : false,
          upgradePlanDate: oldSubscribeMember ? Date.now() : null,
          upgradePretoPost: oldSubscribeMember ? newUpgradePlan : null,
        }).save();
      }

      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.SUBSCRIPTION_MEMBERSHIP_CREATED,
        data: newSubscriptionMembership ?? newSubscriptionMembership | [],
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// New Get Coupons List by regionId , CinemaId , MovieLanguage
export const getAllCouponsByCityCinemaLanguage = async (req, res) => {
  try {
    const { cityId, cinemaObjectId, movieLanguage, deviceType } = req.body;

    const couponsData = await getpublicCoupons(
      cityId,
      cinemaObjectId,
      movieLanguage,
      deviceType
    );

    // Always return data with a success message, even if no coupons were found
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message:
        couponsData.length > 0
          ? ResponseMessage.COUPONS_FETCHED
          : ResponseMessage.NO_COUPONS_FOUND,
      data: couponsData,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const applyCoupan = async (req, res) => {
  try {
    const fullCode = req.body.filme_ho_code || "";
    const index = fullCode.indexOf("H");
    const film_ho_code = index !== -1 ? fullCode.slice(index) : null;

    console.log(req.body);

    const requestObj = {
      param1: req.body.cinema_id,
      param2: req.body.area_category_code + "|",
      param3: moment(req.body.show_date_time).format("DD/MMM/YYYY HH:mm"),
      param4: Number(req.body.number_of_tickets),
      param5: req.body.customer_name,
      param6: film_ho_code,
      param7: req.body.coupan_code,
      param8: `WEB|915|`,
      param9: Number(req.body.total_ticket_amount),
      param10: Number(req.body.total_concession_amount),
      param11: Number(req.body.total_inventory),
      param12: req.body.work_station_code,
      param13: Number(512),
      param14: req.body.post_date_time
        ? moment(req.body.post_date_time).format("DD/MMM/YYYY HH:mm")
        : null,
      param15: req.body.type,
      param16: "9131298171",
    };

    // let response = await applyCoupanService(req,res);

    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.error("Error in applyCoupan:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// src/controller/subscription.js

export const membershipCouponVerify = async (req, res) => {
  try {
    const { couponCode, subscriptionId } = req.body;
    const userId = req.user;

    const result = await verifyMembershipCoupon({
      couponCode,
      subscriptionId,
      userId,
    });

    return res.status(200).json({
      status: 200,
      message: "Coupon applied successfully",
      data: {
        finalAmount: result.finalAmount ? parseFloat(result.finalAmount) : "",
        totalDiscount: result.totalDiscount
          ? parseFloat(result.totalDiscount)
          : "",
      },
    });
  } catch (error) {
    console.error("Coupon verification error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const validateCouponByTitleForEcommerce = async (req, res) => {
  try {
    const { couponTitle, userSpentAmount } = req.body;
    let currentDate =
      new Date().toISOString().split("T")[0] + "T00:00:00.000+00:00";

    // Find matching coupons
    const coupon = await Coupon.findOne({
      couponTitle: couponTitle,
      couponType: "Ecommerce", //type: All, Ecommerce, Cinema , F%B , Subscription
      deletedStatus: 0,
      isActive: true,
      couponStartDate: { $lte: currentDate },
      couponEndDate: { $gte: currentDate },
      "assignCoupon.rangeOfSpent.spentForm": { $lte: userSpentAmount },
      "assignCoupon.rangeOfSpent.spentTo": { $gte: userSpentAmount },
      couponCategory: "Private",
      // "assignCoupon.assignUserId": { $in: [req.user] },
    });

    if (!coupon) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Invalid promo voucher",
      });
    }

    const usedCouponByUserCount = await AppliedCoupon.countDocuments({
      originalCouponId: coupon?._id,
      userId: req.user,
      isAppliedStatus: true,
    });

    const usedCouponByAllUserCount = await AppliedCoupon.countDocuments({
      originalCouponId: coupon?._id,
      isAppliedStatus: true,
    });

    if (usedCouponByUserCount >= coupon.couponUsage) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: "Coupon usage limit exceeded for this user",
      });
    }
    if (usedCouponByAllUserCount >= coupon.couponCodeOverAllUsage) {
      return res.status(StatusCodes.FORBIDDEN).json({
        status: StatusCodes.FORBIDDEN,
        message: "Coupon code usage limit exceeded overall",
      });
    }
    return res.status(200).json({
      status: StatusCodes.OK,
      message: "Coupons valid!",
      data: coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
      data: [error.message],
    });
  }
};
