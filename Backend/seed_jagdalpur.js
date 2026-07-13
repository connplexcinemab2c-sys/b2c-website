import mongoose from "mongoose";
import axios from "axios";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_BASE_URL = "http://14.194.50.141/api.asmx";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected successfully.");

    const db = mongoose.connection.db;

    // 1. Find or create region "JAGDALPUR"
    let region = await db.collection("regions").findOne({ region: "JAGDALPUR", deletedStatus: 0 });
    if (!region) {
      console.log("Region JAGDALPUR not found. Creating it...");
      const newRegion = {
        region: "JAGDALPUR",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "19.0730",
        long: "82.0135",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await db.collection("regions").insertOne(newRegion);
      console.log("Region created with ID:", insertResult.insertedId);
      region = { _id: insertResult.insertedId, ...newRegion };
    } else {
      console.log("Region JAGDALPUR already exists with ID:", region._id);
    }

    // 2. Find or create cinema "CN93" (Connplex Cinemas - Jagdalpur)
    let cinema = await db.collection("cinemas").findOne({ cinemaId: "CN93", deletedStatus: 0 });
    const cinemaData = {
      cinemaId: "CN93",
      cinemaName: "Connplex Cinemas - Jagdalpur",
      displayName: "Connplex Cinemas - Jagdalpur",
      cinemaLicenseName: "Connplex Cinemas Jagdalpur",
      cinemaLicenseNumber: "8173",
      websiteLicenseNumber: 8173,
      cinemaWebServiceUrl: "http://103.136.91.73/VistaWebService/clsBook.asmx",
      cinemaWebServiceUrl2: "http://103.136.91.73/VistaWebService/clsBook.asmx",
      regionId: region._id,
      cinemaBranchCode: "45",
      deletedStatus: 0,
      isActive: true,
      lat: "19.0730",
      long: "82.0135",
      convenienceFees: 0,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: [],
      updatedAt: new Date()
    };

    if (!cinema) {
      console.log("Cinema CN93 not found. Creating it...");
      cinemaData.createdAt = new Date();
      const insertResult = await db.collection("cinemas").insertOne(cinemaData);
      console.log("Cinema created with ID:", insertResult.insertedId);
    } else {
      console.log("Cinema CN93 already exists. Updating details...");
      await db.collection("cinemas").updateOne({ _id: cinema._id }, { $set: cinemaData });
      console.log("Cinema details updated.");
    }

    // 3. Update Vista central database settings
    console.log("Updating web service URL on Vista for CN93...");
    const urlResponse = await axios.get(`${VISTA_BASE_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: "CN93",
        strWebServiceURL: "http://103.136.91.73/VistaWebService/clsBook.asmx"
      }
    });
    console.log("Vista web service URL response:", JSON.stringify(urlResponse.data));

    console.log("Updating license code on Vista for CN93...");
    const licenseResponse = await axios.get(`${VISTA_BASE_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: "CN93",
        Licencecode: "8173"
      }
    });
    console.log("Vista license code response:", JSON.stringify(licenseResponse.data));

    // 4. Verify MongoDB record
    const verifiedCinema = await db.collection("cinemas").findOne({ cinemaId: "CN93" });
    console.log("\nVerified Cinema document in DB:");
    console.log(JSON.stringify(verifiedCinema, null, 2));

    await mongoose.disconnect();
    console.log("DB disconnected.");
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
