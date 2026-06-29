import mongoose from "mongoose";
var memberShip = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    file: {
      type: String,
      required: false,
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

const MemberShip1 = mongoose.model("memberShip1", memberShip);
export default MemberShip1;
