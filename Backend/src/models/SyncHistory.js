import mongoose from "mongoose";

const SyncHistorySchema = mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    moviesAdded: {
      type: Number,
      default: 0,
    },
    showsAdded: {
      type: Number,
      default: 0,
    },
    pricesAdded: {
      type: Number,
      default: 0,
    },
    itemsAdded: {
      type: Number,
      default: 0,
    },
    totalCinemas: {
      type: Number,
      default: 0,
    },
    cinemasSynced: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const SyncHistory = mongoose.model("SyncHistory", SyncHistorySchema);

export default SyncHistory;
