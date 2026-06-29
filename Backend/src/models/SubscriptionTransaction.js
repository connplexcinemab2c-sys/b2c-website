import mongoose from "mongoose";
let subscriptiontransaction = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "subscription",
    },

    initTransId: {
      type: String,
      required: false,
    },

    paymentDetail: {
      type: Object,
      required: false,
    },

    paymentResponse: {
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
      default: false,
    },
    coupon: {
      type: {
        couponCode: {
          type: String,
          required: false,
        },
        couponDiscount: {
          type: String,
          required: false,
        },
      },
      default: null,
    },

    razorpayOrderId: {
      type: String,
      required: false,
    },

    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },

    paymentFrom: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionTransaction = mongoose.model(
  "SubscriptionTransaction",
  subscriptiontransaction
);
export default SubscriptionTransaction;
