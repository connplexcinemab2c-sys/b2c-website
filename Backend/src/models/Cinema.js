import mongoose from "mongoose";
const CinemaSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: false,
    },
    cinemaName: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    images: {
      type: Array,
      required: false,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "region",
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    emailId: {
      type: String,
      required: false,
    },
    cinemaPromoUrl:{
      type: String,
      required: false,
    },
    googleUrl: {
      type: String,
      required: false,
    },
    cinemaAmenities: {
      type: Array,
      required: false,
    },
    cinemaLastDataRefresh: {
      type: Date,
      required: false,
    },
    cinemaWebServiceUrl: {
      type: String,
      required: false,
    },
    cinemaWebServiceUrl2: {
      type: String,
      required: false,
    },
    cinemaBranchCode:{
      type: String,
      required: false,
    },
    
    cinemaWebServiceUrl3: {
      type: String,
      required: false,
    },
    cinemaWebServiceLogin: {
      type: String,
      required: false,
    },
    cinemaWebServicePWD: {
      type: String,
      required: false,
    },
    cinemaLicenseName: {
      type: String,
      required: false,
    },
    cinemaLicenseNumber: {
      type: String,
      required: false,
    },
    websiteLicenseNumber: {
      type: Number,
      required: false,
    },
    cinemaIsOnline: {
      type: String,
      required: false,
    },
    cinemaSyncSequence: {
      type: Number,
      required: false,
    },
    cinemaWebServiceVersion: {
      type: String,
      required: false,
    },
    cinemaVistaRemoteVersion: {
      type: String,
      required: false,
    },
    cinemaBranchCode: {
      type: String,
      required: false,
    },
    displayName: {
      type: String,
      required: false,
    },
    convenienceFees: {
      type: Number,
      required: false,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      required: false,
      default: 0,
    },
    convenienceGST: {
      type: Number,
      required: false,
      default: 0,
    },
    GSTNumber: {
      type: String,
      required: false,
    },
    lastSync: {
      type: Date,
      required: false,
      default: Date.now(),
    },
    lastSyncStatus: {
      type: Boolean,
      required: false,
      default: false,
    },
    poster: {
      type: String,
      required: false,
      default: "",
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    cinema_images: [
      {
        type: String,
        required: false,
      },
    ],
    lat:{
      type: String,
      required: false,
    },
    long:{
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

export const Cinema = mongoose.model("cinema", CinemaSchema);
export default Cinema;
