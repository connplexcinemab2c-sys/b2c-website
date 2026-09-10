import mongoose from "mongoose";

const whatsAppCampaignSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    campaign_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "draft"],
      default: "active",
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

const WhatsAppCampaign = mongoose.model("WhatsAppCampaign", whatsAppCampaignSchema);
export default WhatsAppCampaign;
