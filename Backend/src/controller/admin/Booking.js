import dotenv from "dotenv";
dotenv.config();
import Transaction from "../../models/Transaction.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import { Admin } from "../../models/Admin.js";
import mongoose from "mongoose";
import moment from "moment";
import momentTimezone from "moment-timezone";

//#region allBookingsAdmin
// export const getAllBookingAdmin = async (req, res) => {
//   try {
//     let { currentPageNumber, search = "", limit } = req.body;
//     const parsedPageSize = parseInt(limit);
//     const parsedPageNumber = parseInt(currentPageNumber);

//     const userId = req.admin;
//     const findBooking = await Admin.findOne({ _id: userId });
//     const cinemaId = findBooking.cinemaId;

//     let splitData =
//       search && typeof search === "string" ? search.split("") : [];
//     let regex = new RegExp(splitData.join(".*."), "i");
//     let query = {
//       status: { $ne: 0 },
//       deletedStatus: 0,
//     };
//     if (cinemaId) {
//       query = {
//         status: { $ne: 0 },
//         deletedStatus: 0,
//         cinemaId: new mongoose.Types.ObjectId(cinemaId),
//       };
//     }
//     const matchStage = {};
//     if (search) {
//       matchStage["$or"] = [
//         { "commitBookingData.strBookId": regex },
//         { initTransId: regex },
//         { "paymentResponse.id": regex },
//         { "paymentResponse.order_id": regex },
//         { "userData.mobileNumber": parseInt(search) },
//         { "userData.email": regex },
//         { "userData.firstName": regex },
//         { "userData.lastName": regex },
//       ];
//     }
//     const bookingDetails = await Transaction.aggregate([
//       {
//         $match: query,
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$userId"] },
//               },
//             },
//             {
//               $project: {
//                 mobileNumber: 1,
//                 email: 1,
//                 firstName: 1,
//                 lastName: 1,
//               },
//             },
//           ],
//           as: "userData",
//         },
//       },
//       {
//         $unwind: "$userData",
//       },
//       {
//         $match: matchStage,
//       },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       {
//         $unwind: "$cinemaData",
//       },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       {
//         $unwind: "$movieData",
//       },
//       {
//         $lookup: {
//           from: "shows",
//           localField: "showId",
//           foreignField: "_id",
//           as: "showData",
//         },
//       },
//       {
//         $unwind: "$showData",
//       },
//       {
//         $project: {
//           initTransId: 1,
//           status: 1,
//           cancellationPolicy: 1,
//           paymentsStatus: 1,
//           commitStatus: 1,
//           deletedStatus: 1,
//           refundStatus: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           paymentsBreakup: 1,
//           "paymentResponse.id": "$paymentResponse.id",
//           "paymentResponse.amount": 1,
//           "paymentResponse.order_status": 1,
//           "paymentResponse.payment_mode": 1,
//           "paymentResponse.order_id": "$paymentResponse.order_id",
//           "paymentResponse.tracking_id": 1,
//           "paymentResponse.status": 1,
//           "paymentResponse.method": 1,
//           "cinemaData.cinemaName": 1,
//           "cinemaData.address": 1,
//           "cinemaData.googleUrl": 1,
//           "cinemaData.emailId": 1,
//           "movieData.name": 1,
//           "movieData.category": 1,
//           "movieData.poster": 1,
//           "showData.screenName": 1,
//           "showData.sessionRealShow": 1,
//           "userData.email": 1,
//           "userData.mobileNumber": 1,
//           "userData.firstName": 1,
//           "userData.lastName": 1,
//           "commitBookingData.strBookId": 1,
//           "commitBookingData.strSeatInfo": 1,
//           addSeatData: 1,
//           fAndBDetails: true,
//           "foodAndBvgResponse.curTotal": true,
//           "foodAndBvgResponse.curTicketsTotal": true,
//           "foodAndBvgResponse.curFoodTotal": true,
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $skip: parsedPageSize * parsedPageNumber,
//       },
//       {
//         $limit: parsedPageSize, // Parse limit to ensure it's a number
//       },
//     ]);

