import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function checkRecentLogs() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("=== RECENT LOGS IN MONGO ===");
  const recentLogs = await db.collection("logs").find({}).sort({ createdAt: -1, _id: -1 }).limit(10).toArray();
  recentLogs.forEach(l => console.log(JSON.stringify(l)));

  console.log("\n=== RECENT VISTA LOGS ===");
  const recentVistaLogs = await db.collection("vistalogs").find({}).sort({ createdAt: -1, _id: -1 }).limit(20).toArray();
  recentVistaLogs.forEach(l => {
    console.log(`[${l.createdAt}] [${l.cinemaId}] [${l.action || l.method}] [${l.status}] - ${JSON.stringify(l.meta || l.response || l.data || "").slice(0, 150)}`);
  });

  await mongoose.disconnect();
}

checkRecentLogs().catch(console.error);
