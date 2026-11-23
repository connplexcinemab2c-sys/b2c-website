import axios from "axios";
import mongoose from "mongoose";

const targetIds = [
  "CN40", "CN42", "CN47", "CN27", "CN31", "CN46", "CN43",
  "CN44", "CN95", "CN92", "CN96", "CN25", "CN12", "CN45"
];

const MONGO_URL = "mongodb://connplex:connple222023@13.234.166.228:27017/connplex?authSource=admin";
const VISTA_URL = "http://14.194.50.141";

async function checkVistaRegisteredUrls() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  const mongoCinemas = await db.collection("cinemas").find({ cinemaId: { $in: targetIds } }).toArray();
  const mongoMap = Object.fromEntries(mongoCinemas.map(c => [c.cinemaId, c]));

  console.log("Fetching GetAllDetails from Vista Central...");
  const res = await axios.get(`${VISTA_URL}/api.asmx/GetAllDetails?test=string`, { timeout: 60000 });
  const cinemaList = res.data?.data?.CinemaList || [];

  console.log(`\n=== COMPARISON FOR 14 CINEMAS ===`);
  for (const cid of targetIds) {
    const vc = cinemaList.find(c => c.Cinema_strID === cid);
    const mc = mongoMap[cid];
    console.log(`\n------------------------------------------------------------`);
    console.log(`Cinema: ${cid} | ${mc?.displayName || mc?.cinemaName}`);
    console.log(`  Vista Central Name: "${vc?.Cinema_strName}"`);
    console.log(`  Vista Central URL:  "${vc?.Cinema_strWebServiceURL}"`);
    console.log(`  Mongo URL1:         "${mc?.cinemaWebServiceUrl}"`);
    console.log(`  Mongo URL2:         "${mc?.cinemaWebServiceUrl2}"`);
    console.log(`  URLs Match?         ${vc?.Cinema_strWebServiceURL === mc?.cinemaWebServiceUrl}`);
  }

  await mongoose.disconnect();
}

checkVistaRegisteredUrls().catch(console.error);
