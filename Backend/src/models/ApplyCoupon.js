import mongoose from "mongoose";
var applyCouponSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    couponId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "coupon",
      },
    ],
    // isActive: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);
const ApplyCoupon = mongoose.model("applyCoupon", applyCouponSchema);
export default ApplyCoupon;
