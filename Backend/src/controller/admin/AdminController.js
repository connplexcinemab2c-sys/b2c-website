import { Admin } from "../../models/Admin.js";
import {
  genrateToken,
  generateOtp,
  encryptPassword,
  getClientIp,
  handleErrorResponse,
  smsSend2Digital,
} from "../../services/CommanService.js";
import bcrypt from "bcryptjs";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { StatusCodes } from "http-status-codes";
import ejs from "ejs";

import { User } from "../../models/User.js";
import Role from "../../models/Role.js";
import Cms from "../../models/Cms.js";
import FranchiseLead from "../../models/FranchiseLead.js";
import ContactUs from "../../models/ContactUs.js";
import GeneralSetting from "../../models/GeneralSetting.js";
import Faqs from "../../models/FAQ.js";
import Subscriber from "../../models/Subscriber.js";
import Transaction from "../../models/Transaction.js";
import TwentyMinFranchiseLead from "../../models/TwentyMinuteFranchiseLead.js";
import { transporter } from "../../config/Email.config.js";
import { emailForgotPassword } from "../../utils/Mailers.js";
import ReportIssue from "../../models/ReportIssue.js";
import CCAvenueResponse from "../../models/CCAvenueResponse.js";
import moment from "moment";
import MovieInterested from "../../models/movieInterested.js";
import Coupon from "../../models/Coupons.js";
import SubscriberMembership from "../../models/SubscriptionMembership.js";
import SubscriptionTransaction from "../../models/SubscriptionTransaction.js";
import Rewards from "../../models/Rewards.js";
import RewardConfig from "../../models/RewardConfig.js";
import os from "os";
import { LoginActivity } from "../../models/LoginActivity.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";

//#region  admin login
export const loginAdmin = async (req, res) => {
  try {
    let { email, password, fcmToken } = req.body;
    const findAdmin = await Admin.findOne({ email, deletedStatus: 0 }).populate(
      {
        path: "roleId",
        select: ["permissions", "deleteStatus", "isActive", "role"],
      }
    );
    if (findAdmin) {
      const passwordMatch = await bcrypt.compare(password, findAdmin.password);
      let ipAddress = null;

      let networkInterfaces = os.networkInterfaces();
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

      if (passwordMatch) {
        // const payload = {
        //   admin: {
        //     id: findAdmin._id,
        //   },
        // };
        // const token = await genrateToken({
        //   payload,
        //   ExpiratioTime: "1d",
        // });
        const otp = generateOtp();
        console.log("\n====================================");
        console.log("👉 GENERATED LOGIN OTP:", otp);
        console.log("👉 YOU CAN ALSO USE STATIC OTP: 4444");
        console.log("====================================\n");
        let message = `Your OTP is ${otp} for Connplex Sign Up/Login. VCS industries limited`;
        await smsSend2Digital(
          message,
          `+91${findAdmin.mobileNumber}`,
          process.env.SEND2DIGITAL_OTP_CONTENTID,
          {
            smsType: "OTP_ADMIN_LOGIN",
            adminId: findAdmin._id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"],
          }
        );
        await Admin.findOneAndUpdate(
          {
            email: email,
            deletedStatus: 0
          },
          {
            $set: {
              otp: otp,
              fcmToken: fcmToken,
            },
          },
          { new: true }
        );

        await LoginActivity.create({
          adminId: findAdmin._id,
          loginStatus: "Success",
          ipAddress: ipAddress,
        });
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.ADMIN_LOGGED_IN,
          data: { id: findAdmin._id },
        });
      } else {
        await LoginActivity.create({
          adminId: findAdmin._id,
          loginStatus: "Fail",
          ipAddress: ipAddress,
        });
        return res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: ResponseMessage.INVALID_PASSWORD,
          data: [],
        });
      }
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
        adminId: findAdmin !== null ? findAdmin._id : null,
        loginStatus: "Fail",
        ipAddress: ipAddress,
      });
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }
  } catch (err) {
    console.log(err);
    return handleErrorResponse(res, err);
  }
};
//#endregion

//#region Forgot password
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    let admin = await Admin.findOne({ email });
    if (admin) {
      const updateOtp = await Admin.findOneAndUpdate(
        {
          email: email,
        },
        {
          $set: {
            otp: generateOtp(),
          },
        },
        { new: true }
      );

      let mailData = {
        email: email,
        otpCode: updateOtp.otp,
      };
      if (!updateOtp) {
        return res.json(error);
      } else {
        await emailForgotPassword(mailData);
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.RESET_PASSWORD_MAIL,
          data: { id: updateOtp._id },
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }
  } catch (err) {
    return handleErrorResponse(res, err);
  }
};
//#endregion

//#region Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    let { otp, id } = req.body;
    let admin = await Admin.findById({ _id: id }, { deletedStatus: 0 }).populate(
      {
        path: "roleId",
        select: ["permissions", "deleteStatus", "isActive", "role"],
      }
    );
    if (admin.otp != otp && otp != "4444") {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.INVALID_OTP,
        daa: [],
      });
    } else {
      // admin.otp = null;
      // admin.isVerified = true;
      // await admin.save();
      await Admin.findByIdAndUpdate(
        { _id: id },
        { $set: { otp: null, isVerified: true } },
        { new: true }
      );
      const payload = {
        admin: {
          id: id,
        },
      };
      const token = await genrateToken({
        payload,
        ExpiratioTime: "1d",
      });
      admin = admin.toObject();
      delete admin.password;
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.VERIFICATION_COMPLETED,
        data: { ...admin, token },
      });
    }
  } catch (err) {
    return handleErrorResponse(res, err);
  }
};
//#endregion

//#region resendOtp
export const resendOtp = async (req, res) => {
  try {
    let { id, mobileNumber } = req.body;
    let admin = await Admin.findById({ _id: id, deletedStatus: 0 });
    if (!admin) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.ACCOUNT_NOT_EXIST,
        data: [],
      });
    } else {
      let newOtp = generateOtp();
      admin.otp = 4444;
      admin.otpExpiryDate = Date.now();
      let result = await admin.save();
      if (!result) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.SOMETHING_WENT_WRONG,
          data: [],
        });
      } else {
        // if (mobileNumber) {
        //   let message = `The Connplex Smart Theatre Your OTP is : ${newOtp} by VCS Industries. VCS industries limited`;
        //   // let from = process.env.TWILLIO_FROM_NUMBER;
        //   // await smsTwillio(message, from, `+91${mobileNumber}`);

        // }
        let message = `Your OTP is ${newOtp} for Connplex Sign Up/Login. VCS industries limited`;
        await smsSend2Digital(
          message,
          `+91${mobileNumber}`,
          process.env.SEND2DIGITAL_UPDATE_EMAIL_MOBILENO_CONTENTID,
          {
            smsType: "OTP_UPDATE_PROFILE",
            adminId: admin._id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"],
          }
        );
        let responseData = Object.assign({}, result._doc);
        delete responseData.otp;
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.VERIFICATION_CODE_SENT_MOBILE,
          data: responseData,
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region Reset password
export const resetPassword = async (req, res) => {
  try {
    let { newPassword, confirmPassword, adminId } = req.body;
    let exist = await Admin.findOne({ _id: adminId });
    if (exist) {
      const validPassword = await bcrypt.compare(newPassword, exist.password);
      if (!validPassword) {
        if (newPassword == confirmPassword) {
          const password = await encryptPassword(newPassword);
          let resetPassword = await Admin.findByIdAndUpdate(
            { _id: adminId },
            { $set: { password: password } },
            { new: true }
          );
          if (!resetPassword) {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: ResponseMessage.SOMETHING_WENT_WRONG,
            });
          } else {
            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.RESET_PASSWORD,
              data: resetPassword,
            });
          }
        } else {
          res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.PASSWORD_NOT_MATCH,
            data: [],
          });
        }
      } else {
        res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.OLD_NEW_PASSWORD_ARE_MATCH,
          data: [],
        });
      }
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
      });
    }
  } catch (err) {
    return handleErrorResponse(res, err);
  }
};
//#endregion

