import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function checkCinemasSyncTimes() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const cinemas = await db.collection("cinemas").find({ deletedStatus: 0 }).project({ cinemaId: 1, displayName: 1, cinemaName: 1, lastSync: 1, lastSyncStatus: 1, updatedAt: 1 }).sort({ lastSync: -1 }).toArray();
  for (const c of cinemas) {
    console.log(`${c.cinemaId} | "${c.displayName || c.cinemaName}" | lastSync: ${c.lastSync} (type: ${typeof c.lastSync}) | updatedAt: ${c.updatedAt}`);
  }

  await mongoose.disconnect();
}

checkCinemasSyncTimes().catch(console.error);
