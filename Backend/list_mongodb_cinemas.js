import mongoose from "mongoose";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";

async function list() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected.");

    const db = mongoose.connection.db;

    const cinemas = await db.collection("cinemas").find({ deletedStatus: 0 }).toArray();
    console.log(`Found ${cinemas.length} active cinemas in MongoDB:`);
    
    // Sort by numeric part of cinemaId
    cinemas.sort((a, b) => {
      const idA = parseInt(a.cinemaId?.replace("CN", "")) || 0;
      const idB = parseInt(b.cinemaId?.replace("CN", "")) || 0;
      return idA - idB;
    });

    cinemas.forEach(c => {
      console.log(`- ID: ${c.cinemaId}, Name: "${c.displayName || c.cinemaName}", Branch: "${c.cinemaBranchCode}", License: "${c.cinemaLicenseNumber || c.websiteLicenseNumber}"`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

list();
