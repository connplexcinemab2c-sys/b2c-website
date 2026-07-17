import axios from "axios";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";
import qs from "querystring";
import CCAvenueResponse from "../../models/CCAvenueResponse.js";
import CCAvenueSMSMail from "../../models/CCAvenueSMSMail.js";
import { Notification } from "../../models/Notification.js";
import Transaction from "../../models/Transaction.js";
import { User } from "../../models/User.js";
import {
  createVistaLog,
  getClientIp,
  sendToWebhookApi,
  // shortenUrl,
  smsSend2Digital,
  sendPopcornOfferSMSIfEligible,
} from "../../services/CommanService.js";
import { BookingFailed, bookingSuccess } from "../../utils/Mailers.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { userNotification } from "../Notification.js";
import { decrypt } from "./CcavenueUtils.js";
import { refundCcavenue } from "./CcavRequestHandler.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import SubscriptionMembership from "../../models/SubscriptionMembership.js";
import Subscription from "../../models/Subscription.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import calculateAndSaveCoins, { processCoinRedemption } from "../../controller/user/RewardsController.js";
import mongoose from "mongoose";
import SubscriptionWelcomeGift from "../../models/SubscriptionWelcomeGift.js";
import GeneralSetting from "../../models/GeneralSetting.js";
import { createLog } from "../LogsServices.js";
dotenv.config();
export const paymentResponse = async (req, res) => {
  try {
    let ccavEncResponse = req.body;
    let workingKey = process.env.CCAVENUE_WORKING_KEY_CC; //Put in the 32-Bit key shared by CCAvenues.
    ccavEncResponse = qs.stringify(ccavEncResponse);
    const ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    const ccavResponse = decrypt(encryption, workingKey);

    let paymentData = {
      payment: qs.parse(ccavResponse),
    };
    console.log("paymentDatapaymentData", paymentData);

    let ccavenueresponse = await new CCAvenueResponse(req.body).save();
    console.log("Decrypted CCAvenue response:", paymentData);
    const strTransId = paymentData.payment.merchant_param1;
    const cinemaId = paymentData.payment.merchant_param2;
    const strSessId = paymentData.payment.merchant_param3;
    const userId = paymentData.payment.merchant_param4;
    // const userId = paymentData.payment.merchant_param2;

    // const cinemaAddress = paymentData.payment.merchant_param5;
    console.log("strTransIdstrTransId", strTransId);
    console.log("new console for testing", userId);
    console.log("paymentData.payment.merchant_param6", paymentData.payment);
    // const userIdToFind = paymentData.payment.merchant_param3
    //   ? paymentData.payment.merchant_param2
    //   : paymentData.payment.merchant_param4;
    const userIdToFind = mongoose.isValidObjectId(
      paymentData.payment.merchant_param3
    )
      ? paymentData.payment.merchant_param2
      : paymentData.payment.merchant_param4;
    console.log("userIdToFind", userIdToFind);
    const user = await User.findById({ _id: userIdToFind });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    const from = process.env.TWILLIO_FROM_NUMBER;

    if (paymentData.payment.order_status === "Success") {
      createLog({
        transaction_id: strTransId,
        type: "Booking",
        step: {
          success: true,
          logType: "paymentResponse",
          message: "Payment Successful, Commit Booking Started",
          timestamp: new Date().toISOString(),
        },
      });
      let bookingData = await Transaction.findOne(
        { initTransId: strTransId },
        {
          createdAt: true,
          paymentResponse: true,
          finalBookingCalculation: true,
          paymentsStatus: true,
          commitStatus: true,
          commitBookingData: true,
        }
      ).sort({ createdAt: -1 });

      if (!bookingData) {
        console.error(`Booking data not found: ${strTransId}`);
        return res.status(404).json({ error: "Booking data not found" });
      }

      if (
        bookingData.paymentsStatus === true ||
        bookingData.commitStatus === true ||
        (bookingData.paymentResponse && bookingData.commitBookingData)
      ) {
        return res.send(
          `<script>window.location.replace('${process.env.FRONTEND_BASE_URL}/confirmation-screen?transId=${strTransId}')</script>`
        );
      }

      let couponIds = [];
      bookingData.finalBookingCalculation.ticketCart.coupons.forEach((item) => {
        couponIds.push(item._id);
      });
      bookingData.finalBookingCalculation.foodCart.coupons.forEach((item) => {
        couponIds.push(item._id);
      });

      let bookingStartTime = moment().format("hh:mm:ss");
      let bookingEndTime = moment(bookingData?.createdAt)
        .add(10, "minutes")
        .format("hh:mm:ss");

      console.log(
        "bookingStartTime",
        bookingStartTime,
        bookingEndTime,
        bookingStartTime < bookingEndTime
      );

      await Transaction.findOneAndUpdate(
        { initTransId: strTransId },
        {
          $set: {
            paymentResponse: paymentData.payment,
            paymentsStatus: true,
            userId,
            couponId: couponIds, //new coupon
            status: 4,
            discountCouponStatus: true,
          },
          $push: {
            logs: {
              paymentSuccess: new Date(),
            },
          },
        }
      ).sort({ createdAt: -1 });

      //start For Rewards
      let transactionId = strTransId;
      calculateAndSaveCoins(transactionId);

      const txnForReward = await Transaction.findOne({ initTransId: transactionId }).sort({ createdAt: -1 });
      if (txnForReward?.finalBookingCalculation?.rewardCoinsRedeemed > 0) {
        processCoinRedemption({
          userId: txnForReward.userId,
          coinsToRedeem: txnForReward.finalBookingCalculation.rewardCoinsRedeemed,
          transactionId: txnForReward._id,
        }).catch((e) => console.error("processCoinRedemption error:", e));
      }
      //end

      if (bookingStartTime < bookingEndTime) {
        // await Transaction.findOneAndUpdate(
        //   { initTransId: strTransId },
        //   {
        //     $set: {
        //       paymentResponse: paymentData.payment,
        //       paymentsStatus: true,
        //       userId,
        //       couponId: couponIds, //new coupon
        //       status: 4,
        //       discountCouponStatus: true,
        //     },
        //   }
        // ).sort({createdAt:-1});

        const name = user?.lastName
          ? `${user?.firstName} ${user?.lastName}`
          : user?.firstName;

        let ticketTotal =
          bookingData?.finalBookingCalculation?.ticketCart?.ticketTotal * 100;
        let fnbTotal =
          bookingData?.finalBookingCalculation?.foodCart?.totalAmountByBase;

        let multipayment = `|PAYTYPE1=CW|AMOUNT1=${ticketTotal}|`;

        if (fnbTotal > 0) {
          multipayment += `PAYTYPE2=CWFNB|AMOUNT2=${fnbTotal}|`;
        }
        await checkAndGrantWelcomeGift(userId);
        if (process.env.VISTA_TICKET_BOOKING == "true") {
          try {
            let config = {
              method: "get",
              maxBodyLength: Infinity,
              url: `${process.env.VISTA_URL_BOOKING_URL}/CommitBookingEx?strCinemaId=${cinemaId}&strTransId=${strTransId}&lngSessId=${strSessId}&Name=${name}&MobileNo=${user?.mobileNumber}&MultiPaymentDetails=${multipayment}`,
              headers: {},
            };

            console.log("VISTA request config:", config);

            // const vistaLogRequest = {
            //     ...config,
            //     queryParameters: {
            //     strCinemaId:cinemaId,
            //     strTransId:strTransId,
            //     lngSessId:strSessId,
            //     Name:name,
            //     MobileNo:user.mobileNumber,
            //     MultiPaymentDetails: multipayment
            //   }
            // };

            axios
              .request(config)
              .then(async (response) => {
                console.log("VISTA response:", response.data);
                if (response.data.Status == 1) {
                  // createVistaLog(
                  //   strTransId,
                  //   userId,
                  //   "Ticket",
                  //   "CommitBookingEx",
                  //   vistaLogRequest,
                  //   response.data,
                  //   "Success"
                  // );

                  createLog({
                    transaction_id: strTransId,
                    type: "Booking",
                    step: {
                      success: true,
                      logType: "vistaBookingResponse",
                      response: response.data,
                      message: "Ticket Booked Successfully",
                      timestamp: new Date().toISOString(),
                    },
                  });
                  ticketBooked(res, strTransId, response, user);
                  // } else {
                  //   createVistaLog(
                  //     strTransId,
                  //     userId,
                  //     "Ticket",
                  //     "CommitBookingEx",
                  //     vistaLogRequest,
                  //     response.data,
                  //     "Failed"
                  //   );
                }
              })
              .catch(async (error) => {
                //Handle cancellation here if error encountered

                createLog({
                  transaction_id: strTransId,
                  type: "Booking",
                  step: {
                    success: false,
                    logType: "vistaBookingResponse",
                    message: "Ticket Booking Failed",
                    error: error,
                    timestamp: new Date().toISOString(),
                  },
                });
                console.error("Error in VISTA request:", error);
                // createVistaLog(
                //   strTransId,
                //   userId,
                //   "Ticket",
                //   "CommitBookingEx",
                //   vistaLogRequest,
                //   error.response.data,
                //   "Failed"
                // );
                ticketFailed(
                  res,
                  strTransId,
                  paymentData,
                  user,
                  userId,
                  error.response
                );
              });
          } catch (error) {
            createLog({
              transaction_id: strTransId,
              type: "Booking",
              step: {
                success: false,
                logType: "vistaBookingResponse",
                message: "Ticket Booking Failed",
                error: error,
                timestamp: new Date().toISOString(),
              },
            });
            console.error("Error in commit booking:", error);
            return res.send("<p>" + error.message + ".</p>");
          }
        } else {
          return res.send(
            `<script>window.location.replace('${process.env.FRONTEND_BASE_URL}/confirmation-screen?transId=${strTransId}')</script>`
          );
        }
      } else {
        console.log(":Innnn Ticket Failed");

        createLog({
          transaction_id: strTransId,
          type: "Booking",
          step: {
            success: false,
            logType: "vistaBookingResponse",
            message: "Ticket Booking Failed",
            error: "Booking time exceeded 10 minutes",
            timestamp: new Date().toISOString(),
          },
        });
        // ticketFailed(res, strTransId, paymentData, user, userId);
        paymentFailed(res, strTransId, paymentData, user, userId);
      }
    } else {
      let bookingData = await Transaction.findOne({ initTransId: strTransId });
      if (bookingData && bookingData?.coupan?.lngSessionId) {
        const rollbackResponse = await rollbackCoupanService({
          lngSessionId: bookingData.coupan.lngSessionId,
          coupanCode: bookingData.coupan.coupanCode,
          cinemaId: cinemaId,
        });
        if (!rollbackResponse?.blnSuccess.includes("true")) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.COUPON_ROLLBACK_FAILED,
            data: [],
          });
        }
        await Transaction.findOneAndUpdate(
          { initTransId: strTransId },
          {
            $unset: {
              "coupan.coupanCode": "",
              "coupan.lngSessionId": "",
              "coupan.discountOn": "",
              "coupan.discountValue": "",
            },
          }
        );
      }
      console.log(":Innnn Payment Failed");

      createLog({
        transaction_id: strTransId,
        type: "Booking",
        step: {
          success: false,
          logType: "paymentResponse",
          message: "Payment Failed",
          error: paymentData.payment,
          timestamp: new Date().toISOString(),
        },
      });
      paymentFailed(res, strTransId, paymentData, user, userId);
    }
  } catch (error) {
    console.error("Error in payment response handling:", error);
    return res.status(500).send("<p>Internal Server Error.</p>");
  }
};

