import mongoose from "mongoose";
import axios from "axios";

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_CENTRAL_URL = "http://14.194.50.141/api.asmx";

async function main() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log("DB connected successfully.");

    const db = mongoose.connection.db;

    // 2. Define Patna regionId
    const patnaRegionId = new mongoose.Types.ObjectId("655f4ad8ce7b06677ad5f70a");
    const regionExists = await db.collection("regions").findOne({ _id: patnaRegionId });
    if (!regionExists) {
      throw new Error("Patna region not found in DB!");
    }
    console.log("Verified Patna region exists in DB.");

    // 3. Define Cinema data using CN95 (repurposing existing Vista test ID)
    const cinemaId = "CN95";
    const cinemaData = {
      cinemaId: cinemaId,
      cinemaName: "CONNPLEX CINEMAS : BHIKHANA PAHARI, PATNA",
      displayName: "CONNPLEX CINEMAS : BHIKHANA PAHARI, PATNA",
      cinemaLicenseName: "Connplex Cinemas Bhikhana Pahari",
      cinemaLicenseNumber: "8237",
      websiteLicenseNumber: 8237,
      cinemaWebServiceUrl: "http://103.225.177.234/VistaWebService/clsbook.asmx",
      cinemaWebServiceUrl2: "http://103.225.177.234/VistaWebService/clsbook.asmx",
      regionId: patnaRegionId,
      cinemaBranchCode: "0001",
      deletedStatus: 0,
      isActive: true,
      lat: "25.612500",
      long: "85.155800",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Bhikhana Pahari, Patna, Bihar 800004",
      emailId: "bhikhana.patna@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Cinemas+Bhikhana+Pahari+Patna",
      mobileNumber: 9924577556,
      GSTNumber: "10AACCF6476A1Z6",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      updatedAt: new Date()
    };

    // 4. Register/Overwrite cinema in MongoDB
    let cinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    if (!cinema) {
      console.log(`Cinema ${cinemaId} not found in DB. Creating it...`);
      cinemaData.createdAt = new Date();
      const insertResult = await db.collection("cinemas").insertOne(cinemaData);
      console.log("Cinema created in DB with ID:", insertResult.insertedId);
    } else {
      console.log(`Cinema ${cinemaId} already exists in DB. Updating details...`);
      await db.collection("cinemas").updateOne({ _id: cinema._id }, { $set: cinemaData });
      console.log("Cinema details updated in DB.");
    }

    // 5. Update web service URL on Vista for CN95 via REST
    console.log(`Updating web service URL on Vista for ${cinemaId} via REST...`);
    const urlResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: cinemaId,
        strWebServiceURL: "http://103.225.177.234/VistaWebService/clsbook.asmx"
      }
    });
    console.log("Vista web service URL response:", JSON.stringify(urlResponse.data));

    // 6. Update license code on Vista for CN95 via REST
    console.log(`Updating license code on Vista for ${cinemaId} via REST...`);
    const licenseResponse = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: cinemaId,
        Licencecode: "8237"
      }
    });
    console.log("Vista license code response:", JSON.stringify(licenseResponse.data));

    // 7. Verify MongoDB Record
    const verifiedCinema = await db.collection("cinemas").findOne({ cinemaId: cinemaId });
    console.log("\nVerified Cinema document in DB:");
    console.log(JSON.stringify(verifiedCinema, null, 2));

    await mongoose.disconnect();
    console.log("DB disconnected.");
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
