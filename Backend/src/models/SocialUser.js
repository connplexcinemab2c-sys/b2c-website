import mongoose from "mongoose";

const SocialLoginUser = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      default: "",
    },
    lastName: {
      type: String,
      required: false,
      default: "",
    },
    email: {
      type: String,
      required: false,
      default: null,
    },
    providerId: {
      type: String,
      default: false,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    login_type: {
      type: String,
      enum: ["iOS", "Android", "Web"],
      required: false,
    },
    registeredFrom: {
      type: String,
      enum: ["ios", "android", "web"],
      required: false,
    },
  },
  { timestamps: true }
);

export const SocialUser = mongoose.model("socialUser", SocialLoginUser);
