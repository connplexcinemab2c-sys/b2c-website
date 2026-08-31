import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    // Time window in IST: July 31, 2026, 21:50:00 to 22:00:00
    // In UTC: July 31, 2026, 16:20:00 to 16:30:00
    const start = new Date("2026-07-31T16:20:00.000Z");
    const end = new Date("2026-07-31T16:30:00.000Z");

    console.log("Searching in logs...");
    const logs = await db.collection("logs").find({
      createdAt: { $gte: start, $lte: end }
    }).toArray();
    console.log(`Found ${logs.length} logs.`);
    for (const log of logs) {
      const logStr = JSON.stringify(log);
      if (logStr.includes("pay_TKAw") || logStr.includes("1000") || logStr.includes("TKAw")) {
        console.log(`[MATCH IN LOGS]:`, JSON.stringify(log, null, 2));
      }
    }

    console.log("Searching in vistalogs...");
    const vistalogs = await db.collection("vistalogs").find({
      createdAt: { $gte: start, $lte: end }
    }).toArray();
    console.log(`Found ${vistalogs.length} vistalogs.`);
    for (const vlog of vistalogs) {
      const vlogStr = JSON.stringify(vlog);
      if (vlogStr.includes("pay_TKAw") || vlogStr.includes("1000") || vlogStr.includes("TKAw")) {
        console.log(`[MATCH IN VISTALOGS]:`, JSON.stringify(vlog, null, 2));
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
