import mongoose from "mongoose";

const RewardsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription",
      required: false,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
    },

    type: {
      type: String,
      enum: ["earned", "redeemed"],
      default: "earned",
    },
    coins: {
      type: Number,
      required: true,
    },
    redeemCoins: {
      type: Number,
      default: 0,
    },
    remainingCoins: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    deletedStatus: {
      type: Number,
      default: 0,
    },
    // On earned entries: per-transaction deduction history
    redemptionLog: [
      {
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "transaction",
          required: false,
        },
        rewardEntryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "rewards",
          required: false,
        },
        coinsUsed: { type: Number, required: true },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    // On redeemed entries: which earned entries were consumed (FIFO split)
    sourceEntries: [
      {
        earnedRewardId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "rewards",
          required: false,
        },
        coinsDeducted: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Rewards = mongoose.model("rewards", RewardsSchema);

export default Rewards;
