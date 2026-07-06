import { StatusCodes } from "http-status-codes";
import { MovieSlider } from "../../models/MovieSliders.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import fs from "fs";
import cacheHelper from "../../utils/cacheHelper.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

export const addEditMovieSlider = async (req, res) => {
  try {
    let { id, title, regionId, type, sliderType } = req.body;
    if (!regionId && req.body["regionId[]"]) {
      regionId = req.body["regionId[]"];
    }
    let exist = await MovieSlider.findOne({
      title,
      sliderType,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.MOVIESLIDER_ALREADY_CREATED,
        data: [],
      });
    } else if (id) {
      let already = await MovieSlider.findOne({
        _id: { $ne: id },
        title,
        deletedStatus: 0,
        type,
        sliderType,
      });
      if (already) {
        return res.status(409).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.MOVIESLIDER_ALREADY_CREATED,
          data: [],
        });
      } else {
        let exist = await MovieSlider.findOne({ _id: id, deletedStatus: 0 });
        if (req.files.poster) {
          // fs.unlink("./public/uploads/" + exist.image, () => {});
          await deleteS3File(exist.image);
        } else {
          req.posterUrl = exist.image;
        }
        let updateMovieSlider = await MovieSlider.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              title,
              image: req.posterUrl,
              sliderType,
              regionId: regionId ? regionId : null,
              type,
            },
          },
          { new: true }
        );
        if (!updateMovieSlider) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        } else {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.MOVIESLIDER_UPDATED,
            data: updateMovieSlider,
          });
        }
      }
    } else {
      const newSlider = new MovieSlider({
        title,
        image: req.posterUrl,
        regionId: regionId ? regionId : null,
        type,
        sliderType,
      });
      const saveMovieSlider = await newSlider.save();
      if (!saveMovieSlider) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.MOVIESLIDER_CREATED,
          data: saveMovieSlider,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const deleteMovieSlider = async (req, res) => {
  try {
    const movieSliderDelete = await MovieSlider.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { deletedStatus: 1 } },
      { new: true }
    );
    if (movieSliderDelete) {
      cacheHelper.deleteKeysByPrefix("slider_data_");

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_SLIDER_DELETED,
        data: movieSliderDelete,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MOVIE_SLIDER_NOT_DELETED,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const getMoviesSliders = async (req, res) => {
  try {
    const getMoviesSliders = await MovieSlider.find({
      deletedStatus: 0,
    })
      .populate("movieId")
      .populate("regionId")
      .sort({ createdAt: "-1" });
    if (getMoviesSliders) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MOVIE_SLIDER_FETCHED,
        data: getMoviesSliders,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.MOVIE_SLIDER_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const updateSliderStatus = async (req, res) => {
  let { id, status } = req.body;
  try {
    let updatedSlider = await MovieSlider.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status,
        },
      },
      { new: true }
    );

    if (!updatedSlider) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      cacheHelper.deleteKeysByPrefix("slider_data_");

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.MOVIESLIDER_STATUS_UPDATED,
        data: updatedSlider,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
