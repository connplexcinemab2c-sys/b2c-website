import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    // Search regions
    const regions = await db.collection("regions").find({
      $or: [
        { region: /darbhanga/i },
        { region: /solapur/i }
      ]
    }).toArray();
    console.log("Matching regions in DB:", JSON.stringify(regions, null, 2));

    // Search cinemas
    const cinemas = await db.collection("cinemas").find({
      $or: [
        { cinemaName: /darbhanga/i },
        { cinemaName: /solapur/i },
        { displayName: /darbhanga/i },
        { displayName: /solapur/i }
      ]
    }).toArray();
    console.log("Matching cinemas in DB:", JSON.stringify(cinemas, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

main();
