import Joi from "joi";

const adminLoginSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().required().min(8).max(25),
});

const applyFranchiseSchema = Joi.object({
  firstName: Joi.string().required().description("firstName"),
  lastName: Joi.string().required().description("lastName"),
  email: Joi.string().email().required().description("email"),
  mobileNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .description("mobileNumber"),
  city: Joi.string().required().description("city"),
  state: Joi.string().required().description("state"),
  jobTitle: Joi.string().optional().description("jobTitle"),
  // company: Joi.string().required().description("company"),
  franchiseLocation: Joi.string().optional().description("franchiseLocation"),
  // type: Joi.string().optional().description("type"),
});
const contactUsSchema = Joi.object({
  firstName: Joi.string().required().description("firstName"),
  lastName: Joi.string().required().description("lastName"),
  email: Joi.string().email().required().description("email"),
  mobileNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .description("mobileNumber"),
  message: Joi.string().required().description("message"),
});
const verifyMobileSchema = Joi.object({
  mobileNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .label("Mobile-number"),
});
const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().description("email"),
});
const applyTwentyMinFranchiseSchema = Joi.object({
  name: Joi.string().required().description("name"),
  email: Joi.string().email().required().description("email"),
  mobileNumber: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .description("mobileNumber"),
  city: Joi.string().required().description("city"),
});
const adminPartnerSchema = Joi.object({
  partnerName: Joi.string().required("partnerName"),
  link: Joi.string(),
  _id: Joi.string().optional()
})
export const validators = {
  adminLoginSchema,
  applyFranchiseSchema,
  contactUsSchema,
  verifyMobileSchema,
  verifyEmailSchema,
  applyTwentyMinFranchiseSchema,
  adminPartnerSchema
};
