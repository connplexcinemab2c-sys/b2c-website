import mongoose from "mongoose";

const influencer = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
      default: null,
    },
    instagramUsername: {
      type:String,
      required: false,
    },
    youTube: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
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

const Influencer = mongoose.model("influencer", influencer);
export default Influencer;
