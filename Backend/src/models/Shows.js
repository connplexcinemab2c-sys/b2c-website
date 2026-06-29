import mongoose from "mongoose";
var show = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: false,
    },
    cinemaObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default:null,
      ref:"cinema"
    },
    pGroupObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default:null,
      ref:"price"
    },
    sessionId: {
      type: Number,
      required: false,
    },
    filmCode: {
      type: String,
      required: false,
    },
    filmObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default:null,
      ref:"movie"
    },

    screenNumber: {
      type: Number,
      required: false,
    },
    layoutId: {
      type: Number,
      required: false,
    },
    screenName: {
      type: String,
      required: false,
    },
    screenStatus: {
      type: String,
      required: false,
    },
    screenType: {
      type: String,
      required: false,
    },
    sessionRealShow: {
      type: Date,
      required: false,
    },
    sessionFinishShow: {
      type: Date,
      required: false,
    },
    pGroupCode: {
      type: String,
      required: false,
    },
    sessionSeatsAvail: {
      type: Number,
      required: false,
    },
    sessionSeatsTotal: {
      type: Number,
      required: false,
    },
    sessionSeatAllocation: {
      type: String,
      required: false,
    },
    sessionComments: {
      type: String,
      required: false,
    },
    sessionFilmFirstShow: {
      type: Date,
      required: false,
    },
    sessionHOSessionId: {
      type: String,
      required: false,
    },
    sessionAdditionalData: {
      type: String,
      required: false,
    },
    cinOperatorCode: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: false,
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

show.index({ sessionId: 1, cinemaId: 1 }, { unique: true });

const Show = mongoose.model("show", show);
export default Show;
