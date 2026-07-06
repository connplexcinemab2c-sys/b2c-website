import * as Yup from "yup";
// import PagesIndex from "../container/PagesIndex";
import moment from "moment";

import { IMAGES_API_ENDPOINT } from "../config/DataService";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// const emailRegex = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+$/;
const emailRegex =
  /^(?:(?!\.)(?![0-9])(?:\w+\.)*(?:\w+\+)*(?:\w+\!)*(?:\w+\#)*(?:\w+\$)*(?:\w+\&)*(?:\w+\%)*(?:\w+\-)*\w+@\w+\.\w{2,3}(?:\.[a-z]{2,3})?)$/;

const loginEmail =
  // /^[a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z]+)*@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
  /^(?:(?!\.)(?![0-9])(?:\w+\.)*(?:\w+\+)*(?:\w+\!)*(?:\w+\#)*(?:\w+\$)*(?:\w+\&)*(?:\w+\%)*(?:\w+\-)*\w+@\w+\.\w{2,3}(?:\.[a-z]{2,3})?)$/;
const phoneRegExp =
  /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{3,})$/;
const otpRegex = /^\d{4}$/;
// const nameRegex = /^(?!\s).+(?<!\s)$/gm;
const nameRegex = /^(.+)$/gm;
// const nameRegex = /^[^\d\W\s]+$/gm;
const locationRegex = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+\.?\d?)+z/;
// const urlRegex =
//   /^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;
const charSpace = (value) =>
  /^[^-\s][a-zA-Z\s]+$/.test(value) || value.length === 0;

// const urlRegex =
//   /^(https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+)(\.[a-zA-Z]{2,})+([\/\w\-.?%&=]*)?$/;
const urlRegex =
  /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|\[(?:[a-fA-F0-9:]+)\]|(\d{1,3}\.){3}\d{1,3})(:\d+)?)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
const youtubeUrlRegex =
  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9_-]+)(\.[a-zA-Z]{2,})+([\/\w\-.?%&=@]*)?$/;

const whiteSpaceRegex = /^\S+(\s+\S+)*\s*$/; //Not Allowed WhiteSpace
const isValidFileType = (fileName, type ,exts) => {
  if (!fileName) return false;

  // Define allowed extensions
  const validExtensions =
    exts && exts?.length > 0 ? exts : ["jpg", "jpeg", "png", "svg", "webp"];

  // Extract the extension using a regular expression
  const extension = fileName.split(".").pop().toLowerCase();

  // Check if the extracted extension is in the list of valid extensions
  return validExtensions.includes(extension);
};
const startSpace = /^(?!\s).*$/;

const getCharacterValidationError = (str) => {
  return `Your password must have at least 1 ${str} character`;
};
const imageWidthAndHeight = (provideFile) => {
  // take the given file (which should be an image) and return the width and height
  const imgDimensions = { width: null, height: null };

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader?.readAsDataURL(provideFile);
    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;

      img.onload = function () {
        imgDimensions.width = img.width;
        imgDimensions.height = img.height;

        resolve(imgDimensions);
      };
    };
  });
};
const imageDimensionCheck = Yup.addMethod(
  Yup.mixed,
  "imageDimensionCheck",
  function (message, requiredWidth, requiredHeight) {
    return this.test("image-width-height-check", "", async function (value) {
      const { path, createError } = this;

      if (!value) {
        return;
      }

      const imgDimensions = await imageWidthAndHeight(value);

      if (
        imgDimensions.width !== requiredWidth &&
        imgDimensions.height !== requiredHeight
      ) {
        return createError({
          path,
          message: `The file dimentions need to be the ${requiredWidth}px * ${requiredHeight}px`,
        });
      }
      return true;
    });
  }
);

export const loginSchema = Yup.object().shape({
  email: Yup.string("Enter your email")
    .required("Email is required")
    .matches(loginEmail, "Enter a valid email"),
  password: Yup.string("Enter your password")
    .required("Password is required")
    .min(6, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .matches(/\d/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
    .matches(/[^\w\s]/, getCharacterValidationError("special")),
});

export const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string("Please enter your email address")
    .required("Email is required")
    .email("Email is not valid")
    .matches(emailRegex, "Email is not valid"),
});

