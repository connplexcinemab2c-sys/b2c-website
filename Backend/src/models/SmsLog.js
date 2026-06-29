import mongoose from "mongoose";

const smsLogSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      default: null,
    },
    smsType: {
      type: String,
      default: null,
      enum: [
        "OTP_LOGIN",
        "OTP_ADMIN_LOGIN",
        "OTP_UPDATE_PROFILE",
        "WELCOME",
        "BOOKING_CONFIRMATION",
        "TICKET_CANCELLATION",
        "REFUND_NOTIFICATION",
        "FAILED_TRANSACTION",
        "GROUP_BOOKING",
        "FRANCHISE_APPLICATION",
        "INFLUENCER_APPLICATION",
        "CONTACT_US",
        "FEEDBACK",
        "CAREER_APPLICATION",
        "ADVERTISEMENT",
        "COUPON_DISTRIBUTION",
        null,
      ],
    },
    messageBody: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAILED"],
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["MOBILE", "TABLET", "DESKTOP", "UNKNOWN"],
      default: "UNKNOWN",
    },
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    deletedStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const SmsLog = mongoose.model("smslog", smsLogSchema);

export default SmsLog;
