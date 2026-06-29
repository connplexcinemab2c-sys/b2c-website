import mongoose from "mongoose";

const userSettingSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    nowPlayingMovies: {
      type: Boolean,
      default: false,
    },
    upCommingMovies: {
      type: Boolean,
      default: false,
    },
    upCommingBookings: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserSetting = mongoose.model("userSetting", userSettingSchema);
export default UserSetting;
