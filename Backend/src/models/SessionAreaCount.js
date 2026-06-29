import mongoose from "mongoose";
var seatAvilFilterSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: false,
    },
    sessionId: {
      type: Number,
      required: false,
    },
    area: {
      type: String,
      required: false,
    },
    seatsAvail: {
      type: Number,
      required: false,
    },
    seatsTotal: {
      type: Number,
      required: false,
    },
    seatAllocation: {
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

const SeatFilter = mongoose.model("seatAvailfilter", seatAvilFilterSchema);
export default SeatFilter;