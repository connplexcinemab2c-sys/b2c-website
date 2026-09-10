import mongoose from "mongoose";

export const whatsAppOrderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      index: true,
    },
    product_id: {
      type: String,
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Ticket", "Snack", "Other"],
      default: "Other",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const whatsAppOrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    initTransId: {
      type: String,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    utm_source: {
      type: String,
      default: "whatsapp",
      trim: true,
      lowercase: true,
      index: true,
    },
    utm_campaign: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    is_conversion: {
      type: Boolean,
      default: false,
      index: true,
    },
    conversion_matched_at: {
      type: Date,
      default: null,
    },
    items: [whatsAppOrderItemSchema],
    transactionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppOrderItem = mongoose.model(
  "WhatsAppOrderItem",
  whatsAppOrderItemSchema
);

export const WhatsAppOrder = mongoose.model(
  "WhatsAppOrder",
  whatsAppOrderSchema
);

export default WhatsAppOrder;
