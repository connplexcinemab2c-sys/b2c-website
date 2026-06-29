import mongoose from "mongoose";
const BlogsSchema = new mongoose.Schema(
  {
    imageBlog: { type: String, required: false },

    title: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    deletedStatus: {
      type: Number,
      required: false,
      default: 0,
    },
    itemSequence: {
      type: Number,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

const Blogs = mongoose.model("blogsSchema", BlogsSchema);
export default Blogs;
