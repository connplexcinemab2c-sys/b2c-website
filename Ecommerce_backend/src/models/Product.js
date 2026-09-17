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
      enum: ["Pending", "Approved", "Rejected", "Approve", "Reject"],
      default: "Pending",
    },
    productStatus: {
      type: String,
      default: "Pending",
    },
    remark: {
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
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  if (this.status === "Approve" || this.status === "Approved") {
    this.status = "Approved";
    this.productStatus = "Approved";
  } else if (this.status === "Reject" || this.status === "Rejected") {
    this.status = "Rejected";
    this.productStatus = "Rejected";
  } else {
    this.status = "Pending";
    this.productStatus = "Pending";
  }
  next();
});

module.exports = mongoose.model("EcommerceProduct", productSchema, "ecommerce_products");
