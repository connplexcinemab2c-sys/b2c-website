import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function listAll() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;
  const cinemas = await db.collection("cinemas").find({ deletedStatus: 0 }).project({ cinemaId: 1, cinemaName: 1, displayName: 1, cinemaBranchCode: 1, cinemaWebServiceUrl: 1, isActive: 1 }).toArray();
  console.log(`Active cinemas count: ${cinemas.length}`);
  for (const c of cinemas) {
    console.log(`${c.cinemaId} | "${c.displayName || c.cinemaName}" | Code: ${c.cinemaBranchCode} | URL: ${c.cinemaWebServiceUrl} | Active: ${c.isActive}`);
  }
  await mongoose.disconnect();
}

listAll().catch(console.error);
