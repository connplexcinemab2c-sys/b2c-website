import fs from "fs";
import { Region } from "../../models/Region.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import {
  getDistance,
  handleErrorResponse,
} from "../../services/CommanService.js";
import Cinema from "../../models/Cinema.js";
import cacheKeys from "../../utils/cacheKeys.js";
import cacheHelper from "../../utils/cacheHelper.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

export const addEditRegion = async (req, res) => {
  try {
    let { id, region } = req.body;
    let exist = await Region.findOne({
      region,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.REGION_ALREADY_CREATED,
        data: [],
      });
    } else if (id) {
      let already = await Region.findOne({
        _id: { $ne: id },
        region,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.REGION_ALREADY_CREATED,
          data: [],
        });
      } else {
        let exist = await Region.findOne({ _id: id, deletedStatus: 0 });
        if (req.files.poster) {
          // fs.unlink("./public/uploads/" + exist.image, () => {});
          await deleteS3File(exist.image);
        } else {
          req.posterUrl = exist.image;
        }
        let updated = await Region.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              region,
              image: req.posterUrl,
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
          cacheHelper.deleteCache(cacheKeys.regionData);
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.REGION_UPDATED,
            data: updated,
          });
        }
      }
    } else {
      const newRegion = new Region({
        region,
        image: req.posterUrl,
      });
      const addRegion = await newRegion.save();
      if (!addRegion) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        cacheHelper.deleteCache(cacheKeys.regionData);
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.REGION_CREATED,
          data: addRegion,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const getRegion = async (req, res) => {
  try {
    const getRegion = await Region.find({ deletedStatus: 0 }).sort({
      region: "asc",
    });
    if (getRegion) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REGION_FETCHED,
        data: getRegion,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REGION_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const deleteRegion = async (req, res) => {
  try {
    const regionDelete = await Region.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { deletedStatus: 1 } },
      { new: true }
    );
    if (regionDelete) {
      cacheHelper.deleteCache(cacheKeys.regionData);
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REGION_DELETED,
        data: regionDelete,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REGION_NOT_DELETED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const regionActiveDeActive = async (req, res) => {
  try {
    const { id, isActive } = req.body;
    const UpdateRegion = await Region.findOneAndUpdate(
      { _id: id },
      { $set: { isActive } },
      { new: true }
    );
    if (UpdateRegion.isActive == true) {
      const EnableAllRelatedCinema = await Cinema.updateMany(
        { regionId: UpdateRegion._id },
        { $set: { isActive: UpdateRegion.isActive } },
        { new: true }
      );
      cacheHelper.deleteCache(cacheKeys.regionData);
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REGION_ACTIVATED,
        data: UpdateRegion,
      });
    } else {
      const DisableAllRelatedCinema = await Cinema.updateMany(
        { regionId: UpdateRegion._id },
        { $set: { isActive: UpdateRegion.isActive } },
        { new: true }
      );
      cacheHelper.deleteCache(cacheKeys.regionData);
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REGION_IN_ACTIVATED,
        data: UpdateRegion,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const PropertyListUpcoming = async (req, res) => {
  try {
    let userId = req.user;
    const {
      latitude,
      longitude,
      property_type,
      project_status,
      min_area,
      max_area,
    } = req.body;
    const filters = { isDeleted: false };
    if (property_type) {
      filters.property_type = { $regex: property_type, $options: "i" };
    }
    if (project_status) {
      filters.project_status = { $regex: project_status, $options: "i" };
    }
    if (min_area || max_area) {
      if ("carpet_area") {
        filters.carpet_area = {
          $gte: min_area,
          $lte: max_area,
        };
      } else if ("size_of_the_land") {
        filters.size_of_the_land = {
          $gte: min_area,
          $lte: max_area,
        };
      }
    }
    const allProperties = await Property.find({
      created_by: { $ne: userId },
      isVerified: true,
      ...filters,
      // paymentDone: false,
    });
    const findFranchise = await Franchise.find({
      status_of_franchise: "Franchise Rejected",
    }).populate("property_id");
    const nearbyProperties = [];
    for (const property of allProperties) {
      const distance = await getRoutePoints(
        latitude,
        longitude,
        property.latitude,
        property.longitude
      );
      const distanceNumber = parseFloat(distance);
      if (!isNaN(distanceNumber)) {
        nearbyProperties.push({
          property,
          distance: distanceNumber,
        });
      }
    }
    nearbyProperties.sort((a, b) => a.distance - b.distance);
    const combinedArray = [
      ...nearbyProperties,
      ...findFranchise,
      ...allProperties,
    ].filter(
      (item, index, self) =>
        item.property &&
        item.property._id &&
        index === self.findIndex((t) => t.property._id === item.property._id)
    );
    const propertiesData = combinedArray.map((item) => item.property);
    res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.PROPERTIES_FETCHED,
      data: propertiesData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
export const calculateRegionDistance = async (req, res) => {
  try {
    let { lat, long } = req.params;
    const regionsDetails = await Region.find({
      deletedStatus: 0,
    }).sort({ region: 1 });
    const calculateNearRegion = await Promise.all(
      regionsDetails.map(async (ele) => {
        const calculation = await getDistance(lat, long, ele.lat, ele.long);
        if (calculation && calculation.distance) {
          const distanceWithoutCommas = parseInt(
            calculation.distance.replace(/,/g, ""),
            10
          );
          return {
            _id: ele._id,
            region: ele.region,
            distance: distanceWithoutCommas,
          };
        } else {
          return null;
        }
      })
    );
    const validRegion = calculateNearRegion.filter((region) => region !== null);
    // Find the region with the shortest distance
    let nearestRegion = null;
    let minDistance = Number.MAX_SAFE_INTEGER;
    validRegion.forEach((region) => {
      if (region.distance < minDistance) {
        minDistance = region.distance;
        nearestRegion = region;
      }
    });
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.NEAREST_REGION_FETCHED,
      data: nearestRegion,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
