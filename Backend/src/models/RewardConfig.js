import mongoose from "mongoose";

const rewardConfigSchema = new mongoose.Schema(
  {
    earnRate: {
      type: Number,
      default: 10,
    },
    conversionPoints: {
      type: Number,
      default: 100,
    },
    conversionValue: {
      type: Number,
      default: 10,
    },
    maxRedemptionCap: {
      type: Number,
      default: 1000,
    },
    expiryRule: {
      type: String,
      enum: ["fixed", "rolling"],
      default: "fixed",
    },
    expiryDays: {
      type: Number,
      default: 90,
    },
    expiringSoonDays: {
      type: Number,
      default: 30,
    },
    fixedExpiryDate: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const RewardConfig = mongoose.model("rewardConfig", rewardConfigSchema);

export default RewardConfig;
