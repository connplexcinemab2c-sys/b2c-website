import axios from "axios";
import { parseStringPromise } from "xml2js";
import Cinema from "../../models/Cinema.js";

// Helper to strip namespace prefix from XML tags
const stripPrefix = (name) => {
  const i = name.indexOf(":");
  return i < 0 ? name : name.substring(i + 1);
};

/**
 * Service to execute the SOAP blnAddSeatsEx call on a cinema's Vista web service.
 *
 * @param {Object} params
 * @param {string} params.cinemaId - The cinema ID (e.g. CN43)
 * @param {string} params.strTransId - Temporary transaction ID
 * @param {number|string} params.lngSessionId - Show session ID
 * @param {string} params.strOrderXml - Ticket order XML configuration
 * @param {boolean} [params.blnUserSelectedSeating=false] - Seating flag
 * @param {string} [params.strAdditionalParameters=""] - Optional extra parameters
 */
export const addSeatsExService = async ({
  cinemaId,
  strTransId,
  lngSessionId,
  strOrderXml,
  blnUserSelectedSeating = false,
  strAdditionalParameters = "",
}) => {
  // Find the cinema configuration to get the branch code and web service URL
  const cinema = await Cinema.findOne({ cinemaId });
  if (!cinema) {
    throw new Error(`Cinema with ID ${cinemaId} not found`);
  }

  const url = cinema.cinemaWebServiceUrl || cinema.cinemaWebServiceUrl2;
  if (!url) {
    throw new Error(`Cinema web service URL not configured for ${cinemaId}`);
  }

  const cinemaBranchCode = cinema.cinemaBranchCode || "";

  // Construct SOAP Envelope calling objExecute with blnAddSeatsEx
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objExecute xmlns="http://www.bigtree.co.in">
      <strCommand>blnAddSeatsEx</strCommand>
      <strParam1>${cinemaBranchCode}</strParam1>
      <strParam2>${strTransId}</strParam2>
      <strParam3>${lngSessionId}</strParam3>
      <strParam4><![CDATA[${strOrderXml}]]></strParam4>
      <strParam5>${blnUserSelectedSeating}</strParam5>
      <strParam6>${strAdditionalParameters}</strParam6>
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

  console.log(`Sending blnAddSeatsEx SOAP request to: ${url}`);
  const response = await axios.post(url, soapEnvelope, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://www.bigtree.co.in/objExecute",
    },
    timeout: 30000,
  });

  // Parse the SOAP response
  const parsed = await parseStringPromise(response.data, {
    tagNameProcessors: [stripPrefix],
  });

  const body = parsed.Envelope.Body[0];
  const objExecuteResponse = body.objExecuteResponse[0];
  const objExecuteResult = objExecuteResponse.objExecuteResult[0];

  const blnSuccess = objExecuteResult.blnSuccess[0] === "true";
  const intException = parseInt(objExecuteResult.intException[0] || "0", 10);
  const strException = objExecuteResult.strException[0] || "";

  if (!blnSuccess) {
    return {
      success: false,
      intException,
      strException,
    };
  }

  // Parse the serialized properties returned inside strData XML
  const strData = objExecuteResult.strData[0];
  const properties = {};

  if (strData) {
    try {
      const dataParsed = await parseStringPromise(strData, {
        tagNameProcessors: [stripPrefix],
      });
      const rootKey = Object.keys(dataParsed)[0];
      const root = dataParsed[rootKey];

      for (const key in root) {
        const val = root[key];
        if (Array.isArray(val)) {
          // If it's a string, store it directly, otherwise keep the structure
          if (typeof val[0] === "string") {
            properties[key] = val[0];
          } else {
            properties[key] = val[0];
          }
        } else {
          properties[key] = val;
        }
      }
    } catch (parseErr) {
      console.error("Error parsing strData XML response:", parseErr);
    }
  }

  return {
    success: true,
    intException,
    strException,
    properties,
  };
};

/**
 * Service to execute SOAP blnUpdateOrder call on a cinema's Vista web service.
 *
 * @param {Object} params
 * @param {string} params.cinemaId - The cinema ID (e.g. CN43)
 * @param {string} params.strTransId - Temporary transaction ID
 * @param {string} params.strOrderXml - Ticket order details to update
 */
export const updateOrderService = async ({ cinemaId, strTransId, strOrderXml }) => {
  const cinema = await Cinema.findOne({ cinemaId });
  if (!cinema) {
    throw new Error(`Cinema with ID ${cinemaId} not found`);
  }

  const url = cinema.cinemaWebServiceUrl || cinema.cinemaWebServiceUrl2;
  if (!url) {
    throw new Error(`Cinema web service URL not configured for ${cinemaId}`);
  }

  const cinemaBranchCode = cinema.cinemaBranchCode || "";

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objExecute xmlns="http://www.bigtree.co.in">
      <strCommand>blnUpdateOrder</strCommand>
      <strParam1>${cinemaBranchCode}</strParam1>
      <strParam2>${strTransId}</strParam2>
      <strParam3><![CDATA[${strOrderXml}]]></strParam3>
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

  console.log(`Sending blnUpdateOrder SOAP request to: ${url}`);
  const response = await axios.post(url, soapEnvelope, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://www.bigtree.co.in/objExecute",
    },
    timeout: 30000,
  });

  const parsed = await parseStringPromise(response.data, {
    tagNameProcessors: [stripPrefix],
  });

  const body = parsed.Envelope.Body[0];
  const objExecuteResponse = body.objExecuteResponse[0];
  const objExecuteResult = objExecuteResponse.objExecuteResult[0];

  const blnSuccess = objExecuteResult.blnSuccess[0] === "true";
  const intException = parseInt(objExecuteResult.intException[0] || "0", 10);
  const strException = objExecuteResult.strException[0] || "";

  return {
    success: blnSuccess,
    intException,
    strException,
  };
};

/**
 * Service to execute SOAP blnContinueTrans call on a cinema's Vista web service.
 *
 * @param {Object} params
 * @param {string} params.cinemaId - The cinema ID (e.g. CN43)
 * @param {string} params.strTransId - Temporary transaction ID
 */
export const continueTransService = async ({ cinemaId, strTransId }) => {
  const cinema = await Cinema.findOne({ cinemaId });
  if (!cinema) {
    throw new Error(`Cinema with ID ${cinemaId} not found`);
  }

  const url = cinema.cinemaWebServiceUrl || cinema.cinemaWebServiceUrl2;
  if (!url) {
    throw new Error(`Cinema web service URL not configured for ${cinemaId}`);
  }

  const cinemaBranchCode = cinema.cinemaBranchCode || "";

  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <objExecute xmlns="http://www.bigtree.co.in">
      <strCommand>blnContinueTrans</strCommand>
      <strParam1>${cinemaBranchCode}</strParam1>
      <strParam2>${strTransId}</strParam2>
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

  console.log(`Sending blnContinueTrans SOAP request to: ${url}`);
  const response = await axios.post(url, soapEnvelope, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "http://www.bigtree.co.in/objExecute",
    },
    timeout: 30000,
  });

  const parsed = await parseStringPromise(response.data, {
    tagNameProcessors: [stripPrefix],
  });

  const body = parsed.Envelope.Body[0];
  const objExecuteResponse = body.objExecuteResponse[0];
  const objExecuteResult = objExecuteResponse.objExecuteResult[0];

  const blnSuccess = objExecuteResult.blnSuccess[0] === "true";
  const intException = parseInt(objExecuteResult.intException[0] || "0", 10);
  const strException = objExecuteResult.strException[0] || "";

  return {
    success: blnSuccess,
    intException,
    strException,
  };
};
