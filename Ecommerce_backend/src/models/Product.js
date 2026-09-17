const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceCategory",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceSeller",
      required: true,
    },
    maximumPurchaseQty: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
    },
    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("EcommerceProduct", productSchema, "ecommerce_products");