export const otpSchema = Yup.object().shape({
  otp: Yup.string("Please enter your OTP")
    .required("OTP is required")
    .matches(otpRegex, "OTP is not valid"),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string("Please enter New Password")
    .required("Please enter New Password")
    .min(6, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .matches(/\d/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
    .matches(/[^\w\s]/, getCharacterValidationError("special")),

  confirmPassword: Yup.string("Please enter Confirm Password")
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please enter New confirm Password"),
});

export const changePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string("Please enter New Password").required(
    "Please enter New Password"
  ),
  newPassword: Yup.string("Please enter New Password")
    .required("Please enter New Password")
    .min(6, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .matches(passwordRegex, "Must contain one lowercase character"),

  confirmPassword: Yup.string("Please enter Confirm Password")
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please enter New confirm Password"),
});
export const subAdminAddScema = Yup.object().shape({
  name: Yup.string()
    .required("Please enter sub admin name")
    .min(3, "Must contain 3 characters")
    .max(30, "Not more than 30 character")
    .matches(
      /^(?!\s)[A-Za-z\s]+$/,
      "Name must have only capital and small letters"
    ),
  email: Yup.string()
    .email("Please enter valid email")
    .matches(
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/,
      "Invalid email format"
    )
    .oneOf([Yup.ref("email"), ""], "Email must match")
    .required("Please enter email"),
  mobileNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegExp, "Please enter a valid phone number"),
  password: Yup.string("Please enter password")
    .required("Please enter password")
    .min(6, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .matches(/\d/, getCharacterValidationError("digit"))
    .matches(/[a-z]/, getCharacterValidationError("lowercase"))
    .matches(/[A-Z]/, getCharacterValidationError("uppercase"))
    .matches(/[^\w\s]/, getCharacterValidationError("special")),
  confirmPassword: Yup.string("Please enter Confirm password")
    .required("Please enter confirm password")
    .oneOf([Yup.ref("password")], "Confirm password must match"),
  roleId: Yup.string("Please select role").required("Please select role"),
  cinemaId: Yup.string().when("roleId", (roleId, schema) => {
    if (roleId[0] === "6566d38b416a6b80a037fcf8")
      return schema.required("Please select cinema");
    return schema;
  }),
});
export const subAdminEditScema = Yup.object().shape({
  name: Yup.string()
    .required("Please enter sub admin name")
    .min(3, "Must contain 3 characters")
    .max(30, "Not more than 30 character")
    .matches(
      /^(?!\s)[A-Za-z\s]+$/,
      "Name must have only capital and small letters"
    ),
  email: Yup.string()
    .email("Please enter valid email")
    .matches(
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/,
      "Invalid email format"
    )
    .oneOf([Yup.ref("email"), ""], "Email must match")
    .required("Please enter email"),
  mobileNumber: Yup.string("Please enter phone number")
    .required("Please enter phone number")
    .matches(phoneRegExp, "Please enter a valid phone number"),
  roleId: Yup.string("Please select role").required("Please select role"),
  cinemaId: Yup.string().when("roleId", (roleId, schema) => {
    if (roleId[0] === "6566d38b416a6b80a037fcf8")
      return schema.required("Please select cinema");
    return schema.notRequired();
  }),
});

export const regionSchema = Yup.object().shape({
  regionName: Yup.string("Enter city name")
    .required("City name is required")
    .max(30, "Not more than 30 character")
    .matches(/^[^\d\W\s]+$/gm, "Enter valid city name"),
  image: Yup.mixed()
    .required("Please select image")
    .test(
      "FILE_FORMAT",
      "Unsupported file type found.",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test("imageDimensions", "Image size should be 50x50", (value) => {
      return new Promise((resolve, reject) => {
        if (!value) {
          resolve(false); // if no value, skip this validation
          return;
        }

        const img = new Image();
        img.onload = function () {
          if (img.width <= 50 && img.height <= 50) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        img.onerror = function () {
          resolve(false);
        };
        img.src = URL.createObjectURL(value);
      });
    })
    .test(
      "FILE_SIZE",
      "Uploaded file is too big.",
      (value) => !value || (value && value.size <= 2097152)
    ),
});
export const regionEditSchema = Yup.object().shape({
  regionName: Yup.string("Enter city name")
    .required("City name is required")
    .matches(nameRegex, "Enter valid city name"),

  image: Yup.mixed()
    .nullable()
    .required("Please select image")
    .test("FILE_FORMAT", "Unsupported file type found.", (value) => {
      if (!value?.name) {
        let ext = value?.split(".")[1];
        return ["jpg", "jpeg", "png"].includes(ext);
      } else {
        return ["image/jpg", "image/jpeg", "image/png"].includes(value?.type);
      }
    })
    .test("imageDimensions", "Image size should be 50x50", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width <= 50 && image.height <= 50) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test("fileSize", "Uploaded file is too big.", (file) => {
      if (file?.size) {
        return file.size <= 2097152;
      } else {
        return true;
      }
    }),
});

export const rolePermissionSchema = Yup.object().shape({
  roleName: Yup.string("Enter role name")
    .required("Role is required")
    .max(30, "Not more than 30 character")
    .matches(nameRegex, "Enter valid role"),
  permissions: Yup.array().min(1, "Select at least one permission"),
});

export const cinemaSchema = Yup.object().shape({
  cinemaName: Yup.string("Enter cinema name")
    .required("Cinema name is required")
    .max(50, "Allowed only 50 characters")
    .matches(/^[^\d\W\s]+$/gm, "Enter valid Cinema name"),

  displayName: Yup.string("Enter display name")
    .required("Cinema display name is required")
    .matches(nameRegex, "Enter valid display name")
    .max(50, "Allowed only 50 characters"),
  address: Yup.string("Enter address")
    .required("Cinema address is required")
    .matches(whiteSpaceRegex, "Cinema address is not contain space.")
    .max(100, "Allowed only 100 characters"),
  // poster: Yup.mixed()
  //   .required("Cover image is required")
  //   .test(
  //     "FILE_SIZE",
  //     "Uploaded file is too big.",
  //     (value) => !value || (value && value.size <= 2097152)
  //   ),
  poster: Yup.mixed()
    .nullable()
    .required("Cover image is required")
    .test(
      "FILE_FORMAT",
      "Unsupported file type found.",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test("fileSize", "Uploaded file is too big.", (file) => {
      if (file) {
        return file.size <= 2097152;
      } else {
        return true;
      }
    }),
  images: Yup.mixed()
    .required("Images are required")
    .test("FILE_COUNT", "Upload theatre images", (values) => values?.length)
    .test("imageDimensions", "Image size should be 1080x320.", (files) => {
      return Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            if (!file || !file.name) {
              resolve(true); // No file uploaded, so consider it valid
              return;
            }

            const image = new Image();
            image.src = URL.createObjectURL(file);
            image.onload = () => {
              if (image.width <= 1080 && image.height <= 320) {
                resolve(true); // Image dimensions are within the limit
              } else {
                resolve(false); // Image dimensions exceed the limit
              }
            };
            image.onerror = () => {
              resolve(false); // Error loading image, consider it invalid
            };
          });
        })
      ).then((results) => results.every((result) => result));
    })
    .test("FILE_SIZE", "One of uploaded file is too big.", (values) => {
      const inValidFile = values?.filter((data) => data.size > 1000000);
      return !inValidFile.length;
    })
    .test("FILE_TYPE", "Unsupported file type found.", (values) => {
      const inValidFile = values?.filter(
        (data) =>
          data.type === "image/jpeg" ||
          data.type === "image/jpg" ||
          data.type === "image/png"
      );
      return inValidFile.length === values.length;
    }),
  regionId: Yup.string("Select region").required("Please select region"),
  emailId: Yup.string("Enter your email")
    // .required("Email is required")
    .email("Email is not valid")
    .matches(emailRegex, "Enter a valid email"),
  mobileNumber: Yup.string("Enter your phone number")
    .required("Phone number is required")
    .matches(phoneRegExp, "Enter a valid phone number"),
  cinemaPromoUrl: Yup.string("Enter your cinema promo url")
    .required("Cinema promo url is required")
    .matches(whiteSpaceRegex, "Cinema promo url is not contain space.")
    .matches(urlRegex, "Enter a valid cinema promo url"),
  googleUrl: Yup.string("Enter your google URL")
    .required("Google URL is required")
    .matches(whiteSpaceRegex, "Google URL is not contain space.")
    .matches(urlRegex, "Enter a valid google URL"),
  cinemaWebServiceUrl: Yup.string("Enter web service url 1")
    .required("Cinema web service url 1 is required")
    .matches(whiteSpaceRegex, "Cinema web service url 1 is not contain space.")
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Please enter valid url."
    ),
  cinemaWebServiceUrl2: Yup.string("Enter web service url 2")
    .required("Cinema web service url 2 is required")
    .matches(whiteSpaceRegex, "Cinema web service url 2 is not contain space.")
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Please enter valid url."
    ),
  serviceCharge: Yup.string("Enter service charge")
    .required("Service Charge is required")
    .matches(/\d$/, "Enter valid service charge"),
  convenienceFees: Yup.string("Enter convenience fees")
    .required("Convenience fees is required")
    .matches(/\d$/, "Enter valid convenience fees"),
  GSTNumber: Yup.string("Enter GST identification number")
    .required("GST identification number is required")
    .matches(
      /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/,
      "Enter valid GST identification number"
    ),
  cinemaAmenities: Yup.array()
    .min(1, "Please select at least one cinema amenities")
    .required("Please select at least one cinema amenities"),
});

