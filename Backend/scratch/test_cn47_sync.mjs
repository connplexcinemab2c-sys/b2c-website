import mongoose from "mongoose";
import axios from "axios";
import { showSync } from "../src/controller/admin/CinemaWiseDataSync.js";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_URL = "http://14.194.50.141";

async function testSyncCN47() {
  await mongoose.connect(MONGO_URL);

  const cinema = await mongoose.connection.db.collection("cinemas").findOne({ cinemaId: "CN47" });
  console.log("Cinema CN47 from DB:", cinema?._id, cinema?.displayName);

  const showsBefore = await mongoose.connection.db.collection("shows").find({ cinemaId: "CN47" }).toArray();
  console.log(`Shows in DB before sync: ${showsBefore.length}`);
  showsBefore.forEach(s => console.log(`  Show ${s.sessionId} | ${s.sessionRealShow} | active: ${s.isActive}`));

  console.log("\nFetching GetCinemawiseSession for CN47...");
  const sessRes = await axios.get(`${VISTA_URL}/api.asmx/GetCinemawiseSession?CinemaID=CN47`);
  console.log("SessionList length from Vista:", sessRes.data?.data?.SessionList?.length);

  console.log("\nRunning showSync('CN47', sessRes)...");
  try {
    const res = await showSync("CN47", sessRes);
    console.log("showSync result:", res);
  } catch (err) {
    console.error("showSync failed:", err);
  }

  const showsAfter = await mongoose.connection.db.collection("shows").find({ cinemaId: "CN47" }).toArray();
  console.log(`\nShows in DB after sync: ${showsAfter.length}`);
  showsAfter.forEach(s => console.log(`  Show ${s.sessionId} | ${s.sessionRealShow} | active: ${s.isActive} | status: ${s.screenStatus} | filmCode: ${s.filmCode} | movieObjectId: ${s.filmObjectId}`));

  await mongoose.disconnect();
}

testSyncCN47().catch(console.error);
