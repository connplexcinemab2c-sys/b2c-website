const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedStatus: {
      type: Number,
      default: 0, // 0 = active, 1 = deleted
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EcommerceCategory", categorySchema, "ecommerce_categories");
