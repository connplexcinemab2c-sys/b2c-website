import mongoose from "mongoose";
const cms = new mongoose.Schema(
  {
    privacyPolicy: {
      type: String,
      required: false,
    },
    termsCondition: {
      type: String,
      required: false,
    },
    refundPolicy: {
      type: String,
      required: false,
    },
    aboutUs: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    legal_notice:{
      type: String,
      required: false,
    },
    membership_terms_and_conditions:{
      type:String,
      required:false
    }
  },
  {
    timestamps: true,
  }
);

const Cms = new mongoose.model("cms", cms);
export default Cms;
