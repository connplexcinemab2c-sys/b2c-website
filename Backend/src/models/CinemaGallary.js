import mongoose from "mongoose";
const cinemaGallarySchema = new mongoose.Schema(
  {
    poster: {
      type: String,
      required: false,
      default: "",
    },
    imageGallery: [
      {
        poster: { type: String, required: false },
        status: {
          type: Boolean,
          required: false,
          default: true,
        },
      },
    ],
    title: {
      type: String,
      required: false,
    },
    subTitle: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    type : {
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

const CinemaGallary = mongoose.model("cinemaGallary", cinemaGallarySchema);
export default CinemaGallary;
