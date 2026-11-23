import mongoose from "mongoose";
import axios from "axios";

const targetLocations = [
  "NAROL",
  "ADANI",
  "FARIDABAD",
  "BHARUCH",
  "JAJPUR",
  "JAMMU",
  "JAMSHEDPUR",
  "JUNAGADH",
  "BHIKHANA PAHARI",
  "SHEIKHPURA",
  "SOLAPUR",
  "SRI SRI – TADEPALLIGUDEM",
  "TADEPALLIGUDEM",
  "UMERKOTE",
  "ICONIC HARNI",
  "HARNI"
];

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_URL = "http://14.194.50.141";

async function investigate() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("=== 1. CHECK VISTA CENTRAL CINEMAS ===");
  let vistaCinemas = [];
  try {
    const res = await axios.get(`${VISTA_URL}/api.asmx/GetAllDetails?test=string`, { timeout: 15000 });
    vistaCinemas = res.data?.data?.CinemaList || [];
    console.log(`Fetched ${vistaCinemas.length} cinemas from Vista Central GetAllDetails.`);
  } catch (err) {
    console.error("Error fetching Vista Central cinemas:", err.message);
  }

  console.log("\n=== 2. ALL CINEMAS IN MONGO ===");
  const allMongoCinemas = await db.collection("cinemas").find({}).toArray();
  console.log(`Total cinemas in Mongo: ${allMongoCinemas.length}`);

  console.log("\n=== 3. SEARCHING FOR TARGET LOCATIONS IN MONGO & VISTA ===");
  for (const loc of targetLocations) {
    const term = loc.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Search Vista
    const matchedVista = vistaCinemas.filter(vc => {
      const name = (vc.Cinema_strName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const id = (vc.Cinema_strID || "").toLowerCase();
      return name.includes(term) || term.includes(name);
    });

    // Search Mongo
    const matchedMongo = allMongoCinemas.filter(mc => {
      const name = (mc.displayName || mc.cinemaName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const branch = (mc.cinemaBranchCode || "").toLowerCase();
      const id = (mc.cinemaId || "").toLowerCase();
      return name.includes(term) || term.includes(name) || branch.includes(term);
    });

    console.log(`\n>>> Location Query: [${loc}] <<<`);
    console.log(`  Matched in Vista Central (${matchedVista.length}):`);
    matchedVista.forEach(v => {
      console.log(`    - Vista ID: ${v.Cinema_strID} | Name: "${v.Cinema_strName}" | URL: ${v.Cinema_strWebServiceURL}`);
    });
    console.log(`  Matched in Mongo (${matchedMongo.length}):`);
    matchedMongo.forEach(m => {
      console.log(`    - Mongo ID: ${m.cinemaId} | Name: "${m.displayName || m.cinemaName}" | Branch: "${m.cinemaBranchCode}" | URL1: "${m.cinemaWebServiceUrl}" | URL2: "${m.cinemaWebServiceUrl2}" | isActive: ${m.isActive} | deleted: ${m.deletedStatus} | lastSync: ${m.lastSync} | lastSyncStatus: ${m.lastSyncStatus}`);
    });
  }

  await mongoose.disconnect();
}

investigate().catch(console.error);