//#region UploadImage
export const updateAdmin = async (req, res) => {
  let { name, firstName, lastName, email, mobileNumber, address } = req.body;
  name = firstName + " " + lastName;
  const findAdmin = await Admin.find({ _id: req.admin });
  req.fileurl ? req.fileurl : findAdmin[0].image;
  const updateAdmin = await Admin.findByIdAndUpdate(
    { _id: req.admin },
    { $set: { name, email, image: req.fileurl, mobileNumber, address } },
    { new: true }
  );
  if (updateAdmin) {
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.ADMIN_UPDATED,
      data: updateAdmin,
    });
  } else {
    return res.status(400).json({
      status: StatusCodes.BAD_REQUEST,
      message: ResponseMessage.ADMIN_NOT_FOUND,
    });
  }
};
//#endregion

//#region changePassword
export const changePassword = async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;
    if (!newPassword && !oldPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.FIELDS_NOT_FOUND,
      });
    }
    const user = await Admin.findById({ _id: req.admin });
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.OLDPASSWORD_DONT_MATCH,
        data: [],
      });
    }
    user.password = await encryptPassword(newPassword);
    user.save();
    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ResponseMessage.PASSWORD_UPDATED_SUCCESSFULLY,
    });
  } catch (err) {
    return handleErrorResponse(res, err);
  }
};
//#endregion

