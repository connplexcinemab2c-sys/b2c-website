import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function main() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("=== 1. Most Recent UniversalLogs (last 10) ===");
  const logs = await db.collection("universallogs")
    .find()
    .sort({ _id: -1 })
    .limit(5)
    .toArray();

  for (const l of logs) {
    console.log("------------------");
    console.log("Transaction ID:", l.transaction_id);
    console.log("Created/Updated:", l.createdAt, l.updatedAt);
    console.log("Steps:", JSON.stringify(l.steps, null, 2));
  }

  console.log("\n=== 2. Most Recent VistaLogs (last 5) ===");
  const vlogs = await db.collection("vistalogs")
    .find()
    .sort({ _id: -1 })
    .limit(5)
    .toArray();

  for (const vl of vlogs) {
    console.log("------------------");
    console.log("Type:", vl.type, "Status:", vl.status, "Cinema:", vl.cinemaId, "Date:", vl.createdAt);
    console.log("Request:", JSON.stringify(vl.vistaRequest));
    console.log("Response:", JSON.stringify(vl.vistaResponse));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
