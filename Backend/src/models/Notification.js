import mongoose from "mongoose";
const notificationschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      required: false,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    notificationType: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model("notification", notificationschema);
