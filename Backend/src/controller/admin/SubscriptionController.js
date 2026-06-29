import { StatusCodes } from "http-status-codes";
import Subscription from "../../models/Subscription.js";
import SubscriptionMembership from "../../models/SubscriptionMembership.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import moment from "moment-timezone";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import mongoose from "mongoose";
import SubscriptionWelcomeGift from "../../models/SubscriptionWelcomeGift.js";
import SubscriptionRequest from "../../models/SubscriptionRequest.js";
// export const addOrEditSubscription = async (req, res) => {
//   try {
//     const { id, ...subscriptionData } = req.body;
//     const exitsSubscription = await Subscription.findOne({
//       _id: id,
//       deletedStatus: 0,
//     });
//     if (exitsSubscription.title === subscriptionData.title) {
//       return res.status(409).json({
//         status: 409,
//         message: ResponseMessage.SUBSCRIPTION_TITLE_ALREADY_EXISTS,
//         data: [],
//       });
//     } else if (exitsSubscription) {
//       const findSubscription = await Subscription.findOneAndUpdate(
//         { _id: id, deletedStatus: 0 },
//         { $set: subscriptionData },
//         { new: true }
//       );

//       await findSubscription.save();
//       return res.status(200).json({
//         status: 200,
//         message: ResponseMessage.SUBSCRIPTION_UPDATED,
//         data: findSubscription,
//       });
//     } else {
//       let newSubscription = new Subscription({
//         title: subscriptionData.title,
//         price: subscriptionData.price,
//         discountOfFAndB: subscriptionData.discountOfFAndB,
//         discountOnTicket: subscriptionData.discountOnTicket,
//         freeTicket: subscriptionData.freeTicket,
//         priorityBooking: subscriptionData.priorityBooking,
//         accessToExclusiveScreening: subscriptionData.accessToExclusiveScreening,
//         guestPasses: subscriptionData.guestPasses,
//         specialEventAccess: subscriptionData.specialEventAccess,
//         earlyAccessToTickets: subscriptionData.earlyAccessToTickets,
//         support: subscriptionData.support,
//         coins: subscriptionData.coins,
//         welcomeGift:
//           subscriptionData.welcomeGift +
//           "Receive a special surprise when you join.",
//         monthlyAccess: subscriptionData.monthlyAccess,
//       });
//       await newSubscription.save();
//       return res.status(200).json({
//         status: 200,
//         message: ResponseMessage.SUBSCRIPTION_ADDED,
//         data: newSubscription,
//       });
//     }
//   } catch (error) {
//     return handleErrorResponse(res, error);
//   }
// };

export const addOrEditSubscription = async (req, res) => {
  try {
    const { id, title, status, ...subscriptionData } = req.body;
    const lowercaseTitle = title;
    // const lowercaseTitle = title.toLowerCase();
    // let finalStatus = status || "Draft";
    const existingSubscription = await Subscription.findOne({
      _id: id,
      deletedStatus: 0,
    });

    const titleExists = await Subscription.findOne({
      title: lowercaseTitle,
      deletedStatus: 0,
    });

    if (
      titleExists &&
      (!existingSubscription ||
        existingSubscription._id.toString() !== titleExists._id.toString())
    ) {
      return res.status(409).json({
        status: 409,
        message: ResponseMessage.SUBSCRIPTION_TITLE_ALREADY_EXISTS,
        data: [],
      });
    } else if (existingSubscription) {
      let updateData = {};
      // if (status === "Requested") {
      //   updateData.status = "Requested";
      // } else {
      updateData = {
        title: lowercaseTitle,
        status,
        ...subscriptionData,
      };
      // }

      const updatedSubscription = await Subscription.findOneAndUpdate(
        { _id: id, deletedStatus: 0 },
        {
          $set: updateData,
          // $set: {
          //   title: lowercaseTitle,
          //   // isActive: finalIsActive,
          //   finalStatus,
          //   ...subscriptionData,
          // },
        },
        { new: true }
      );

      await updatedSubscription.save();
      return res.status(200).json({
        status: 200,
        message: ResponseMessage.SUBSCRIPTION_UPDATED,
        data: updatedSubscription,
      });
    } else {
      let newSubscription = new Subscription({
        title: lowercaseTitle,
        // isActive: finalIsActive,
        status,
        ...subscriptionData,
      });

      await newSubscription.save();
      return res.status(200).json({
        status: 200,
        message: ResponseMessage.SUBSCRIPTION_ADDED,
        data: newSubscription,
      });
    }
  } catch (error) {
    // console.log({ error });
    return handleErrorResponse(res, error);
  }
};

