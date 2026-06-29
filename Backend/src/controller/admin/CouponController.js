import Coupon from "../../models/Coupons.js";
import StatusCodes from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import {
  handleErrorResponse,
  smsSend2Digital,
} from "../../services/CommanService.js";
import { generateCouopnId } from "../../services/CommanService.js";
import { assignPrivateCoupon } from "../../utils/Mailers.js";
import { User } from "../../models/User.js";
import mongoose from "mongoose";
import moment from "moment";
import Transaction from "../../models/Transaction.js";
import Cinema from "../../models/Cinema.js";
import Movie from "../../models/Movies.js";
export const addOrEditCoupon = async (req, res) => {
  try {
    const {
      id,
      couponFor,
      couponType,
      couponTitle,
      couponUsage,
      couponStartDate,
      couponEndDate,
      couponCodeOverAllUsage,
      couponDescription,
      movieLanguage,
      city,
      offerStartDate,
      cinema,
      mergeWithAnotherCoupon,
      autoApplyOnCheckOut,
      privateCoupon,
      assignUserId,
      subscriptionId,
      spentForm,
      spentTo,
      discountType,
      discount,
      couponUpTo,
      couponCategory,
    } = req.body;

    // const startDateUTC = couponStartDate.split("T")[0] + "T00:00:00+00:00";
    // const endDateUTC = couponEndDate.split("T")[0] + "T18:29:00+00:00";

    const baseFields = {
      couponType,
      couponTitle,
      couponUsage,
      // couponStartDate: startDateUTC,
      // couponEndDate: endDateUTC,
      couponCodeOverAllUsage,
      couponDescription,
      movieLanguage,
      cityId: city,
      offerStartDate,
      cinemaObjectId: cinema,
      discountType,
      discount,
      couponUpTo,
      couponCategory,
      "advancedSettings.mergeWithAnotherCoupon": mergeWithAnotherCoupon,
      "advancedSettings.autoApplyOnCheckOut": autoApplyOnCheckOut,
      "advancedSettings.privateCoupon": privateCoupon,
    };
    if (couponStartDate) {
      const startDateUTC = couponStartDate.split("T")[0] + "T00:00:00+00:00";
      baseFields.couponStartDate = startDateUTC;
    }

    if (couponEndDate) {
      const endDateUTC = couponEndDate.split("T")[0] + "T00:00:00+00:00";
      baseFields.couponEndDate = endDateUTC;
    }
    if (couponFor) baseFields.couponFor = couponFor.split(",");
    if (movieLanguage) baseFields.movieLanguage = movieLanguage.split(",");
    if (city) baseFields.cityId = city.split(",");
    if (cinema) baseFields.cinemaObjectId = cinema.split(",");
    if (assignUserId || subscriptionId || spentForm || spentTo) {
      baseFields["assignCoupon"] = {};
      if (assignUserId)
        baseFields["assignCoupon"].assignUserId = assignUserId.split(",");
      if (subscriptionId)
        baseFields["assignCoupon"].subscriptionId = subscriptionId;
      if (spentForm || spentTo) {
        baseFields["assignCoupon"].rangeOfSpent = {};
        if (spentForm)
          baseFields["assignCoupon"].rangeOfSpent.spentForm = spentForm;
        if (spentTo) baseFields["assignCoupon"].rangeOfSpent.spentTo = spentTo;
      }
    }

    const couponExists = async (filter) => {
      const existsCoupon = await Coupon.findOne({
        ...filter,
        deletedStatus: 0,
      });
      return existsCoupon ? true : false;
    };

    if (id) {
      const exists = await couponExists({ _id: { $ne: id }, couponTitle });
      if (exists) {
        return res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.COUPON_TITLE_ALREADY_EXISTS,
        });
      }
      // condition added for- when city,language,cinema should be same
      // if (movieLanguage && city && cinema) {
      //   const existingCoupon = await Coupon.findOne({
      //     _id: { $ne: id },
      //     movieLanguage: { $in: baseFields.movieLanguage },
      //     cityId: { $in: baseFields.cityId },
      //     cinemaObjectId: { $in: baseFields.cinemaObjectId },
      //     deletedStatus: 0,
      //   });

      //   if (existingCoupon) {
      //     return res.status(StatusCodes.CONFLICT).json({
      //       status: StatusCodes.CONFLICT,
      //       message: ResponseMessage.COUPON_ALREADY_EXISTS,
      //     });
      //   }
      // }

      const couponImage = req.files.couponImage
        ? req.files.couponImage[0].filename
        : undefined;

      const coupon = await Coupon.findOneAndUpdate(
        { _id: id, deletedStatus: 0 },
        {
          $set: baseFields,
          couponImage: couponImage || exists.couponImage,
        },
        { new: true }
      );

      if (!coupon) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: ResponseMessage.COUPON_NOT_FOUND,
        });
      }

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ResponseMessage.COUPON_UPDATE,
        data: coupon,
      });
    } else {
      const exists = await couponExists({ couponTitle });
      if (exists) {
        return res.status(StatusCodes.CONFLICT).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.COUPON_TITLE_ALREADY_EXISTS,
        });
      }

      // if (movieLanguage && city && cinema) {
      //   const existingCoupon = await Coupon.findOne({
      //     movieLanguage: { $in: baseFields.movieLanguage },
      //     cityId: { $in: baseFields.cityId },
      //     cinemaObjectId: { $in: baseFields.cinemaObjectId },
      //     deletedStatus: 0,
      //   });

      //   if (existingCoupon) {
      //     return res.status(StatusCodes.CONFLICT).json({
      //       status: StatusCodes.CONFLICT,
      //       message: ResponseMessage.COUPON_ALREADY_EXISTS,
      //     });
      //   }
      // }

      const couponImage = req.files.couponImage
        ? req.files.couponImage[0].filename
        : "";

      const couponcode = await generateCouopnId();
      const newCoupon = new Coupon({
        ...baseFields,
        couponId: couponcode,
        couponImage,
      });
      await newCoupon.save();

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ResponseMessage.COUPON_CREATED,
        data: newCoupon,
      });
    }
  } catch (error) {
    console.log(error);
    handleErrorResponse(res, error);
  }
};
export const getAllCouponList = async (req, res) => {
  try {
    const couponList = await Coupon.find({ deletedStatus: 0 })
      .sort({ createdAt: -1 })
      .populate({ path: "cityId", select: "region" })
      .populate({ path: "cinemaObjectId", select: "cinemaName" })
      .populate({
        path: "assignCoupon.assignUserId",
        select: "name email mobileNumber",
      });
    if (!couponList.length) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.COUPON_LIST_NOT_FOUND,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.COUPON_LIST,
        data: couponList,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById({ _id: req.body.id })
      .populate({ path: "cityId", select: "region" })
      .populate({ path: "cinemaObjectId", select: "cinemaName" })
      .populate({
        path: "assignCoupon.assignUserId",
        select: "name email mobileNumber",
      });
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.COUPON_LIST,
      data: coupon,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: { deletedStatus: 1 },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.COUPON_DELETE,
      data: coupon,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const activeDeactiveCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      _id: req.query.id,
      deletedStatus: 0,
    });
    if (!coupon) {
      return res.status(404).json({
        status: 404,
        message: ResponseMessage.COUPON_NOT_FOUND,
      });
    }

    const newActiveStatus = !coupon.isActive;

    const updatedCoupon = await Coupon.updateOne(
      { _id: req.query.id },
      { $set: { isActive: newActiveStatus } },
      { new: true }
    );

    const message = !newActiveStatus
      ? ResponseMessage.COUPON_DEACTIVE_SUCCESS
      : ResponseMessage.COUPON_ACTIVE_SUCCESS;
    return res.status(200).json({
      status: 200,
      message,
      data: updatedCoupon,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const privateUserCoupon = async (req, res) => {
  try {
    const { userIds, couponId } = req.body;

    // Fetch coupon data
    const couponData = await Coupon.findOne({
      _id: new mongoose.Types.ObjectId(couponId),
      isActive: true,
      deletedStatus: 0,
    });

    if (!couponData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Coupon not found",
        data: [],
      });
    }

    const formattedStartDate = moment(couponData.couponStartDate).format(
      "YYYY-MM-DD"
    );
    const formattedEndDate = moment(couponData.couponEndDate).format(
      "YYYY-MM-DD"
    );

    let failedUsers = [];

    for (const userId of userIds) {
      try {
        // Fetch user data
        const userData = await User.findOne({
          _id: new mongoose.Types.ObjectId(userId),
          isActive: true,
          deletedStatus: 0,
        });

        if (!userData) {
          failedUsers.push({ userId, error: "User not found" });
          continue;
        }

        const data = {
          email: userData.email,
          couponTitle: couponData.couponTitle,
          couponDescription: couponData.couponDescription,
          couponStartDate: formattedStartDate,
          couponEndDate: formattedEndDate,
        };

        // Send email or SMS
        if (userData.email) {
          try {
            await assignPrivateCoupon(data);
          } catch (emailError) {
            t;
            console.error(
              `Error sending email to ${userData.email}:`,
              emailError
            );
            failedUsers.push({ userId, error: "Error sending email" });
          }
        } else if (userData.mobileNumber) {
          try {
            // Uncomment this if you are using SMS functionality
            // await smsSend2Digital(
            //   messageTemplate,
            //   `+91${userData.mobileNumber}`,
            //   process.env.SEND2DIGITAL_OTP_CONTENTID
            // );
          } catch (smsError) {
            console.error(
              `Error sending SMS to ${userData.mobileNumber}:`,
              smsError
            );
            failedUsers.push({ userId, error: "Error sending SMS" });
          }
        } else {
          failedUsers.push({ userId, error: "No contact method available" });
        }
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError);
        failedUsers.push({ userId, error: userError.message });
      }
    }

    if (failedUsers.length > 0) {
      return res.status(StatusCodes.MULTI_STATUS).json({
        status: StatusCodes.MULTI_STATUS,
        message: "Coupon assignment completed with some errors",
        failedUsers: failedUsers,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Coupon assigned successfully!",
    });
  } catch (error) {
    console.error("Error assigning private coupon:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      data: [error.message],
    });
  }
};
// export const getCouponUseDetails = async (req, res) => {
//   const {couponId} = req.query;
//   try {
//     if(!couponId){
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         status: StatusCodes.BAD_REQUEST,
//         message: "Coupon Id is required",
//       });
//     }
//     console.log(couponId, "couponId");
    
