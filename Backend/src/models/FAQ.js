import mongoose from "mongoose";
const faq = new mongoose.Schema(
  {
    question: {
      type: String,
      required: false,
    },
    answer: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const Faqs = mongoose.model("faq", faq);
export default Faqs;
