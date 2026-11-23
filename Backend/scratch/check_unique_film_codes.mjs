import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function check() {
  await mongoose.connect(MONGO_URL);
  const total = await mongoose.connection.db.collection("movies").countDocuments({});
  const missing = await mongoose.connection.db.collection("movies").countDocuments({
    $or: [
      { uniqueFilmCode: { $exists: false } },
      { uniqueFilmCode: null },
      { uniqueFilmCode: "" }
    ]
  });
  console.log(`Movies missing uniqueFilmCode: ${missing} out of ${total}`);

  // Also check shows with null filmObjectId or movies missing uniqueFilmCode
  const futureShows = await mongoose.connection.db.collection("shows").find({
    sessionRealShow: { $gte: new Date() },
    isActive: true,
    deletedStatus: 0
  }).toArray();

  let showsNullFilmObj = 0;
  let showsNoUniqueCode = 0;
  for (const s of futureShows) {
    if (!s.filmObjectId) {
      showsNullFilmObj++;
    } else {
      const m = await mongoose.connection.db.collection("movies").findOne({ _id: s.filmObjectId });
      if (!m || !m.uniqueFilmCode) {
        showsNoUniqueCode++;
      }
    }
  }

  console.log(`Future shows total: ${futureShows.length}`);
  console.log(`Future shows with null filmObjectId: ${showsNullFilmObj}`);
  console.log(`Future shows where movie has no uniqueFilmCode: ${showsNoUniqueCode}`);

  await mongoose.disconnect();
}

check().catch(console.error);