//     const couponDetails = await Transaction.find({
//   couponId: new mongoose.Types.ObjectId(couponId),
//       deletedStatus: 0,
//     });
    
//     console.log(couponDetails, "couponDetails");
    
//     if(!couponDetails.length){
//       return res.status(StatusCodes.NOT_FOUND).json({
//         status: StatusCodes.NOT_FOUND,
//         message: "Coupon details not found",
//       });
//     }
//       // Extract unique movie and cinema IDs from transactions
//       const movieIds = [...new Set(couponDetails.map(tx => tx.movieId.toString()))];
//       const cinemaIds = [...new Set(couponDetails.map(tx => tx.cinemaId.toString()))];
//       const userIds = [...new Set(couponDetails.map(tx => tx.userId.toString()))];
  
//       const users = await User.find({ _id: { $in: userIds } });
//       // Fetch movie and cinema details
//       const movies = await Movie.find({ _id: { $in: movieIds } });
//       const cinemas = await Cinema.find({ _id: { $in: cinemaIds } });


  

  
//       // Map movie and cinema details for easy lookup
//       const movieMap = Object.fromEntries(movies.map(movie => [movie._id.toString(), movie]));
//       const cinemaMap = Object.fromEntries(cinemas.map(cinema => [cinema._id.toString(), cinema]));
//       const userMap = Object.fromEntries(users.map(user => [user._id.toString(), user]));
  
