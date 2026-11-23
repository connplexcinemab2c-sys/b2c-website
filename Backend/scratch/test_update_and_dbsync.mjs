import axios from "axios";

const VISTA_URL = "http://14.194.50.141";

async function testUpdateAndDbSync(cid, webServiceUrl) {
  console.log(`\n=== Testing Update & DatabaseSync for ${cid} ===`);
  try {
    const updateUrl = `${VISTA_URL}/api.asmx/UpdateCinemawebservicesURL?strCinemaId=${cid}&strWebServiceURL=${encodeURIComponent(webServiceUrl)}`;
    console.log(`Updating Vista Central URL to: ${webServiceUrl}`);
    const updateRes = await axios.get(updateUrl, { timeout: 10000 });
    console.log(`Update URL response:`, updateRes.data);

    console.log(`Triggering DatabaseSync for ${cid}...`);
    const start = Date.now();
    const syncRes = await axios.get(`${VISTA_URL}/api.asmx/DatabaseSync?strCinemaId=${cid}`, { timeout: 25000 });
    const sec = ((Date.now() - start)/1000).toFixed(1);
    console.log(`DatabaseSync response (${sec}s):`, syncRes.data);

    console.log(`Checking GetCinemawiseSession for ${cid}...`);
    const sessRes = await axios.get(`${VISTA_URL}/api.asmx/GetCinemawiseSession?CinemaID=${cid}`, { timeout: 10000 });
    const sessions = sessRes.data?.data?.SessionList || [];
    console.log(`Sessions count: ${sessions.length}`);
    if (sessions.length > 0) {
      console.log(`Sample session: id=${sessions[0].Session_lngSessionId}, show=${sessions[0].Session_dtmRealShow}, status=${sessions[0].Session_strStatus}`);
    }
  } catch (err) {
    console.error(`Error for ${cid}:`, err.code || err.message, err.response?.data);
  }
}

async function main() {
  // Test CN31 (JAJPUR)
  await testUpdateAndDbSync("CN31", "http://103.30.118.31/VistaWebService/clsBook.asmx");
  // Test CN96 (SOLAPUR)
  await testUpdateAndDbSync("CN96", "http://103.71.65.58/VistaWebService/clsbook.asmx");
}

main().catch(console.error);
