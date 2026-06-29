import dotenv from "dotenv";
import { GlobalNotification } from "../../models/GlobalNotification.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import mongoose from "mongoose";
dotenv.config();

export const addGlobalNotification = async (req, res) => {
  try {
    const { id, title, date, time, description, cinemaIds } = req.body;

    let CinemaIdArray = [];
    if (cinemaIds) {
      let rawIds = [];
      if (typeof cinemaIds === 'string') {
        try {
          // First, try to parse it as a JSON array
          rawIds = JSON.parse(cinemaIds);
        } catch (e) {
          // If that fails, assume it's a comma-separated string
          rawIds = cinemaIds.split(',').map(id => id.trim());
        }
      } else if (Array.isArray(cinemaIds)) {
        rawIds = cinemaIds;
      }

      // Convert all valid IDs to ObjectId
      CinemaIdArray = rawIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
    }
    
    if (id) {
      const notification = await GlobalNotification.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!notification) {
        return res.status(404).json({
          status: 404,
          message: "Global notification not found",
          data: [],
        });
      }

      if (notification.isSend) {
        return res.status(400).json({
          status: 400,
          message:
            "This notification has already been sent and can’t be updated",
          data: [],
        });
      }

      notification.title = title;
      notification.date = date;
      notification.time = time;
      notification.description = description;
      notification.cinemaIds = CinemaIdArray;
      if (req.notificationImageUrl) {
        notification.image = req.notificationImageUrl;
      }
      notification.save();

      return res.status(200).json({
        status: 200,
        message: "Global notification updated successfully",
        data: [],
      });
    }

    const newNotification = new GlobalNotification({
      title,
      date,
      time,
      image: req.notificationImageUrl,
      description,
      cinemaIds: CinemaIdArray,
    });

    await newNotification.save();

    return res.status(201).json({
      status: 201,
      message: "Global notification added successfully",
      data: [],
    });
  } catch (error) {
    console.error("Error adding global notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const changeGlobalNotificationStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (
      !id ||
      !mongoose.isValidObjectId(id) ||
      ![false, true, "true", "false"].includes(status)
    ) {
      return res.status(400).json({
        status: 400,
        message: "Required field missing or invalid",
        data: [],
      });
    }

    const notification = await GlobalNotification.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!notification) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.GLOBAL_NOTIFICATION_NOT_FOUND,
        data: [],
      });
    }

    if (notification.isSend == true) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.GLOBAL_NOTIFICATION_CANNOT_UPDATE,
        data: [],
      });
    }

    if (notification.isActive == status) {
      return res.status(409).json({
        status: 409,
        message: `Global notification already ${
          status == true ? "active." : "deactive."
        }`,
        data: [],
      });
    }

    await GlobalNotification.findOneAndUpdate(
      { _id: id },
      { isActive: status },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: ResponseMessage.GLOBAL_NOTIFICATION_STATUS_UPDATED,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllGlobalNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      GlobalNotification.find({ isDeleted: false }).sort({ createdAt: -1 }),
      // .skip(skip)
      // .limit(limit),
      GlobalNotification.countDocuments({ isDeleted: false }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Global notifications fetched successfully",
      data: notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching global notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getGlobalNotification = async (req, res) => {
  try {
    const id = req.params?.id;

    const notification = await GlobalNotification.findOne({
      _id: id,
      isDeleted: false,
    });

    return res.status(200).json({
      status: 200,
      message: "Global notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching global notifications:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
