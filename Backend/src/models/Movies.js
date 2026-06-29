import mongoose from "mongoose";
var movie = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: false,
    },
    cinemaObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "cinema",
    },
    filmCode: {
      type: String,
      required: false,
    },
    uniqueFilmCode: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    censorRating: {
      type: String,
      required: false,
    },
    filmContent: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    shortName: {
      type: String,
      required: false,
    },
    signText: {
      type: String,
      required: false,
    },
    filmSignSequence: {
      type: Number,
      required: false,
    },
    filmCategoryCode: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    filmCategoryShortName: {
      type: String,
      required: false,
    },
    children: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    filmStatus: {
      type: String,
      required: false,
    },
    filmUpcomingFlag: {
      type: String,
      required: false,
    },
    filmFeatureFlag: {
      type: String,
      required: false,
    },
    filmNowShowingFlag: {
      type: String,
      required: false,
    },
    filmOpeningDate: {
      type: Date,
      required: false,
    },
    filmDescriptionLong: {
      type: String,
      required: false,
    },
    youtubeVideoUrl: {
      type: String,
      required: false,
    },
    releseDate: {
      type: Date,
      required: false,
    },
    bookingOpeningDate: {
      type: Date,
      required: false,
    },
    cast: {
      type: String,
      required: false,
    },
    movieCategory: {
      type: String,
      required: false,
    },
    movieType: {
      type: String,
      required: false,
      default: "2D",
    },
    director: {
      type: String,
      required: false,
    },
    languages: {
      type: String,
      required: false,
    },
    poster: {
      type: String,
      required: false,
      default: "",
    },
    images: {
      type: Array,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: Number, //now playing :1   upcoming:2
      required: false,
      default: 0,
    },
    trending: {
      type: Number, //yes:1   no:0
      required: false,
      default: 0,
    },
    topFour: {
      type: Number, //yes:1   no:0
      required: false,
      default: 0,
    },
    convenienceFees: {
      type: Number,
      required: false,
      default: 0,
    },
    convenienceGST: {
      type: Number,
      required: false,
      default: 0,
    },
    starCast: [
      {
        starCastId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "persons",
        },
      },
    ],
    crew: [
      {
        starCastId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: "persons",
        },
      },
    ],
    rating: {
      type: Number,
      required: false,
      default: 0,
    },
    averageRating: {
      type: Number,
      required: false,
      default: 0,
    },
    likes: {
      type: Number,
      required: false,
      default: 0,
    },
    totalLikes: {
      type: Number,
      required: false,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    isCategoryEdit: {
      type: Boolean,
      required: false,
      default: false,
    },
    isDurationEdit: {
      type: Boolean,
      required: false,
      default: false,
    },
    linkedNowPlayingMovieCode: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model("movie", movie);
export default Movie;
