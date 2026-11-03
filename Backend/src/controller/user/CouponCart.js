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
import Cinema from "../../models/Cinema.js";
import { createLog } from "../../services/LogsServices.js";
import { normalizePhoneNumber } from "../../utils/phoneNormalizer.js";

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
  setSeatData,
  tTypeCode,
}) => {
  if (!addSeatData) {
    console.warn("No addSeatData provided, skipping Vista order update.");
    return { success: false, reason: "No addSeatData provided" };
  }

  try {
    let tickets = [];
    const strOrderData = addSeatData.strOrderData || addSeatData.orderData || addSeatData.tickets;
    if (strOrderData) {
      if (typeof strOrderData === "object") {
        if (Array.isArray(strOrderData)) {
          tickets = strOrderData;
        } else {
          const root = strOrderData.OrderData || strOrderData;
          if (root && root.Tickets && root.Tickets[0]) {
            const ticketsObj = root.Tickets[0];
            if (ticketsObj && ticketsObj.Ticket) {
              tickets = Array.isArray(ticketsObj.Ticket) ? ticketsObj.Ticket : [ticketsObj.Ticket];
            }
          } else if (root && root.tickets) {
            tickets = Array.isArray(root.tickets) ? root.tickets : [root.tickets];
          }
        }
      } else if (typeof strOrderData === "string") {
        try {
          const orderDataParsed = await parseStringPromise(strOrderData, {
            tagNameProcessors: [stripPrefix],
          });

          const rootKey = Object.keys(orderDataParsed)[0];
          const root = orderDataParsed[rootKey];
          if (root && root.Tickets && root.Tickets[0]) {
            const ticketsObj = root.Tickets[0];
            if (ticketsObj && ticketsObj.Ticket) {
              tickets = Array.isArray(ticketsObj.Ticket) ? ticketsObj.Ticket : [ticketsObj.Ticket];
            }
          }
        } catch (parseErr) {
          console.warn("Failed to parse strOrderData XML, falling back to manual generation.", parseErr);
        }
      }
    }

    // Determine quantity of tickets
    let qtyVal = Number(quantity);
    if (!qtyVal && addSeatData.strSeatInfo) {
      const seatInfo = addSeatData.strSeatInfo || "";
      const parts = seatInfo.split("-");
      const seatPart = parts[parts.length - 1].trim();
      if (seatPart) {
        qtyVal = seatPart.split(",").map(s => s.trim()).filter(Boolean).length;
      }
    }
    if (!qtyVal && setSeatData && setSeatData.strSeatInfo) {
      const seatInfo = setSeatData.strSeatInfo || "";
      const parts = seatInfo.split("-");
      const seatPart = parts[parts.length - 1].trim();
      if (seatPart) {
        qtyVal = seatPart.split(",").map(s => s.trim()).filter(Boolean).length;
      }
    }
    if (!qtyVal) {
      qtyVal = tickets.length || 1;
    }

    // Calculate discounted price per ticket in standard currency units (Rupees)
    const discountedPricePerTicket = Number(newTicketTotal) / qtyVal;
    // Vista expects PriceEach in cents (Rupees * 100)
    const priceEach = Math.round(discountedPricePerTicket * 100);

    let updateTicketsXml = "";
    if (tickets.length > 0) {
      let idx = 1;
      for (const ticket of tickets) {
        let ticketId = ticket.Id;
        if (Array.isArray(ticketId)) {
          ticketId = ticketId[0];
        }
        const effectiveId = ticketId || idx;
        const typeCode = ticket.TicketTypeCode || tTypeCode || addSeatData.tTypeCode || "0001";
        updateTicketsXml += `<Ticket><Id>${effectiveId}</Id><TicketTypeCode>${typeCode}</TicketTypeCode><PriceEach>${priceEach}</PriceEach></Ticket>`;
        idx++;
      }
    } else {
      // Use 1-based order ticket index (1, 2, ...) and ticket type code
      const typeCode =
        tTypeCode ||
        addSeatData.tTypeCode ||
        addSeatData.strType ||
        "0001";

      for (let i = 1; i <= qtyVal; i++) {
        updateTicketsXml += `<Ticket><Id>${i}</Id><TicketTypeCode>${typeCode}</TicketTypeCode><PriceEach>${priceEach}</PriceEach></Ticket>`;
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
    console.warn(`Vista updateOrder unavailable for transId ${transId}:`, err.message);
    return { success: false, reason: err.message };
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
      tTypeCode,
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

    const rawCartSource = payload.utm_source || payload.utm_Source;
    const rawCartCampaign = payload.utm_campaign || payload.utm_Campaign;
    let resolvedCartSource;
    if (rawCartSource) {
      const s = String(rawCartSource).toLowerCase().trim();
      if (s === "whatsapp" || s === "wp" || s === "wa" || s.startsWith("wp_")) {
        resolvedCartSource = "whatsapp";
      } else if (
        s === "justdial" ||
        s === "jd" ||
        s === "just_dial" ||
        s === "just-dial" ||
        s.startsWith("jd_")
      ) {
        resolvedCartSource = "justdial";
      } else {
        resolvedCartSource = s;
      }
    }
    const resolvedCartCampaign = rawCartCampaign ? String(rawCartCampaign).toLowerCase().trim() : undefined;
    const rawCartPhone = payload.phone || payload.mobile;

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: {
          fAndBDetails: selectedFood,
          ...(resolvedCartSource && resolvedCartSource !== "direct" ? { utm_source: resolvedCartSource } : {}),
          ...(resolvedCartCampaign ? { utm_campaign: resolvedCartCampaign } : {}),
          ...(rawCartPhone ? { normalized_phone: normalizePhoneNumber(rawCartPhone) } : {}),
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


    const existingTx = await Transaction.findOne({ initTransId: transId });
    // Always use immutable gross tickets total if available to prevent compounding discount loop
    const vistaGross =
      Number(existingTx?.addSeatData?.grossTicketsTotal) ||
      Number(existingTx?.commitBookingData?.grossTicketsTotal) ||
      Number(existingTx?.addSeatData?.curTicketsTotal) ||
      Number(existingTx?.addSeatData?.curTotal) ||
      0;
    const resolvedTicketTotal = vistaGross > 0 ? vistaGross : ticketTotal;

    // Concessions auto-attached in Vista AddSeats (e.g. mandatory 3D glasses)
    const addSeatConcession = Number(existingTx?.addSeatData?.curFoodTotal) || 0;
    const resolvedFnbPrice = (Number(fnbprice) || 0) + addSeatConcession;

    const cart = await getCouponCart(
      coupons,
      resolvedTicketTotal,
      resolvedFnbPrice,
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

    let coupanResponse = null;
    let totalDiscount = 0;
    let discountTarget = "All";
    let matchedCouponDoc = null;
    let isCouponSuccessfullyApplied = false;

    let couponCode = "";
    if (Array.isArray(coupons) && coupons.length > 0) {
      couponCode = typeof coupons[0] === "string" ? coupons[0] : (coupons[0]?.couponTitle || coupons[0]?.coupan_code || "");
    }
    // Only reuse existing coupon if request was not an explicit coupon-cart refresh with empty coupons
    if (!couponCode && isCoupan !== true && existingTx?.coupan?.coupanCode) {
      couponCode = existingTx.coupan.coupanCode;
    }

    if (couponCode) {
      // 1. Try Vista Promo SOAP service if couponDetails is available
      if (couponDetails) {
        try {
          const detailsForVista = {
            ...couponDetails,
            coupan_code: Array.isArray(couponDetails.coupan_code)
              ? couponDetails.coupan_code
              : [couponCode],
          };
          coupanResponse = await applyCoupanService(detailsForVista, transId);
          if (coupanResponse?.blnSuccess && coupanResponse.blnSuccess.includes("true")) {
            totalDiscount = Number(coupanResponse?.fltAmount?.[0]) || 0;
            isCouponSuccessfullyApplied = true;
          }
        } catch (err) {
          console.warn(`[CouponCart] Vista promo applyCoupanService unavailable for ${couponCode}:`, err.message);
        }
      }

      // 2. If not successfully applied via Vista, check MongoDB Coupon collection
      if (!isCouponSuccessfullyApplied) {
        try {
          const currentDate = new Date();
          matchedCouponDoc = await Coupon.findOne({
            couponTitle: { $regex: new RegExp(`^${couponCode.trim()}$`, "i") },
            deletedStatus: 0,
            isActive: true,
            couponStartDate: { $lte: currentDate },
            couponEndDate: { $gte: currentDate },
          });

          if (!matchedCouponDoc) {
            matchedCouponDoc = await Coupon.findOne({
              couponTitle: { $regex: new RegExp(`^${couponCode.trim()}$`, "i") },
              deletedStatus: 0,
              isActive: true,
            });
          }

          if (matchedCouponDoc) {
            discountTarget = matchedCouponDoc.couponType || "All";
            const discountVal = parseFloat(matchedCouponDoc.discount) || 0;
            if (matchedCouponDoc.discountType === "flat") {
              totalDiscount = discountVal;
            } else if (matchedCouponDoc.discountType === "%") {
              const applicableBase =
                discountTarget === "F&B" || discountTarget === "Food"
                  ? resolvedFnbPrice
                  : resolvedTicketTotal;
              totalDiscount = (applicableBase * discountVal) / 100;
              if (matchedCouponDoc.couponUpTo && totalDiscount > parseFloat(matchedCouponDoc.couponUpTo)) {
                totalDiscount = parseFloat(matchedCouponDoc.couponUpTo);
              }
            }
            totalDiscount = Math.min(totalDiscount, resolvedTicketTotal + resolvedFnbPrice);
            if (totalDiscount > 0) {
              isCouponSuccessfullyApplied = true;
            }
          }
        } catch (dbErr) {
          console.warn(`[CouponCart] DB Coupon lookup error for ${couponCode}:`, dbErr.message);
        }
      }

      // 3. If successfully applied (either via Vista or DB), recalculate cart prices
      if (isCouponSuccessfullyApplied && totalDiscount > 0) {
        recalculateCartPrices(cart, totalDiscount, discountTarget);

        cart.isCouponUsage = true;
        cart.isOverAllCouponUsage = true;
        if (matchedCouponDoc) {
          cart.ticketCart.coupons = [
            {
              _id: matchedCouponDoc._id,
              couponTitle: matchedCouponDoc.couponTitle,
              discount: matchedCouponDoc.discount,
              discountType: matchedCouponDoc.discountType,
              couponUpTo: matchedCouponDoc.couponUpTo,
              couponCategory: matchedCouponDoc.couponCategory,
            },
          ];
        } else {
          cart.ticketCart.coupons = [couponCode];
        }
      }
    }

    cart.foodCart.totalAmountByBase = FBamount;

    const discountedTicketTotal = Number(cart.ticketCart?.total) || 0;
    const finalDiscountedPrice = Number(cart.finalAmount) || 0;
    const grossTicketsTotal = String(
      existingTx?.addSeatData?.grossTicketsTotal ||
      existingTx?.commitBookingData?.grossTicketsTotal ||
      vistaGross ||
      resolvedTicketTotal ||
      cart.ticketCart?.ticketTotal ||
      0
    );
    const curBookingFee = Number(existingTx?.addSeatData?.curBookingFee) || 0;
    const curFoodTotal = Number(existingTx?.addSeatData?.curFoodTotal) || 0;
    const netCurTotal = discountedTicketTotal + curBookingFee + curFoodTotal;

    const txUpdateSet = {
      finalBookingCalculation: cart,
      finalPrice: finalDiscountedPrice,
      totalPrice: Number(grossTicketsTotal) + curFoodTotal + curBookingFee,
      discountAmount: Number(cart.totalDiscount) || 0,
      discountCouponStatus: (cart.totalDiscount || 0) > 0,
    };

    if (existingTx?.addSeatData) {
      txUpdateSet["addSeatData.grossTicketsTotal"] = grossTicketsTotal;
      txUpdateSet["addSeatData.curTicketsTotal"] = String(discountedTicketTotal);
      txUpdateSet["addSeatData.curTotal"] = String(netCurTotal);
      txUpdateSet["addSeatData.discountAmount"] = cart.ticketCart?.discountAmount || 0;
      txUpdateSet["addSeatData.curTicketsTax1"] = String(cart.ticketCart?.cgst || 0);
      txUpdateSet["addSeatData.curTicketsTax2"] = String(cart.ticketCart?.sgst || 0);
    }

    if (isCouponSuccessfullyApplied && totalDiscount > 0) {
      const ticketDiscount = (resolvedTicketTotal - cart.ticketCart.membershipDiscount) - cart.ticketCart.total;
      const discountOn = ticketDiscount > 0 ? "Ticket" : "F&B";
      txUpdateSet.coupan = {
        coupanCode: couponCode,
        lngSessionId: coupanResponse?.lngTrans?.[0] || "",
        discountOn: discountOn,
        discountValue: cart.totalDiscount,
      };
      if (matchedCouponDoc?._id) {
        txUpdateSet.couponId = [matchedCouponDoc._id];
      }
    }

    const txUpdateObj = { $set: txUpdateSet };
    if (!isCouponSuccessfullyApplied || totalDiscount <= 0) {
      txUpdateObj.$unset = { coupan: "", couponId: "" };
    }

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      txUpdateObj
    );

    createLog({
      transaction_id: transId,
      type: "Booking",
      step: {
        logType: "cartWholeCalculation",
        success: true,
        message: `Cart whole calculation: tickets ₹${cart.ticketCart?.total || 0}, F&B ₹${cart.foodCart?.total || 0}, convenience fee ₹${cart.convenienceFeesObject?.total || 0}, discount ₹${cart.totalDiscount || 0}, final amount ₹${cart.finalAmount || 0}`,
        cart: JSON.parse(JSON.stringify(cart)),
        timestamp: new Date().toISOString(),
      },
    });

    console.log(
      `[CouponCart] Cart whole calculation for transId ${transId}:`,
      JSON.stringify(cart, null, 2)
    );

    createLog({
      transaction_id: transId,
      type: "Booking",
      step: {
        logType: "finalBookingCalculation",
        success: true,
        finalAmount: cart.finalAmount,
        totalDiscount: cart.totalDiscount,
        ticketTotal: cart.ticketCart?.total,
        fnbTotal: cart.foodCart?.total,
        convenienceFee: cart.convenienceFeesObject?.total || 0,
        rewardDiscount: cart.rewardDiscountApplied || 0,
        couponCode: cart.ticketCart?.coupons?.[0] || null,
        message: `Final booking calculation saved: finalAmount ₹${cart.finalAmount}, totalDiscount ₹${cart.totalDiscount}`,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(
      `[CouponCart] Final booking calculation saved for transId ${transId}: finalAmount ₹${cart.finalAmount}, totalDiscount ₹${cart.totalDiscount}`
    );

    const findTx = await Transaction.findOne({ initTransId: transId }).populate("cinemaId");
    if (findTx && findTx.addSeatData) {
      try {
        let cinemaDoc = findTx.cinemaId;
        if (!cinemaDoc || !cinemaDoc.cinemaId) {
          const cId = findTx.cinemaId || cinemaObjectId || couponDetails?.cinema_id;
          if (cId) {
            cinemaDoc = await Cinema.findById(cId);
          }
        }

        if (cinemaDoc && !findTx.cinemaId) {
          await Transaction.findOneAndUpdate(
            { initTransId: transId },
            { $set: { cinemaId: cinemaDoc._id } }
          );
        }

        if (cinemaDoc?.cinemaId) {
          const curTicketsTotal = Number(findTx.addSeatData.curTicketsTotal) || 0;
          const newTicketsTotal = Number(cart.ticketCart.total) || 0;

          if (curTicketsTotal !== newTicketsTotal) {
            let updateSuccess = false;
            let failureReason = "";
            try {
              const updateResult = await updateVistaOrderPrice({
                cinemaId: cinemaDoc.cinemaId,
                transId,
                newTicketTotal: cart.ticketCart.total,
                quantity,
                addSeatData: findTx.addSeatData,
                setSeatData: findTx.setSeatData,
                tTypeCode:
                  payload?.tTypeCode ||
                  findTx.tTypeCode ||
                  findTx.addSeatData?.tTypeCode ||
                  findTx.addSeatData?.strType ||
                  "0001",
              });

              updateSuccess = updateResult?.success === true;
              if (!updateSuccess) {
                failureReason =
                  updateResult?.strException ||
                  updateResult?.reason ||
                  "Direct Vista order update not permitted by cinema service";
              }
            } catch (updateErr) {
              failureReason = updateErr.message;
              console.warn(`Vista updateOrder failed for transId ${transId}:`, updateErr.message);
            }

            await Transaction.updateOne(
              { initTransId: transId },
              { $set: { vistaOrderUpdated: updateSuccess } }
            ).catch((err) => console.warn(`Error setting vistaOrderUpdated for ${transId}:`, err.message));

            const discountPaytype = process.env.VISTA_DISCOUNT_PAYTYPE;
            const enableDiscountTender = process.env.ENABLE_VISTA_DISCOUNT_TENDER === "true";
            const settlementMode = updateSuccess
              ? "DIRECT_ORDER_UPDATE"
              : enableDiscountTender && discountPaytype
              ? "COMMIT_MULTICARRIER_TENDER"
              : "COMMIT_CW_TENDER";
            const tenderLabel = enableDiscountTender && discountPaytype ? discountPaytype : "CW";

            createLog({
              transaction_id: transId,
              type: "Booking",
              step: {
                logType: "updateVistaOrderPrice",
                success: true,
                directVistaUpdateApplied: updateSuccess,
                settlementMode,
                newTicketTotal: cart.ticketCart.total,
                discountAmount: cart.ticketCart.discountAmount,
                cgst: cart.ticketCart.cgst,
                sgst: cart.ticketCart.sgst,
                message: updateSuccess
                  ? `Vista order updated to ₹${cart.ticketCart.total} (CGST: ₹${cart.ticketCart.cgst}, SGST: ₹${cart.ticketCart.sgst})`
                  : `Discount of ₹${cart.ticketCart.discountAmount} registered; direct cinema update bypassed (${failureReason}), settled via ${tenderLabel} during Vista commit`,
                timestamp: new Date().toISOString(),
              },
            });

            // Always sync local transaction's addSeatData with discounted total
            const curBookingFee = Number(findTx.addSeatData.curBookingFee) || 0;
            const updatedVistaTotal = newTicketsTotal + curBookingFee;
            const grossTicketsTotal = String(
              findTx.addSeatData.grossTicketsTotal ||
              findTx.commitBookingData?.grossTicketsTotal ||
              vistaGross ||
              cart.ticketCart.ticketTotal ||
              0
            );

            await Transaction.findOneAndUpdate(
              { initTransId: transId },
              {
                $set: {
                  "addSeatData.grossTicketsTotal": grossTicketsTotal,
                  "addSeatData.curTicketsTotal": String(cart.ticketCart.total),
                  "addSeatData.discountAmount": cart.ticketCart.discountAmount || 0,
                  "addSeatData.curTicketsTax1": String(cart.ticketCart.cgst),
                  "addSeatData.curTicketsTax2": String(cart.ticketCart.sgst),
                  "addSeatData.curTotal": String(updatedVistaTotal),
                }
              }
            );
            console.log(`Local transaction ${transId} addSeatData synchronized with discounted total: ${cart.ticketCart.total}`);
          }
        } else {
          console.warn(`Could not resolve cinemaId for transId ${transId}, skipping Vista order update.`);
        }
      } catch (err) {
        console.error("Failed to update Vista order price or sync addSeatData inside couponCart:", err);
      }
    }

    const successMsg = coupanResponse?.strMessage?.[0] || "Coupon applied successfully";
    const failMsg = coupanResponse?.strException?.[0] || (couponCode ? "Invalid or expired coupon" : "Cart updated");

    return res.status(200).json({
      status: StatusCodes.OK,
      message: isCouponSuccessfullyApplied ? successMsg : (couponCode ? failMsg : "Cart updated"),
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

    if (findRecord.coupan?.lngSessionId && cinemaId) {
      try {
        const response = await rollbackCoupanService({
          lngSessionId: findRecord.coupan.lngSessionId,
          coupanCode: couponCode,
          cinemaId: cinemaId,
        });
        if (!response?.blnSuccess?.includes("true")) {
          console.warn("[removeCouponFromCart] Vista rollback returned non-success, unsetting coupon in DB anyway.");
        }
      } catch (rollbackErr) {
        console.warn("[removeCouponFromCart] Vista rollback failed:", rollbackErr.message);
      }
    }

    const grossTicketsTotal = String(
      findRecord.addSeatData?.grossTicketsTotal ||
      findRecord.commitBookingData?.grossTicketsTotal ||
      findRecord.addSeatData?.curTicketsTotal ||
      0
    );
    const curBookingFee = Number(findRecord.addSeatData?.curBookingFee) || 0;
    const curFoodTotal = Number(findRecord.addSeatData?.curFoodTotal) || 0;
    const undiscountedTotal = Number(grossTicketsTotal) + curFoodTotal + curBookingFee;
    const convFee = findRecord.finalBookingCalculation?.convenienceFeesObject?.total || 0;

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $unset: {
          coupan: "",
          couponId: "",
        },
        $set: {
          discountCouponStatus: false,
          discountAmount: 0,
          finalPrice: undiscountedTotal + convFee,
          totalPrice: undiscountedTotal,
          "addSeatData.curTicketsTotal": grossTicketsTotal,
          "addSeatData.curTotal": String(undiscountedTotal),
          "addSeatData.discountAmount": 0,
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
