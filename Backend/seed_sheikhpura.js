import mongoose from "mongoose";
import axios from "axios";
import {
  movieSync,
  showSync,
  priceDataSyncCinemaWise,
  pricePackageDataSyncCinemaWise,
  todayShowSync
} from "./src/controller/admin/CinemaWiseDataSync.js";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_CENTRAL_URL = "http://14.194.50.141/api.asmx";

async function main() {
  try {
    console.log("=== 1. Connecting to MongoDB ===");
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully.");

    const db = mongoose.connection.db;

    console.log("\n=== 2. Find or Create SHEIKHPURA Region ===");
    let sheikhpuraRegion = await db.collection("regions").findOne({ region: "SHEIKHPURA", deletedStatus: 0 });
    if (!sheikhpuraRegion) {
      console.log("Region SHEIKHPURA not found in DB. Creating it...");
      const newRegion = {
        region: "SHEIKHPURA",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "25.1384",
        long: "85.8569",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await db.collection("regions").insertOne(newRegion);
      console.log("Created region SHEIKHPURA with ID:", insertResult.insertedId);
      sheikhpuraRegion = { _id: insertResult.insertedId, ...newRegion };
    } else {
      console.log("Region SHEIKHPURA already exists with ID:", sheikhpuraRegion._id);
      if (!sheikhpuraRegion.isActive) {
        await db.collection("regions").updateOne({ _id: sheikhpuraRegion._id }, { $set: { isActive: true } });
        console.log("Marked SHEIKHPURA region as active.");
      }
    }

    console.log("\n=== 3. Update Vista Central Server Registry for CN92 ===");
    const cinemaId = "CN92";
    const webServiceUrl = "http://182.64.234.158/VistaWebService/clsbook.asmx";
    const licenseCode = "8012";

    console.log(`Updating WebService URL on Vista Central for ${cinemaId}...`);
    const urlResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: cinemaId,
        strWebServiceURL: webServiceUrl
      }
    });
    console.log("Vista WebService URL response:", JSON.stringify(urlResponse.data));

    console.log(`Updating License Code on Vista Central for ${cinemaId}...`);
    const licResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: cinemaId,
        Licencecode: licenseCode
      }
    });
    console.log("Vista License Code response:", JSON.stringify(licResponse.data));

    console.log("\n=== 4. Register or Update Cinema in MongoDB ===");
    const cinemaData = {
      cinemaId: cinemaId,
      cinemaName: "CONNPLEX SMART CINEMAS: SHEIKHPURA",
      displayName: "CONNPLEX SMART CINEMAS: SHEIKHPURA",
      cinemaLicenseName: "Connplex Smart Cinemas Sheikhpura",
      cinemaLicenseNumber: licenseCode,
      websiteLicenseNumber: parseInt(licenseCode, 10),
      cinemaWebServiceUrl: webServiceUrl,
      cinemaWebServiceUrl2: webServiceUrl,
      regionId: sheikhpuraRegion._id,
      cinemaBranchCode: "1234",
      deletedStatus: 0,
      isActive: true,
      lat: "25.138400",
      long: "85.856900",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Sheikhpura, Bihar 811105",
      emailId: "sheikhpura@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Smart+Cinemas+Sheikhpura",
      mobileNumber: 9924577556,
      GSTNumber: "10AACCF6476A1Z6",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      updatedAt: new Date()
    };

    const existCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    if (existCinema) {
      console.log(`Cinema ${cinemaId} already exists in DB. Updating details...`);
      await db.collection("cinemas").updateOne({ _id: existCinema._id }, { $set: cinemaData });
      console.log("Cinema details updated successfully.");
    } else {
      console.log(`Cinema ${cinemaId} not found in DB. Inserting new cinema document...`);
      cinemaData.createdAt = new Date();
      const insertResult = await db.collection("cinemas").insertOne(cinemaData);
      console.log("Cinema created in DB with ID:", insertResult.insertedId);
    }

    console.log("\n=== 5. Syncing Data for CN92 (Sheikhpura) ===");
    console.log("Syncing movies...");
    try {
      await movieSync(cinemaId);
      console.log("movieSync completed.");
    } catch (e) {
      console.error("movieSync warning:", e.message);
    }

    console.log("Syncing shows...");
    try {
      const showsCount = await showSync(cinemaId);
      console.log("showSync completed. New shows added:", showsCount);
    } catch (e) {
      console.error("showSync warning:", e.message);
    }

    console.log("Syncing prices...");
    try {
      await priceDataSyncCinemaWise(cinemaId);
      console.log("priceDataSyncCinemaWise completed.");
    } catch (e) {
      console.error("priceDataSync warning:", e.message);
    }

    console.log("Syncing price packages...");
    try {
      await pricePackageDataSyncCinemaWise(cinemaId);
      console.log("pricePackageDataSyncCinemaWise completed.");
    } catch (e) {
      console.error("pricePackageDataSync warning:", e.message);
    }

    console.log("Syncing today shows...");
    try {
      await todayShowSync(cinemaId);
      console.log("todayShowSync completed.");
    } catch (e) {
      console.error("todayShowSync warning:", e.message);
    }

    console.log("\n=== 6. Verification ===");
    const verifiedCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    console.log("Verified Cinema in DB:", {
      _id: verifiedCinema._id,
      cinemaId: verifiedCinema.cinemaId,
      name: verifiedCinema.displayName,
      url: verifiedCinema.cinemaWebServiceUrl,
      license: verifiedCinema.cinemaLicenseNumber,
      regionId: verifiedCinema.regionId,
      isActive: verifiedCinema.isActive,
      deletedStatus: verifiedCinema.deletedStatus
    });

    const activeShowsCount = await db.collection("shows").countDocuments({
      cinemaId: cinemaId,
      deletedStatus: 0,
      isActive: true
    });
    console.log(`Active shows in DB for ${cinemaId}:`, activeShowsCount);

    const now = new Date();
    const futureShowsCount = await db.collection("shows").countDocuments({
      cinemaId: cinemaId,
      deletedStatus: 0,
      isActive: true,
      sessionRealShow: { $gte: now }
    });
    console.log(`Future shows in DB for ${cinemaId}:`, futureShowsCount);

    await mongoose.disconnect();
    console.log("\nDB disconnected. Cinema addition complete!");
  } catch (err) {
    console.error("Error in seed_sheikhpura:", err);
  }
}

main();
