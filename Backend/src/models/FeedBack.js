import mongoose from "mongoose";
const feedBack = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "cinema",
    },
    city: {
      type: String,
      required: false,
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

const FeedBack = mongoose.model("feedBack", feedBack);
export default FeedBack;
