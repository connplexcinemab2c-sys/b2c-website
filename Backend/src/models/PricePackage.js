import mongoose from "mongoose";
var pricePackage = new mongoose.Schema(
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
    pPackCode: {
      type: String,
      required: false,
    },
    pGroupCode: {
      type: String,
      required: false,
    },
    tTypeCode: {
      type: String,
      required: false,
    },
    tTypeChildCode: {
      type: String,
      required: false,
    },
    itemStrItemId: {
      type: String,
      required: false,
    },
    pPackQuantity: {
      type: Number,
      required: false,
    },
    pPackPriceEach: {
      type: Number,
      required: false,
    },
    pPackStamp: {
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

    pricePackage.index(
    {
    cinemaId: 1,
    pPackCode: 1,
    pGroupCode: 1,
    tTypeCode: 1,
    },
    { unique: true }
    );

    const PricePackage = mongoose.model("pricePackage", pricePackage);
export default PricePackage;
