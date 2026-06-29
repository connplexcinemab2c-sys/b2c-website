import {
  createVistaLog,
  decryptData,
  decryptPayment,
  handleErrorResponse,
  verifySignature,
} from "../../services/CommanService.js";
import axios from "axios";
import Item from "../../models/Items.js";
import fs from "fs";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import Transaction from "../../models/Transaction.js";
import { UAParser } from "ua-parser-js";
import Logs from "../../models/Logs.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";
dotenv.config();
//#region foodItemByCinemaId
export const foodItemByCinemaId = async (req, res) => {
  try {
    let { id } = req.params;
    const foodItemDetails = await Item.find({
      cinemaObjectId: id,
      isActive: true,
      type: { $in: ["Beverage", "Combo", "Popcorn", "Snacks"] },
    }).sort({ itemSequence: 1 });

    console.log(foodItemDetails.length, ":foodItemDetails");

    if (!foodItemDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FOOD_ITEMS_DETAILS,
        data: foodItemDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region editFoodItem
export const editFoodItem = async (req, res) => {
  try {
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let IpAddress = req.socket.remoteAddress;

    let { id, type, itemSequence, itemName } = req.body;
    let exist = await Item.findById({ _id: id });
    if (!exist.isEdit && itemName && itemName !== exist.itemDescription) {
      exist.isEdit = true;
    }
    if (req.files.poster) {
      // fs.unlink("./public/uploads/" + exist.poster, () => {});
      await deleteS3File(exist.poster);
    } else if (req.body.removePosterUrl) {
      // fs.unlink("./public/uploads/" + req.body.removePosterUrl, () => {});
      await deleteS3File(req.body.removePosterUrl);
      exist.poster = "";
    } else {
      req.posterUrl = exist.poster;
    }
    let update = await Item.findByIdAndUpdate(
      { _id: id },
      { poster: req.posterUrl, type, itemSequence, itemDescription: itemName },
      { new: true }
    );
    await exist.save();
    if (update) {
      await Logs.create({
        title: `Food And Beverages Updaten By Admin : ${update?._id}`,
        lastSync: Date.now(),
        cinemaId: update?.cinemaObjectId,
        ipAddress: IpAddress,
        webBrowser: browserName,
      });
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FOOD_ITEMS_UPDATED,
        data: update,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region updateStatus
export const updateStatusFoodAndBvg = async (req, res) => {
  try {
    let { id, isActive } = req.body;
    let update = await Item.findByIdAndUpdate(
      { _id: id },
      { isActive: isActive },
      { new: true }
    );
    if (update) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FOOD_ITEMS_STATUS_UPDATED,
        data: update,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region adminFoodItemByCinemaId
export const adminFoodItemByCinemaId = async (req, res) => {
  try {
    let { id } = req.params;
    const foodItemDetails = await Item.find({
      cinemaObjectId: id,
      // type: {$ne: "Other"}
    }).sort({ createdAt: -1 });
    let foodItem = foodItemDetails.map((data) => {
      return {
        ...data._doc,
        itemPrice: data?.itemPrice / 100 + ((data?.itemPrice / 100) * 5) / 100,
        originalPrice: data.itemPrice,
      };
    });

    if (!foodItem) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FOOD_ITEMS_DETAILS,
        data: foodItem,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region addConcessions
export const addConcessions = async (req, res) => {
  try {
    // const text=req.body.data
    // const tempData =  decryptPayment("testText123",text)
    // const payload=JSON.parse(tempData);

    // let { cinemaId, strTransId, strItemsOrder, itemData } = payload;
    let { cinemaId, strTransId, strItemsOrder, itemData } = req.body;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${process.env.VISTA_URL}/api.asmx/AddMultiConcessionsNew?strCinemaId=${cinemaId}&strTransId=${strTransId}&strItemsOrder=${strItemsOrder}`,
      headers: {},
    };

    // const vistaLogRequest = {
    //   ...config,
    //   queryParameters: {
    //     strCinemaId: cinemaId,
    //     strTransId: strTransId,
    //     strItemsOrder: strItemsOrder
    //   },
    // };

    axios
      .request(config)
      .then(async (response) => {
        if (response.data.Status == 1) {
          const dataToSet = JSON.parse(itemData);
          await Transaction.findOneAndUpdate(
            { initTransId: strTransId },
            {
              $set: { foodAndBvgResponse: response.data.data },
              // $push: {
              //   [dataToSet ? "fAndBDetails" : ""]: dataToSet,
              // },
            }
          ).sort({ createdAt: -1 });
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "F&B",
          //   "AddMultiConcessionsNew",
          //   vistaLogRequest,
          //   response.data,
          //   "Success"
          // );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CONSSESION_ADDED,
            data: response.data,
          });
        } else {
          // createVistaLog(
          //   strTransId,
          //   null,
          //   "F&B",
          //   "AddMultiConcessionsNew",
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
        //   strTransId,
        //   null,
        //   "F&B",
        //   "AddMultiConcessionsNew",
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
