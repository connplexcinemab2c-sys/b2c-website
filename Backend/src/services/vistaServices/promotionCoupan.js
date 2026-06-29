import axios from "axios";
import moment from "moment";
import { parseStringPromise } from "xml2js";
import { parse } from "dotenv";
import Transaction from "../../models/Transaction.js";
import Item from "../../models/Items.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import Cinema from "../../models/Cinema.js";

// Constants
const VISTA_PROMO_EXECUTE = "http://14.194.50.140/PROMO/wsVistaPromo.asmx";

export const applyCoupanService = async (req, transId) => {
  try {
    const film_ho_code = req.filme_ho_code;
    const formatted_ho_code = film_ho_code.substring(
      film_ho_code.indexOf("HO")
    );
    // console.log(req);
    const cinemaId = req.cinema_id;
    const cinema = await Cinema.findById({ _id: cinemaId });
    if (!cinema) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.CINEMA_NOT_FOUND,
        data: [],
      });
    }
    const transaction = await Transaction.findOne({ initTransId: transId });

    let string;

    if (transaction.fAndBDetails && transaction.fAndBDetails.length === 0) {
      string = "|";
    } else {
      string = transaction.fAndBDetails
        .map((item) => {
          return `|${item.itemMasterItemCode}-${item.quantity}-${item.itemPrice}`;
        })
        .join("");
    }

    // CN95HO00000044

    // Format values
    const requestObj = {
      param1: cinema.cinemaBranchCode,
      param2: req.area_category_code + string,
      param3: moment(req.show_date_time).format("DD/MMM/YYYY HH:mm"),
      param4: req.number_of_tickets,
      param5: req.customer_name,
      param6: formatted_ho_code,
      param7: req.coupan_code[0],
      param8: "WEB|935|",
      param9: req.total_ticket_amount,
      param10: req.total_concession_amount,
      param11: req.total_inventory,
      param12: `W${Math.floor(100 + Math.random() * 900)}`,
      param13: Math.floor(100 + Math.random() * 900), // or dynamic user id
      param14: moment(req.post_date_time || new Date()).format(
        "DD/MMM/YYYY HH:mm"
      ),
      param15: req.type || "VOUCHER",
      param16: req.customer_number 
    };

    console.log(requestObj, "requestObj");

    // Create SOAP envelope
    const xml = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <blnExecute xmlns="http://www.bigtree.in/">
            <param1>${requestObj.param1}</param1>
            <param2>${requestObj.param2}</param2>
            <param3>${requestObj.param3}</param3>
            <param4>${requestObj.param4}</param4>
            <param5>${requestObj.param5}</param5>
            <param6>${requestObj.param6}</param6>
            <param7>${requestObj.param7}</param7>
            <param8>${requestObj.param8}</param8>
            <param9>${requestObj.param9}</param9>
            <param10>${requestObj.param10}</param10>
            <param11>${requestObj.param11}</param11>
            <param12>${requestObj.param12}</param12>
            <param13>${requestObj.param13}</param13>
            <param14>${requestObj.param14}</param14>
            <param15>${requestObj.param15}</param15>
            <param16>${requestObj.param16}</param16>
          </blnExecute>
        </soap:Body>
      </soap:Envelope>`;

    // const response = await axios.post(`${VISTA_PROMO_EXECUTE}`, xml, {
    const response = await axios.post(`${cinema.cinemaPromoUrl}`, xml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://www.bigtree.in/blnExecute",
      },
    });

    const parsed = await parseStringPromise(response.data);
    const response2 =
      parsed["soap:Envelope"]["soap:Body"][0]["blnExecuteResponse"][0];
    let finalResponse = response2["blnExecuteResult"][0];
// console.log({finalResponse});
    return finalResponse;
  } catch (err) {
    console.error("Error in applyCoupanService:", err.message);
    throw new Error("SOAP Request Failed");
  }
};

export const rollbackCoupanService = async ({
  lngSessionId,
  coupanCode,
  cinemaId,
}) => {
  try {
        const cinema = await Cinema.findById({ _id: cinemaId });
    if (!cinemaId) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.CINEMA_NOT_FOUND,
        data: [],
      });
    }
    const requestObj = {
      params1: lngSessionId,
      params2: coupanCode,
    };
    const rollbackXml = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <blnRollBack xmlns="http://www.bigtree.in/">
            <param1>${requestObj.params1}</param1>
            <param2>${requestObj.params2}</param2>
          </blnRollBack>
        </soap:Body>
      </soap:Envelope>`;

    // const response = await axios.post(`${VISTA_PROMO_EXECUTE}`, rollbackXml, {
    const response = await axios.post(`${cinema.cinemaPromoUrl}`, rollbackXml, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://www.bigtree.in/blnRollBack",
      },
    });

    const parsed = await parseStringPromise(response.data);
    const responseObj =
      parsed["soap:Envelope"]["soap:Body"][0]["blnRollBackResponse"][0];
    const finalResponse = responseObj["blnRollBackResult"][0];

    // console.log(finalResponse, "rollbackFinalResponse");
    return finalResponse;
  } catch (err) {
    console.error("Error in rollbackCoupanService:", err.message);
    throw new Error("SOAP Rollback Failed");
  }
};

export const removeCoupanJob = async () => {
  try {
    // const { lngSessionId, couponCode } = req.body;
    const allTransactions = await Transaction.find({
      "coupan.coupanCode": { $exists: true, $ne: null },
      paymentResponse: { $eq: null },
    });
    console.log("All transactions with coupons:", allTransactions.length);
    if (allTransactions.length === 0) {
      console.log("No transactions found with coupons to remove.");
      return;
    }
    await Promise.all(
      allTransactions.map(async (transaction) => {
        const { lngSessionId, coupanCode } = transaction.coupan;

        // console.log("Processing transaction:", transaction.initTransId);

        const response = await rollbackCoupanService({
          lngSessionId,
          coupanCode,
          cinemaId: transaction.cinemaId,
        });
        if (!response?.blnSuccess.includes("true")) {
          console.error(
            `Failed to rollback coupon for transaction ${transaction.initTransId}`
          );
          return;
        }
        // console.log(
        //   `Successfully rolled back coupon for transaction ${transaction.initTransId}`
        // );
        await Transaction.findOneAndUpdate(
          { initTransId: transaction.initTransId },
          {
            $unset: {
              "coupan.coupanCode": "",
              "coupan.lngSessionId": "",
              "coupan.discountOn": "",
              "coupan.discountValue": "",
            },
          }
        );
      })
    );
  } catch (err) {
    console.error("Error in removeCoupanJob:", err.message);
    throw new Error("Coupan Removal Job Failed");
  }
};
