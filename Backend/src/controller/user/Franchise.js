import dotenv from "dotenv";
dotenv.config();
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import FranchiseLead from "../../models/FranchiseLead.js";
import TwentyMinFranchiseLead from "../../models/TwentyMinuteFranchiseLead.js";
import axios from "axios";
import {
  emailAdminForFranchise,
  emailAdminForTwentyMinFranchise,
  emailApplyForFranchise,
  emailApplyForTwentyMinFranchise,
} from "../../utils/Mailers.js";
import {
  handleErrorResponse,
  smsTwillio,
} from "../../services/CommanService.js";

//#region applyForFranchise
export const applyForFranchise = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      city,
      state,
      jobTitle,
      // company,
      franchiseLocation,
    } = req.body;

    let existingLead = null;

    if (franchiseLocation) {
      const query = {
        email,
        franchiseLocation,
        paymentStatus: "success",
      };

      existingLead = await FranchiseLead.findOne(query).select("_id");
    }

    if (existingLead) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.FRANCHISE_LOCATION_EXIST,
        data: [],
      });
    }

    // const existingLead = await FranchiseLead.findOne({
    //   $or: [{ email }, { mobileNumber }],
    // });

    // if (existingLead) {
    //   let errorMessage = "";
    //   if (
    //     existingLead.email === email &&
    //     existingLead.mobileNumber === mobileNumber
    //   ) {
    //     errorMessage = ResponseMessage.EMAIL_MOBILE_EXIST_BOTH;
    //   } else {
    //     errorMessage =
    //       existingLead.email === email
    //         ? ResponseMessage.EMAIL_EXIST
    //         : ResponseMessage.MOBILE_EXIST;
    //   }
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     status: StatusCodes.BAD_REQUEST,
    //     message: errorMessage,
    //     data: [],
    //   });
    // }

    // const smsMessage = `Thank you for your interest in Connplex! We've received your franchise application and will review it shortly. Our team will get back to you soon. Stay tuned!`;
    // const from = process.env.TWILLIO_FROM_NUMBER;
    // if (email && mobileNumber) {
    //   await emailApplyForFranchise({ email });
    //   await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    // } else if (email) {
    //   await emailApplyForFranchise({ email });
    // } else if (mobileNumber) {
    //   await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    // }

    // Send email to admin with user details
    // await emailAdminForFranchise({
    //   firstName,
    //   lastName,
    //   email,
    //   mobileNumber,
    //   city,
    //   state,
    //   jobTitle,
    //   company,
    // });

    // const data = {
    //   xnQsjsdp:
    //     "795fcfc176e9aa021f8c7db4f72b35d5d13bfae6771b7892929a2dce241310d0",
    //   zc_gad: "",
    //   xmIwtLD:
    //     "bb707d0c129cc7b639debec15e0a6f85dcef398017a69a12ded8135f46907587b6b68779cbc66e7749b0be34a5bd037c",
    //   actionType: "TGVhZHM=",
    //   returnURL: "https://ticketing.theconnplex.com/",
    //   "First Name": firstName,
    //   "Last Name": lastName,
    //   Email: email,
    //   Phone: mobileNumber,
    //   City: city,
    //   State: state,
    //   LEADCF7: jobTitle,
    //   Company: company,
    //   te: "true",
    //   webform_analytics_submission: JSON.stringify({
    //     total_time: 15719,
    //     field_analytics: [
    //       { field_name: "LastName", correction: 1, total_time: 3705 },
    //       { field_name: "LastName", correction: 1, total_time: 3705 },
    //       { field_name: "email", correction: 0, total_time: 2014 },
    //       { field_name: "City", correction: 0, total_time: 944 },
    //       { field_name: "ZipCode", correction: 1, total_time: 4519 },
    //       { field_name: "Phone", correction: 0, total_time: 2223 },
    //     ],
    //   }),
    // };
    // const config = {
    //   method: "post",
    //   maxBodyLength: Infinity,
    //   url: "https://crm.zoho.in/crm/WebToLeadForm",
    //   headers: {
    //     "Content-Type": "application/x-www-form-urlencoded",
    //     Cookie:
    //       "webformsubmission_bdc0019ddf57ee95e3824f78e96943b14ceea0cef6bb98b77659c3d80c71499d=bdc0019ddf57ee95e3824f78e96943b14ceea0cef6bb98b77659c3d80c71499d; 941ef25d4b=c9a9cd14ada6c04d4d292092201ae661; JSESSIONID=67972D71A510E921292D457067B416D2; _zcsr_tmp=068036cb-d604-4ff0-91b0-e7bee1561f7a; crmcsr=068036cb-d604-4ff0-91b0-e7bee1561f7a",
    //   },
    //   data: data,
    // };

    // axios
    //   .request(config)
    //   .then(() => {})
    //   .catch((error) => {
    //     console.log(error);
    //   });

    const franchiseLeadData = await new FranchiseLead({
      firstName,
      lastName,
      email,
      mobileNumber,
      city,
      state,
      jobTitle,
      // company,
      franchiseLocation,
    }).save();

    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: ResponseMessage.YOUR_REQ_SENT,
      data: franchiseLeadData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region applyForTwentyMinFranchise
export const applyForTwentyMinFranchise = async (req, res) => {
  try {
    const { name, email, mobileNumber, city } = req.body;

    const existingLead = await TwentyMinFranchiseLead.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingLead) {
      let errorMessage = "";
      if (
        existingLead.email == email &&
        existingLead.mobileNumber == mobileNumber
      ) {
        errorMessage = ResponseMessage.EMAIL_MOBILE_EXIST_BOTH;
      } else {
        errorMessage =
          existingLead.email == email
            ? ResponseMessage.EMAIL_EXIST
            : ResponseMessage.MOBILE_EXIST;
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: errorMessage,
        data: [],
      });
    }
    const smsMessage = `Thank you for your interest in Connplex's 20-minute franchise opportunity! We've received your application and will review it shortly. Our team will get back to you soon. Stay tuned!
    `;
    const from = process.env.TWILLIO_FROM_NUMBER;
    if (email && mobileNumber) {
      await emailApplyForTwentyMinFranchise({ email });
      await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    } else if (email) {
      await emailApplyForTwentyMinFranchise({ email });
    } else if (mobileNumber) {
      await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    }

    // Send email to admin with user details
    await emailAdminForTwentyMinFranchise({
      name,
      email,
      mobileNumber,
      city,
    });

    const twentyMinFranchiseLeadData = await new TwentyMinFranchiseLead({
      name,
      email,
      mobileNumber,
      city,
    }).save();

    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      message: ResponseMessage.YOUR_REQ_SENT,
      data: twentyMinFranchiseLeadData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
