import dotenv from "dotenv";
dotenv.config();
import qs from "querystring";
import { decrypt, encrypt } from "./CcavenueUtils.js";
import Cinema from "../../models/Cinema.js";
import {
  calculateSeatAmount,
  decryptPayment,
} from "../../services/CommanService.js";
import axios from "axios";
import Transaction from "../../models/Transaction.js";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../models/User.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import Show from "../../models/Shows.js";
import Price from "../../models/Price.js";
import PricePackage from "../../models/PricePackage.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import Subscription from "../../models/Subscription.js";
import mongoose from "mongoose";
import { ccavEncResponseDirectly } from "./CcavenueService.js";
import { verifyMembershipCoupon } from "../CouponCartService.js";
import moment from "moment-timezone";
import SubscriptionWelcomeGift from "../../models/SubscriptionWelcomeGift.js";
import { createLog } from "../LogsServices.js";

//#region ccavenue payment request
export const paymentRequest = async (req, res) => {
  if (process.env.ENABLE_BOOKING === "false") {
    return res.status(503).json({
      status: StatusCodes.SERVICE_UNAVAILABLE,
      message: ResponseMessage.BOOKING_DISABLED,
      data: [],
    });
  }
  try {
    let { id } = req.body;
    const salt = process.env.salt;
    const decryptBody = decryptPayment(salt, id);
    const parts = decryptBody.split("|");
    // Storing the parts in separate variables
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

    const findTransaction = await Transaction.findOne(
      {
        initTransId: transId,
      },
      {
        finalBookingCalculation: true,
        paymentsStatus: true,
        commitStatus: true,
        paymentResponse: true,
        commitBookingData: true,
      }
    ).sort({ createdAt: -1 });

    if (findTransaction) {
      if (
        findTransaction.paymentsStatus === true ||
        findTransaction.commitStatus === true ||
        (findTransaction.paymentResponse && findTransaction.commitBookingData)
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: "This transaction is already processed.",
          data: [],
        });
      }
    }

    if (
      findTransaction &&
      Array.isArray(findTransaction.logs) &&
      findTransaction.logs.length > 0
    ) {
      const initBookingTime =
        findTransaction.logs[0] && findTransaction.logs[0]?.initBooking;

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

    // if after discount user have pay 0 amount than we directly Booked Ticket
    if (findTransaction.finalBookingCalculation.finalAmount == 0) {
      await ccavEncResponseDirectly(res, userId, transId, cinemaId, sessionId);
      return false;
    }

    //live ccavenue key
    // const workingKey = process.env.PRODUCTION_WORKING_KEY_CC;
    // const accessCode = process.env.PRODUCTION_ACCESS_CODE_CC;
    //local ccavenue key
    const workingKey = process.env.CCAVENUE_WORKING_KEY_CC; //Put in the 32-Bit key shared by CCAvenues.
    const accessCode = process.env.CCAVENUE_ACCESS_CODE_CC; //Put in the access code shared by CCAvenues.
    let encRequest = "";
    let formbody = "";

    // let amount = await calculateSeatAmount(
    //   userId,
    //   cinemaId,
    //   pGroupCode,
    //   areaCatCode,
    //   quantity,
    //   transId,
    //   fAndB
    // );

    await Transaction.findOneAndUpdate(
      { initTransId: transId },
      {
        $set: { userId, paymentFrom: "ccavenue", booking_type },
        $push: {
          logs: {
            proceedToPay: new Date(),
          },
        },
      }
    ).sort({ createdAt: -1 });

    const initBookingDetails = await Transaction.findOne({
      initTransId: transId,
      userId: userId,
    })
      .populate("userId")
      .sort({ createdAt: -1 });

    const findCinema = await Cinema.findOne({
      _id: initBookingDetails.cinemaId,
    });
    const checkQuantity =
      initBookingDetails.setSeatData.strSeatInfo.split(" - ")[1].split(",")
        .length == quantity;
    const checkFAndB = initBookingDetails.foodAndBvgResponse ? true : false;
    const findSession = await Show.findOne({
      _id: initBookingDetails.showId,
      cinemaId: findCinema.cinemaId,
    });
    const checkAreaCatCode = await Price.findOne({
      areaCatCode: areaCatCode,
      cinemaId: findCinema.cinemaId,
      pGroupCode: findSession.pGroupCode,
    });
    const areaCatCodeFromPackage = await PricePackage.findOne({
      areaCatCode: areaCatCode,
      cinemaId: findCinema.cinemaId,
      pGroupCode: findSession.pGroupCode,
    });

    console.log(initBookingDetails, ":initBookingDetails");
    console.log(checkQuantity, ":checkQuantity");
    console.log(
      checkFAndB,
      ":checkFAndB",
      JSON.parse(fAndB),
      ":Check",
      checkFAndB == JSON.parse(fAndB)
    );
    console.log(checkAreaCatCode, ":checkAreaCatCode", areaCatCodeFromPackage);
    if (
      initBookingDetails &&
      checkQuantity &&
      checkFAndB == JSON.parse(fAndB) &&
      (checkAreaCatCode || areaCatCodeFromPackage)
    ) {
      const finalAmount = initBookingDetails.finalBookingCalculation
        ? initBookingDetails.finalBookingCalculation.finalAmount
        : 0;
      if (finalAmount && finalAmount > 1) {
        const user = await User.findOne({ _id: initBookingDetails.userId._id });
        const userName = user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName;
        const cinema = await Cinema.findOne({ cinemaId, deletedStatus: 0 });

        // amount for appworkdemo

        const data = {
          merchant_id: 3012769,
          order_id: transId, //uuidv4(),
          currency: "INR",
          amount:
            process.env.CCAVENUE_PAYMENT_MODE === "test" ? 1 : +finalAmount,
          // amount: 1,
          redirect_url: process.env.CCAVENUE_REDIRECT_SUCCESS_URL, //process.env.REDIRECT_URL_CC_LOCAL,
          cancel_url: process.env.CCAVENUE_REDIRECT_CANCEL_URL, // process.env.CANCEL_URL_CC_LOCAL,
          language: "EN",
          billing_name: userName,
          billing_address: "Address",
          billing_city: "Ahemadabad",
          billing_state: "Gujarat",
          billing_zip: 380015,
          billing_country: "India",
          billing_tel: initBookingDetails?.userId
            ? initBookingDetails.userId.mobileNumber
            : 8200370537,
          billing_email: initBookingDetails?.userId
            ? initBookingDetails.userId.email
            : "nikita.vhits@gmail.com",
          merchant_param1: transId, //"20000005479", //strTransId,
          merchant_param2: cinemaId, // "650d5e1cdc976fc3ce7d4cb3", //cinemaId,
          merchant_param3: sessionId, //"6538f2eb092ace80851da86f", //sessionId,
          merchant_param4: userId, //"65009e58e9c02408e87762ba", // userId
          merchant_param5: cinema?.address ? cinema.address : "",
        };
        console.log("daaaaaaaaaaaaaaaaaaaaaat", data);

        const queryData = qs.stringify(data);
        encRequest = encrypt(queryData, workingKey);

        // console.log(encRequest, "encRequest....");
        formbody =
          '<div style="display: flex; justify-content: center; align-items: center; height: 100vh;"><div style="text-align: center; font-weight:bold; font-size: 40px;">Your Request is being processed......</div></div><form id="nonseamless" method="post"name="redirect"action="' +
          process.env.PRODUCTION_URL_CC +
          '"/> <input type="hidden" id="encRequest"name="encRequest" value="' +
          encRequest +
          '"><input type="hidden" name="access_code" id="access_code" value="' +
          accessCode +
          '"><script language="javascript">function preventBack(){window.history.forward();}setTimeout(preventBack(), 0);document.redirect.submit();</script></form>';

        createLog({
          transaction_id: transId,
          type: "Booking",
          step: {
            success: true,
            logType:"paymentStarted",
            message: "Payment Started",
            timestamp: new Date().toISOString(),
          },
        });
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(formbody);
        res.end();
        return;
      } else {
        createLog({
          transaction_id: transId,
          type: "Booking",
          step: {
            success: false,
            logType:"paymentStarted",
            message: "Payment Details Mismatch",
            timestamp: new Date().toISOString(),
          },
        });
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
          data: [],
        });
      }
    } else {
      createLog({
        transaction_id: transId,
        type: "Booking",
        step: {
          success: false,
          logType:"paymentStarted",
          message: "Payment Details Mismatch",
          timestamp: new Date().toISOString(),
        },
      });
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
        data: [],
      });
    }
  } catch (e) {
    console.log("errrror");
    console.log(e);
  }
};
//#endregion

