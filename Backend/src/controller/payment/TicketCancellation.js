import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Transaction from "../../models/Transaction.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import TicketCancel from "../../models/TicketCancel.js";
import {
  createVistaLog,
  getClientIp,
  handleErrorResponse,
  smsSend2Digital,
  smsTwillio,
} from "../../services/CommanService.js";
import { User } from "../../models/User.js";
import { refundPerform } from "../../controller/payment/Payment.js";
//#region Ticket cancel
export const cancelTicket = async (req, res) => {
  try {
    let { CinemaId, strTransId } = req.params;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/RefundTrans?strCinemaId=${CinemaId}&lngBookingId=${strTransId}&strCardNumber=&strCustomerName=`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: CinemaId,
    //     lngBookingId: strTransId,
    //     strCardNumber: "",
    //     strCustomerName: "",
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          let data = await Transaction.findOneAndUpdate(
            { initTransId: strTransId },
            {
              $set: {
                status: 7,
                cancellationStatus: true,
              },
            },
            { new: true }
          );
          await new TicketCancel({
            strTransId,
            userId: data.userId,
            cancelTicketData: response.data.data,
            status: 2,
          }).save();
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "RefundTrans",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          const user = await User.findById({ _id: data.userId });
          const refundProceed = await refundPerform(strTransId);
          if (refundProceed) {
            if (user && user.mobileNumber) {
              let message = `Dear Client, we regret to inform you that your ticket has been cancelled at your request. For any further assistance, please contact our customer support. Thank you.`;

              await smsSend2Digital(
                message,
                `+91${user.mobileNumber}`,
                process.env.SEND2DIGITAL_TICKET_CANCELLATION_CONTENTID,
                {
                  smsType: "TICKET_CANCELLATION",
                  userId: data.userId,
                  ipAddress: getClientIp(req),
                  userAgent: req.headers["user-agent"],
                }
              );
            }
            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.TICKET_HAS_BEEN_CANCELLED,
              data: response.data,
            });
          } else {
            return res.send(
              `https://ticketing.theconnplex.com/transaction-failed?transId=${strTransId}`
            );
          }
        } else {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "Ticket",
          //   "RefundTrans",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   strTransId,
        //   null,
        //   "Ticket",
        //   "RefundTrans",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Refund payment for testing refund
export const refundPaymentWithCondition = async (req, res) => {
  console.log("test refund");
  try {
    let { initTransId } = req.body;
    let paymentInfo = await Transaction.findOne({
      initTransId,
    });
    console.log("test refund user", paymentInfo);
    // const user = await User.findById(
    //  { _id: paymentInfo.userId },
    //  { email: true, mobileNumber: true }
    //  );

    const refundProceed = await refundPerform(initTransId);
    if (refundProceed) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.YOUR_REFUND_HAS_BEEN_INITIATED,
        data: [],
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REFUND_FAILED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
