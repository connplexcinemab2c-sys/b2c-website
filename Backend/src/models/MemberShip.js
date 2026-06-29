import mongoose from "mongoose";
var memberShip = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "subscription",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
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
  },
  {
    timestamps: true,
  }
);

const MemberShip = mongoose.model("memberShip", memberShip);
export default MemberShip;