//     const count = await Transaction.aggregate([
//       {
//         $match: query,
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "userData",
//         },
//       },
//       {
//         $unwind: "$userData",
//       },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       {
//         $unwind: "$movieData",
//       },
//       {
//         $match: matchStage,
//       },
//       {
//         $count: "total",
//       },
//     ]);

//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.BOOKING_DETAILS,
//       data: bookingDetails,
//       count: count.length > 0 ? count[0].total : 0,
//     });
//   } catch (error) {
//     console.log(error, ":error");
//     return handleErrorResponse(res, error);
//   }
// };
//#endregion
// export const getAllBookingAdmin = async (req, res) => {
//   try {
//     const userId = req.admin;
//     const findBooking = await Admin.findOne({ _id: userId });
//     const cinemaId = findBooking.cinemaId;

//     let query = {
//       // status: { $ne: 0 },
//       deletedStatus: 0,
//     };
//     if (cinemaId) {
//       query = {
//         status: { $ne: 0 },
//         deletedStatus: 0,
//         cinemaId: new mongoose.Types.ObjectId(cinemaId),
//       };
//     }

//     let pipeline = [
//       {
//         $match: query,
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $eq: ["$_id", "$$userId"] },
//               },
//             },
//             {
//               $project: {
//                 mobileNumber: 1,
//                 email: 1,
//                 firstName: 1,
//                 lastName: 1,
//               },
//             },
//           ],
//           as: "userData",
//         },
//       },
//       {
//         $unwind: "$userData",
//       },
//       {
//         $addFields: {
//           couponIdArray: {
//             $cond: {
//               if: {
//                 $and: [
//                   { $isArray: "$couponId" },
//                   { $gt: [{ $size: "$couponId" }, 0] },
//                 ],
//               },
//               then: "$couponId",
//               else: [],
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "AppliedCouponData",
//           let: { couponIds: "$couponIdArray" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ["$_id", "$$couponIds"] },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 couponCategory: 1,
//                 couponId: 1,
//                 couponTitle: 1,
//                 couponUpTo: 1,
//                 discount: 1,
//                 discountType: 1,
//                 couponType: 1,
//               },
//             },
//           ],
//           as: "AppliedCouponData",
//         },
//       },
//       // {
//       //   $unwind: {
//       //     path: "$couponData",
//       //     preserveNullAndEmptyArrays: true, // This allows documents without matching coupon data to pass through
//       //   },
//       // },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       {
//         $unwind: "$cinemaData",
//       },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       {
//         $unwind: "$movieData",
//       },
//       {
//         $lookup: {
//           from: "shows",
//           localField: "showId",
//           foreignField: "_id",
//           as: "showData",
//         },
//       },
//       {
//         $unwind: "$showData",
//       },

//       {
//         $project: {
//           initTransId: 1,
//           status: 1,
//           cancellationPolicy: 1,
//           paymentsStatus: 1,
//           commitStatus: 1,
//           deletedStatus: 1,
//           refundStatus: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           paymentsBreakup: 1,
//           couponData: 1,
//           "paymentResponse.id": "$paymentResponse.id",
//           "paymentResponse.amount": 1,
//           "paymentResponse.order_status": 1,
//           "paymentResponse.payment_mode": 1,
//           "paymentResponse.order_id": "$paymentResponse.order_id",
//           "paymentResponse.tracking_id": 1,
//           "paymentResponse.status": 1,
//           "paymentResponse.method": 1,
//           "cinemaData.cinemaName": 1,
//           "cinemaData.address": 1,
//           "cinemaData.googleUrl": 1,
//           "cinemaData.emailId": 1,
//           "movieData.name": 1,
//           "movieData.category": 1,
//           "movieData.poster": 1,
//           "showData.screenName": 1,
//           "showData.sessionRealShow": 1,
//           "userData.email": 1,
//           "userData.mobileNumber": 1,
//           "userData.firstName": 1,
//           "userData.lastName": 1,
//           "commitBookingData.strBookId": 1,
//           "commitBookingData.strSeatInfo": 1,
//           addSeatData: 1,
//           fAndBDetails: true,
//           "foodAndBvgResponse.curTotal": true,
//           "foodAndBvgResponse.curTicketsTotal": true,
//           "foodAndBvgResponse.curFoodTotal": true,
//         },
//       },
//     ];

