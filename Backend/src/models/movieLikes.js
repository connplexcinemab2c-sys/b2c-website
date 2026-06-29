import mongoose from "mongoose";
var movieLikeSchema = new mongoose.Schema(
  {
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
    isLiked: {
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
const MovieLikes = mongoose.model("movieLikes", movieLikeSchema);
export default MovieLikes;
