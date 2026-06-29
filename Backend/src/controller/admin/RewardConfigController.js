import RewardConfig from "../../models/RewardConfig.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";

//#region saveRewardConfig
export const saveRewardConfig = async (req, res) => {
  try {
    const {
      earnRate,
      conversionPoints,
      conversionValue,
      maxRedemptionCap,
      expiryRule,
      expiryDays,
      expiringSoonDays,
    } = req.body;

    // For fixed rule: one calendar date for all points = now + expiryDays
    const fixedExpiryDate =
      expiryRule === "fixed"
        ? new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000)
        : undefined;

    const updatePayload = {
      earnRate,
      conversionPoints,
      conversionValue,
      maxRedemptionCap,
      expiryRule,
      expiryDays,
      expiringSoonDays,
    };

    if (fixedExpiryDate) {
      updatePayload.fixedExpiryDate = fixedExpiryDate;
    }

    const config = await RewardConfig.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.REWARD_CONFIG_SAVED,
      data: config,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getRewardConfig
export const getRewardConfig = async (req, res) => {
  try {
    let config = await RewardConfig.findOne({});

    if (!config) {
      config = await RewardConfig.create({});
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.REWARD_CONFIG_FETCHED,
      data: config,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
