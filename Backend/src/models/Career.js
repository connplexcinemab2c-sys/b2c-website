import mongoose from "mongoose";
const career = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
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
    city: {
      type: String,
      required: false,
    },
    position: {
      type: String,
      required: false,
    },
    resume: {
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

const Career = mongoose.model("career", career);
export default Career;
