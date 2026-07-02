import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function inspect() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    const cinemas = await db.collection("cinemas").find({ deletedStatus: 0 }).toArray();
    console.log(`Found ${cinemas.length} active cinemas:`);
    cinemas.forEach(c => {
      console.log(`- Name: "${c.displayName || c.cinemaName}"`);
      console.log(`  cinemaId: "${c.cinemaId}"`);
      console.log(`  cinemaBranchCode: "${c.cinemaBranchCode}"`);
      console.log(`  cinemaWebServiceUrl: "${c.cinemaWebServiceUrl}"`);
      console.log(`  regionId: "${c.regionId}"`);
      console.log(`  websiteLicenseNumber: "${c.websiteLicenseNumber}"`);
      console.log(`  -----------------------------------------`);
    });

    // Also get existing regions to map the regionId if needed
    const regions = await db.collection("regions").find({ deletedStatus: 0 }).toArray();
    console.log("\nActive regions:");
    regions.forEach(r => {
      console.log(`- ${r.region} (ID: ${r._id})`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspect();
