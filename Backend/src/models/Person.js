import mongoose from "mongoose";
var PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    profile: {
      type: String,
      required: false,
      default:""
    },
    type: {
      type: String,
      required: false,
    },
    // category: {
    //   type: String,
    //   required: false,
    // },
    category: {
      type: Array,
      required: false,
    },
    about: {
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

export const Person = mongoose.model("persons", PersonSchema);
