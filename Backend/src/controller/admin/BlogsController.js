import fs from "fs";
import Blogs from "../../models/Blogs.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import { handleErrorResponse } from "../../services/CommanService.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

//#region Add/Edit Blogs

export const addEditBlogs = async (req, res) => {
  try {
    let { id, title, description, itemSequence } = req.body;

    // Check if a blog with the same title already exists (excluding the current one if editing)
    let exist = await Blogs.findOne({
      title,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.THIS_BLOGS_ALREADY_EXIST,
        data: [],
      });
    }
    if (itemSequence) {
      // Check if a blog with the same itemSequence already exists
      let sequenceExist = await Blogs.findOne({
        itemSequence,
        deletedStatus: 0,
      });
      if (sequenceExist && (!id || sequenceExist._id.toString() !== id)) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.ITEM_SEQUENCE_ALREADY_EXIST,
          data: [],
        });
      }
    }

    if (id) {
      let already = await Blogs.findOne({
        _id: { $ne: id },
        title,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.THIS_BLOGS_ALREADY_EXIST,
          data: [],
        });
      } else {
        let existingData = await Blogs.findById({ _id: id });

        if (existingData) {
          if (req.files && req.files.imageBlog) {
            if (existingData.imageBlog) {
              // fs.unlink("./public/uploads/" + existingData.imageBlog, () => {});
              await deleteS3File(existingData.imageBlog);
            }
            req.blogsUrl = req.files.imageBlog[0].key;
          } else if (req.body.removePosterUrl) {
            // fs.unlink("./public/uploads/" + req.body.removePosterUrl, () => {});
            await deleteS3File(req.body.removePosterUrl);
            existingData.imageBlog = "";
            await existingData.save();
          } else {
            req.blogsUrl = existingData.imageBlog;
          }
          let updateFields = {
            title,
            description,
            imageBlog: req.blogsUrl,
          };

          // Conditionally update itemSequence
          if (itemSequence !== undefined) {
            updateFields.itemSequence = itemSequence;
          } else {
            updateFields.$unset = { itemSequence: 1 };
          }
          let updated = await Blogs.findByIdAndUpdate(
            { _id: id },
            {
              $set: updateFields,
            },
            { new: true }
          );
          if (!updated) {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: ResponseMessage.BAD_REQUEST,
              data: [],
            });
          } else {
            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.BLOGS_UPDATED,
              data: updated,
            });
          }
        } else {
          return res.status(404).json({
            status: StatusCodes.NOT_FOUND,
            message: ResponseMessage.BLOG_NOT_FOUND,
            data: [],
          });
        }
      }
    } else {
      const newBlog = new Blogs({
        title,
        description,
        itemSequence: itemSequence || null,
        imageBlog: req.files.imageBlog && req.files.imageBlog[0].filename,
      });

      const addGallary = await newBlog.save();
      if (!addGallary) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.BLOGS_ADDED,
          data: addGallary,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region get Blogs
export const getBlogs = async (req, res) => {
  try {
    let { id } = req.body;
    let getBlogs;
    if (id) {
      getBlogs = await Blogs.findById({
        _id: id,
      });
    } else {
      getBlogs = await Blogs.find({
        deletedStatus: 0,
      }).sort({ createdAt: "-1" });
    }
    if (getBlogs) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BLOG_DETAILS,
        data: getBlogs,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ERROR_IN_RETRIEVING_DATA_FROM_API,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region add Images In Blogs
export const addImagesInBlogs = async (req, res) => {
  try {
    let { id, imageId } = req.body;
    const blogs = await Blogs.findById({ _id: id });
    if (id && imageId) {
      let image = blogs.blogGallery.find(
        (ele) => ele._id.toString() === imageId
      );
      if (req.files.imageBlog) {
        // fs.unlink("./public/uploads/" + image.imageBlog, () => {});
        await deleteS3File(image.imageBlog);
      } else {
        req.blogsUrl = image.imageBlog;
      }
      await Blogs.updateOne(
        { _id: id, "blogGallery._id": imageId },
        {
          $set: {
            "blogGallery.$.imageBlog": req.blogsUrl,
          },
        },
        { new: true }
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BLOGS_IMAGE_UPDATED,
        data: [],
      });
    } else {
      let update = await Blogs.updateOne(
        { _id: id },
        {
          $push: {
            blogGallery: { imageBlog: req.blogsUrl },
          },
        },
        { new: true }
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BLOGS_IMAGE_UPDATED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region UpdateStatus for Active/Deactive Blogs
export const updateStatus = async (req, res) => {
  let { id, imageId, status } = req.body;
  try {
    let upadateStatus;
    if (id && imageId) {
      upadateStatus = await Blogs.updateOne(
        { _id: id, "image._id": imageId },
        {
          $set: {
            "image.$.status": status,
          },
        },
        { new: true }
      );
    } else {
      upadateStatus = await Blogs.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            status,
          },
        },
        { new: true }
      );
    }
    if (!upadateStatus) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BLOGS_STATUS,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region remove Blogs
export const removeBlogsImage = async (req, res) => {
  let { id } = req.body;
  try {
    let remove;
    let blog = await Blogs.findById({ _id: id });
    // if (id ) {

    //   await fs.unlink("./public/uploads/" + blog.imageBlog, () => {});

    //   remove = await Blogs.updateOne(
    //     { _id: id },
    //     {
    //       $pull: {
    //         imageBlog: { _id: id },
    //       },
    //     },
    //     { new: true }
    //   );
    // } else {

    // await fs.unlink("./public/uploads/" + blog.imageBlog, () => {});
    await deleteS3File(blog.imageBlog);
    remove = await Blogs.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
          imageBlog: "",
        },
      },
      { new: true }
    );
    // }
    if (!remove) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BLOGS_DELETED,
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
};
//#endregion
export const ckEditorImage = async (req, res) => {
  try {
    if (req.files.imageCkeditor)
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADD_CK_IMAGE,
        fileName: req.files.imageCkeditor,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

//#region add blog background
export const AddBlogBackground = async (req, res) => {
  let { id, title } = req.body;

  if (!id) {
    const findExistBlogBackground = await Blogs.find({
      type: "blog_background",
      deletedStatus: 0,
    });

    if (findExistBlogBackground.length > 0) {
      return res.status(400).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BG_BLOGS_ALREADY_EXIST,
        data: [],
      });
    }
  }

  if (id) {
    const findBlogById = await Blogs.findOne({
      _id: id,
    });

    if (findBlogById) {
      let updated = await Blogs.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            title,
            imageBlog: req.files.imageBlog
              ? req.files.imageBlog[0].filename
              : findBlogById.imageBlog,
          },
        },
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.BLOGS_UPDATED,
          data: updated,
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.BLOGS_NOT_FOUND,
        data: [],
      });
    }
  } else {
    const newBlog = new Blogs({
      title: title,
      description: "",
      type: "blog_background",
      imageBlog: req.files.imageBlog && req.files.imageBlog[0].filename,
    });

    const addGallary = await newBlog.save();
    if (!addGallary) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BLOGS_ADDED,
        data: addGallary,
      });
    }
  }
};
