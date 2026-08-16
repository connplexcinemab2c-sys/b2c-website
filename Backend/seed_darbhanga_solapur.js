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

    // 2. Find or create region "DARBHANGA"
    let darbhangaRegion = await db.collection("regions").findOne({ region: "DARBHANGA", deletedStatus: 0 });
    if (!darbhangaRegion) {
      console.log("Region DARBHANGA not found. Creating it...");
      const newRegion = {
        region: "DARBHANGA",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "26.1522",
        long: "85.8971",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection("regions").insertOne(newRegion);
      console.log("Created region DARBHANGA with ID:", result.insertedId);
      darbhangaRegion = { _id: result.insertedId, ...newRegion };
    } else {
      console.log("Region DARBHANGA already exists with ID:", darbhangaRegion._id);
    }

    // 3. Find or create region "SOLAPUR"
    let solapurRegion = await db.collection("regions").findOne({ region: "SOLAPUR", deletedStatus: 0 });
    if (!solapurRegion) {
      console.log("Region SOLAPUR not found. Creating it...");
      const newRegion = {
        region: "SOLAPUR",
        image: "",
        deletedStatus: 0,
        isActive: true,
        lat: "17.6703",
        long: "75.9011",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection("regions").insertOne(newRegion);
      console.log("Created region SOLAPUR with ID:", result.insertedId);
      solapurRegion = { _id: result.insertedId, ...newRegion };
    } else {
      console.log("Region SOLAPUR already exists with ID:", solapurRegion._id);
    }

    // 4. Update Vista Central Server Registry for CN91 (Darbhanga)
    console.log("Updating WebService URL on Vista Central for CN91...");
    const urlRes91 = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: "CN91",
        strWebServiceURL: "http://175.111.135.248/VistaWebService/clsbook.asmx"
      }
    });
    console.log("Vista URL response for CN91:", JSON.stringify(urlRes91.data));

    console.log("Updating license code on Vista Central for CN91...");
    const licRes91 = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: "CN91",
        Licencecode: "8311"
      }
    });
    console.log("Vista Licence response for CN91:", JSON.stringify(licRes91.data));

    // 5. Update Vista Central Server Registry for CN96 (Solapur)
    console.log("Updating WebService URL on Vista Central for CN96...");
    const urlRes96 = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: "CN96",
        strWebServiceURL: "http://117.242.9.157/VistaWebService/clsbook.asmx"
      }
    });
    console.log("Vista URL response for CN96:", JSON.stringify(urlRes96.data));

    console.log("Updating license code on Vista Central for CN96...");
    const licRes96 = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: "CN96",
        Licencecode: "6492"
      }
    });
    console.log("Vista Licence response for CN96:", JSON.stringify(licRes96.data));

    // 6. Define Cinema Data for Darbhanga (CN91)
    const darbhangaData = {
      cinemaId: "CN91",
      cinemaName: "CONNPLEX Luxuriance Cinemas: Darbhanga",
      displayName: "CONNPLEX Luxuriance Cinemas: Darbhanga",
      cinemaLicenseName: "Connplex Cinemas Darbhanga",
      cinemaLicenseNumber: "8311",
      websiteLicenseNumber: 8311,
      cinemaWebServiceUrl: "http://175.111.135.248/VistaWebService/clsbook.asmx",
      cinemaWebServiceUrl2: "http://175.111.135.248/VistaWebService/clsbook.asmx",
      regionId: darbhangaRegion._id,
      cinemaBranchCode: "1234",
      deletedStatus: 0,
      isActive: true,
      lat: "26.152200",
      long: "85.897100",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Darbhanga, Bihar 846004",
      emailId: "darbhanga@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Cinemas+Darbhanga",
      mobileNumber: 9924577556,
      GSTNumber: "10AACCF6476A1Z6",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      updatedAt: new Date()
    };

    // 7. Define Cinema Data for Solapur (CN96)
    const solapurData = {
      cinemaId: "CN96",
      cinemaName: "CONNPLEX CINEMAS : SOLAPUR, MAHARASHTRA",
      displayName: "CONNPLEX CINEMAS : SOLAPUR, MAHARASHTRA",
      cinemaLicenseName: "Connplex Cinemas Solapur",
      cinemaLicenseNumber: "6492",
      websiteLicenseNumber: 6492,
      cinemaWebServiceUrl: "http://117.242.9.157/VistaWebService/clsbook.asmx",
      cinemaWebServiceUrl2: "http://117.242.9.157/VistaWebService/clsbook.asmx",
      regionId: solapurRegion._id,
      cinemaBranchCode: "1234",
      deletedStatus: 0,
      isActive: true,
      lat: "17.670300",
      long: "75.901100",
      convenienceFees: 20,
      serviceCharge: 0,
      convenienceGST: 0,
      poster: "",
      cinemaAmenities: ["M Ticket", "F&B", "Parking Facility"],
      address: "Solapur, Maharashtra 413001",
      emailId: "solapur@theconnplex.com",
      googleUrl: "https://maps.google.com/?q=Connplex+Cinemas+Solapur",
      mobileNumber: 9924577556,
      GSTNumber: "27AACCF6476A1ZX",
      cinemaPromoUrl: "http://14.194.49.178:8081/PROMO/wsVistaPromo.asmx",
      cinemaIsOnline: "Y",
      cinemaSyncSequence: 1,
      cinemaWebServiceVersion: "5.22.11.22",
      cinemaVistaRemoteVersion: "Bigtree.VistaRemote.dll",
      updatedAt: new Date()
    };

    // 8. Write to MongoDB
    console.log("Registering Darbhanga (CN91) in MongoDB...");
    const existCN91 = await db.collection("cinemas").findOne({ cinemaId: "CN91" });
    if (existCN91) {
      await db.collection("cinemas").updateOne({ _id: existCN91._id }, { $set: darbhangaData });
    } else {
      darbhangaData.createdAt = new Date();
      await db.collection("cinemas").insertOne(darbhangaData);
    }
    console.log("Darbhanga registered successfully.");

    console.log("Registering Solapur (CN96) in MongoDB...");
    const existCN96 = await db.collection("cinemas").findOne({ cinemaId: "CN96" });
    if (existCN96) {
      await db.collection("cinemas").updateOne({ _id: existCN96._id }, { $set: solapurData });
    } else {
      solapurData.createdAt = new Date();
      await db.collection("cinemas").insertOne(solapurData);
    }
    console.log("Solapur registered successfully.");

    // 9. Verify Records
    const verify91 = await db.collection("cinemas").findOne({ cinemaId: "CN91" });
    const verify96 = await db.collection("cinemas").findOne({ cinemaId: "CN96" });

    console.log("\nVerified Darbhanga in DB:", JSON.stringify(verify91, null, 2));
    console.log("\nVerified Solapur in DB:", JSON.stringify(verify96, null, 2));

    await mongoose.disconnect();
    console.log("DB disconnected.");
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