//     const bookingDetails = await Transaction.aggregate(pipeline);
//     // console.log(bookingDetails, "341");
//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.BOOKING_DETAILS,
//       data: bookingDetails.reverse(),
//     });
//   } catch (error) {
//     console.log(error, ":error");
//     return handleErrorResponse(res, error);
//   }
// };
//#endregion
export const getAllBookingAdmin = async (req, res) => {
  try {
    let {
      page = 1,
      search = "",
      limit = 10,
      startDate,
      endDate,
      cinemaId,
      movieId,
      paymentStatus,
      bookingStatus,
      showAbortedTransaction,
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    if (limit <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid limit value. It should be a positive integer.",
      });
    }

    const query = {
      deletedStatus: 0,
      cinemaId: { $exists: true, $ne: null },
      movieId: { $exists: true, $ne: null },
    };

    if (showAbortedTransaction === "No") {
      query.status = { $ne: 0 };
    }

    if (cinemaId && mongoose.Types.ObjectId.isValid(cinemaId)) {
      query.cinemaId = new mongoose.Types.ObjectId(cinemaId);
    }
    const timezone = "Asia/Kolkata";

    if (startDate && endDate) {
      console.log("Old Date&Time", {
        startDate: moment(startDate, "YYYY-MM-DD").startOf("day").toDate(),
        endDate: moment(endDate, "YYYY-MM-DD").endOf("day").toDate(),
      });

      query.createdAt = {
        $gte: momentTimezone
          .tz(startDate, "YYYY-MM-DD", timezone)
          .startOf("day")
          .toDate(),
        $lte: momentTimezone
          .tz(endDate, "YYYY-MM-DD", timezone)
          .endOf("day")
          .toDate(),
      };
    } else {
      query.createdAt = {
        $gte: momentTimezone
          .tz(timezone)
          .subtract(2, "days")
          .startOf("day")
          .toDate(),
        $lte: momentTimezone.tz(timezone).endOf("day").toDate(),
      };
    }

    // Apply payment status filter if provided
    // if (paymentStatus) {
    //   if (paymentStatus === "Shipped") {
    //     query.paymentsStatus = true;
    //     // query.status = { $ne: 0 };
    //     query.status = 1;
    //     query["setSeatData.strBookId"] = { $ne: null };
    //   } else if (paymentStatus === "Unsuccessfull") {
    //     query.status = 5;
    //     query.paymentsStatus = false;
    //     // query.status = { $in: [4,5] };
    //   } else if (paymentStatus === "Aborted") {
    //     query.status = 0;
    //   }
    // }

    // // Apply booking status filter if provided
    // if (bookingStatus) {
    //   if (bookingStatus === "Shipped") {
    //     query.status = 1;
    //     query.commitStatus = true;
    //     query["setSeatData.strBookId"] = { $ne: null };
    //   } else if (bookingStatus === "Unsuccessfull") {
    //     query.status = 4;
    //     query.commitStatus = false;
    //     // query.$and = [{ status: 4 } , { commitStatus: false }];
    //   } else if (bookingStatus === "Aborted") {
    //     query.status = 0;
    //   }
    // }

    // ✅ Step 1: Only date filter applied
    // if (!paymentStatus && !bookingStatus) {
    //   query.status = { $ne: 0 };
    // }

    // // ✅ Step 2: Date + Payment Status = Shipped
    // else if (paymentStatus === "Shipped" && !bookingStatus) {
    //   query.status = 1;
    //   query.paymentsStatus = true;
    // }

    // // ✅ Step 3: Date + Payment = Shipped + Booking = Unsuccessfull
    // else if (paymentStatus === "Shipped" && bookingStatus === "Unsuccessfull") {
    //   query.status = 4;
    //   query.paymentsStatus = true;
    //   query.$or = [
    //     { commitStatus: false },
    //     { commitStatus: { $exists: false } },
    //   ];
    // }

    // // ✅ Handle other cases
    // else {
    //   if (
    //     paymentStatus === "Unsuccessfull" &&
    //     bookingStatus === "Unsuccessfull"
    //   ) {

    //     console.log("Both Unsuccessfull");

    //     query.paymentsStatus = false;
    //     query.$or = [
    //       { commitStatus: false },
    //       { commitStatus: { $exists: false } },
    //     ];
    //   }

    //   if (paymentStatus === "Unsuccessfull") {
    //     query.status = 5;
    //     query.paymentsStatus = false;
    //   }

    //   if (bookingStatus === "Unsuccessfull") {
    //     // query.status = 4;
    //     query.paymentsStatus = true;
    //     query.commitStatus = false;
    //   }

    //   if (bookingStatus === "Shipped") {
    //     query.status = 1;
    //     query.commitStatus = true;
    //     query["setSeatData.strBookId"] = { $ne: null };
    //   }
    // }

    if (paymentStatus === "Shipped" && bookingStatus === "Shipped") {
      query.paymentsStatus = true;
      query.commitStatus = true;
      query["commitBookingData.strBookId"] = { $exists: true, $ne: "" };
    } else if (
      paymentStatus === "Shipped" &&
      bookingStatus === "Unsuccessfull"
    ) {
      query.paymentsStatus = true;
      query.commitStatus = { $ne: true };
    } else if (
      paymentStatus === "Unsuccessfull" &&
      bookingStatus === "Unsuccessfull"
    ) {
      query.$and = [
        { paymentsStatus: { $ne: true } },
        { commitStatus: { $ne: true } },
      ];
    } else if (paymentStatus === "Unsuccessfull") {
      query.paymentsStatus = { $ne: true };
    } else if (bookingStatus === "Unsuccessfull") {
      query.paymentsStatus = true;
      query.commitStatus = { $ne: true };
    }

    // Construct search regex
    // let regex = new RegExp(search, "i");
    const searchConditions = [];
    if (search) {
      const regex = new RegExp(search, "i");
      searchConditions.push(
        { "commitBookingData.strBookId": regex },
        { initTransId: regex },
        { "paymentResponse.tracking_id": regex },
        { "paymentResponse.amount": regex },
        { "paymentResponse.order_id": regex },
        { "userData.email": regex },
        { "userData.firstName": regex },
        { "userData.lastName": regex },
        { "cinemaData.cinemaName": regex },
        { "cinemaData.address": regex },
        { "movieData.name": regex }
      );

      if (!isNaN(Number(search))) {
        searchConditions.push({ "userData.mobileNumber": Number(search) });
      }
    }

    // Build the aggregation pipeline

    console.log(query, "Final Query");
    const aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                email: 1,
                firstName: 1,
                lastName: 1,
                mobileNumber: 1,
              },
            },
          ],
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                cinemaName: 1,
                address: 1,
                googleUrl: 1,
                emailId: 1,
              },
            },
          ],
          as: "cinemaData",
        },
      },
      { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                category: 1,
                poster: 1,
                uniqueFilmCode: 1,
              },
            },
          ],
          as: "movieData",
        },
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
      ...(movieId && mongoose.Types.ObjectId.isValid(movieId)
        ? [{ $match: { movieId: new mongoose.Types.ObjectId(movieId) } }]
        : []),
      {
        $lookup: {
          from: "shows",
          localField: "showId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                screenName: 1,
                sessionRealShow: 1,
              },
            },
          ],
          as: "showData",
        },
      },
      { $unwind: { path: "$showData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          couponIdArray: {
            $cond: {
              if: {
                $and: [
                  { $isArray: "$couponId" },
                  { $gt: [{ $size: "$couponId" }, 0] },
                ],
              },
              then: "$couponId",
              else: [],
            },
          },
        },
      },
      {
  $lookup: {
    from: "rewards",
    let: { transactionId: "$_id" },
    pipeline: [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$transactionId", "$$transactionId"] },
              { $eq: ["$type", "earned"] }
            ]
          }
        }
      },
      {
        $project: {
          type: 1,
          coins: 1,
          lastName: 1,
          isExpired: 1,
          expiryDate: 1
        }
      }
    ],
    as: "rewardData"
  }
      },
     { $unwind: { path: "$rewardData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "appliedcoupons",
          let: { couponIds: "$couponIdArray" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$couponIds"] } } },
            {
              $project: {
                _id: 1,
                couponCategory: 1,
                couponId: 1,
                couponTitle: 1,
                couponUpTo: 1,
                discount: 1,
                discountType: 1,
                couponType: 1,
              },
            },
          ],
          as: "couponData",
        },
      },
      ...(searchConditions.length > 0
        ? [{ $match: { $or: searchConditions } }]
        : []),
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                initTransId: 1,
                bookedFrom: 1,
                status: 1,
                cancellationPolicy: 1,
                paymentsStatus: 1,
                commitStatus: 1,
                deletedStatus: 1,
                refundStatus: 1,
                createdAt: 1,
                updatedAt: 1,
                paymentsBreakup: 1,
                couponData: 1,
                finalBookingCalculation: 1,
                rewardData: 1,
                "paymentResponse.id": 1,
                "paymentResponse.amount": 1,
                "paymentResponse.order_status": 1,
                "paymentResponse.payment_mode": 1,
                "paymentResponse.order_id": 1,
                "paymentResponse.tracking_id": 1,
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
                "userData.email": 1,
                "userData.mobileNumber": 1,
                "userData.firstName": 1,
                "userData.lastName": 1,
                "commitBookingData.strBookId": 1,
                "commitBookingData.strSeatInfo": 1,
                "addSeatData.strBookId": 1,
                "addSeatData.curTotal": 1,
                "addSeatData.curTicketsTotal": 1,
                "addSeatData.strSeatInfo": 1,
                fAndBDetails: 1,
                "foodAndBvgResponse.curTotal": 1,
                "foodAndBvgResponse.curTicketsTotal": 1,
                "foodAndBvgResponse.curFoodTotal": 1,
                "setSeatData.strSeatInfo": 1,
                logs: 1,
              },
            },
          ],
        },
      },
    ];

    const results = await Transaction.aggregate(
      aggregationPipeline
    ).allowDiskUse(true);

    const totalCount = results[0].totalCount[0]?.count || 0;
    const bookingDetails = results[0].data;
    BookingDetailsExportCsv(bookingDetails);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BOOKING_DETAILS,
      totalCount,
      data: bookingDetails,
    });
  } catch (error) {
    console.error(error, ":error");
    return handleErrorResponse(res, error);
  }
};