// export const paymentFailed = async (
//   res,
//   strTransId,
//   paymentData,
//   user,
//   userId
// ) => {
//   console.log(
//     "data for new check",
//     // res,
//     // strTransId,
//     // paymentData,
//     user,
//     userId
//   );
//   console.log("strTransId", strTransId);
//   const id = user._id;
//   const TransactionDetails = await SubscriptionTransaction.findOneAndUpdate(
//     { initTransId: strTransId },
//     // { "paymentResponse.tracking_id": paymentData.payment.tracking_id },
//     {
//       $set: {
//         paymentResponse: paymentData.payment,
//         paymentsStatus: false,
//         id,
//         status: 5, //payment Failed
//       },
//       $push: {
//         logs: {
//           paymentFailed: new Date(),
//         },
//       },
//     },
//     { new: true }
//   ).sort({ createdAt: -1 });
//   console.log("TransactionDetails", TransactionDetails);

//   // const bookingId = TransactionDetails.paymentResponse.order_id;
//   //   const bookingId = TransactionDetails.addSeatData.strBookId;
//   const bookingId =
//     TransactionDetails.addSeatData?.strBookId ||
//     TransactionDetails.paymentResponse?.order_id;

//   let data = {
//     email: user.email,
//     // url: smsUrl,
//     // message: message,
//     bookingId: bookingId,
//     transId: strTransId,
//   };

