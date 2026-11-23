import axios from "axios";
import mongoose from "mongoose";

const targetCinemas = [
  { id: "CN40", name: "NAROL" },
  { id: "CN42", name: "ADANI" },
  { id: "CN47", name: "FARIDABAD" },
  { id: "CN27", name: "BHARUCH" },
  { id: "CN31", name: "JAJPUR" },
  { id: "CN46", name: "JAMMU" },
  { id: "CN43", name: "JAMSHEDPUR" },
  { id: "CN44", name: "JUNAGADH" },
  { id: "CN95", name: "BHIKHANA PAHARI" },
  { id: "CN92", name: "SHEIKHPURA" },
  { id: "CN96", name: "SOLAPUR" },
  { id: "CN25", name: "SRI SRI - TADEPALLIGUDEM" },
  { id: "CN12", name: "UMERKOTE" },
  { id: "CN45", name: "ICONIC HARNI" }
];

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_URL = "http://14.194.50.141";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function syncAll14ToVistaCentral() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("Updating URLs and triggering DatabaseSync for all 14 cinemas...\n");

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    const url = c?.cinemaWebServiceUrl;
    console.log(`================================================================`);
    console.log(`[${item.id}] ${item.name} (${c?.displayName || c?.cinemaName})`);
    console.log(`  Target URL: ${url}`);

    if (!url) {
      console.log(`  ERROR: No cinemaWebServiceUrl in DB!`);
      continue;
    }

    try {
      // 1. Update Vista Central URL
      const updateUrl = `${VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${item.id}&strWebServiceURL=${encodeURIComponent(url)}`;
      const updateRes = await axios.get(updateUrl, { timeout: 10000 });
      console.log(`  UpdateCinemawebservicesURL: Status=${updateRes.data?.Status}`);

      // Wait 1s between operations to prevent data.tmp lock
      await sleep(1500);

      // 2. Trigger DatabaseSync
      const start = Date.now();
      const syncRes = await axios.get(`${VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${item.id}`, { timeout: 35000 });
      const sec = ((Date.now() - start)/1000).toFixed(1);
      console.log(`  DatabaseSync: Status=${syncRes.data?.Status} (${sec}s) - ${JSON.stringify(syncRes.data?.data || syncRes.data?.msg || "")}`);

      // 3. Check GetCinemawiseSession
      await sleep(1000);
      const sessRes = await axios.get(`${VISTA_URL}/api.asmx/GetCinemawiseSession?CinemaID=${item.id}`, { timeout: 12000 });
      const list = sessRes.data?.data?.SessionList || [];
      const futureList = list.filter(s => {
        const m = (s.Session_dtmRealShow || "").match(/\d+/);
        return m ? new Date(parseInt(m[0], 10)) >= new Date() : false;
      });
      const statuses = {};
      list.forEach(s => { statuses[s.Session_strStatus] = (statuses[s.Session_strStatus] || 0) + 1; });
      console.log(`  GetCinemawiseSession: Total=${list.length}, Future=${futureList.length}, Statuses=${JSON.stringify(statuses)}`);

      // Update lastSync in Mongo
      await db.collection("cinemas").updateOne(
        { cinemaId: item.id },
        { $set: { lastSync: new Date(), lastSyncStatus: syncRes.data?.Status == 1 } }
      );
    } catch (err) {
      console.error(`  FAILED: ${err.code || err.message}`);
      await db.collection("cinemas").updateOne(
        { cinemaId: item.id },
        { $set: { lastSync: new Date(), lastSyncStatus: false } }
      );
    }

    // Wait 2s before next cinema to avoid Vista Central temporary file locking
    await sleep(2000);
  }

  await mongoose.disconnect();
}

syncAll14ToVistaCentral().catch(console.error);
