const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceSeller",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EcommerceProduct",
        },
        productName: String,
        quantity: Number,
        price: Number,
        attributes: mongoose.Schema.Types.Mixed,
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["Processing", "Dispatched", "Delivered", "Cancelled", "Returned"],
      default: "Processing",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    tracking: {
      trackingNumber: String,
      carrier: String,
      status: String,
      history: Array,
    },
    returnRequest: {
      isRequested: { type: Boolean, default: false },
      reason: String,
      status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      requestedAt: Date,
    },
    deletedStatus: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EcommerceOrder", orderSchema, "ecommerce_orders");