export const cinemaEditSchema = Yup.object().shape({
  cinemaName: Yup.string("Enter cinema name")
    .required("Cinema name is required")
    .matches(nameRegex, "Enter valid cinema name")
    .max(50, "Allowed only 50 characters"),
  displayName: Yup.string("Enter display name")
    .required("Cinema display name is required")
    .matches(nameRegex, "Enter valid display name")
    .max(50, "Allowed only 50 characters"),
  address: Yup.string("Enter address")
    .required("Cinema address is required")
    .matches(whiteSpaceRegex, "Cinema address is not contain space.")
    .max(100, "Allowed only 100 characters"),
  // poster: Yup.mixed().test(
  //   "FILE_SIZE",
  //   "Uploaded file is too big.",
  //   (value) => !value || (value && value.size <= 2097152)
  // ),
  poster: Yup.mixed()
    .nullable()
    .required("Please select image")
    .test("FILE_FORMAT", "Unsupported file type found.", (value) => {
      if (!value?.name) {
        let ext = value?.split(".")[1];
        return ["jpg", "jpeg", "png"].includes(ext);
      } else {
        return ["image/jpg", "image/jpeg", "image/png"].includes(value?.type);
      }
    })
    .test("fileSize", "Uploaded file is too big.", (file) => {
      if (file?.size) {
        return file.size <= 2097152;
      } else {
        return true;
      }
    }),
  // images: Yup.mixed()
  //   .required("Images are required")
  //   .test("FILE_SIZE", "One of uploaded file is too big.", (values) => {
  //     const inValidFile = values?.filter((data) => data.size > 1000000);
  //     return !inValidFile.length;
  //   })
  //   .test("FILE_TYPE", "Unsupported file type found.", (values) => {
  //     const inValidFile = values?.filter(
  //       (data) =>
  //         data.type === "image/jpeg" ||
  //         data.type === "image/jpg" ||
  //         data.type === "image/png"
  //     );
  //     return inValidFile.length === values.length;
  //   }),

  images: Yup.mixed()
    .test("FILE_COUNT", "Upload theatre images", (values) => {
      // Allow an empty array for updates (no change)
      return values?.length || values === undefined;
    })
    .test("imageDimensions", "Image size should be 1080x320.", (files) => {
      return Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            if (!file || !file.name) {
              resolve(true); // No file uploaded, so consider it valid
              return;
            }

            const image = new Image();
            image.src = URL.createObjectURL(file);
            image.onload = () => {
              if (image.width <= 1080 && image.height <= 320) {
                resolve(true); // Image dimensions are within the limit
              } else {
                resolve(false); // Image dimensions exceed the limit
              }
            };
            image.onerror = () => {
              resolve(false); // Error loading image, consider it invalid
            };
          });
        })
      ).then((results) => results.every((result) => result));
    })
    .test("FILE_SIZE", "One of the uploaded files is too big.", (values) => {
      const inValidFile = values?.filter((data) => data.size > 1000000);
      return !inValidFile.length;
    })
    .test("FILE_FORMAT", "Unsupported file type found.", (values) => {
      if (values !== undefined) {
      }
      if (!Array.isArray(values) || values.length <= 0) {
        return false; // Error if not an array or empty array
      }
      return values.every((file) => {
        const ext = file.name
          ? file.name.split(".").pop().toLowerCase()
          : file.split(".").pop().toLowerCase();
        return ["jpg", "jpeg", "png"].includes(ext);
      });
    }),

  regionId: Yup.string("Select region").required("Please select region"),
  emailId: Yup.string("Enter your email")
    // .required("Email is required")
    .email("Email is not valid")
    .matches(emailRegex, "Enter a valid email"),
  mobileNumber: Yup.string("Enter your phone number")
    .required("Phone number is required")
    .matches(phoneRegExp, "Enter a valid phone number"),
  cinemaPromoUrl: Yup.string("Enter your cinema promo url")
    .required("Cinema promo url is required")
    .matches(whiteSpaceRegex, "Cinema promo url is not contain space.")
    .matches(urlRegex, "Enter a valid cinema promo url"),
  googleUrl: Yup.string("Enter your google URL")
    .required("Google URL is required")
    .matches(whiteSpaceRegex, "Google URL is not contain space.")
    .matches(urlRegex, "Enter a valid google URL"),
  cinemaWebServiceUrl: Yup.string("Enter web service url 1")
    .required("Cinema web service url 1 is required")
    .matches(whiteSpaceRegex, "Cinema web service url 1 is not contain space.")
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Please enter valid url."
    ),
  cinemaWebServiceUrl2: Yup.string("Enter web service url 2")
    .required("Cinema web service url 2 is required")
    .matches(whiteSpaceRegex, "Cinema web service url 2 is not contain space.")
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Please enter valid url."
    ),
  serviceCharge: Yup.string("Enter service charge")
    .required("Service charge is required")
    .matches(/\d$/, "Enter valid service charge"),
  convenienceFees: Yup.string("Enter convenience fees")
    .required("Convenience fees is required")
    .matches(/\d$/, "Enter valid convenience fees"),
  GSTNumber: Yup.string("Enter GST identification number")
    .required("GST identification number is required")
    .matches(
      /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/,
      "Enter valid GST identification number"
    ),
  cinemaAmenities: Yup.array()
    .min(1, "Please select at least one cinema amenities")
    .required("Please select at least one cinema amenities"),
  lat: Yup.string("Enter latitude").required("Latitude is required"),
  long: Yup.string("Enter Longitude").required("Longitude is required"),
});

export const movieSchema = Yup.object().shape({
  movieName: Yup.string("Please enter movie name")
    .max(50, "Name cannot exceed 50 characters")
    .required("Please enter movie name")
    .matches(nameRegex, "Enter a valid movie name"),
  description: Yup.string("Please enter movie description")
    .max(500, "Description cannot exceed 500 characters")
    .required("Please enter movie description"),
  censorRating: Yup.string("Please enter movie censor rating"),
  // .required(
  //   "Movie censor rating is required"
  // ),
  language: Yup.string("Please enter language")
    .max(30, "Language cannot exceed 30 characters")
    .required("Please enter language"),
  category: Yup.string("Please enter genre")
    .max(30, "Genre cannot exceed 30 characters")
    .required("Please enter genre"),
  movieUrl: Yup.string("Please enter youtube Url")
    .required("Please enter youtube Url")
    .matches(whiteSpaceRegex, "Youtube Url cannot contain space")
    .matches(
      /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/,
      "Please enter a valid YouTube URL"
    ),
  releaseDate: Yup.string()
    .required("Please enter movie release date")
    .test(
      "Invalid date",
      "Release date should be a future date",
      function (value) {
        if (this.options.context?.releaseStatus == "2") {
          return (
            moment(value).format("YYYY-MM-DD") > moment().format("YYYY-MM-DD")
          );
        } else {
          return true;
        }
      }
    ),
  poster: Yup.mixed()
    .required("Please select poster")
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test("imageDimensions", "Image must be 278x417 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width <= 278 && image.height <= 417) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Poster is required", 244, 366),
  movieCategory: Yup.string("Please enter movie category").required(
    "Please enter movie category"
  ),
  releaseStatus: Yup.string("Please enter movie release status").required(
    "Please enter movie release status"
  ),
  // duration: Yup.string("Enter duration")
  //   .matches(/^\d*\.?\d*$/, "Enter valid duration value")
  //   // .matches(/^\d{1,2}:\d{1,2}$/, "Enter valid duration value")
  //   .matches(
  //     "MAX_VALUE",
  //     "Enter value 4 or less",
  //     (number) => number <= 4 && number >= 0
  //   ),
  // .required("Duration is required"),
  // duration: Yup.string("Enter duration")
  //   // .matches(/^\d{1,2}:\d{1,2}$/, "Enter valid duration value")
  //   .matches(/^\d{1,2}:\d{1,2}$/, "Enter value 4 or less")
  //   .test("MAX_VALUE", "Enter value 4 or less", (value) => {
  //     const hours = parseInt(value.split(":")[0]);
  //     return hours <= 4;
  //   })
  //   .required("Duration is required"),2
  cast: Yup.array().min(1, "Please select at least one cast member"),
  crew: Yup.array().min(1, "Please select at least one crew member"),
  //   ratings: Yup.string("Enter ratings")
  //     .required("Ratings is required")
  //     .matches(/^\d*\.?\d*$/, "Enter valid ratings value")
  //     .test(
  //       "MAX_VALUE",
  //       "Enter value 5 or less",
  //       (number) => number <= 5 && number >= 0
  //     ),
  //   likes: Yup.string("Enter no of likes")
  //     .required("Number of likes is required")
  //     .test(
  //       "not-negative",
  //       "Likes cannot be negative",
  //       (value) => parseInt(value) >= 0
  //     )
  //     .matches(/\d/, "Enter valid value for likes"),
});

