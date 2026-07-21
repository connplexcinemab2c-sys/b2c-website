import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
import axios from "axios";
import bcrypt from "bcryptjs";
import twilio from "twilio";
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../utils/ResponseMessage.js";
import Price from "../models/Price.js";
import Cinema from "../models/Cinema.js";
import Transaction from "../models/Transaction.js";
import moment from "moment";
import Coupon from "../models/Coupons.js";
import SubscriptionMembership from "../models/SubscriptionMembership.js";
import VistaLog from "../models/VistaLog.js";
import SmsLog from "../models/SmsLog.js";
import WebhookResponse from "../models/WebhookResponse.js";
import { parseUserAgent } from "../utils/parseUserAgent.js";
import { getBookingDetailsByTransId } from "../controller/booking/Booking.js";

export const genrateToken = ({ payload, ExpiratioTime }) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: ExpiratioTime,
  });
};
export const createJwtToken = (payload, type) => {
  return jwt.sign(
    payload,
    process.env.SECRET_KEY,
    type === "web" ? { expiresIn: "12h" } : {}
  );
};
export const generateOtp = () => {
  let otp = Math.floor(1000 + Math.random() * 9000);
  // let otp = 4444;
  return otp;
};

export const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  let encreptPassword = bcrypt.hash(password, salt);
  return encreptPassword;
};

export const unlinkImage = async (fileName) => {
  try {
    fs.unlinkSync(fileName);
  } catch (error) {
    console.log(error);
  }
};

// generate 16 bytes of random data
export const encrypt = async (text) => {
  return Buffer.from(text).toString("base64");
};
// the decipher function
export const decrypt = async (text) => {
  return Buffer.from(text, "base64").toString();
};
//decrypt payment request of ccavenue
export const decryptPayment = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};
//error Handling function
function handleErrorResponse(res, error) {
  return res.status(500).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: ResponseMessage.INTERNAL_SERVER_ERROR,
    data: error.message,
  });
}

export const calculateSeatAmount = async (
  userId,
  cinemaId,
  pGroupCode,
  areaCatCode,
  quantity,
  transId,
  fAndB
) => {
  const listPriceDetails = await Price.findOne(
    {
      cinemaId,
      pGroupCode,
      deletedStatus: 0,
      areaCatCode,
    },
    {
      cinemaId: true,
      pGroupCode: true,
      tTypeCode: true,
      areaCatCode: true,
      tTypeDescription: true,
      currentPrice: true,
      priceTax1: true,
      priceTax2: true,
    }
  );

  const convenience = await Cinema.findOne(
    { cinemaId },
    { convenienceFees: true }
  );
  let fAndBAmount;
  if (fAndB) {
    const { foodAndBvgResponse } = await Transaction.findOne(
      { initTransId: transId },
      { "foodAndBvgResponse.curFoodTotal": true }
    );
    fAndBAmount = foodAndBvgResponse?.curFoodTotal || 0;
  }
  if (
    listPriceDetails &&
    listPriceDetails.areaCatCode === areaCatCode &&
    quantity > 0
  ) {
    const convenienceFees = convenience.convenienceFees * quantity;
    const seatAmount = listPriceDetails.currentPrice * quantity;
    const totalFoodAmount =
      parseFloat(fAndBAmount || 0) + 0.05 * parseFloat(fAndBAmount || 0);
    const totalAmount =
      seatAmount + convenienceFees + +totalFoodAmount.toFixed(2);

    return {
      seatAmount,
      convenienceFees,
      totalAmount,
      totalFoodAmount,
    };
  } else {
    return {
      seatAmount: 0,
      convenienceFees: 0,
      totalAmount: 0,
      totalFoodAmount: 0,
    };
  }
};
export { handleErrorResponse };

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;
export const smsTwillio = async (body, from, to, logContext = {}) => {
  try {
    if (!client) {
      console.log(`[SMS MOCK] Twilio not configured. Message to ${to}: ${body}`);
      await createSmsLog({
        ...logContext,
        mobileNumber: to,
        messageBody: body,
        status: "SUCCESS",
      });
      return;
    }
    const message = await client.messages.create({ body, from, to });
    console.log(message.sid, "Message sent successfully");
    await createSmsLog({
      ...logContext,
      mobileNumber: to,
      messageBody: body,
      status: "SUCCESS",
    });
  } catch (err) {
    console.log(err.message, "Error while message sending");
    await createSmsLog({
      ...logContext,
      mobileNumber: to,
      messageBody: body,
      status: "FAILED",
      errorMessage: err.message,
    });
  }
};

