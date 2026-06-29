import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: false,
    },
    address: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    type: {
      type: String,
      enum: ["Admin", "SubAdmin"],
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "role",
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cinema",
      default: null,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("admin", AdminSchema);
