import mongoose from "mongoose";
const twentyMinFranchiseLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
const TwentyMinFranchiseLead = mongoose.model(
  "TwentyMinuteFranchiseLead",
  twentyMinFranchiseLeadSchema
);
export default TwentyMinFranchiseLead;
