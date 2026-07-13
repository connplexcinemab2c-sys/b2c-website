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
import Logs from "../../models/Logs.js";
import { UAParser } from "ua-parser-js";
import { Region } from "../../models/Region.js";
import Movie from "../../models/Movies.js";
import FeeActivityLog from "../../models/FeeActivityLog.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";
import VistaLog from "../../models/VistaLog.js";

export const addEditCinema = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let {
      cinemaName,
      regionId,
      mobileNumber,
      address,
      id,
      cinemaPromoUrl,
      googleUrl,
      emailId,
      displayName,
      convenienceFees,
      serviceCharge,
      cinemaWebServiceUrl,
      cinemaWebServiceUrl2,
      cinemaWebServiceUrl3,
      websiteLicenseNumber,
      cinemaAmenities,
      GSTNumber,
      removedImageUrl,
      cinemaBranchCode,
      lat,
      long,
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
        }
        if (req.body.removedImageUrl) {
          // let removedImages = (
          //   typeof req.body.removedImageUrl !== "object"
          //     ? [req.body.removedImageUrl]
          //     : req.body.removedImageUrl
          // ).map((item) => {
          //   let fileName = item.split("uploads/");
          //   return fileName[1];
          // });

          // Remove the images from the file system
          // removedImages.forEach((fileName) => {
          //   fs.unlink("./public/uploads/" + fileName, () => {});
          // });

          const removedImages = (
            Array.isArray(req.body.removedImageUrl)
              ? req.body.removedImageUrl
              : [req.body.removedImageUrl]
          ).map((item) => item.split("/").pop());
          await Promise.all(
            removedImages.map((fileName) => deleteS3File(fileName))
          );

          // Filter out the removed images from existingCinema.cinema_images
          existingCinema.cinema_images = existingCinema.cinema_images.filter(
            (item) => {
              return !removedImages.includes(item);
            }
          );
          await existingCinema.save();
        }
        if (existingCinema.poster !== "") {
          req.posterUrl = existingCinema.poster;
        }

        if (existingCinema.poster && req.files.poster) {
          req.posterUrl = req.files.poster[0].filename;
        }
        let updated = await Cinema.findByIdAndUpdate(
          { _id: id, deletedStatus: 0 },
          {
            $set: {
              cinemaName,
              regionId,
              mobileNumber,
              address,
              googleUrl,
              cinemaPromoUrl,
              emailId,
              displayName,
              convenienceFees,
              cinemaBranchCode,
              serviceCharge,
              cinemaWebServiceUrl,
              cinemaWebServiceUrl2,
              cinemaWebServiceUrl3,
              websiteLicenseNumber,
              poster: req.posterUrl,
              cinemaAmenities: cinemaAmenitiesArr,
              GSTNumber: GSTNumber,
              lat,
              long,
            },
            $push: { cinema_images: req.sliderImages },
          },
          { new: true }
        );
        //update in vista database
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `${
            process.env.VISTA_URL
          }/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${
            updated.cinemaId
          }&strWebServiceURL=${
            updated.cinemaWebServiceUrl || updated.cinemaWebServiceUrl2
          }`,
        };

        // const vistaLogRequest = {
        //   ...config,
        //   queryParameters: {
        //     strCinemaId: updated.cinemaId,
        //     strWebServiceURL: updated.cinemaWebServiceUrl || updated.cinemaWebServiceUrl2,
        //   },
        // };

        const response = await axios.request(config);
        //  .then((response)=>{
        // let vistaLogStatus = response.data.Status == 1 ? "Success" : "Failed";

        // createVistaLog(
        //   null,
        //   null,
        //   "Cinema",
        //   "UpdateCinemawebservicesURL",
        //   vistaLogRequest,
        //   response.data,
        //   vistaLogStatus
        // );
        // }).catch((error)=>{
        // createVistaLog(
        //   null,
        //   null,
        //   "Cinema",
        //   "UpdateCinemawebservicesURL",
        //   vistaLogRequest,
        //   error.response.data,
        //   "Failed"
        // );
        // });

        if (!updated) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        } else {
          await Logs.create({
            title: `Update Cinema By Admin`,
            lastSync: Date.now(),
            cinemaId: updated?._id,
            ipAddress: IpAddress,
            webBrowser: browserName,
          });

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
        cinemaPromoUrl,
        googleUrl,
        emailId,
        displayName,
        convenienceFees,
        serviceCharge,
        cinemaBranchCode,
        websiteLicenseNumber,
        poster: req.posterUrl,
        cinema_images: req.sliderImages,
        cinemaAmenities: cinemaAmenitiesArr,
        GSTNumber,
        lat,
        long,
      });
      const addCinema = await newCinema.save();
      if (!addCinema) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        await Logs.create({
          title: `New Cinema added By Admin`,
          lastSync: Date.now(),
          cinemaId: addCinema?._id,
          ipAddress: IpAddress,
          webBrowser: browserName,
        });

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
    if (userId) {
      console.log("if get cinema");

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
      // console.log(cinemaDetails, "cinemaDetails");
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
    } else {
      console.log("else");
      let query = {
        deletedStatus: 0,
        isActive: true,
        ...(req.query.regionId && { regionId: req.query.regionId }),
      };
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
        data: removeCinema,
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
          let list = response.data.data.ItemCinemaDetails || [];
          if (Array.isArray(list)) {
            // Find all local cinemas and merge them
            const dbCinemas = await Cinema.find({ deletedStatus: 0 });
            dbCinemas.forEach((c) => {
              if (!c.cinemaId) return;
              const idx = list.findIndex(
                (item) =>
                  item.Cinema_strID &&
                  item.Cinema_strID.toUpperCase() === c.cinemaId.toUpperCase()
              );
              const licenseNo =
                c.cinemaLicenseNumber ||
                String(c.websiteLicenseNumber || "");
              if (idx !== -1) {
                if (licenseNo) {
                  list[idx].License_strCode = licenseNo;
                }
                if (
                  c.cinemaId.toUpperCase().startsWith("CN9") ||
                  c.cinemaId.toUpperCase().startsWith("CN1")
                ) {
                  list[idx].Cinema_strName = c.displayName || c.cinemaName;
                }
              } else {
                list.push({
                  Cinema_strID: c.cinemaId,
                  Cinema_strName: c.displayName || c.cinemaName,
                  License_strCode: licenseNo || "",
                });
              }
            });
          }
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CINEMA_DETAILS,
            data: list,
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
          try {
            const dbCinemas = await Cinema.find({ deletedStatus: 0 });
            const list = dbCinemas
              .map((c) => ({
                Cinema_strID: c.cinemaId,
                Cinema_strName: c.displayName || c.cinemaName,
                License_strCode:
                  c.cinemaLicenseNumber ||
                  String(c.websiteLicenseNumber || ""),
              }))
              .filter((c) => c.Cinema_strID);

            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.CINEMA_DETAILS,
              data: list,
            });
          } catch (dbErr) {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: ResponseMessage.BAD_REQUEST,
              data: response.data,
            });
          }
        }
      })
      .catch(async (error) => {
        // createVistaLog(
        //   null,
        //   null,
        //   "Cinema",
        //   "GetAllcinemaDetails",
        //   config,
        //   error.response.data,
        //   "Failed"
        // );
        try {
          const dbCinemas = await Cinema.find({ deletedStatus: 0 });
          const list = dbCinemas
            .map((c) => ({
              Cinema_strID: c.cinemaId,
              Cinema_strName: c.displayName || c.cinemaName,
              License_strCode:
                c.cinemaLicenseNumber ||
                String(c.websiteLicenseNumber || ""),
            }))
            .filter((c) => c.Cinema_strID);

          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CINEMA_DETAILS,
            data: list,
          });
        } catch (dbErr) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: error.message,
          });
        }
      });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Add cinema licence
