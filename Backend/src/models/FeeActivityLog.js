import mongoose from "mongoose";
const feeActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "admin",
    },
    globalConvienceFee: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const FeeActivityLog = mongoose.model("FeeActivityLog", feeActivityLogSchema);
export default FeeActivityLog;
