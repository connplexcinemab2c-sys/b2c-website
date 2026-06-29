import axios from "axios";
import { StatusCodes } from "http-status-codes";
import Advertisement from "../../models/Advertisement.js";
import Career from "../../models/Career.js";
import FeedBack from "../../models/FeedBack.js";
import Transaction from "../../models/Transaction.js";
import UserSetting from "../../models/UserSetting.js";
import {
  getClientIp,
  handleErrorResponse,
  isVoucherValid,
  smsTwillio,
} from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import {
  emailAdminForAdvertisement,
  emailAdminForCareer,
  emailAdminForFeedback,
  emailApplyForAdvertisement,
  emailApplyForCareer,
  emailApplyForFeedback,
  generateTicketBookingPdf,
} from "../../utils/Mailers.js";

//#region Create feed back
export const saveFeedBack = async (req, res) => {
  try {
    let { mobileNumber, message, email, name } = req.body;
    const saveFeedBack = await new FeedBack(req.body).save();
    if (saveFeedBack) {
      const smsMessage = `Thank you for your interest in Connplex! We've received your feedback application and will review it shortly. Our team will get back to you soon. Stay tuned!`;
      const from = process.env.FROM_FEEDBACK;
      const smsLogCtx = {
        smsType: "FEEDBACK",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      };
      if (email && mobileNumber) {
        await emailApplyForFeedback({ email });
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      } else if (email) {
        await emailApplyForFeedback({ email });
      } else if (mobileNumber) {
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      }

      // Send email to admin with user details
      await emailAdminForFeedback({
        name,
        email,
        mobileNumber,
        message,
      });

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.FEED_BACK_SAVED,
        data: saveFeedBack,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Create advertisement
export const saveAdvertisement = async (req, res) => {
  try {
    let {
      brandName,
      message,
      email,
      mobileNumber,
      websiteName,
      designation,
      name,
    } = req.body;
    const saveAdvertisement = await new Advertisement(req.body).save();
    if (saveAdvertisement) {
      const smsMessage = `Thank you for your interest in Connplex! We've received your Group Booking application and will review it shortly. Our team will get back to you soon. Stay tuned!`;
      const from = process.env.FROM_FEEDBACK;
      const smsLogCtx = {
        smsType: "ADVERTISEMENT",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      };
      if (email && mobileNumber) {
        console.log(email, mobileNumber);
        await emailApplyForAdvertisement({ email });
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      } else if (email) {
        console.log(email);
        await emailApplyForAdvertisement({ email });
      } else if (mobileNumber) {
        console.log(mobileNumber);
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      }

      // Send email to admin with user details
      await emailAdminForAdvertisement({
        brandName,
        name,
        email,
        mobileNumber,
        websiteName,
        designation,
        message,
      });
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.ADVERTISEMENT_SAVED,
        data: saveAdvertisement,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Create career
export const saveCareer = async (req, res) => {
  try {
    let { firstName, lastName, message, email, mobileNumber, city, position } =
      req.body;
    req.body.resume = req.resumeUrl;
    const saveCareer = await new Career(req.body).save();
    if (saveCareer) {
      const smsMessage = `Thank you for your interest in Connplex! We've received your Group Booking application and will review it shortly. Our team will get back to you soon. Stay tuned!`;
      const from = process.env.FROM_FEEDBACK;
      const smsLogCtx = {
        smsType: "CAREER_APPLICATION",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      };
      if (email && mobileNumber) {
        console.log(email, mobileNumber);
        await emailApplyForCareer({ email });
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      } else if (email) {
        console.log(email);
        await emailApplyForCareer({ email });
      } else if (mobileNumber) {
        console.log(mobileNumber);
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      }

      // Send email to admin with user details
      await emailAdminForCareer({
        firstName,
        lastName,
        message,
        email,
        mobileNumber,
        city,
        position,
        // filePath: `../../public/uploads/${req.resumeUrl}`,
        filePath: `${process.env.AWS_IMAGE_URL}${req.resumeUrl}`,
      });

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.CAREER_SAVED,
        data: saveCareer,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Retrieve Coupon code data from connplex franchise database and check
export const getFranchiseVoucher = async (req, res) => {
  try {
    let { couponCode } = req.body;
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://backendfranchise.theconnplex.com/api/user/get-single-voucher?couponCode=${couponCode}`,
      headers: {},
    };
    const response = await axios.request(config);
    const findVoucher = response.data.data;
    if (!findVoucher) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.INVALID_VOUCHER_CODE,
        data: [],
      });
    }
    // Check the validity of the voucher
    if (!isVoucherValid(findVoucher)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.VOUCHER_EXPIRED,
        data: [],
      });
    }
    //code for valid voucher
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.VOUCHER_APPLIED,
      data: [], // Need to provide payable amount after voucher applied
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const addEditMoviStatus = async (req, res) => {
  try {
    const userId = req.user;
    const { nowPlayingMovies, upCommingMovies, upCommingBookings, _id } =
      req.body;
    let updateData;
    if (_id) {
      updateData = await UserSetting.findByIdAndUpdate(
        { _id: _id },
        { $set: { nowPlayingMovies, upCommingMovies, upCommingBookings } },
        { new: true }
      );
      await updateData.save();
      if (updateData) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.USER_STATUS_UPDATED,
          data: updateData,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.USER_STATUS_NOT_UPDATED,
          data: [],
        });
      }
    } else {
      const createMoviStatus = await new UserSetting({
        userId: userId,
        nowPlayingMovies,
        upCommingMovies,
        upCommingBookings,
      });
      await createMoviStatus.save();
      if (createMoviStatus) {
        return res.status(201).send({
          status: StatusCodes.CREATED,
          message: ResponseMessage.USER_STATUS_ADDED,
          data: createMoviStatus,
        });
      } else {
        return res.status(400).send({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.USER_STATUS_NOT_ADDED,
          data: [],
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const updateMoviStatus = async (req, res) => {
  try {
    const statusId = req.params.id;
    const { nowPlayingMovies, upCommingMovies, upCommingBookings } = req.body;

    const changeStatus = await UserSetting.findByIdAndUpdate(
      { _id: statusId },
      { $set: { nowPlayingMovies, upCommingMovies, upCommingBookings } },
      { new: true }
    );
    await changeStatus.save();
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.USER_STATUS_UPDATED,
      data: changeStatus,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getMoviStatus = async (req, res) => {
  try {
    const userId = req.user;
    const getStatusData = await UserSetting.findOne({ userId: userId });

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.USER_STATUS_GETED,
      data: getStatusData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const downloadBookingTicketAsPDF = async (req, res) => {
  try {
    let { initTransId } = req.params;
    const bookingDetails = await Transaction.findOne(
      {
        initTransId,
      },
      {
        "addSeatData.strBookId": true,
        "setSeatData.strSeatInfo": true,
        "addSeatData.curTicketsTotal": true,
        "addSeatData.curTicketsTax1": true,
        "addSeatData.curTicketsTax2": true,
        cancellationStatus: true,
        initTransId: true,
        cinemaId: true,
        movieId: true,
        showId: true,
        paymentsStatus: true,
        userId: true,
        commitStatus: true,
        refundStatus: true,
        paymentsBreakup: true,
        "paymentResponse.id": true,
        "paymentResponse.amount": true,
        "paymentResponse.status": true,
        "paymentResponse.method": true,
        "foodAndBvgResponse.curTotal": true,
        "foodAndBvgResponse.curTicketsTotal": true,
        "foodAndBvgResponse.curFoodTotal": true,
        "foodAndBvgResponse.curTicketsTax": true,
        "foodAndBvgResponse.curFoodTax": true,
        "foodAndBvgResponse.curTicketsTax1": true,
        "foodAndBvgResponse.curTicketsTax2": true,
        "foodAndBvgResponse.curFoodTax1": true,
        "foodAndBvgResponse.curFoodTax2": true,
        "commitBookingData.curTicketsTotal": true,
        "commitBookingData.curTicketsTax1": true,
        "commitBookingData.curTicketsTax2": true,
        finalBookingCalculation: true,
        paymentsBreakup: true,
        fAndBDetails: true,
      }
    )
      .populate({
        path: "cinemaId",
        select: [
          "cinemaName",
          "convenienceFees",
          "address",
          "displayName",
          "address",
          "googleUrl",
          "GSTNumber",
        ],
      })
      .populate({
        path: "movieId",
        select: ["name", "poster", "languages", "censorRating", "category"],
      })
      .populate({
        path: "showId",
        select: ["sessionRealShow", "screenName"],
      })
      .populate({
        path: "userId",
        select: ["firstName", "lastName"],
      })
      .sort({ createdAt: -1 });

    if (!bookingDetails) {
      return res.send("Something went wrong");
    }

    // Generate PDF from the booking details
    const pdfBuffer = await generateTicketBookingPdf(bookingDetails);

    res.setHeader(
      "Content-Disposition",
      'inline; filename="TicketBookingConfirmation.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    // Send the PDF buffer as the response
    res.send(pdfBuffer);

    // Optionally, you can also send a success JSON response
    // return res.status(200).json({
    // status: StatusCodes.OK,
    //   message: 'PDF generated and sent successfully',
    //   data: bookingDetails,
    // });
  } catch (error) {
    console.log(error, "err");
    return handleErrorResponse(res, error);
  }
};