//   if (paymentData.payment.order_status !== "Aborted") {
//     if (user && user.email) {
//       await BookingFailed(data);
//     }

//     if (user && user.mobileNumber) {
//       let message = `Due to some technical error your transaction has failed, Sorry for inconvenience. VCS industries limited`;
//       await smsSend2Digital(
//         message,
//         `+91${user.mobileNumber}`,
//         process.env.SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID
//       );
//       // await smsTwillio(message, from, `+91${user.mobileNumber}`);
//     }
//   }

//   return res.send(
//     `<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`
//   );
// };
export const paymentFailed = async (
  res,
  strTransId,
  paymentData,
  user,
  userId
) => {
  console.log("data for new check", user, userId);
  console.log("strTransId", strTransId);

  const id = user._id;

  // Try to update in SubscriptionTransaction
  let TransactionDetails = await SubscriptionTransaction.findOneAndUpdate(
    { initTransId: strTransId },
    {
      $set: {
        paymentResponse: paymentData.payment,
        paymentsStatus: false,
        id,
        status: 5, // payment Failed
      },
      $push: {
        logs: {
          paymentFailed: new Date(),
        },
      },
    },
    { new: true }
  ).sort({ createdAt: -1 });

  // If not found, try Transaction collection
  if (!TransactionDetails) {
    TransactionDetails = await Transaction.findOneAndUpdate(
      { initTransId: strTransId },
      {
        $set: {
          paymentResponse: paymentData.payment,
          paymentsStatus: false,
          id,
          status: 5, // payment Failed
        },
        $push: {
          logs: {
            paymentFailed: new Date(),
          },
        },
      },
      { new: true }
    ).sort({ createdAt: -1 });
  }

  if (!TransactionDetails) {
    console.error("Transaction not found in either collection");
    return res.status(404).json({ error: "Transaction not found" });
  }

  // Use whichever bookingId is available
  const bookingId =
    TransactionDetails?.addSeatData?.strBookId ||
    TransactionDetails?.paymentResponse?.order_id;

  let data = {
    email: user.email,
    bookingId,
    transId: strTransId,
  };

  if (paymentData.payment.order_status !== "Aborted") {
    if (user?.email) {
      await BookingFailed(data);
    }

    if (user?.mobileNumber) {
      let message = `Due to some technical error your transaction has failed, Sorry for inconvenience. VCS industries limited`;
      await smsSend2Digital(
        message,
        `+91${user.mobileNumber}`,
        process.env.SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID,
        { smsType: "FAILED_TRANSACTION", userId }
      );
    }
  }

  return res.send(
    `<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`
  );
};

