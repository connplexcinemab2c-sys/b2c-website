import { StatusCodes } from "http-status-codes";
import FeedBack from "../../models/FeedBack.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { handleErrorResponse } from "../../services/CommanService.js";
import Advertisement from "../../models/Advertisement.js";
import Career from "../../models/Career.js";
//#region List feed backs
export const feedBacks = async (req, res) => {
  try {
    const feedBacks = await FeedBack.find({
      deletedStatus: 0,
    })
      .populate([{ path: "cinemaId", select: "cinemaId cinemaName" }])
      .sort({ createdAt: -1 });
    if (!feedBacks.length) {
      return res.status(200).json({
        status: StatusCodes.Ok,
        message: ResponseMessage.FEED_BACK_LIST_NOT_FOUND,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.FEED_BACK_LIST,
        data: feedBacks,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region List advertisement
export const advertisementList = async (req, res) => {
  try {
    const advertisementList = await Advertisement.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });
    if (!advertisementList.length) {
      return res.status(200).json({
        status: StatusCodes.Ok,
        message: ResponseMessage.ADVERTISEMENT_LIST_NOT_FOUND,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ADVERTISEMENT_LIST,
        data: advertisementList,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

//#region List careers
export const careerList = async (req, res) => {
  try {
    const careerList = await Career.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });
    if (!careerList.length) {
      return res.status(200).json({
        status: StatusCodes.Ok,
        message: ResponseMessage.CAREER_LIST_NOT_FOUND,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CAREER_LIST,
        data: careerList,
      });
    }
  } catch (error) {
    return handleErrorResponse(res, error);
  }
};
//#endregion

export const AddEditAdvertiseWIthUs = async (req, res) => {
  try {
    let { title, description, id } = req.body;
    if (id) {
      let findAdvertiseWithUs = await Advertisement.findOne({
        _id: id,
        deletedStatus: 0,
      });
      if (!findAdvertiseWithUs) {
        return res.status(400).json({
          status: StatusCodes.OK,
          message: ResponseMessage.CONTACT_US_NOT_FOUND,
          data: [],
        });
      } else {
        let updateAdvertiseWithUs = await Advertisement.findOneAndUpdate(
          {
            _id: findAdvertiseWithUs._id,
            deletedStatus: 0,
          },
          {
            $set: {
              title: title,
              description,
              file: req.advertiseWithUsUrl
                ? req.advertiseWithUsUrl
                : findAdvertiseWithUs.file,
              filebg: req.advertiseBgUrl
                ? req.advertiseBgUrl
                : findAdvertiseWithUs.filebg,
            },
          },
          {
            new: true,
          }
        );

        if (updateAdvertiseWithUs) {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CONTACT_US_UPDATED,
            data: updateAdvertiseWithUs,
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
      let addAdvertiseWithUsDetails = await Advertisement.create({
        title: req.body.title,
        description: req.body.description,
        file: req.advertiseWithUsUrl,
        filebg: req.advertiseBgUrl,
        isActive: true,
        deletedStatus: 0,
      });
      let addNewAdvertiseWithUs = await addAdvertiseWithUsDetails.save();

      if (addNewAdvertiseWithUs) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.ADVERTISE_ADDED,
          data: addNewAdvertiseWithUs,
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
export const getAdvertiseWithUsDetails = async (req, res) => {
  try {
    let getContactUsList = await Advertisement.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (getContactUsList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CONTACT_US_DETAILS,
        data: getContactUsList,
      });
    } else {
      return res.status(404).json({
        status: StatusCodes.NOT_FOUND,
        message: ResponseMessage.CONTACT_US_NOT_FOUND,
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

export const deleteAdvertiseWitUs = async (req, res) => {
  try {
    let { id } = req.body;
    let findAdvertiseWithUs = await Advertisement.findOne({
      _id: id,
      deletedStatus: 0,
    });

    if (findAdvertiseWithUs) {
      let deleteAdvertiseWIthUs = await Advertisement.findOneAndUpdate(
        {
          _id: findAdvertiseWithUs._id,
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
      if (deleteAdvertiseWIthUs) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.ADVERTISE_DELETED,
          data: deleteAdvertiseWIthUs,
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

export const AddEditCareerWithUs = async (req, res) => {
  try {
    let { title, description, id } = req.body;
    if (id) {
      let findCareerWithUs = await Career.findOne({
        _id: id,
        deletedStatus: 0,
      });
      if (!findCareerWithUs) {
        return res.status(400).json({
          status: StatusCodes.OK,
          message: ResponseMessage.CAREER_NOT_FOUND,
          data: [],
        });
      } else {
        let updateCareerWithUs = await Career.findOneAndUpdate(
          {
            _id: findCareerWithUs._id,
            deletedStatus: 0,
          },
          {
            $set: {
              title: title,
              description,
              file: req.careerWithUsUrl
                ? req.careerWithUsUrl
                : findCareerWithUs.file,
              filebg: req.careerWithUsBgUrl
                ? req.careerWithUsBgUrl
                : findCareerWithUs.filebg,
            },
          },
          {
            new: true,
          }
        );

        if (updateCareerWithUs) {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.CAREER_US_UPDATED,
            data: updateCareerWithUs,
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
      let addCareerWithUsDetails = await Career.create({
        title: req.body.title,
        description: req.body.description,
        file: req.careerWithUsUrl,
        filebg: req.careerWithUsBgUrl,
        isActive: true,
        deletedStatus: 0,
      });
      let addNewCareerWithUsDetails = await addCareerWithUsDetails.save();

      if (addNewCareerWithUsDetails) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.CAREER_US_ADDED,
          data: addNewCareerWithUsDetails,
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
export const getCareerWithUsDetails = async (req, res) => {
  try {
    let getCareerWithUsList = await Career.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });

    if (getCareerWithUsList) {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.CONTACT_US_DETAILS,
        data: getCareerWithUsList,
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

//# Delete Membership api

export const deleteCareerWitUs = async (req, res) => {
  try {
    let { id } = req.body;
    let findCareerWitUs = await Career.findOne({
      _id: id,
      deletedStatus: 0,
    });

    if (findCareerWitUs) {
      let deleteCareerWitUs = await Career.findOneAndUpdate(
        {
          _id: findCareerWitUs._id,
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
      if (deleteCareerWitUs) {
        return res.status(200).json({
          status: StatusCodes.OK,
          message: ResponseMessage.CAREER_DELETED,
          data: deleteCareerWitUs,
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
