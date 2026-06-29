import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import GroupBooking from "../../models/GroupBooking.js";
import { emailAdminForGroupBooking, emailApplyForGroupBooking } from "../../utils/Mailers.js";
import { getClientIp, smsTwillio } from "../../services/CommanService.js";
import Cinema from "../../models/Cinema.js";

export const addGroupBookingDetails = async (req, res) => {
  try {
    let {
      name,
      email,
      mobileNumber,
      noOfPax,
      bookingDate,
      city,
      cinemaId
    } = req.body;



    const groupBookingDetails = await new GroupBooking({
      userId: req.user,
      name,
      email,
      mobileNumber,
      cinemaId,
      noOfPax,
      bookingDate: new Date(bookingDate),
      city,
    }).save();
    if (groupBookingDetails) {
      
    const smsMessage = `Thank you for your interest in Connplex! We've received your Group Booking application and will review it shortly. Our team will get back to you soon. Stay tuned!`;
    const from = process.env.FROM_GROUP_BOOKING;
      const smsLogCtx = {
        smsType: "GROUP_BOOKING",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      };
      if (email && mobileNumber) {
        await emailApplyForGroupBooking({ email });
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      } else if (email) {
        await emailApplyForGroupBooking({ email });
      } else if (mobileNumber) {
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      }

      const cinemaDetails =  await Cinema.findOne({ _id:cinemaId });

      // Send email to admin with group booking details
      await emailAdminForGroupBooking({
        name,
        email,
        mobileNumber,
        noOfPax,
        bookingDate: new Date(bookingDate),
        city,
        cinemaName: cinemaDetails ? cinemaDetails.cinemaName : "-",
      });

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.GROUP_BOOKING_DETAILS_ADDED,
        data: groupBookingDetails,
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

export const getAllGroupBooking = async (req, res) => {
  try {
    const groupBookingDetails = await GroupBooking.find({})
      .populate("userId")
      .populate("cinemaId")
      .sort({ createdAt: -1 });
    if (groupBookingDetails?.length) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.GROUP_BOOKING_DETAILS_FETCHED,
        data: groupBookingDetails,
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.GROUP_BOOKING_DETAILS_NOT_FOUND,
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
