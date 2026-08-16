import mongoose from "mongoose";

const whatsappBookingSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: null,
    },
    cinemaName: {
      type: String,
      default: null,
    },
    movieName: {
      type: String,
      default: null,
    },
    showTime: {
      type: String,
      default: null,
    },
    seats: {
      type: [String],
      default: [],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    bookingId: {
      type: String,
      default: null,
      index: true,
    },
    rawPayload: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WhatsAppBooking = mongoose.model("WhatsAppBooking", whatsappBookingSchema);
export default WhatsAppBooking;
