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

const sampleSoapEnvelope = (cid) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetFilmList xmlns="http://tempuri.org/">
      <strCinemaId>${cid}</strCinemaId>
      <strUserId></strUserId>
      <strUserPWD></strUserPWD>
    </GetFilmList>
  </soap:Body>
</soap:Envelope>`;

async function testConnectivity() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("Starting diagnostic test on all 14 cinemas...\n");

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    console.log(`================================================================`);
    console.log(`[${item.id}] ${item.name} (${c?.displayName || c?.cinemaName})`);
    console.log(`  URL1: ${c?.cinemaWebServiceUrl}`);
    console.log(`  URL2: ${c?.cinemaWebServiceUrl2}`);

    // Test 1: Direct HTTP GET / SOAP to URL1
    if (c?.cinemaWebServiceUrl) {
      try {
        const start = Date.now();
        const res = await axios.post(c.cinemaWebServiceUrl, sampleSoapEnvelope(item.id), {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://tempuri.org/GetFilmList"
          },
          timeout: 6000
        });
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        const hasResult = res.data?.includes("GetFilmListResult");
        console.log(`  Direct SOAP to URL1: [SUCCESS] (${duration}s, hasFilmList: ${hasResult})`);
      } catch (err) {
        console.log(`  Direct SOAP to URL1: [FAIL] (${err.code || err.message})`);
      }
    }

    // Test 1b: If URL2 exists and different, test URL2
    if (c?.cinemaWebServiceUrl2 && c.cinemaWebServiceUrl2 !== c.cinemaWebServiceUrl) {
      try {
        const start = Date.now();
        const res = await axios.post(c.cinemaWebServiceUrl2, sampleSoapEnvelope(item.id), {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://tempuri.org/GetFilmList"
          },
          timeout: 6000
        });
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        const hasResult = res.data?.includes("GetFilmListResult");
        console.log(`  Direct SOAP to URL2: [SUCCESS] (${duration}s, hasFilmList: ${hasResult})`);
      } catch (err) {
        console.log(`  Direct SOAP to URL2: [FAIL] (${err.code || err.message})`);
      }
    }

    // Test 2: Vista Central DatabaseSync
    try {
      const start = Date.now();
      const dbSyncRes = await axios.get(`${VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${item.id}`, { timeout: 12000 });
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`  Vista DatabaseSync: Status=${dbSyncRes.data?.Status} (${duration}s) - Msg: ${JSON.stringify(dbSyncRes.data?.data || "")}`);
    } catch (err) {
      console.log(`  Vista DatabaseSync: [FAIL] (${err.code || err.message})`);
    }

    // Test 3: Vista Central GetCinemawiseSession
    try {
      const sessRes = await axios.get(`${VISTA_URL}/api.asmx/GetCinemawiseSession?CinemaID=${item.id}`, { timeout: 10000 });
      const sessionList = sessRes.data?.data?.SessionList || [];
      const nowIso = new Date().toISOString();
      const futureSessions = sessionList.filter(s => {
        // parse date match
        const m = (s.Session_dtmRealShow || "").match(/\d+/);
        if (m) {
          const d = new Date(parseInt(m[0], 10));
          return d >= new Date();
        }
        return false;
      });
      const statuses = {};
      sessionList.forEach(s => {
        statuses[s.Session_strStatus] = (statuses[s.Session_strStatus] || 0) + 1;
      });
      console.log(`  Vista GetCinemawiseSession: Total=${sessionList.length}, Future=${futureSessions.length}, Statuses=${JSON.stringify(statuses)}`);
      if (futureSessions.length > 0) {
        const sample = futureSessions[0];
        console.log(`    Sample future session: id=${sample.Session_lngSessionId}, status=${sample.Session_strStatus}, seatsAvail=${sample.Session_intSeatsAvail}, salesChannel=${sample.Session_strSalesChannel}`);
      }
    } catch (err) {
      console.log(`  Vista GetCinemawiseSession: [FAIL] (${err.code || err.message})`);
    }
  }

  await mongoose.disconnect();
}

testConnectivity().catch(console.error);
