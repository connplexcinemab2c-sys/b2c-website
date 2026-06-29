import mongoose from "mongoose";

const SiteSettingSchema = new mongoose.Schema(
  {
    showExtendedDays: {
      type: Number,
      required: false,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    stopPayment:{
      type: Boolean,
      required: false,
      default: false,
    }
  },
  { timestamps: true }
);

export const SiteSetting = mongoose.model("siteSetting", SiteSettingSchema);
