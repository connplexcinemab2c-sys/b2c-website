import fs from "fs";
import CinemaGallary from "../../models/CinemaGallary.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import { handleErrorResponse } from "../../services/CommanService.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

//#region addEdit cinemaGallary

export const addEditCinemaGallary = async (req, res) => {
  try {
    let { id, title, subTitle, description } = req.body;
    let exist = await CinemaGallary.findOne({
      title,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.THIS_CATEGORY_ALREADY_EXIST,
        data: [],
      });
    } else if (id) {
      let already = await CinemaGallary.findOne({
        _id: { $ne: id },
        title,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.THIS_CATEGORY_ALREADY_EXIST,
          data: [],
        });
      } else {
        let existingData = await CinemaGallary.findById({ _id: id });
        if (req.files.poster) {
          // fs.unlink("./public/uploads/" + existingData.poster, () => {});
          await deleteS3File(existingData.poster);
        } else if (req.body.removePosterUrl) {
          // fs.unlink("./public/uploads/" + req.body.removePosterUrl, () => {});
          await deleteS3File(req.body.removePosterUrl);
          existingData.poster = "";
          await existingData.save();
        } else {
          req.posterUrl = existingData.poster;
        }
        let updated = await CinemaGallary.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              title,
              subTitle,
              description,
              poster: req.posterUrl,
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
            message: ResponseMessage.CATEGORY_UPDATED,
            data: updated,
          });
        }
      }
    } else {
      const newGallary = new CinemaGallary({
        title,
        subTitle,
        description,
        poster: req.posterUrl,
      });
      const addGallary = await newGallary.save();
      if (!addGallary) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.CATEGORY_ADDED,
          data: addGallary,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getCinemaGalary
export const getCinemaGallary = async (req, res) => {
  try {
    let { id } = req.body;
    let getCinemaGallary;
    if (id) {
      getCinemaGallary = await CinemaGallary.findById({
        _id: id,
      });
    } else {
      getCinemaGallary = await CinemaGallary.find({
        deletedStatus: 0,
      }).sort({ createdAt: "-1" });
    }
    if (getCinemaGallary) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_GALARY_DETAILS,
        data: getCinemaGallary,
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

//#region addImagesInCinemaGallary
export const addImagesInCinemaGallary = async (req, res) => {
  try {
    let { id, imageId } = req.body;
    const cinemaGallary = await CinemaGallary.findById({ _id: id });
    if (id && imageId) {
      let image = cinemaGallary.imageGallery.find(
        (ele) => ele._id.toString() === imageId
      );
      if (req.files.poster) {
        // fs.unlink("./public/uploads/" + image.poster, () => {});
        await deleteS3File(image.poster);
      } else {
        req.posterUrl = image.poster;
      }
      await CinemaGallary.updateOne(
        { _id: id, "imageGallery._id": imageId },
        {
          $set: {
            "imageGallery.$.poster": req.posterUrl,
          },
        },
        { new: true }
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_GALARY_IMAGE_UPDATED,
        data: [],
      });
    } else {
      let update = await CinemaGallary.updateOne(
        { _id: id },
        {
          $push: {
            imageGallery: { poster: req.posterUrl },
          },
        },
        { new: true }
      );
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_GALARY_IMAGE_ADDED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region UpdateStatus
export const updateStatus = async (req, res) => {
  let { id, imageId, status } = req.body;
  try {
    let upadateStatus;
    if (id && imageId) {
      upadateStatus = await CinemaGallary.updateOne(
        { _id: id, "imageGallery._id": imageId },
        {
          $set: {
            "imageGallery.$.status": status,
          },
        },
        { new: true }
      );
    } else {
      upadateStatus = await CinemaGallary.findByIdAndUpdate(
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
        message: ResponseMessage.STATUS_UPDATED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region removeGallary
export const removeGallary = async (req, res) => {
  let { id, imageId } = req.body;
  try {
    let remove;
    let gallery = await CinemaGallary.findById({ _id: id });
    if (id && imageId) {
      let image = gallery.imageGallery.find(
        (ele) => ele._id.toString() === imageId
      );

      // await fs.unlink("./public/uploads/" + image.poster, () => {});
      await deleteS3File(image.poster);

      remove = await CinemaGallary.updateOne(
        { _id: id },
        {
          $pull: {
            imageGallery: { _id: imageId },
          },
        },
        { new: true }
      );
    } else {
      // await gallery.imageGallery.map((ele) =>
      //   fs.unlink("./public/uploads/" + ele.poster, () => {})
      //   await deleteS3File(ele.poster);
      // );
      await Promise.all(
        gallery.imageGallery.map((ele) => deleteS3File(ele.poster))
      );
      // await fs.unlink("./public/uploads/" + gallery.poster, () => {});
      await deleteS3File(gallery.poster);
      remove = await CinemaGallary.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            deletedStatus: 1,
          },
        },
        { new: true }
      );
    }
    if (!remove) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.GALLERY_DELETED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region add blog background
export const AddGallaryBackground = async (req, res) => {
  let { id, title } = req.body;
  if (!id) {
    const findExistGalleryBackground = await CinemaGallary.find({
      type: "gallary_background",
      deletedStatus: 0,
    });
    if (findExistGalleryBackground.length > 0) {
      return res.status(400).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BG_GALLARY_ALREADY_EXIST,
        data: findExistGalleryBackground,
      });
    }
  }

  if (id) {
    const findBlogById = await CinemaGallary.findOne({
      _id: id,
    });

    if (findBlogById) {
      let updated = await CinemaGallary.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            title,
            poster: req.files.poster
              ? req.files.poster[0].filename
              : findBlogById.poster,
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
          message: ResponseMessage.BG_GALLARY_UPDATED,
          data: updated,
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.BG_GALLARY_NOT_FOUND,
        data: [],
      });
    }
  } else {
    const newGallary = new CinemaGallary({
      title: title,
      description: "",
      type: "gallary_background",
      poster: req.files.poster && req.files.poster[0].filename,
    });

    const addGallary = await newGallary.save();
    if (!addGallary) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BG_GALLARY_ADDED,
        data: addGallary,
      });
    }
  }
};
