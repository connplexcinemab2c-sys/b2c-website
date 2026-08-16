import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function checkDuplicates() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    const start = new Date("2026-06-30T19:00:00.000Z");
    const end = new Date("2026-07-31T19:00:00.000Z");

    const duplicates = await db.collection("transactions").aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: "$initTransId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Found ${duplicates.length} duplicate initTransId values in July 2026.`);
    if (duplicates.length > 0) {
      console.log("Sample duplicates:");
      console.log(duplicates.slice(0, 5));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDuplicates();