//#region ccavenue cancel  request
export const refundCcavenue = async (
  referenceNo,
  amount,
  orderId,
  bankRefNo,
  initTransId
) => {
  // let workingKey = process.env.PRODUCTION_WORKING_KEY_CC;
  // let accessCode = process.env.PRODUCTION_ACCESS_CODE_CC;
  let workingKey = process.env.CCAVENUE_WORKING_KEY_CC;
  let accessCode = process.env.CCAVENUE_ACCESS_CODE_CC;
  let data = {
    reference_no: referenceNo,
    refund_amount: amount,
    refund_ref_no: bankRefNo,
  };
  const queryData = JSON.stringify(data);
  let encRequest = encrypt(queryData, workingKey);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.CCAVENUE_REDIRECT_SUCCESS_URL}?enc_request=${encRequest}&access_code=${accessCode}&command=refundOrder&request_type=JSON&response_type=JSON&version=1.1`,
    headers: {},
  };
  await axios
    .request(config)
    .then(async (response) => {
      const keyValuePairs = response.data.split("&");
      const jsonObject = {};
      for (const pair of keyValuePairs) {
        const [key, value] = pair.split("=");
        jsonObject[key] = value;
      }
      let ccavEncResponse = jsonObject.enc_response
        ? jsonObject.enc_response.split("\r\n")[0]
        : [];
      ccavEncResponse = JSON.stringify(ccavEncResponse);
      let jsonData = JSON.parse(ccavEncResponse);
      let decryptRequest = decrypt(jsonData, workingKey);
      if (JSON.parse(decryptRequest).refund_status == 0) {
        await Transaction.findOneAndUpdate(
          { initTransId },
          {
            $set: {
              status: 3, // Refunded
              refundResponse: JSON.parse(decryptRequest),
              refundStatus: true,
              autoRefund: true,
            },
          }
        );
        return true;
      } else {
        return false; //Payment Refund Failed
      }
    })
    .catch((error) => {
      console.log("error", error);
      throw error;
    });
};
//#endregion

export const statusOfOrder = async (req, res) => {
  try {
    // let workingKey = process.env.PRODUCTION_WORKING_KEY_CC;
    // let accessCode = process.env.PRODUCTION_ACCESS_CODE_CC;
    let workingKey = process.env.CCAVENUE_WORKING_KEY_CC;
    let accessCode = process.env.CCAVENUE_ACCESS_CODE_CC;
    let data = {
      reference_no: req.body.reference_no,
      order_no: req.body.order_id,
    };
    const queryData = JSON.stringify(data);
    let encRequest = encrypt(queryData, workingKey);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.REDIRECT_URL_CC_UAT}?enc_request=${encRequest}&access_code=${accessCode}&request_type=JSON&response_type=JSON&command=orderStatusTracker&version=1.2`,
      headers: {},
    };
    const response = await axios.request(config);
    const keyValuePairs = response.data.split("&");
    const jsonObject = {};
    for (const pair of keyValuePairs) {
      const [key, value] = pair.split("=");
      jsonObject[key] = value;
    }
    let ccavEncResponse = jsonObject.enc_response
      ? jsonObject.enc_response.split("\r\n")[0]
      : [];
    ccavEncResponse = JSON.stringify(ccavEncResponse);
    let jsonData = JSON.parse(ccavEncResponse);
    let decryptRequest = decrypt(jsonData, workingKey);
    // Handle the response here
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.PAYMENT_DETAILS,
      data: JSON.parse(decryptRequest),
    });
  } catch (error) {
    // Handle the error here
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

const buySubscriptionMembership = async (res, data) => {
  const { userId, subscriptionId, couponCode, amount, totalDiscount } = data;

  try {
    const transId = uuidv4();
    const newSubscriptionTransaction = new SubscriptionTransaction({
      userId,
      subscriptionId,
      initTransId: transId,
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

    await newSubscriptionTransaction.save();

    let previousPlanName;
    let newPlanName;
    const oldSubscribeMember = await SubscriberMembership.findOne({
      userId,
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (oldSubscribeMember) {
      const previousSubscriptionPlan = await Subscription.findOne({
        _id: oldSubscribeMember.subscriptionId,
        deletedStatus: 0,
      }).sort({ createdAt: -1 });

      const newSubscriptionPlan = await Subscription.findOne({
        _id: subscriptionId,
        deletedStatus: 0,
      });

      previousPlanName = previousSubscriptionPlan
        ? previousSubscriptionPlan.title
        : null;
      newPlanName = newSubscriptionPlan ? newSubscriptionPlan.title : null;
    }

    const newUpgradePlan = !previousPlanName
      ? `Subscribed to ${newPlanName}`
      : `Upgraded from ${previousPlanName} to ${newPlanName}`;

    const subscriptionDetails = await Subscription.findOne({
      _id: subscriptionId,
    });

    let startDate = moment().tz("Asia/Kolkata").startOf("day"); // Start date at 00:00:00
    let endDate = moment(startDate)
      .add(subscriptionDetails.membershipDuration, "days")
      .endOf("day"); // End date at 23:59:59 on the 30th day

    let formattedStartDate = startDate.format("YYYY-MM-DD HH:mm:ss");
    let formattedEndDate = endDate.format("YYYY-MM-DD HH:mm:ss");
    const subData = {
      userId,
      initTransId: transId,
      subscriptionId: subscriptionId,
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
        accessToExclusiveScreening:
          subscriptionDetails.accessToExclusiveScreening,
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
      subscriptionStartDate: formattedStartDate,
      subscriptionEndDate: formattedEndDate,
      upgradePlan: oldSubscribeMember ? true : false,
      upgradePlanDate: oldSubscribeMember ? Date.now() : null,
      upgradePretoPost: oldSubscribeMember ? newUpgradePlan : null,
    };

    await SubscriberMembership.updateMany(
      { userId: userId, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    const subscriptionMembership = await SubscriberMembership.findOneAndUpdate(
      {
        userId: subData.userId,
        subscriptionId: subData.subscriptionId,
        isActive: true,
      },
      { $set: subData },
      { upsert: true, new: true }
    );

    if (
      subData &&
      subData.subscriptionDetails?.welcomeGift &&
      subData.subscriptionDetails.welcomeGift === "Yes" &&
      subscriptionMembership &&
      subscriptionMembership._id
    ) {
      let currentDate = moment().tz("Asia/Kolkata").startOf("day");
      let collectBeforeDate = moment(currentDate).add(30, "days").endOf("day");
      const welcomeGift = new SubscriptionWelcomeGift({
        userId: new mongoose.Types.ObjectId(subData.userId),
        subscriptionMembershipId: new mongoose.Types.ObjectId(
          subscriptionMembership._id
        ),
        collectBeforeDate,
      });

      await welcomeGift.save();
    }

    return res.send(`
          <script>
            window.location.href = "${process.env.FRONTEND_BASE_URL}/membership-success?transId=${transId}";
          </script>
        `);
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const subscriptionPaymentRequest = async (req, res) => {
  try {
    const userId = req.user; //|| "662b6ce34ddedddc11bcea0e";
    // const { subscriptionId } = req.body;
    let newSubscriptionMembership;
    let previousPlanName;
    let newPlanName;
    // console.log(userId, "userId");
    // console.log(req.body, "req.body");
    // console.log(userId, "userId");
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(404).json({
        status: 400,
        message: "Invalid user ID",
        data: [],
      });
    }

    const user = await User.findById({ _id: userId });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: [],
      });
    }

    const subscriptionId = req.body.subscriptionId;
    const couponCode = req.body.couponCode || "";

    // Check if a successful subscription transaction already exists for this user and subscription
    const existingSuccessfulTransaction = await SubscriptionTransaction.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      subscriptionId: new mongoose.Types.ObjectId(subscriptionId),
      $or: [{ paymentsStatus: true }, { paymentResponse: { $ne: null } }],
    });

    if (existingSuccessfulTransaction) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "This subscription is already processed.",
        data: [],
      });
    }

    const now = moment.tz("Asia/Kolkata");
    const subscribeMemberExist = await SubscriberMembership.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      subscriptionId: new mongoose.Types.ObjectId(req.body.subscriptionId),
      subscriptionEndDate: { $gt: now.toDate() },
      isActive: true,
      deletedStatus: 0,
    });
    // console.log(subscribeMemberExist, "subscribeMemberExist");

    if (subscribeMemberExist) {
      return res.status(StatusCodes.CONFLICT).json({
        status: StatusCodes.CONFLICT,
        message: "Subscription membership already purchased",
        data: [],
      });
    }
    const findSubscription = await Subscription.findOne({
      _id: new mongoose.Types.ObjectId(req.body.subscriptionId),
      // deletedStatus: 0,
    });

    if (!findSubscription) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Subscription not found",
        data: [],
      });
    }
    let result = {
      finalAmount:
        findSubscription.isDiscounted === true
          ? findSubscription.discountedPrice
          : findSubscription.price,
      totalDiscount: 0,
    };
    if (couponCode && couponCode !== "") {
      result = await verifyMembershipCoupon({
        couponCode,
        subscriptionId,
        userId,
      });
    }
    const amount = result.finalAmount || null;
    const totalDiscount = result.totalDiscount || 0;

    if (amount <= 0) {
      const data = {
        userId,
        subscriptionId,
        couponCode,
        amount,
        totalDiscount,
      };
      await buySubscriptionMembership(res, data);
      return;
    }

    let subscriptionId1 = new mongoose.Types.ObjectId(req.body.subscriptionId);
    let userId1 = new mongoose.Types.ObjectId(userId);
    if (subscriptionId1) {
      let payLoadString;
      if (amount) {
        payLoadString = `${userId1}|${subscriptionId1}|${amount}`;
      } else if (findSubscription.isDiscounted === true) {
        payLoadString = `${userId1}|${subscriptionId1}|${findSubscription.discountedPrice}`;
      } else {
        payLoadString = `${userId1}|${subscriptionId1}|${findSubscription.price}`;
      }

      console.log(payLoadString, "payLoadString");

      const id = crypt("testText123", payLoadString);
      // console.log(id, "id");

      const salt = process.env.salt;
      const decryptBody = decryptPayment(salt, id);
      const parts = decryptBody.split("|");

      const [userId, subscriptionId, price] = parts;
      // console.log(parts, "parts");

      const transId = uuidv4();
      console.log("transIdtransIdtransIdtransId", transId);

      const workingKey = process.env.CCAVENUE_WORKING_KEY_CC; //Put in the 32-Bit key shared by CCAvenues.
      const accessCode = process.env.CCAVENUE_ACCESS_CODE_CC; //Put in the access code shared by CCAvenues.
      let encRequest = "";
      let formbody = "";

      const SubscriptionTransactiondata = {
        userId: parts[0],
        paymentFrom: "ccavenue",
        subscriptionId: parts[1],
        initTransId: transId,
      };
      // const SubscriptionTransactiondata = await SubscriptionTransaction(
      //   { initTransId: transId },
      //   {
      //     $set: {
      //       userId: parts[0],
      //       paymentFrom: "ccavenue",
      //       subscriptionId: parts[1],
      //     },
      //   }
      // );
      // console.log(SubscriptionTransactiondata, "SubscriptionTransactiondata");

      await SubscriptionTransaction.create(SubscriptionTransactiondata);
      // console.log("SubscriptionTransactiondata", SubscriptionTransactiondata);

      const user = await User.findOne({ _id: userId });

      const userName = user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName;

      const data = {
        merchant_id: 3012769,
        order_id: transId, //uuidv4(),
        currency: "INR",
        amount: +price,
        // amount: 1,
        redirect_url: process.env.CCAVENUE_REDIRECT_SUBSCRIPTION_SUCCESS_URL,
        cancel_url: process.env.CCAVENUE_REDIRECT_CANCEL_URL,
        language: "EN",
        billing_name: userName,
        billing_address: "Address",
        billing_city: "Ahemadabad",
        billing_state: "Gujarat",
        billing_zip: 380015,
        billing_country: "India",
        billing_tel: user?.mobileNumber ? user.mobileNumber : 8200370537,
        billing_email: user?.email ? user.email : "thecomplex@gmail.com",
        merchant_param1: transId, //"20000005479", //strTransId,
        merchant_param2: userId, // "650d5e1cdc976fc3ce7d4cb3", //cinemaId,
        merchant_param3: subscriptionId, //"6538f2eb092ace80851da86f", //sessionId,
        // merchant_param4: "", //"65009e58e9c02408e87762ba", //userId,
        // merchant_param5: "",
        merchant_param4: couponCode || "",
        merchant_param5: totalDiscount || "",
      };
      // console.log(data, "data");
      console.log("consoleconsoleconsoleconsole", data);

      const queryData = qs.stringify(data);
      encRequest = encrypt(queryData, workingKey);
      console.log(encRequest, "encRequest....");
      formbody =
        '<div style="display: flex; justify-content: center; align-items: center; height: 100vh;"><div style="text-align: center; font-weight:bold; font-size: 40px;">Your Request is being processed......</div></div><form id="nonseamless" method="post"name="redirect"action="' +
        process.env.CCAVENUE_PAYEMENT_URL +
        '"/> <input type="hidden" id="encRequest"name="encRequest" value="' +
        encRequest +
        '"><input type="hidden" name="access_code" id="access_code" value="' +
        accessCode +
        '"><script language="javascript">function preventBack(){window.history.forward();}setTimeout(preventBack(), 0);document.redirect.submit();</script></form>';

      // console.log(formbody, "formbody");

      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(formbody);
      res.end();
      return;
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BOOKING_DETAILS_MISMATCH,
        data: [],
      });
    }
  } catch (error) {}
};

const crypt = (salt, text) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).slice(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};
