import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { User } from "../../models/User.js";
import {
  createJwtToken,
  generateOtp,
  getClientIp,
  handleErrorResponse,
  sanitizeSearchRegex,
  smsSend2Digital,
  smsTwillio,
} from "../../services/CommanService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";

import moment from "moment";
import Banner from "../../models/Banner.js";
import ContactUs from "../../models/ContactUs.js";
import Faqs from "../../models/FAQ.js";
import { MovieSlider } from "../../models/MovieSliders.js";
import Movie from "../../models/Movies.js";
import { Notification } from "../../models/Notification.js";
import { Region } from "../../models/Region.js";
import ReportIssue from "../../models/ReportIssue.js";
import Subscriber from "../../models/Subscriber.js";
import TodayShow from "../../models/TodayShow.js";

import Advertisement from "../../models/Advertisement.js";
import Blogs from "../../models/Blogs.js";
import Career from "../../models/Career.js";
import RatingAndReview from "../../models/RatingAndReview.js";
import { SocialUser } from "../../models/SocialUser.js";
import TicketCancel from "../../models/TicketCancel.js";
import Transaction from "../../models/Transaction.js";
import UserSetting from "../../models/UserSetting.js";
import MovieInterested from "../../models/movieInterested.js";
import MovieLikes from "../../models/movieLikes.js";
import {
  ReportAndIssueMail,
  emailAdminForContactUs,
  emailContactUs,
  emailNewsletter,
  emailVerification,
} from "../../utils/Mailers.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import Rewards from "../../models/Rewards.js";
import { LoginActivity } from "../../models/LoginActivity.js";
import os from "os";
import cache from "../../config/NodeCache.config.js";
import cacheKeys from "../../utils/cacheKeys.js";
import cacheHelper from "../../utils/cacheHelper.js";
import Cinema from "../../models/Cinema.js";
import mongoose from "mongoose";
import { deleteS3File } from "../../middleware/ImageUpload.js";
//#region getUser
export const getUser = async (req, res) => {
  try {
    const getUser = await User.findOne({ _id: req.user });
    let rewardsData = await Rewards.find({ userId: req.user , type:{$ne:"redeemed"}, deletedStatus: 0 });
    // let totalRewards = 0;
    const now = new Date();
    const totalRewards = rewardsData
          .filter((r) => !r.expiryDate || new Date(r.expiryDate) > now)
          .reduce((sum, r) => sum + (r.coins - r.redeemCoins), 0);
   

    if (getUser) {
      // const profileImagePath = "./public/uploads/" + getUser.profile;
      // try {
      //   await fs.promises.access(profileImagePath, fs.constants.F_OK);
      // } catch (err) {
      //   getUser.profile = ""; // Reset profile image if not found
      // }

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_FETCHED,
        data: {
          ...getUser._doc,
          // rewards: rewardsData,
          totalRewards: totalRewards,
        },
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.USER_NOT_FOUND,
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
//#endregion

//#region signup new
export const signup = async (req, res) => {
  try {
    let { email, mobileNumber, login_type, fcmToken } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    const otp = generateOtp();
    let exist;
    if (mobileNumber) {
      exist = await User.findOne({
        mobileNumber,
        deletedStatus: 0,
      });
    } else {
      exist = await User.findOne({
        email,
        deletedStatus: 0,
      });
    }
    let otpEmailFlag = email ? true : false;
    let otpMobileFlag = mobileNumber ? true : false;
    let user;
    let message;
    if (exist) {
      user = await User.findByIdAndUpdate(
        { _id: exist._id },
        {
          $set: {
            otp,
            otpExpiryDate: moment.utc(),
            ...(fcmToken && fcmToken.trim()
              ? { fcmToken: fcmToken.trim() }
              : {}),
          },
        },
        { new: true }
      );
      message = `Your OTP is ${otp} for Connplex Sign Up/Login. VCS industries limited`;
    } else {
      const deviceType = req.headers["x-device-type"] || "";

      user = await new User({
        mobileNumber,
        email,
        otp,
        login_type,
        source: "locale",
        otpExpiryDate: moment.utc(),
        ...(deviceType ? { registeredFrom: deviceType } : {}),
      }).save();
      message = `Your OTP is ${otp} for Connplex Sign Up/Login. VCS industries limited`;
    }
    if (user) {
      let msg =
        otpEmailFlag == true
          ? ResponseMessage.VERIFICATION_CODE_SENT_EMAIL
          : ResponseMessage.VERIFICATION_CODE_SENT_MOBILE;
      let data = {
        email,
        otp,
      };
      if (email) {
        emailVerification(data);
      } else {
        // let from = process.env.TWILLIO_FROM_NUMBER;
        // await smsTwillio(message, from, `+91${mobileNumber}`);
        await smsSend2Digital(
          message,
          `+91${mobileNumber}`,
          process.env.SEND2DIGITAL_OTP_CONTENTID,
          {
            smsType: "OTP_LOGIN",
            userId: user._id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"],
          }
        );
      }
      let networkInterfaces = os.networkInterfaces();
      let ipAddress = null;

      for (let interfaceName in networkInterfaces) {
        let iface = networkInterfaces[interfaceName];

        for (let i = 0; i < iface.length; i++) {
          let { family, address, internal } = iface[i];

          if (family === "IPv4" && !internal) {
            ipAddress = address;
            break;
          }
        }
      }
      await LoginActivity.create({
        userId: user._id,
        loginStatus: "Success",
        ipAddress: ipAddress,
      });
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: msg,
        data: { _id: user._id },
      });
    } else {
      let networkInterfaces = os.networkInterfaces();
      let ipAddress = null;

      for (let interfaceName in networkInterfaces) {
        let iface = networkInterfaces[interfaceName];

        for (let i = 0; i < iface.length; i++) {
          let { family, address, internal } = iface[i];

          if (family === "IPv4" && !internal) {
            ipAddress = address;
            break;
          }
        }
      }
      await LoginActivity.create({
        userId: user !== null && user !== undefined ? user._id : null,
        loginStatus: "Fail",
        ipAddress: ipAddress,
      });
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.FAILED_REGISTER_USER,
        data: [],
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
//#endregion

//#region otpVerification
export const otpVerification = async (req, res) => {
  try {
    let { otp, id, email, mobileNumber, flag, type } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    let user = await User.findById({ _id: id });
    if (user.otp != otp) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.INVALID_OTP,
        daa: [],
      });
    }
    const diff = moment(user.otpExpiryDate)
      .add(30, "seconds")
      .format("h:mm:ss");
    const currentTime = moment().format("h:mm:ss");
    if (currentTime <= diff) {
      if (flag == 1 && id && email) {
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { email, otp: null } },
          { new: true }
        );
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.VERIFICATION_COMPLETED,
          data: [],
        });
      } else if (flag == 1 && id && mobileNumber) {
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { mobileNumber, otp: null } },
          { new: true }
        );
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.VERIFICATION_COMPLETED,
          data: [],
        });
      } else {
        let userDetails;
        if (user.isAccountVerified === 0) {
          userDetails = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { otp: null, isAccountVerified: 1 } },
            { new: true }
          );
        } else {
          userDetails = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { otp: null } },
            { new: true }
          );
        }
        let payload = { userId: id };
        let token = createJwtToken(payload, type);
        if (userDetails) {
          // let message = `Welcome to Connplex Smart Theatre! We're thrilled to have you. Explore our offerings and enjoy your journey with us.`;
          // let from = process.env.TWILLIO_FROM_NUMBER;
          // await smsTwillio(message, from, `+91${userDetails.mobileNumber}`);

          const membershipPlanDetails = await SubscriberMembership.findOne({
            userId: userDetails._id,
            isActive: true,
          }).populate("subscriptionId", "title");

          const resUser = await User.findById(
            { _id: id },
            {
              email: true,
              name: true,
              mobileNumber: true,
              image: true,
              birthDate: true,
            }
          );

          res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.VERIFICATION_COMPLETED,
            data: {
              ...resUser._doc,
              token,
              membershipTitle: membershipPlanDetails?.subscriptionId?.title,
              subscriptionEndDate: membershipPlanDetails?.subscriptionEndDate,
            },
          });
        }
      }
    } else {
      await User.findOneAndUpdate(
        { _id: id },
        { $set: { otp: null }, otpExpiryDate: moment.utc() }
      );
      return res.status(410).json({
        status: StatusCodes.GONE, // it used for OTP is permanently gone and cannot be used for further verification.
        message: ResponseMessage.OTP_EXPIRED,
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }
};
//#endregion

//#region editProfile
export const editUserProfile = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      address,
      birthDate,
      gender,
      maritalStatus,
      city,
    } = req.body;

    const user = await User.findById({ _id: req.user });

    if (req.files.profile) {
      // fs.unlink("./public/uploads/" + user.profile, () => {});
      await deleteS3File(user.profile);
    } else if (req.body.removeProfileUrl) {
      // fs.unlink("./public/uploads/" + req.body.removeProfileUrl, () => {});
      await deleteS3File(req.body.removeProfileUrl);
      user.profile = "";
      await user.save();
    } else {
      req.profileUrl = user.profile;
    }

    let update = await User.findOneAndUpdate(
      { _id: req.user },
      {
        $set: {
          firstName,
          lastName,
          [req.profileUrl == "" ? "" : "profile"]: req.profileUrl,
          address,
          birthDate,
          gender,
          maritalStatus,
          city,
          otpExpiryDate: Date.now(),
        },
      },
      { new: true }
    );

    if (update) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MY_ACCOUNT_PROFILE_UPDATED,
        data: update,
      });
    }

    return res.status(400).json({
      status: StatusCodes.BAD_REQUEST,
      message: ResponseMessage.BAD_REQUEST,
      data: [],
    });

    // const profilePath = "./public/uploads/" + update.profile;
    // fs.access(profilePath, fs.constants.F_OK, (err) => {
    //   if (err) {
    //     update.profile = "";
    //     if (update) {
    //       return res.status(200).json({
    //         status: StatusCodes.OK,
    //         message: ResponseMessage.MY_ACCOUNT_PROFILE_UPDATED,
    //         data: update,
    //       });
    //     } else {
    //       return res.status(400).json({
    //         status: StatusCodes.BAD_REQUEST,
    //         message: ResponseMessage.BAD_REQUEST,
    //         data: [],
    //       });
    //     }
    //   }
    // });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region contactUs
