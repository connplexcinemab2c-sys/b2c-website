import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../utils/ResponseMessage.js";
import { Admin } from "../models/Admin.js";

export const auth = async (req, res, next) => {
  const token = req.header("auth");
  if (!token) {
    res.status(401).json({
      status: 401,
      message: ResponseMessage.TOKEN_NOT_AUTHORIZED,
      data: [],
    });
  } else {
    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
     
      if (decode.userId) {
        req.user = decode.userId;
        
        next();
      } else if (decode.admin) {
        const validAdmin = await Admin.findOne({
          _id: decode.admin.id,
          deletedStatus: 0,
        });
       
        if (validAdmin) {
          req.admin = decode.admin.id; 
          req.adminRole = validAdmin.roleId.toString();      
          req.adminType = validAdmin.type     
          next();
        } else {
          res.status(400).json({
            status: 400,
            message: ResponseMessage.TOKEN_NOT_VALID,
            data: [],
          });
        }
      } else {
        res.status(400).json({
          status: 400,
          message: ResponseMessage.TOKEN_NOT_VALID,
          data: [],
        });
      }
      // next();
    } catch (err) {
      console.log(err, "errAuth");
      if (err.name == "TokenExpiredError") {
        return res.status(401).json({
          status: StatusCodes.UNAUTHORIZED,
          message: ResponseMessage.TOKEN_EXPIRED,
          message: err.message,
        });
      } else {
        return res.status(500).json({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ResponseMessage.INTERNAL_SERVER_ERROR,
          message: err.message,
        });
      }
    }
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const isAdmin = await Admin.findOne({ _id: req.admin, deletedStatus: 0 });
    if (!isAdmin) {
      return res.status(401).json({
        status: 401,
        message: ResponseMessage.TOKEN_NOT_VALID,
        data: [],
      });
    }
    req.admin = isAdmin;
    next();
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: ResponseMessage.TOKEN_NOT_VALID,
      data: [],
    });
  }
};