export const addCinemaLicence = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let { isNewCinema, cinemaId, cinemaName, licenceCode } = req.body;

    if (isNewCinema === "true" || isNewCinema === true) {
      if (!cinemaName || !licenceCode) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: "Cinema name and license code are required",
        });
      }

      // Check if cinema already exists
      const exist = await Cinema.findOne({ cinemaName, deletedStatus: 0 });
      if (exist) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: "Cinema already exists",
        });
      }

      // Generate a unique cinemaId, e.g. CN + count
      const count = await Cinema.countDocuments();
      const uniqueId = `CN${100 + count}`;

      const newCinema = new Cinema({
        cinemaId: uniqueId,
        cinemaName,
        displayName: cinemaName,
        cinemaLicenseNumber: licenceCode,
        websiteLicenseNumber: Number(licenceCode) || undefined,
        deletedStatus: 0,
        isActive: true,
      });

      await newCinema.save();

      await Logs.create({
        title: `Add Cinema License (New Cinema) By Admin : ${uniqueId}`,
        lastSync: Date.now(),
        cinemaId: newCinema._id,
        ipAddress: IpAddress,
        webBrowser: browserName,
      });

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: "Cinema license created successfully",
        data: newCinema,
      });
    } else {
      if (!cinemaId || !licenceCode) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: "Cinema and license code are required",
        });
      }

      // Update existing cinema
      const cinema = await Cinema.findOneAndUpdate(
        { cinemaId: { $regex: new RegExp(`^${cinemaId}$`, "i") } },
        {
          $set: {
            websiteLicenseNumber: Number(licenceCode) || undefined,
            cinemaLicenseNumber: licenceCode,
          },
        },
        { new: true }
      );

      if (!cinema) {
        return res.status(404).json({
          status: StatusCodes.NOT_FOUND,
          message: "Cinema not found",
        });
      }

      // Also try to update Vista if not local-only (e.g. not custom)
      if (
        cinemaId &&
        !cinemaId.startsWith("CN1")
      ) {
        try {
          let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${process.env.VISTA_URL}/api.asmx/UpdateCinemaLicence?strCinemaId=${cinemaId}&Licencecode=${licenceCode}`,
            headers: {},
          };
          await axios.request(config);
        } catch (err) {
          console.error("Vista update failed: ", err.message);
        }
      }

      await Logs.create({
        title: `Add Cinema License (Existing Cinema) By Admin : ${cinemaId}`,
        lastSync: Date.now(),
        cinemaId: cinema._id,
        ipAddress: IpAddress,
        webBrowser: browserName,
      });

      return res.status(200).json({
        status: StatusCodes.OK,
        message: "Cinema license added successfully",
        data: cinema,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region updateCinemaLicence
export const updateCinemaLicence = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let { cinemaId, licenceCode } = req.body;

    // Update locally in MongoDB database
    await Cinema.findOneAndUpdate(
      { cinemaId: { $regex: new RegExp(`^${cinemaId}$`, 'i') } },
      { 
        $set: { 
          websiteLicenseNumber: Number(licenceCode) || undefined,
          cinemaLicenseNumber: licenceCode 
        }
      }
    );

    if (cinemaId && cinemaId.toUpperCase().startsWith("CN1")) {
      await Logs.create({
        title: `Update Cinema Licence By Admin : ${cinemaId} (Local Only)`,
        lastSync: Date.now(),
        ipAddress: IpAddress,
        webBrowser: browserName,
      });

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.LICENCE_CODE_UPDATED,
        data: { Status: 1, message: "Local license updated successfully" },
      });
    }

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
          await Logs.create({
            title: `Update Cinema Licence By Admin : ${cinemaId}`,
            lastSync: Date.now(),
            ipAddress: IpAddress,
            webBrowser: browserName,
          });

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

//#region Active Deactive cinema
export const ActiveDeactiveCinema = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let { id } = req.body;

    let findCinema = await Cinema.findOne({ _id: id, deletedStatus: 0 });
    if (findCinema) {
      let updateTask = await Cinema.findOneAndUpdate(
        {
          _id: id,
          deletedStatus: 0,
        },
        {
          $set: {
            isActive: !findCinema.isActive,
          },
        },
        { new: true }
      );
      let findRegion = await Region.findOne({ _id: findCinema.regionId });
      if (findRegion) {
        let findAllCinemaByRegion = await Cinema.find({
          regionId: findRegion?._id,
          isActive: true,
          deletedStatus: 0,
        });

        if (findAllCinemaByRegion.length == 0) {
          await Region.findOneAndUpdate(
            {
              _id: findRegion?._id,
              deletedStatus: 0,
            },
            {
              $set: {
                isActive: false,
              },
            },
            { new: true }
          );
          // await Movie.findOneAndUpdate(
          //   {
          //     cinemaObjectId: updateTask?._id,
          //     deletedStatus: 0,
          //     status: 1,
          //   },
          //   {
          //     $set: {
          //       upsert: false,
          //     },
          //   },
          //   { new: true }
          // );
        } else {
          await Region.findOneAndUpdate(
            {
              _id: findRegion?._id,
              deletedStatus: 0,
            },
            {
              $set: {
                isActive: true,
              },
            },
            { new: true }
          );
        }
        await Movie.updateMany(
          {
            cinemaObjectId: updateTask?._id,
            deletedStatus: 0,
            status: 1,
          },
          {
            $set: {
              isActive: updateTask.isActive,
            },
          },
          { new: true }
        );
        // await Region.findOneAndUpdate(
        //   {
        //     _id: findRegion?._id,
        //     deletedStatus: 0,
        //   },
        //   {
        //     $set: {
        //       isActive: !findCinema.isActive,
        //     },
        //   },
        //   { new: true }
        // );
      }

      await Logs.create({
        title: `Active Deactive Cinema By Admin : ${id}`,
        lastSync: Date.now(),
        ipAddress: IpAddress,
        webBrowser: browserName,
      });

      return res.status(200).json({
        status: StatusCodes.OK,
        message: !findCinema.isActive
          ? ResponseMessage.CINEMA_ACTIVE
          : ResponseMessage.CINEMA_DEACTIVE,
        data: updateTask,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.CINEMA_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getFeeActivityLog = async (req, res) => {
  try {
    const id = req.admin;

    const findAdmin = await Admin.findOne({ _id: id, deletedStatus: 0 });
    if (!findAdmin) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }

    const feeActivityLog = await FeeActivityLog.find()
      .populate("adminId", "_id name")
      .sort({ createdAt: -1 });
    if (feeActivityLog) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.GLOBAL_CONVIENT_FEE_FETCHED,
        data: feeActivityLog,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.GLOBAL_CONVIENT_FEE_FETCHED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const updateGlobalConvienceFee = async (req, res) => {
  try {
    const adminId = req.admin;
    const findAdmin = await Admin.findOne({
      _id: adminId,
      deletedStatus: 0,
    }).lean();
    if (!findAdmin) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }
    const { convenienceFee } = req.body;

    const updateQuery = {
      deletedStatus: 0,
    };

    await Cinema.updateMany(updateQuery, {
      $set: { convenienceFees: convenienceFee },
    });
    const updateFeeActivityLog = await FeeActivityLog.create({
      adminId,
      globalConvienceFee: convenienceFee,
    });

    // if(updateFeeActivityLog){
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.FEE_ACTIVITY_LOG_UPDATED,
      data: updateFeeActivityLog,
    });
    // }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getCinemaSyncLogs = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { startDate, endDate } = req.query;

    const query = {
      cinemaId,
      moduleName: "Cinema",
      type: { $in: ["DatabaseSync", "UpdateCinemawebservicesURL"] },
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate + "T00:00:00.000Z");
      if (endDate) query.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
    }

    const [logs, totalCount] = await Promise.all([
      VistaLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VistaLog.countDocuments(query),
    ]);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cinema sync logs fetched successfully",
      data: logs,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
