import mongoose from "mongoose";
let movieInterestedSchema = new mongoose.Schema(
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
    isInterested: {
      type: Boolean,
      default: false,
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
const MovieInterested = mongoose.model("movieInterested", movieInterestedSchema);
export default MovieInterested;
