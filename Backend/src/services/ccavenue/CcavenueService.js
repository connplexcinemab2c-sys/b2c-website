import moment from "moment-timezone";
import { User } from "../../models/User.js";
import Transaction from "../../models/Transaction.js";
import calculateAndSaveCoins, { processCoinRedemption } from "../../controller/user/RewardsController.js";
import { ticketBooked, ticketFailed } from "./CcavResponseHandler.js";
import axios from "axios";
import { createVistaLog } from "../CommanService.js";
// import { bookingSuccess } from "../../utils/Mailers.js";
// import { smsSend2Digital } from "../CommanService.js";
// import CCAvenueSMSMail from "../../models/CCAvenueSMSMail.js";
// import { Notification } from "../../models/Notification.js";
// import { userNotification } from "../Notification.js";

export const ccavEncResponseDirectly = async (
  res,
  userId,
  strTransId,
  cinemaId,
  strSessId
) => {
  try {
    const user = await User.findById({ _id: userId, deletedStatus: 0 });

    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }
    let initBookingDetails = await Transaction.findOne(
      { initTransId: strTransId },
      {
        createdAt: true,
        paymentResponse: true,
        finalBookingCalculation: true,
      }
    ).sort({ createdAt: -1 });

    if (!initBookingDetails) {
      console.error(`Booking data not found: ${strTransId}`);
      return res.status(404).json({ error: "Booking data not found" });
    }

    const finalAmount = initBookingDetails.finalBookingCalculation
      ? initBookingDetails.finalBookingCalculation.finalAmount
      : 0;
    //Get CouponIds
    let couponIds = [];
    initBookingDetails.finalBookingCalculation.ticketCart.coupons.forEach(
      (item) => {
        couponIds.push(item._id);
      }
    );
    initBookingDetails.finalBookingCalculation.foodCart.coupons.forEach(
      (item) => {
        couponIds.push(item._id);
      }
    );

    let bookingStartTime = moment().format("hh:mm:ss");
    let bookingEndTime = moment(initBookingDetails?.createdAt)
      .add(10, "minutes")
      .format("hh:mm:ss");

    await Transaction.findOneAndUpdate(
      { initTransId: strTransId },
      {
        $set: {
          paymentResponse: { amount: finalAmount },
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

    if (bookingStartTime < bookingEndTime) {
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

      const name = user?.lastName
        ? `${user?.firstName} ${user?.lastName}`
        : user?.firstName;
      console.log(name, ":name");

      if (Boolean(process.env.VISTA_TICKET_BOOKING) == true) {
        try {
          let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${process.env.VISTA_URL_BOOKING_URL}/CommitBooking?strCinemaId=${cinemaId}&strTransId=${strTransId}&lngSessId=${strSessId}&Name=${name}&MobileNo=${user?.mobileNumber}`,
            headers: {},
          };

          // const vistaLogRequest = {
          //   ...config,
          //   queryParameters: {
          //   strCinemaId:cinemaId,
          //   strTransId:strTransId,
          //   lngSessId:strSessId,
          //   Name:name,
          //   MobileNo:user.mobileNumber
          //   }
          // }

          axios
            .request(config)
            .then(async (response) => {
              console.log("VISTA response:", response.data);
              if (response.data.Status == 1) {
                ticketBooked(res, strTransId, response, user);
              //   createVistaLog(
              //     strTransId,
              //     userId,
              //     "Ticket",
              //     "CommitBooking",
              //     vistaLogRequest,
              //     response.data,
              //     "Success"
              //   );
              // } else {
              //   createVistaLog(
              //     strTransId,
              //     userId,
              //     "Ticket",
              //     "CommitBooking",
              //     vistaLogRequest,
              //     response.data,
              //     "Failed"
              //   );
              }
            })
            .catch(async (error) => {
              //Handle cancellation here if error encountered
              console.error("Error in VISTA request:", error);
              // createVistaLog(
              //   strTransId,
              //   userId,
              //   "Ticket",
              //   "CommitBooking",
              //   vistaLogRequest,
              //   error.response.data,
              //   "Failed"
              // );
              ticketFailed(res, strTransId, null, user, userId, error.response);
            });
        } catch (error) {
          console.error("Error in commit booking:", error);
          return res.send("<p>" + error.message + ".</p>");
        }
      } else {
        return res.send(
          `<script>window.location.replace('${process.env.FRONTEND_BASE_URL}/confirmation-screen?transId=${strTransId}')</script>`
        );
      }
    } else {
      console.log(":Ticket Failed");
      ticketFailed(res, strTransId, null, user, userId);
    }
  } catch (error) {
    console.log(error);
  }
};