export async function shortenUrl(url) {
  let data = {
    url: url,
  };

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://url-shortener-service.p.rapidapi.com/shorten",
    headers: {
      "X-RapidAPI-Key": "2693af692bmsh2d8139d6b469889p104196jsn28deb432bc11",
      "Content-Type": "application/x-www-form-urlencoded",
      "X-RapidAPI-Host": "url-shortener-service.p.rapidapi.com",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    return error;
  }
}

export const getSeatStatus = (availableSeats, totalSeats) => {
  const thresholdGreen = 0.6; // 60% or more seats available (green)
  const thresholdYellow = 0.3; // 30% or more seats available (yellow)

  const occupancyPercentage = availableSeats / totalSeats;

  if (occupancyPercentage >= thresholdGreen) {
    return "G"; // Plenty of seats available
  } else if (occupancyPercentage >= thresholdYellow) {
    return "Y"; // Seats filling up fast
  } else {
    return "R"; // Almost full or completely full
  }
};

export const getDistance = async (latitude, longitude, lat, long) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${lat},${long}&key=${process.env.GOOGLE_API_KEY}&mode=driving`;
  try {
    const response = await axios.get(url);
    const json = response.data;
    const distanceTime = json?.routes[0]?.legs[0]?.duration?.text;
    let distance = json?.routes[0]?.legs[0]?.distance?.text?.split(" ")[0];
    return { distance, distanceTime };
  } catch (error) {
    console.log("getRoutePoints error", error);
  }
};

export const validateIndianMobileNumber = function (number) {
  const regex = /^[6-9]\d{9}$/; // Regular expression for Indian mobile numbers
  return regex.test(number);
};

// Function to check the validity of the voucher
export const isVoucherValid = (voucher) => {
  const currentDate = moment();
  const startDate = moment(voucher.start_date);
  const endDate = moment(voucher.end_date);
  // Check if the current date is within the valid range
  if (currentDate.isBetween(startDate, endDate, "day", "[]")) {
    const startTime = moment(`1970-01-01T${voucher.start_time}:00.000Z`);
    const endTime = moment(`1970-01-01T${voucher.end_time}:00.000Z`);
    // Check if the current time is within the valid range
    if (currentDate.isBetween(startTime, endTime)) {
      return true; // Voucher is valid
    }
  }
  return false; // Voucher is not valid
};

// date: 27-03-2024
export const smsSend2Digital = async (message, to, contentId, logContext = {}) => {
  console.log(message, "sms message");
  try {
    const response = await axios.post(
      `https://gateway.leewaysoftech.com/xml-transconnect-api.php?username=${encodeURIComponent(process.env.SEND2DIGITAL_USERNAME || "")}&password=${encodeURIComponent(process.env.SEND2DIGITAL_PASSWORD || "")}&mobile=${encodeURIComponent(to || "")}&message=${encodeURIComponent(message || "")}&senderid=${encodeURIComponent(process.env.SEND2DIGITAL_SENDERID || "")}&peid=${encodeURIComponent(process.env.SEND2DIGITAL_PEID || "")}&contentid=${encodeURIComponent(contentId || "")}`
    );
    console.log(response.data, "SMS response data");
    await createSmsLog({
      ...logContext,
      mobileNumber: to,
      messageBody: message,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error(
      "Error sending SMS:",
      error.response ? error.response.data : error.message
    );
    await createSmsLog({
      ...logContext,
      mobileNumber: to,
      messageBody: message,
      status: "FAILED",
      errorMessage: error.response ? String(error.response.data) : error.message,
    });
  }
};

