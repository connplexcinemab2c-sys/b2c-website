import mongoose from "mongoose";

const groupBooking = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    name: {
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
      default: null,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "cinema",
    },
    noOfPax: {
      type: Number,
      required: false,
    },
    bookingDate: {
      type: Date,
      required: false,
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

const GroupBooking = mongoose.model("groupBooking", groupBooking);
export default GroupBooking;
