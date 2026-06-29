import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import FranchiseLead from "../../models/FranchiseLead.js";
import GroupBooking from "../../models/GroupBooking.js";
import Influencer from "../../models/Influencer.js";
import Transaction from "../../models/Transaction.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { User } from "../../models/User.js";
import TwentyMinFranchiseLead from "../../models/TwentyMinuteFranchiseLead.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import Role from "../../models/Role.js";
import { Admin } from "../../models/Admin.js";
import momentTimezone from "moment-timezone";
import { Region } from "../../models/Region.js";
import Cinema from "../../models/Cinema.js";
import Movie from "../../models/Movies.js";
import Show from "../../models/Shows.js";
import moment from "moment/moment.js";

const dashboardCardPermissions = [
  "total_revenue_dashboard_card_view",
  "ecommerce_revenue_dashboard_card_view",
  "ticket_revenue_dashboard_card_view",
  "ticket_transactions_dashboard_card_view",
  "membership_transactions_dashboard_card_view",
  "top_locations_dashboard_card_view",
  "movie_dashboard_card_view",
  "app_downloads_dashboard_card_view",
  "top_selling_products_dashboard_card_view",
  "admit_count_dashboard_card_view",
  // "admin_count_dashboard_card_view",
  "user_count_dashboard_card_view",
  "membership_dashboard_card_view",
  "brand_influencer_dashboard_card_view",
  "group_booking_dashboard_card_view",
  "franchise_dashboard_card_view",
  "twentymin_franchise_dashboard_card_view",
  "food_beverages_dashboard_card_view",
  "ecommerce_orders_dashboard_card_view",
];

const getStartEndByPeriod = (period) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "yesterday":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        23,
        59,
        59,
        999
      );
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      break;
    case "year":
      // Financial year: April 1 to today
      start =
        now.getMonth() >= 3
          ? new Date(now.getFullYear(), 3, 1)
          : new Date(now.getFullYear() - 1, 3, 1);
      end = new Date(now);
      break;
    default:
      throw new Error("Invalid period");
  }

  return { start, end };
};

const getStartAndEndDate = (filter, timezone = "Asia/Kolkata") => {
  let start, end;
  const { year, month, startDate = null, endDate = null } = filter;
  if (startDate && endDate) {
    // Custom start/end date range
    start = momentTimezone
      .tz(startDate, "YYYY-MM-DD", timezone)
      .startOf("day")
      .toDate();
    end = momentTimezone
      .tz(endDate, "YYYY-MM-DD", timezone)
      .endOf("day")
      .toDate();
  } else if (year && (month || month === 0)) {
    // Month is provided (0-indexed)
    start = momentTimezone
      .tz({ year: month < 3 ? year + 1 : year, month }, timezone)
      .startOf("month")
      .startOf("day")
      .toDate();
    end = momentTimezone
      .tz({ year: month < 3 ? year + 1 : year, month }, timezone)
      .endOf("month")
      .endOf("day")
      .toDate();
  } else {
    // Financial Year
    start = momentTimezone
      .tz({ year, month: 3 }, timezone)
      .startOf("month")
      .startOf("day")
      .toDate();
    end = momentTimezone
      .tz({ year: year + 1, month: 2 }, timezone)
      .endOf("month")
      .endOf("day")
      .toDate();
  }
  return { start, end };
};

