import { Cinema } from "../../models/Cinema.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import CinemaGallary from "../../models/CinemaGallary.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import { getShowCinemaCount } from "../../services/VistaService.js";
import { showSync } from "../admin/CinemaWiseDataSync.js";
import { SiteSetting } from "../../models/SiteSetting.js";

//#region getCinemasByRegion
export const getCinemasByRegion = async (req, res) => {
  try {
    let { regionId } = req.params;
    const cinemasDetails = await Cinema.find({
      regionId,
      deletedStatus: 0,
      poster: { $ne: "" },
    });
    const sitesetting = await SiteSetting.findOne();
    let modify = cinemasDetails.filter((item) => item.isActive == true).map((item) => {
      return {
       ...item._doc,
      showExtendedDays: sitesetting?.showExtendedDays || 10
    }})
    if (modify) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_FETCHED,
        data: modify,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.CINEMA_NOT_FETCHED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getGallery
export const getGallery = async (req, res) => {
  try {
    let gallery = await CinemaGallary.aggregate([
      {
        $match: {
          status: true,
          deletedStatus: 0,
          type: { $ne: "gallary_background" },
        },
      },
      {
        $addFields: {
          imageGallery: {
            $filter: {
              input: "$imageGallery",
              as: "image",
              cond: {
                $eq: ["$$image.status", true],
              },
            },
          },
        },
      },
    ]);

    let findGalleryBackground = await CinemaGallary.find({
      status: true,
      deletedStatus: 0,
      type: "gallary_background",
    });
    if (gallery || findGalleryBackground) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_GALARY_DETAILS,
        data: {
          galleryList: gallery,
          background: findGalleryBackground,
        },
      });
    } else {
      await res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region get vistara cinema show and database cinema show data
export const getCinemaShowCount = async (req, res) => {
  try {
    let getCinemaShowCount = await getShowCinemaCount()
    let unmatchedCinemaIds = Object.keys(getCinemaShowCount.unmatched);
    for (let i = 0; i <= unmatchedCinemaIds.length; i++) {
      await showSync(unmatchedCinemaIds[i]);
    }
    if (getCinemaShowCount) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_SHOW_COUNT_FETCHED,
        data: getCinemaShowCount
      });
    } else {
      await res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion