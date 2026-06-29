import Rewards from "../models/Rewards.js";

export const expireRewardsPoints = async () => {
  try {
    const now = new Date();
    const result = await Rewards.updateMany(
      { expiryDate: { $lte: now }, isExpired: false, deletedStatus: 0 },
      { $set: { isExpired: true } }
    );
    console.log(`[ExpireRewardsJob] Expired ${result.modifiedCount} reward records.`);
  } catch (error) {
    console.error("[ExpireRewardsJob] Error:", error.message);
  }
};