export const getAllSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1});

    // console.log(subscription, "subscription");
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_LIST,
      data: subscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const getUserAllSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.find({
      deletedStatus: 0,
      isActive: true,
      isPublished: true,
    });
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_LIST,
      data: subscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const getSingleSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.query.id,
      deletedStatus: 0,
    });
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_LIST,
      data: subscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: { deletedStatus: 1 },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_DELETED,
      data: subscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const activeDeactiveSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.query.id,
      deletedStatus: 0,
    });
    if (!subscription) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.SUBSCRIPTION_NOT_FOUND,
      });
    }

    const newActiveStatus = !subscription.isActive;

    // Only check for limit if we're activating
    if (newActiveStatus) {
      const activeCount = await Subscription.countDocuments({
        deletedStatus: 0,
        isActive: true,
      });

      if (activeCount >= 3) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.SUBSCRIPTION_LIMIT_REACHED,
        });
      }
    }

    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: req.query.id },
      { $set: { isActive: newActiveStatus } },
      { new: true }
    );

    const message = newActiveStatus
      ? ResponseMessage.SUBSCRIPTION_ACTIVE_SUCCESS
      : ResponseMessage.SUBSCRIPTION_DEACTIVE_SUCCESS;

    return res.status(200).json({
      status: 200,
      message,
      data: updatedSubscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const applyForSubscription = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    let newSubscription = new Subscription({
      name,
      email,
      phone,
      message,
    });
    await newSubscription.save();
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_APPLIED,
      data: newSubscription,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

// export const getAllSubscriptionMemberShip = async (req, res) => {
//   try {
//     let findMemberShip = await SubscriptionMembership.find({
//       deletedStatus: 0,
//     })
//       .populate("subscriptionId userId")
//       .sort({ createdAt: -1 });
//     const paymentResponse = await SubscriptionTransaction.find({
//       deletedStatus: 0,
//     });

//     if (findMemberShip && findMemberShip.length > 0) {
//       const formattedMemberShip = findMemberShip.map((memberShip) => ({
//         ...memberShip._doc,
//         subscriptionStartDate: moment(memberShip.subscriptionStartDate)
//           .tz("Asia/Kolkata")
//           .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
//         subscriptionEndDate: moment(memberShip.subscriptionEndDate)
//           .tz("Asia/Kolkata")
//           .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
//       }));

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
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       data: [error.message],
//     });
//   }
// };

export const getAllSubscriptionMemberShip = async (req, res) => {
  try {
    // Fetch membership data
    let findMemberShip = await SubscriptionMembership.find({
      deletedStatus: 0,
    })
      .populate("subscriptionId userId")
      .sort({ createdAt: -1 });

    // Fetch payment data
    const paymentResponse = await SubscriptionTransaction.find({
      deletedStatus: 0,
    });
    // Create a map of payment responses by subscriptionId and userId
    const paymentMap = paymentResponse.reduce((map, payment) => {
      if (payment.subscriptionId && payment.userId) {
        const subId = payment.subscriptionId.toString();
        const userId = payment.userId.toString();
        const initTransId = payment.initTransId.toString();

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
      }
      return map;
    }, {});

    // Format membership data and attach payment information if a matching membership transaction is found
    if (findMemberShip && findMemberShip.length > 0) {
      const formattedMemberShip = findMemberShip.map((memberShip) => {
        // console.log(memberShip);

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
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
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

export const getSubscriptionTransactionHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: ResponseMessage.UNAUTHORIZED || "User not authenticated",
      });
    }

    // Pagination params with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Match filter
    const matchFilter = {
      userId: new mongoose.Types.ObjectId(req.user),
      "paymentResponse.order_status": "Success",
    };
    const transactionHistory = await SubscriptionTransaction.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: "subscriptionmemberships",
          let: { initTransId: "$initTransId", userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$initTransId", "$$initTransId"] },
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$deletedStatus", 0] },
                  ],
                },
              },
            },
            {
              $project: {
                subscriptionStartDate: 1,
                subscriptionEndDate: 1,
                subscriptionDetails: 1, // Include subscriptionDetails here
              },
            },
          ],
          as: "subscriptionPlan",
        },
      },
      {
        $addFields: {
          subscriptionStartDate: {
            $arrayElemAt: ["$subscriptionPlan.subscriptionStartDate", 0],
          },
          subscriptionEndDate: {
            $arrayElemAt: ["$subscriptionPlan.subscriptionEndDate", 0],
          },
          discountOfFAndB: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.discountOfFAndB",
              0,
            ],
          },
          discountOnTicket: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.discountOnTicket",
              0,
            ],
          },
          discountOfFAndBUpTo: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.discountOfFAndBUpTo",
              0,
            ],
          },
          discountOnTicketUpTo: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.discountOnTicketUpTo",
              0,
            ],
          },
          freeTicket: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.freeTicket",
              0,
            ],
          },
          coins: {
            $arrayElemAt: ["$subscriptionPlan.subscriptionDetails.coins", 0],
          },
          welcomeGift: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.welcomeGift",
              0,
            ],
          },
          price: {
            $arrayElemAt: ["$subscriptionPlan.subscriptionDetails.price", 0],
          },
          discountedPrice: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.discountedPrice",
              0,
            ],
          },
          isDiscounted: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.isDiscounted",
              0,
            ],
          },
          membershipDuration: {
            $arrayElemAt: [
              "$subscriptionPlan.subscriptionDetails.membershipDuration",
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscription",
        },
      },
      {
        $unwind: {
          path: "$subscription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          subscriptionId: 1,
          initTransId: 1,
          paymentResponse: 1,
          createdAt: 1,
          subscriptionStartDate: 1,
          subscriptionEndDate: 1,
          "user.name": 1,
          "user.email": 1,
          "subscription.title": 1,
          "subscription.price": 1,
          "subscription.discountOfFAndB": 1,
          "subscription.discountOnTicket": 1,
          "subscription.freeTicket": 1,
          "subscription.priorityBooking": 1,
          "subscription.accessToExclusiveScreening": 1,
          "subscription.guestPasses": 1,
          "subscription.specialEventAccess": 1,
          "subscription.earlyAccessToTickets": 1,
          "subscription.support": 1,
          "subscription.coins": 1,
          "subscription.discountedPrice": 1,
          "subscription.welcomeGift": 1,
          "subscription.isDiscounted": 1,

          welcomeGift: 1,
          discountOfFAndB: 1,
          discountOnTicket: 1,
          discountOfFAndBUpTo: 1,
          discountOnTicketUpTo: 1,
          freeTicket: 1,
          coins: 1,
          price: 1,
          discountedPrice: 1,
          isDiscounted: 1,
          membershipDuration: 1,
        },
      },
    ]);

    // Get total count separately for pagination info
    const totalCount = await SubscriptionTransaction.countDocuments(
      matchFilter
    );

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message:
        ResponseMessage.SUBSCRIPTION_TRANSACTION_HISTORY ||
        "Subscription transaction history retrieved successfully",
      data: {
        transactions: transactionHistory,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getSubscriptionWelcomeGifts = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: ResponseMessage.UNAUTHORIZED || "Admin not authenticated",
      });
    }

    let queryFilter = { deletedStatus: 0 };
    // let queryFilter = { deletedStatus: 0, status: "received" };

    const pipeline = [
      { $match: queryFilter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaId",
          foreignField: "_id",
          as: "cinema",
        },
      },
      { $unwind: { path: "$cinema", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          userDetails: {
            _id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            email: "$user.email",
            mobileNumber: "$user.mobileNumber",
          },
          cinemaDetails: {
            _id: "$cinema._id",
            cinemaId: "$cinema.cinemaId",
            cinemaName: "$cinema.cinemaName",
            poster: "$cinema.poster",
          },
        },
      },
      {
        $project: {
          userDetails: 1,
          cinemaDetails: 1,
          issueDate: 1,
          collectBeforeDate: 1,
          dateOfCollection: 1,
          status: 1,
          type: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    // Run aggregation
    const welcomeGifts = await SubscriptionWelcomeGift.aggregate(pipeline);

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.WELCOME_GIFT_FETCHED,
      data: welcomeGifts,
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const addSubscriptionRequest = async (req, res) => {
  try {
    const { id, title, ...subscriptionData } = req.body;
    const lowercaseTitle = title;
    // const lowercaseTitle = title.toLowerCase();
    const adminId = req.admin;
    const status = "Pending";
    // Remove status if it exists in subscriptionData
    if ("status" in subscriptionData) {
      delete subscriptionData.status;
    }
    const existingSubscription = await SubscriptionRequest.findOne({
      title: lowercaseTitle,
      requestedBy: adminId,
      deletedStatus: 0,
      status: "Pending",
    });
    // console.log({existingSubscription});
    if (existingSubscription) {
      return res.status(409).json({
        status: 409,
        message: ResponseMessage.SUBSCRIPTION_REQUEST_ALREADY_EXISTS,
        data: [],
      });
    }
    let newSubscriptionRequest = new SubscriptionRequest({
      title: lowercaseTitle,
      subscriptionId: id,
      status,
      // ...subscriptionData,
      price: subscriptionData.price,
      discountedPrice: subscriptionData.discountedPrice,
      isDiscounted: subscriptionData.isDiscounted,
      requestedBy: adminId,
    });
    await newSubscriptionRequest.save();
    if (subscriptionData.isPublished === true) {
      await Subscription.findByIdAndUpdate(id, {
        status: "Requested",
        // isActive: false,
      });
    }
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_REQUEST_CREATED,
      data: newSubscriptionRequest,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getAllSubscriptionRequest = async (req, res) => {
  try {
    const adminId = req.admin;
    if (!adminId) {
      return res.status(401).json({
        status: 401,
        message: ResponseMessage.UNAUTHORIZED || "Admin not authenticated",
      });
    }

    let { page = 1, limit = 10, status, search, title } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = { deletedStatus: 0 };
    // if (title && title.trim() !== "") {
    //   query.title = { $regex: title, $options: "i" };
    // }
    if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
      query.status = status;
    }

    const aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "admins",
          localField: "requestedBy",
          foreignField: "_id",
          as: "requestedBy",
        },
      },
      { $unwind: "$requestedBy" },
      {
        $lookup: {
          from: "admins",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy",
        },
      },
      { $unwind: { path: "$updatedBy", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscription",
        },
      },
      {
        $unwind: "$subscription",
      },
      {
        $project: {
          price: 1,
          discountedPrice: 1,
          isDiscounted: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          rejectionReason: 1,
          subscriptionId: "$subscription._id",
          title: "$subscription.title",
          discountOfFAndB: "$subscription.discountOfFAndB",
          discountOnTicket: "$subscription.discountOnTicket",
          discountOnEcommerce: "$subscription.discountOnEcommerce",
          discountOfFAndBUpTo: "$subscription.discountOfFAndBUpTo",
          discountOnTicketUpTo: "$subscription.discountOnTicketUpTo",
          discountOnEcommerceUpTo: "$subscription.discountOnEcommerceUpTo",
          // freeTicket: "$subscription.freeTicket",
          // priorityBooking: "$subscription.priorityBooking",
          // accessToExclusiveScreening:
          //   "$subscription.accessToExclusiveScreening",
          // guestPasses: "$subscription.guestPasses",
          // specialEventAccess: "$subscription.specialEventAccess",
          // earlyAccessToTickets: "$subscription.earlyAccessToTickets",
          // support: "$subscription.support",
          coins: "$subscription.coins",
          // subscriptionDiscountedPrice: "$subscription.discountedPrice",
          welcomeGift: "$subscription.welcomeGift",
          membershipDuration: "$subscription.membershipDuration",
          monthlyAccess: "$subscription.monthlyAccess",
          yearlyAccess: "$subscription.yearlyAccess",

          requestedBy: {
            _id: 1,
            name: 1,
            email: 1,
          },
          updatedBy: {
            _id: 1,
            name: 1,
            email: 1,
          },
          updatedOn:1
        },
      },
    ];

   if (title && title.trim() !== "") {
  const titleRegex = new RegExp(title.trim(), "i");
  aggregationPipeline.push({
    $match: {
      title: titleRegex, 
    },
  });
}

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search, "i");
      aggregationPipeline.push({
        $match: {
          $or: [
            { "requestedBy.name": searchRegex },
            // { "requestedBy.email": searchRegex },
            { title: searchRegex },
            { "updatedBy.name": searchRegex },
            // { "updatedBy.email": searchRegex },
          ],
        },
      });
    }

    const countPipeline = [...aggregationPipeline, { $count: "total" }];
    const countResult = await SubscriptionRequest.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalCount / limit);

    aggregationPipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const subscriptionRequests = await SubscriptionRequest.aggregate(
      aggregationPipeline
    );

    if (!subscriptionRequests || subscriptionRequests.length === 0) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.NO_SUBSCRIPTION_REQUESTS_FOUND,
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_REQUEST_LIST_FETCHED,
      data: subscriptionRequests,
      meta: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getSingleSubscriptionRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const aggregationPipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id), deletedStatus: 0 } },
      {
        $lookup: {
          from: "admins",
          localField: "requestedBy",
          foreignField: "_id",
          as: "requestedBy",
        },
      },
      { $unwind: "$requestedBy" },
      {
        $lookup: {
          from: "admins",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updatedBy",
        },
      },
      { $unwind: { path: "$updatedBy", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscription",
        },
      },
      { $unwind: "$subscription" },
      {
        $project: {
          price: 1,
          discountedPrice: 1,
          isDiscounted: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          rejectionReason: 1,
          updatedOn:1,
          subscriptionId: "$subscription._id",
          title: "$subscription.title",
          discountOfFAndB: "$subscription.discountOfFAndB",
          discountOnTicket: "$subscription.discountOnTicket",
          discountOnEcommerce: "$subscription.discountOnEcommerce",
          requestedBy: {
            _id: 1,
            name: 1,
            email: 1,
          },
          updatedBy: {
            _id: 1,
            name: 1,
            email: 1,
          },
        },
      },
    ];

    const result = await SubscriptionRequest.aggregate(aggregationPipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.SUBSCRIPTION_REQUEST_NOT_FOUND,
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_REQUEST_FETCHED,
      data: result[0],
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const updateSubscriptionRequestStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status, rejectionReason, subscriptionData } = req.body;
    const adminId = req.admin;
    // console.log(adminId, "adminId");
    if (!adminId) {
      return res.status(401).json({
        status: 401,
        message: ResponseMessage.UNAUTHORIZED || "Admin not authenticated",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid status. Must be 'Approved' or 'Rejected'.",
      });
    }

    if (
      status === "Rejected" &&
      (!rejectionReason || rejectionReason.trim() === "")
    ) {
      return res.status(400).json({
        status: 400,
        message: "Rejection reason is required when rejecting a request.",
      });
    }

    const subscriptionRequest = await SubscriptionRequest.findById(id);
    if (!subscriptionRequest) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.SUBSCRIPTION_REQUEST_NOT_FOUND,
        data: [],
      });
    }

    if (subscriptionRequest.status !== "Pending") {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.SUBSCRIPTION_REQUEST_ALREADY_PROCESSED,
        data: [],
      });
    }
    if (status === "Approved") {
    }
    subscriptionRequest.status = status;
    subscriptionRequest.updatedBy = adminId;
    subscriptionRequest.updatedOn = new Date();

    if (status === "Rejected") {
      subscriptionRequest.rejectionReason = rejectionReason;
      const subscription = await Subscription.findByIdAndUpdate(
        subscriptionRequest.subscriptionId,
        { $set: { status: "Rejected" } },
        { new: true }
      );
    }

    await subscriptionRequest.save();
    if (
      status === "Approved" &&
      subscriptionData &&
      Object.keys(subscriptionData).length > 0
    ) {
      // You may need to pass req/res structure or extract and pass only the required data
      try {
        const created = await updateSubscription(subscriptionData, adminId);
        if (!created) {
          return res.status(500).json({
            status: 500,
            message: "Subscription was approved, but creation failed.",
          });
        }
      } catch (err) {
        return res.status(500).json({
          status: 500,
          message: "Error while creating subscription after approval.",
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      status: 200,
      message: ResponseMessage.SUBSCRIPTION_REQUEST_STATUS_UPDATED,
      data: subscriptionRequest,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const updateSubscription = async (data, adminId) => {
  try {
    const { _id, title, subscriptionId, ...subscriptionFields } = data;
    const lowercaseTitle = title?.trim();
    // console.log({ subscriptionId, subscriptionFields });
    // const allowedFields = [
    //   "price", "discountedPrice", "discountOfFAndB", "discountOnTicket", "freeTicket",
    //   "priorityBooking", "accessToExclusiveScreening", "guestPasses", "specialEventAccess",
    //   "earlyAccessToTickets", "support", "coins", "welcomeGift",
    //   "deletedStatus", "isDiscounted", "yearlyAccess", "monthlyAccess",
    //   "discountOnEcommerce", "discountOnTicketUpTo", "discountOfFAndBUpTo", "discountOnEcommerceUpTo", "membershipDuration"
    // ];

    const existing = await Subscription.findOne({
      // title: lowercaseTitle,
      _id: subscriptionId,
      deletedStatus: 0,
    });

    if (existing) {
      // ✅ Update only allowed fields
      // allowedFields.forEach((field) => {
      //   if (subscriptionFields.hasOwnProperty(field)) {
      //     existing[field] = subscriptionFields[field];
      //   }
      // });

      // ✅ Set status/publish flag internally
      if (existing.status === "Requested") {
        existing.status = "Approved";
        existing.isPublished = true;
      }
      (existing.price = subscriptionFields.price),
        (existing.discountedPrice = subscriptionFields.discountedPrice),
        (existing.isDiscounted = subscriptionFields.isDiscounted);
      existing.updatedBy = adminId;
      existing.updatedAt = new Date();

      await existing.save();
      return true;
    }

    // ✅ Create new subscription with internal status/publish logic
    // const newSubscription = new Subscription({
    //   title: lowercaseTitle,
    //   ...Object.fromEntries(
    //     Object.entries(subscriptionFields).filter(([key]) =>
    //       allowedFields.includes(key)
    //     )
    //   ),
    //   status: "Approved",
    //   isPublished: true, // only internally set
    //   createdBy: adminId,
    //   createdAt: new Date(),
    // });

    await newSubscription.save();
    return true;
  } catch (err) {
    console.error("Error in updateSubscription:", err);
    throw new Error("Failed to create or update subscription.");
  }
};

// export const updateSubscription = async (data, adminId) => {
//   try {
//     const { _id, ...subscriptionFields } = data;
//     // console.log(_id, subscriptionFields, "subscriptionFields1213211");
//     const allowedFields = [
//       "title",
//       "price",
//       "discountedPrice",
//       "discountOfFAndB",
//       "discountOnTicket",
//       "freeTicket",
//       "priorityBooking",
//       "accessToExclusiveScreening",
//       "guestPasses",
//       "specialEventAccess",
//       "earlyAccessToTickets",
//       "support",
//       "coins",
//       "welcomeGift",
//       "isActive",
//       "deletedStatus",
//       "isDiscounted",
//       "yearlyAccess",
//     ];

//     if (_id) {
//       const existing = await Subscription.findOne({
//         title: subscriptionFields.title,
//         // title: subscriptionFields.title.toLowerCase(),
//         deletedStatus: 0,
//       });
//       if (!existing) {
//         throw new Error("Subscription not found for update.");
//       }

//       if (existing.isActive === true || existing.isActive === "true") {
//         allowedFields.forEach((field) => {
//           if (subscriptionFields.hasOwnProperty(field)) {
//             existing[field] = subscriptionFields[field];
//           }
//         });
//         const activeCount = await Subscription.countDocuments({
//           isActive: true,
//           deletedStatus: 0,
//           title: { $ne: existing.title },
//         });
//         // console.log(activeCount, "activeCount");
//         if (activeCount >= 3) {
//           // If already 3 active, set this one to inactive
//           existing.isActive = false;
//         } else {
//           // Else, set it to active
//           existing.isActive = true;
//         }
//       } else {
//         allowedFields.forEach((field) => {
//           if (subscriptionFields.hasOwnProperty(field)) {
//             existing[field] = subscriptionFields[field];
//           }
//         });
//       }

//       // if(subscriptionFields.wantToPublish===true){
//       //   existing.isPublished=true
//       // }
//       // console.log(existing, 1611655651);
//       // existing.updatedBy = adminId;
//       // existing.updatedAt = new Date();

//       await existing.save();
//       return true;
//     }
//     // else {
//     //   const newSubscriptionData = {};

//     //   allowedFields.forEach((field) => {
//     //     if (subscriptionFields.hasOwnProperty(field)) {
//     //       newSubscriptionData[field] = subscriptionFields[field];
//     //     }
//     //   });

//     //   // newSubscriptionData.createdBy = adminId;
//     //   // newSubscriptionData.createdAt = new Date();

//     //   const newSubscription = new Subscription(newSubscriptionData);
//     //   await newSubscription.save();
//     //   return true;
//     // }
//   } catch (err) {
//     console.error("Error in updateSubscription:", err);
//     throw new Error("Failed to create or update subscription.");
//   }
// };

export const getUsersSubscriptionMemberShip = async (req, res) => {
  try {
    // Fetch membership data
    let findMemberShip = await SubscriptionMembership.findOne({
      userId: req.user,
      deletedStatus: 0,
      isActive: true,
    })
      .populate({
        path: "subscriptionId",
      })
      .populate({
        path: "userId",
        select: "_id mobileNumber email",
      });

    //Membership not found
    if (!findMemberShip) {
      return res.status(404).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
        data: [],
      });
    }

    //Check membership valid or not with expire
    if (findMemberShip.subscriptionEndDate < new Date(Date.now())) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MEMBERSHIP_EXPIRE,
        data: [],
      });
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.MEMBERSHIP_FOUND,
      data: findMemberShip,
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
