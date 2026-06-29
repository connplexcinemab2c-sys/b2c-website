import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    banner: {
      type: String,
      required: false,
    },
    bannerLink: {
      type: String,
      required: false,
    },
    bannerShowSection: {
      type: Array,
      required: false,
    },
    bannerType: {
      type: String,    
      required: false,
    },
    userClickCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
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

const Banner = mongoose.model("banner", bannerSchema);

export default Banner;
