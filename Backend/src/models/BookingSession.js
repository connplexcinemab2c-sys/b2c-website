import mongoose from "mongoose";

const bookingSessionSchema = new mongoose.Schema(
  {
    initTransId: {
      type: String,
    },
    sessionEndTime: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const BookingSession = mongoose.model("BookingSession", bookingSessionSchema);
export default BookingSession;
