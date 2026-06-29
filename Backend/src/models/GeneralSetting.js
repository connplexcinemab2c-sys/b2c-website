import mongoose from "mongoose";
const GeneralSettingSchema = new mongoose.Schema({
  facebookUrl: {
    type: String,
    Required: false,
  },
  twitterUrl: {
    type: String,
    Required: false,
  },
  pintrestUrl: {
    type: String,
    Required: false,
  },
  instagramUrl: {
    type: String,
    Required: false,
  },
  youtubeUrl: {
    type: String,
    Required: false,
  },
  linkedInUrl: {
    type: String,
    Required: false,
  },
  address1: {
    type: String,
    Required: false,
  },
  address2: {
    type: String,
    Required: false,
  },
  email: {
    type: String,
    Required: false,
  },
  contactNumber1: {
    type: Number,
    Required: false,
  },
  contactNumber2: {
    type: Number,
    Required: false,
  },
  yearOfExperience:{
    type: Number,
    Required: false,
  },
  noOfTheaterScreen:{
    type: Number,
    Required: false,
  },
  companyName:{
    type: String,
    Required: false,
  },
  underMaintenance:{
    type: Boolean,
    default:false
  },
  isWelcomeGift:{
    type: Boolean,
    default:false
  },
  ticketsRequired:{
    type: Number,
    default:false
  },
  stopPayment:{
      type: Boolean,
      required: false,
      default: false,
    }
});

const GeneralSetting = mongoose.model("GeneralSetting", GeneralSettingSchema);

export default GeneralSetting;
