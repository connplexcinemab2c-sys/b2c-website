const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    businessPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    addressName: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    zipcode: {
      type: String,
      default: "",
    },
    pocName: {
      type: String,
      default: "",
    },
    pocPhoneNumber: {
      type: String,
      default: "",
    },
    bankName: {
      type: String,
      default: "",
    },
    accountNumber: {
      type: String,
      default: "",
    },
    ifscCode: {
      type: String,
      default: "",
    },
    gstNumber: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedStatus: {
      type: Number,
      default: 0,
    },
    businessHours: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EcommerceSeller", sellerSchema, "ecommerce_sellers");
