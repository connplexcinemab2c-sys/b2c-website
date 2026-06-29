import LogsModel from "../models/UniversalLogs.js";
export const createLog = async (payload) => {
  try {
    const { transaction_id, step } = payload;

    // Check if log already exists
    const existingLog = await LogsModel.findOne({ transaction_id });

    if (existingLog) {
      // Just push the new step
      await LogsModel.findOneAndUpdate(
        { transaction_id },
        { $push: { steps: step } },
        { new: true }
      );

      return;
    }

    // Create new log entry
    const log = new LogsModel({
      transaction_id,
      steps: [step],
    });

    await log.save();

  } catch (err) {
    console.error("Error creating log:", err);
  }
};
