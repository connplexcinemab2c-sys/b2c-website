import mongoose from "mongoose";
const contactUs = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
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
    message: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
const ContactUs = mongoose.model("ContactUs", contactUs);
export default ContactUs;