export const getAllFailedBooking = async (req, res) => {
  try {
    let {
      page = 1,
      search = "",
      limit = 10,
      startDate,
      endDate,
      cinemaId,
      movieId,
      paymentStatus,
      bookingStatus,
    } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    if (limit <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid limit value. It should be a positive integer.",
      });
    }

    // Base Query
    let query = {
      deletedStatus: 0,
      // status: { $in: [4, 5] },
      paymentsStatus: true,
      $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
    };

    // Payment Filters
    // if (paymentStatus && paymentStatus !== "All") {
    //   query.paymentsStatus = paymentStatus === "Shipped";
    // }

    // // Booking Filters
    // if (bookingStatus && bookingStatus !== "All") {
    //   query.commitStatus = bookingStatus === "Shipped";
    // }

    // If no payment filter => failed logic
    // if (!paymentStatus || paymentStatus === "All") {
    //   query.$or = [{}];
    // }

    // Cinema Filter
    if (cinemaId && mongoose.Types.ObjectId.isValid(cinemaId)) {
      query.cinemaId = new mongoose.Types.ObjectId(cinemaId);
    }

    // Date Filter
    if (startDate && endDate) {
      const timezone = "Asia/Kolkata";

      query.createdAt = {
        $gte: momentTimezone
          .tz(startDate, "YYYY-MM-DD", timezone)
          .startOf("day")
          .toDate(),
        $lte: momentTimezone
          .tz(endDate, "YYYY-MM-DD", timezone)
          .endOf("day")
          .toDate(),
      };
    }

    // Search conditions
    const searchConditions = [];
    if (search) {
      const regex = new RegExp(search, "i");
      searchConditions.push(
        { "addSeatData.strBookId": regex },
        { initTransId: regex },
        { "paymentResponse.tracking_id": regex },
        { "paymentResponse.order_id": regex },
        { "userData.email": regex },
        { "userData.firstName": regex },
        { "userData.lastName": regex },
        { "cinemaData.cinemaName": regex },
        { "movieData.name": regex }
      );
      if (!isNaN(Number(search))) {
        searchConditions.push({ "userData.mobileNumber": Number(search) });
      }
    }

    // --------------------------------------------------
    //             AGGREGATION PIPELINE
    // --------------------------------------------------

    const aggregationPipeline = [
      { $match: query },

      // ⭐ Add string version of initTransId
      {
        $addFields: {
          initTransIdStr: { $toString: "$initTransId" },
        },
      },

      // User
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
          pipeline: [
            {
              $project: {
                email: 1,
                firstName: 1,
                lastName: 1,
                mobileNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },

      // Cinema
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaId",
          foreignField: "_id",
          as: "cinemaData",
          pipeline: [
            {
              $project: { cinemaName: 1, address: 1, googleUrl: 1, emailId: 1 },
            },
          ],
        },
      },
      { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },

      // Movie
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movieData",
          pipeline: [
            {
              $project: { name: 1, poster: 1, category: 1, uniqueFilmCode: 1 },
            },
          ],
        },
      },
      { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },

      // ⭐ Logs Lookup — fully fixed
      {
        $lookup: {
          from: "universallogs", // ⚠ Ensure correct collection name
          localField: "initTransId",
          foreignField: "transaction_id",
          as: "logsArray",
          pipeline: [
            {
              $project: {
                _id: 0,
                steps: 1,
                transaction_id: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },

      // Movie Filter
      ...(movieId ? [{ $match: { "movieData.uniqueFilmCode": movieId } }] : []),

      // Search Filter
      ...(searchConditions.length > 0
        ? [{ $match: { $or: searchConditions } }]
        : []),

      // Pagination
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ];

    const results = await Transaction.aggregate(
      aggregationPipeline
    ).allowDiskUse(true);

    return res.status(200).json({
      status: 200,
      message: "All Failed Booking Records",
      totalCount: results[0]?.totalCount[0]?.count || 0,
      data: results[0].data,
    });
  } catch (error) {
    console.error("Failed Booking Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// export const getAllBookingAdmin = async (req, res) => {
//   try {
//     let {
//       currentPageNumber,
//       search = "",
//       limit,
//       startDate,
//       endDate,
//       cinemaId,
//       paymentStatus,
//       bookingStatus,
//     } = req.body;
//     currentPageNumber = parseInt(currentPageNumber);
//     limit = parseInt(limit);

//     if (limit <= 0) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: "Invalid limit value. It should be a positive integer.",
//       });
//     }

//     let query = { status: { $ne: 0 }, deletedStatus: 0};

//     // Get only selected cinema transactions if cinemaId is provied
//     if (cinemaId) {
//       query.cinemaId = new mongoose.Types.ObjectId(cinemaId)
//     }

//     // Apply date filter if provided
//     if (startDate && endDate) {
//       query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }

//     // Apply payment status filter if provided
//     if (paymentStatus) {
//       if (paymentStatus == "Shipped") {
//         query.paymentsStatus = true; // Ensure status is compared as a string
//         query["setSeatData.strBookId"] = { $ne: null }; // Ensure status is compared as a string
//       }
//       if (paymentStatus == "Unsuccessfull") {
//         query.paymentsStatus = false;
//       }
//       if (paymentStatus == "Aborted") {
//         query.status = 0;
//       }
//     }

//     // Apply booking status filter if provided
//     if (bookingStatus) {
//       if (bookingStatus == "Shipped") {
//         query.status = 1; // Ensure status is compared as a string
//         query.commitStatus = true; // Ensure status is compared as a string
//         query["setSeatData.strBookId"] = { $ne: null }; // Ensure status is compared as a string
//       }
//       if (bookingStatus == "Unsuccessfull") {
//         query.commitStatus = false;
//       }
//       if (bookingStatus == "Aborted") {
//         query.status = 0;
//       }
//     }

//     // Construct search regex
//     // let regex = new RegExp(search.split("").join(".*."), "i");
//     let regex = new RegExp(search, "i");
//     // console.log(regex);
//     // Pipeline for counting total documents
//     const countPipeline = [
//       { $match: query },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "userData",
//         },
//       },
//       { $unwind: "$userData" },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: "$cinemaData" },
//       // { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           $or: [
//             { "addSeatData.strBookId": regex },
//             { initTransId: regex },
//             { "paymentResponse.id": regex },
//             { "paymentResponse.amount": regex },
//             { "paymentResponse.order_id": regex },
//             { "userData.mobileNumber": parseInt(search) },
//             { "userData.email": regex },
//             { "userData.firstName": regex },
//             { "userData.lastName": regex },
//             { "cinemaData.cinemaName": regex },
//           ],
//         },
//       },
//       { $count: "totalCount" },
//     ];

//     // Execute count pipeline
//     const countResults = await Transaction.aggregate(
//       countPipeline
//     ).allowDiskUse(true);
//     const totalCount = countResults.length > 0 ? countResults[0].totalCount : 0;

//     // Pipeline for fetching paginated results
//     const dataPipeline = [
//       { $match: query },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "userData",
//         },
//       },
//       { $unwind: "$userData" },
//       // { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
//       {
//         $addFields: {
//           couponIdArray: {
//             $cond: {
//               if: {
//                 $and: [
//                   { $isArray: "$couponId" },
//                   { $gt: [{ $size: "$couponId" }, 0] },
//                 ],
//               },
//               then: "$couponId",
//               else: [],
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "appliedcoupons",
//           let: { couponIds: "$couponIdArray" },
//           pipeline: [
//             { $match: { $expr: { $in: ["$_id", "$$couponIds"] } } },
//             {
//               $project: {
//                 _id: 1,
//                 couponCategory: 1,
//                 couponId: 1,
//                 couponTitle: 1,
//                 couponUpTo: 1,
//                 discount: 1,
//                 discountType: 1,
//                 couponType: 1,
//               },
//             },
//           ],
//           as: "couponData",
//         },
//       },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: "$cinemaData" },
//       // { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: "$movieData" },
//       // { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "shows",
//           localField: "showId",
//           foreignField: "_id",
//           as: "showData",
//         },
//       },
//       { $unwind: "$showData" },
//       // { $unwind: { path: "$showData", preserveNullAndEmptyArrays: true } },
//       {
//         $match: {
//           $or: [
//             { "addSeatData.strBookId": regex },
//             { initTransId: regex },
//             { "paymentResponse.id": regex },
//             { "paymentResponse.amount": regex },
//             { "paymentResponse.order_id": regex },
//             { "userData.mobileNumber": parseInt(search) },
//             { "userData.email": regex },
//             { "userData.firstName": regex },
//             { "userData.lastName": regex },
//             { "cinemaData.cinemaName": regex },
//           ],
//         },
//       },
//       // {
//       //   $facet: {
//       //     paginatedResults: [
//       //       { $skip: (currentPageNumber - 1) * limit },
//       //       { $limit: limit },
//       //     ],
//       //     totalCount: [{ $count: "count" }],
//       //   },
//       // },
//       // {
//       //   $unwind: "$totalCount",
//       // },
//       {
//         $project: {
//           // paginatedResults : 1,
//           // totalCount: 1,
//           initTransId: 1,
//           status: 1,
//           cancellationPolicy: 1,
//           paymentsStatus: 1,
//           commitStatus: 1,
//           deletedStatus: 1,
//           refundStatus: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           paymentsBreakup: 1,
//           couponData: 1,
//           finalBookingCalculation: 1,
//           "paymentResponse.id": 1,
//           "paymentResponse.amount": 1,
//           "paymentResponse.order_status": 1,
//           "paymentResponse.payment_mode": 1,
//           "paymentResponse.order_id": 1,
//           "paymentResponse.tracking_id": 1,
//           "paymentResponse.status": 1,
//           "paymentResponse.method": 1,
//           "cinemaData.cinemaName": 1,
//           "cinemaData.address": 1,
//           "cinemaData.googleUrl": 1,
//           "cinemaData.emailId": 1,
//           "movieData.name": 1,
//           "movieData.category": 1,
//           "movieData.poster": 1,
//           "showData.screenName": 1,
//           "showData.sessionRealShow": 1,
//           "userData.email": 1,
//           "userData.mobileNumber": 1,
//           "userData.firstName": 1,
//           "userData.lastName": 1,
//           "commitBookingData.strBookId": 1,
//           "commitBookingData.strSeatInfo": 1,
//           "addSeatData.strBookId": 1,
//           "addSeatData.curTotal": 1,
//           "addSeatData.curTicketsTotal": 1,
//           "addSeatData.strSeatInfo": 1,
//           fAndBDetails: 1,
//           "foodAndBvgResponse.curTotal": 1,
//           "foodAndBvgResponse.curTicketsTotal": 1,
//           "foodAndBvgResponse.curFoodTotal": 1,
//           "setSeatData.strSeatInfo":1,
//           logs:1
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: (currentPageNumber - 1) * limit },
//       { $limit: limit },
//     ];

//     const bookingDetails = await Transaction.aggregate(
//       dataPipeline
//     ).allowDiskUse(true);
//     BookingDetailsExportCsv(bookingDetails);

//     console.log(bookingDetails , ":bookingDetails")

//     return res.status(StatusCodes.OK).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.BOOKING_DETAILS,
//       totalCount: totalCount,
//       data: bookingDetails,
//     });
//   } catch (error) {
//     console.log(error , ":error")
//     return handleErrorResponse(res, error);
//   }
// };
const BookingDetailsExportCsv = async function (csvData) {
  try {
    let csvContent =
      "Cinema_Name, User_Details, Email,mobileNumber,Order_Id,Booking_Id,Amount,Payment_Status,Booking Status,Date \n";
    csvData.map((data) => {
      csvContent += `${data.cinemaData?.cinemaName},${
        data.userData?.firstName + " " + data?.userData?.lastName
      } ,${data.userData?.email},${data.userData?.mobileNumber},${
        data?.paymentResponse?.order_id
      },${data.addSeatData?.strBookId},${data?.paymentResponse?.amount},${
        data.paymentResponse?.order_status
      },${data.createdAt}
      },\n`;
    });

    return csvContent;
  } catch (error) {
    console.error(error);
    return "";
  }
};
