import mongoose from "mongoose";
const LogsSchema = mongoose.Schema(
  { 
    title:{
      type: String,
      required: false,
    },
    lastSync: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "movie",
      required: false,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cinema",
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
      default: "",
    },
    webBrowser: {
      type: String,
      required: false,
      default: "",
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

const Logs = mongoose.model("Logs", LogsSchema);

export default Logs;
