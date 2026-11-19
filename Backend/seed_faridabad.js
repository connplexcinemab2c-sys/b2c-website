import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || process.env.DB_URL || "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_BASE = process.env.VISTA_URL ? `${process.env.VISTA_URL}/api.asmx` : "http://14.194.50.141/api.asmx";

async function main() {
  try {
    console.log("=== 1. Connecting to MongoDB ===");
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB successfully.");

    const db = mongoose.connection.db;

    console.log("\n=== 2. Find or Create FARIDABAD Region ===");
    let faridabadRegion = await db.collection("regions").findOne({ region: "FARIDABAD", deletedStatus: 0 });
    if (!faridabadRegion) {
      console.log("Region FARIDABAD not found in DB. Creating it...");
      const newRegion = {
        region: "FARIDABAD",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "28.4089",
        long: "77.3178",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await db.collection("regions").insertOne(newRegion);
      console.log("Created region FARIDABAD with ID:", insertResult.insertedId);
      faridabadRegion = { _id: insertResult.insertedId, ...newRegion };
    } else {
      console.log("Region FARIDABAD already exists with ID:", faridabadRegion._id);
      if (!faridabadRegion.isActive) {
        await db.collection("regions").updateOne({ _id: faridabadRegion._id }, { $set: { isActive: true } });
        console.log("Marked FARIDABAD region as active.");
      }
    }

    console.log("\n=== 3. Update Vista Central Server Registry for CN47 ===");
    const cinemaId = "CN47";
    const webServiceUrl = "http://122.160.144.228:8080/VistaWebServic/clsBook.asmx";
    const licenseCode = "8245";
    const cinemaName = "CONNPLEX SMART CINEMAS: FARIDABAD";

    console.log(`Updating WebService URL on Vista Central (${VISTA_BASE}) for ${cinemaId}...`);
    try {
      const urlResponse = await axios.get(`${VISTA_BASE}/UpdateCinemawebservicesURL`, {
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

    console.log(`Updating License Code on Vista Central (${VISTA_BASE}) for ${cinemaId}...`);
    try {
      const licResponse = await axios.get(`${VISTA_BASE}/UpdateCinemaLicence`, {
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
      cinemaLicenseName: "Connplex Smart Cinemas Faridabad",
      cinemaLicenseNumber: licenseCode,
      websiteLicenseNumber: parseInt(licenseCode, 10),
      cinemaWebServiceUrl: webServiceUrl,
      cinemaWebServiceUrl2: webServiceUrl,
      cinemaWebServiceUrl3: null,
      regionId: faridabadRegion._id,
      cinemaBranchCode: "64",
      deletedStatus: 0,
      isActive: true,
      lat: "28.408900",
      long: "77.317800",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      images: [],
      cinema_images: [],
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Faridabad, Haryana",
      emailId: "faridabad@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Smart+Cinemas+Faridabad",
      mobileNumber: 9924577556,
      GSTNumber: "07AACCF6476A1ZT",
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

    let savedCinemaId;
    if (existCinema) {
      console.log(`Cinema ${cinemaId} already exists in DB (_id: ${existCinema._id}). Updating details...`);
      await db.collection("cinemas").updateOne({ _id: existCinema._id }, { $set: cinemaData });
      savedCinemaId = existCinema._id;
      console.log("Cinema details updated successfully.");
    } else {
      console.log(`Cinema ${cinemaId} not found in DB. Inserting new cinema document...`);
      cinemaData.createdAt = new Date();
      const insertResult = await db.collection("cinemas").insertOne(cinemaData);
      savedCinemaId = insertResult.insertedId;
      console.log("Cinema created in DB with ID:", savedCinemaId);
    }

    // Add log
    await db.collection("logs").insertOne({
      title: `Create New Cinema : ${cinemaId} (${cinemaName})`,
      lastSync: Date.now(),
      cinemaId: savedCinemaId,
      ipAddress: "127.0.0.1",
      webBrowser: "System / Script",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("\n=== 5. Verification ===");
    const verifiedCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    console.log("Verified Cinema in DB:", {
      _id: verifiedCinema._id,
      cinemaId: verifiedCinema.cinemaId,
      name: verifiedCinema.displayName,
      url: verifiedCinema.cinemaWebServiceUrl,
      license: verifiedCinema.cinemaLicenseNumber,
      websiteLicense: verifiedCinema.websiteLicenseNumber,
      regionId: verifiedCinema.regionId,
      branchCode: verifiedCinema.cinemaBranchCode,
      address: verifiedCinema.address,
      isActive: verifiedCinema.isActive,
      deletedStatus: verifiedCinema.deletedStatus
    });

    const verifiedRegion = await db.collection("regions").findOne({ _id: faridabadRegion._id });
    console.log("Verified Region in DB:", {
      _id: verifiedRegion._id,
      region: verifiedRegion.region,
      lat: verifiedRegion.lat,
      long: verifiedRegion.long,
      isActive: verifiedRegion.isActive,
      deletedStatus: verifiedRegion.deletedStatus
    });

    await mongoose.disconnect();
    console.log("\nDB disconnected. Faridabad Cinema setup completed successfully!");
  } catch (err) {
    console.error("Error in seed_faridabad:", err);
  }
}

main();
