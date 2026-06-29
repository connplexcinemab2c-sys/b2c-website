import SubscriptionMembership from "../../models/SubscriptionMembership.js";
import Transaction from "../../models/Transaction.js";
import Rewards from "../../models/Rewards.js";
import RewardConfig from "../../models/RewardConfig.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import { populate } from "dotenv";
import { User } from "../../models/User.js";
import mongoose from "mongoose";
// import SubscriptionMembership from "../../models/SubscriptionMembership.js";
export const getRewardsByUserId = async (req, res) => {
  try {
    const userId = req.user;
    const rewards = await Rewards.find({ userId: userId })
      .populate({
        path: "transactionId",
        select: ["movieId", "initTransId", "paymentResponse.amount"],
        populate: {
          path: "movieId", // populate the movieId field inside transactionId
          select: "movieId name", // select only movieId
        },
      })
      .sort({ createdAt: -1 });
    if (!rewards) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REWARDS_NOT_FOUND,
        data: [],
      });
    }
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.REWARDS_FOUND,
      data: rewards,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};
// const transactionId = "20000136320";
export const calculateAndSaveCoins = async (transactionId) => {
  // console.log(transactionId, "transactionId");

  try {
    const transaction = await Transaction.findOne({
      initTransId: transactionId,
      // initTransId: "20000000424",

      paymentsStatus: true,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }
    // console.log("transaction", transaction);

    const transactionAmount = transaction.finalBookingCalculation.finalAmount;
    // console.log(transactionAmount, "transactionAmount");

    const userId = transaction.userId;
    // console.log(userId, "userId");
    // const subMeb = await User.findOne(userId);
    const subMeb = await SubscriptionMembership.findOne({ userId }).sort({
      createdAt: -1,
    });
    // console.log("subMebsubMebsubMebsubMebsubMebsubMeb", subMeb);
     const config = await RewardConfig.findOne({});

    // const coinsPercentage = Number(subMeb.subscriptionDetails.coins);
    const coinsPercentage = Number(config?.earnRate ?? 0);


    const newTotalCoins = Math.floor(
      transactionAmount * (coinsPercentage / 100)
    );

    // Determine expiryDate from current reward config
   
    let expiryDate = null;
    if (config) {
      if (config.expiryRule === "fixed" && config.fixedExpiryDate) {
        expiryDate = config.fixedExpiryDate;
      } else {
        // rolling: expiryDate = createdAt (now) + expiryDays
        expiryDate = new Date(
          Date.now() + Number(config.expiryDays) * 24 * 60 * 60 * 1000
        );
      }
    }

  const rewardDetails = {
      userId,
      transactionId: transaction._id,
      coins: newTotalCoins,
      redeemCoins: 0,
      remainingCoins: newTotalCoins,
      type: "earned",
      expiryDate,
    }

    const newRewards = await Rewards.create(rewardDetails);

    const userCoins = await newRewards.save();

    return {
      success: true,
      message: "Coins calculated and saved successfully",
      data: userCoins,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getRewardBalance = async (req, res) => {
  try {
    const userId = req.user;
    const now = new Date();

    const [earned, config] = await Promise.all([
      Rewards.find({ userId, type: {$ne:"redeemed"}, deletedStatus: 0 }),
      RewardConfig.findOne({}),
    ]);

    const available = earned
      .filter((r) => !r.expiryDate || new Date(r.expiryDate) > now)
      .reduce((sum, r) => sum + (r.coins - r.redeemCoins), 0);

    return res.status(200).json({
      status: 200,
      message: ResponseMessage.REWARDS_FOUND,
      data: {
        availableCoins: available,
        conversionPoints: config?.conversionPoints ?? 100,
        conversionValue: config?.conversionValue ?? 10,
        maxRedemptionCap: config?.maxRedemptionCap ?? 1000,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Core FIFO redemption service — used by both the HTTP handler and the
 * payment-success callback. Creates a `type:"redeemed"` Rewards entry with
 * full `sourceEntries` (which earned batches were consumed) and pushes a
 * `redemptionLog` entry onto every earned document it touches.
 */
export const processCoinRedemption = async ({
  userId,
  coinsToRedeem,
  transactionId = null,
}) => {
  const coins = Number(coinsToRedeem);
  if (!coins || isNaN(coins) || coins <= 0) {
    throw new Error("Invalid coins to redeem.");
  }

  const config = await RewardConfig.findOne({});
  const maxCap = config?.maxRedemptionCap ?? 1000;
  const conversionPoints = config?.conversionPoints ?? 100;
  const conversionValue = config?.conversionValue ?? 10;

  if (coins > maxCap) {
    throw new Error(
      `Redemption exceeds maximum cap of ${maxCap} points per transaction.`
    );
  }

  const now = new Date();
  const earnedRecords = await Rewards.find({
    userId,
    type: { $ne: "redeemed" }, // includes both type:"earned" and old docs without a type field
    deletedStatus: 0,
    $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
  }).sort({ createdAt: 1 }); // FIFO — oldest first

  const availableRecords = earnedRecords.filter(
    (r) => r.coins - r.redeemCoins > 0
  );
  const totalAvailable = availableRecords.reduce(
    (sum, r) => sum + (r.coins - r.redeemCoins),
    0
  );

  if (coins > totalAvailable) {
    throw new Error(
      `Insufficient coins. Available balance: ${totalAvailable} points.`
    );
  }

  // ── Pass 1: calculate deductions per earned entry ────────────────────────
  let remaining = coins;
  const sourceEntries = [];    // goes into the redeemed Rewards doc
  const deductionMap = [];     // used in the bulkWrite below

  for (const record of availableRecords) {
    if (remaining <= 0) break;
    const available = record.coins - record.redeemCoins;
    const deduct = Math.min(available, remaining);
    sourceEntries.push({ earnedRewardId: record._id, coinsDeducted: deduct });
    deductionMap.push({ record, available, deduct });
    remaining -= deduct;
  }

  // ── Pass 2: create the redeemed entry first so we have its _id ───────────
  const redeemEntry = await Rewards.create({
    userId,
    transactionId,
    coins,
    redeemCoins: 0,
    remainingCoins: 0,
    type: "redeemed",
    sourceEntries, // which earned batches were consumed
  });

  // ── Pass 3: bulkWrite earned entries — deduct + push redemptionLog ───────
  const bulkOps = deductionMap.map(({ record, available, deduct }) => ({
    updateOne: {
      filter: {
        _id: record._id,
        // guard against concurrent over-deduction
        $expr: { $gte: [{ $subtract: ["$coins", "$redeemCoins"] }, deduct] },
      },
      update: {
        $inc: { redeemCoins: deduct, remainingCoins: -deduct },
        $push: {
          redemptionLog: {
            transactionId: transactionId || null,
            rewardEntryId: redeemEntry._id,
            coinsUsed: deduct,
            usedAt: new Date(),
          },
        },
      },
    },
  }));

  if (bulkOps.length) await Rewards.bulkWrite(bulkOps);

  const monetaryValue = Math.floor(coins / conversionPoints) * conversionValue;

  return {
    redeemedCoins: coins,
    monetaryValue,
    entry: redeemEntry,
  };
};

export const getRewardByTransaction = async (req, res) => {
  try {
    const userId = req.user;
    const { transId } = req.query;

    if (!transId) {
      return res.status(400).json({ status: 400, message: "transId is required" });
    }

    const transaction = await Transaction.findOne({ initTransId: transId }).sort({ createdAt: -1 });
    if (!transaction) {
      return res.status(404).json({ status: 404, message: "Transaction not found", data: null });
    }

    const reward = await Rewards.findOne({
      userId,
      transactionId: transaction._id,
      type: "earned",
    });

    return res.status(200).json({
      status: 200,
      message: reward ? ResponseMessage.REWARDS_FOUND : ResponseMessage.REWARDS_NOT_FOUND,
      data: reward || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const redeemCoins = async (req, res) => {
  try {
    const userId = req.user;
    const { coinsToRedeem, transactionId } = req.body;

    const coins = Number(coinsToRedeem);
    if (!coins || isNaN(coins) || coins <= 0) {
      return res.status(400).json({ status: 400, message: "Invalid coins to redeem." });
    }

    const config = await RewardConfig.findOne({});
    const maxCap = config?.maxRedemptionCap ?? 1000;

    if (coins > maxCap) {
      return res.status(400).json({
        status: 400,
        message: `Redemption exceeds maximum cap of ${maxCap} points per transaction.`,
      });
    }

    const result = await processCoinRedemption({ userId, coinsToRedeem: coins, transactionId });

    return res.status(200).json({
      status: 200,
      message: ResponseMessage.COINS_REDEEMED,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message || ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export default calculateAndSaveCoins;
