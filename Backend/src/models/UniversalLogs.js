import mongoose from "mongoose";

const UniversalLogs = new mongoose.Schema(
  {db_transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }},
  {
    strict: false,
    timestamps: true,
  }
);

const LogsModel = mongoose.model("UniversalLogs", UniversalLogs);

export default LogsModel;