export const movieEditSchema = Yup.object().shape({
  movieName: Yup.string("Please enter movie name")
    .max(50, "Name cannot exceed 50 characters")
    .required("Please enter movie name")
    .matches(nameRegex, "Enter a valid movie name"),
  description: Yup.string("Please enter movie description")
    .max(500, "Description cannot exceed 500 characters")
    .required("Please enter movie description"),
  language: Yup.string("Please enter language")
    .max(30, "Language cannot exceed 30 characters")
    .required("Please enter language"),
  category: Yup.string("Please enter genre")
    .max(30, "Genre cannot exceed 30 characters")
    .required("Please enter genre"),
  movieUrl: Yup.string("Please enter youtube Url")
    .required("Please enter youtube Url")
    .matches(whiteSpaceRegex, "Youtube Url cannot contain space")
    .matches(
      /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/,
      "Please enter a valid YouTube URL"
    ),
  releaseDate: Yup.string()
    .required("Please enter movie release date")
    .test(
      "Invalid date",
      "Release date should be a future date",
      function (value) {
        if (this.options.context?.releaseStatus == "2") {
          return (
            moment(value).format("YYYY-MM-DD") > moment().format("YYYY-MM-DD")
          );
        } else {
          return true;
        }
      }
    ),
  poster: Yup.mixed()
    .nullable()
    .required("Please select poster")
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) => {
        if (!value?.name) {
          let ext = value?.split(".")[1];
          return ["jpg", "jpeg", "png"].includes(ext);
        } else {
          return ["image/jpg", "image/jpeg", "image/png"].includes(value?.type);
        }
      }
    )
    .test("imageDimensions", "Image must be 278x417 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width <= 278 && image.height <= 417) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test("fileSize", "File size must be 2MB or less", (file) => {
      if (file?.size) {
        return file.size <= 2097152;
      } else {
        return true;
      }
    }),
  // .imageDimensionCheck("Poster is required", 244, 366),
  movieCategory: Yup.string("Please enter movie category").required(
    "Please enter movie category"
  ),
  // censorRating: Yup.string("Enter movie censor rating").required(
  //   "Movie censor rating is required"
  // ),
  releaseStatus: Yup.string("Please enter movie release status").required(
    "Please enter movie release status"
  ),
  // duration: Yup.string("Enter duration")
  //   .matches(/^\d*\.?\d*$/, "Enter valid duration value")
  //   .test(
  //     "MAX_VALUE",
  //     "Enter value 5 or less",
  //     (number) => number <= 5 && number >= 0
  //   )
  //   .required("Duration is required"),
  cast: Yup.array().min(1, "Please select at least one cast member"),
  crew: Yup.array().min(1, "Please select at least one crew member"),
  //   ratings: Yup.string("Enter ratings")
  //     .required("Ratings is required")
  //     .matches(/^\d*\.?\d*$/, "Enter valid ratings value")
  //     .test(
  //       "MAX_VALUE",
  //       "Enter value 5 or less",
  //       (number) => number <= 5 && number >= 0
  //     ),
  //   likes: Yup.string("Enter no of likes")
  //     .required("Number of likes is required")
  //     .test(
  //       "not-negative",
  //       "Likes cannot be negative",
  //       (value) => parseInt(value) >= 0
  //     )
  //     .matches(/\d/, "Enter valid value for likes"),
});

export const actorManagementSchema = Yup.object().shape({
  name: Yup.string("Enter actor name")
    .required("Actor's name is required")
    .max(50, "Not more than 50 characters long")
    .matches(nameRegex, "Enter valid name"),
  about: Yup.string("Enter description about actor")
    .max(500, "Not more than 500 characters long")
    .required("Description about actor is required"),
  profile: Yup.mixed()
    .required("Profile image is required")
    .test("imageDimensions", "Image size should be 98x98", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width <= 98 && image.height <= 98) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Unsupported file type found.",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "Uploaded file is too big.",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Poster is required", 98, 98),
  category: Yup.array().min(1, "Select at least one category"),
});
export const actorManagementEditSchema = Yup.object().shape({
  name: Yup.string("Enter actor name")
    .required("Actor's name is required")
    .max(30, "Not more than 30 characters long")
    .matches(nameRegex, "Enter valid name"),
  about: Yup.string("Enter description about actor")
    .max(500, "Not more than 500 characters long")
    .required("Description about actor is required"),
  profile: Yup.mixed()
    .test("imageDimensions", "Image size should be 98x98", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width <= 98 && image.height <= 98) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Unsupported file type found.",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "Uploaded file is too big.",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Poster is required", 98, 98),
  category: Yup.array().min(1, "Select at least one category"),
});

