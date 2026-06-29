import { StatusCodes } from "http-status-codes";
import MemberShip from "../../models/MemberShip.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import SubscriptionMembership from "../../models/SubscriptionMembership.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import moment from "moment-timezone";
import Subscription from "../../models/Subscription.js";
import SubscriptionWelcomeGift from "../../models/SubscriptionWelcomeGift.js";
import mongoose from "mongoose";
//# Add edit membership api
// export const applyMembership = async (req, res) => {
//   try {
//     const { subscriptionId, memberShipId } = req.body;

//     if (memberShipId) {
//       const findMemberShip = await MemberShip.findOne({
//         _id: memberShipId,
//         userId: req.user,
//         deletedStatus: 0,
//       });

//       if (!findMemberShip) {
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
//           data: [],
//         });
//       }

//       const updateMemberShip = await MemberShip.findOneAndUpdate(
//         { _id: findMemberShip._id, deletedStatus: 0 },
//         { $set: { subscriptionId, userId: req.user } },
//         { new: true }
//       );

//       if (!updateMemberShip) {
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.BAD_REQUEST,
//           data: [],
//         });
//       }

//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MEMBERSHIP_UPDATED,
//         data: updateMemberShip,
//       });
//     } else {
//       const addMemberShipDetails = await MemberShip.create({
//         subscriptionId,
//         userId: req.user,
//       });

//       if (!addMemberShipDetails) {
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.BAD_REQUEST,
//           data: [],
//         });
//       }

//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MEMBERSHIP_ADDED,
//         data: addMemberShipDetails,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       data: [error.message],
//     });
//   }
// };

// export const getAllSubscriptionMemberShip = async (req, res) => {
//   try {
//     let findMemberShip = await SubscriptionMembership.find({
//       deletedStatus: 0,
//     })
//       .populate("subscriptionId userId")
//       .sort({ createdAt: -1 });
//     if (findMemberShip) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MEMBERSHIP_FOUND,
//         data: findMemberShip,
//       });
//     } else {
//       return res.status(400).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: ResponseMessage.BAD_REQUEST,
//         data: [],
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       data: [error.message],
//     });
//   }
// };

// export const getMemberShipByUserId = async (req, res) => {
//   try {
//     let findMemberShip = await SubscriptionMembership.find({
//       userId: req.user,
//       deletedStatus: 0,
//     })

//       .populate({
//         path: "subscriptionId",
//         select: "title subscriptionStartDate subscriptionEndDate price",
//       })
//       .populate("userId", "name email mobileNumber");

//     if (findMemberShip) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MEMBERSHIP_FOUND,
//         data: findMemberShip,
//       });
//     } else {
//       return res.status(400).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: ResponseMessage.BAD_REQUEST,
//         data: [],
//       });
//     }
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       data: [error.message],
//     });
//   }
// };
// export const getMemberShipByUserId = async (req, res) => {
//   try {
//     let findMemberShip = await SubscriptionMembership.find({
//       userId: req.user,
//       deletedStatus: 0,
//     })
//       .populate({
//         path: "subscriptionId",
//         select: "title subscriptionStartDate subscriptionEndDate price",
//       })
//       .populate("userId", "name email mobileNumber");

//     // Fetch payment data
//     const paymentResponse = await SubscriptionTransaction.find({
//       deletedStatus: 0,
//     });

//     // Create a map of payment responses by subscriptionId
//     const paymentMap = paymentResponse.reduce((map, payment) => {
//       if (!map[payment.subscriptionId]) {
//         map[payment.subscriptionId] = [];
//       }
//       map[payment.subscriptionId].push(payment);
//       return map;
//     }, {});

//     // Attach payment information to membership data
//     if (findMemberShip && findMemberShip.length > 0) {
//       const formattedMemberShip = findMemberShip.map((memberShip) => {
//         const subscriptionId = memberShip.subscriptionId
//           ? memberShip.subscriptionId._id.toString()
//           : null;

//         const payments = subscriptionId ? paymentMap[subscriptionId] || [] : [];

//         return {
//           ...memberShip._doc,
//           subscriptionStartDate: moment(memberShip.subscriptionStartDate)
//             .tz("Asia/Kolkata")
//             .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
//           subscriptionEndDate: moment(memberShip.subscriptionEndDate)
//             .tz("Asia/Kolkata")
//             .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
//           payments: payments, // Attach the related payment transactions
//         };
//       });

//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.MEMBERSHIP_FOUND,
//         data: formattedMemberShip,
//       });
//     } else {
//       return res.status(400).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: ResponseMessage.BAD_REQUEST,
//         data: [],
//       });
//     }
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       data: [error.message],
//     });
//   }
// };

