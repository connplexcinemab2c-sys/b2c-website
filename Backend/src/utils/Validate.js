import Joi from "joi";
import { validators } from "./Validators.js";

export const validateFun = (validator) => {
  if (!validators.hasOwnProperty(validator))
    throw new Error(`'${validator}' validator is not exist`);

  return async function (req, res, next) {
    try {
      const validated = await validators[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err.isJoi) {
        res.status(400).send({
          status: 400,
          message: err.details[0].message.replaceAll('"', ""),
          data: [],
        });
      }
    }
  };
};
