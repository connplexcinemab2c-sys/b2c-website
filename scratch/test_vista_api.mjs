async function run() {
  try {
    console.log("Calling Vista GetAllSession via fetch...");
    const res = await fetch('http://14.194.50.141/api.asmx/GetAllSession?test=string', { signal: AbortSignal.timeout(15000) });
    console.log("Response status:", res.status);
    const data = await res.json();
    const sessionList = data?.data?.SessionList || [];
    console.log(`Total sessions returned: ${sessionList.length}`);

    // Filter for CN39
    const cn39Sessions = sessionList.filter(s => s.Cinema_strID === 'CN39');
    console.log(`CN39 sessions count: ${cn39Sessions.length}`);

    for (const s of cn39Sessions) {
      if (s.Film_strCode === 'CN39HO00001356' || s.Session_lngSessionId == 4911 || s.Session_lngSessionId == 4882) {
        console.log(s);
      }
    }
  } catch (err) {
    console.error("Vista call failed:", err.message);
  }
}

run();
