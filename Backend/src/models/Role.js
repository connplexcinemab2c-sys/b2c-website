import mongoose from "mongoose";
const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: false,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deleteStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    permissions: {
      type: Array,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("role", roleSchema);
export default Role;