export const ticketFailed = async (
  res,
  strTransId,
  paymentData,
  user,
  userId,
  vistaErrorResponse = null
) => {
  if (process.env.VISTA_TICKET_REFUND == "true") {
    const refundResult = await refundCcavenue(
      paymentData.payment.tracking_id, //referenceNo
      paymentData.payment.amount,
      paymentData.payment.order_id,
      paymentData.payment.bank_ref_no,
      strTransId
    ); // Handle refund
    if (refundResult == false) {
      // Handle refund failure
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REFUND_FAILED,
        data: [],
      });
    }
  }
  let updateTrans = await Transaction.findOneAndUpdate(
    { initTransId: strTransId },
    {
      $set: {
        commitBookingData: null,
        userId,
        commitStatus: false,
        vistaErrorResponse,
      },
      $push: {
        logs: {
          ticketFailed: new Date(),
        },
      },
    },
    { new: true }
  ).sort({ createdAt: -1 });
  const bookingId = updateTrans.addSeatData.strBookId;
  let data = {
    email: user.email,
    // url: smsUrl,
    // message: message,
    bookingId: bookingId,
    transId: strTransId,
  };
  if (user) {
    await BookingFailed(data);
  }

  // if (user && user.mobileNumber) {
  //   let refundMessage = `We have refunded ${updateTrans.finalBookingCalculation.finalAmount} and should reflect in 5-7 working days. VCS industries limited`;
  //   await smsSend2Digital(
  //     refundMessage,
  //     `+91${user.mobileNumber}`,
  //     process.env.SEND2DIGITAL_REFUND_CONTENTID
  //   );
  // }
  return res.send(
    `<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`
    // `<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`
  );
};
export const ticketBooked = async (res, strTransId, response, user) => {
  await Transaction.findOneAndUpdate(
    { initTransId: strTransId },
    {
      $set: {
        commitBookingData: response.data.data,
        status: 1,
        commitStatus: true,
        discountCouponStatus: true,
      },
      $push: {
        logs: {
          ticketBooked: new Date(),
        },
      },
    }
  ).sort({ createdAt: -1 });

  const bookingDetails = await Transaction.findOne(
    {
      initTransId: strTransId,
    },
    { addSeatData: 0, paymentResponse: 0, setSeatData: 0 }
  )
    .populate({
      path: "cinemaId",
      select: ["cinemaName"],
    })
    .populate({
      path: "movieId",
      select: ["name"],
    })
    .populate({
      path: "showId",
      select: ["sessionRealShow", "screenName"],
    })
    .populate({
      path: "couponId",
      // select: ["", ""],
    })
    .sort({ createdAt: -1 });
  let url = `${process.env.FRONTEND_BASE_URL_PRODUCTION}/booking-info/${strTransId}`;
  // let url = `${process.env.FRONTEND_BASE_URL}/booking-info/${strTransId}`;
  let smsUrl = `${process.env.M_TICKET_URL}/${strTransId}`;
  // let smsUrl = `cnpx.in/t/${strTransId}`;

  const movieDate = moment(bookingDetails.showId.sessionRealShow).format(
    "DD-MM-YYYY"
  );
  const movieShow = moment(bookingDetails.showId.sessionRealShow).format(
    "hh:mm:ss"
  );
  const message = `Your ticket is booked for ${bookingDetails.movieId.name} movie on ${movieDate}. Here is your ticket for the quick reference: ${smsUrl} VCS industries limited`;
  // `Your ticket is booked for ${bookingDetails.movieId.name} movie at ${movieShow} on ${movieDate}.`;
  let data = {
    email: user.email,
    url: smsUrl,
    message: message,
  };

 
  if (bookingDetails.paymentsStatus === true && bookingDetails.commitStatus === true && process.env.SENDING_WHATSAPP_WEBHOOK_API == "true") {
    try {
      await sendToWebhookApi(strTransId);
    } catch (error) {
      console.error("Webhook error in ticketBooked:", error);
    }
  }

  if (user && user.email) {
    console.log("inside if in email");
    await bookingSuccess(data);
  }
  if (user && user.mobileNumber) {
    //await smsTwillio(message, from, `+91${user.mobileNumber}`);
    console.log("inside if in sms");
    await smsSend2Digital(
      message,
      `+91${user.mobileNumber}`,
      process.env.SEND2DIGITAL_TICKET_BOOKING_CONTENTID,
      { smsType: "BOOKING_CONFIRMATION", userId: user._id }
    );

    try {
      await sendPopcornOfferSMSIfEligible(bookingDetails, user);
    } catch (popcornError) {
      console.error("Error sending popcorn offer SMS:", popcornError);
    }
  }
  let emailResponse = await new CCAvenueSMSMail({
    email: user.email,
    mobileNumber: user.mobileNumber,
    initTransId: strTransId,
  }).save();
  console.log("Response send for sms/Email service", emailResponse);
  const title = "Ticket Booking Confirmation";
  const description = `Thank you for booking with The Connplex Smart Theatre!`;
  const notificationData = {
    userId: user._id,
    notificationType: "User",
    title: title,
    text: description,
  };
  const userNotificationData = await Notification.create(notificationData);
  userNotification(user._id, title, description, userNotificationData._id);
  return res.send(
    `<script>window.location.replace('${process.env.FRONTEND_BASE_URL}/confirmation-screen?transId=${strTransId}')</script>`
  );
  // let updateTrans = await Transaction.findOneAndUpdate(
  //   { initTransId: strTransId },
  //   {
  //     $set: {
  //       commitBookingData: response.data.data,
  //       commitStatus: false,
  //       requestedParameters: req.body,
  //     },
  //   },
  //   { new: true }
  // );
  // if (user && user.mobileNumber) {
  //   let refundMessage = `We have refunded ${updateTrans.paymentResponse.amount} and should reflect in 5-7 working days. VCS industries limited`;
  //   await smsSend2Digital(
  //     refundMessage,
  //     `+91${user.mobileNumber}`,
  //     process.env.SEND2DIGITAL_REFUND_CONTENTID
  //   );
  // }
  // return res.send(
  //   `<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`
  // );
};