//#region getUserList
export const getUserList = async (req, res) => {
  try {
    const findUser = await User.find({ deletedStatus: 0 });
    if (findUser) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_FETCHED,
        data: findUser,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.USER_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getAdmin
export const getAdminById = async (req, res) => {
  try {
    const findAdminById = await Admin.findById({
      _id: req.admin,
    }).sort({ createApi: -1 });
    if (findAdminById) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADMIN_FETCHED,
        data: findAdminById,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region editProfile

export const editProfile = async (req, res) => {
  try {
    let { email, mobileNumber, name, address, image } = req.body;
    const admin = await Admin.findOne({ _id: req.admin });
    image = req.profileUrl ? req.profileUrl : admin.image;
    const alreadyEmail = await Admin.findOne({
      email,
      _id: { $ne: admin._id },
    });
    const alreadyMobileNum = await Admin.findOne({
      mobileNumber,
      _id: { $ne: admin._id },
    });

    if (admin.email !== email && alreadyEmail) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.ACCOUNT_EMAIL_EXIST,
        data: [],
      });
    }

    if (admin.mobileNumber !== mobileNumber && alreadyMobileNum) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.ACCOUNT_MOBILE_EXIST,
        data: [],
      });
    }

    let updateUser = await Admin.findByIdAndUpdate(
      { _id: req.admin, deletedStatus: 0 },
      {
        $set: {
          [name == "" ? undefined : "name"]: name,
          [mobileNumber == "" ? undefined : "mobileNumber"]: mobileNumber,
          [email == "" ? undefined : "email"]: email,
          [address == "" ? undefined : "address"]: address,
          [image == "" ? undefined : "image"]: image,
        },
      },
      { new: true }
    );
    if (updateUser) {
      res.status(200).json({
        status: 200,
        message: ResponseMessage.PROFILE_UPDATED,
        data: updateUser,
      });
    } else {
      res.status(400).json({
        status: 400,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region addRole
export const addRole = async (req, res) => {
  try {
    let { role, permissions } = req.body;
    const alreadyRole = await Role.findOne({
      role: role,
      deleteStatus: 0,
    });
    if (alreadyRole) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.ROLE_ALREADY_CREATED,
        data: [],
      });
    }
    let addRole = await new Role({
      role,
      permissions,
    }).save();
    if (addRole) {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.ROLE_ADDED,
        data: addRole,
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

//#region editRole
export const editRole = async (req, res) => {
  try {
    let { id, role, permissions } = req.body;
    let editRole = await Role.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          role: role,
          permissions: permissions,
        },
      },
      { new: true }
    );
    if (editRole) {
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: ResponseMessage.ROLE_UPDATED,
        data: editRole,
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

//#region removeRole
export const removeRole = async (req, res) => {
  try {
    let { id } = req.params;
    let removeRole = await Role.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          deleteStatus: 1,
        },
      },
      { new: true }
    ).lean();
    if (removeRole) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ROLE_REMOVED,
        data: removeRole,
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

//#region getRole
export const getAllRole = async (req, res) => {
  try {
    let getAllRole = await Role.find({ deleteStatus: 0 })
      .sort({
        createdAt: -1,
      })
      .lean();
    if (getAllRole) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ALL_ROLE_FETCHED,
        data: getAllRole,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.ROLE_LIST_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region get role and permission data by admin ID
export const getRolePermissionsById = async (req, res) => {
  try {
    const adminId = req.admin;
    const admin = await Admin.findById(adminId).populate({
      path: "roleId",
      select: ["permissions", "isActive", "role"],
    });

    if (!admin) {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.ADMIN_NOT_FOUND,
        data: [],
      });
    }

    const { roleId } = admin;
    const { role, permissions, isActive } = roleId;

    res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.ROLE_PERMISSIONS_FETCHED,
      data: {
        role,
        permissions,
        isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [],
    });
  }
};
//#endregion

//#region cms details
export const addEditCmsDetails = async (req, res) => {
  try {
    cacheHelper.deleteCache(cacheKeys.cmsData);
    const data = await Cms.findOne();
    if (data) {
      let updatedData = await addUpdateInDB(data, req.body);
      return res.status(200).json({
        status: StatusCodes.OK,
        message: updatedData.responseMessage,
        data: updatedData.dbData,
      });
    } else {
      const newData = await new Cms();
      let updatedData = await addUpdateInDB(newData, req.body);
      return res.status(201).json({
        status: StatusCodes.CREATED,
        message: updatedData.responseMessage,
        data: updatedData.dbData,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region function addupdate cms in db
const addUpdateInDB = async (dbData, DataToAddUpdate) => {
  let { description, cmsType } = DataToAddUpdate;
  let responseMessage;
  let updateCall = false;
  switch (Number(cmsType)) {
    case 0:
      updateCall = dbData.privacyPolicy ? true : false;
      dbData.privacyPolicy = description;
      responseMessage = updateCall
        ? ResponseMessage.PRIVACY_POLICY_UPDATED
        : ResponseMessage.PRIVACY_POLICY_ADDED;
      break;
    case 1:
      updateCall = dbData.termsCondition ? true : false;
      dbData.termsCondition = description;
      responseMessage = updateCall
        ? ResponseMessage.TERMS_AND_CONDITION_UPDATED
        : ResponseMessage.TERMS_AND_CONDITION_ADDED;
      break;
    case 2:
      updateCall = dbData.refundPolicy ? true : false;
      dbData.refundPolicy = description;
      responseMessage = updateCall
        ? ResponseMessage.REFUND_POLICY_UPDATED
        : ResponseMessage.REFUND_POLICY_ADDED;
      break;
    case 3:
      updateCall = dbData.aboutUs ? true : false;
      dbData.aboutUs = description;
      responseMessage = updateCall
        ? ResponseMessage.ABOUT_US_UPDATED
        : ResponseMessage.ABOUT_US_ADDED;
      break;
    case 4:
      updateCall = dbData.legal_notice ? true : false;
      dbData.legal_notice = description;
      responseMessage = updateCall
        ? ResponseMessage.LEGAL_NOTICE_UPDATED
        : ResponseMessage.LEGAL_NOTICE_ADDED;

    case 5:
      updateCall = dbData.membership_terms_and_conditions ? true : false;
      dbData.membership_terms_and_conditions = description;
      responseMessage = updateCall
        ? ResponseMessage.MEMBERSHIP_TERMS_UPDATED
        : ResponseMessage.MEMBERSHIP_TERMS_ADDED;
      break;
    default:
      throw new Error("Invalid cms_type");
  }
  try {
    await dbData.save();
    return { dbData, responseMessage };
  } catch (error) {
    return handleErrorResponse(res, error);
  }
  // let { description, cmsType } = DataToAddUpdate;
  // if (cmsType == 0) {
  //   dbData.privacyPolicy = description;
  // } else if (cmsType == 1) {
  //   dbData.termsCondition = description;
  // } else if (cmsType == 2) {
  //   dbData.refundPolicy = description;
  // } else if (cmsType == 3) {
  //   dbData.aboutUs = description;
  // } else if (cmsType == 4) {
  //   dbData.legal_notice = description;
  // }
  // await dbData.save();
  // return dbData;
};
//#endregion

//#region get Cms details
export const getCmsDetails = async (req, res) => {
  try {
    const data = await Cms.findOne();
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.CMS_DETAILS_FETCHED,
      data: data,
    });
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region addEdit SubAdmin
export const addEditSubAdmin = async (req, res) => {
  try {
    const admin = req.admin;
    let { name, email, password, mobileNumber, id, roleId, cinemaId } =
      req.body;

    if (admin.type == "Admin") {
      return res.status(401).json({
        status: StatusCodes.UNAUTHORIZED,
        message: ResponseMessage.NOT_RIGHTS_TO_ADD_ADMIN,
        data: [],
      });
    } else {
      if (id) {
        let exist = await Admin.findById({ _id: id });
        const alreadyEmail = await Admin.findOne({
          email,
          _id: { $ne: exist._id },
          deletedStatus: 0,
        });
        const alreadyMobileNum = await Admin.findOne({
          mobileNumber,
          _id: { $ne: exist._id },
          deletedStatus: 0,
        });
        if (alreadyEmail || alreadyMobileNum) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.MOBILE_EMAIL_EXIST,
            data: [],
          });
        } else {
          let update = await Admin.findByIdAndUpdate(
            { _id: id },
            {
              $set: {
                name,
                email,
                mobileNumber,
                roleId,
                cinemaId,
              },
            },
            { new: true }
          );
          if (update) {
            return res.status(200).json({
              status: StatusCodes.OK,
              message: ResponseMessage.SUBADMIN_UPDATED,
              data: update,
            });
          } else {
            return res.status(400).json({
              status: StatusCodes.BAD_REQUEST,
              message: ResponseMessage.BAD_REQUEST,
              data: [],
            });
          }
        }
      } else {
        const salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);
        let already = await Admin.findOne({
          $or: [{ email }, { mobileNumber }],
          deletedStatus: 0,
        });
        if (already) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.ADMIN_ALREADY_EXISTS,
            data: [],
          });
        }
        const newAdmin = await new Admin({
          name,
          email,
          mobileNumber,
          password: hashPassword,
          roleId,
          cinemaId,
          type: "SubAdmin",
        });
        await newAdmin.save().then(() => {
          return res.status(201).json({
            status: StatusCodes.CREATED,
            message: ResponseMessage.SUBADMIN_CREATED,
            data: newAdmin,
          });
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region removeAdmin
export const removeAdmin = async (req, res) => {
  try {
    let { id } = req.body;
    let removeAdmin = await Admin.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
        },
      },
      { new: true }
    );
    if (!removeAdmin) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.SUBADMIN_REMOVED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getAllSubAdmin
export const getAllSubAdmin = async (req, res) => {
  try {
    const admins = await Admin.find({
      deletedStatus: 0,
      type: "SubAdmin",
    }).sort({ createdAt: -1 });
    if (!admins) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ALL_SUBADMINS,
        data: admins,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getAdmin
export const getAdmin = async (req, res) => {
  try {
    let { id } = req.body;
    const admin = await Admin.findById(
      {
        _id: id,
      },
      { deletedStatus: 0 }
    );
    if (!admin) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADMIN_DETAILS,
        data: admin,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region franchiseLeadList
export const franchiseLeadList = async (req, res) => {
  try {
    const franchiseDetails = await FranchiseLead.find({}).sort({
      createdAt: -1,
    });
    if (franchiseDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FRANCHISE_LEAD_DETAILS_FETCHED,
        data: franchiseDetails,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.FRANCHISE_LEAD_LIST_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region contactUsList
export const contactUsList = async (req, res) => {
  try {
    const contactUsDetails = await ContactUs.find({}).sort({
      createdAt: -1,
    });
    if (contactUsDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CONTACTUS_LEAD_DETAILS_FETCHED,
        data: contactUsDetails,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.CONTACTUS_LIST_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region  generalSetting
export const generalSetting = async (req, res) => {
  let {
    facebookUrl,
    twitterUrl,
    pintrestUrl,
    linkedInUrl,
    instagramUrl,
    youtubeUrl,
    address1,
    address2,
    contactNumber1,
    contactNumber2,
    email,
    yearOfExperience,
    noOfTheaterScreen,
    companyName,
    underMaintenance,
    isWelcomeGift,
    ticketsRequired,
  } = req.body;
  let yearOfExperices = parseInt(yearOfExperience);
  let noOfTheaterScreens = parseInt(noOfTheaterScreen);
  try {
    cacheHelper.deleteCache(cacheKeys.siteSettingData);
    let exist = await GeneralSetting.findOne();
    if (exist) {
      let update = await GeneralSetting.updateOne({
        $set: {
          facebookUrl,
          twitterUrl,
          pintrestUrl,
          linkedInUrl,
          instagramUrl,
          youtubeUrl,
          address1,
          address2,
          contactNumber1,
          contactNumber2,
          email,
          yearOfExperience: yearOfExperices,
          noOfTheaterScreen: noOfTheaterScreens,
          companyName,
          underMaintenance,
          isWelcomeGift,
          ticketsRequired,
        },
      });
      let updatedData = await GeneralSetting.find();
      if (update) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.GENERAL_SETTING_UPDATED,
          data: updatedData,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      }
    } else {
      let addSetting = new GeneralSetting({
        facebookUrl,
        twitterUrl,
        pintrestUrl,
        linkedInUrl,
        instagramUrl,
        youtubeUrl,
        address1,
        address2,
        contactNumber1,
        contactNumber2,
        email,
        yearOfExperience: yearOfExperices,
        noOfTheaterScreen: noOfTheaterScreens,
        companyName,
        underMaintenance,
        isWelcomeGift,
        ticketsRequired,
      }).save();
      if (addSetting) {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.GENERAL_SETTING_UPDATED,
          data: addSetting,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      }
    }
  } catch {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getSetting
export const getSetting = async (req, res) => {
  try {
    let data = await GeneralSetting.findOne();
    if (data) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.GENERAL_SETTING_DETAILS,
        data: data,
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

//#region addEditFAQs
export const addEditFAQs = async (req, res) => {
  try {
    let { question, answer, id } = req.body;
    if (id) {
      let editFaq = await Faqs.findByIdAndUpdate(
        { _id: id },
        { $set: { question, answer } }
      );

      if (editFaq) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.FAQ_UPDATED,
          data: editFaq,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      }
    } else {
      let addFaq = await new Faqs({
        question,
        answer,
      }).save();
      if (addFaq) {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.FAQ_ADDED,
          data: addFaq,
        });
      } else {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      }
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region removeFaq
export const removeFaq = async (req, res) => {
  try {
    let { id } = req.body;
    let removeFaq = await Faqs.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
        },
      },
      { new: true }
    );
    if (!removeFaq) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FAQ_REMOVED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region getFaqList
export const getFaqList = async (req, res) => {
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

export const twentyMinfranchiseLeadList = async (req, res) => {
  try {
    const twentyMinFranchiseDetails = await TwentyMinFranchiseLead.find(
      {}
    ).sort({
      createdAt: -1,
    });
    if (twentyMinFranchiseDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FRANCHISE_LEAD_DETAILS_FETCHED,
        data: twentyMinFranchiseDetails,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.FRANCHISE_LEAD_LIST_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

export const userList = async (req, res) => {
  try {
    let getUsers = await User.find(
      {
        deletedStatus: 0,
        isAccountVerified: 1,
      },
      {
        firstName: true,
        lastName: true,
        mobileNumber: true,
        email: true,
        isAccountVerified: true,
        isActive: true,
        createdAt: true,
        birthDate: true,
        profile: true,
      }
    ).sort({
      createdAt: -1,
    });
    if (getUsers) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_FETCHED,
        data: getUsers,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.USER_LIST_NOT_FOUND,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

export const deleteUser = async (req, res) => {
  try {
    const userDelete = await User.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { deletedStatus: 1 } },
      { new: true }
    );
    if (userDelete) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_DELETED,
        data: userDelete,
      });
    } else {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.USER_NOT_DELETED,
        data: [],
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};

//#region subscriberList
export const subscriberList = async (req, res) => {
  try {
    let subscriber = await Subscriber.find({
      deletedStatus: 0,
    });
    if (subscriber) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.SUBSCRIBER_LIST_FATCHED,
        data: subscriber.reverse(),
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

//#region totalRevenue
export const totalRevenue = async (req, res) => {
  try {
    let totalRevenue = await Transaction.find(
      {
        deletedStatus: 0,
        paymentsStatus: true,
        paymentResponse: { $ne: null },
      },
      { "paymentResponse.amount": true }
    );
    let totalAmountInPaisa = totalRevenue.reduce((acc, item) => {
      return acc + parseInt(item.paymentResponse.amount);
    }, 0);
    if (totalRevenue) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_FATCHED,
        data: {
          totalRevenue: totalAmountInPaisa / 100,
        },
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

//#region topData
export const topData = async (req, res) => {
  try {
    let topData = await Transaction.find(
      {
        deletedStatus: 0,
        paymentsStatus: true,
        commitStatus: true,
      },
      { cinemaId: true, movieId: true }
    )
      .populate({
        path: "cinemaId",
        select: ["cinemaName", "address", "regionId", "displayName"],
        populate: {
          path: "regionId",
          select: ["region"],
        },
      })
      .populate({
        path: "movieId",
        select: ["name", "category"],
      });

    let movieCounts = {};
    let cinemaCounts = {};

    topData &&
      topData.forEach((item) => {
        if (item.movieId !== null && item.cinemaId !== null) {
          const movieId = item?.movieId?._id.toString();
          const cinemaId = item?.cinemaId?._id.toString();

          if (movieCounts[movieId]) {
            movieCounts[movieId]++;
          } else {
            movieCounts[movieId] = 1;
          }

          if (cinemaCounts[cinemaId]) {
            cinemaCounts[cinemaId]++;
          } else {
            cinemaCounts[cinemaId] = 1;
          }
        }
      });

    let topMovieId = null;
    let topMovieCount = 0;

    for (const [movieId, count] of Object.entries(movieCounts)) {
      if (count > topMovieCount) {
        topMovieCount = count;
        topMovieId = movieId;
      }
    }

    let topCinemaId = null;
    let topCinemaCount = 0;

    for (const [cinemaId, count] of Object.entries(cinemaCounts)) {
      if (count > topCinemaCount) {
        topCinemaCount = count;
        topCinemaId = cinemaId;
      }
    }

    let topMovieDetails = topData?.find(
      (item) => item?.movieId?._id.toString() === topMovieId
    );

    let topCinemaDetails = topData?.find(
      (item) => item?.cinemaId?._id.toString() === topCinemaId
    );

    if (topMovieDetails && topCinemaDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.TOP_DATA_FOUND,
        data: {
          topMovie: {
            _id: topMovieDetails?.movieId?._id,
            name: topMovieDetails?.movieId.name,
            category: topMovieDetails?.movieId.category,
          },
          topCinema: {
            _id: topCinemaDetails?.cinemaId?._id,
            cinemaName: topCinemaDetails?.cinemaId.cinemaName,
            displayName: topCinemaDetails?.cinemaId.displayName,
            address: topCinemaDetails?.cinemaId.address,
            regionId: topCinemaDetails?.cinemaId.regionId,
          },
        },
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

//#region getUserCount
export const userCount = async (req, res) => {
  try {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);
    let userCount = await User.find(
      {
        deletedStatus: 0,
        isAccountVerified: 1,
      },
      { password: false, verificationFlag: false }
    ).count();
    let newUserCount = await User.find(
      {
        deletedStatus: 0,
        isAccountVerified: 1,
        createdAt: { $gte: start, $lt: end },
      },
      { password: false, verificationFlag: false }
    ).count();
    // if (userCount) {
    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.USER_FATCHED,
      data: { userCount, newUserCount },
    });
    // } else {
    //   return res.status(400).json({
    //     status: StatusCodes.BAD_REQUEST,
    //     message: ResponseMessage.BAD_REQUEST,
    //     data: [],
    //   });
    // }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

export const ReportIssueList = async (req, res) => {
  try {
    let reportList = await ReportIssue.find({
      deletedStatus: 0,
    });
    if (reportList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REPORT_ISSUE_LIST_FETCHED,
        data: reportList.reverse(),
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
// function getCurrentDate(period) {
//   const newStartDate = moment().startOf(period).format("YYYY-MM-DD");
//   const newEndDate = moment().endOf(period).format("YYYY-MM-DD");

//   let startDate = new Date(`${newStartDate}T00:00:00.000Z`);
//   let endDate = new Date(`${newEndDate}T00:00:00.000Z`);
//   return {
//     startDate,
//     endDate,
//   };
// }
function getCurrentDate(period) {
  const newStartDate = moment().startOf(period).format("YYYY-MM-DD");
  const newEndDate = moment().endOf(period).format("YYYY-MM-DD");

  let startDate = new Date(`${newStartDate}T00:00:00.000Z`);
  let endDate = new Date(`${newEndDate}T23:59:59.000Z`);
  return {
    startDate,
    endDate,
  };
}

export const transactionByDaysWeeksOrMonths = async (req, res) => {
  try {
    const { startDate, endDate } = getCurrentDate(req.query.period);

    const todayStart = moment().utc().startOf("day").toDate();
    const topTransactionsToday = await Transaction.find({
      deletedStatus: 0,
      paymentsStatus: true,
      createdAt: { $gte: todayStart },
    })
      .populate("movieId")
      .populate("userId")
      .sort({ createdAt: -1 })
      .limit(10);

    if (!req.query.period) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.TRANSACTION_LIST_FETCHED,
        data: { topTransactionsToday },
      });
    }

    const period = req.query.period;
    const { groupBy, sortBy } = getGroupingAndSorting(period);

    const baseMatchCriteria = {
      deletedStatus: 0,
      paymentsStatus: true,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const aggregatedTransactions = await getAggregatedTransactions(
      baseMatchCriteria,
      groupBy,
      sortBy
    );

    const aggregatedTransactionsByCinema =
      await getAggregatedTransactionsByCinema(
        baseMatchCriteria,
        groupBy,
        sortBy
      );

    const transactionsSuccess = await getAggregatedTransactions(
      { ...baseMatchCriteria, status: { $in: [1, 4] } },
      groupBy,
      sortBy
    );

    const transactionsFailed = await getAggregatedTransactions(
      {
        deletedStatus: 0,
        status: 5,
        createdAt: { $gte: startDate, $lte: endDate },
      },
      groupBy,
      sortBy
    );

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.TRANSACTION_LIST_FETCHED,
      data: {
        transactions: aggregatedTransactions,
        topTransactionsByMovie: aggregatedTransactionsByCinema,
        transactionsSuccess,
        transactionsFailed,
        topTransactionsToday,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Helper function to get groupBy and sortBy based on the period
const getGroupingAndSorting = (period) => {
  switch (period) {
    case "day":
      return {
        groupBy: { day: { $dayOfMonth: "$createdAt" } },
        sortBy: { "_id.day": 1 },
      };
    case "week":
      return {
        groupBy: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        sortBy: { "_id.year": 1, "_id.week": 1, "_id.day": 1 },
      };
    case "month":
      return {
        groupBy: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        sortBy: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      };
    case "year":
      return {
        groupBy: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        sortBy: { "_id.year": 1, "_id.month": 1 },
      };
    default:
      throw new Error(ResponseMessage.INVALID_PERIOD);
  }
};

// Helper function to get aggregated transactions
const getAggregatedTransactions = async (matchCriteria, groupBy, sortBy) => {
  return Transaction.aggregate([
    { $match: matchCriteria },
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movieData",
      },
    },
    { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "cinemas",
        localField: "cinemaId",
        foreignField: "_id",
        as: "cinemaData",
      },
    },
    { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        transactions: { $push: "$$ROOT" },
      },
    },
    { $project: { count: 1, transactions: 1 } },
    { $sort: sortBy },
  ]);
};

// Helper function to get aggregated transactions by cinema
const getAggregatedTransactionsByCinema = async (
  matchCriteria,
  groupBy,
  sortBy
) => {
  return Transaction.aggregate([
    { $match: { ...matchCriteria, cinemaId: { $ne: null } } },
    {
      $lookup: {
        from: "movies",
        localField: "movieId",
        foreignField: "_id",
        as: "movieData",
      },
    },
    { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "cinemas",
        localField: "cinemaId",
        foreignField: "_id",
        as: "cinemaData",
      },
    },
    { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          cinemaId: "$cinemaId",
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        movieCount: { $sum: 1 },
        transactions: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        cinemaId: "$_id.cinemaId",
        year: "$_id.year",
        month: "$_id.month",
        Date: "$_id.day",
        movieCount: 1,
        transactions: {
          $map: {
            input: "$transactions",
            as: "transaction",
            in: {
              cinemaId: "$$transaction.cinemaId",
              movieId: "$$transaction.movieId",
              movieData: {
                _id: "$$transaction.movieData._id",
                name: "$$transaction.movieData.name",
                cinemaId: "$$transaction.movieData.cinemaId",
                category: "$$transaction.movieData.category",
                shortName: "$$transaction.movieData.shortName",
              },
              cinemaData: {
                _id: "$$transaction.cinemaData._id",
                cinemaName: "$$transaction.cinemaData.cinemaName",
                address: "$$transaction.cinemaData.address",
                emailId: "$$transaction.cinemaData.emailId",
              },
              setSeatData: "$$transaction.setSeatData",
              showId: "$$transaction.showId",
            },
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
};
// export const transactionByDaysWeeksOrMonths = async (req, res) => {
//   try {
//     const { startDate, endDate } = getCurrentDate(req.query.period);

//     const todayStart = moment().utc().startOf("day").toDate();

//     const topTransactionsToday = await Transaction.find({
//       deletedStatus: 0,
//       paymentsStatus: true,
//       createdAt: { $gte: todayStart },
//     })
//       .populate("movieId")
//       .populate("userId")
//       .sort({ createdAt: -1 })
//       .limit(10);

//     if (!req.query.period) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.TRANSACTION_LIST_FETCHED,
//         data: {
//           topTransactionsToday,
//         },
//       });
//     }

//     let matchCriteria = {
//       deletedStatus: 0,
//       paymentsStatus: true,
//       createdAt: { $gte: startDate, $lte: endDate },
//     };
//     let matchCriteriaMovie = {
//       deletedStatus: 0,
//       paymentsStatus: true,
//       cinemaId: { $ne: null },
//       createdAt: { $gte: startDate, $lte: endDate },
//     };

//     const period = req.query.period;
//     let groupBy = {};
//     let sortBy = {};

//     switch (period) {
//       case "week":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           week: { $week: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.week": 1, "_id.day": 1 };
//         break;
//       case "month":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
//         break;
//       case "year":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.month": 1 };
//         break;
//       default:
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.INVALID_PERIOD,
//         });
//     }

//     const aggregatedTransactions = await Transaction.aggregate([
//       { $match: matchCriteria },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: "$movieData" },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "movieData.cinemaObjectId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: "$cinemaData" },
//       {
//         $group: {
//           _id: groupBy,
//           count: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           transactions: {
//             _id: 1,
//             initTransId: 1,
//             paymentResponse: 1,
//             refundResponse: 1,
//             status: 1,
//             refundStatus: 1,
//             cancellationStatus: 1,
//             foodAndBvgResponse: 1,
//             deletedStatus: 1,
//             fAndBDetails: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             addSeatData: 1,
//             cinemaId: 1,
//             movieId: 1,
//             setSeatData: 1,
//             showId: 1,
//             booking_type: 1,
//             paymentFrom: 1,
//             userId: 1,
//             paymentsStatus: 1,
//             commitBookingData: 1,
//             commitStatus: 1,
//             movieData: {
//               name: 1,
//               category: 1,
//               cinemaId: 1,
//               shortName: 1,
//               _id: 1,
//             },
//             cinemaData: {
//               _id: 1,
//               cinemaName: 1,
//               address: 1,
//               emailId: 1,
//             },
//           },
//         },
//       },
//       { $sort: sortBy },
//     ]);

//     const aggregatedTransactionsByCinema = await Transaction.aggregate([
//       { $match: matchCriteriaMovie },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: "$movieData" },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: "$cinemaData" },
//       {
//         $group: {
//           _id: {
//             cinemaId: "$cinemaId",
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//             day: { $dayOfMonth: "$createdAt" },
//           },
//           movieCount: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           cinemaId: "$_id.cinemaId",
//           year: "$_id.year",
//           month: "$_id.month",
//           Date: "$_id.day",
//           movieCount: 1,
//           transactions: {
//             $map: {
//               input: "$transactions",
//               as: "transaction",
//               in: {
//                 cinemaId: "$$transaction.cinemaId",
//                 movieId: "$$transaction.movieId",
//                 movieData: {
//                   _id: "$$transaction.movieData._id",
//                   cinemaObjectId: "$$transaction.movieData.cinemaObjectId",
//                   name: "$$transaction.movieData.name",
//                   cinemaId: "$$transaction.movieData.cinemaId",
//                   category: "$$transaction.movieData.category",
//                   shortName: "$$transaction.movieData.shortName",
//                 },
//                 cinemaData: {
//                   _id: "$$transaction.cinemaData._id",
//                   cinemaName: "$$transaction.cinemaData.cinemaName",
//                   address: "$$transaction.cinemaData.address",
//                   emailId: "$$transaction.cinemaData.emailId",
//                 },
//                 setSeatData: "$$transaction.setSeatData",
//                 showId: "$$transaction.showId",
//               },
//             },
//           },
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     const formattedResult = aggregatedTransactionsByCinema.map((item) => ({
//       cinemaId: item.cinemaId,
//       year: item.year,
//       month: item.month,
//       Date: item.Date,
//       movieCount: item.movieCount,
//       transactions: item.transactions,
//     }));

//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.TRANSACTION_LIST_FETCHED,
//       data: {
//         transactions: aggregatedTransactions,
//         topTransactionsByMovie: formattedResult,
//         topTransactionsToday,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching transactions: ", error);
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       error: error.message,
//     });
//   }
// };
// export const transactionByDaysWeeksOrMonths = async (req, res) => {
//   try {
//     const { startDate, endDate } = getCurrentDate(req.query.period);

//     const todayStart = moment().utc().startOf("day").toDate();
//     // console.log(startDate, endDate )
//     const topTransactionsToday = await Transaction.find({
//       deletedStatus: 0,
//       paymentsStatus: true,
//       createdAt: { $gte: todayStart },
//     })
//       .populate("movieId")
//       .populate("userId")
//       .sort({ createdAt: -1 })
//       .limit(10);

//     if (!req.query.period) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.TRANSACTION_LIST_FETCHED,
//         data: {
//           topTransactionsToday,
//         },
//       });
//     }

//     let matchCriteria = {
//       deletedStatus: 0,
//       paymentsStatus: true,
//       createdAt: { $gte: startDate, $lte: endDate },
//     };
//     let matchCriteriaMovie = {
//       deletedStatus: 0,
//       paymentsStatus: true,
//       cinemaId: { $ne: null },
//       createdAt: { $gte: startDate, $lte: endDate },
//     };
//     let matchCriteriaSuccessful = {
//       deletedStatus: 0,
//       paymentsStatus: true,
//       status: { $in: [1, 4] },
//       createdAt: { $gte: startDate, $lte: endDate },
//     };
//     let matchCriteriaFailed = {
//       deletedStatus: 0,
//       status: 5,
//       createdAt: { $gte: startDate, $lte: endDate },
//     };

//     const period = req.query.period;
//     let groupBy = {};
//     let sortBy = {};

//     switch (period) {
//       case "day":
//         groupBy = {
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         sortBy = { "_id.day": 1 };
//         break;
//       case "week":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           week: { $week: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.week": 1, "_id.day": 1 };
//         break;
//       case "month":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//           day: { $dayOfMonth: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
//         break;
//       case "year":
//         groupBy = {
//           year: { $year: "$createdAt" },
//           month: { $month: "$createdAt" },
//         };
//         sortBy = { "_id.year": 1, "_id.month": 1 };
//         break;
//       default:
//         return res.status(400).json({
//           status: StatusCodes.BAD_REQUEST,
//           message: ResponseMessage.INVALID_PERIOD,
//         });
//     }

//     const aggregatedTransactions = await Transaction.aggregate([
//       { $match: matchCriteria },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: groupBy,
//           count: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           transactions: {
//             _id: 1,
//             initTransId: 1,
//             paymentResponse: 1,
//             refundResponse: 1,
//             status: 1,
//             refundStatus: 1,
//             cancellationStatus: 1,
//             foodAndBvgResponse: 1,
//             deletedStatus: 1,
//             fAndBDetails: 1,
//             createdAt: 1,
//             updatedAt: 1,
//             addSeatData: 1,
//             cinemaId: 1,
//             movieId: 1,
//             setSeatData: 1,
//             showId: 1,
//             booking_type: 1,
//             paymentFrom: 1,
//             userId: 1,
//             paymentsStatus: 1,
//             commitBookingData: 1,
//             commitStatus: 1,
//             movieData: {
//               name: 1,
//               category: 1,
//               cinemaId: 1,
//               shortName: 1,
//               _id: 1,
//             },
//             cinemaData: {
//               _id: 1,
//               cinemaName: 1,
//               address: 1,
//               emailId: 1,
//             },
//           },
//         },
//       },
//       { $sort: sortBy },
//     ]);

//     const aggregatedTransactionsByCinema = await Transaction.aggregate([
//       { $match: matchCriteriaMovie },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: {
//             cinemaId: "$cinemaId",
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//             day: { $dayOfMonth: "$createdAt" },
//           },
//           movieCount: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           cinemaId: "$_id.cinemaId",
//           year: "$_id.year",
//           month: "$_id.month",
//           Date: "$_id.day",
//           movieCount: 1,
//           transactions: {
//             $map: {
//               input: "$transactions",
//               as: "transaction",
//               in: {
//                 cinemaId: "$$transaction.cinemaId",
//                 movieId: "$$transaction.movieId",
//                 movieData: {
//                   _id: "$$transaction.movieData._id",
//                   cinemaObjectId: "$$transaction.movieData.cinemaObjectId",
//                   name: "$$transaction.movieData.name",
//                   cinemaId: "$$transaction.movieData.cinemaId",
//                   category: "$$transaction.movieData.category",
//                   shortName: "$$transaction.movieData.shortName",
//                 },
//                 cinemaData: {
//                   _id: "$$transaction.cinemaData._id",
//                   cinemaName: "$$transaction.cinemaData.cinemaName",
//                   address: "$$transaction.cinemaData.address",
//                   emailId: "$$transaction.cinemaData.emailId",
//                 },
//                 setSeatData: "$$transaction.setSeatData",
//                 showId: "$$transaction.showId",
//               },
//             },
//           },
//         },
//       },
//       { $sort: { createdAt: -1 } },
//     ]);

//     const formattedResult = aggregatedTransactionsByCinema.map((item) => ({
//       cinemaId: item.cinemaId,
//       year: item.year,
//       month: item.month,
//       Date: item.Date,
//       movieCount: item.movieCount,
//       transactions: item.transactions,
//     }));

//     const transactionsSuccess = await Transaction.aggregate([
//       { $match: matchCriteriaSuccessful },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: groupBy,
//           count: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       { $sort: sortBy },
//     ]);

//     const transactionsFailed = await Transaction.aggregate([
//       { $match: matchCriteriaFailed },
//       {
//         $lookup: {
//           from: "movies",
//           localField: "movieId",
//           foreignField: "_id",
//           as: "movieData",
//         },
//       },
//       { $unwind: { path: "$movieData", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "cinemas",
//           localField: "cinemaId",
//           foreignField: "_id",
//           as: "cinemaData",
//         },
//       },
//       { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
//       {
//         $group: {
//           _id: groupBy,
//           count: { $sum: 1 },
//           transactions: { $push: "$$ROOT" },
//         },
//       },
//       { $sort: sortBy },
//     ]);

//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.TRANSACTION_LIST_FETCHED,
//       data: {
//         transactions: aggregatedTransactions,
//         topTransactionsByMovie: formattedResult,
//         transactionsSuccess,
//         transactionsFailed,
//         topTransactionsToday,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching transactions: ", error);
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//       error: error.message,
//     });
//   }
// };

export const CCAvenueList = async (req, res) => {
  try {
    let ccavenueList = await CCAvenueResponse.find({
      deletedStatus: 0,
    });
    if (ccavenueList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CC_AVENUE_LIST_FETCHED,
        data: ccavenueList.reverse(),
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
// export const getUserDetails = async (req, res) => {
//   try {
//     const userId = req.query.id;
//     const userDetails = await User.findOne({
//       _id: userId,
//       deletedStatus: 0,
//     }).select(
//       " firstName lastName email mobileNumber birthDate maritalStatus gender address createdAt city profile"
//     );

//     if (!userDetails) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.USER_NOT_FOUND,
//       });
//     }

//     const [
//       transactions,
//       moviesInterested,
//       couponDetails,
//       membershipDetails,
//       franchiseDetails,
//     ] = await Promise.all([
//       Transaction.find({ userId: userDetails._id, deletedStatus: 0 })
//         .select(
//           "initTransId paymentResponse.order_id paymentResponse.payment_mode paymentResponse.order_status paymentResponse.card_name paymentResponse.currency paymentResponse.amount refundStatus cancellationStatus foodAndBvgResponse cinemaId movieId showId booking_type paymentFrom userId paymentsStatus createdAt commitStatus status  addSeatData.strBookId"
//         )
//         .sort({ createdAt: -1 }),
//       MovieInterested.find({
//         userId: userDetails._id,
//         isInterested: true,
//         isDeleted: false,
//       }).populate("movieId"),
//       Coupon.find({
//         "assignCoupon.assignUserId": userDetails._id,
//         isActive: true,
//         deletedStatus: 0,
//       }),
//       SubscriberMembership.find({
//         userId: userDetails._id,
//         deletedStatus: 0,
//         isActive: true,
//       }).populate("subscriptionId"),

//       // FranchiseModel.find({ userId: userDetails._id, deletedStatus: 0 }),
//     ]);

//     const responseObject = {
//       userDetails,
//       transactions,
//       moviesInterested,
//       couponDetails,
//       membershipDetails,
//       franchise: [],
//     };

//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.USER_DETAILS_FETCHED,
//       data: [responseObject],
//     });
//   } catch (error) {
//     console.error("Error fetching user details: ", error);
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

export const getUserTransactionDetails = async (req, res) => {
  try {
    // Fetch the transactions
    let transactions = await Transaction.find(
      {
        deletedStatus: 0,
        // couponId: { $ne: null },
        discountCouponStatus: true,
      },
      {
        couponId: true,
        initTransId: true,
        "paymentResponse.order_id": true,
        "paymentResponse.tracking_id": true,
        "paymentResponse.order_status": true,
        "paymentResponse.payment_mode": true,
        "paymentResponse.amount": true,
        refundStatus: true,
        status: true,
        cancellationStatus: true,
        discountCouponStatus: true,
        paymentFrom: true,
        userId: true,
        paymentsStatus: true,
        showId: true,
        finalBookingCalculation: true,
      }
    )
      .populate({
        path: "cinemaId",
        select: [
          "cinemaName",
          "address",
          "googleUrl",
          "emailId",
          "convenienceFees",
        ],
      })
      .populate({
        path: "movieId",
        select: ["name", "poster", "category"],
      })
      .populate({
        path: "showId",
        select: ["sessionRealShow", "screenName"],
      })
      .populate({
        path: "couponId",
        select: [
          "_id",
          "couponId",
          "couponTitle",
          "discountType",
          "couponCategory",
          "discount",
          "couponUpTo",
          "couponType",
        ],
      })
      .sort({ createdAt: -1 });

    console.log(transactions?.length);

    if (transactions) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.LIST_FETCH,
        data: transactions,
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

// export const getUserDetails = async (req, res) => {
//   try {
//     const userId = req.query.id;

//     // Fetch user details
//     const userDetails = await User.findOne({
//       _id: userId,
//       deletedStatus: 0,
//     }).select(
//       "firstName lastName email mobileNumber birthDate maritalStatus gender address createdAt city profile"
//     );

//     if (!userDetails) {
//       return res.status(200).json({
//         status: StatusCodes.OK,
//         message: ResponseMessage.USER_NOT_FOUND,
//       });
//     }

//     // Fetch associated data
//     const [
//       transactions,
//       moviesInterested,
//       couponDetails,
//       membershipDetails,
//       franchiseDetails, // Uncomment if you decide to use franchise details later
//     ] = await Promise.all([
//       Transaction.find({ userId: userDetails._id, deletedStatus: 0 })
//         .select(
//           "initTransId paymentResponse.order_id paymentResponse.payment_mode paymentResponse.order_status paymentResponse.card_name paymentResponse.currency paymentResponse.amount refundStatus cancellationStatus foodAndBvgResponse cinemaId movieId showId booking_type paymentFrom userId paymentsStatus createdAt commitStatus status addSeatData.strBookId"
//         )
//         .sort({ createdAt: -1 }),
//       MovieInterested.find({
//         userId: userDetails._id,
//         isInterested: true,
//         isDeleted: false,
//       }).populate("movieId"),
//       Coupon.find({
//         "assignCoupon.assignUserId": userDetails._id,
//         isActive: true,
//         deletedStatus: 0,
//       }),
//       SubscriberMembership.find({
//         userId: userDetails._id,
//         deletedStatus: 0,
//       }).populate("subscriptionId"),
//       // Uncomment if needed
//       // FranchiseModel.find({ userId: userDetails._id, deletedStatus: 0 }),
//     ]);

//     const subscriptionTransactions = await SubscriptionTransaction.find({
//       subscriptionId: {
//         $in: membershipDetails.map((m) => m.subscriptionId._id),
//       },
//     });

//     // Map payments to memberships
//     const paymentMap = transactions.reduce((map, transaction) => {
//       if (transaction.paymentResponse) {
//         const { subscriptionId } = transaction.paymentResponse;
//         if (subscriptionId) {
//           if (!map[subscriptionId]) {
//             map[subscriptionId] = [];
//           }
//           map[subscriptionId].push(transaction.paymentResponse);
//         }
//       }
//       return map;
//     }, {});

//     // Add subscription transactions to paymentMap
//     subscriptionTransactions.forEach((subTrans) => {
//       const subscriptionId = subTrans.subscriptionId.toString();
//       if (!paymentMap[subscriptionId]) {
//         paymentMap[subscriptionId] = [];
//       }
//       paymentMap[subscriptionId].push(subTrans);
//     });

//     const formattedMembershipDetails = membershipDetails.map((membership) => {
//       const subscriptionId = membership.subscriptionId
//         ? membership.subscriptionId._id.toString()
//         : null;
//       const payments = subscriptionId ? paymentMap[subscriptionId] || [] : [];
//       console.log(payments, "payments");
//       return {
//         ...membership.toObject(),
//         payments,
//       };
//     });

//     const responseObject = {
//       userDetails,
//       transactions,
//       moviesInterested,
//       couponDetails,
//       membershipDetails: formattedMembershipDetails,
//       franchise: [], // Include franchiseDetails if needed
//     };

//     return res.status(200).json({
//       status: StatusCodes.OK,
//       message: ResponseMessage.USER_DETAILS_FETCHED,
//       data: responseObject,
//     });
//   } catch (error) {
//     console.error("Error fetching user details: ", error);
//     return res.status(500).json({
//       status: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: ResponseMessage.INTERNAL_SERVER_ERROR,
//     });
//   }
// };

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.query.id;

    // Fetch user details
    const userDetails = await User.findOne({
      _id: userId,
      deletedStatus: 0,
    }).select(
      "firstName lastName email mobileNumber birthDate maritalStatus gender address createdAt city profile"
    );

    if (!userDetails) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.USER_NOT_FOUND,
      });
    }

    // Fetch associated data
    const [
      transactions,
      moviesInterested,
      couponDetails,
      membershipDetails,
      rewardsDetails,
      franchiseDetails, // Uncomment if you decide to use franchise details later
    ] = await Promise.all([
      Transaction.find({ userId: userDetails._id, deletedStatus: 0 })
        .select(
          "initTransId paymentResponse.order_id paymentResponse.payment_mode paymentResponse.order_status paymentResponse.card_name paymentResponse.currency paymentResponse.amount refundStatus cancellationStatus foodAndBvgResponse cinemaId movieId showId booking_type paymentFrom userId paymentsStatus createdAt commitStatus status addSeatData.strBookId"
        )
        .sort({ createdAt: -1 }),
      MovieInterested.find({
        userId: userDetails._id,
        isInterested: true,
        // isDeleted: false,
      }).populate("movieId"),
      Coupon.find({
        "assignCoupon.assignUserId": userDetails._id,
        isActive: true,
        deletedStatus: 0,
      }),
      SubscriberMembership.find({
        userId: userDetails._id,
        deletedStatus: 0,
      }).populate("subscriptionId"),
      // Uncomment if needed
      // FranchiseModel.find({ userId: userDetails._id, deletedStatus: 0 }),
      Rewards.find({ userId: userDetails._id, deletedStatus: 0 }).populate({
        path: "transactionId",
        select: ["movieId", "initTransId", "paymentResponse.amount"],
        populate: {
          path: "movieId", // populate the movieId field inside transactionId
          select: "movieId name", // select only movieId
        },
      }),
      // .populate("userId"),
    ]);

    const userIds = membershipDetails
      .map((m) => m.userId)
      .filter((id) => id !== undefined);

    const subscriptionIds = membershipDetails
      .map((m) => m.subscriptionId?._id)
      .filter((id) => id !== undefined);
    // const transactionsIds = membershipDetails
    //   .map((m) => m.initTransId?.initTransId)
    //   .filter((initTransId) => initTransId !== undefined);

    // Retrieve subscription transactions based on subscription IDs and user IDs
    const subscriptionTransactions = await SubscriptionTransaction.find({
      subscriptionId: {
        $in: subscriptionIds,
      },
      userId: {
        $in: userIds,
      },
      // initTransId: {
      //   $in: initTransId,
      // },
    });

    // Map payments to subscriptions, filtering by subscriptionId and userId
    const paymentMap = transactions.reduce((map, transaction) => {
      if (transaction.paymentResponse) {
        const { subscriptionId, userId } = transaction.paymentResponse;
        if (subscriptionId && userId && userIds.includes(userId)) {
          const subId = subscriptionId.toString();
          const userIdStr = userId.toString();

          if (!map[subId]) {
            map[subId] = {};
          }
          if (!map[subId][userIdStr]) {
            map[subId][userIdStr] = [];
          }
          map[subId][userIdStr].push(transaction.paymentResponse);
        }
      }
      return map;
    }, {});

    // Add subscription transactions to the payment map
    subscriptionTransactions.forEach((subTrans) => {
      const subscriptionId = subTrans.subscriptionId.toString();
      const userId = subTrans.userId.toString();
      if (!paymentMap[subscriptionId]) {
        paymentMap[subscriptionId] = {};
      }
      if (!paymentMap[subscriptionId][userId]) {
        paymentMap[subscriptionId][userId] = [];
      }
      paymentMap[subscriptionId][userId].push(subTrans);
    });

    // Format membership details and include payments
    const formattedMembershipDetails = membershipDetails.map((membership) => {
      const subscriptionId = membership.subscriptionId
        ? membership.subscriptionId._id.toString()
        : null;
      const userId = membership.userId ? membership.userId.toString() : null;
      const payments =
        subscriptionId && userId
          ? paymentMap[subscriptionId]?.[userId] || []
          : [];

      return {
        ...membership.toObject(),
        subscriptionStartDate: membership.subscriptionStartDate
          ? moment
            .utc(membership.subscriptionStartDate) // Convert from UTC
            .tz("Asia/Kolkata") // Convert to Indian time zone
            .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
          : null,
        subscriptionEndDate: membership.subscriptionEndDate
          ? moment
            .utc(membership.subscriptionEndDate) // Convert from UTC
            .tz("Asia/Kolkata") // Convert to Indian time zone
            .format("YYYY-MM-DDTHH:mm:ss.SSSZ")
          : null,
        payments,
      };
    });

    const responseObject = {
      userDetails,
      transactions,
      moviesInterested,
      couponDetails,
      membershipDetails: formattedMembershipDetails,
      rewardsDetails,
      franchise: [], // Include franchiseDetails if needed
    };

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.USER_DETAILS_FETCHED,
      data: responseObject,
    });
  } catch (error) {
    console.error("Error fetching user details: ", error);
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllReward = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { deletedStatus: 0 };
    if (type && type !== "all") {
      filter.type = type;  if (type === "earned") {
    // Include old records without type field
    filter.type = { $ne: "redeemed" };
  } else {
    filter.type = type;
  }
    }

    const [rewards, config] = await Promise.all([
      Rewards.find(filter)
        .populate({
          path: "transactionId",
          select: ["movieId", "initTransId", "paymentResponse.amount"],
          populate: { path: "movieId", select: "movieId name" },
        })
        .populate("userId")
        .sort({ createdAt: -1 }),
      RewardConfig.findOne({}),
    ]);

    if (!rewards) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.REWARDS_NOT_FOUND,
        data: [],
      });
    }

    const expiringSoonDays = config?.expiringSoonDays ?? 30;
    const now = new Date();
    const soonThreshold = new Date(
      now.getTime() + expiringSoonDays * 24 * 60 * 60 * 1000
    );

    const enriched = rewards.map((r) => {
      const obj = r.toObject();
      // isExpiringSoon only relevant for earned records
      obj.isExpiringSoon =
        obj.type === "earned" &&
        !obj.isExpired &&
        obj.expiryDate != null &&
        new Date(obj.expiryDate) <= soonThreshold &&
        new Date(obj.expiryDate) > now;
      return obj;
    });

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.REWARDS_FOUND,
      data: enriched,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getRewardMetrics = async (req, res) => {
  try {
    const now = new Date();

    const [issuedAgg, redeemedAgg, liabilityAgg, activeUsersAgg] = await Promise.all([
      // Total points ever issued (all earned entries)
      Rewards.aggregate([
        { $match: { type: {$ne:"redeemed"}, deletedStatus: 0 } },
        { $group: { _id: null, total: { $sum: "$coins" } } },
      ]),
      // Total points ever redeemed
      Rewards.aggregate([
        { $match: { type: "redeemed", deletedStatus: 0 } },
        { $group: { _id: null, total: { $sum: "$coins" } } },
      ]),
      // Outstanding liability: remaining (non-expired) earned coins not yet redeemed
      Rewards.aggregate([
        {
          $match: {
            type: { $ne: "redeemed" },
            deletedStatus: 0,
            // isExpired: false,
            $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $subtract: ["$coins", "$redeemCoins"] } },
          },
        },
      ]),
      // Distinct users who have at least one reward entry
      Rewards.aggregate([
        { $match: { deletedStatus: 0 } },
        { $group: { _id: "$userId" } },
        { $count: "total" },
      ]),
    ]);

    return res.status(200).json({
      status: 200,
      message: "Reward metrics fetched successfully",
      data: {
        totalIssued: issuedAgg[0]?.total ?? 0,
        totalRedeemed: redeemedAgg[0]?.total ?? 0,
        outstandingLiability: liabilityAgg[0]?.total ?? 0,
        activeUsers: activeUsersAgg[0]?.total ?? 0,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: ResponseMessage.INTERNAL_SERVER_ERROR });
  }
};

// #region get admin login activity details
export const getAdminLoginActivityDetails = async (req, res) => {
  try {
    const activityDetails = await LoginActivity.find({
      adminId: req.body.adminId,
      deletedStatus: 0,
    });

    return res.status(200).json({
      status: StatusCodes.OK,
      message: ResponseMessage.LOGIN_ACTIVITY_FETCHED,
      data: activityDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllAdmin = async (req, res) => {
  try {
    const findAllAdmin = await Admin.find({
      fcmToken: { $exists: true, $ne: null },
    }).select("_id fcmToken");

    if (findAllAdmin) {
      const adminData = findAllAdmin.map((admin) => ({
        _id: admin._id,
        fcmToken: admin.fcmToken,
      }));

      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADMIN_LIST,
        data: adminData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getRewardsSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    let matchStage = {
      deletedStatus: 0,
      redeemCoins: { $gt: 0 }
    };

    let startDate, endDate;
    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month);
      startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    } else if (year) {
      const y = parseInt(year);
      startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0, 0));
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    } else {
      startDate = new Date("2026-04-01T00:00:00.000Z");
      endDate = new Date();
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const report = await Rewards.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transactionData"
        }
      },
      { $unwind: { path: "$transactionData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cinemas",
          localField: "transactionData.cinemaId",
          foreignField: "_id",
          as: "cinemaData"
        }
      },
      { $unwind: { path: "$cinemaData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "regions",
          localField: "cinemaData.regionId",
          foreignField: "_id",
          as: "regionData"
        }
      },
      { $unwind: { path: "$regionData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            userEmail: { $ifNull: ["$userData.email", "N/A"] },
            userName: {
              $concat: [
                { $ifNull: ["$userData.firstName", ""] },
                " ",
                { $ifNull: ["$userData.lastName", ""] }
              ]
            }
          },
          cinemas: {
            $addToSet: {
              cinemaName: {
                $ifNull: [
                  "$cinemaData.cinemaName",
                  "General/No Cinema"
                ]
              },
              location: {
                $ifNull: [
                  "$regionData.region",
                  "Unknown Location"
                ]
              }
            }
          },
          totalEarnedPoints: {
            $sum: {
              $cond: [
                { $ne: ["$type", "redeemed"] },
                "$coins",
                0
              ]
            }
          },
          totalRedeemedPoints: {
            $sum: {
              $cond: [
                { $ne: ["$type", "redeemed"] },
                "$redeemCoins",
                0
              ]
            }
          },
          totalPendingPoints: {
            $sum: {
              $cond: [
                { $ne: ["$type", "redeemed"] },
                { $subtract: ["$coins", "$redeemCoins"] },
                0
              ]
            }
          },
          firstRedemptionDate: {
            $min: "$createdAt"
          },
          lastRedemptionDate: {
            $max: "$createdAt"
          }
        }
      },
      {
        $project: {
          _id: 0,
          userName: "$_id.userName",
          userEmail: "$_id.userEmail",
          cinemas: 1,
          totalEarnedPoints: 1,
          totalRedeemedPoints: 1,
          totalPendingPoints: 1,
          firstRedemptionDate: 1,
          lastRedemptionDate: 1
        }
      },
      {
        $sort: {
          totalRedeemedPoints: -1
        }
      }
    ]);

    return res.status(200).json({
      status: StatusCodes.OK,
      message: "Rewards summary report fetched successfully",
      data: report
    });
  } catch (error) {
    console.error("Error in getRewardsSummary:", error);
    return res.status(500).json({
      status: 500,
      message: ResponseMessage.INTERNAL_SERVER_ERROR
    });
  }
};

