const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EcommerceCategory",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isColor: {
      type: Boolean,
      default: false,
    },
    multiselect: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        value: { type: String, default: "" },
        name: { type: String, default: "" },
        colorCode: { type: String, default: "" },
      },
    ],
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

module.exports = mongoose.model("EcommerceAttribute", attributeSchema, "ecommerce_attributes");
