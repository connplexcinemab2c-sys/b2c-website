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
import { getCouponCart, recalculateCartPrices } from "../../services/CouponCartService.js";
import Transaction from "../../models/Transaction.js";
import {
  applyCoupanService,
  rollbackCoupanService,
} from "../../services/vistaServices/promotionCoupan.js";
import { parseStringPromise } from "xml2js";
import { updateOrderService } from "../../services/vistaServices/AddSeatsExService.js";

const stripPrefix = (name) => {
  const i = name.indexOf(":");
  return i < 0 ? name : name.substring(i + 1);
};

export const updateVistaOrderPrice = async ({
  cinemaId,
  transId,
  newTicketTotal,
  quantity,
  addSeatData,
}) => {
  if (!addSeatData || !addSeatData.strOrderData) {
    console.warn("No strOrderData in addSeatData, skipping Vista order update.");
    return;
  }

  try {
    const strOrderData = addSeatData.strOrderData;
    const orderDataParsed = await parseStringPromise(strOrderData, {
      tagNameProcessors: [stripPrefix],
    });

    const rootKey = Object.keys(orderDataParsed)[0];
    const root = orderDataParsed[rootKey];
    if (!root) {
      console.warn("Could not find root element in strOrderData XML.");
      return;
    }

    let tickets = [];
    if (root.Tickets && root.Tickets[0]) {
      const ticketsObj = root.Tickets[0];
      if (ticketsObj && ticketsObj.Ticket) {
        tickets = Array.isArray(ticketsObj.Ticket) ? ticketsObj.Ticket : [ticketsObj.Ticket];
      }
    }

    if (tickets.length === 0) {
      console.warn("No tickets found in strOrderData XML.");
      return;
    }

    // Calculate discounted price per ticket in paise/cents
    const qtyVal = Number(quantity) || tickets.length || 1;
    const discountedPricePerTicket = Number(newTicketTotal) / qtyVal;
    const priceEachInPaise = Math.round(discountedPricePerTicket * 100);

    let updateTicketsXml = "";
    for (const ticket of tickets) {
      let ticketId = ticket.Id;
      if (Array.isArray(ticketId)) {
        ticketId = ticketId[0];
      }
      if (ticketId) {
        updateTicketsXml += `<Ticket><Id>${ticketId}</Id><PriceEach>${priceEachInPaise}</PriceEach></Ticket>`;
      }
    }

    const strOrderXml = `<OrderData><Tickets>${updateTicketsXml}</Tickets></OrderData>`;
    console.log(`Updating Vista order for transId ${transId} with XML: ${strOrderXml}`);

    const updateResult = await updateOrderService({
      cinemaId,
      strTransId: transId,
      strOrderXml,
    });

    console.log(`Vista updateOrder for transId ${transId} result:`, updateResult);
    return updateResult;
  } catch (err) {
    console.error("Error updating Vista order price:", err);
    throw err;
  }
};

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
          totalDiscount = Number(coupanResponse?.fltAmount[0]) || 0;

          recalculateCartPrices(cart, totalDiscount);

          const ticketDiscount = (ticketTotal - cart.ticketCart.membershipDiscount) - cart.ticketCart.total;
          const discountOn = ticketDiscount > 0 ? "Ticket" : "F&B";

          await Transaction.findOneAndUpdate(
            { initTransId: transId },
            {
              $set: {
                coupan: {
                  coupanCode: coupons[0],
                  lngSessionId: coupanResponse?.lngTrans[0],
                  discountOn: discountOn,
                  discountValue: totalDiscount,
                },
              },
            }
          );

          cart.isCouponUsage = true;
          cart.isOverAllCouponUsage = true;
          cart.ticketCart.coupons = coupons;
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

    const findTx = await Transaction.findOne({ initTransId: transId }).populate("cinemaId");
    if (findTx && findTx.addSeatData && findTx.cinemaId) {
      try {
        const curTicketsTotal = Number(findTx.addSeatData.curTicketsTotal) || 0;
        const newTicketsTotal = Number(cart.ticketCart.total) || 0;

        if (curTicketsTotal !== newTicketsTotal) {
          await updateVistaOrderPrice({
            cinemaId: findTx.cinemaId.cinemaId,
            transId,
            newTicketTotal: cart.ticketCart.total,
            quantity,
            addSeatData: findTx.addSeatData,
          });

          const curBookingFee = Number(findTx.addSeatData.curBookingFee) || 0;
          const updatedVistaTotal = newTicketsTotal + curBookingFee;

          // Sync local transaction's addSeatData with recalculated discount totals & taxes
          await Transaction.findOneAndUpdate(
            { initTransId: transId },
            {
              $set: {
                "addSeatData.curTicketsTotal": String(cart.ticketCart.total),
                "addSeatData.curTicketsTax1": String(cart.ticketCart.cgst),
                "addSeatData.curTicketsTax2": String(cart.ticketCart.sgst),
                "addSeatData.curTotal": String(updatedVistaTotal),
              }
            }
          );
          console.log(`Local transaction ${transId} addSeatData synchronized with discounted total: ${cart.ticketCart.total} and GST: ${cart.ticketCart.cgst + cart.ticketCart.sgst}`);
        }
      } catch (err) {
        console.error("Failed to update Vista order price or sync addSeatData inside couponCart:", err);
      }
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message:
        coupanResponse?.strMessage?.[0] || coupanResponse?.strException?.[0],
      data: cart,
    });
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