export const ProfileSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, " Full name is too short")
    .max(16, " Full name is too long")
    .required(" Full name is required")
    .test(
      "Full name",
      " Full name allows character with space between",
      charSpace
    ),
  email: Yup.string()
    .email("Enter the valid email")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Enter the valid email"
    )
    .required("Email is required"),
  mobileNumber: Yup.string()
    .required("Phone number is required")
    .min(10, "Min 10 digit only")
    .max(10, "Max 10 digit "),
});
export const sliderSchema = Yup.object().shape({
  sliderType: Yup.string("Enter slider type").required(
    "Please select slider type"
  ),
  title: Yup.string("Enter slider name")
    .required("Please enter slider title")
    .max(50, "Slider title cannot exceed 50 characters")
    .matches(nameRegex, "Enter a valid slider name"),
  regionId: Yup.array().required("Please select city"),
  poster: Yup.mixed().test("slider-validation", function (value) {
    const { sliderType } = this.parent;
    const validTypes = ["image/jpg", "image/jpeg", "image/png"];
    const MAX_FILE_SIZE = 2097152; // 2MB

    const validateImage = (image, width, height, resolve) => {
      if (image.width === width && image.height === height) {
        resolve(true);
      } else {
        resolve(
          this.createError({
            message: `Image must be ${width}x${height} pixels`,
          })
        );
      }
    };

    const validateFile = (file, width, height, resolve) => {
      if (!validTypes.includes(file.type)) {
        resolve(
          this.createError({
            message: "Only .jpg, .jpeg, and .png files are allowed",
          })
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        resolve(this.createError({ message: "File size must be 2MB or less" }));
        return;
      }

      const image = new Image();
      image.src = URL.createObjectURL(file);

      image.onload = () => validateImage(image, width, height, resolve);
      image.onerror = () =>
        resolve(this.createError({ message: "Invalid image file" }));
    };

    const validateUrl = (url, width, height, resolve) => {
      const image = new Image();
      const imageUrl = `${IMAGES_API_ENDPOINT}/${url}`;
      image.src = imageUrl;

      image.onload = () => validateImage(image, width, height, resolve);
      image.onerror = () =>
        resolve(this.createError({ message: "Invalid image URL" }));
    };

    if (!sliderType) {
      return this.createError({
        message: "Please select the slider type first",
      });
    }

    if (!value) {
      return this.createError({ message: "Please select slider" });
    }

    return new Promise((resolve) => {
      let width, height;

      if (sliderType === "Web") {
        width = 1920;
        height = 600;
      } else if (sliderType === "App") {
        width = 1200;
        height = 840;
      }

      if (typeof value === "string") {
        resolve(true);
      } else if (value && value.name) {
        validateFile(value, width, height, resolve);
      } else {
        resolve(true);
      }
    });
  }),
});

export const sliderEditSchema = Yup.object().shape({
  sliderType: Yup.string("Enter slider type").required(
    "Slider type is required"
  ),
  title: Yup.string("Enter slider name")
    .required("Slider name is required")
    .max(50, "Allowed only 50 characters")
    .matches(nameRegex, "Enter valid slider name"),
  poster: Yup.mixed()
    .when("sliderType", {
      is: (sliderType) => sliderType === "Web",
      then: () =>
        Yup.mixed()
          .required("Please select image")
          .test("imageDimensions", "Image must be 1920x600 pixels", (file) => {
            return new Promise((resolve, reject) => {
              if (!file || !file.name) {
                resolve(true); // No file uploaded, so consider it valid
                return;
              }

              const image = new Image();
              image.src = URL.createObjectURL(file);

              image.onload = () => {
                if (image.width == 1920 && image.height == 600) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
              image.onerror = () => {
                resolve(false);
              };
            });
          })
          .test(
            "FILE_FORMAT",
            "Only .jpg, .jpeg, and .png files are allowed",
            (value) => {
              if (!value?.name) {
                let ext = value?.split(".")[1];
                return ["jpg", "jpeg", "png"].includes(ext);
              } else {
                return ["image/jpg", "image/jpeg", "image/png"].includes(
                  value?.type
                );
              }
            }
          )
          .test("fileSize", "File size must be 2MB or less", (file) => {
            if (file?.size) {
              return file.size <= 2097152;
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 1300, 120),
    })
    .when("sliderType", {
      is: (sliderType) => sliderType === "App",
      then: () =>
        Yup.mixed()
          .required("Please select image")
          .test("imageDimensions", "Image size should be 1200x840", (file) => {
            return new Promise((resolve, reject) => {
              if (!file || !file.name) {
                resolve(true); // No file uploaded, so consider it valid
                return;
              }

              const image = new Image();
              image.src = URL.createObjectURL(file);
              image.onload = () => {
                if (image.width == 1200 && image.height == 840) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
              image.onerror = () => {
                resolve(false);
              };
            });
          })
          .test("FILE_FORMAT", "Unsupported file type found.", (value) => {
            if (!value?.name) {
              let ext = value?.split(".")[1];
              return ["jpg", "jpeg", "png"].includes(ext);
            } else {
              return ["image/jpg", "image/jpeg", "image/png"].includes(
                value?.type
              );
            }
          })
          .test("fileSize", "Uploaded file is too big.", (file) => {
            if (file?.size) {
              return file.size <= 2097152;
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 400, 700),
    }),
  regionId: Yup.string().required("Please select city"),

  // .imageDimensionCheck("Please select slider image", 1600, 500),
});

export const bannerSchema = Yup.object().shape({
  bannerType: Yup.string("Enter banner type").required(
    "Please select banner type"
  ),
  title: Yup.string("Enter banner name")
    .required("Please enter banner name")
    .matches(nameRegex, "Enter valid banner name")
    .max(50, "Allowed only 50 characters"),
  poster: Yup.mixed()
    .required("Please select banner image")
    .when("bannerType", {
      is: (bannerType) => bannerType === "Web Banner",
      then: () =>
        Yup.mixed()
          .required("Please select banner image")
          .test(
            "imageDimensions",
            "Image size should be 1920x600 px",
            (file) => {
              return new Promise((resolve, reject) => {
                if (!file || !file.name) {
                  resolve(true); // No file uploaded, so consider it valid
                  return;
                }

                const image = new Image();
                image.src = URL.createObjectURL(file);
                image.onload = () => {
                  if (image.width === 1920 && image.height === 600) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                };
                image.onerror = () => {
                  resolve(false);
                };
              });
            }
          )
          .test(
            "FILE_FORMAT",
            "Only .jpg, .jpeg, and .png files are allowed",
            (value) => {
              if (!value?.name) {
                let ext = value?.split(".")[1];
                return ["jpg", "jpeg", "png"].includes(ext);
              } else {
                return ["image/jpg", "image/jpeg", "image/png"].includes(
                  value?.type
                );
              }
            }
          )
          .test("fileSize", "The file size must not exceed 2 MB.", (file) => {
            if (file?.size) {
              return file.size <= 2097152; // 2mb
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 1300, 120),
    })
    .when("bannerType", {
      is: (bannerType) => bannerType === "App Banner",
      then: () =>
        Yup.mixed()
          .required("Please select banner image")
          .test(
            "imageDimensions",
            "Image size should be 1080x1920 px",
            (file) => {
              return new Promise((resolve, reject) => {
                if (!file || !file.name) {
                  resolve(true); // No file uploaded, so consider it valid
                  return;
                }

                const image = new Image();
                image.src = URL.createObjectURL(file);
                image.onload = () => {
                  if (image.width === 1080 && image.height === 1920) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                };
                image.onerror = () => {
                  resolve(false);
                };
              });
            }
          )
          .test(
            "FILE_FORMAT",
            "Only .jpg, .jpeg, and .png files are allowed",
            (value) => {
              if (!value?.name) {
                let ext = value?.split(".")[1];
                return ["jpg", "jpeg", "png"].includes(ext);
              } else {
                return ["image/jpg", "image/jpeg", "image/png"].includes(
                  value?.type
                );
              }
            }
          )
          .test("fileSize", "The file size must not exceed 2 MB", (file) => {
            if (file?.size) {
              return file.size <= 2097152;
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 400, 700),
    }),
});
export const bannerEditSchema = Yup.object().shape({
  bannerType: Yup.string("Enter banner type").required(
    "Banner type is required"
  ),
  title: Yup.string("Enter banner name")
    .required("Banner name is required")
    .matches(nameRegex, "Enter valid banner name")
    .max(50, "Allowed only 50 characters"),
  // poster: Yup.mixed()
  //   .when("bannerType", {
  //     is: (bannerType) => bannerType === "Web Banner",
  //     then: () =>
  //       Yup.mixed().test(
  //         "FILE_SIZE",
  //         "Uploaded file is too big.",
  //         (value) => !value || (value && value.size <= 2097152)
  //       ),
  //     // .imageDimensionCheck("Please select banner image", 1300, 120),
  //   })
  //   .when("bannerType", {
  //     is: (bannerType) => bannerType === "App Banner",
  //     then: () =>
  //       Yup.mixed().test(
  //         "FILE_SIZE",
  //         "Uploaded file is too big.",
  //         (value) => !value || (value && value.size <= 2097152)
  //       ),
  //     // .imageDimensionCheck("Please select banner image", 400, 700),
  //   }),
  poster: Yup.mixed()
    .required("Please select banner image")
    .when("bannerType", {
      is: (bannerType) => bannerType === "Web Banner",
      then: () =>
        Yup.mixed()
          .required("Please select banner image")
          .test("imageDimensions", "Image size should be 1920x600", (file) => {
            if (typeof file === "string") return true;

            return new Promise((resolve, reject) => {
              if (!file || !file.name) {
                resolve(true); // No file uploaded, so consider it valid
                return;
              }
              const image = new Image();
              image.src = URL.createObjectURL(file);
              image.onload = () => {
                if (image.width === 1920 && image.height === 600) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
              image.onerror = () => {
                resolve(false);
              };
            });
          })
          .test(
            "FILE_FORMAT",
            "Only .jpg, .jpeg, and .png files are allowed",
            (value) => {
              if (typeof file === "string") return true;

              if (!value?.name) {
                let ext = value?.split(".")[1];
                return ["jpg", "jpeg", "png"].includes(ext);
              } else {
                return ["image/jpg", "image/jpeg", "image/png"].includes(
                  value?.type
                );
              }
            }
          )
          .test("fileSize", "The file size must not exceed 2 MB.", (file) => {
            if (typeof file === "string") return true;

            if (file?.size) {
              return file.size <= 2097152; //2 mb
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 1300, 120),
    })
    .when("bannerType", {
      is: (bannerType) => bannerType === "App Banner",
      then: () =>
        Yup.mixed()
          .required("Please select banner image")
          .test("imageDimensions", "Image size should be 1200x840", (file) => {
            if (typeof file === "string") return true;

            return new Promise((resolve, reject) => {
              if (!file || !file.name) {
                resolve(true); // No file uploaded, so consider it valid
                return;
              }

              const image = new Image();
              image.src = URL.createObjectURL(file);
              image.onload = () => {
                if (image.width === 1080 && image.height === 1920) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              };
              image.onerror = () => {
                resolve(false);
              };
            });
          })
          .test(
            "FILE_FORMAT",
            "Only .jpg, .jpeg, and .png files are allowed",
            (value) => {
              if (typeof file === "string") return true;

              if (!value?.name) {
                let ext = value?.split(".")[1];
                return ["jpg", "jpeg", "png"].includes(ext);
              } else {
                return ["image/jpg", "image/jpeg", "image/png"].includes(
                  value?.type
                );
              }
            }
          )
          .test("fileSize", "The file size must not exceed 2 MB", (file) => {
            if (typeof file === "string") return true;

            if (file?.size) {
              return file.size <= 2097152;
            } else {
              return true;
            }
          }),
      // .imageDimensionCheck("Please select banner image", 400, 700),
    }),
  bannerLink: Yup.string("Enter link").matches(urlRegex, "Enter correct url"),
  bannerShowSection: Yup.array().when("bannerType", {
    is: (bannerType) => bannerType === "Web Banner",
    then: () => Yup.array().min(1, "Select at least one banner show section"),
  }),
});
export const generalSettingSchema = Yup.object().shape({
  facebook: Yup.string()
    .required("Enter facebook link")
    .matches(urlRegex, "Enter correct url!"),
  twitter: Yup.string()
    .required("Enter twitter link")
    .matches(urlRegex, "Enter correct url!"),
  instagram: Yup.string()
    .required("Enter instagram link")
    .matches(urlRegex, "Enter correct url!"),
  youtube: Yup.string()
    .required("Youtube link is required")
    .matches(youtubeUrlRegex, "Enter correct url!"),
  linkedin: Yup.string()
    .required("Enter linkedin link")
    .matches(urlRegex, "Enter correct url!"),
  contact1: Yup.string()
    .required("Contact number is required")
    .matches(phoneRegExp, "Enter a valid contact number"),
  // contact2: Yup.string()
  //   .required("Contact number is required")
  //   .matches(phoneRegExp, "Enter a valid contact number"),
  email: Yup.string()
    .required("Email is required")
    .email("Email is not valid")
    .matches(emailRegex, "Enter a valid email"),
  companyName: Yup.string().required("Company name is required"),
  address: Yup.string().required("Address is required"),
  exp: Yup.string()
    .matches(/^\d+$/, "Enter valid years of experience")
    .required("Years of experience is required"),
  noOfScreens: Yup.string()
    .matches(/^\d+$/, "Enter valid number of screens")
    .required("Number of theater screens is required"),

  isWelcomeGift: Yup.boolean(),

  ticketsRequired: Yup.string()
    .matches(/^\d+$/, "Enter valid required tickets")
    .when("isWelcomeGift", {
      is: true,
      then: (schema) =>
        schema.required("Number of required tickets is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export const gallerySchema = Yup.object().shape({
  title: Yup.string("Enter title")
    .required("Please enter title")
    .max(50, "Title cannot exceed 50 characters")
    .matches(nameRegex, "Enter valid title"),
  description: Yup.string("Enter description")
    .required("Please enter description")
    .max(200, "Description cannot exceed 50 characters"),
  image: Yup.mixed()
    .required("Please select image")
    .test("imageDimensions", "Image must be 630x280 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width == 630 && image.height == 280) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg & .jpeg files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 630, 280),
});
export const galleryEditSchema = Yup.object().shape({
  title: Yup.string("Enter title")
    .required("Title is required")
    // .max(50, "Title cannot exceed 50 characters")
    .matches(nameRegex, "Enter valid title"),
  description: Yup.string("Enter description")
    .required("Description is required")
    .matches(nameRegex, "Enter valid description")
    .max(200, "Description cannot exceed 200 characters"),
  image: Yup.mixed()
    .test("imageDimensions", "Image must be 630x280 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width == 630 && image.height == 280) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg & .jpeg files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 630, 280),
});
export const galleryImageSchema = Yup.object().shape({
  image: Yup.mixed()
    .required("Please select image")
    .test("imageDimensions", "Image must be 1300x700 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width == 1300 && image.height == 700) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 1300, 700),
});
export const galleryImageEditSchema = Yup.object().shape({
  image: Yup.mixed()
    .test("imageDimensions", "Image must be 1300x700 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width == 1300 && image.height == 700) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 1300, 700),
});
export const fAndBSchema = Yup.object().shape({
  itemDescription: Yup.string("Enter food item name").required(
    "Please enter item name"
  ),
  // poster: Yup.mixed().test(
  //   "FILE_SIZE",
  //   "Uploaded file is too big.",
  //   (value) => value || (value && value.size <= 2097152)
  // ),
  // .imageDimensionCheck("Please select image", 214, 173),
  type: Yup.string("Enter food item type").required(
    "Please select food item type"
  ),

  // itemSequence: Yup.string()
  //   .test(
  //     "empty-sequence",
  //     "Please enter item sequence",
  //     (value) => value !== undefined && value !== null && value !== ""
  //   )
  //   .test(
  //     "valid-sequence",
  //     "Sequence number must be a between 1 to 50",
  //     (value) => Number(value) >= 1 && Number(value) <= 50
  //   )
  //   .test(
  //     "unique-sequence",
  //     "This sequence is already in use.",
  //     function (value) {
  //       const { foodSequences } = this.parent;
  //       if (foodSequences[0]?.sequence?.includes(Number(value)) && value) {
  //         return !foodSequences[0]?.sequence?.includes(Number(value));
  //       } else if (
  //         !foodSequences[0]?.sequence?.includes(Number(value)) &&
  //         value
  //       ) {
  //         return true;
  //       } else {
  //         return true;
  //       }
  //     }
  //   ),
});
export const FAQSchema = Yup.object().shape({
  question: Yup.string().required("Please add question"),
  answer: Yup.string().required("Please add answer"),
});
export const aboutUsCmsSchema = Yup.object().shape({
  aboutUs: Yup.string()
    .required("Please add data")
    .max(675, "Length of data should be less than 675 characters"),
});
export const cmsSchema = Yup.object().shape({
  cmsText: Yup.string().required("Please add data"),
});
export const partnerSchema = Yup.object().shape({
  partnerName: Yup.string("Enter partner name")
    .required("Partner name is required")
    .matches(nameRegex, "Enter valid partner name"),
  link: Yup.string("Enter link")
    .required("Redirect url is required")
    .matches(urlRegex, "Enter correct url!"),
});
export const partnerEditSchema = Yup.object().shape({
  partnerName: Yup.string("Enter partner name")
    .required("Partner name is required")
    .matches(nameRegex, "Enter valid partner name"),
  link: Yup.string("Enter link")
    .required("Redirect url is required")
    .matches(urlRegex, "Enter correct url!"),
});
export const bookingSchema = Yup.object().shape({
  fromDate: Yup.string("Enter from date").required("From date is required"),
  toDate: Yup.string("Enter to date").required("To date is required"),
});

export const blogSchema = Yup.object().shape({
  title: Yup.string()
    .required("Please enter blog title")
    .max(60, "Blog title should be less than 60 character"),
  description: Yup.string()
    .required("Please enter blog description")
    .min(3, "Blog description should be more than 3 character"),
  // .max(1000, "Blog description should be less than 1000 character"),
  image: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 1100x540", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 1100 && image.height === 540) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, or .jpeg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image", ["jpg", "jpeg", "png"]);
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image", ["jpg", "jpeg", "png"]);
      }
    ),
});

export const blogBackgroundSchema = Yup.object().shape({
  title: Yup.string()
    .required("Blog title is required")
    .max(25, "Blog title should be less than 25 character")
    .matches(
      /^(?!\s)[A-Za-z\s]+$/,
      "Blog title allowed only alphabet characters"
    ),
  image: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 1100x540", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 1100 && image.height === 540) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
});

export const gallaryBackgroundSchema = Yup.object().shape({
  title: Yup.string("Enter title")
    .required("Please enter title")
    .max(25, "Title cannot exceed 25 characters")
    .matches(/^(?!\s)[A-Za-z\s]+$/, "Title must contain only letters"),
  image: Yup.mixed()
    .required("Please select image")
    .test("imageDimensions", "Image must be 630x280 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 630 && image.height === 280) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "File size must be 2MB or less",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 630, 280),
});
export const gallaryBackgroundEditSchema = Yup.object().shape({
  title: Yup.string("Enter title")
    .required("Title is required")
    .max(25, "Title cannot exceed 25 characters")
    .matches(/^(?!\s)[A-Za-z\s]+$/, "Title must contain only letters"),
  image: Yup.mixed()
    .test("imageDimensions", "Image must be 630x280 pixels", (file) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 630 && image.height === 280) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) =>
        !value ||
        (["jpg", "jpeg", "png"].includes(
          value?.name?.substr(value?.name?.lastIndexOf(".") + 1)
        ) &&
          ["image/jpg", "image/jpeg", "image/png"].includes(value?.type))
    )
    .test(
      "FILE_SIZE",
      "Uploaded file is too big.",
      (value) => !value || (value && value.size <= 2097152)
    ),
  // .imageDimensionCheck("Please select image", 630, 280),
});

// Helper function to validate file type
const checkIsValidFileType = (fileName, type) => {
  const validTypes = {
    image: ["jpg", "jpeg", "png", "svg"],
    video: ["mp4", "mov", "avi", "wmv"],
  };
  const extension = fileName.split(".").pop().toLowerCase();
  return validTypes[type].includes(extension);
};

export const MemberShipSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title cannot contain more than 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(3, "Description should be more than 3 character"),
  image: Yup.mixed().test(
    "is-valid-type",
    "Please upload only .mp4, .mov, .avi, or .wmv files",
    (value) => {
      if (!value) return true;

      // For newly uploaded files, value is a File object
      if (value instanceof File) {
        return checkIsValidFileType(value.name, "video");
      }

      // For editing, value might be a string URL or an object with a name property
      const fileName = typeof value === "string" ? value : value.name;
      return checkIsValidFileType(fileName, "video");
    }
  ),
});
export const addUserSchema = Yup.object().shape({
  assignUserId: Yup.array().min(1, "Please select at least one user"),
});

export const couponSchema = Yup.object().shape({
  couponCategory: Yup.string().when("couponType", {
    is: (val) => val !== "Membership",
    then: (schema) => schema.required("Please select coupon category"),
    otherwise: (schema) => schema.notRequired(),
  }),
  couponUpTo: Yup.string().required("Please enter discount upto"),
  // couponUpTo: Yup.string()
  //   .required("Please enter discount upto")
  //   .test(
  //     "is-valid-discount",
  //     "Discount upto should be less than or equal to spent form",
  //     function (value) {
  //       const { discountType, spentForm, spentTo } = this.parent;
  //       if (discountType === "%" && value) {
  //         return parseInt(value, 10) <= parseInt(spentForm, 10);
  //       } else if (discountType === "flat" && value) {
  //         if (parseInt(value, 10) > parseInt(spentTo, 10)) {
  //           return this.createError({
  //             message: "Discount upto should be less than or equal to spent to",
  //           });
  //         }
  //       }
  //       return true;
  //     }
  //   ),
  discountType: Yup.string().required("Please select discount type"),
  // discount: Yup.string()
  //   .nullable()
  //   .test("cinema-validation", function (value) {
  //     const { discountType } = this.parent;
  //     if (discountType == null) {
  //       return this.createError({
  //         message: "Please select discount type first",
  //       });
  //     }
  //     return !!value || this.createError({ message: "Please enter discount" });
  //   }),
  discount: Yup.string()
    .nullable()
    .test("cinema-validation", function (value) {
      const { discountType, spentTo } = this.parent;
      if (discountType == null) {
        return this.createError({
          message: "Please select discount type first",
        });
      }
      if (!value) {
        return this.createError({ message: "Please enter discount" });
      }
      if (discountType === "flat") {
        const discountValue = parseInt(value, 10);
        if (isNaN(discountValue) || discountValue > spentTo) {
          return this.createError({
            message:
              "Discount should be less than or equal to range of spent to",
          });
        }
      }
      return true;
    }),

  couponFor: Yup.array().when("couponType", {
    is: (val) => val !== "Membership",
    then: (schema) =>
      schema
        .min(1, "Please select at least one coupon option")
        .required("Please select at least one coupon option"),
    otherwise: (schema) => schema.notRequired(),
  }),
  couponType: Yup.string().required("Please select type of coupon"),
  couponTitle: Yup.string().required("Please enter coupon code title"),
  couponUsage: Yup.string().required("Please enter coupon code (per user)"),
  couponStartDate: Yup.string().required("Please select start date"),
  couponEndDate: Yup.string().required("Please select end date"),
  couponCodeOverAllUsage: Yup.string().required(
    "Please enter over all coupon code usage"
  ),
  couponDescription: Yup.string().when("couponType", {
    is: (val) => val !== "Membership",
    then: (schema) => schema.required("Please enter coupon code description"),
    otherwise: (schema) => schema.notRequired(),
  }),
  movieLanguage: Yup.array().test("movieLanguage-validation", function (value) {
    const { couponType } = this.parent;
    if (couponType === "Ecommerce" || couponType === "Membership") {
      return true;
    }
    if (!value || value.length === 0) {
      return this.createError({
        message: "Please select movie language",
      });
    }

    if (value.length < 1) {
      return this.createError({
        message: "At least one movie language must be selected",
      });
    }
    return true;
  }),
  city: Yup.array().test("city-validation", function (value) {
    const { couponType } = this.parent;
    if (couponType === "Ecommerce" || couponType === "Membership") {
      // if (couponType === "Ecommerce") {
      return true; // Skip validation for Ecommerce
    }
    if (!value || value.length === 0) {
      return this.createError({
        message: "Please select area/city",
      });
    }
    if (value.length < 1) {
      return this.createError({
        message: "At least one area/city must be selected",
      });
    }
    return true;
  }),
  // movieLanguage: Yup.array()
  //   .required("Please select movie language")
  //   .min(1, "At least one movie language must be selected"),
  // city: Yup.array().required("Please select area/city"),
  // city: Yup.array()
  //   .min(1, "At least one area/city must be selected")
  //   .required("Please select area/city"),
  // cinema: Yup.object().required("Please select cinema"),
  cinema: Yup.array()
    .nullable()
    .test("cinema-validation", function (value) {
      const { couponType, city } = this.parent;
      if (couponType === "Ecommerce" || couponType === "Membership") {
        // if (couponType === "Ecommerce") {
        return true;
      }
      if (!city || city.length === 0) {
        return this.createError({
          message: "Please select area/city first",
        });
      }
      if (!value || value.length === 0) {
        return this.createError({
          message: "Please select cinema(theater)",
        });
      }
      if (value.length < 1) {
        return this.createError({
          message: "At least one cinema(theater) must be selected",
        });
      }
      return true;
    }),
  // cinema: Yup.array()
  //   .nullable()
  //   .min(1, "At least one cinema(theater) must be selected")
  //   .test("cinema-validation", function (value) {
  //     const { city } = this.parent;
  //     if (city == null) {
  //       return this.createError({ message: "Please select area/city first" }); // No need to validate cinema if city is not selected
  //     }
  //     return (
  //       !!value ||
  //       this.createError({ message: "Please select cinema(theater)" })
  //     );
  //   }),
  // assignUserId: Yup.array().required("Please assign the coupon"),
  // subscriptionId: Yup.string().required("Please select subscription"),

  image: Yup.mixed()
    .notRequired()
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;
        if (couponType === "Ecommerce" || couponType === "Membership") {
          return true;
        }
        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
  spentForm: Yup.number().when("couponType", {
    is: (val) => val !== "Ecommerce" && val !== "Membership",
    then: (schema) =>
      schema
        .typeError("Spent From must be a number")
        .required("Spent From is required")
        .moreThan(0, "Spent From must be greater than 0"),
    otherwise: (schema) => schema.notRequired(),
  }),

  spentTo: Yup.number().when("couponType", {
    is: (val) => val !== "Ecommerce" && val !== "Membership",
    then: (schema) =>
      schema
        .typeError("Spent To must be a number")
        .required("Please enter range of spent to")
        .test(
          "spent-to-validation",
          "Spent To must be greater than Spent From",
          function (value) {
            const { spentForm } = this.parent;
            return spentForm == null || value == null || value > spentForm;
          }
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const subscriptionSchema = Yup.object().shape({
  title: Yup.string().required("Please enter subscription title"),
  price: Yup.string().required("Please enter subscription price"),
  // discountOfFAndB: Yup.string().required("Please enter discount of f & b"),
  // discountOnTicket: Yup.string().required("Please enter discount on tickets"),
  // freeTicket: Yup.string().required("Pleae enter free tickets"),
  // priorityBooking: Yup.string().required("Please select priority booking"),
  // accessToExclusiveScreening: Yup.string().required(
  //   "Please select access to exclusive screenings"
  // ),
  // guestPasses: Yup.string().required("Please enter guest passes"),
  // specialEventAccess: Yup.string().required(
  //   "Please select special event access"
  // // ),
  // earlyAccessToTickets: Yup.string().required(
  //   "Please select early access to tickets"
  // ),
  // support: Yup.string().required("Please enter support"),
  // monthlyAccess: Yup.string().required("Please enter monthly access"),
  // coins: Yup.string().required("Please enter coins"),
  welcomeGift: Yup.string().required("Please select welcome gift"),
  membershipDuration: Yup.string().required(
    "Please select membership duration"
  ),
  // isDiscounted: Yup.boolean(),
  // discountedPrice: Yup.string().when('isDiscounted', {
  //   is: true,
  //   then: Yup.string().required("Please enter discounted price"),
  //   otherwise: Yup.string().notRequired(),
  // }),
});

export const rewardConfigSchema = Yup.object().shape({
  earnRate: Yup.string()
    .required("Please enter earn rate")
    .test("min", "Earn rate must be at least 1", (val) => Number(val) >= 1)
    .test("max", "Earn rate cannot exceed 100", (val) => Number(val) <= 100),
  conversionPoints: Yup.string()
    .required("Please enter conversion points")
    .test(
      "min",
      "Conversion points must be at least 1",
      (val) => Number(val) >= 1
    ),
  conversionValue: Yup.string()
    .required("Please enter conversion value")
    .test(
      "min",
      "Conversion value must be at least 1",
      (val) => Number(val) >= 1
    ),
  maxRedemptionCap: Yup.string()
    .required("Please enter max redemption cap")
    .test(
      "min",
      "Max redemption cap must be at least 1",
      (val) => Number(val) >= 1
    ),
  expiryRule: Yup.string()
    .required("Please select expiry rule")
    .oneOf(["fixed", "rolling"], "Invalid expiry rule"),
  expiryDays: Yup.string()
    .required("Please enter expiry days")
    .test("min", "Expiry days must be at least 1", (val) => Number(val) >= 1)
    .test(
      "max",
      "Expiry days cannot exceed 9999",
      (val) => Number(val) <= 9999
    ),
  expiringSoonDays: Yup.string()
    .required("Please enter expiring soon threshold")
    .test(
      "min",
      "Expiring soon days must be at least 1",
      (val) => Number(val) >= 1
    )
    .test(
      "max",
      "Expiring soon days cannot exceed 365",
      (val) => Number(val) <= 365
    ),
});

export const advertiseImageSchema = Yup.object().shape({
  title: Yup.string().required("Please enter title"),
  description: Yup.string()
    .required("Please enter description")
    .min(3, "Description should be more than 3 character"),
  advertiseBgImg: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 1920x350", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 1920 && image.height === 350) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
  advertiseWithUsImg: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 630x570", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 630 && image.height === 570) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
});

export const careerImageSchema = Yup.object().shape({
  title: Yup.string().required("Please enter title"),
  description: Yup.string()
    .required("Please enter description")
    .min(3, "Description should be more than 3 character"),
  careerBgImg: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 1920x350", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 1920 && image.height === 350) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
  careerWithUsImg: Yup.mixed()
    .notRequired()
    .test("imageDimensions", "Image size should be 630x570", (file) => {
      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true);
          return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          if (image.width === 630 && image.height === 570) {
            resolve(true);
          } else {
            resolve(false);
          }
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "is-valid-type",
      "Please upload only .jpg, .png, .jpeg, or .svg files",
      (value) => {
        if (!value) return true;

        // For newly uploaded files, value is a File object
        if (value instanceof File) {
          return isValidFileType(value.name, "image");
        }

        // For editing, value might be a string URL or an object with a name property
        const fileName = typeof value === "string" ? value : value.name;
        return isValidFileType(fileName, "image");
      }
    ),
});

export const ecommerceBannerEditSchema = Yup.object().shape({
  category: Yup.string("Enter category").required("Category is required"),
  title: Yup.string("Enter banner title")
    .required("Banner title is required")
    .matches(nameRegex, "Enter valid banner title")
    .min(5, "Banner title must be atleast 5 characters")
    .max(50, "Allowed only 50 characters"),
  poster: Yup.mixed()
    .required("Please select banner image")
    .test("imageDimensions", "Image size should be 1920x600", (file) => {
      if (typeof file === "string") return true;

      return new Promise((resolve) => {
        if (!file || !file.name) {
          resolve(true); // No file uploaded, so consider it valid
          return;
        }
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          // Remove any condition based on image width and height
          resolve(true);
        };
        image.onerror = () => {
          resolve(false);
        };
      });
    })
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      (value) => {
        if (typeof value === "string") return true;

        if (!value?.name) {
          let ext = value?.split(".")[1];
          return ["jpg", "jpeg", "png"].includes(ext);
        } else {
          return ["image/jpg", "image/jpeg", "image/png"].includes(value?.type);
        }
      }
    )
    .test("fileSize", "The file size must not exceed 2 MB.", (file) => {
      if (typeof file === "string") return true;

      if (file?.size) {
        return file.size <= 2097152; // 2 MB
      } else {
        return true;
      }
    }),
  description: Yup.string("Enter description")
    .required("Description is required")
    .matches(nameRegex, "Enter valid description")
    .max(150, "Allowed only 150 characters")
    .min(5, "Description must be atleast 5 characters"),
});

export const notificationSchema = (isCinemaSelectionEnabled) =>
  Yup.object().shape({
    title: Yup.string()
      .required("Please enter notification title")
      .max(60, "Blog title should be less than 60 characters"),

    description: Yup.string()
      .required("Please enter notification description")
      .min(3, "Blog description should be more than 3 characters"),

    image: Yup.mixed()
      .required("Image is required")
      .test("imageDimensions", "Image size should be 1100x540", (file) => {
        return new Promise((resolve) => {
          if (!file || !file.name) {
            resolve(true);
            return;
          }

          const image = new Image();
          image.src = URL.createObjectURL(file);
          image.onload = () => {
            resolve(image.width === 1100 && image.height === 540);
          };
          image.onerror = () => resolve(false);
        });
      })
      .test(
        "is-valid-type",
        "Please upload only .jpg, .png, .jpeg, or .svg files",
        (value) => {
          if (!value) return true;

          if (value instanceof File) {
            return isValidFileType(value.name, "image");
          }

          const fileName = typeof value === "string" ? value : value.name;
          return isValidFileType(fileName, "image");
        }
      ),

    date: Yup.string()
      .required("Please select a date")
      .test(
        "is-not-past-time",
        "Selected date cannot be in the past",
        function (value) {
          const { date } = this.parent;
          if (!value) return false;

          const selectedDate = moment(value, "YYYY-MM-DD").startOf("day");

          const currentDate = moment().startOf("day");

          return selectedDate.isSameOrAfter(currentDate);
        }
      ),
    time: Yup.string()
      .required("Please select a time")
      .test(
        "is-not-past-time",
        "Selected time cannot be in the past",
        function (value) {
          const { date } = this.parent;
          if (!date || !value) return false;
          const formattedTime = moment(value).format("HH:mm");
          const dateTimeString = `${moment(date).format(
            "YYYY-MM-DD"
          )}T${formattedTime}`;
          const selectedDateTime = moment(dateTimeString, "YYYY-MM-DDTHH:mm");

          const currentDateTime = moment();

          return selectedDateTime.isSameOrAfter(currentDateTime);
        }
      ),
    cinemaIds: isCinemaSelectionEnabled
      ? Yup.array()
          .min(1, "Please select at least one cinema")
          .required("Please select at least one cinema")
      : Yup.array(),
  });

export const feeSchema = Yup.object().shape({
  fee: Yup.string()
    .matches(/^[0-9]+$/, "Fee must be a number")
    .required("Fee is required"),
});
