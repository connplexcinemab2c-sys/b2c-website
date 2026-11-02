import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

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

    console.log("\n=== 2. Find or Verify VADODARA Region ===");
    let vadodaraRegion = await db.collection("regions").findOne({ region: "VADODARA", deletedStatus: 0 });
    if (!vadodaraRegion) {
      console.log("Region VADODARA not found in DB. Creating it...");
      const newRegion = {
        region: "VADODARA",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "22.3072",
        long: "73.1812",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await db.collection("regions").insertOne(newRegion);
      console.log("Created region VADODARA with ID:", insertResult.insertedId);
      vadodaraRegion = { _id: insertResult.insertedId, ...newRegion };
    } else {
      console.log("Region VADODARA already exists with ID:", vadodaraRegion._id);
      if (!vadodaraRegion.isActive) {
        await db.collection("regions").updateOne({ _id: vadodaraRegion._id }, { $set: { isActive: true } });
        console.log("Marked VADODARA region as active.");
      }
    }

    console.log("\n=== 3. Update Vista Central Server Registry for CN45 ===");
    const cinemaId = "CN45";
    const webServiceUrl = "http://223.235.247.60/VistaWebService/clsbook.asmx";
    const licenseCode = "6571";
    const cinemaName = "CONNPLEX LUXURIANCE CINEMAS: THE ICONIC, HARNI";

    console.log(`Updating WebService URL on Vista Central for ${cinemaId}...`);
    try {
      const urlResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
        params: {
          strCinemaId: cinemaId,
          strWebServiceURL: webServiceUrl
        },
        timeout: 15000
      });
      console.log("Vista WebService URL response:", JSON.stringify(urlResponse.data));
    } catch (e) {
      console.warn("Vista WebService URL update warning:", e.message);
    }

    console.log(`Updating License Code on Vista Central for ${cinemaId}...`);
    try {
      const licResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
        params: {
          strCinemaId: cinemaId,
          Licencecode: licenseCode
        },
        timeout: 15000
      });
      console.log("Vista License Code response:", JSON.stringify(licResponse.data));
    } catch (e) {
      console.warn("Vista License Code update warning:", e.message);
    }

    console.log("\n=== 4. Register or Update Cinema in MongoDB ===");
    const cinemaData = {
      cinemaId: cinemaId,
      cinemaName: cinemaName,
      displayName: cinemaName,
      cinemaLicenseName: cinemaName,
      cinemaLicenseNumber: licenseCode,
      websiteLicenseNumber: parseInt(licenseCode, 10),
      cinemaWebServiceUrl: webServiceUrl,
      cinemaWebServiceUrl2: webServiceUrl,
      cinemaWebServiceUrl3: null,
      regionId: vadodaraRegion._id,
      cinemaBranchCode: "1234",
      deletedStatus: 0,
      isActive: true,
      lat: "22.341600",
      long: "73.219300",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "1743065366945.jpg",
      images: [],
      cinema_images: [
        "1743065366955.jpg",
        "1743065366957.jpg"
      ],
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "The Iconic, 30 Mtr. Harni - Sama Link Road, Opposite The Landmark, Harni, Vadodara, Gujarat 390022",
      emailId: "iconic.harni@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=The+Iconic+Harni+Vadodara+Gujarat",
      mobileNumber: 9924577556,
      GSTNumber: "24AACCF6476A1ZX",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      lastSync: new Date(),
      lastSyncStatus: true,
      updatedAt: new Date()
    };

    const existCinema = await db.collection("cinemas").findOne({
      $or: [
        { cinemaId: cinemaId },
        { cinemaName: cinemaName },
        { displayName: cinemaName }
      ]
    });

    if (existCinema) {
      console.log(`Cinema ${cinemaId} already exists in DB (_id: ${existCinema._id}). Updating details...`);
      await db.collection("cinemas").updateOne({ _id: existCinema._id }, { $set: cinemaData });
      console.log("Cinema details updated successfully.");
    } else {
      console.log(`Cinema ${cinemaId} not found in DB. Inserting new cinema document...`);
      cinemaData.createdAt = new Date();
      const insertResult = await db.collection("cinemas").insertOne(cinemaData);
      console.log("Cinema created in DB with ID:", insertResult.insertedId);
    }

    console.log("\n=== 5. Syncing Data for CN45 (The Iconic, Harni) ===");
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
      console.log("showSync completed. Shows added/processed:", showsCount);
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
      branchCode: verifiedCinema.cinemaBranchCode,
      address: verifiedCinema.address,
      isActive: verifiedCinema.isActive,
      deletedStatus: verifiedCinema.deletedStatus
    });

    const activeShowsCount = await db.collection("shows").countDocuments({
      cinemaId: cinemaId,
      deletedStatus: 0,
      isActive: true
    });
    console.log(`Active shows in DB for ${cinemaId}:`, activeShowsCount);

    await mongoose.disconnect();
    console.log("\nDB disconnected. Cinema creation complete!");
  } catch (err) {
    console.error("Error in seed_harni:", err);
  }
}

main();
