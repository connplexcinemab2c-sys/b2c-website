import moment from "moment";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
    birthDate: {
      type: Date,
      default: null,
      required: false,
    },
    maritalStatus: {
      type: String,
      required: false, //true:yes  false:no
    },
    gender: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      default: null,
    },
    mobileNumber: {
      type: Number,
      required: false,
      default: null,
    },
    address: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    profile: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: false,
    },
    id: {
      type: String,
      default: false,
    },
    accessToken: {
      type: String,
      default: false,
    },
    providerId: {
      type: String,
      default: false,
    },
    otpExpiryDate: {
      type: Date,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Number,
      require: false,
      default: 0,
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
    subscriptionDetails: {
      discountOfFAndB: {
        type: String,
        required: false,
      },
      discountOnTicket: {
        type: String,
        required: false,
      },
      freeTicket: {
        type: String,
        required: false,
      },
      coins: {
        type: String,
        required: false,
      },
      welcomeGift: {
        type: String,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
      },
      title: {
        type: String,
        required: false,
      },
      isDiscounted: {
        type: Boolean,
        required: false,
      },
      discountedPrice: {
        type: Number,
        required: false,
      },
      price: {
        type: Number,
        required: false,
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("user", UserSchema);
