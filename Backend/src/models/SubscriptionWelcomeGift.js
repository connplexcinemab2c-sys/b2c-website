import mongoose from "mongoose";

const subscriptionWelcomeGiftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    subscriptionMembershipId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      required: false,
      ref: "subscriptionMembership",
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "cinema",
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    collectBeforeDate: {
      type: Date,
      required: true,
    },
    dateOfCollection: {
      type: Date,
      required: false,
    },
    type: {
      type: String,
      required: true,
      enum: ["ticket",, "membership"],
      default: "membership",
    },
    status: {
      type: String,
      required: true,
      enum: ["issued", "received", "expired"],
      default: "issued",
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SubscriptionWelcomeGift = mongoose.model(
  "SubscriptionWelcomeGift",
  subscriptionWelcomeGiftSchema
);

export default SubscriptionWelcomeGift;
