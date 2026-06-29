import mongoose from "mongoose";

const vistaLogSchema = new mongoose.Schema(
  {
    initTransId: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    moduleName: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    vistaRequest: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    vistaResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    cinemaId:{
      type: String, 
      required: false,
    },
    cinemaDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
        type: String,
    }
  },
  {
    timestamps: true,
  }
);

const VistaLog = mongoose.model("VistaLog", vistaLogSchema);

export default VistaLog;
