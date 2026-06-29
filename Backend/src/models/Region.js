import mongoose from "mongoose";
var RegionSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    lat: {
      type: String,
      required: false,
    },
    long: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: false,
    },
  },

  {
    timestamps: true,
  }
);

export const Region = mongoose.model("region", RegionSchema);