export const fetchDashboardData = async (req, res) => {
  try {
    const roleId = req.adminRole;
    const adminType = req.adminType;
    const { filter = {} } = req.body;
    const { start, end } = getStartAndEndDate(filter);

    const role = await Role.findOne({
      _id: roleId,
      deleteStatus: 0,
    }).select({ permissions: true });

    const permissions = role?.permissions || [];
    const allowed =
      adminType === "Admin"
        ? new Set(dashboardCardPermissions)
        : new Set(
            permissions.filter((p) => p.endsWith("_dashboard_card_view"))
          );

    const promises = {};

    // Users
    if (allowed.has("user_count_dashboard_card_view")) {
      promises.totalUsers = User.countDocuments({
        deletedStatus: 0,
        isAccountVerified: 1,
        createdAt: { $gte: start, $lte: end },
      });
    }
    // Admits
    if (allowed.has("admit_count_dashboard_card_view")) {
      promises.totalAdmits = Transaction.aggregate([
        {
          $match: {
            deletedStatus: 0,
            paymentsStatus: true,
            paymentResponse: { $ne: null },
            createdAt: { $gte: start, $lte: end },
            "setSeatData.strSeatInfo": { $type: "string", $ne: "" },
          },
        },
        {
          $project: {
            seatString: "$setSeatData.strSeatInfo",
          },
        },
        {
          $addFields: {
            seatList: {
              $cond: [
                { $regexMatch: { input: "$seatString", regex: / - / } },
                {
                  $split: [
                    { $arrayElemAt: [{ $split: ["$seatString", " - "] }, 1] },
                    ", ",
                  ],
                },
                [],
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAdmits: { $sum: { $size: "$seatList" } },
          },
        },
      ]);
    }
    //  app downloads
    if (allowed.has("app_downloads_dashboard_card_view")) {
      promises.appDownloadStats = User.aggregate([
        {
          $match: {
            deletedStatus: 0,
            isAccountVerified: 1,
            createdAt: { $gte: start, $lte: end },
            registeredFrom: { $in: ["android", "ios", "web"] }, // Skip null/undefined/other
          },
        },
        {
          $group: {
            _id: "$registeredFrom",
            count: { $sum: 1 },
          },
        },
      ]);
    }
    // Franchise
    if (allowed.has("franchise_dashboard_card_view")) {
      promises.totalFranchise = FranchiseLead.countDocuments({
        createdAt: { $gte: start, $lte: end },
      });
    }

    // 20 Min Franchise
    if (allowed.has("twentymin_franchise_dashboard_card_view")) {
      promises.totalTwentyMinFranchise = TwentyMinFranchiseLead.countDocuments({
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Group Booking
    if (allowed.has("group_booking_dashboard_card_view")) {
      promises.totalGroupBooking = GroupBooking.countDocuments({
        deletedStatus: 0,
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Brand Influencer
    if (allowed.has("brand_influencer_dashboard_card_view")) {
      promises.totalBrandInfluencer = Influencer.countDocuments({
        deletedStatus: 0,
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Memberships
    if (allowed.has("membership_dashboard_card_view")) {
      promises.totalMemberships = SubscriptionTransaction.countDocuments({
        deletedStatus: 0,
        paymentsStatus: true,
        paymentResponse: { $ne: null },
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Ticket Revenue
    if (
      allowed.has("ticket_revenue_dashboard_card_view") ||
      allowed.has("total_revenue_dashboard_card_view")
    ) {
      promises.ticketRevenueResult = Transaction.aggregate([
        {
          $match: {
            deletedStatus: 0,
            paymentsStatus: true,
            commitStatus: true,
            "commitBookingData.strBookId": { $exists: true, $ne: "" },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $toDouble: "$finalBookingCalculation.finalAmount" },
            },
          },
        },
      ]);
    }

    // Ticket Success/Failed Transactions Count
    if (allowed.has("ticket_transactions_dashboard_card_view")) {
      promises.ticketSuccessCount = Transaction.countDocuments({
        deletedStatus: 0,
        paymentsStatus: true,
        commitStatus: true,
        "commitBookingData.strBookId": { $exists: true, $ne: "" },
        createdAt: { $gte: start, $lte: end },
      });

      promises.ticketFailedCount = Transaction.countDocuments({
        deletedStatus: 0,
        paymentsStatus: true, // payment done
        $or: [{ commitStatus: false }, { commitStatus: { $exists: false } }],
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Membership Success/Failed Transactions Count
    if (allowed.has("membership_transactions_dashboard_card_view")) {
      promises.membershipSuccessCount = SubscriptionTransaction.countDocuments({
        deletedStatus: 0,
        status: 1,
        paymentsStatus: true,
        paymentResponse: { $ne: null },
        createdAt: { $gte: start, $lte: end },
      });
      promises.membershipFailedCount = SubscriptionTransaction.countDocuments({
        deletedStatus: 0,
        status: 5,
        paymentsStatus: false,
        createdAt: { $gte: start, $lte: end },
      });
    }

    // Top Cinemas
    if (allowed.has("top_locations_dashboard_card_view")) {
      promises.topCinemas = Transaction.aggregate([
        {
          $match: {
            deletedStatus: 0,
            paymentsStatus: true,
            paymentResponse: { $ne: null },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$cinemaId",
            bookingCount: { $sum: 1 },
          },
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: "cinemas",
            localField: "_id",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $project: {
            _id: 0,
            cinemaName: "$cinema.cinemaName",
            bookingCount: 1,
          },
        },
      ]);
    }

    // Top Movie
    if (allowed.has("movie_dashboard_card_view")) {
      promises.topMovies = Transaction.aggregate([
        {
          $match: {
            deletedStatus: 0,
            paymentsStatus: true,
            paymentResponse: { $ne: null },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $group: {
            _id: { $substr: ["$movie.filmCode", 4, -1] },
            movieName: { $first: "$movie.name" },
            bookingCount: { $sum: 1 },
          },
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 3 },
        {
          $project: {
            _id: 0,
            movieName: 1,
            bookingCount: 1,
          },
        },
      ]);
    }

    // Food and Beverages
    if (allowed.has("food_beverages_dashboard_card_view")) {
      promises.topFoodAndBeveragesCinemas = Transaction.aggregate([
        {
          $match: {
            deletedStatus: 0,
            paymentsStatus: true,
            paymentResponse: { $ne: null },
            commitStatus: true,
            commitBookingData: { $ne: null },
            "foodAndBvgResponse.curFoodTotal": { $gt: 0 },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$cinemaId",
            bookingCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "cinemas",
            localField: "_id",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $project: {
            _id: 0,
            cinemaId: "$_id",
            cinemaName: "$cinema.cinemaName",
            bookingCount: 1,
          },
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 3 },
      ]);
    }

    const results = await Promise.all(Object.values(promises));
    const responseData = {};
    Object.keys(promises).forEach((key, index) => {
      if (key === 'totalAdmits') {
        responseData.totalAdmits = results[index][0]?.totalAdmits || 0;
      } else if (key === 'appDownloadStats') {
        const downloadCounts = {
          android: 0,
          ios: 0,
          web: 0,
        };
        results[index].forEach(({ _id, count }) => {
          if (downloadCounts.hasOwnProperty(_id)) {
            downloadCounts[_id] = count;
          }
        });
        responseData.totalAppDownloadsByPlatform = downloadCounts;
      } else if (key === 'ticketRevenueResult') {
        responseData.totalTicketsRevenue = results[index][0]?.total || 0;
      } else if (key === 'ticketSuccessCount') {
        responseData.totalTicketSuccessTransactions = results[index];
      } else if (key === 'ticketFailedCount') {
        responseData.totalTicketFailedTransactions = results[index];
      } else if (key === 'membershipSuccessCount') {
        responseData.totalMembershipSuccessTransactions = results[index] || 0;
      } else if (key === 'membershipFailedCount') {
        responseData.totalMembershipFailedTransactions = results[index] || 0;
      }
      else {
        responseData[key] = results[index];
      }
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.USER_FATCHED,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return handleErrorResponse(res, error);
  }
};

// export const fetchDashboardData = async (req, res) => {
//   try {
//     const roleId = req.adminRole;
//     const adminType = req.adminType;
//     const { filter = {} } = req.body;
//     const { start, end } = getStartAndEndDate(filter);

//     const role = await Role.findOne({
//       _id: roleId,
//       deleteStatus: 0,
//     }).select({ permissions: true });

//     const permissions = role?.permissions || [];
//     const allowed =
//       adminType === "Admin"
//         ? new Set(dashboardCardPermissions)
//         : new Set(
//             permissions.filter((p) => p.endsWith("_dashboard_card_view"))
//           );

//     let responseData = {};

//     /* ========================= USERS ========================= */
//     if (allowed.has("user_count_dashboard_card_view")) {
//       responseData.totalUsers = await User.countDocuments({
//         deletedStatus: 0,
//         isAccountVerified: 1,
//         createdAt: { $gte: start, $lte: end },
//       });
//     }

//     /* ========================= ADMITS ========================= */
//     if (allowed.has("admit_count_dashboard_card_view")) {
//       const admitsResult = await Transaction.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             paymentsStatus: true,
//             commitStatus: true,
//             "commitBookingData.strSeatInfo": { $type: "string", $ne: "" },
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $project: {
//             seatString: "$commitBookingData.strSeatInfo",
//           },
//         },
//         {
//           $addFields: {
//             seatList: {
//               $cond: [
//                 { $regexMatch: { input: "$seatString", regex: / - / } },
//                 {
//                   $split: [
//                     { $arrayElemAt: [{ $split: ["$seatString", " - "] }, 1] },
//                     ", ",
//                   ],
//                 },
//                 [],
//               ],
//             },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalAdmits: { $sum: { $size: "$seatList" } },
//           },
//         },
//       ]);

//       responseData.totalAdmits = admitsResult[0]?.totalAdmits || 0;
//     }

//     /* ========================= APP DOWNLOADS ========================= */
//     if (allowed.has("app_downloads_dashboard_card_view")) {
//       const appDownloadStats = await User.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             isAccountVerified: 1,
//             registeredFrom: { $in: ["android", "ios", "web"] },
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $group: {
//             _id: "$registeredFrom",
//             count: { $sum: 1 },
//           },
//         },
//       ]);

//       const downloadCounts = { android: 0, ios: 0, web: 0 };
//       appDownloadStats.forEach(({ _id, count }) => {
//         downloadCounts[_id] = count;
//       });

//       responseData.totalAppDownloadsByPlatform = downloadCounts;
//     }

//     console.log(allowed)

//     /* ========================= MEMBERSHIPS ========================= */
//     if (allowed.has("membership_dashboard_card_view")) {
//       responseData.totalMemberships =
//         await SubscriptionTransaction.countDocuments({
//           deletedStatus: 0,
//           paymentsStatus: true,
//           paymentResponse: { $ne: null },
//           createdAt: { $gte: start, $lte: end },
//         });
//     }

//     /* ========================= TICKET REVENUE ========================= */
//     if (
//       allowed.has("ticket_revenue_dashboard_card_view") ||
//       allowed.has("total_revenue_dashboard_card_view")
//     ) {
//       const revenueResult = await Transaction.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             paymentsStatus: true,
//             commitStatus: true,
//             "commitBookingData.strBookId": { $exists: true, $ne: "" },
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             totalRevenue: {
//               $sum: { $toDouble: "$paymentResponse.amount" },
//             },
//           },
//         },
//       ]);

//       responseData.totalTicketsRevenue =
//         revenueResult[0]?.totalRevenue || 0;
//     }

//     /* ========================= TICKET TRANSACTIONS ========================= */
//     if (allowed.has("ticket_transactions_dashboard_card_view")) {
//       const [successCount, failedCount] = await Promise.all([
//         // ✅ SUCCESS
//         Transaction.countDocuments({
//           deletedStatus: 0,
//           paymentsStatus: true,
//           commitStatus: true,
//           "commitBookingData.strBookId": { $exists: true, $ne: "" },
//           createdAt: { $gte: start, $lte: end },
//         }),

//         // ❌ FAILED (Payment success but booking not committed)
//         Transaction.countDocuments({
//           deletedStatus: 0,
//           paymentsStatus: true,
//           commitStatus: { $ne: true },
//           createdAt: { $gte: start, $lte: end },
//         }),
//       ]);

//       responseData.totalTicketSuccessTransactions = successCount;
//       responseData.totalTicketFailedTransactions = failedCount;
//     }

//     /* ========================= TOP CINEMAS ========================= */
//     if (allowed.has("top_locations_dashboard_card_view")) {
//       responseData.topCinemas = await Transaction.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             paymentsStatus: true,
//             commitStatus: true,
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $group: {
//             _id: "$cinemaId",
//             bookingCount: { $sum: 1 },
//           },
//         },
//         { $sort: { bookingCount: -1 } },
//         { $limit: 3 },
//         {
//           $lookup: {
//             from: "cinemas",
//             localField: "_id",
//             foreignField: "_id",
//             as: "cinema",
//           },
//         },
//         { $unwind: "$cinema" },
//         {
//           $project: {
//             _id: 0,
//             cinemaName: "$cinema.cinemaName",
//             bookingCount: 1,
//           },
//         },
//       ]);
//     }

//     /* ========================= TOP MOVIES ========================= */
//     if (allowed.has("movie_dashboard_card_view")) {
//       responseData.topMovies = await Transaction.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             paymentsStatus: true,
//             commitStatus: true,
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $lookup: {
//             from: "movies",
//             localField: "movieId",
//             foreignField: "_id",
//             as: "movie",
//           },
//         },
//         { $unwind: "$movie" },
//         {
//           $group: {
//             _id: "$movie._id",
//             movieName: { $first: "$movie.name" },
//             bookingCount: { $sum: 1 },
//           },
//         },
//         { $sort: { bookingCount: -1 } },
//         { $limit: 3 },
//         {
//           $project: {
//             _id: 0,
//             movieName: 1,
//             bookingCount: 1,
//           },
//         },
//       ]);
//     }

//     /* ========================= FOOD & BEVERAGES ========================= */
//     if (allowed.has("food_beverages_dashboard_card_view")) {
//       responseData.topFoodAndBeveragesCinemas = await Transaction.aggregate([
//         {
//           $match: {
//             deletedStatus: 0,
//             paymentsStatus: true,
//             commitStatus: true,
//             "foodAndBvgResponse.curFoodTotal": { $gt: 0 },
//             createdAt: { $gte: start, $lte: end },
//           },
//         },
//         {
//           $group: {
//             _id: "$cinemaId",
//             bookingCount: { $sum: 1 },
//           },
//         },
//         {
//           $lookup: {
//             from: "cinemas",
//             localField: "_id",
//             foreignField: "_id",
//             as: "cinema",
//           },
//         },
//         { $unwind: "$cinema" },
//         {
//           $project: {
//             _id: 0,
//             cinemaName: "$cinema.cinemaName",
//             bookingCount: 1,
//           },
//         },
//         { $sort: { bookingCount: -1 } },
//         { $limit: 3 },
//       ]);
//     }

//     return res.status(StatusCodes.OK).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.USER_FATCHED,
//       data: responseData,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     return handleErrorResponse(res, error);
//   }
// };

// 1. Dashboard Counts - Optimized lightweight API for stats cards
export const fetchOverviewCounts = async (req, res) => {
  try {
    const todayStart = moment().utcOffset("+05:30").startOf("day").toDate();
    const todayEnd = moment().utcOffset("+05:30").endOf("day").toDate();
    const currentTime = moment().utcOffset("+05:30").toDate();
    const NextExtendedDaysForShows = parseInt(process.env.NEXT_EXTENDED_DAYS_FOR_SHOWS) || 10;
    const next7Days = moment().utcOffset("+05:30").add(NextExtendedDaysForShows, "days").endOf("day").toDate();

    // Run all simple counts in parallel - no nested lookups
    const [
      totalRegions,
      totalCinemas,
      totalShows,
      todayShows,
      upcomingMovies,
      nowPlayingMoviesResult,
    ] = await Promise.all([
      // Region count
      Region.countDocuments({ deletedStatus: 0, isActive: true }),
      // Cinema count
      Cinema.countDocuments({ deletedStatus: 0, isActive: true }),
      // Total shows - use aggregation with match first for better index usage
      Show.countDocuments({
        deletedStatus: 0,
        isActive: true,
        screenStatus: { $ne: "C" },
        sessionRealShow: { $gte: currentTime, $lte: next7Days },
      }),
      // Today's shows
      Show.countDocuments({
        deletedStatus: 0,
        isActive: true,
        screenStatus: { $ne: "C" },
        sessionRealShow: { $gte: todayStart, $lte: todayEnd },
      }),
      // Upcoming movies count
      Movie.countDocuments({ deletedStatus: 0, isActive: true, status: 2 }),
      // Now playing movies with active shows - optimized approach
      // First get unique film codes from active shows, then count matching movies
      Show.aggregate([
        {
          $match: {
            deletedStatus: 0,
            isActive: true,
            screenStatus: { $ne: "C" },
            sessionRealShow: { $gte: currentTime, $lte: next7Days },
          },
        },
        {
          $group: {
            _id: "$filmCode",
          },
        },
      ]),
    ]);

    // Get unique film codes that have active shows
    const activeFilmCodes = nowPlayingMoviesResult.map((item) => item._id).filter(Boolean);

    // Count movies with those film codes (much faster than nested lookup)
    let nowPlayingCount = 0;
    if (activeFilmCodes.length > 0) {
      const moviesWithShows = await Movie.aggregate([
        {
          $match: {
            deletedStatus: 0,
            isActive: true,
            status: 1,
            filmCode: { $in: activeFilmCodes },
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$uniqueFilmCode", "$filmCode"] },
          },
        },
        { $count: "count" },
      ]);
      nowPlayingCount = moviesWithShows[0]?.count || 0;
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Counts fetched successfully",
      data: {
        totalRegions,
        totalCinemas,
        nowPlayingMovies: nowPlayingCount,
        upcomingMovies,
        totalShows,
        todayShows,
      },
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    return handleErrorResponse(res, error);
  }
};

// 2. Region-wise Data - Optimized with parallel queries
export const fetchRegionWiseData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run all queries in parallel for better performance
    const [regions, cinemaCounts, showCounts, movieCounts] = await Promise.all([
      // 1. Get all regions
      Region.find({ deletedStatus: 0 })
        .select("_id region image isActive")
        .sort({ region: 1 })
        .lean(),

      // 2. Get cinema counts grouped by region
      Cinema.aggregate([
        { $match: { deletedStatus: 0, isActive: true } },
        { $group: { _id: "$regionId", count: { $sum: 1 } } },
      ]),

      // 3. Get show counts grouped by region (via cinema)
      Show.aggregate([
        {
          $match: {
            deletedStatus: 0,
            isActive: true,
            screenStatus: { $ne: "C" },
            sessionRealShow: { $gte: today },
          },
        },
        {
          $lookup: {
            from: "cinemas",
            localField: "cinemaObjectId",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $match: {
            "cinema.isActive": true,
            "cinema.deletedStatus": 0,
          },
        },
        { $group: { _id: "$cinema.regionId", count: { $sum: 1 } } },
      ]),

      // 4. Get unique now playing movies with active shows, grouped by region
      Show.aggregate([
        {
          $match: {
            deletedStatus: 0,
            isActive: true,
            screenStatus: { $ne: "C" },
            sessionRealShow: { $gte: today },
          },
        },
        {
          $lookup: {
            from: "cinemas",
            localField: "cinemaObjectId",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $match: {
            "cinema.isActive": true,
            "cinema.deletedStatus": 0,
          },
        },
        {
          $lookup: {
            from: "movies",
            localField: "filmObjectId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $match: {
            "movie.deletedStatus": 0,
            "movie.isActive": true,
            "movie.status": 1, // Now Playing only
          },
        },
        {
          $group: {
            _id: {
              regionId: "$cinema.regionId",
              filmCode: { $ifNull: ["$movie.uniqueFilmCode", "$movie.filmCode"] },
            },
          },
        },
        {
          $group: {
            _id: "$_id.regionId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Create lookup maps for O(1) access
    const cinemaCountMap = new Map(cinemaCounts.map((c) => [c._id?.toString(), c.count]));
    const showCountMap = new Map(showCounts.map((s) => [s._id?.toString(), s.count]));
    const movieCountMap = new Map(movieCounts.map((m) => [m._id?.toString(), m.count]));

    // Merge data
    const regionWiseData = regions.map((region) => ({
      _id: region._id,
      region: region.region,
      image: region.image,
      isActive: region.isActive,
      cinemaCount: cinemaCountMap.get(region._id.toString()) || 0,
      showCount: showCountMap.get(region._id.toString()) || 0,
      movieCount: movieCountMap.get(region._id.toString()) || 0,
    }));

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Region-wise data fetched successfully",
      data: regionWiseData,
    });
  } catch (error) {
    console.error("Error fetching region-wise data:", error);
    return handleErrorResponse(res, error);
  }
};

// 3. Cinemas List with counts - Optimized with parallel queries
export const fetchCinemasList = async (req, res) => {
  try {
    const { regionId } = req.query;
    const currentTime = moment().utcOffset("+05:30").toDate();
    const NextExtendedDaysForShows = parseInt(process.env.NEXT_EXTENDED_DAYS_FOR_SHOWS) || 10;
    const next7Days = moment().utcOffset("+05:30").add(NextExtendedDaysForShows, "days").endOf("day").toDate();

    const cinemaMatchQuery = { deletedStatus: 0, isActive: true };
    if (regionId) {
      cinemaMatchQuery.regionId = new mongoose.Types.ObjectId(regionId);
    }

    // Build show match query for the region filter
    const showMatchQuery = {
      deletedStatus: 0,
      isActive: true,
      screenStatus: { $ne: "C" },
      sessionRealShow: { $gte: currentTime, $lte: next7Days },
    };

    // Run all queries in parallel
    const [cinemas, regions, showCounts, movieCounts] = await Promise.all([
      // 1. Get cinemas
      Cinema.find(cinemaMatchQuery)
        .select("_id cinemaName address poster regionId lastSync lastSyncStatus")
        .sort({ cinemaName: 1 })
        .lean(),

      // 2. Get regions for mapping
      Region.find({ deletedStatus: 0 }).select("_id region").lean(),

      // 3. Get show counts grouped by cinema
      Show.aggregate([
        { $match: showMatchQuery },
        {
          $lookup: {
            from: "cinemas",
            localField: "cinemaObjectId",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $match: {
            "cinema.isActive": true,
            "cinema.deletedStatus": 0,
            ...(regionId ? { "cinema.regionId": new mongoose.Types.ObjectId(regionId) } : {}),
          },
        },
        { $group: { _id: "$cinemaObjectId", count: { $sum: 1 } } },
      ]),

      // 4. Get unique movie counts per cinema (movies with active shows)
      Show.aggregate([
        { $match: showMatchQuery },
        {
          $lookup: {
            from: "cinemas",
            localField: "cinemaObjectId",
            foreignField: "_id",
            as: "cinema",
          },
        },
        { $unwind: "$cinema" },
        {
          $match: {
            "cinema.isActive": true,
            "cinema.deletedStatus": 0,
            ...(regionId ? { "cinema.regionId": new mongoose.Types.ObjectId(regionId) } : {}),
          },
        },
        {
          $lookup: {
            from: "movies",
            localField: "filmObjectId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $match: {
            "movie.deletedStatus": 0,
            "movie.isActive": true,
            "movie.status": 1,
          },
        },
        {
          $group: {
            _id: {
              cinemaId: "$cinemaObjectId",
              filmCode: { $ifNull: ["$movie.uniqueFilmCode", "$movie.filmCode"] },
            },
          },
        },
        {
          $group: {
            _id: "$_id.cinemaId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Create lookup maps
    const regionMap = new Map(regions.map((r) => [r._id.toString(), r.region]));
    const showCountMap = new Map(showCounts.map((s) => [s._id.toString(), s.count]));
    const movieCountMap = new Map(movieCounts.map((m) => [m._id.toString(), m.count]));

    // Merge data
    const cinemasList = cinemas.map((cinema) => ({
      _id: cinema._id,
      cinemaName: cinema.cinemaName,
      address: cinema.address,
      poster: cinema.poster,
      regionId: cinema.regionId,
      regionName: regionMap.get(cinema.regionId?.toString()) || null,
      showCount: showCountMap.get(cinema._id.toString()) || 0,
      movieCount: movieCountMap.get(cinema._id.toString()) || 0,
      lastSync: cinema.lastSync,
      lastSyncStatus: cinema.lastSyncStatus,
    }));

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cinemas list fetched successfully",
      data: cinemasList,
    });
  } catch (error) {
    console.error("Error fetching cinemas list:", error);
    return handleErrorResponse(res, error);
  }
};

// 4. Get specific cinema's movies and shows (on-demand)
export const fetchCinemaDetails = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const currentTime = moment().utcOffset("+05:30").toDate();
    const NextExtendedDaysForShows = parseInt(process.env.NEXT_EXTENDED_DAYS_FOR_SHOWS) || 10;
    const next7Days = moment().utcOffset("+05:30").add(NextExtendedDaysForShows, "days").endOf("day").toDate();

    // Get cinema info
    const cinema = await Cinema.findById(cinemaId)
      .populate("regionId", "region")
      .select("cinemaName address poster regionId lastSync lastSyncStatus");

    if (!cinema) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Cinema not found",
      });
    }

    // Get Now Playing movies (status: 1) for this cinema with their active shows
    // Using same filtering as cinema cards for consistent counts
    const movies = await Movie.aggregate([
      {
        $match: {
          cinemaObjectId: new mongoose.Types.ObjectId(cinemaId),
          deletedStatus: 0,
          isActive: true,
          status: 1, // Now Playing only - same as cinema cards
        },
      },
      {
        $lookup: {
          from: "shows",
          let: { filmCode: "$filmCode" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$cinemaObjectId", new mongoose.Types.ObjectId(cinemaId)] },
                    { $eq: ["$filmCode", "$$filmCode"] },
                  ],
                },
                deletedStatus: 0,
                isActive: true,
                screenStatus: { $ne: "C" }, // Exclude cancelled shows
                sessionRealShow: { $gte: currentTime, $lte: next7Days },
              },
            },
            {
              $project: {
                _id: 1,
                sessionId: 1,
                screenName: 1,
                screenNumber: 1,
                sessionRealShow: 1,
                sessionSeatsAvail: 1,
                sessionSeatsTotal: 1,
              },
            },
            { $sort: { sessionRealShow: 1 } },
          ],
          as: "shows",
        },
      },
      {
        $match: {
          shows: { $ne: [] }, // Only movies with active shows
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          poster: 1,
          censorRating: 1,
          duration: 1,
          languages: 1,
          movieCategory: 1,
          movieType: 1,
          filmCode: 1,
          uniqueFilmCode: 1,
          status: 1,
          showCount: { $size: "$shows" },
          shows: 1,
        },
      },
      { $sort: { showCount: -1, name: 1 } },
    ]);

    // Filter movies with poster for display
    const filteredMovies = movies.filter((m) => m?.poster);

    // Calculate totals - same logic as cinema cards
    const totalShows = filteredMovies.reduce((sum, m) => sum + m.showCount, 0);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cinema details fetched successfully",
      data: {
        cinema: {
          _id: cinema._id,
          cinemaName: cinema.cinemaName,
          address: cinema.address,
          poster: cinema.poster,
          regionName: cinema.regionId?.region,
          lastSync: cinema.lastSync,
          lastSyncStatus: cinema.lastSyncStatus,
        },
        movies: filteredMovies,
        totalMovies: filteredMovies.length, // Count of Now Playing movies with active shows
        totalShows: totalShows, // Count of active shows
      },
    });
  } catch (error) {
    console.error("Error fetching cinema details:", error);
    return handleErrorResponse(res, error);
  }
};

// 5. Get specific movie's shows across all cinemas (on-demand)
export const fetchMovieShows = async (req, res) => {
  try {
    const { movieId } = req.params;
    const currentTime = moment().utcOffset("+05:30").toDate();
    const NextExtendedDaysForShows = parseInt(process.env.NEXT_EXTENDED_DAYS_FOR_SHOWS) || 10;
    const next7Days = moment().utcOffset("+05:30").add(NextExtendedDaysForShows, "days").endOf("day").toDate();

    // Get movie info
    const movie = await Movie.findById(movieId).select(
      "name poster censorRating duration languages movieCategory movieType filmCode uniqueFilmCode status cinemaObjectId"
    );

    if (!movie) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Movie not found",
      });
    }

    const filmCodeToMatch = movie.uniqueFilmCode || movie.filmCode;
    const baseFilmCode = filmCodeToMatch?.substring(4) || filmCodeToMatch;

    // Find ALL movie records with the same uniqueFilmCode across all cinemas
    // This ensures we get shows from all cinemas for this movie
    const allMovieRecords = await Movie.find({
      deletedStatus: 0,
      isActive: true,
      $or: [
        { uniqueFilmCode: filmCodeToMatch },
        { filmCode: filmCodeToMatch },
        { uniqueFilmCode: { $regex: new RegExp(baseFilmCode + "$", "i") } },
        { filmCode: { $regex: new RegExp(baseFilmCode + "$", "i") } },
      ],
    }).select("_id filmCode uniqueFilmCode");

    // Get all movie IDs and film codes for matching shows
    const allMovieIds = allMovieRecords.map((m) => m._id);
    const allFilmCodes = [...new Set(allMovieRecords.map((m) => m.filmCode).filter(Boolean))];

    // Get all shows for this movie grouped by cinema
    // Match by filmObjectId OR filmCode for comprehensive coverage
    const showsByCinema = await Show.aggregate([
      {
        $match: {
          deletedStatus: 0,
          isActive: true,
          screenStatus: { $ne: "C" }, // Exclude cancelled shows
          sessionRealShow: {
            $gte: currentTime,
            $lte: next7Days,
          },
          $or: [
            { filmObjectId: { $in: allMovieIds } },
            { filmCode: { $in: allFilmCodes } },
            { filmCode: filmCodeToMatch },
            { filmCode: { $regex: new RegExp(baseFilmCode + "$", "i") } },
          ],
        },
      },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinema",
        },
      },
      { $unwind: { path: "$cinema", preserveNullAndEmptyArrays: true } },
      // Only include shows from active cinemas
      {
        $match: {
          "cinema.isActive": true,
          "cinema.deletedStatus": 0,
        },
      },
      {
        $lookup: {
          from: "regions",
          localField: "cinema.regionId",
          foreignField: "_id",
          as: "region",
        },
      },
      { $unwind: { path: "$region", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$cinemaObjectId",
          cinemaName: { $first: "$cinema.cinemaName" },
          cinemaAddress: { $first: "$cinema.address" },
          regionName: { $first: "$region.region" },
          shows: {
            $push: {
              _id: "$_id",
              sessionId: "$sessionId",
              screenName: "$screenName",
              screenNumber: "$screenNumber",
              sessionRealShow: "$sessionRealShow",
              sessionSeatsAvail: "$sessionSeatsAvail",
              sessionSeatsTotal: "$sessionSeatsTotal",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          cinemaName: 1,
          cinemaAddress: 1,
          regionName: 1,
          showCount: { $size: "$shows" },
          shows: { $slice: ["$shows", 20] },
        },
      },
      { $sort: { showCount: -1, cinemaName: 1 } },
    ]);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Movie shows fetched successfully",
      data: {
        movie: {
          _id: movie._id,
          name: movie.name,
          poster: movie.poster,
          censorRating: movie.censorRating,
          duration: movie.duration,
          languages: movie.languages,
          movieCategory: movie.movieCategory,
          movieType: movie.movieType,
          status: movie.status,
        },
        showsByCinema,
        totalCinemas: showsByCinema.length,
        totalShows: showsByCinema.reduce((sum, c) => sum + c.showCount, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching movie shows:", error);
    return handleErrorResponse(res, error);
  }
};

// 6. Now Playing Movies list with show counts (status: 1)
export const fetchNowPlayingMovies = async (req, res) => {
  try {
    const { regionId, limit = 50 } = req.query;
    const currentTime = moment().utcOffset("+05:30").toDate();

    // Next 7 days for shows
    const next7Days = new Date();
    next7Days.setUTCHours(23, 59, 59, 999);
    next7Days.setUTCDate(next7Days.getUTCDate() + 7);

    // Build region filter if provided
    let regionMatch = {
      "cinemaObject.isActive": true,
      "cinemaObject.deletedStatus": 0,
    };
    if (regionId) {
      regionMatch["cinemaObject.regionId"] = new mongoose.Types.ObjectId(regionId);
    }

    // Fetch now playing movies (status: 1) with active cinemas only
    const moviesDetails = await Movie.aggregate([
      {
        $match: {
          status: 1, // Now Playing
          deletedStatus: 0,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinemaObject",
        },
      },
      { $unwind: "$cinemaObject" },
      // Filter only movies from active cinemas
      { $match: regionMatch },
      {
        $project: {
          cinemaObjectId: {
            _id: "$cinemaObject._id",
            regionId: "$cinemaObject.regionId",
            cinemaName: "$cinemaObject.cinemaName",
            isActive: "$cinemaObject.isActive",
          },
          movieCategory: 1,
          name: 1,
          category: 1,
          youtubeVideoUrl: 1,
          poster: 1,
          filmCode: 1,
          duration: 1,
          languages: 1,
          censorRating: 1,
          rating: 1,
          likes: 1,
          averageRating: 1,
          totalLikes: 1,
          filmOpeningDate: 1,
          uniqueFilmCode: 1,
          movieType: 1,
          status: 1,
        },
      },
      { $sort: { filmOpeningDate: -1 } },
    ]);

    // Get movie IDs and count shows within next 7 days
    // Only count shows from active cinemas with proper status checks
    const movieIds = moviesDetails.map((movie) => movie._id);
    const showTimingCounts = await Show.aggregate([
      {
        $match: {
          filmObjectId: { $in: movieIds },
          sessionRealShow: {
            $gte: currentTime,
            $lte: next7Days,
          },
          deletedStatus: 0,
          isActive: true,
          screenStatus: { $ne: "C" }, // Exclude cancelled shows
        },
      },
      // Join with cinema to verify it's active
      {
        $lookup: {
          from: "cinemas",
          localField: "cinemaObjectId",
          foreignField: "_id",
          as: "cinema",
        },
      },
      { $unwind: "$cinema" },
      // Only count shows from active cinemas
      {
        $match: {
          "cinema.isActive": true,
          "cinema.deletedStatus": 0,
        },
      },
      {
        $group: {
          _id: "$filmObjectId",
          count: { $sum: 1 },
        },
      },
    ]);

    const showTimingCountMap = new Map();
    showTimingCounts.forEach((count) => {
      showTimingCountMap.set(count._id.toString(), count.count);
    });

    // Filter movies that have shows
    const filteredMoviesArray = moviesDetails
      .filter((movie) => {
        const showTimingCount = showTimingCountMap.get(movie._id.toString());
        return showTimingCount > 0;
      })
      .map((movie) => ({
        ...movie,
        showCount: showTimingCountMap.get(movie._id.toString()) || 0,
        totalLikes: movie.totalLikes > 0 ? movie.totalLikes : movie.likes,
      }));

    // Remove duplicates based on uniqueFilmCode and aggregate show counts
    const uniqueFilmCodesMap = new Map();
    filteredMoviesArray.forEach((movie) => {
      const code = movie.uniqueFilmCode || movie.filmCode;
      if (uniqueFilmCodesMap.has(code)) {
        // Aggregate show count for duplicate movies
        const existing = uniqueFilmCodesMap.get(code);
        existing.showCount += movie.showCount;
      } else {
        uniqueFilmCodesMap.set(code, { ...movie });
      }
    });

    const uniqueFilteredMovies = Array.from(uniqueFilmCodesMap.values())
      .filter((movie) => movie !== null && movie.showCount > 0)
      .slice(0, parseInt(limit));

    // Sort by show count and film opening date
    uniqueFilteredMovies.sort((a, b) => {
      if (b.showCount !== a.showCount) {
        return b.showCount - a.showCount;
      }
      if (b.filmOpeningDate !== a.filmOpeningDate) {
        return new Date(b.filmOpeningDate) - new Date(a.filmOpeningDate);
      }
      return a.name.localeCompare(b.name);
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Now playing movies fetched successfully",
      data: uniqueFilteredMovies,
    });
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return handleErrorResponse(res, error);
  }
};

// 7. Upcoming Movies grouped by month (status: 2)
export const fetchUpcomingMovies = async (req, res) => {
  try {
    const currentTime = moment().utcOffset("+05:30").toDate();

    const upcomingMoviesDetails = await Movie.find(
      {
        status: 2, // Upcoming
        deletedStatus: 0,
        isActive: true,
        filmOpeningDate: { $gt: currentTime },
      },
      {
        cinemaId: true,
        cinemaObjectId: true,
        filmCode: true,
        name: true,
        poster: true,
        languages: true,
        createdAt: true,
        updatedAt: true,
        filmOpeningDate: true,
        youtubeVideoUrl: true,
        starCast: true,
        category: true,
        movieCategory: true,
        movieType: true,
        censorRating: true,
        duration: true,
        uniqueFilmCode: true,
      }
    )
      .populate("cinemaObjectId", "regionId cinemaName")
      .populate("starCast.starCastId", "name")
      .lean()
      .sort({ filmOpeningDate: 1 });

    if (!upcomingMoviesDetails || upcomingMoviesDetails.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: "No upcoming movies found",
        data: [],
      });
    }

    // Remove duplicates based on uniqueFilmCode
    const uniqueFilmCodes = new Set();
    const uniqueUpcomingMovies = upcomingMoviesDetails.filter((movie) => {
      const code = movie.uniqueFilmCode || movie.filmCode;
      if (uniqueFilmCodes.has(code)) {
        return false;
      }
      uniqueFilmCodes.add(code);
      return true;
    });

    // Group movies by month (similar to user API)
    const moviesByMonth = uniqueUpcomingMovies.reduce((acc, movie) => {
      const releaseMonthYear = new Date(movie.filmOpeningDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
        }
      );

      const movieData = {
        _id: movie._id,
        cinemaId: movie.cinemaId,
        cinemaObjectId: movie.cinemaObjectId,
        filmCode: movie.filmCode,
        uniqueFilmCode: movie.uniqueFilmCode,
        name: movie.name,
        poster: movie.poster,
        languages: movie.languages,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
        filmOpeningDate: movie.filmOpeningDate,
        youtubeVideoUrl: movie.youtubeVideoUrl,
        starCast: movie.starCast,
        category: movie.category,
        movieCategory: movie.movieCategory,
        movieType: movie.movieType,
        censorRating: movie.censorRating,
        duration: movie.duration,
      };

      if (!acc[releaseMonthYear]) {
        acc[releaseMonthYear] = {
          month: releaseMonthYear,
          movies: [movieData],
        };
      } else {
        acc[releaseMonthYear].movies.push(movieData);
      }
      return acc;
    }, {});

    const organizedMovies = Object.values(moviesByMonth);

    // Filter to only show current and future months
    const filterMoviesByMonth = organizedMovies.filter((movie) => {
      const movieReleaseMonth = moment(movie.month, "MMM YYYY");
      const currentMonth = moment();
      return movieReleaseMonth.diff(currentMonth, "months") >= 0;
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Upcoming movies fetched successfully",
      data: filterMoviesByMonth,
    });
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return handleErrorResponse(res, error);
  }
};

// 8. Movies list with show counts (legacy - for backward compatibility)
export const fetchMoviesList = async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchQuery = { deletedStatus: 0, isActive: true };
    if (status) {
      matchQuery.status = parseInt(status);
    }

    const movies = await Movie.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $cond: [
              { $and: [{ $ne: ["$uniqueFilmCode", null] }, { $ne: ["$uniqueFilmCode", ""] }] },
              "$uniqueFilmCode",
              "$filmCode",
            ],
          },
          movie: { $first: "$$ROOT" },
          cinemaCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "shows",
          let: { filmCode: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$filmCode", "$$filmCode"] },
                    {
                      $eq: [
                        { $substr: ["$filmCode", 4, -1] },
                        { $substr: ["$$filmCode", 4, -1] },
                      ],
                    },
                  ],
                },
                deletedStatus: 0,
                sessionRealShow: { $gte: today },
              },
            },
            { $count: "count" },
          ],
          as: "showsCount",
        },
      },
      {
        $project: {
          _id: "$movie._id",
          name: "$movie.name",
          poster: "$movie.poster",
          censorRating: "$movie.censorRating",
          duration: "$movie.duration",
          languages: "$movie.languages",
          movieCategory: "$movie.movieCategory",
          movieType: "$movie.movieType",
          status: "$movie.status",
          averageRating: "$movie.averageRating",
          filmCode: "$_id",
          cinemaCount: 1,
          showCount: { $ifNull: [{ $arrayElemAt: ["$showsCount.count", 0] }, 0] },
        },
      },
      { $match: { showCount: { $gt: 0 } } },
      { $sort: { showCount: -1, name: 1 } },
      { $limit: parseInt(limit) },
    ]);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Movies list fetched successfully",
      data: movies,
    });
  } catch (error) {
    console.error("Error fetching movies list:", error);
    return handleErrorResponse(res, error);
  }
};