export const contactUs = async (req, res) => {
  try {
    let { firstName, lastName, email, mobileNumber, message } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    const existingContact = await ContactUs.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    // if (existingContact) {
    //   let errorMessage = "";
    //   if (
    //     existingContact.email == email &&
    //     existingContact.mobileNumber == mobileNumber
    //   ) {
    //     errorMessage = ResponseMessage.EMAIL_MOBILE_EXIST_BOTH;
    //   } else {
    //     errorMessage =
    //       existingContact.email == email
    //         ? ResponseMessage.EMAIL_EXIST
    //         : ResponseMessage.MOBILE_EXIST;
    //   }
    //   return res.status(400).json({
    //     status: StatusCodes.BAD_REQUEST,
    //     message: errorMessage,
    //     data: [],
    //   });
    // }
    const smsMessage = `Thank you for reaching out to us! We sincerely appreciate the time you took to contact us and for your interest in Connplex. We have received your message and are currently reviewing it. Our team will get back to you as soon as possible`;
    const from = process.env.TWILLIO_FROM_NUMBER;
    if (email && mobileNumber) {
      await emailContactUs({ email });
      await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    } else if (email) {
      await emailContactUs({ email });
    } else if (mobileNumber) {
      await smsTwillio(smsMessage, from, `+91${mobileNumber}`);
    }

    // Send email to admin with user details
    await emailAdminForContactUs({
      firstName,
      lastName,
      email,
      mobileNumber,
      message,
    });

    const contactUsData = await new ContactUs({
      firstName,
      lastName,
      email,
      mobileNumber,
      message,
    }).save();

    return res.status(201).json({
      status: StatusCodes.CREATED,
      message: ResponseMessage.YOUR_REQ_SENT,
      data: contactUsData,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region getRegionUserSide
export const getRegion = async (req, res) => {
  try {
    const regions = await Region.find(
      {
        deletedStatus: 0,
        isActive: true,
      },
      { region: true, image: true }
    ).sort({ region: "asc" });

    if (regions.length > 0) {
      cacheHelper.setCache(cacheKeys.regionData, regions);

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REGION_FETCHED,
        data: regions,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.REGION_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region updateMobileNumber
export const updateMobileNumber = async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    const user = await User.findById({ _id: req.user });
    if (user.mobileNumber == mobileNumber) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.MOBILE_NUMBER_ALREADY_VERIFIED,
        data: [],
      });
    } else {
      const alreadyMobileNum = await User.findOne({
        mobileNumber,
        deletedStatus: 0, //mobile number update
      });
      if (alreadyMobileNum) {
        return res.status(409).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.THIS_NUMBER_USE_ON_ANOTHER_ACCOUNT,
          data: [],
        });
      } else {
        const otp = generateOtp();
        if (mobileNumber) {
          let message = `The Connplex Smart Theatre Your OTP is : ${otp} by VCS Industries. VCS industries limited`;
          // let from = process.env.TWILLIO_FROM_NUMBER;
          // await smsTwillio(message, from, `+91${mobileNumber}`);

          await smsSend2Digital(
            message,
            `+91${mobileNumber}`,
            process.env.SEND2DIGITAL_UPDATE_EMAIL_MOBILENO_CONTENTID
          );
          await User.findByIdAndUpdate(
            { _id: req.user },
            { $set: { otp, otpExpiryDate: Date.now() } }
          );
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.VERIFICATION_CODE_SENT_MOBILE,
            data: mobileNumber,
            flag: 1,
          });
        } else {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.FAILED_VERIFICATION,
            data: [],
          });
        }
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region updateEmail
export const updateEmail = async (req, res) => {
  try {
    let { email } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    const user = await User.findById({ _id: req.user });
    if (user.email === email) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.EMAIL_ALREADY_VERIFIED,
        data: [],
      });
    } else {
      const alreadyEmail = await User.findOne({
        email: email, //mobile number update
      });
      if (alreadyEmail) {
        return res.status(409).json({
          status: StatusCodes.CONFLICT,
          message: ResponseMessage.THIS_EMAIL_USE_ON_ANOTHER_ACCOUNT,
          data: [],
        });
      } else {
        const otp = generateOtp();
        if (email) {
          const data = {
            email: email,
            otp: otp,
          };
          await emailVerification(data);
          await User.findByIdAndUpdate(
            { _id: req.user },
            { $set: { otp, otpExpiryDate: Date.now() } }
          );

          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.VERIFICATION_CODE_SENT_EMAIL,
            data: email,
            flag: 1,
          });
        } else {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.FAILED_VERIFICATION,
            data: [],
          });
        }
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region remove account
export const removeUserAccount = async (req, res) => {
  try {
    let { id } = req.body;
    const updateUserAccount = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
          isActive: false,
        },
      },
      { new: true }
    );
    if (updateUserAccount) {
      // If there is an associated profile picture, delete it
      if (updateUserAccount.profile) {
        // fs.unlink("./profile/uploads/" + updateUserAccount.profile, () => {});
        await deleteS3File(updateUserAccount.profile);
        updateUserAccount.profile = "";
      }

      // Perform updates in other collections
      if (updateUserAccount._id) {
        const userAccountId = updateUserAccount._id.toString();
        const promises = [];
        promises.push(
          await RatingAndReview.updateMany(
            { userId: userAccountId },
            { $set: { isActive: false, isDeleted: true } }
          ).exec()
        );

        promises.push(
          await MovieLikes.updateMany(
            { userId: userAccountId },
            { $set: { isLiked: false } }
          ).exec()
        );

        promises.push(
          await MovieInterested.updateMany(
            { userId: userAccountId },
            { $set: { isInterested: false, isDeleted: true } }
          ).exec()
        );

        promises.push(
          await Notification.updateMany(
            { userId: userAccountId },
            { $set: { isDeleted: true } }
          ).exec()
        );

        promises.push(
          await UserSetting.updateMany(
            { userId: userAccountId },
            { $set: { isDeleted: true } }
          ).exec()
        );

        promises.push(
          await Transaction.updateMany(
            { userId: userAccountId },
            { $set: { deletedStatus: 1 } }
          ).exec()
        );

        promises.push(
          await TicketCancel.updateMany(
            { userId: userAccountId },
            { $set: { deletedStatus: 1 } }
          ).exec()
        );

        await Promise.all(promises);
      }

      await updateUserAccount.save();

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_ACCOUNT_DELETED,
        data: updateUserAccount,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#endregion

//#region UserSlider
export const userSlider = async (req, res) => {
  try {
    const { regionId, sliderType } = req.params;

    // 🧠 Step 1: Build base query
    const Query = {
      deletedStatus: 0,
      status: true,
      sliderType,
    };

    // 🧠 Step 2: Handle regionId conditions
    if (regionId && regionId !== "undefined") {
      // Convert to ObjectId safely
      const regionObjectId = new mongoose.Types.ObjectId(regionId);
      Query.$or = [
        { type: "City", regionId: { $in: [regionObjectId] } },
        { type: "all" }, // global sliders
      ];
    } else {
      // Fetch all global sliders when region not provided
      Query.type = "all";
    }

    // 🧠 Step 3: Fetch sliders
    const sliderDetails = await MovieSlider.find(Query, {
      title: 1,
      image: 1,
      regionId: 1,
      type: 1,
      sliderType: 1,
    })
      .populate("regionId", "name") // Only populate needed fields
      .sort({ createdAt: -1 });

    // 🧠 Step 4: Handle no records
    if (!sliderDetails || sliderDetails.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SLIDER_DETAILS_NOT_FOUND,
        data: [],
      });
    }

    // 🧠 Step 5: Validate image existence
    // await Promise.all(
    //   sliderDetails.map(async (slider) => {
    //     const imagePath = `./public/uploads/${slider.image}`;
    //     try {
    //       await fs.promises.access(imagePath, fs.constants.F_OK);
    //     } catch {
    //       slider.image = "";
    //     }
    //   })
    // );

    // 🧠 Step 6: Cache result
    await cacheHelper.setCache(
      cacheKeys.sliderData(regionId, sliderType),
      sliderDetails
    );

    // 🧠 Step 7: Return response
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.SLIDER_DETAILS,
      data: sliderDetails,
    });
  } catch (error) {
    console.error("Error fetching slider:", error);
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region UserBanner
export const userBanner = async (req, res) => {
  try {
    const bannerDetails = await Banner.find(
      {
        deletedStatus: 0,
        status: true,
        bannerType: req.query.bannerType,
      },
      {
        banner: true,
        bannerShowSection: true,
        bannerLink: true,
        bannerType: true,
      }
    ).sort({ createdAt: -1 });

    if (!bannerDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      // await Promise.all(
      //   bannerDetails.map(async (banner) => {
      //     const imagePath = "./public/uploads/" + banner.banner;
      //     try {
      //       await fs.promises.access(imagePath, fs.constants.F_OK);
      //     } catch (err) {
      //       // If image doesn't exist, set banner to an empty string
      //       banner.banner = "";
      //     }
      //   })
      // );

      const bannerCacheKey = cacheKeys.bannerData(
        req.query.bannerType.replace(/\s+/g, "").toLowerCase()
      );
      cacheHelper.setCache(bannerCacheKey, bannerDetails);

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BANNER_DETAILS,
        data: bannerDetails,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

export const updateUserBannerClickCount = async (req, res) => {
  try {
    const { bannerId } = req.body;
    if (!bannerId || !mongoose.isValidObjectId(bannerId)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Invalid banner ID. Please provide a valid banner ID.",
        data: [],
      });
    }

    const findBanner = await Banner.findOne({
      _id: bannerId,
    });

    if (!findBanner) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.BANNER_NOT_FOUND,
        data: [],
      });
    }

    // // Increment the click count
    const updatedBanner = await Banner.findByIdAndUpdate(
      { _id: bannerId },
      { $inc: { userClickCount: 1 } },
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.FAILED_TO_UPDATE_BANNER_CLICK,
        data: [],
      });
    }

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BANNER_CLICKED,
      data: [],
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region resendOtp
export const resendOtp = async (req, res) => {
  try {
    let { id, email, mobileNumber } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    let messageResponse;
    let user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.ACCOUNT_NOT_EXIST,
        data: [],
      });
    } else {
      let newOtp = generateOtp();
      user.otp = newOtp;
      user.otpExpiryDate = Date.now();
      let result = await user.save();
      if (!result) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.SOMETHING_WENT_WRONG,
          data: [],
        });
      } else {
        if (mobileNumber) {
          let message = `The Connplex Smart Theatre Your OTP is : ${newOtp} by VCS Industries. VCS industries limited`;
          // let from = process.env.TWILLIO_FROM_NUMBER;
          // await smsTwillio(message, from, `+91${mobileNumber}`);

          await smsSend2Digital(
            message,
            `+91${mobileNumber}`,
            process.env.SEND2DIGITAL_UPDATE_EMAIL_MOBILENO_CONTENTID
          );
        }
        if (email) {
          const data = {
            email: email,
            otp: newOtp,
          };
          await emailVerification(data);
        }
        if (email && mobileNumber) {
          messageResponse =
            ResponseMessage.VERIFICATION_CODE_SENT_MOBILE_AND_EMAIL;
        } else if (email) {
          messageResponse = ResponseMessage.VERIFICATION_CODE_SENT_EMAIL;
        } else if (mobileNumber) {
          messageResponse = ResponseMessage.VERIFICATION_CODE_SENT_MOBILE;
        }
        let responseData = Object.assign({}, result._doc);
        delete responseData.otp;
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: messageResponse,
          data: responseData,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region GetFaqs
export const getFaqListUser = async (req, res) => {
  try {
    const faqs = await Faqs.find({ deletedStatus: 0 });
    if (faqs) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FAQ_LIST,
        data: faqs,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region subscribe
export const subscribe = async (req, res) => {
  try {
    let { email } = req.body;
    if (email) {
      email = email.toLowerCase();
    }
    let existSubscriber = await Subscriber.findOne({
      email: email,
      deletedStatus: 0,
    });

    if (existSubscriber) {
      return res.status(409).json({
        status: StatusCodes.CONFLICT,
        message: ResponseMessage.ALREADY_SUBSCRIBED,
        data: [],
      });
    } else {
      let data = {
        email: email,
      };
      await emailNewsletter(data);
      const newSubscriber = await new Subscriber({ email }).save();
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.SUBSCRIBED,
        data: newSubscriber,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

// //#region Get all search
// export const getAllSearch = async (req, res) => {
//   const { type, text, regionId } = req.query;
//   let splitData = text.split(" ");
//   let regex = new RegExp(splitData.join(".*."), "i");
//   const currentTime = moment()
//     .utcOffset("+05:30")
//     .format("YYYY-MM-DDTHH:mm:ss");
//   if (type == 1) {
//     const movieData = (
//       await Movie.find({
//         cinemaObjectId: { $ne: null },
//         deletedStatus: 0,
//       }).populate("cinemaObjectId", "displayName")
//     ).filter(
//       (e) =>
//         (regex.test(e.name) || regex.test(e.cinemaObjectId.displayName)) &&
//         ele.cinemaObjectId &&
//         ele.cinemaObjectId.regionId &&
//         ele.cinemaObjectId.regionId.toString() === regionId
//     );
//     const uniqueMovies = Array.from(new Set(movieData.map((movie) => movie)));
//     const moviePromises = uniqueMovies.map(async (movie) => {
//       const showTimingCount = await TodayShow.countDocuments({
//         filmObjectId: movie._id,
//         sessionRealShow: { $gte: currentTime },
//         deletedStatus: 0,
//         isActive: true,
//       });
//       return showTimingCount > 0 ? movie : null;
//     });
//     const theaterData = await TodayShow.find({
//       isActive: true,
//       deletedStatus: 0,
//       filmObjectId: { $ne: null },
//       cinemaObjectId: { $ne: null },
//     })
//       .populate({
//         path: "filmObjectId",
//         select: "name",
//       })
//       .populate({
//         path: "cinemaObjectId",
//         select: "cinemaName poster displayName address",
//       })
//       .select("_id");
//     const arrayUniqueByKey = [
//       ...new Map(
//         theaterData.map((item) => [item["cinemaObjectId"]["cinemaName"], item])
//       ).values(),
//     ];
//     const theaterArray = arrayUniqueByKey.filter(
//       (e) =>
//         regex.test(e.filmObjectId.name) ||
//         regex.test(e.cinemaObjectId.cinemaName)
//     );
//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.DETAILS_FETCHED,
//       data: { getMovies: moviePromises, getCinemas: theaterArray },
//     });
//   }
//   if (type == 2) {
//     const movieData = await Movie.find({ name: regex }).filter(
//       (e) =>
//         ele.cinemaObjectId &&
//         ele.cinemaObjectId.regionId &&
//         ele.cinemaObjectId.regionId.toString() === regionId
//     );
//     const uniqueMovies = Array.from(new Set(movieData.map((movie) => movie)));
//     const moviePromises = uniqueMovies.map(async (movie) => {
//       const showTimingCount = await TodayShow.countDocuments({
//         filmObjectId: movie._id,
//         sessionRealShow: { $gte: currentTime },
//         deletedStatus: 0,
//         isActive: true,
//       });
//       return showTimingCount > 0 ? movie : null;
//     });
//     const theaterData = await TodayShow.find({
//       isActive: true,
//       deletedStatus: 0,
//       filmObjectId: { $ne: null },
//       cinemaObjectId: { $ne: null },
//     })
//       .populate({
//         path: "filmObjectId",
//         select: "name",
//       })
//       .populate({
//         path: "cinemaObjectId",
//         select: "cinemaName poster displayName address",
//       })
//       .select("_id");
//     const arrayUniqueByKey = [
//       ...new Map(
//         theaterData.map((item) => [item["cinemaObjectId"]["cinemaName"], item])
//       ).values(),
//     ];
//     const theaterArray = arrayUniqueByKey.filter((e) =>
//       regex.test(e.filmObjectId.name)
//     );
//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.DETAILS_FETCHED,
//       data: { getMovies: moviePromises, theaterData: theaterArray },
//     });
//   }
//   if (type == 3) {
//     const movieData = await Movie.find({
//       name: regex,
//       deletedStatus: 0,
//     }).filter(
//       (e) =>
//         ele.cinemaObjectId &&
//         ele.cinemaObjectId.regionId &&
//         ele.cinemaObjectId.regionId.toString() === regionId
//     );
//     const uniqueMovies = Array.from(new Set(movieData.map((movie) => movie)));
//     const moviePromises = uniqueMovies.map(async (movie) => {
//       const showTimingCount = await TodayShow.countDocuments({
//         filmObjectId: movie._id,
//         sessionRealShow: { $gte: currentTime },
//         deletedStatus: 0,
//         isActive: true,
//       });
//       return showTimingCount > 0 ? movie : null;
//     });
//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.DETAILS_FETCHED,
//       data: { getMovies: moviePromises },
//     });
//   }
// };
// //#endregion

//#region Get all search
export const getAllSearch = async (req, res) => {
  const { type, text = "", regionId } = req.query;

  const searchRegex = sanitizeSearchRegex(text);

  const currentTime = moment()
    .utcOffset("+05:30")
    // .format("YYYY-MM-DDTHH:mm:ss");
    .toDate();

  try {
    let pipeline = [];
    let restMoviePipeline = [];
    let movieData = [];
    let streamingData = [];
    let restMovieData = [];
    let theaterArray = [];

    switch (type) {
      case "1":
        // Aggregate movies with cinema details and filter by region and regex
        pipeline = [
          {
            $match: {
              $or: [
                { name: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { languages: { $regex: searchRegex } },
              ],
              cinemaObjectId: { $ne: null },
              deletedStatus: 0,
              isActive: true,
              status: 1,
            },
          },
          {
            $lookup: {
              from: "cinemas",
              localField: "cinemaObjectId",
              foreignField: "_id",
              as: "cinemaObjectId",
            },
          },
          {
            $unwind: {
              path: "$cinemaObjectId",
              preserveNullAndEmptyArrays: false,
            },
          },
          ...(regionId && mongoose.isValidObjectId(regionId)
            ? [
                {
                  $match: {
                    "cinemaObjectId.regionId": new mongoose.Types.ObjectId(
                      regionId
                    ),
                  },
                },
              ]
            : []),
          {
            $lookup: {
              from: "todayshows",
              let: { movieId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$filmObjectId", "$$movieId"] },
                        { $gte: ["$sessionRealShow", currentTime] },
                        { $eq: ["$deletedStatus", 0] },
                        { $eq: ["$isActive", true] },
                      ],
                    },
                  },
                },
              ],
              as: "shows",
            },
          },
          {
            $match: { "shows.0": { $exists: true } }, // Only keep movies with shows
          },
          {
            $group: {
              _id: "$uniqueFilmCode",
              movie: { $first: "$$ROOT" },
            },
          },
          {
            $replaceRoot: { newRoot: "$movie" },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              poster: 1,
              "cinemaObjectId._id": 1,
              "cinemaObjectId.cinemaId": 1,
              "cinemaObjectId.displayName": 1,
              "cinemaObjectId.regionId": 1,
            },
          },
        ];

        restMoviePipeline = [
          {
            $match: {
              $or: [
                { name: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { languages: { $regex: searchRegex } },
              ],
              cinemaObjectId: { $eq: null },
              filmCode: { $exists: false },
              deletedStatus: 0,
              isActive: true,
              status: 2,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              poster: 1,
            },
          },
        ];

        streamingData = await Movie.aggregate(pipeline);
        restMovieData = await Movie.aggregate(restMoviePipeline);

        // Aggregate theater data
        // const theaterPipeline = [
        //   {
        //     $match: {
        //       isActive: true,
        //       deletedStatus: 0,
        //       filmObjectId: { $ne: null },
        //       cinemaObjectId: { $ne: null },
        //       // sessionRealShow: { $lte: currentTime },
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "movies",
        //       localField: "filmObjectId",
        //       foreignField: "_id",
        //       as: "filmObjectId",
        //     },
        //   },
        //   {
        //     $unwind: {
        //       path: "$filmObjectId",
        //       preserveNullAndEmptyArrays: false,
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "cinemas",
        //       localField: "cinemaObjectId",
        //       foreignField: "_id",
        //       as: "cinemaObjectId",
        //     },
        //   },
        //   {
        //     $unwind: {
        //       path: "$cinemaObjectId",
        //       preserveNullAndEmptyArrays: false,
        //     },
        //   },
        //   {
        //     $match: {
        //       $and: [
        //         { "cinemaObjectId.isActive": true },
        //         { "cinemaObjectId.deletedStatus": 0 },
        //         { "cinemaObjectId.cinemaId": { $ne: null } },
        //         {
        //           $or: [
        //             { "filmObjectId.name": { $regex: searchRegex } },
        //             {
        //               "filmObjectId.category": {
        //                 $regex: searchRegex,
        //               },
        //             },
        //             {
        //               "filmObjectId.languages": {
        //                 $regex: searchRegex,
        //               },
        //             },
        //             {
        //               "cinemaObjectId.cinemaName": {
        //                 $regex: searchRegex,
        //               },
        //             },
        //             {
        //               "cinemaObjectId.displayName": {
        //                 $regex: searchRegex,
        //               },
        //             },
        //           ],
        //         },
        //         ...(regionId && mongoose.isValidObjectId(regionId)
        //           ? [
        //               {
        //                 "cinemaObjectId.regionId": new mongoose.Types.ObjectId(
        //                   regionId
        //                 ),
        //               },
        //             ]
        //           : []),
        //       ],
        //     },
        //   },
        //   {
        //     $group: {
        //       _id: "$cinemaObjectId.cinemaName",
        //       data: { $first: "$$ROOT" },
        //     },
        //   },
        //   {
        //     $replaceRoot: { newRoot: "$data" },
        //   },
        //   {
        //     $project: {
        //       "cinemaObjectId._id": 1,
        //       "cinemaObjectId.regionId": 1,
        //       "cinemaObjectId.poster": 1,
        //       "cinemaObjectId.cinemaName": 1,
        //       "cinemaObjectId.displayName": 1,
        //       "cinemaObjectId.address": 1,
        //     },
        //   },
        // ];
        // theaterArray = await TodayShow.aggregate(theaterPipeline);

        const theaterPipeline = [
          {
            $match: {
              deletedStatus: 0,
              isActive: true,
              poster: { $ne: "" },

              ...(regionId && mongoose.isValidObjectId(regionId)
                ? { regionId: new mongoose.Types.ObjectId(regionId) }
                : {}),

              ...(text
                ? {
                    $or: [
                      { cinemaName: { $regex: searchRegex } },
                      { displayName: { $regex: searchRegex } },
                      { address: { $regex: searchRegex } },
                    ],
                  }
                : {}),
            },
          },
          {
            $project: {
              _id: 1,
              cinemaId: 1,
              cinemaName: 1,
              displayName: 1,
              address: 1,
              regionId: 1,
              poster: 1,
            },
          },
        ];
        theaterArray = await Cinema.aggregate(theaterPipeline);
        break;

      case "3":
        // Aggregate movies by name and filter by region
        pipeline = [
          {
            $match: {
              $or: [
                { name: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { languages: { $regex: searchRegex } },
              ],
              deletedStatus: 0,
              cinemaObjectId: { $ne: null },
              status: 1,
              isActive: true,
            },
          },
          {
            $lookup: {
              from: "cinemas",
              localField: "cinemaObjectId",
              foreignField: "_id",
              as: "cinemaObjectId",
            },
          },
          {
            $unwind: {
              path: "$cinemaObjectId",
              preserveNullAndEmptyArrays: false,
            },
          },
          ...(regionId && mongoose.isValidObjectId(regionId)
            ? [
                {
                  $match: {
                    "cinemaObjectId.regionId": new mongoose.Types.ObjectId(
                      regionId
                    ),
                  },
                },
              ]
            : []),
          {
            $lookup: {
              from: "todayshows",
              let: { movieId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$filmObjectId", "$$movieId"] },
                        { $gte: ["$sessionRealShow", currentTime] },
                        { $eq: ["$deletedStatus", 0] },
                        { $eq: ["$isActive", true] },
                      ],
                    },
                  },
                },
              ],
              as: "shows",
            },
          },
          {
            $match: { "shows.0": { $exists: true } },
          },
          {
            $group: {
              _id: "$uniqueFilmCode",
              movie: { $first: "$$ROOT" },
            },
          },
          {
            $replaceRoot: { newRoot: "$movie" },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              poster: 1,
              "cinemaObjectId._id": 1,
              "cinemaObjectId.cinemaId": 1,
              "cinemaObjectId.displayName": 1,
              "cinemaObjectId.regionId": 1,
            },
          },
        ];
        restMoviePipeline = [
          {
            $match: {
              $or: [
                { name: { $regex: searchRegex } },
                { category: { $regex: searchRegex } },
                { languages: { $regex: searchRegex } },
              ],
              cinemaObjectId: { $eq: null },
              filmCode: { $exists: false },
              deletedStatus: 0,
              isActive: true,
              status: 2,
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              poster: 1,
            },
          },
        ];

        streamingData = await Movie.aggregate(pipeline);
        restMovieData = await Movie.aggregate(restMoviePipeline);
        break;

      case "4":
        movieData = [];
        break;

      default:
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.INVALID_TYPE,
          data: [],
        });
    }

    movieData = [...streamingData, ...restMovieData];
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.DETAILS_FETCHED,
      data: { getMovies: movieData, getCinemas: theaterArray },
    });
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
//#endregion

