import mongoose from "mongoose";
const globalnotificationschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    date: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    time: {
      type: String,
      required: false,
    },
    cinemaIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cinemas",
        required: false,
      },
    ],
    description: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    isSend: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const GlobalNotification = mongoose.model(
  "globalnotification",
  globalnotificationschema
);