//       // Prepare response data
//       const couponuseDetails = couponDetails.map(tx => ({
//         transactionId: tx.initTransId,
//         userId: tx.userId,
//         amount: tx.paymentResponse.amount,
//         discountApplied: tx.finalBookingCalculation.ticketCart.discountAmount,
//         createdAt: tx.createdAt,
//         movieDetails: movieMap[tx.movieId.toString()] || null,
//         cinemaDetails: cinemaMap[tx.cinemaId.toString()] || null,
//         userDetails:userMap[tx.userId.toString()] || null
//       }));
  
//       res.json({
//         status: 'success',
//         data: {
//           couponId,
//           couponTitle: couponDetails[0]?.finalBookingCalculation?.ticketCart?.coupons[0]?.couponTitle || 'N/A',
//           totalUsageCount: couponDetails.length,
//           transactions: couponuseDetails
//         }
//       });
//     return res.status(StatusCodes.OK).json({
//       status: StatusCodes.OK,
//       message: "Coupon details fetched successfully",
//       data: couponDetails
//     })
// } catch (error) {

// }
// }
export const getCouponUseDetails = async (req, res) => {
  const { couponId } = req.query;

  try {
    if (!couponId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Coupon Id is required",
      });
    }

    console.log(couponId, "couponId");

    const couponDetails = await Transaction.find({
      couponId: new mongoose.Types.ObjectId(couponId),
      deletedStatus: 0,
    });

    console.log(couponDetails, "couponDetails");

    if (!couponDetails.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Coupon details not found",
      });
    }

    // Extract unique movie, cinema, and user IDs
    const movieIds = [...new Set(couponDetails.map((tx) => tx.movieId.toString()))];
    const cinemaIds = [...new Set(couponDetails.map((tx) => tx.cinemaId.toString()))];
    const userIds = [...new Set(couponDetails.map((tx) => tx.userId.toString()))];

    // Fetch required fields from the Movie, Cinema, and User tables
    const movies = await Movie.find({ _id: { $in: movieIds } }).select("name filmCode _id");
    const cinemas = await Cinema.find({ _id: { $in: cinemaIds } }).select("cinemaName cinemaId _id");
    const users = await User.find({ _id: { $in: userIds } }).select("name email mobileNumber");

    // Map movie, cinema, and user details for easy lookup
    const movieMap = Object.fromEntries(movies.map((movie) => [movie._id.toString(), movie]));
    const cinemaMap = Object.fromEntries(cinemas.map((cinema) => [cinema._id.toString(), cinema]));
    const userMap = Object.fromEntries(users.map((user) => [user._id.toString(), user]));

    // Prepare response data
    const couponuseDetails = couponDetails.map((tx) => ({
      transactionId: tx.initTransId,
      userId: tx.userId,
      amount: tx.paymentResponse?.amount,
      discountApplied: tx.finalBookingCalculation?.ticketCart?.discountAmount,
      createdAt: tx.createdAt,
      movieDetails: movieMap[tx.movieId.toString()] || null,
      cinemaDetails: cinemaMap[tx.cinemaId.toString()] || null,
      userDetails: userMap[tx.userId.toString()] || null,
      // commitBookingData: tx.commitBookingData?.strBookId || null,
      strBookingId: tx.addSeatData?.strBookId || null,
    }));

    return res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        couponId,
        couponTitle: couponDetails[0]?.finalBookingCalculation?.ticketCart?.coupons[0]?.couponTitle || "N/A",
        totalUsageCount: couponDetails.length,
        transactions: couponuseDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "An error occurred while fetching coupon details",
    });
  }
};