export const getMemberShipByUserId = async (req, res) => {
  try {
    // Fetch membership data for the user

    const now = moment.tz("Asia/Kolkata");
    let findMemberShip = await SubscriptionMembership.find({
      userId: req.user,
      subscriptionEndDate: { $gt: now.toDate() },
      isActive: true,
      deletedStatus: 0,
    })
      .populate({
        path: "subscriptionId",
        select: "title subscriptionStartDate subscriptionEndDate price",
      })
      .populate("userId", "name email mobileNumber")
      .sort({ createdAt: -1 });


    if (!findMemberShip) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
        data: [],
      });
    } else {
      // Fetch payment data
      const paymentResponse = await SubscriptionTransaction.find({
        userId: req.user,
        deletedStatus: 0,
      });

      // Create a map of payment responses by subscriptionId and userId
      const paymentMap = paymentResponse.reduce((map, payment) => {
        const subId = payment.subscriptionId
          ? payment.subscriptionId.toString()
          : null;
        const userId = payment.userId ? payment.userId.toString() : null;

        const initTransId = payment.initTransId.toString();

        if (subId && userId) {
          if (!map[subId]) {
            map[subId] = {};
          }
          if (!map[subId][userId]) {
            map[subId][userId] = [];
          }
          if (!map[subId][userId][initTransId]) {
            map[subId][userId][initTransId] = [];
          }

          map[subId][userId][initTransId].push(payment);
          // map[subId][userId].push(payment);
        }
        return map;
      }, {});

      // Attach payment information to membership data
      if (findMemberShip && findMemberShip.length > 0) {
        const formattedMemberShip = findMemberShip.map((memberShip) => {
          const subscriptionId = memberShip.subscriptionId
            ? memberShip.subscriptionId._id.toString()
            : null;
          const userId = memberShip.userId
            ? memberShip.userId._id.toString()
            : null;
          const initTransId = memberShip.initTransId
            ? memberShip.initTransId
            : null;
          // Check for matching payments by subscriptionId and userId
          const payments =
            subscriptionId && userId && initTransId
              ? paymentMap[subscriptionId]?.[userId]?.[initTransId] || []
              : [];

          return {
            ...memberShip._doc,
            // subscriptionStartDate: memberShip.subscriptionStartDate
            //   ? moment
            //       .utc(memberShip.subscriptionStartDate) // Convert from UTC
            //       .tz("Asia/Kolkata") // Convert to Indian time zone
            //       .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
            //   : null,
            // subscriptionEndDate: memberShip.subscriptionEndDate
            //   ? moment
            //       .utc(memberShip.subscriptionEndDate) // Convert from UTC
            //       .tz("Asia/Kolkata") // Convert to Indian time zone
            //       .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
            //   : null,
            payments: payments, // Attach the related payment transactions
          };
        });

        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MEMBERSHIP_FOUND,
          data: formattedMemberShip,
        });
      } else {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.NOT_MEMBERSHIP_PUARCHASED,
          data: [],
        });
      }
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const deleteMemberShip = async (req, res) => {
  try {
    let findMemberShip = await SubscriptionMembership.findOne({
      _id: req.query.memberShipId,
      userId: req.user,
      deletedStatus: 0,
      isActive: true,
    });

    if (findMemberShip) {
      let deleteMemberShip = await SubscriptionMembership.findOneAndUpdate(
        {
          _id: findMemberShip._id,
          userId: req.user,
          deletedStatus: 0,
        },
        {
          $set: {
            deletedStatus: 1,
          },
        },
        {
          new: true,
        }
      );
      if (deleteMemberShip) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MEMBERSHIP_DELETED,
          data: deleteMemberShip,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
export const activeDeactiveMemberShip = async (req, res) => {
  try {
    const memberShip = await MemberShip.findOne({
      userId,
      deletedStatus: 0,
    });
    if (!memberShip) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
      });
    }

    const newActiveStatus = !memberShip.isActive;

    const updatedMemberShip = await MemberShip.updateOne(
      { _id: req.query.id },
      { $set: { isActive: newActiveStatus } },
      { new: true }
    );

    const message = !newActiveStatus
      ? ResponseMessage.SUBSCRIPTION_DEACTIVE_SUCCESS
      : ResponseMessage.SUBSCRIPTION_ACTIVE_SUCCESS;
    return res.status(200).json({
      status: 200,
      message,
      data: updatedMemberShip,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getUserSubscriptionWelcomeGifts = async (req, res) => {
  try {
    const userId = req.user;
    const welcomeGifts = await SubscriptionWelcomeGift.find({
      userId: new mongoose.Types.ObjectId(userId),
      deletedStatus: 0,
    });

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.WELCOME_GIFT_FETCHED,
      data: welcomeGifts ?? [],
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const markAsReceivedSubscriptionGift = async (req, res) => {
  try {
    const userId = req.user;

    if (!req.body || !req.body?.id || !req.body?.cinemaId) {
      return res.status(200).json({
        status: StatusCodes.BAD_REQUEST,
        message: "All fields are required",
        data: [],
      });
    }

    const { id, cinemaId } = req.body;
    const findWelcomeGift = await SubscriptionWelcomeGift.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
      deletedStatus: 0,
    });

    if (!findWelcomeGift) {
      return res.status(200).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.WELCOME_GIFT_NOT_FOUND,
        data: [],
      });
    }
    if (findWelcomeGift.status === "received") {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message:ResponseMessage.WELCOME_GIFT_ALREADY_RECEIVED,
        data: [],
      });
    }
    let dateOfCollection = moment().tz("Asia/Kolkata").toDate();
    await SubscriptionWelcomeGift.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
        deletedStatus: 0,
      },
      {
        cinemaId: new mongoose.Types.ObjectId(cinemaId),
        dateOfCollection,
        status: "received",
      },
      { new: true }
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.WELCOME_GIFT_MARKED_RECEIVED,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
