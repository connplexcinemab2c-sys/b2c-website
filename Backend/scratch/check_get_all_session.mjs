import axios from "axios";

const targetCinemaIds = [
  "CN40", "CN42", "CN47", "CN27", "CN31", "CN46", "CN43",
  "CN44", "CN95", "CN92", "CN96", "CN25", "CN12", "CN45"
];

const VISTA_URL = "http://14.194.50.141";

async function checkGetAllSession() {
  console.log("Calling GetAllSession from Vista Central...");
  try {
    const start = Date.now();
    const res = await axios.get(`${VISTA_URL}/api.asmx/GetAllSession?test=string`, { timeout: 60000 });
    console.log(`GetAllSession completed in ${((Date.now() - start)/1000).toFixed(1)}s. Status: ${res.data?.Status}`);
    const sessionList = res.data?.data?.SessionList || [];
    console.log(`Total sessions in GetAllSession: ${sessionList.length}`);

    const cinemaCounts = {};
    for (const s of sessionList) {
      const cid = (s.Cinema_strID || "").trim().toUpperCase();
      cinemaCounts[cid] = (cinemaCounts[cid] || 0) + 1;
    }

    console.log("\nCounts in GetAllSession for our 14 cinemas:");
    for (const cid of targetCinemaIds) {
      console.log(`  ${cid}: ${cinemaCounts[cid] || 0} sessions in GetAllSession`);
    }

    console.log("\nCinemas present in GetAllSession:", Object.keys(cinemaCounts).sort().join(", "));
  } catch (err) {
    console.error("GetAllSession error:", err.message);
  }
}

checkGetAllSession().catch(console.error);
