import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function checkCN95() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const cinema = await db.collection("cinemas").findOne({ cinemaId: "CN95" });
  console.log("Cinema CN95:", cinema?._id, cinema?.displayName, "isActive:", cinema?.isActive, "regionId:", cinema?.regionId);

  const region = await db.collection("regions").findOne({ _id: cinema?.regionId });
  console.log("Region:", region?.name, "isActive:", region?.isActive);

  const shows = await db.collection("shows").find({ cinemaObjectId: cinema?._id }).sort({ sessionRealShow: -1 }).limit(10).toArray();
  console.log(`Recent shows count: ${shows.length}`);
  for (const s of shows) {
    console.log(`Show: ${s.sessionId} | ${s.sessionRealShow} | status: "${s.screenStatus}" | active: ${s.isActive} | filmCode: ${s.filmCode} | movieObjId: ${s.filmObjectId}`);
    if (s.filmObjectId) {
      const m = await db.collection("movies").findOne({ _id: s.filmObjectId });
      console.log(`  Movie: "${m?.name}" | active: ${m?.isActive} | uniqueCode: "${m?.uniqueFilmCode}"`);
    }
  }

  await mongoose.disconnect();
}

checkCN95().catch(console.error);
