import FranchiseLead from "../../models/FranchiseLead.js";
import { decrypt, encrypt } from "../ccavenue/CcavenueUtils.js";
import qs from "querystring";
import { handleErrorResponse } from "../CommanService.js";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { emailUserPaymentConfirmation } from "../../utils/Mailers.js";

const statusMap = {
  Success: {
    paymentStatus: "success",
    step: "paymentSuccess",
    message: "Franchise payment successful",
  },

  Failure: {
    paymentStatus: "failed",
    step: "paymentFailed",
    message: "Franchise payment failed",
  },

  Aborted: {
    paymentStatus: "aborted",
    step: "paymentAborted",
    message: "Franchise payment aborted",
  },
};

export const sendLeadToZoho = async (lead) => {
  try {
    const feeStatus = lead?.paymentStatus == "success" ? "Success" : "Failure";

    const data = {
      xnQsjsdp: process.env.ZOHO_XNQSJSDP,
      zc_gad: "",
      xmIwtLD: process.env.ZOHO_XMIWTLD,
      actionType: "Q29udGFjdHM=",
      returnURL: null,
      "First Name": lead?.firstName,
      "Last Name": lead?.lastName,
      Email: lead?.email,
      Phone: lead?.mobileNumber,
      "Mailing City": lead?.city,
      "Mailing State": lead?.state,
      CONTACTCF9: feeStatus,
      CONTACTCF10: lead?.franchiseLocation,
    };

    console.log(data, "payload");

    await axios.post(
      "https://crm.zoho.in/crm/WebToContactForm",
      qs.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      },
    );

    console.log("Zoho CRM Lead Sent Successfully");
  } catch (err) {
    console.error("Zoho Send Failed:", err.message);
  }
};

export const franchisePaymentRequest = async (req, res) => {
  try {
    const { leadId } = req.body;

    const lead = await FranchiseLead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: "Franchise lead not found",
      });
    }

    // Generate transactionId only if not present
    if (!lead.transactionId) {
      lead.transactionId = `FR${Date.now()}${Math.floor(Math.random() * 1000)}`;
      lead.amount = Number(process.env.FRANCHISE_AMOUNT || 1);
      lead.paymentStatus = "initiated";
      lead.paymentLogs.push({
        step: "paymentInitiated",
        message: "Franchise payment initiated",
      });
      await lead.save();
    }

    const workingKey = process.env.CCAVENUE_FRANCHISE_WORKING_KEY;
    const accessCode = process.env.CCAVENUE_FRANCHISE_ACCESS_CODE;

    const data = {
      merchant_id: process.env.CCAVENUE_FRANCHISE_PAYMENT_MERCHANT_ID,
      order_id: lead.transactionId,
      currency: "INR",
      amount: lead.amount,
      redirect_url: process.env.CCAVENUE_FRANCHISE_SUCCESS_URL,
      cancel_url: process.env.CCAVENUE_FRANCHISE_CANCEL_URL,
      language: "EN",
      billing_name: `${lead.firstName || ""} ${lead.lastName || ""}`,
      billing_email: lead.email,
      billing_tel: lead.mobileNumber,
      merchant_param1: lead._id.toString(), // franchiseLeadId
    };

    const encRequest = encrypt(qs.stringify(data), workingKey);

    const form = `
      <form method="post" action="${process.env.CCAVENUE_FRANCHISE_PRODUCTION_URL}" name="redirect">
        <input type="hidden" name="encRequest" value="${encRequest}" />
        <input type="hidden" name="access_code" value="${accessCode}" />
      </form>
      <script>document.redirect.submit();</script>
    `;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(form);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Payment initiation failed");
  }
};

export const franchisePaymentResponse = async (req, res) => {
  try {
    const workingKey = process.env.CCAVENUE_FRANCHISE_WORKING_KEY;

    const ccavPOST = qs.parse(qs.stringify(req.body));
    const decrypted = decrypt(ccavPOST.encResp, workingKey);
    const paymentData = qs.parse(decrypted);

    const leadId = paymentData.merchant_param1;

    const lead = await FranchiseLead.findById(leadId);
    if (!lead) {
      return res.status(404).send("Franchise lead not found");
    }

    const status = paymentData.order_status;
    lead.paymentResponse = paymentData;

    const statusConfig = statusMap[status];

    if (statusConfig) {
      lead.paymentStatus = statusConfig.paymentStatus;

      lead.paymentLogs.push({
        step: statusConfig.step,
        message: statusConfig.message,
      });
    } else {
      lead.paymentStatus = "unknown";

      lead.paymentLogs.push({
        step: "paymentUnknown",
        message: `Unknown payment status: ${status}`,
      });
    }

    const newLead = await lead.save();

    if (
      !newLead.sentToZoho &&
      (newLead.paymentStatus === "success" ||
        newLead.paymentStatus === "failed")
    ) {
      await sendLeadToZoho(newLead);
      newLead.sentToZoho = true;
      await newLead.save();
    }

    const data = {
      firstName: lead?.firstName,
      lastName: lead?.lastName,
      email: lead?.email,
      amount: paymentData.amount,
      paymentMethod: paymentData.payment_mode,
      transactionId: paymentData.order_id,
      paymentDate: paymentData.trans_date,
    };

    if (newLead.paymentStatus === "success") {
      try {
        await emailUserPaymentConfirmation(data);
      } catch (e) {
        console.log("Email failed but flow continues");
      }
    }

    return res.redirect(
      `${process.env.FRONTEND_FRANCHISE_BASE_URL}#${lead.transactionId}`,
    );
  } catch (error) {
    console.error("Franchise payment response error:", error);
    return res.status(500).send("Payment response handling failed");
  }
};

export const getSingleFranchiseLead = async (req, res) => {
  try {
    const { transId } = req.params;

    const lead = await FranchiseLead.findOne(
      { transactionId: transId },
      {
        paymentResponse: 0,
        paymentLogs: 0,
        updatedAt: 0,
        __v: 0,
      },
    );

    if (!lead) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Transaction not found",
        data: null,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Franchise details fetched",
      data: lead,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const getFranchisePaymentStatus = async (req, res) => {
  try {
    const { transactionId, trackingId } = req.params;

    const lead = await FranchiseLead.findOne({ transactionId });
    if (!lead) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Transaction not found",
      });
    }

    const workingKey = process.env.CCAVENUE_FRANCHISE_WORKING_KEY;
    const accessCode = process.env.CCAVENUE_FRANCHISE_ACCESS_CODE;

    const requestPayload = {
      order_no: transactionId,
      ...(trackingId && { reference_no: trackingId }),
    };

    const encRequest = encrypt(JSON.stringify(requestPayload), workingKey);

    const { data } = await axios.post(
      process.env.CCAVENUE_ORDER_STATUS_URL,
      null,
      {
        params: {
          enc_request: encRequest,
          access_code: accessCode,
          request_type: "JSON",
          response_type: "JSON",
          command: "orderStatusTracker",
          version: "1.2",
        },
      },
    );

    const parsedResponse = typeof data === "string" ? qs.parse(data) : data;

    if (!parsedResponse?.enc_response) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid response from CCAvenue",
      });
    }

    const decryptedResponse = decrypt(parsedResponse.enc_response, workingKey);
    const orderStatusData = JSON.parse(decryptedResponse);

    return res.status(StatusCodes.OK).json(orderStatusData);
  } catch (error) {
    console.error("Order status tracker error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to fetch order status",
    });
  }
};
