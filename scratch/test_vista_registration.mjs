import axios from "axios";

const VISTA_CENTRAL_URL = "http://14.194.50.141/api.asmx";

async function testVista() {
  const cinemaId = "CN46";
  const cinemaName = "CONNPLEX SMART CINEMAS: JAMMU";
  const webServiceUrl = "http://182.65.36.40/VistaWebService/clsbook.asmx";
  const licenseCode = "6385";

  console.log("=== 1. Testing AddCinema SOAP ===");
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <AddCinema xmlns="http://microsoft.com/webservices/">
      <strCinemaId>${cinemaId}</strCinemaId>
      <strCinemaName>${cinemaName}</strCinemaName>
      <strWebServiceURL>${webServiceUrl}</strWebServiceURL>
      <strLicType>WWW</strLicType>
      <strLicCode>${licenseCode}</strLicCode>
    </AddCinema>
  </soap:Body>
</soap:Envelope>`;

  try {
    const res = await axios.post(VISTA_CENTRAL_URL, soapEnvelope, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://microsoft.com/webservices/AddCinema"
      },
      timeout: 10000
    });
    console.log("AddCinema SOAP Response Status:", res.status);
    console.log("AddCinema SOAP Response Data:", res.data);
  } catch (err) {
    console.error("AddCinema SOAP error:", err.message);
    if (err.response) {
      console.log("AddCinema response data:", err.response.data);
    }
  }

  console.log("\n=== 2. Testing UpdateCinemawebservicesURL ===");
  try {
    const res = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemawebservicesURL`, {
      params: {
        strCinemaId: cinemaId,
        strWebServiceURL: webServiceUrl
      },
      timeout: 10000
    });
    console.log("UpdateCinemawebservicesURL Response:", res.data);
  } catch (err) {
    console.error("UpdateCinemawebservicesURL error:", err.message);
  }

  console.log("\n=== 3. Testing UpdateCinemaLicence ===");
  try {
    const res = await axios.get(`${VISTA_CENTRAL_URL}/UpdateCinemaLicence`, {
      params: {
        strCinemaId: cinemaId,
        Licencecode: licenseCode
      },
      timeout: 10000
    });
    console.log("UpdateCinemaLicence Response:", res.data);
  } catch (err) {
    console.error("UpdateCinemaLicence error:", err.message);
  }

  console.log("\n=== 4. Checking GetAllcinemaDetails again ===");
  try {
    const res = await axios.get(`${VISTA_CENTRAL_URL}/GetAllcinemaDetails?`, { timeout: 10000 });
    const list = res.data?.data?.ItemCinemaDetails || [];
    const cn46 = list.find(c => c.Cinema_strID === cinemaId);
    console.log("CN46 in GetAllcinemaDetails:", cn46);
  } catch (err) {
    console.error("GetAllcinemaDetails error:", err.message);
  }

  console.log("\n=== 5. Testing DatabaseSync on Vista Central ===");
  try {
    const res = await axios.get(`${VISTA_CENTRAL_URL}/DatabaseSync`, {
      params: { strCinemaId: cinemaId },
      timeout: 15000
    });
    console.log("DatabaseSync Response:", res.data);
  } catch (err) {
    console.error("DatabaseSync error:", err.message);
  }
}

testVista();
