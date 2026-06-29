import mongoose from "mongoose";
var item = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: false,
    },
    cinemaObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "cinemas",
    },
    itemId: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    itemDescription: {
      type: String,
      required: false,
    },
    oldItemDescription: {
      type: String,
      required: false,
    },
    itemPrice: {
      type: Number,
      required: false,
    },
    itemMasterItemCode: {
      type: String,
      required: false,
    },
    itemAdditionalData: {
      type: String,
      required: false,
    },
    itemTax1: {
      type: Number,
      required: false,
    },
    itemTax2: {
      type: Number,
      required: false,
    },
    itemTax3: {
      type: Number,
      required: false,
    },
    itemTax4: {
      type: Number,
      required: false,
    },
    itemPackage: {
      type: String,
      required: false,
    },
    cinemaOprCode: {
      type: String,
      required: false,
    },
    poster: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    itemDateStamp: {
      type: Date,
      required: false,
    },
    classCode1: {
      type: String,
      required: false,
    },
    classDesc1: {
      type: String,
      required: false,
    },
    classCode2: {
      type: String,
      required: false,
    },
    classDesc2: {
      type: String,
      required: false,
    },
    classCode3: {
      type: String,
      required: false,
    },
    classDesc3: {
      type: String,
      required: false,
    },
    itemSequence: {
      type: Number,
      required: false,
    },
    isEdit: {
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

const Item = mongoose.model("item", item);
export default Item;
