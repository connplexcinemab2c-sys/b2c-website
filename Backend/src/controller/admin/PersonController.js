import { Person } from "../../models/Person.js";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { createApi } from "../../services/QueryService.js";
import ResponseMessage from "../../utils/ResponseMessage.js";
import { deleteS3File } from "../../middleware/ImageUpload.js";

//#region addEdit person
export const addEditPerson = async (req, res) => {
  try {
    let { id, name, type, category, about } = req.body;
    const categoryArr = category.length ? JSON.parse(category) : [];
    let exist = await Person.findOne({
      name,
      deletedStatus: 0,
    });
    if (exist && !id) {
      return res.status(400).json({
        status: 400,
        message: ResponseMessage.THIS_ACTOR_ALREADY_EXIST,
        data: [],
      });
    } else if (id) {
      let already = await Person.findOne({
        _id: { $ne: id },
        name,
        deletedStatus: 0,
      });
      if (already) {
        return res.status(400).json({
          status: 400,
          message: ResponseMessage.THIS_ACTOR_ALREADY_EXIST,
          data: [],
        });
      } else {
        let person = await Person.findById({ _id: id });
        if (req.files.profile) {
          // fs.unlink("./public/uploads/" + person.profile, () => {});
          await deleteS3File(person.profile);
        } else if (req.body.removeProfileUrl) {
          // fs.unlink("./public/uploads/" + req.body.removeProfileUrl, () => {});
          await deleteS3File(req.body.removeProfileUrl);
          person.profile = "";
          await user.save();
        } else {
          req.profileUrl = person.profile;
        }
        let updated = await Person.findByIdAndUpdate(
          { _id: id },
          {
            $set: {
              name,
              category: categoryArr,
              type,
              about,
              profile: req.profileUrl,
            },
          },
          { new: true }
        );
        if (!updated) {
          return res.status(400).json({
            status: StatusCodes.BAD_REQUEST,
            message: ResponseMessage.BAD_REQUEST,
            data: [],
          });
        } else {
          return res.status(200).json({
            status: StatusCodes.OK,
            message: ResponseMessage.ACTOR_UPDATED,
            data: updated,
          });
        }
      }
    } else {
      const newPerson = new Person({
        name,
        category: categoryArr,
        type,
        about,
        profile: req.profileUrl,
      });
      const addPerson = await newPerson.save();
      if (!newPerson) {
        return res.status(400).json({
          status: StatusCodes.BAD_REQUEST,
          message: ResponseMessage.BAD_REQUEST,
          data: [],
        });
      } else {
        return res.status(201).json({
          status: StatusCodes.CREATED,
          message: ResponseMessage.ACTOR_ADDED,
          data: addPerson,
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

//#region removePerson
export const removePerson = async (req, res) => {
  try {
    let { id } = req.body;
    let removePerson = await Person.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          deletedStatus: 1,
        },
      },
      { new: true }
    );
    let newPerson = await Person.find({ deletedStatus: 0 }).sort({
      createdAt: -1,
    });
    if (!removePerson) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ACTOR_REMOVED,
        data: newPerson,
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

//#region GetPersons
export const getPersons = async (req, res) => {
  try {
    const personsDetails = await Person.find({
      deletedStatus: 0,
    }).sort({ createdAt: -1 });
    if (!personsDetails) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.BAD_REQUEST,
        data: [],
      });
    } else {
      return res.status(200).json({
        status: StatusCodes.OK,
        message: ResponseMessage.ACTOR_DETAILS,
        data: personsDetails,
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
