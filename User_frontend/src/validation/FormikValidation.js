import moment from "moment";
import * as Yup from "yup";

// const nameRegex = /^[a-zA-Z]+$/;
const firstNameRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
// const nameRegex = /^[a-zA-Z]+$/;
const nameRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;

const isValidFileType = (fileName) => {
  if (!fileName) return false;

  const validExtensions = ["jpg", "jpeg", "png", "svg", "webp"];

  const extension = fileName.split(".").pop().toLowerCase();

  return validExtensions.includes(extension);
};

const fullNameRegex = /^[a-zA-Z]+([',.\- ][a-zA-Z]+)*$/;
const InstagramUserNameRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;
const emailRegex =
  // /^(?:(?![=+_])(?:[^\s.=+_]*-?[^\s.=+_]+\.)*[^\s.=+_]*-?[^\s.=+_]+@[^\s.=+_]+\.\w{2,3}(?:\.\w{2,3})?)$/;
  // /^(?:(?![=+_])(?:[^\s.=+_]*-?[^\s.=+_]+\.)*[^\s.=+_]*-?[^\s.=+_]+@[a-z\d.-]+\.[a-z]{2,3}(?:\.[a-z]{2,3})?)$/i;
  /^(?:(?!\.)(?![0-9])(?:\w+\.)*(?:\w+\+)*(?:\w+\!)*(?:\w+\#)*(?:\w+\$)*(?:\w+\&)*(?:\w+\%)*(?:\w+\-)*\w+@\w+\.\w{2,3}(?:\.[a-z]{2,3})?)$/;
// const emailOrPhoneRegex = /^(?:\d{10}|[\w.]+@\w+\.\w{2,3})$/;
// const emailOrPhoneRegex =
//   /^(?:\d{10}|(?:(?![=+*])(?:[^\s.=+*]*-?[^\s.=+*]+\.)*[^\s.=+*]*-?[^\s.=+*]+@[a-z\d.-]+\.[a-z]{2,3}(?:\.[a-z]{2,3})?))$/i;
// const emailOrPhoneRegex =
// /^(?:\d{10}|(?:(?!\.)(?![0-9])(?:\w+\.)*(?:\w+\+)*(?:\w+\!)*(?:\w+\#)*(?:\w+\$)*(?:\w+\&)*(?:\w+\%)*(?:\w+\-)*\w+@\w+\.\w{2,3}(?:\.[a-z]{2,3})?))$/i;

const emailOrPhoneRegex =
  /^(?:[6-9]\d{9}|(?:(?!\.)(?![0-9])(?:\w+\.)*(?:\w+\+)*(?:\w+\!)*(?:\w+\#)*(?:\w+\$)*(?:\w+\&)*(?:\w+\%)*(?:\w+\-)*\w+@\w+\.\w{2,3}(?:\.[a-z]{2,3})?))$/i;

const phoneRegex = /^([6789]\d{2}\d{4}\d{3}\d{1})$/; // Change this regex based on requirement
const phoneRegexN = /^([6789]\d{2}\d{4}\d{3})$/; // Change this regex based on requirement
const msgRegex = /^[^\s]+(\s+[^\s]+)*$/; // Change this regex based on requirement
const urlRegex =
  /^((https?):\/\/)?(www\.)?[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/[\w/?-]+)?([\w=?&%\/@-]+)?$/;
const whiteSpaceRegex = /^\S+(\s+\S+)*$/; //Not allowed whitespace at the begining of word or sentence
const AlphaNumeric = /^[A-Za-z0-9 ]+$/; // containe only Alphanumeric Value
const NotOnlyNumbers = /^(?![0-9]+$)[A-Za-z0-9 ]+$/; // Now allowed only Number in alphanumeric value
const startSpace = /^(?!\s).*$/;
export const loginValidationSchema = Yup.object({
  emailOrPhone: Yup.string("Please enter your Email/Phone Number")
    .required("Please enter phone number or email")
    .matches(emailOrPhoneRegex, "Please enter valid phone number or email")
    .test(
      "not-ten-consecutive-zeros",
      "Please enter valid phone number or email",
      (value) => !/^(?:[^0-]*0[^0-]*){10}|(?:[^-]*-[^-]*){2}$/.test(value)
    ),
});

export const otpSchema = Yup.object().shape({
  otp: Yup.string("Please enter your OTP").required("Please enter your OTP"),
});

export const applyFranchiseScheme = Yup.object().shape({
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .matches(firstNameRegex, "Please enter valid first name")
    .min(2, "First name should be minimum 2 characters long"),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .matches(firstNameRegex, "Please enter valid last name")
    .min(2, "Last name should be minimum 2 characters long"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  city: Yup.string("Please enter city")
    .required("Please enter city")
    .matches(fullNameRegex, "Please enter valid city")
    .min(2, "City should be minimum 2 characters long"),
  state: Yup.string("Please enter state")
    .required("Please enter state")
    .matches(fullNameRegex, "Please enter valid state")
    .min(2, "State should be minimum 2 characters long"),
  jobTitle: Yup.string("Please enter job title")
    .required("Please enter job title")
    .min(2, "Job title should be minimum 2 characters long")
    .matches(fullNameRegex, "Please enter valid job title"),
  company: Yup.string("Please enter company")
    .required("Please enter company")
    .min(2, "Company name should be minimum 2 characters long")
    .matches(whiteSpaceRegex, "Please enter valid company"),
  // .matches(AlphaNumeric, "Please enter valid company")
  // .matches(NotOnlyNumbers, "Please enter valid company"),
  termsAndConditions: Yup.bool().oneOf(
    [true],
    "Please accept the terms and conditions"
  ),
});

export const applyBrandInfluencerScheme = Yup.object().shape({
  name: Yup.string("Please enter name")
    .required("Please enter name")
    .matches(fullNameRegex, "Please enter valid name")
    .min(2, "Name should be minimum 2 characters long"),

  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  mobileNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  city: Yup.string("Please enter city")
    .required("Please enter city")
    .matches(fullNameRegex, "Please enter valid city"),
  instagramUsername: Yup.string("Please enter instagram username")
    .required("Please enter instagram username")
    .matches(InstagramUserNameRegex, "Please enter valid instagram username")
    .min(2, "Instagram username should be minimum 2 characters long"),

  termsAndConditions: Yup.bool().oneOf(
    [true],
    "Please accept the terms and conditions"
  ),
});
export const applyGroupBookingScheme = Yup.object().shape({
  name: Yup.string("Please enter name")
    .required("Please enter name")
    .min(2, "Name should be minimum 2 characters long")
    .matches(nameRegex, "Please enter valid name"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  city: Yup.string("Please enter city")
    .required("Please enter city")
    .min(3, "City should be minimum 3 characters long")
    .matches(fullNameRegex, "Please enter valid city"),
  cinemaId: Yup.string("Please select cinema").required(
    "Please select cinema"
  ),
  bookingDate: Yup.string("Please enter booking date").required(
    "Please enter booking date"
  ),
  noOfPax: Yup.string("Please enter no of persons").required(
    "Please enter no of persons"
  ),
  termsAndConditions: Yup.bool().oneOf(
    [true],
    "Please accept the terms and conditions"
  ),
});
export const reportAnIssueScheme = Yup.object().shape({
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  date: Yup.string("Please enter date").required("Please enter date"),
  cinema_name: Yup.string("Please select cinema name").required(
    "Please select cinema name"
  ),
  transaction_type: Yup.string("Please select transaction type").required(
    "Please select transaction type"
  ),
  description: Yup.string("Please enter description").required(
    "Please enter description"
  ),

  termsAndConditions: Yup.bool().oneOf(
    [true],
    "Please accept the terms and conditions"
  ),
  Images: Yup.array()
    .of(
      Yup.mixed().test(
        "is-valid-type",
        "Please upload only .jpg, .png, .jpeg, or .svg files",
        (value) => {
          console.log(value, 466);
          if (!value || value == undefined) return true;

          // For newly uploaded files, value is a File object
          if (value instanceof File) {
            return isValidFileType(value.name, "image");
          }

          // For editing, value might be a string URL or an object with a name property
          const fileName = typeof value === "string" ? value : value.file;
          return isValidFileType(fileName, "image");
        }
      )
    )
    .max(5, "Maximum 5 images allowed"),
});
export const applyTwentyMinFranchiseScheme = Yup.object().shape({
  name: Yup.string("Please enter name")
    .required("Please enter name")
    .min(2,"Name should be minimum 2 characters long")
    .matches(fullNameRegex, "Please enter valid name"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  city: Yup.string("Please enter city")
    .required("Please enter current city")
    .min(2,"City should be minimum 2 characters long")
    .matches(fullNameRegex, "Please enter valid city"),
  termsAndConditions: Yup.bool().oneOf(
    [true],
    "Please accept the terms and conditions"
  ),
});

export const contactUsSchema = Yup.object().shape({
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .matches(firstNameRegex, "Please enter valid first name")
    .min(2, "First name should be minimum 2 characters long"),
  // .matches(nameRegex, "Please enter valid first name."),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .matches(firstNameRegex, "Please enter valid last name")
    .min(2, "Last name should be minimum 2 characters long"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  message: Yup.string("Please enter message")
    .required("Please enter message")
    // .matches(msgRegex, "Please enter valid message.")
    .matches(startSpace, "Starting space not allow")
    .max(250, "Maximum length exceeded (250 characters)"),
  reCaptcha: Yup.string("Please confirm ReCAPTCHA").required(
    "Please confirm ReCAPTCHA"
  ),
});

export const feedbackSchema = Yup.object().shape({
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .matches(firstNameRegex, "Please enter valid first name")
    .min(2, "First name should be minimum 2 characters long"),
  // .matches(nameRegex, "Please enter valid first name."),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .matches(firstNameRegex, "Please enter valid last name")
    .min(2, "Last name should be minimum 2 characters long"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  city: Yup.string()
    .required("Please select city"),
  cinemaId: Yup.string()
    .required("Please select cinema"),
  message: Yup.string("Please enter message")
    .required("Please enter message")
    // .matches(msgRegex, "Please enter valid message.")
    .matches(startSpace, "Starting space not allow")
    .max(250, "Maximum length exceeded (250 characters)"),
});

export const userDetailsSchema = Yup.object().shape({
  profile: Yup.mixed()
    .test(
      "FILE_TYPE",
      "Please upload an image in JPEG, JPG, or PNG format",
      (value) => {
        if (value) {
          return (
            value.type === "image/jpeg" ||
            value.type === "image/jpg" ||
            value.type === "image/png"
          );
        } else {
          return true;
        }
      }
    )
    .test("FILE_SIZE", "Profile image is no larger than 2MB ", (value) => {
      return !value || (value && value.size <= 2000000);
    }),
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .min(2, "First name should be minimum 2 characters long")
    .matches(nameRegex, "Please enter valid first name"),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .min(2, "Last name should be minimum 2 characters long")
    .matches(nameRegex, "Please enter valid last name"),
  birthDate: Yup.date()
    .transform(function (value, originalValue) {
      if (this.isType(value)) {
        return value;
      }
      const result = moment(originalValue, "DD/MM/YYYY");
      return result.isValid() ? result.toDate() : null;
    })
    .typeError("Please enter a valid date")
    .max(moment().toDate(), "Birthdate cannot be future date")
    .test(
      "not-today",
      "Birthdate cannot be less than 10 years ago",
      function (value) {
        if (!value) {
          return true;
        }
        const minBirthDate = moment().subtract(11, "years");
        return moment(value).isSameOrBefore(minBirthDate);
      }
    ),
  gender: Yup.string("Please select gender"),
  maritalStatus: Yup.string("Please select marital status"),
  address: Yup.string("Please enter address"),
  city: Yup.string("Please enter city").matches(
    fullNameRegex,
    "Please enter valid city"
  ),
});
export const membershipSchema = Yup.object().shape({
  email: Yup.string("Please enter your email")
    .required("Please enter your email")
    .matches(emailRegex, "Please enter a valid email"),
});
export const accountDetailsEmailSchema = Yup.object().shape({
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
});
export const accountDetailsPhoneSchema = Yup.object().shape({
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
});
export const rateAndReview = Yup.object().shape({
  movieRating: Yup.string("Please add movie rating").required(
    "Please add movie rating"
  ),
  connplexRating: Yup.string("Please add connplex rating").required(
    "Please add connplex rating"
  ),
  movieReview: Yup.string("Please add movie review")
    .required("Please enter movie review")
    .matches(whiteSpaceRegex, "Not allowed whitespace at the beginning"),
});

export const adWithUsSchema = Yup.object().shape({
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .matches(nameRegex, "Please enter valid first name")
    .min(2, "First name should be minimum 2 characters long"),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .matches(nameRegex, "Please enter valid last name")
    .min(2, "Last name should be minimum 2 characters long"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  // message: Yup.string("Please enter message.")
  //   .required("Please enter message.")
  //   .matches(msgRegex, "Please enter valid message."),
  message: Yup.string("Please enter message")
    .required("Please enter message")
    // .matches(msgRegex, "Please enter valid message.")
    .matches(startSpace, "Starting space not allow")
    .max(250, "Maximum length exceeded (250 characters)"),
  // .matches(
  //   /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
  //   "Space not allowed between characters"
  // )
  brandName: Yup.string("Please enter brand name")
    .required("Please enter brand name")
    .min(2, "Brand name should be minimum 2 characters long")
    .max(30,"Brand name cannot exceed 30 characters"),
  // .matches(msgRegex, "Please enter valid brand name."),

  designation: Yup.string("Please enter designation")
    .required("Please enter designation")
    .matches(nameRegex, "Please enter valid designation")
    .min(2, "Designation should be minimum 2 characters long")
    .max(30,"Designation cannot exceed 30 characters"),
  websiteUrl: Yup.string()
    // .required("Please enter website Url.")
    .matches(
      // /^https:\/\/www\.[a-zA-Z0-9_-]+\.[a-zA-Z]{2,9}(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/,
      /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
      "Please enter valid website url"
    ),
  reCaptcha: Yup.string("Please confirm ReCAPTCHA").required(
    "Please confirm ReCAPTCHA"
  ),
});
export const careersWithUsSchema = Yup.object().shape({
  resume: Yup.mixed()
    .required("Please upload your resume")
    .test(
      "FILE_TYPE",
      "Only .pdf file is allowed",
      (value) => {
        if (value) {
          return value.type === "application/pdf";
        } else {
          return true;
        }
      }
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  firstName: Yup.string("Please enter first name")
    .required("Please enter first name")
    .matches(firstNameRegex, "Please enter valid first name")
    .min(2, "First name should be minimum 2 characters long"),
  lastName: Yup.string("Please enter last name")
    .required("Please enter last name")
    .matches(firstNameRegex, "Please enter valid last name")
    .min(2, "Last name should be minimum 2 characters long"),
  email: Yup.string("Please enter email")
    .required("Please enter email")
    .matches(emailRegex, "Please enter valid email"),
  phoneNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegexN, "Please enter valid phone number"),
  // message: Yup.string("Please enter message.")
  //   .required("Please enter message.")
  //   .matches(msgRegex, "Please enter valid message."),
  message: Yup.string("Please enter message")
    .required("Please enter message")
    // .matches(msgRegex, "Please enter valid message.")
    .matches(startSpace, "Starting space not allow")
    .max(250, "Message cannot exceed 250 characters"),

  position: Yup.string("Please enter position")
    .required("Please enter position")
    .matches(firstNameRegex, "Please enter valid position")
    .min(2, "Position should be minimum 2 characters long")
    .max(30,"Position cannot exceed 30 characters"),
  city: Yup.string("Please enter city")
    .required("Please enter city")
    .matches(fullNameRegex, "Please enter valid city")
    .min(2, "City should be minimum 2 characters long")
    .max(30,"City cannot exceed 30 characters"),
  reCaptcha: Yup.string("Please confirm ReCAPTCHA").required(
    "Please confirm ReCAPTCHA"
  ),
});
export const redeemWelcomeGiftSchema = Yup.object().shape({
  cinema: Yup.string()
    .required("Please select cinema")
    
});

