import mongoose from "mongoose";
const franchiseLeadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    jobTitle: {
      type: String,
      required: false,
    },
    company: {
      type: String,
      required: false,
    },
    franchiseLocation: {
      type: String,
      required: false,
    },

    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["initiated", "success", "failed", "aborted", "pending", "unknown"],
      required: false,
    },

    paymentResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paymentLogs: [
      {
        _id: false,
        step: String,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sentToZoho: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
const FranchiseLead = mongoose.model("franchiseLead", franchiseLeadSchema);
export default FranchiseLead;
