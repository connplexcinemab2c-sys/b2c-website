import mongoose from "mongoose";
import axios from "axios";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_CENTRAL_URL = "http://14.194.50.141/api.asmx";

async function main() {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("DB connected successfully.");

    const db = mongoose.connection.db;

    // 2. Find or create region "JAMSHEDPUR"
    let jamshedpurRegion = await db.collection("regions").findOne({ region: "JAMSHEDPUR", deletedStatus: 0 });
    if (!jamshedpurRegion) {
      console.log("Region JAMSHEDPUR not found in DB. Creating it...");
      const newRegion = {
        region: "JAMSHEDPUR",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "22.8046",
        long: "86.2029",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await db.collection("regions").insertOne(newRegion);
      console.log("Created region JAMSHEDPUR with ID:", insertResult.insertedId);
      jamshedpurRegion = { _id: insertResult.insertedId, ...newRegion };
    } else {
      console.log("Region JAMSHEDPUR already exists with ID:", jamshedpurRegion._id);
    }

    // 3. Define Cinema data for CONNPLEX SIGNATURE CINEMAS: JAMSHEDPUR (CN43)
    const cinemaId = "CN43";
    const cinemaData = {
      cinemaId: cinemaId,
      cinemaName: "CONNPLEX SIGNATURE CINEMAS: JAMSHEDPUR",
      displayName: "CONNPLEX SIGNATURE CINEMAS: JAMSHEDPUR",
      cinemaLicenseName: "Connplex Signature Cinemas Jamshedpur",
      cinemaLicenseNumber: "8183",
      websiteLicenseNumber: 8183,
      cinemaWebServiceUrl: "http://43.251.74.110/VistaWebService/clsbook.asmx",
      cinemaWebServiceUrl2: "http://43.251.74.110/VistaWebService/clsbook.asmx",
      regionId: jamshedpurRegion._id,
      cinemaBranchCode: "0001",
      deletedStatus: 0,
      isActive: true,
      lat: "22.804600",
      long: "86.202900",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Jamshedpur, Jharkhand",
      emailId: "jamshedpur@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Signature+Cinemas+Jamshedpur",
      mobileNumber: 9924577556,
      GSTNumber: "20AACCF6476A1Z5",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      updatedAt: new Date()
    };

    // 4. Register or update cinema in MongoDB
    console.log(`Registering cinema ${cinemaId} in MongoDB...`);
    const existCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    if (existCinema) {
      console.log(`Cinema ${cinemaId} already exists in DB. Updating details...`);
      await db.collection("cinemas").updateOne({ _id: existCinema._id }, { $set: cinemaData });
      console.log("Cinema details updated successfully.");
    } else {
      cinemaData.createdAt = new Date();
      const result = await db.collection("cinemas").insertOne(cinemaData);
      console.log("Cinema created in DB with ID:", result.insertedId);
    }

    // 5. Update WebService URL on Vista Central
    console.log(`Updating WebService URL on Vista Central for ${cinemaId}...`);
    try {
      const urlResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
        params: {
          strCinemaId: cinemaId,
          strWebServiceURL: "http://43.251.74.110/VistaWebService/clsbook.asmx"
        }
      });
      console.log("Vista WebService URL response:", JSON.stringify(urlResponse.data));
    } catch (urlErr) {
      console.error("Failed to update WebService URL on Vista Central:", urlErr.message);
    }

    // 6. Update License Code on Vista Central
    console.log(`Updating License Code on Vista Central for ${cinemaId}...`);
    try {
      const licResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
        params: {
          strCinemaId: cinemaId,
          Licencecode: "8183"
        }
      });
      console.log("Vista License Code response:", JSON.stringify(licResponse.data));
    } catch (licErr) {
      console.error("Failed to update License Code on Vista Central:", licErr.message);
    }

    // 7. Verify MongoDB Record
    const verifiedCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    console.log("\nVerified Cinema document in DB:");
    console.log(JSON.stringify(verifiedCinema, null, 2));

    await mongoose.disconnect();
    console.log("\nDB disconnected. Cinema setup completed successfully.");
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