//#region Social login
export const socialLogin = async (req, res) => {
  try {
    const fcmToken = req.body.fcmToken;
    if (req.body.email === null) {
      req.body.email = false;
    }

    const deviceType = req.headers["x-device-type"] || "";

    const findSocialUser = await User.findOne({
      $or: [{ email: req.body.email }, { providerId: req.body.providerId }],
      deletedStatus: 0,
    });
    const findSocialUserForDeleteAccount = await User.findOne({
      providerId: req.body.providerId,
      deletedStatus: 1,
    });
    let payload;
    let token;
    if (findSocialUser) {
      payload = { userId: findSocialUser._id };
      token = createJwtToken(payload);
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.SOCIAL_LOGGED_IN,
        data: {
          ...findSocialUser._doc,
          token,
          deleteAfterLogin: false,
          fcmToken,
        },
      });
    } else if (findSocialUserForDeleteAccount) {
      let findSocialUser = await SocialUser.findOne({
        providerId: findSocialUserForDeleteAccount?.providerId,
      });

      const createSocialUser = await User.create({
        firstName: findSocialUser.firstName,
        lastName: findSocialUser.lastName,
        email: findSocialUser.email,
        providerId: findSocialUser.providerId,
        // accessToken: req.body.accessToken,
        isAccountVerified: 1,
        source: req.body.source,
        login_type: req.body.login_type,
        ...(fcmToken && fcmToken.trim() ? { fcmToken: fcmToken.trim() } : {}),
        ...(deviceType ? { registeredFrom: deviceType } : {}),
      });
      if (createSocialUser) {
        payload = { userId: createSocialUser._id };
        token = createJwtToken(payload);
        // findSocialUserForDeleteAccount.fcmToken = "";
        // findSocialUserForDeleteAccount.providerId = "";
        findSocialUserForDeleteAccount.deleteOne();
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.SOCIAL_LOGGED_IN,
          data: { ...createSocialUser._doc, deleteAfterLogin: true, token },
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.OK,
          message: ResponseMessage.SOCIAL_LOGIN_NOT_CREATED,
          data: [],
        });
      }
    } else {
      const createSocialUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        providerId: req.body.providerId,
        // accessToken: req.body.accessToken,
        isAccountVerified: 1,
        source: req.body.source,
        login_type: req.body.login_type,
        fcmToken: fcmToken,
        ...(deviceType ? { registeredFrom: deviceType } : {}),
      });

      const newSocialUser = await SocialUser.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        providerId: req.body.providerId,
        login_type: req.body.login_type,
        fcmToken: fcmToken,
        ...(deviceType ? { registeredFrom: deviceType } : {}),
      });
      if (createSocialUser) {
        payload = { userId: createSocialUser._id };
        token = createJwtToken(payload);
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.SOCIAL_LOGIN_CREATED,
          data: { ...createSocialUser._doc, deleteAfterLogin: false, token },
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.OK,
          message: ResponseMessage.SOCIAL_LOGIN_NOT_CREATED,
          data: [],
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
//#endregion

export const activePartner = async (req, res) => {
  try {
    Partner.find({
      isActive: true,
    })
      .then((result) => {
        return res.status(200).send({
          success: StatusCodes.OK,
          message: ResponseMessage.ADMIN_PARTNER_ACTIVE_STATUS,
          data: result,
        });
      })
      .catch((err) => {
        return res.status(400).send({
          success: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.ADMIN_PARTNER_ACTIVE_STATUS_NOT_FETCH,
          error: err,
        });
      });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user;
    const logoutUser = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      { $set: { fcmToken: null } },
      { new: true }
    );

    return res.status(200).send({
      success: StatusCodes.OK,
      message: ResponseMessage.USER_LOGOUT,
      data: logoutUser,
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const singleUserNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const updateNotificationStatus = await Notification.findByIdAndUpdate(
      {
        _id: notificationId,
      },
      {
        $set: { isRead: true },
      },
      { new: true }
    );
    return res.status(200).send({
      success: StatusCodes.OK,
      message: ResponseMessage.NOTIFICATION_STATUS_CHANGE,
      data: updateNotificationStatus,
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};

export const getAllUserNotification = async (req, res) => {
  try {
    const userId = req.user;
    const userAllNotification = await Notification.find({
      userId: userId,
      isRead: false,
    }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: StatusCodes.OK,
      message: ResponseMessage.ALL_USER_NOTIFICATION,
      data: userAllNotification,
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
export const downloadTicket = async (req, res) => {
  try {
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.BANNER_DETAILS,
      data: [
        {
          link: "https://backend.theconnplex.com/uploads/Connplex-movie-ticket.pdf",
        },
      ],
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#region getBlogs
export const getBlogs = async (req, res) => {
  try {
    let blogs = await Blogs.aggregate([
      {
        $match: {
          status: true,
          deletedStatus: 0,
          type: { $ne: "blog_background" },
        },
      },
      {
        $addFields: {
          imageGallery: {
            $filter: {
              input: "$image",
              as: "image",
              cond: {
                $eq: ["$$image.status", true],
              },
            },
          },
        },
      },
    ]);

    let findBlogBackground = await Blogs.find({
      type: "blog_background",
      status: true,
      deletedStatus: 0,
    });
    if (blogs || findBlogBackground.length > 0) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.BLOGS_DETAILS,
        data: {
          bloglist: blogs,
          background: findBlogBackground,
        },
      });
    } else {
      await res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion
export const ReportIssueMail = async (req, res) => {
  try {
    const userId = req.user;
    const { description, cinemaObjectId, transaction_type, Date, email } =
      req.body;
    const findUser = await User.findById({ _id: userId });
    if (!findUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    }

    const name = `${findUser && findUser.firstName} ${
      findUser && findUser.lastName
    }`;

    const reportIssue = new ReportIssue({
      userId: req.user,
      name,
      email: findUser && findUser.email,
      description,
      cinemaObjectId: cinemaObjectId,
      transaction_type: transaction_type,
      attachImage: req.ReportIssueImages, // Ensure you are handling file uploads correctly
      date: Date,
      mobileNumber: findUser.mobileNumber,
    });

    const data = await reportIssue.save();
    let temp = [];
    let reportIssuelist = await ReportIssue.findOne({
      _id: data._id,
    })
      .populate({
        path: "cinemaObjectId",
        select: ["cinemaName", "cinemaId:"],
      })
      .then(async (res, err) => {
        temp.push(res);
      });
    await ReportAndIssueMail(temp);

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.REPORT_AND_ISSUE_SENT,
      data,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
};

export const getAdvertiseDetails = async (req, res) => {
  try {
    let getAdvertiseList = await Advertisement.find({
      filebg: { $ne: null },
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (getAdvertiseList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADVERTISEMENT_DETAILS,
        data: getAdvertiseList,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.ADVERTISEMENT_NOT_FOUND,
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
export const getCareerDetails = async (req, res) => {
  try {
    let getCareerList = await Career.find({
      filebg: { $ne: null },
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (getCareerList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CAREER_DETAILS,
        data: getCareerList,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.CAREER_NOT_FOUND,
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

export const getUserData = async (req, res) => {
  try {
    const findUser = await User.findOne({ _id: req.query.id });
    if (findUser) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_GET,
        data: findUser,
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

export const getAllCinema = async (req, res) => {
  try {
    const cinemas = await Cinema.find(
      { deletedStatus: 0, isActive: true },
      { _id: 1, cinemaName: 1 }
    );
    console.log("cinemas", cinemas.length);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.SUCCESS,
      data: cinemas,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

export const updateFcmToken = async (req, res) => {
  try {
    const userId = req.user;
    const { fcmToken } = req.body;

    if (userId && !mongoose.isValidObjectId(userId)) {
      return res.status(400).send({
        success: StatusCodes.BAD_REQUEST,
        message: "Invalid userId.",
        data: [],
      });
    }

    if (fcmToken && fcmToken.trim()) {
      await User.findByIdAndUpdate(
        {
          _id: userId,
        },
        { $set: { fcmToken: fcmToken.trim() } },
        { new: true }
      );
    }

    return res.status(200).send({
      success: StatusCodes.OK,
      message: ResponseMessage.USER_FCM_TOKEN_UPDATED,
      data: [],
    });
  } catch (error) {
    return res.status(500).send({
      success: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: error.message,
    });
  }
};