export async function generateCouopnId() {
  let lastNumber = 0;

  // Check if there are any bookings
  const lastCoupon = await Coupon.findOne({}, { couponId: 1 })
    .sort({ _id: -1 })
    .limit(1);

  if (lastCoupon && lastCoupon.couponId) {
    //lastBooking &&
    lastNumber = parseInt(lastCoupon.couponId.split("-")[1], 10);
  }

  const prefix = "CNPX-";
  const newNumber = lastNumber + 1;
  const formattedNumber = String(newNumber).padStart(7, "0");
  const newId = `${prefix}${formattedNumber}`;

  return newId;
}


const ENCRYPTION_KEY = Buffer.from("h7f49c2f1c56c1ea0d7fd3c2c1c38a5n", "utf8"); // 32 bytes
const IV = Buffer.from("0000000000000000", "utf8"); // 16 bytes
const SIGNING_SECRET = "957c64b5aabf78df346f6db57c2c104f";

export const verifySignature = async (encryptedData, signature) => {
  // console.log({ encryptedData, signature });
  const expected = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(encryptedData)
    .digest("hex");

  return expected === signature;
};


export function decryptData(encryptedData) {
  // console.log({encryptedData})
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

// export function sanitizeSearchRegex(search = "") {
//   const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//   const fuzzyPattern = escaped.replace(/\s+/g, ".*");
//   return new RegExp(fuzzyPattern, "i");
// }

export function sanitizeSearchRegex(search = "") {
  if (typeof search !== "string" || search.trim() === "") {
    return null;
  }

  const trimmedSearch = search.trim();
  const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const words = escaped.split(/\s+/).filter(Boolean);
  const wordPatterns = words.map(word => `(?=.*${word})`).join("");
  const fuzzyPattern = `^${wordPatterns}.*$`;

  return new RegExp(fuzzyPattern, "i");
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
}

export async function createSmsLog({
  mobileNumber,
  messageBody = null,
  smsType = null,
  userId = null,
  adminId = null,
  status,
  errorMessage = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    const { browser, os, deviceType } = parseUserAgent(userAgent);
    await SmsLog.create({
      mobileNumber,
      messageBody,
      smsType,
      userId,
      adminId,
      status,
      errorMessage,
      ipAddress,
      userAgent,
      browser,
      os,
      deviceType,
    });
  } catch (error) {
    console.error("Error creating SmsLog:", error);
  }
}

export async function createVistaLog(
  initTransId = null,
  userId = null,
  moduleName,
  type,
  vistaRequest = null,
  vistaResponse = null,
  status,
  cinemaId = null,
  cinemaDetails = null  
) {
  try {
    const newVistaLog = await VistaLog.create({
      initTransId,
      userId,
      moduleName,
      type,
      vistaRequest,
      vistaResponse,
      status,
      cinemaId,
      cinemaDetails
    });
    console.error("Vista log created.");
    return newVistaLog;
  } catch (error) {
    console.error("Error occurs while create VistaLog:", error);
  }
}

// send data to webhook for whatsapp Api integration with bitamin
export const sendToWebhookApi = async (initTransId) => {

      const projection = {
        "addSeatData.strBookId": 1,
        "setSeatData.strSeatInfo": 1,
        "addSeatData.curTicketsTotal": 1,
        "addSeatData.curTicketsTax1": 1,
        "addSeatData.curTicketsTax2": 1,
        cancellationStatus: 1,
        initTransId: 1,
        cinemaId: 1,
        movieId: 1,
        showId: 1,
        paymentsStatus: 1,
        userId: 1,
        commitStatus: 1,
        refundStatus: 1,
        paymentsBreakup: 1,
        "paymentResponse.id": 1,
        "paymentResponse.amount": 1,
        "paymentResponse.status": 1,
        "paymentResponse.method": 1,
        "foodAndBvgResponse.curTotal": 1,
        "foodAndBvgResponse.curTicketsTotal": 1,
        "foodAndBvgResponse.curFoodTotal": 1,
        "foodAndBvgResponse.curTicketsTax": 1,
        "foodAndBvgResponse.curFoodTax": 1,
        "foodAndBvgResponse.curTicketsTax1": 1,
        "foodAndBvgResponse.curTicketsTax2": 1,
        "foodAndBvgResponse.curFoodTax1": 1,
        "foodAndBvgResponse.curFoodTax2": 1,
        "commitBookingData.curTicketsTotal": 1,
        "commitBookingData.curTicketsTax1": 1,
        "commitBookingData.curTicketsTax2": 1,
        fAndBDetails: 1,
        createdAt: 1,
      };
  
      const bookingDetails = await Transaction.findOne(
        { initTransId },
        projection
      )
        .populate({
          path: "cinemaId",
          select: "cinemaName convenienceFees address googleUrl GSTNumber -_id",
        })
        .populate({
          path: "movieId",
          select: "name languages censorRating category -_id",
        })
        .populate({
          path: "showId",
          select: "sessionRealShow screenName -_id",
        })
        .populate({
          path: "userId",
          select: "firstName lastName email mobileNumber -_id",
        })
        .populate({
          path: "couponId",
          select:
            "couponId couponTitle discountType couponCategory discount couponUpTo couponType -_id",
        })
        .sort({ createdAt: -1 })
        .lean(); // optional but recommended for performance
  

  if (!bookingDetails) {
    console.error("No booking details found for webhook:", initTransId);
    return;
  }

  const { finalBookingCalculation, ...filteredData } = bookingDetails;

  // Inject ticket and SMS URLs for WhatsApp API template consumption
  const smsUrl = `${process.env.M_TICKET_URL}/${initTransId}`;
  const ticketUrl = `${process.env.FRONTEND_BASE_URL_PRODUCTION || 'https://ticketing.theconnplex.com'}/booking-info/${initTransId}`;
  filteredData.smsUrl = smsUrl;
  filteredData.ticketUrl = ticketUrl;
  filteredData.ticketLink = ticketUrl;

  try {
    const URL = process.env.WHATSAPP_WEBHOOK_URL || "https://api.bitamin.com/webhook/theconnplex/019dbfa5-ead7-761d-944d-9260ef66b5aa";
    const response = await axios.post(
      URL,
      filteredData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );


    // ✅ SAFE PARSE
    let parsedData;
    try {
      if (typeof response?.config?.data === "string") {
        parsedData = response?.config?.data.trim()
          ? JSON.parse(response?.config?.data)
          : {};
      } else {
        parsedData = response?.config?.data || {};
      }
    } catch {
      parsedData = { raw: response?.config?.data || null };
    }

    if(response.status === 200) {
    await WebhookResponse.create({
      initTransId,
      responseData: parsedData,
      status: "SUCCESS",
    });
  }

    return parsedData;

  } catch (error) {
    console.error("Webhook error:", error.response?.data || error.message);

    await WebhookResponse.create({
      initTransId,
      errorMessage: error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message,
      status: "FAILED",
    });

    throw error;
  }
}

export const sendPopcornOfferSMSIfEligible = async (bookingDetails, user) => {
  if (!bookingDetails || !user || !user.mobileNumber) return;

  const movieName = (bookingDetails.movieId?.name || "").toLowerCase();
  const isOdyssey = movieName.includes("odyssey") || movieName.includes("odessey");

  const cinemaName = (bookingDetails.cinemaId?.cinemaName || "").toLowerCase();
  const allowedCinemaKeywords = ["mpm", "sbr", "adani", "vaishnodevi", "vdc", "kohinoor"];
  const matchesCinema = allowedCinemaKeywords.some(keyword => cinemaName.includes(keyword));

  if (isOdyssey && matchesCinema) {
    const popcornMessage = process.env.SEND2DIGITAL_POPCORN_OFFER_MESSAGE || 
      "On buying Maharaja Tub Popcorn, you get one refill free! VCS industries limited";
    const contentId = process.env.SEND2DIGITAL_POPCORN_OFFER_CONTENTID || "1207161726359000000";

    await smsSend2Digital(
      popcornMessage,
      `+91${user.mobileNumber}`,
      contentId,
      { smsType: "POPCORN_OFFER", userId: user._id }
    );
  }
};