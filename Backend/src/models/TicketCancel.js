import mongoose from "mongoose";

let ticketCancel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "show",
    },
    initTransId: {
      type: String,
      required: false,
    },
    cancelTicketData: {
      type: Object,
      required: false,
    },
    paymentsBreakup: {
      type: Object,
      required: false,
    },
    refundResponse: {
      type: Object,
      required: false,
    },
    status: {
      type: Number, //(1=>booked,2=>cancelled,3=>refunded)
      required: false,
      default: 0,
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

const TicketCancel = mongoose.model("ticketCancel", ticketCancel);
export default TicketCancel;