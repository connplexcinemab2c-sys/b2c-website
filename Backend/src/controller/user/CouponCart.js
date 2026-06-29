import Coupon from "../../models/Coupons.js";
import StatusCodes from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import {
  decryptData,
  decryptPayment,
  handleErrorResponse,
  verifySignature,
} from "../../services/CommanService.js";
import mongoose from "mongoose";
import ApplyCoupon from "../../models/ApplyCoupon.js";
import AppliedCoupon from "../../models/AppliedCoupon.js";
// Get Coupons by Location
import { User } from "../../models/User.js";
import { getCouponCart } from "../../services/CouponCartService.js";
import Transaction from "../../models/Transaction.js";
import {
  applyCoupanService,
  rollbackCoupanService,
} from "../../services/vistaServices/promotionCoupan.js";
// Get Coupons by Location
export const couponCart = async (req, res) => {
  try {
    const text = req.body.data;
    const tempData = decryptPayment("testText123", text);
    const payload = JSON.parse(tempData);

    const {
      coupons,
      ticketTotal,
      fnbprice,
      cityId,
      cinemaObjectId,
      movieLanguage,
      autoApply,
      transId,
      deviceType,
      userTicketSpentAmount,
      quantity,
      couponDetails,
      isCoupan,
      rewardCoins = 0,
      // } = req.body;
    } = payload;
    // let { selectedFood } = req.body;
    let { selectedFood } = payload;

    let userId = req.user;

    selectedFood =
      selectedFood &&
      selectedFood?.map((food) => {
        return {
          ...food,
          name: food.itemDescription,
          price: food.itemPrice * food.quantity,
          itemPriceByQuantity: food.itemBasePrice * food.quantity,
        };
      });

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: {
          fAndBDetails: selectedFood,
        },
      }
    );

    let FBamount =
      selectedFood.length > 0
        ? selectedFood.reduce(
            (acc, item) => acc + (item.itemPriceByQuantity || 0),
            0
          )
        : 0;


    const cart = await getCouponCart(
      coupons,
      ticketTotal,
      fnbprice,
      cityId,
      cinemaObjectId,
      movieLanguage,
      autoApply,
      userId,
      deviceType,
      userTicketSpentAmount,
      quantity,
      transId,
      couponDetails,
      rewardCoins
    );

    let coupanResponse;
    let totalDiscount;

    if (isCoupan == true) {
      if (coupons.length > 0) {
        coupanResponse = await applyCoupanService(couponDetails, transId);

        if (coupanResponse?.blnSuccess.includes("true")) {
          totalDiscount = coupanResponse?.fltAmount[0];

          await Transaction.findOneAndUpdate(
            { initTransId: transId },
            {
              $set: {
                coupan: {
                  coupanCode: coupons[0],
                  lngSessionId: coupanResponse?.lngTrans[0],
                  discountOn: "F&B",
                  discountValue: coupanResponse?.fltAmount[0],
                },
              },
            }
          );

          cart.totalDiscount = totalDiscount;
          cart.foodCart.discountAmount = totalDiscount / 2;
          cart.foodCart.basePrice = +-totalDiscount / 2;
          cart.ticketCart.discountAmount = totalDiscount / 2;
          cart.ticketCart.basePrice = +-totalDiscount / 2;
          cart.finalAmount = cart.finalAmount - totalDiscount;
          cart.isCouponUsage = true;
          cart.isOverAllCouponUsage = true;
          cart.ticketCart.coupons = coupons;
          cart.finalAmount = Math.round(cart.finalAmount * 100) / 100;
        }
      }
    }

    //   ticketCart: {
    //     discountAmount: 0,
    //     basePrice: 144.068,
    //     membershipDiscount: 0,
    //     totalAfterDiscount: 170,
    //     cgst: 0,
    //     sgst: 0,
    //     coupons: [],
    //     total: 170,
    //     ticketTotal: 170
    //   },
    //   foodCart: {
    //     discountAmount: 50,
    //     basePrice: -50,
    //     membershipDiscount: 0,
    //     totalAfterDiscount: 400.008,
    //     cgst: 0,
    //     sgst: 0,
    //     coupons: [],
    //     total: 400.008,
    //     fnbTotal: 400.008
    //   },
    //   finalAmount: 587.7080000000001,
    //   totalDiscount: 50,
    //   isCouponUsage: true,
    //   isOverAllCouponUsage: true,
    //   convenienceFeesObject: { convenienceFees: 15, gst: 2.7, total: 17.7 }
    // }

    // if (coupanResponse?.blnSuccess.includes(true)) {
    // }
          cart.foodCart.totalAmountByBase = FBamount;


    await Transaction.findOneAndUpdate(
      {
        initTransId: transId,
      },
      {
        $set: {
          finalBookingCalculation: cart,
        },
      }
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message:
        coupanResponse?.strMessage?.[0] || coupanResponse?.strException?.[0],
      data: cart,
    });
    // }
  } catch (error) {
    console.log(error, "error in couponCart");
    return handleErrorResponse(res, error);
  }
};

export const removeCouponFromCart = async (req, res) => {
  try {
    const { transId, couponCode, cinemaId } = req.body;
    const findRecord = await Transaction.findOne({
      initTransId: transId,
      "coupan.coupanCode": couponCode,
    });
    // console.log(transId, couponCode, findRecord,"removeCouponFromCart");
    if (!findRecord) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.NO_TRANSACTIONS_FOUND,
        data: [],
      });
    }
    const response = await rollbackCoupanService({
      lngSessionId: findRecord.coupan.lngSessionId,
      coupanCode: couponCode,
      cinemaId: cinemaId,
    });
    if (!response?.blnSuccess.includes("true")) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.COUPON_ROLLBACK_FAILED,
        data: [],
      });
    }
    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $unset: {
          "coupan.coupanCode": "",
          "coupan.lngSessionId": "",
          "coupan.discountOn": "",
          "coupan.discountValue": "",
        },
      }
    );
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.COUPON_REMOVED,
      data: [],
    });
  } catch (error) {
    console.log(error, "error in removeCouponFromCart");
    return handleErrorResponse(res, error);
  }
};
