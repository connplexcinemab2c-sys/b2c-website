import mongoose from "mongoose";
import Movie from "./Movies.js";

const MovieSliderSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: Movie,
    },
    regionId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "region",
      },
    ],
    image: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
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
    sliderType: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const MovieSlider = mongoose.model("movieslider", MovieSliderSchema);
