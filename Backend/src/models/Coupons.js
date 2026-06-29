import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponFor: [
      {
        type: String,
        enum: ["website", "app"],
      },
    ],
    couponImage: {
      type: String,
      required: false,
    },
    couponId: {
      type: String,
      required: false,
    },
    couponCategory: {
      type: String,
      required: false,
    },
    couponType: {
      type: String,
      required: false,
    },
    couponUpTo: {
      type: String,
      required: false,
    },
    couponCategory: {
      type: String,
      required: false,
    },
    couponTitle: {
      type: String,
      required: false,
    },
    couponUsage: {
      type: Number,
      required: false,
    },
    couponStartDate: {
      type: Date,
      required: false,
    },
    couponEndDate: {
      type: Date,
      required: false,
    },
    couponCodeOverAllUsage: {
      type: Number,
      required: false,
    },
    couponDescription: {
      type: String,
      required: false,
    },
    movieLanguage: [{ type: String, required: false }],
    cityId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "region",
      },
    ],
    offerStartDate: {
      type: Date,
      required: false,
    },
    cinemaObjectId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cinema",
      },
    ],
    deletedStatus: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      required: false,
    },
    discount: { type: String, required: false },
    advancedSettings: {
      mergeWithAnotherCoupon: {
        type: Number,
        default: 1,
      },
      autoApplyOnCheckOut: {
        type: Number,
        default: 1,
      },
      privateCoupon: {
        type: Number,
        default: 1,
      },
    },
    assignCoupon: {
      assignUserId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subscription",
      },
      rangeOfSpent: {
        spentForm: {
          type: Number,
        },
        spentTo: {
          type: Number,
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("coupon", couponSchema);
export default Coupon;
