import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../../utils/ResponseMessage.js";
import MemberShip1 from "../../models/MemberShip1.js";
import cacheHelper from "../../utils/cacheHelper.js";
import cacheKeys from "../../utils/cacheKeys.js";

//# Add edit membership api
export const AddEditMemberShip = async (req, res) => {
  try {
    let { title, description, id } = req.body;
    cacheHelper.deleteCache(cacheKeys.membershipData);

    if (id) {
      let findMemberShip = await MemberShip1.findOne({
        _id: id,
        deletedStatus: 0,
      });
      if (!findMemberShip) {
        return res.status(400).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
          data: [],
        });
      } else {
        let updateMemberShip = await MemberShip1.findOneAndUpdate(
          {
            _id: findMemberShip._id,
            deletedStatus: 0,
          },
          {
            $set: {
              title: title,
              description,
              file: req.fileUrl ? req.fileUrl : findMemberShip.file,
            },
          },
          {
            new: true,
          }
        );

        if (updateMemberShip) {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.MEMBERSHIP_UPDATED,
            data: updateMemberShip,
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
      let addMemberShipDetails = await MemberShip1.create({
        title: req.body.title,
        description: req.body.description,
        file: req.fileUrl,
        isActive: true,
        deletedStatus: 0,
      });

      let addNewMemberShip = await addMemberShipDetails.save();

      if (addNewMemberShip) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MEMBERSHIP_ADDED,
          data: addNewMemberShip,
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
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};

//# Get all membership api
export const getLoyalityMemberShipDetails = async (req, res) => {
  try {
    let getMemberShipList = await MemberShip1.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (getMemberShipList) {
      cacheHelper.setCache(cacheKeys.membershipData,getMemberShipList)
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.MEMBERSHIP_DETAILS,
        data: getMemberShipList,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.MEMBERSHIP_NOT_FOUND,
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

//# Delete Membership api

export const deleteMemberShip = async (req, res) => {
  try {
    let { id } = req.body;
    let findMemberShip = await MemberShip1.findOne({
      _id: id,
      deletedStatus: 0,
    });

    if (findMemberShip) {
      let deleteMemberShip = await MemberShip1.findOneAndUpdate(
        {
          _id: findMemberShip._id,
          deletedStatus: 0,
        },
        {
          $set: {
            deletedStatus: 1,
          },
        },
        {
          new: true,
        }
      );
      if (deleteMemberShip) {
        cacheHelper.deleteCache(cacheKeys.membershipData);
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.MEMBERSHIP_DELETED,
          data: deleteMemberShip,
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
    return res.status(500).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ResponseMessage.INTERNAL_SERVER_ERROR,
      data: [error.message],
    });
  }
};
