import axios from "axios";
import dotenv from "dotenv";
import { StatusCodes } from "http-status-codes";
import moment from "moment/moment.js";
import Razorpay from "razorpay";
import { Notification } from "../../models/Notification.js";
import Transaction from "../../models/Transaction.js";
import { User } from "../../models/User.js";
import {
  calculateSeatAmount,
  handleErrorResponse,
  shortenUrl,
  smsTwillio,
} from "../../services/CommanService.js";
import { userNotification } from "../../services/Notification.js";
import { bookingSuccess } from "../../utils/Mailers.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
dotenv.config();
const { createHmac } = await import("node:crypto");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const initOrder = async (req, res) => {
  try {
    let {
      transId,
      cinemaId,
      sessionId,
      userId,
      areaCatCode,
      quantity,
      pGroupCode,
      fAndB,
      booking_type,
    } = req.body;
    let amount = await calculateSeatAmount(
      cinemaId,
      pGroupCode,
      areaCatCode,
      quantity,
      transId,
      fAndB
    );
    if (amount.totalAmount && amount.totalAmount > 0) {
      let create = await instance.orders.create({
        amount: amount.totalAmount * 100,
        currency: "INR",
        receipt: transId,
        notes: {
          transId,
          cinemaId,
          sessionId,
          userId,
        },
      });
      if (create) {
        await Transaction.findOneAndUpdate(
          { initTransId: transId },
          { $set: { razorpayOrderId: create.id, booking_type: booking_type } }
        );
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.TRANS_ID,
          data: create,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: response.data,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const hmac = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);

    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    let generatedSignature = hmac.digest("hex");

    let isSignatureValid = generatedSignature == razorpay_signature;
    if (isSignatureValid) {
      let paymentInfo = await instance.payments.fetch(razorpay_payment_id);
      await Transaction.findOneAndUpdate(
        { initTransId: paymentInfo.notes.transId },
        {
          $set: {
            paymentResponse: paymentInfo,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        }
      );
      if (paymentInfo.status == "captured") {
        const user = await User.findById({ _id: paymentInfo.notes.userId });
        let bookingData = await Transaction.findOne(
          { initTransId: paymentInfo.notes.transId },
          { createdAt: true, paymentResponse: true }
        );
        let bookingStartTime = moment().format("hh:mm:ss");
        let bookingEndTime = moment(bookingData.createdAt)
          .add(10, "minutes")
          .format("hh:mm:ss");

        if (bookingStartTime < bookingEndTime) {
          await Transaction.findOneAndUpdate(
            { initTransId: paymentInfo.notes.transId },
            {
              $set: {
                paymentResponse: paymentInfo,
                paymentsStatus: true,
                userId: paymentInfo.notes.userId,
                status: 4,
              },
            }
          );
          const name = user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName;
          // try {
          //   let config = {
          //     method: "get",
          //     maxBodyLength: Infinity,
          //     url: `${
          //       process.env.VISTA_URL
          //     }/api.asmx/CommitBooking?strCinemaId=${
          //       paymentInfo.notes.cinemaId
          //     }&strTransId=${paymentInfo.notes.transId}&lngSessId=${
          //       paymentInfo.notes.sessionId
          //     }&Name=${name ? name : "Guest"}&MobileNo=${user.mobileNumber}`,
          //     headers: {},
          //   };
          //   axios
          //     .request(config)
          //     .then(async (response) => {
          //       if (response.data.Status == 1) {
          //         await Transaction.findOneAndUpdate(
          //           { initTransId: paymentInfo.notes.transId },
          //           {
          //             $set: {
          //               commitBookingData: response.data.data,
          //               status: 1,
          //               commitStatus: true,
          //             },
          //           }
          //         );
          //         const bookingDetails = await Transaction.findOne(
          //           {
          //             initTransId: paymentInfo.notes.transId,
          //           },
          //           { addSeatData: 0, paymentResponse: 0, setSeatData: 0 }
          //         )
          //           .populate({
          //             path: "cinemaId",

          //             select: ["cinemaName"],
          //           })
          //           .populate({
          //             path: "movieId",
          //             select: ["name"],
          //           })
          //           .populate({
          //             path: "showId",
          //             select: ["sessionRealShow", "screenName"],
          //           });
          //         let url = `https://ticketing.theconnplex.com/booking-info/${strTransId}`;
          //         let smsUrl = `https://cnpx.in/${strTransId}`;
          //         let data = {
          //           email: user.email,
          //           url: url,
          //         };
          //         if (user && user.email) {
          //           await bookingSuccess(data);
          //         }
          //         if (user && user.mobileNumber) {
          //           const movieDate = moment(
          //             bookingDetails.showId.sessionRealShow
          //           ).format("DD-MM-YYYY");
          //           const movieShow = moment(
          //             bookingDetails.showId.sessionRealShow
          //           ).format("hh:mm:ss");
          //           // let urlShort = await shortenUrl(url);
          //           //   let message = `Kudos! Thank you for choosing Connplex. Here is your movie ticket: ${urlShort.result_url}`;
          //           let from = process.env.TWILLIO_FROM_NUMBER;
          //           // let message = `Thank you for booking with The Connplex Smart Theatre! Your ticket for ${
          //           //   bookingDetails.movieId.name
          //           // } on ${[
          //           //   movieDate,
          //           // ]} at ${movieShow} has been confirmed. View Ticket ${url} Enjoy the show!`;

          //           //  await smsTwillio(message, from, `+91${user.mobileNumber}`);

          //           let message = `Your ticket is booked for ${
          //             bookingDetails.movieId.name
          //           } movie on ${[
          //             movieDate,
          //           ]}. Here is your ticket for the quick reference: ${smsUrl} VCS industries limited`; //05-04-2024

          //           await smsSend2Digital(
          //             message,
          //             `+91${user.mobileNumber}`,
          //             process.env.SEND2DIGITAL_TICKET_BOOKING_CONTENTID
          //           ); //05-04-2024
          //           const title = "Ticket Booking Confirmation";
          //           const description = `Thank you for booking with The Connplex Smart Theatre!`;

          //           const data = {
          //             userId: user._id,
          //             notificationType: "User",
          //             title: title,
          //             text: description,
          //             bookingId: bookingDetails._id,
          //           };
          //           const userNotificationData = await Notification.create(
          //             data
          //           );
          //           userNotification(
          //             user._id,
          //             title,
          //             description,
          //             userNotificationData._id,
          //             data.bookingId
          //           );
          //         }
          //         return res.send(
          //           `https://ticketing.theconnplex.com/confirmation-screen?transId=${paymentInfo.notes.transId}`
          //         );
          //       } else {
          //         const refundResult = await refundPerform(
          //           paymentInfo.notes.sessionId
          //         ); // Handle refund
          //         if (refundResult == false) {
          //           // Handle refund failure
          //           return res.status(400).json({
          //             status: StatusCodes.BAD_REQUEST,
          //             message: ResponseMessage.REFUND_FAILED,
          //             data: [],
          //           });
          //         }

          //         // let updateTrans = await InitBooking.findOneAndUpdate(
          //         //   { initTransId: strTransId },
          //         //   {
          //         //     $set: {
          //         //       commitBookingData: response.data.data,
          //         //       commitStatus: false,
          //         //     },
          //         //   },
          //         //   { new: true }
          //         // );

          //         // if (user && user.mobileNumber) {
          //         //   let refundMessage = `We have refunded ${
          //         //     updateTrans.paymentResponse.captured_amount_in_paisa / 100
          //         //   } and should reflect in 5-7 working days. You can check your refund status by going to Profile-My Bookings.
          //         //   - MovieMax`;
          //         //   await sms(user.mobileNumber, refundMessage);
          //         // }
          //         return res.send(
          //           `https://ticketing.theconnplex.com/transaction-failed?transId=${paymentInfo.notes.transId}`
          //         );
          //       }
          //     })
          //     .catch(async (error) => {
          //       const refundResult = refundPerform(paymentInfo.notes.transId); // Handle refund
          //       if (refundResult == false) {
          //         // Handle refund failure
          //         return res.status(400).json({
          //           status: StatusCodes.BAD_REQUEST,
          //           message: ResponseMessage.REFUND_FAILED,
          //           data: [],
          //         });
          //       }
          //       // let updateTrans = await Transaction.findOneAndUpdate(
          //       //   { initTransId: paymentInfo.notes.transId },
          //       //   {
          //       //     $set: {
          //       //       commitBookingData: error,
          //       //       userId: paymentInfo.notes.userId,
          //       //       commitStatus: false,
          //       //     },
          //       //   },
          //       //   { new: true }
          //       // );
          //       // if (user && user.mobileNumber) {
          //       //   let refundMessage = `We have refunded ${
          //       //     updateTrans.paymentResponse.captured_amount_in_paisa / 100
          //       //   } and should reflect in 5-7 working days. You can check your refund status by going to Profile-My Bookings.
          //       //     - MovieMax`;
          //       //   await sms(user.mobileNumber, refundMessage);
          //       // }
          //       return res.send(
          //         `https://ticketing.theconnplex.com/transaction-failed?transId=${paymentInfo.notes.transId}`
          //       );
          //     });
          // } catch (error) {
          //   return handleErrorResponse(res, error);
          // }
          return res.send(
                      `https://connplex.b2c.appworkdemo.com/confirmation-screen?transId=${paymentInfo.notes.transId}`
                    );
        } else {
          const refundResult = await refundPerform(paymentInfo.notes.transId); // Handle refund
          if (refundResult == false) {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: ResponseMessage.REFUND_FAILED,
              data: [],
            });
          }
          // if (user && user.mobileNumber) {
          //   let refundMessage = `We have refunded ${
          //     bookingData.paymentResponse.captured_amount_in_paisa / 100
          //   } and should reflect in 5-7 working days. You can check your refund status by going to Profile-My Bookings.
          //     - MovieMax`;
          //   await sms(user.mobileNumber, refundMessage);
          // }
          return res.send(
            `https://ticketing.theconnplex.com/transaction-failed?transId=${paymentInfo.notes.transId}`
          );
        }
      } else {
        return res.send(
          `https://ticketing.theconnplex.com/transaction-failed?transId=${paymentInfo.notes.transId}`
        );
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const refundPerform = async (initTransId) => {
  try {
    let paymentInfo = await Transaction.findOne({
      initTransId: initTransId,
    });

    let refund = await instance.payments.refund(paymentInfo.razorpayPaymentId, {
      amount: paymentInfo.paymentResponse.amount,
      speed: "normal",
      notes: {
        refundType: "Auto Refund",
      },
      receipt: initTransId,
    });
    if (refund.entity == "refund" && refund.status == "pending") {
      //processed
      await Transaction.findOneAndUpdate(
        { initTransId },
        {
          $set: {
            status: 3,
            refundResponse: refund,
            refundStatus: true,
            refundNote: "Transaction timeout",
          },
        }
      );
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};
