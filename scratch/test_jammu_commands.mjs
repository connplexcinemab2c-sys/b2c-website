async function testCommand(cmd, p1 = "", p2 = "", p3 = "", p4 = "") {
  const soap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objExecute xmlns="http://www.bigtree.co.in">
      <strCommand>${cmd}</strCommand>
      <strParam1>${p1}</strParam1>
      <strParam2>${p2}</strParam2>
      <strParam3>${p3}</strParam3>
      <strParam4>${p4}</strParam4>
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

  try {
    const res = await fetch("http://182.65.36.40/VistaWebService/clsbook.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://www.bigtree.co.in/objExecute"
      },
      body: soap
    });
    const text = await res.text();
    console.log(`\n=== Command: ${cmd} ===`);
    console.log(text.substring(0, 1000));
  } catch (e) {
    console.error(`Error for ${cmd}:`, e.message);
  }
}

async function run() {
  await testCommand("blnGetCinemaDetails");
  await testCommand("blnGetFilms");
  await testCommand("blnGetSessions");
  await testCommand("blnGetVersion");
}

run();
