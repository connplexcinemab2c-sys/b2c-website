import { log } from "console";
import Banner from "../../models/Banner.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import cacheHelper from "../../utils/cacheHelper.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

//#region addSliderBanner
export const addSliderBanner = async (req, res) => {
  try {
    let { id, title, bannerLink, bannerShowSection, bannerType } = req.body;
    let bannerShowSectionArr = bannerShowSection
      ? JSON.parse(bannerShowSection)
      : [];
    let exist = await Banner.findOne({
      title,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.BANNER_ALREADY_CREATED,
        data: [],
      });
    } else if (id) {
      let already = await Banner.findOne({
        _id: { $ne: id },
        title,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(409).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.BANNER_ALREADY_CREATED,
          data: [],
        });
      } else {
        let exist = await Banner.findOne({ _id: id, deletedStatus: 0 });
        if (req.files.banner) {
          // fs.unlink("./public/uploads/" + exist.banner, () => {});
          await deleteS3File(exist.banner);
        } else {
          req.bannerUrl = exist.banner;
        }
        let updateBanner = await Banner.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              title,
              banner: req.bannerUrl,
              bannerShowSection: bannerShowSectionArr,
              bannerLink,
              bannerType,
            },
          },
          { new: true }
        );
        if (!updateBanner) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        } else {
          cacheHelper.deleteKeysByPrefix("banner_data_");

          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.BANNER_UPDATED,
            data: updateBanner,
          });
        }
      }
    } else {
      const newBanner = new Banner({
        title,
        banner: req.bannerUrl,
        bannerLink,
        bannerShowSection: bannerShowSectionArr,
        bannerType,
      });
      const saveBanner = await newBanner.save();
      if (!saveBanner) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        cacheHelper.deleteKeysByPrefix("banner_data_");
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.BANNER_CREATED,
          data: saveBanner,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region updateSliderStatus
export const updateBannerStatus = async (req, res) => {
  let { id, status } = req.body;
  try {
    let upadateBanner = await Banner.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status,
        },
      },
      { new: true }
    );
    if (!upadateBanner) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      cacheHelper.deleteKeysByPrefix("banner_data_");
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BANNER_STATUS_UPDATED,
        data: upadateBanner,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getSlider
export const banners = async (req, res) => {
  try {
    const bannerDetails = await Banner.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });
    if (!bannerDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BANNER_DETAILS,
        data: bannerDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region removeSlider
export const removeBanner = async (req, res) => {
  try {
    let { id } = req.body;
    let removeBanner = await Banner.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
          status: false,
        },
      },
      { new: true }
    );
    let newData = await Banner.find({ deletedStatus: 0 }).sort({
      createdAt: -1,
    });
    if (!removeBanner) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      // await fs.unlink("./public/uploads/" + newData.banner, () => {});
      await deleteS3File(newData.banner);
      cacheHelper.deleteKeysByPrefix("banner_data_");
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.BANNER_DELETED,
        data: removeBanner,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
