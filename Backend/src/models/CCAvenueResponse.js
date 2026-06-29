import mongoose from "mongoose";
const CCAvenueResponseSchema = new mongoose.Schema(
  {
    encResp: {
      type: String,
      required: false,
    },
    orderNo: {
      type: String,
      required: false,
    },
    settingIntegrationType: {
      type: String,
      required: false,
    },
    accessCode: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

const CCAvenueResponse = mongoose.model(
  "CCAvenueResponseSchema",
  CCAvenueResponseSchema
);
export default CCAvenueResponse;
