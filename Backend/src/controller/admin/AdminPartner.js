import Partner from "../../models/Partner.js";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";

export const addEditPartner = async (req, res) => {
  try {
    const { partnerName, link, _id } = req.body;
    cacheHelper.deleteCache(cacheKeys.partnersData)
    if (_id) {
      const findPartner = await Partner.findOne({
        _id: { $ne: _id },
        partnerName,
      });
      if (findPartner) {
        return res.status(409).send({
          success: StatusCodes.CONFLICT,
          message: ResponseMessage.PARTENER_EXIST,
          data: [],
        });
      }
      const updateData = await Partner.findByIdAndUpdate(
        { _id },
        { $set: { partnerName, link } },
        { upsert: true }
      );
      if (updateData) {
        return res.status(200).send({
          success: StatusCodes.CREATED,
          message: ResponseMessage.ADMIN_PARTNER_UPDATED,
          data: updateData,
        });
      } else {
        return res.status(400).send({
          success: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.ADMIN_PARTNER_NOT_UPDATED,
          data: [],
        });
      }
    } else {
      const findPartner = await Partner.findOne({ partnerName: partnerName, isDeleted: false });
      if (findPartner) {
        return res.status(409).send({
          success: StatusCodes.CONFLICT,
          message: ResponseMessage.PARTENER_EXIST,
          data: [],
        });
      }
      Partner.create({
        partnerName,
        link,
      })
        .then((result) => {
          return res.status(201).send({
            success: StatusCodes.CREATED,
            message: ResponseMessage.ADMIN_PARTNER_CREATED,
            data: result,
          });
        })
        .catch((err) => {
          return res.status(400).send({
            success: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.ADMIN_PARTNER_NOT_CREATED,
            err: err,
          });
        });
    }
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const listPartner = async (req, res) => {
  try {
    Partner.find({"isDeleted": false}).sort({createdAt:-1}).then((result) => {
      cacheHelper.setCache(cacheKeys.partnersData,result)
      return res.status(200).send({
        success: StatusCodes.OK,
        message: ResponseMessage.ADMIN_PARTNER_LIST_GET,
        data: result,
      });
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const statusChangePartner = async (req, res) => {
  try {
    // const partnerId = req.params.id;
    const { isActive, id: partnerId } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).send({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_PARTNER_STATUS_VALUE,
        data: [],
      });
    }

    const updatePartner = await Partner.findByIdAndUpdate(
      partnerId,
      { isActive },
      { new: true }
    );

    if (!updatePartner) {
      return res.status(400).send({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_PARTNER_NOT_FOUND,
        data: [],
      });
    }
    cacheHelper.deleteCache(cacheKeys.partnersData)
    return res.status(200).send({
      status: StatusCodes.OK,
      message: ResponseMessage.ADMIN_PARTNER_STATUS_UPDATED,
      data: updatePartner,
    });
  } catch (error) {
    return res.status(500).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const partnerIdToDelete = req.body.id;

    const deletePartner = await Partner.findByIdAndUpdate(
      partnerIdToDelete,
      {
        isDeleted: true,
      },
      { new: true }
    );

    if (!deletePartner) {
      return res.status(400).send({
        success: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_PARTNER_DELETE_NOT_FOUND,
      });
    }
    cacheHelper.deleteCache(cacheKeys.partnersData)
    return res.status(200).send({
      success: StatusCodes.OK,
      message: ResponseMessage.ADMIN_PARTNER_DELETE,
      data: deletePartner,
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
