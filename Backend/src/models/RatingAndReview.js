import mongoose from "mongoose";
var RatingAndReviewSchema = new mongoose.Schema(
  {
    movieRate: {
      type: Number,
      required: false,
    },
    connplexRate: {
      type: Number,
      required: false,
    },
    movieReview: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "movie",
    },
    isActive: {
      type: Boolean,
      default: true,
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
const RatingAndReview = mongoose.model(
  "ratingAndReview",
  RatingAndReviewSchema
);
export default RatingAndReview;
