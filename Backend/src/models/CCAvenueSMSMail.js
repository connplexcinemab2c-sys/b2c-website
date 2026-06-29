import mongoose from "mongoose";
const CCAvenueSMSMailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
    },
    mobileNumber: {
      type: Number,
      required: false,
    },
    initTransId: {
      type: String,
      required: false,
    },

    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

const CCAvenueSMSMail = mongoose.model(
  "CCAvenueSMSMailSchema",
  CCAvenueSMSMailSchema
);
export default CCAvenueSMSMail;
