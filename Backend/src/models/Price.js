import mongoose from "mongoose";
var price = new mongoose.Schema(
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
    pGroupCode: {
      type: String,
      required: false,
    },
    tTypeCode: {
      type: String,
      required: false,
    },
    areaCatCode: {
      type: String,
      required: false,
    },
    bFeeCode: {
      type: String,
      required: false,
    },
    tTypeDescription: {
      type: String,
      required: false,
    },
    tTypeDescriptionAlt: {
      type: String,
      required: false,
    },
    priceSequence: {
      type: Number,
      required: false,
    },
    currentPrice: {
      type: Number,
      required: false,
    },
    priceChildTicket: {
      type: String,
      required: false,
    },
    pricePackage: {
      type: String,
      required: false,
    },
    priceComp: {
      type: String,
      required: false,
    },
    priceEffectFrom: {
      type: Date,
      required: false,
    },
    priceEffectTill: {
      type: Date,
      required: false,
    },
    priceTax1: {
      type: Number,
      required: false,
    },
    priceTax2: {
      type: Number,
      required: false,
    },
    priceTax3: {
      type: Number,
      required: false,
    },
    priceTax4: {
      type: Number,
      required: false,
    },
    priceAdditionalData: {
      type: String,
      required: false,
    },
    tTypeHOCode: {
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

price.index(
  {
    cinemaId: 1,
    pGroupCode: 1,
    tTypeCode: 1,
    areaCatCode: 1,
    bFeeCode: 1,
  },
  { unique: true }
);

const Price = mongoose.model("price", price);
export default Price;
