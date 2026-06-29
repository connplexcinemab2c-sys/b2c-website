import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import Influencer from "../../models/Influencer.js";
import { emailAdminForInfluencer, emailApplyForInfluencer } from "../../utils/Mailers.js";
import { getClientIp, smsTwillio } from "../../services/CommanService.js";

export const addInfluencerDetails = async (req, res) => {
  try {
    let {
      name,
      email,
      mobileNumber,
      instagramUsername,
      youTube,
      city,
    } = req.body;

    const addInfluencer = await new Influencer({
      name,
      email,
      mobileNumber,
      instagramUsername,
      youTube,
      city,
    }).save();
    if (addInfluencer) {

      const smsMessage = `Thank you for your interest to become a brand influencer in Connplex! We've received your application to become a brand influencer.will review it shortly. Our team will get back to you soon. Stay tuned!`;
      const from = process.env.FROM_BRAND_INFLUENCER;
      const smsLogCtx = {
        smsType: "INFLUENCER_APPLICATION",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"],
      };
      if (email && mobileNumber) {
        await emailApplyForInfluencer({ email });
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      } else if (email) {
        await emailApplyForInfluencer({ email });
      } else if (mobileNumber) {
        await smsTwillio(smsMessage, from, `+91${mobileNumber}`, smsLogCtx);
      }

        // Send email to admin with influencer details
        await emailAdminForInfluencer({
          name,
          email,
          mobileNumber,
          instagramUsername,
          youTube,
          city,
        });

      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.INFLUENCER_DETAILS_ADDED,
        data: addInfluencer,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const getInfluencerList = async (req, res) => {
  try {
    const InfluencerList = await Influencer.find({});
    if (InfluencerList?.length) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.INFLUENCER_DETAILS_FETCHED,
        data: InfluencerList,
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.INFLUENCER_DETAILS_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
