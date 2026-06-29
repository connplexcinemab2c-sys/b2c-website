import mongoose from "mongoose";
const reportIssueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "user",
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    transaction_type: {
      type: String,
      required: false,
    },
    cinemaObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "cinema",
    },
    attachImage: [
      {
        type: String,
        required: false,
      },
    ],
    date: {
      type: Date,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);
const ReportIssue = mongoose.model("reportIssue", reportIssueSchema);
export default ReportIssue;
