import firebaseAdmin from "../config/FireBase.config.js";
import { GlobalNotification } from "../models/GlobalNotification.js";
import { Notification } from "../models/Notification.js";
import Transaction from "../models/Transaction.js";
import { User } from "../models/User.js";
import moment from "moment";
import { htmlToText } from "html-to-text";

//#region send notification
export const sendNotification = async (
  tokens,
  title,
  body,
  notificationId,
  bookingId,
  image
) => {
  if (!tokens || !tokens.length) return;

  const fcmTokens = Array.isArray(tokens) ? tokens : [tokens];
  const message = {
    notification: {
      title,
      body,
    },
    ...(image && {
      android: {
        notification: {
          imageUrl: image,
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image: image,
        },
      },
    }),
    ...((notificationId || bookingId) && {
      data: {
        date: moment().format("DD-MM-YYYY"),
        time: moment().format("HH:mm:ss"),
        ...(notificationId ? { notificationId: String(notificationId) } : {}),
        // type: "booking confirm"
        ...(bookingId ? { bookingId: String(bookingId) } : {}),
      },
    }),
    tokens: fcmTokens,
  };

  try {
    const notificationResponse = await firebaseAdmin
      .messaging()
      .sendEachForMulticast(message);
    console.log(
      `Notification sent successfully:- successCount: ${notificationResponse.successCount}, failureCount: ${notificationResponse.failureCount}`
    );
    return notificationResponse;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
//#endregion

//#region send user notification
export const userNotification = async (
  userId,
  title,
  body,
  notificationId,
  bookingId
) => {
  const userToken = await User.findById(userId);
  if (userToken.fcmToken) {
    await sendNotification(
      userToken.fcmToken,
      title,
      body,
      notificationId,
      bookingId
    );
  }
};
//#endregion

//#region send notification before 2 hr movie starts
export const reminderNotification = async () => {
  const bookingDetails = await Transaction.aggregate([
    {
      $match: {
        status: { $ne: 0 },
        deletedStatus: 0,
        paymentsStatus: true,
        commitStatus: true,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              _id: 1,
              mobileNumber: 1,
              email: 1,
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: "userData",
      },
    },
    {
      $unwind: "$userData",
    },
    // {
    //   $match: matchStage,
    // },
    {
      $lookup: {
        from: "cinemas",
        localField: "cinemaId",
        foreignField: "_id",
        as: "cinemaData",
      },
    },
    {
      $unwind: "$cinemaData",
    },
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movieData",
      },
    },
    {
      $unwind: "$movieData",
    },
    {
      $lookup: {
        from: "shows",
        localField: "showId",
        foreignField: "_id",
        as: "showData",
      },
    },
    {
      $unwind: "$showData",
    },
    {
      $project: {
        initTransId: 1,
        status: 1,
        cancellationPolicy: 1,
        paymentsStatus: 1,
        commitStatus: 1,
        deletedStatus: 1,
        refundStatus: 1,
        createdAt: 1,
        updatedAt: 1,
        paymentsBreakup: 1,
        "paymentResponse.id": 1,
        "paymentResponse.amount": 1,
        "paymentResponse.order_id": 1,
        "paymentResponse.status": 1,
        "paymentResponse.method": 1,
        "cinemaData.cinemaName": 1,
        "cinemaData.address": 1,
        "cinemaData.googleUrl": 1,
        "cinemaData.emailId": 1,
        "movieData.name": 1,
        "movieData.category": 1,
        "movieData.poster": 1,
        "showData.screenName": 1,
        "showData.sessionRealShow": 1,
        "userData._id": 1,
        "userData.email": 1,
        "userData.mobileNumber": 1,
        "userData.firstName": 1,
        "userData.lastName": 1,
        "commitBookingData.strBookId": 1,
        "commitBookingData.strSeatInfo": 1,
        fAndBDetails: true,
        "foodAndBvgResponse.curTotal": true,
        "foodAndBvgResponse.curTicketsTotal": true,
        "foodAndBvgResponse.curFoodTotal": true,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
  const bookingLength = bookingDetails.length;
  for (let i = 0; i < bookingLength; i++) {
    let booking = bookingDetails[i];
    if (booking.showData) {
      var movieTime = moment(booking.showData.sessionRealShow).utc();
      let currentTime = moment().format("YYYY-MM-DDTHH:mm");
      let twoHrNotificationTime = moment(movieTime)
        .subtract(2, "hours")
        .format("YYYY-MM-DDTHH:mm"); //for 2 hours
      let fifteenMinNotification = moment(movieTime)
        .subtract(15, "minutes")
        .format("YYYY-MM-DDTHH:mm"); // for 15 min
      let intervalNotification = moment(movieTime)
        .add(1, "hours")
        .format("YYYY-MM-DDTHH:mm"); //for interval
      const title = "Reminder notification";
      let userName;
      if (booking.userData.firstName) {
        userName = `${booking.userData.firstName} ${booking.userData.lastName}`;
      } else {
        userName = "User";
      }
      let description = "";
      if (currentTime == twoHrNotificationTime) {
        description = `Hi ${userName}, thanks for choosing Connplex, This is to remind you that your movie will start in 2 hours, Get ready for an adventure filled experience with Connplex - Smart Theatre`;
        const data = {
          userId: booking.userData._id,
          notificationType: "User",
          title: title,
          text: description,
        };
        const userNotificationData = await Notification.create(data);
        userNotification(
          booking.userData._id,
          title,
          description,
          userNotificationData._id
        );
      }
      if (currentTime == fifteenMinNotification) {
        description = `Your movie is about to start, Get ready for an adventure filled experience with Connplex - Smart Theatre and don't forget to order some foods and beverages for yourself and your loved ones to enjoy while watching your movie`;
        const data = {
          userId: booking.userData._id,
          notificationType: "User",
          title: title,
          text: description,
        };
        const userNotificationData = await Notification.create(data);
        userNotification(
          booking.userData._id,
          title,
          description,
          userNotificationData._id
        );
      }
      if (currentTime == intervalNotification) {
        description = `Hope, you're enjoying your show, It's almost break time, Order some foods and beverages for yourself and your loved ones to enjoy while watching your movie`;
        const data = {
          userId: booking.userData._id,
          notificationType: "User",
          title: title,
          text: description,
        };
        const userNotificationData = await Notification.create(data);
        userNotification(
          booking.userData._id,
          title,
          description,
          userNotificationData._id
        );
      }
    }
  }
};
//#endregion

//#region send global notification
function chunkArray(array, chunkSize = 400) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export const globalNotification = async () => {
  try {
    const globalNotifications = await GlobalNotification.aggregate([
      {
        $match: {
          isDeleted: false,
          isSend: false,
          isActive: true,
        },
      },
      {
        $addFields: {
          scheduleDateTime: {
            $dateFromString: {
              dateString: {
                $concat: ["$date", " ", "$time"],
              },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $match: {
          scheduleDateTime: { $lte: moment().toDate() },
        },
      },
    ]);

    if (!globalNotifications.length) {
      console.log("No global notification found");
      return;
    }

    for (const notification of globalNotifications) {
      let users = [];

      if (notification.cinemaIds && notification.cinemaIds.length > 0) {
        // Targeted notification
        const userIdsFromTransactions = await Transaction.find({
          cinemaId: { $in: notification.cinemaIds },
          // status: 1, // Booked
          // paymentsStatus: true,
          // commitStatus: true,
        }).distinct("userId");

        if (userIdsFromTransactions.length > 0) {
          users = await User.find({
            _id: { $in: userIdsFromTransactions },
            deletedStatus: 0,
            fcmToken: { $nin: ["", null] },
          }).select("_id fcmToken");
        }
      } else {
        // Send to all users
        users = await User.find({
          deletedStatus: 0,
          fcmToken: { $nin: ["", null] },
        }).select("_id fcmToken");
      }

      if (!users.length) {
        console.log(
          `No users found for notification ID: ${notification._id}. Skipping.`
        );
        // We can optionally mark it as 'sent' if we don't want to retry
        // await GlobalNotification.findByIdAndUpdate(notification._id, { isSend: true });
        continue; // Skip to the next notification
      }

      const fcmTokens = users.map((user) => user.fcmToken);

      if (!fcmTokens.length) {
        console.log("No fcmToken found for the targeted users");
        continue;
      }

      const plainText = htmlToText(notification.description, {
        wordwrap: false,
      });

      const data = users.map((user) => ({
        userId: user._id,
        notificationType: "User",
        title: notification.title ?? "",
        text: plainText ?? "",
      }));

      await Notification.insertMany(data);

      const image = `${process.env.AWS_IMAGE_URL}${notification.image}`;

      const tokenChunks = chunkArray(fcmTokens, 400);

      let isAnySuccess = false;

      for (const tokens of tokenChunks) {
        const notificationResponse = await sendNotification(
          tokens,
          notification.title,
          plainText,
          null,
          null,
          image
        );

        const isSuccess = notificationResponse?.responses?.some(
          (res) => res.success === true
        );

        if (isSuccess) {
          isAnySuccess = true;
        }
      }

      // ✅ Update DB only once if any send was successful
      if (isAnySuccess) {
        await GlobalNotification.findByIdAndUpdate(notification._id, {
          isSend: true,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
//#endregion
