import axios from "axios";

async function main() {
  try {
    const url = "http://14.194.50.141/api.asmx";
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <AddCinema xmlns="http://microsoft.com/webservices/">
      <strCinemaId>CN43</strCinemaId>
      <strCinemaName>Connplex Cinemas: Khagaul</strCinemaName>
      <strWebServiceURL>http://202.142.85.158/VistaWebService/clsbook.asmx</strWebServiceURL>
      <strLicType>WWW</strLicType>
      <strLicCode>6451</strLicCode>
    </AddCinema>
  </soap:Body>
</soap:Envelope>`;

    console.log("Sending AddCinema SOAP request to Vista...");
    const response = await axios.post(url, soapEnvelope, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://microsoft.com/webservices/AddCinema"
      }
    });

    console.log("Response Status:", response.status);
    console.log("Response XML:", response.data);

  } catch (err) {
    console.error("SOAP request failed:", err.message);
    if (err.response) {
      console.log("Response data:", err.response.data);
    }
  }
}

main();
