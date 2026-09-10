import mongoose from "mongoose";

const whatsAppCampaignRecipientSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
    has_converted: {
      type: Boolean,
      default: false,
      index: true,
    },
    converted_at: {
      type: Date,
      default: null,
    },
    order_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A phone number can only be registered once per campaign
whatsAppCampaignRecipientSchema.index({ campaign_id: 1, phone: 1 }, { unique: true });

const WhatsAppCampaignRecipient = mongoose.model(
  "WhatsAppCampaignRecipient",
  whatsAppCampaignRecipientSchema
);
export default WhatsAppCampaignRecipient;
