import mongoose from "mongoose";

const webhookResponseSchema = new mongoose.Schema(
  {
    initTransId: {
      type: String,
      required: true,
      index: true,
    },
    responseData: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WebhookResponse = mongoose.model("WebhookResponse", webhookResponseSchema);
export default WebhookResponse;
