import mongoose from "mongoose";
let transaction = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },

    couponId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "AppliedCoupon",
      },
    ],
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "cinema",
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "movie",
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "show",
    },
    initTransId: {
      type: String,
      required: false,
    },
    addSeatData: {
      type: Object,
      required: false,
    },
    setSeatData: {
      type: Object,
      required: false,
    },
    paymentDetail: {
      type: Object,
      required: false,
    },
    commitBookingData: {
      type: Object,
      required: false,
    },
    paymentResponse: {
      type: Object,
      default: null,
    },
    refundResponse: {
      type: Object,
      default: null,
    },
    paymentsBreakup: {
      type: Object,
      required: false,
    },
    status: {
      type: Number, //(1=>booked,2=>cancelled,3=>refunded,4=>paymentDoneBookingFailed 5=>paymentFailed 6=>transTimeout payment success but vista not done , 7=>Cancelled)
      required: false,
      default: 0,
    },
    paymentsStatus: {
      type: Boolean,
      required: false,
    },
    commitStatus: {
      type: Boolean,
      required: false,
    },
    refundStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    cancellationStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    refundPolicy: {
      type: String,
      required: false,
    },
    refundAmount: {
      type: Number,
      required: false,
    },
    razorpayOrderId: {
      type: String,
      required: false,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
    },
    razorpaySignature: {
      type: String,
      required: false,
    },
    refundNote: {
      type: String,
      required: false,
    },
    foodAndBvgResponse: {
      type: Object,
      default: null,
    },
    fAndBDetails: [
      {
        itemId: { type: String, required: false },
        name: { type: String, required: false },
        quantity: { type: Number, required: false },
        price: { type: Number, required: false },
        itemMasterItemCode:{ type: String, required: false },
        itemPrice: { type: Number, required: false },
        itemPriceByQuantity: { type: Number, required: false },
        
      },
    ],
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    booking_type: {
      type: String,
      enum: ["iOS", "Android", "Web"],
      required: false,
    },
    paymentFrom: {
      type: String,
      required: false,
    },
    finalBookingCalculation: {
      type: Object,
      required: false,
    },
    discountCouponStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    logs: {
      type: Object, //initBooking, proceedToPay
      required: false,
    },
    vistaErrorResponse: {
      type: Object,
      required: false,
    },
    coupan: {
      coupanCode: {
        type: String,
      },
      lngSessionId: {
        type: String,
      },
      discountOn: {
        type: String,
      },
      discountValue: {
        type: Number,
      },
    },
    bookedFrom: {
      type: String,
      enum: ["ios", "android", "web"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("transaction", transaction);
export default Transaction;
