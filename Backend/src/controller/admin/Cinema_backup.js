import fs from "fs";
import { Cinema } from "../../models/Cinema.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import axios from "axios";
import { Admin } from "../../models/Admin.js";
import {
  createVistaLog,
  handleErrorResponse,
} from "../../services/CommanService.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

export const addEditCinema = async (req, res) => {
  try {
    let {
      cinemaName,
      regionId,
      mobileNumber,
      address,
      id,
      googleUrl,
      emailId,
      displayName,
      convenienceFees,
      cinemaWebServiceUrl,
      cinemaWebServiceUrl2,
      cinemaWebServiceUrl3,
      websiteLicenseNumber,
      cinemaAmenities,
      GSTNumber,
    } = req.body;
    const cinemaAmenitiesArr = JSON.parse(cinemaAmenities);
    let exist = await Cinema.findOne({
      cinemaName,
      regionId,
      address,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.THIS_CINEMA_ALREADY_EXIST,
        data: [],
      });
    } else if (id) {
      let already = await Cinema.findOne({
        _id: { $ne: id },
        cinemaName,
        regionId,
        address,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.THIS_CINEMA_ALREADY_EXIST,
          data: [],
        });
      } else {
        let existingCinema = await Cinema.findById({ _id: id });
        if (req.files.poster) {
          // fs.unlink("./public/uploads/" + existingCinema.poster, () => {});
          await deleteS3File(existingCinema.poster);
        } else if (req.body.removePosterUrl) {
          // fs.unlink("./public/uploads/" + req.body.removePosterUrl, () => {});
          await deleteS3File(req.body.removePosterUrl);
          existingCinema.poster = "";
          await existingCinema.save();
        } else {
          req.posterUrl = existingCinema.poster;
        }
        let updated = await Cinema.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              cinemaName,
              regionId,
              mobileNumber,
              address,
              googleUrl,
              emailId,
              displayName,
              convenienceFees,
              cinemaWebServiceUrl,
              cinemaWebServiceUrl2,
              cinemaWebServiceUrl3,
              websiteLicenseNumber,
              poster: req.posterUrl,
              cinemaAmenities: cinemaAmenitiesArr,
              GSTNumber: GSTNumber,
            },
            $push: { cinema_images: req.sliderImages },
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
            message: ResponseMessage.CINEMA_UPDATED,
            data: updated,
          });
        }
      }
    } else {
      const newCinema = new Cinema({
        cinemaName,
        regionId,
        mobileNumber,
        address,
        googleUrl,
        emailId,
        displayName,
        convenienceFees,
        websiteLicenseNumber,
        poster: req.posterUrl,
        cinema_images: req.sliderImages,
        cinemaAmenities: cinemaAmenitiesArr,
        GSTNumber,
      });
      const addCinema = await newCinema.save();
      if (!addCinema) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.CINEMA_ADDED,
          data: addCinema,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getCinemas = async (req, res) => {
  try {
    const userId = req.admin;
    const findCinemaAdmin = await Admin.findOne({ _id: userId });
    const findCinemaId = findCinemaAdmin.cinemaId;
    let query = {
      deletedStatus: 0,
    };
    if (findCinemaAdmin && findCinemaId) {
      query._id = findCinemaId;
    }
    const cinemaDetails = await Cinema.find(query)
      .populate("regionId")
      .sort({ createdAt: -1 });

    if (!cinemaDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.CINEMA_NOT_FETCHED,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_FETCHED,
        data: cinemaDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getCinemasByRegion = async (req, res) => {
  try {
    let { regionId } = req.params;
    const cinemasDetails = await Cinema.findOne({
      regionId,
      deletedStatus: 0,
    });
    if (cinemasDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_FETCHED,
        data: cinemasDetails,
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

export const removeCinema = async (req, res) => {
  try {
    let { id } = req.body;
    let removeCinema = await Cinema.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
        },
      },
      { new: true }
    );
    let newData = await Cinema.find({ deletedStatus: 0 }).sort({
      createdAt: -1,
    });
    if (!removeCinema) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CINEMA_REMOVED,
        data: newData,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#region Get cinema licence
export const getCinemasLicence = async (req, res) => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/GetAllcinemaDetails?`,
      headers: {},
    };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          // createVistaLog(
          //   null,
          //   null,
          //   "Cinema",
          //   "GetAllcinemaDetails",
          //   config,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CINEMA_DETAILS,
            data: response.data.data.ItemCinemaDetails,
          });
        } else {
          // createVistaLog(
          //   null,
          //   null,
          //   "Cinema",
          //   "GetAllcinemaDetails",
          //   config,
          //   response.data,
          //   "Failed"
          // );
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   null,
        //   null,
        //   "Cinema",
        //   "GetAllcinemaDetails",
        //   config,
        //   error.response.data,
        //   "Failed"
        // );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region updateCinemaLicence
export const updateCinemaLicence = async (req, res) => {
  try {
    let { cinemaId, licenceCode } = req.body;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemaLicence?strCinemaId=${cinemaId}&Licencecode=${licenceCode}`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: cinemaId,
    //     Licencecode: licenceCode,
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          // createVistaLog(
          //   null,
          //   null,
          //   "Cinema",
          //   "UpdateCinemaLicence",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.LICENCE_CODE_UPDATED,
            data: response.data,
          });
        } else {
          // createVistaLog(
          //   null,
          //   null,
          //   "Cinema",
          //   "UpdateCinemaLicence",
          //   vistaLogRequest,
          //   response.data,
          //   "Failed"
          // );
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // createVistaLog(
        //   null,
        //   null,
        //   "Cinema",
        //   "UpdateCinemaLicence",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: error.message,
        });
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
