import mongoose from "mongoose";

const LoginActivitySchema = new mongoose.Schema(
  {
    loginStatus: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "user",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "admin",
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

export const LoginActivity = mongoose.model("loginactivity", LoginActivitySchema);
