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
const KNOWN_REGION_COORDINATES = {
  PATNA: { lat: 25.5941, long: 85.1376 },
  VADODARA: { lat: 22.3072, long: 73.1812 },
  SURAT: { lat: 21.1702, long: 72.8311 },
  JAMMU: { lat: 32.7266, long: 74.8570 },
  DARBHANGA: { lat: 26.1542, long: 85.8918 },
  SOLAPUR: { lat: 17.6599, long: 75.9064 },
  JAGDALPUR: { lat: 19.0748, long: 82.0090 },
  JAMSHEDPUR: { lat: 22.8046, long: 86.2029 },
  SHEIKHPURA: { lat: 25.1408, long: 85.8580 },
  AHMEDABAD: { lat: 23.0225, long: 72.5714 },
  RAJKOT: { lat: 22.3039, long: 70.8022 },
  MUMBAI: { lat: 19.0760, long: 72.8777 },
  PUNE: { lat: 18.5204, long: 73.8567 },
  DELHI: { lat: 28.7041, long: 77.1025 },
  GANDHINAGAR: { lat: 23.2156, long: 72.6369 },
  BHAVNAGAR: { lat: 21.7645, long: 72.1519 },
  JAMNAGAR: { lat: 22.4707, long: 70.0577 },
  JUNAGADH: { lat: 21.5222, long: 70.4579 },
  ANAND: { lat: 22.5645, long: 72.9289 },
  NADIAD: { lat: 22.6916, long: 72.8634 },
  MEHSANA: { lat: 23.5880, long: 72.3693 },
  BHARUCH: { lat: 21.7051, long: 72.9959 },
  ANKLESHWAR: { lat: 21.6264, long: 73.0033 },
  VAPI: { lat: 20.3893, long: 72.9106 },
  VALSAD: { lat: 20.5992, long: 72.9342 },
  NAVSARI: { lat: 20.9500, long: 72.9300 },
  MORBI: { lat: 22.8120, long: 70.8384 },
  GAYA: { lat: 24.7914, long: 85.0002 },
  MUZAFFARPUR: { lat: 26.1209, long: 85.3647 },
  BHAGALPUR: { lat: 25.2425, long: 86.9842 },
  RANCHI: { lat: 23.3441, long: 85.3096 },
  RAIPUR: { lat: 21.2514, long: 81.6296 },
  JAIPUR: { lat: 26.9124, long: 75.7873 },
  INDORE: { lat: 22.7196, long: 75.8577 },
  BHOPAL: { lat: 23.2599, long: 77.4126 },
  LUCKNOW: { lat: 26.8467, long: 80.9462 },
  KANPUR: { lat: 26.4499, long: 80.3319 },
};

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateRegionDistance = async (req, res) => {
  try {
    const { lat, long } = req.params;
    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);

    if (isNaN(userLat) || isNaN(userLong)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid latitude or longitude coordinates",
        data: null,
      });
    }

    const regionsDetails = await Region.find({
      deletedStatus: 0,
      isActive: true,
    }).sort({ region: 1 });

    if (!regionsDetails || regionsDetails.length === 0) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REGION_NOT_FOUND,
        data: null,
      });
    }

    // Query active cinemas to get coordinates for regions that may lack lat/long
    const cinemas = await Cinema.find({
      deletedStatus: 0,
      isActive: true,
    }).select("regionId lat long cinemaName");

    let nearestRegion = null;
    let minDistance = Number.MAX_SAFE_INTEGER;
    let bestCoords = null;

    for (const reg of regionsDetails) {
      let regLat = parseFloat(reg.lat);
      let regLong = parseFloat(reg.long);

      // Check if coordinates exist directly on Region
      if (isNaN(regLat) || isNaN(regLong)) {
        // Fallback: check cinemas belonging to this region
        const regCinemas = cinemas.filter(
          (c) =>
            c.regionId &&
            c.regionId.toString() === reg._id.toString() &&
            c.lat &&
            c.long &&
            !isNaN(parseFloat(c.lat)) &&
            !isNaN(parseFloat(c.long))
        );

        if (regCinemas.length > 0) {
          regLat = parseFloat(regCinemas[0].lat);
          regLong = parseFloat(regCinemas[0].long);
        } else {
          // Fallback: lookup by region name
          const normalizedName = (reg.region || "").trim().toUpperCase();
          if (KNOWN_REGION_COORDINATES[normalizedName]) {
            regLat = KNOWN_REGION_COORDINATES[normalizedName].lat;
            regLong = KNOWN_REGION_COORDINATES[normalizedName].long;
          }
        }
      }

      if (!isNaN(regLat) && !isNaN(regLong)) {
        const distanceKm = haversineDistanceKm(
          userLat,
          userLong,
          regLat,
          regLong
        );
        if (distanceKm < minDistance) {
          minDistance = distanceKm;
          nearestRegion = reg;
          bestCoords = { lat: regLat, long: regLong };
        }
      }
    }

    // If no coordinates could be matched for any region, default to first region
    if (!nearestRegion) {
      nearestRegion = regionsDetails[0];
      minDistance = 0;
    }

    const responseData = {
      _id: nearestRegion._id,
      region: nearestRegion.region,
      image: nearestRegion.image || "",
      isActive: nearestRegion.isActive,
      lat: bestCoords ? bestCoords.lat : nearestRegion.lat,
      long: bestCoords ? bestCoords.long : nearestRegion.long,
      distance: Math.round(minDistance * 10) / 10,
    };

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.NEAREST_REGION_FETCHED,
      data: responseData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
