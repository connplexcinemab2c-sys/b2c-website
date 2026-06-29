import mongoose from "mongoose";
const advertisement = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    websiteName:{
      type: String,
      required: false,
    },
    designation:{
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    file: {
      type: String,
      required: false,
    },
    filebg: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Advertisement = mongoose.model("advertisement", advertisement);
export default Advertisement;
