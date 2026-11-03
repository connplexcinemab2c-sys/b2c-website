async function testJammuSoap() {
  const soap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objTest xmlns="http://www.bigtree.co.in" />
  </soap:Body>
</soap:Envelope>`;

  try {
    const res = await fetch("http://182.65.36.40/VistaWebService/clsbook.asmx", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://www.bigtree.co.in/objTest"
      },
      body: soap
    });
    console.log("Status:", res.status);
    console.log(await res.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
testJammuSoap();