const determineUpgradeString = (previousPlanName, newPlanName) => {
  console.log({
    previousPlanName,
    newPlanName,
  });

  if (!previousPlanName) {
    return `Subscribed to ${newPlanName}`;
  } else {
    return `Upgraded from ${previousPlanName} to ${newPlanName}`;
  }
};

export const subscriptionPaymentResponse = async (req, res) => {
  console.log("Received CCAvenue response:", req.body);
  try {
    let ccavEncResponse = req.body;

    let workingKey = process.env.CCAVENUE_WORKING_KEY_CC; //Put in the 32-Bit key shared by CCAvenues.
    ccavEncResponse = qs.stringify(ccavEncResponse);
    const ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    const ccavResponse = decrypt(encryption, workingKey);

    let paymentData = {
      payment: qs.parse(ccavResponse),
    };
    console.log("paymentData", paymentData);

    let ccavenueresponse = await new CCAvenueResponse(req.body).save();
    const strTransId = paymentData.payment.merchant_param1;
    // console.log(strTransId, "strTransId");

    const userId = paymentData.payment.merchant_param2;
    const subscriptionId = paymentData.payment.merchant_param3;
    // const cinemaId = paymentData.payment.merchant_param4;
    // const strSessId = paymentData.payment.merchant_param5;
    const couponCode = paymentData.payment.merchant_param4;
    const couponDiscount = paymentData.payment.merchant_param5;
    const user = await User.findById({ _id: userId });

    // if (!user) {
    //   console.error(`User not found: ${userId}`);
    //   return res.status(404).json({ error: "User not found" });
    // }

    const from = process.env.TWILLIO_FROM_NUMBER;
    if (paymentData.payment.order_status === "Success") {
      let SubscriptionData = await SubscriptionTransaction.findOne(
        { initTransId: strTransId },
        { createdAt: true, paymentResponse: true, subscriptionId: true, paymentsStatus: true }
      );

      if (SubscriptionData && (SubscriptionData.paymentsStatus === true || SubscriptionData.paymentResponse)) {
        return res.send(`
          <script>
            window.location.href = "${process.env.FRONTEND_BASE_URL}/membership-success?transId=${strTransId}";
          </script>
        `);
      }

      const updateData = {
        paymentResponse: paymentData.payment,
        paymentsStatus: true,
        userId,
        subscriptionId: SubscriptionData.subscriptionId,
        status: 1, // Payment Success
      };

      if (couponCode && couponDiscount) {
        updateData.coupon = {
          couponCode: couponCode,
          couponDiscount: couponDiscount,
        };
      }

      await SubscriptionTransaction.findOneAndUpdate(
        { initTransId: strTransId },
        {
          $set: updateData,

          // $set: {
          //   paymentResponse: paymentData.payment,
          //   paymentsStatus: true,
          //   userId,
          //   subscriptionId: SubscriptionData.subscriptionId,
          //   status: 1, //payment Success
          //   coupon:paymentData.payment.couponCode || null,
          //   discount:paymentData.payment.discount || null,
          // },
        }
      );

      let newSubscriptionMembership;
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
          _id: SubscriptionData.subscriptionId,
          deletedStatus: 0,
        });

        previousPlanName = previousSubscriptionPlan
          ? previousSubscriptionPlan.title
          : null;
        newPlanName = newSubscriptionPlan ? newSubscriptionPlan.title : null;
      }

      const newUpgradePlan = determineUpgradeString(
        previousPlanName,
        newPlanName
      );

      const subscriptionDetails = await Subscription.findOne({
        _id: SubscriptionData.subscriptionId,
      });

      let startDate = moment().tz("Asia/Kolkata").startOf("day"); // Start date at 00:00:00
      let endDate = moment(startDate)
        .add(subscriptionDetails.membershipDuration, "days")
        .endOf("day"); // End date at 23:59:59 on the 30th day

      let formattedStartDate = startDate.format("YYYY-MM-DD HH:mm:ss");
      let formattedEndDate = endDate.format("YYYY-MM-DD HH:mm:ss");
      const subData = {
        userId,
        initTransId: strTransId,
        subscriptionId: SubscriptionData.subscriptionId,
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

      // const SubscriptionMembershipData =
      //   await SubscriberMembership.findOneAndUpdate(
      //     { userId: userId, isActive: true },
      //     { $set: { isActive: false } },
      //     { new: true }
      //   );

      const SubscriptionMembershipData = await SubscriberMembership.updateMany(
        { userId: userId, isActive: true },
        { $set: { isActive: false } },
        { new: true }
      );
      const subscriptionMembership =
        await SubscriptionMembership.findOneAndUpdate(
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
        let collectBeforeDate = moment(currentDate)
          .add(30, "days")
          .endOf("day");
        const welcomeGift = new SubscriptionWelcomeGift({
          userId: new mongoose.Types.ObjectId(subData.userId),
          subscriptionMembershipId: new mongoose.Types.ObjectId(
            subscriptionMembership._id
          ),
          collectBeforeDate,
        });

        await welcomeGift.save();
      }

      if (!SubscriptionData) {
        console.error(`Subscription data not found: ${strTransId}`);
        return res.status(404).json({ error: "Subscription data not found" });
      } else {
        // if (user && user.mobileNumber) {
        //   let refundMessage = `We have refunded ${updateTrans.paymentResponse.amount} and should reflect in 5-7 working days. VCS industries limited`;
        //   await smsSend2Digital(
        //     refundMessage,
        //     `+91${user.mobileNumber}`,
        //     process.env.SEND2DIGITAL_REFUND_CONTENTID
        //   );
        // }
        return res.send(`
          <script>
            window.location.href = "${process.env.FRONTEND_BASE_URL}/membership-success?transId=${strTransId}";
          </script>
        `);
      }
    } else {
      await SubscriptionTransaction.findOneAndUpdate(
        { initTransId: strTransId },
        {
          $set: {
            paymentResponse: paymentData.payment,
            paymentsStatus: false,
            userId,
            subscriptionId,
            status: 5, //payment Failed
          },
        }
      );
      if (user && user.mobileNumber) {
        let message = `Due to some technical error your transaction has failed, Sorry for inconvenience. VCS industries limited`;
        await smsSend2Digital(
          message,
          `+91${user.mobileNumber}`,
          process.env.SEND2DIGITAL_FAILED_TRANSACTION_CONTENTID,
          {
            smsType: "FAILED_TRANSACTION",
            userId,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"],
          }
        );
        // await smsTwillio(message, from, `+91${user.mobileNumber}`);
      }
      // return res.send`<script>window.location.href='${process.env.FRONTEND_BASE_URL}/transaction-failed?transId=${strTransId}'</script>`();
    }
  } catch (error) {
    console.error("Error in payment response handling:", error);
    return res.status(500).send("<p>Internal Server Error.</p>");
  }
};

export const checkAndGrantWelcomeGift = async (userId) => {
  try {
    if (!userId) return;
    const existingGift = await SubscriptionWelcomeGift.findOne({
      userId,
      type: "ticket",
    });
    if (existingGift) return;

    const ticketCount = await GeneralSetting.findOne();
    if (!ticketCount?.isWelcomeGift) return;

    const ticketRequired = ticketCount.ticketsRequired ?? 1;

    const successfulTransactionCount = await Transaction.countDocuments({
      userId,
      paymentResponse: { $ne: null },
    });

    if (successfulTransactionCount >= ticketRequired) {
      const currentDate = moment().tz("Asia/Kolkata").startOf("day");
      const collectBeforeDate = moment(currentDate)
        .add(30, "days")
        .endOf("day");

      const welcomeGift = new SubscriptionWelcomeGift({
        userId: new mongoose.Types.ObjectId(userId),
        collectBeforeDate,
        type: "ticket",
      });

      await welcomeGift.save();
      console.log("🎁 Welcome gift granted:", welcomeGift);
    }
  } catch (error) {
    console.error("Error in checkAndGrantWelcomeGift:", error);
  }
};
