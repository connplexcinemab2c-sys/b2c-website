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

function buildSoap(cmd, branchCode = "") {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objExecute xmlns="http://www.bigtree.co.in">
      <strCommand>${cmd}</strCommand>
      <strParam1>${branchCode}</strParam1>
      <strParam2></strParam2>
      <strParam3></strParam3>
      <strParam4></strParam4>
      <strParam5></strParam5>
      <strParam6></strParam6>
      <strParam7></strParam7>
      <strParam8></strParam8>
      <strParam9></strParam9>
      <strParam10></strParam10>
      <strParam11></strParam11>
      <strParam12></strParam12>
      <strParam13></strParam13>
      <strParam14></strParam14>
      <strParam15></strParam15>
    </objExecute>
  </soap:Body>
</soap:Envelope>`;
}

async function testSoap() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  console.log("Testing objExecute SOAP connectivity for 14 cinemas...\n");

  for (const item of targetCinemas) {
    const c = await db.collection("cinemas").findOne({ cinemaId: item.id });
    console.log(`================================================================`);
    console.log(`[${item.id}] ${item.name} (${c?.displayName || c?.cinemaName})`);
    console.log(`  BranchCode: "${c?.cinemaBranchCode}"`);
    console.log(`  URL1: ${c?.cinemaWebServiceUrl}`);
    console.log(`  URL2: ${c?.cinemaWebServiceUrl2}`);

    const urlsToTest = [
      { name: "URL1", url: c?.cinemaWebServiceUrl },
      { name: "URL2", url: c?.cinemaWebServiceUrl2 }
    ].filter(u => u.url && (u.name === "URL1" || u.url !== c?.cinemaWebServiceUrl));

    for (const u of urlsToTest) {
      // Test GET/WSDL first
      try {
        const wsdlRes = await axios.get(u.url, { timeout: 5000 });
        console.log(`  ${u.name} HTTP GET: [OK] status=${wsdlRes.status}`);
      } catch (err) {
        console.log(`  ${u.name} HTTP GET: [FAIL] (${err.code || err.message})`);
      }

      // Test SOAP objExecute blnGetCinemaList
      try {
        const start = Date.now();
        const soapRes = await axios.post(u.url, buildSoap("blnGetCinemaList", c?.cinemaBranchCode), {
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "SOAPAction": "http://www.bigtree.co.in/objExecute"
          },
          timeout: 7000
        });
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        const hasResult = soapRes.data?.includes("objExecuteResult");
        console.log(`  ${u.name} SOAP objExecute: [SUCCESS] in ${duration}s (hasResult: ${hasResult}, length: ${soapRes.data?.length})`);
      } catch (err) {
        console.log(`  ${u.name} SOAP objExecute: [FAIL] (${err.code || err.message}) ${err.response?.status || ""}`);
      }
    }
  }

  await mongoose.disconnect();
}

testSoap().catch(console.error);
