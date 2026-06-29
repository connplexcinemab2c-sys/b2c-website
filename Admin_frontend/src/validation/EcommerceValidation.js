import * as Yup from "yup";
const nameRegex = /^(.+)$/gm;
const MAX_MB_SIZE = 2097152; //2mb
const IMAGE_MAX_MB_SIZE = 2 * 1024 * 1024;
const VIDEO_MAX_MB_SIZE = 10 * 1024 * 1024;
const IMAGE_MAX_WIDTH = 480;
const IMAGE_MAX_HEIGHT = 720;
const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const addEditCategorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Please enter category name")
    .matches(nameRegex, "Enter valid category name")
    .max(20, "Allowed only 20 characters"),
  image: Yup.mixed()
    .required("Please select category image")
    .test(
      "FILE_FORMAT",
      "Only .jpg, .jpeg, and .png files are allowed",
      function (value) {
        const { isEdit } = this.options.context;
        if (isEdit && typeof value === "string") {
          return true;
        }
        if (!value?.name) {
          let ext = value?.split(".")[1];
          return ["jpg", "jpeg", "png"].includes(ext);
        } else {
          return ["image/jpg", "image/jpeg", "image/png"].includes(value?.type);
        }
      }
    )
    .test("fileSize", "The file size must not exceed 2 MB.", function (value) {
      const { isEdit } = this.options.context;
      if (isEdit && typeof value === "string") {
        return true;
      }
      if (value?.size) {
        return value.size <= MAX_MB_SIZE;
      } else {
        return true;
      }
    }),
});

export const attributeValidationSchema = (isColor) =>
  Yup.object().shape({
    category: Yup.string().required("Please select category"),

    name: Yup.string()
      .required("Please enter attribute name")
      .matches(nameRegex, "Enter valid attribute name")
      .max(20, "Allowed only 20 characters"),

    variants: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required("Variant name is required"),
        colorCode: Yup.string()
          .test(
            "conditional-required",
            "Variant color code is required",
            function (value) {
              // Only apply validation if isColor is true
              console.log(value, isColor, 124);
              if (isColor) {
                console.log("gdgdgdg", 126);
                // If isColor is true and colorCode is empty or null, trigger error
                if (!value || value.trim() === "") {
                  return this.createError({
                    message: "Variant color code is required",
                  });
                }
              }
              // Skip validation if isColor is false
              return true;
            }
          )
          .nullable(true)
          .transform((value) => value || null),
      })
    ),
  });

// export const attributeValidationSchema = (isColor) =>
//   Yup.object().shape({
//     category: Yup.string().required("Please select category"),

//     name: Yup.string()
//       .required("Please enter attribute name")
//       .matches(nameRegex, "Enter valid attribute name")
//       .max(20, "Allowed only 20 characters"),

//     variants: Yup.array().of(
//       Yup.object().shape({
//         name: Yup.string().required("Variant name is required"),

//         colorCode: Yup.string().test(
//           "conditional-required",
//           "Variant name is required",
//           function (value) {
//             // Log the value to see it in the console
//             console.log("colorCode value:", value); // This will log the actual value of colorCode

//             // Returning conditionally based on `isColor`
//             return value || !isColor;
//           }
//         ),
//       })
//     ),
//   });

// export const attributeValidationSchema = Yup.object().shape({
//   category: Yup.string().required("Please select category"),

//   name: Yup.string()
//     .required("Please enter attribute name")
//     .matches(nameRegex, "Enter valid attribute name")
//     .max(20, "Allowed only 20 characters"),

//   variants: Yup.array().of(
//     Yup.object().shape({
//       // Validation for the 'name' field (same as before)
//       // name: Yup.string()
//       //   .max(20, "Variant name can be up to 20 characters")
//       //   .test(
//       //     "conditional-required",
//       //     "Variant name is required",
//       //     function (value, context) {
//       //       const { path, parent } = context; // Accessing the array
//       //       const index = parseInt(path.match(/\d+/)?.[0] ?? -1, 10); // Get the current index
//       //       if (parent?.length > 1 && index >= 0) {
//       //         return value && value.trim() !== ""; // Required for all variants if more than one exists
//       //       }
//       //       return true; // Not required if it's the only variant
//       //     }
//       //   ),

//       // name: Yup.string().required("variant name is required"),

//       colorCode: Yup.string()
//         .required("Variant color code is required")
//         .matches(/^#[0-9A-F]{6}$/i, "Invalid color code"), // Ensure it's a valid hex color code
//     })
//   ),
// });
export const productValidationSchema = Yup.object().shape({
  productName: Yup.string()
    .required("Product Name is required")
    .min(3, "Product Name must be at least 3 characters")
    .max(50, "Product Name cannot exceed 50 characters"),

  category: Yup.string().required("Category is required"),

  seller: Yup.string().required("Seller is required"),

  description: Yup.string()
    .required("Description is required")
    .max(250, "Description cannot exceed 250 characters"),

  colors: Yup.array()
    .of(
      Yup.object().shape({
        colorName: Yup.string().required("Color name is required"),
        colorImages: Yup.array()
          .of(
            Yup.mixed()
              .required("Please select a color image")
              .test(
                "FILE_FORMAT",
                "Only .jpg, .jpeg, and .png files are allowed",
                function (value) {
                  if (!value?.name) {
                    const ext = value?.split(".")[1];
                    return ["jpg", "jpeg", "png", "mp4", "webm"].includes(ext);
                  } else {
                    return [
                      "image/jpg",
                      "image/jpeg",
                      "image/png",
                      "video/mp4",
                      "video/webm",
                    ].includes(value?.type);
                  }
                }
              )
              .test(
                "fileSize",
                "The file size must not exceed 2 MB.",
                function (value) {
                  if (value?.size) {
                    return value.size <= MAX_MB_SIZE;
                  } else {
                    return true;
                  }
                }
              )
          )
          .min(1, "At least one image is required"),
      })
    )
    .min(1, "At least one color is required"),

  attributes: Yup.array()
    .of(
      Yup.object().shape({
        // attribute: Yup.string().required("Attribute is required"),
        Color: Yup.string().required("Color is required"),
        Size: Yup.array().min(1, "Please select size"),
        // variants: Yup.array()
        //   .of(
        //     Yup.string()
        //       .required("Variant is required")
        //       .max(20, "Variant cannot exceed 20 characters")
        //   )
        //   .test(
        //     "conditional-required",
        //     "If there are multiple variants, all must be filled",
        //     (variants) => {
        //       if (variants?.length > 1) {
        //         return variants.every((variant) => variant && variant.trim() !== "");
        //       }
        //       return true; // Pass validation if no variants or just one
        //     }
        //   ),
        price: Yup.number()
          .test("price-required", "Price is required", (value) => {
            const parseValue = parseFloat(value);
            return !isNaN(parseValue);
          })
          .test("is-valid-price", "Price must be greater than 0", (value) => {
            const parseValue = value ? parseFloat(value) : 0;
            return parseValue > 0;
          })
          .test("max-decimal", "Price must be up to 2 decimal", (value) => {
            return (
              value === undefined ||
              value === null ||
              /^\d+(\.\d{1,2})?$/.test(value.toString())
            );
          }),
        discountedPrice: Yup.number()
          .typeError("Discounted price must be a number")
          .when("price", {
            is: (price) => price || 0,
            then: () =>
              Yup.number()
                .lessThan(
                  Yup.ref("price"),
                  "Discounted Price must be less than Price"
                )
                .test(
                  "is-valid-discounted-price",
                  "Discounted Price must be greater than 0",
                  (value) => {
                    return !value || value > 0;
                  }
                )
                .test(
                  "max-decimal",
                  "Discounted Price must be up to 2 decimal",
                  (value) => {
                    return (
                      value === undefined ||
                      value === null ||
                      /^\d+(\.\d{1,2})?$/.test(value.toString())
                    );
                  }
                ),
            otherwise: () => Yup.number().nullable(),
          }),
        stock: Yup.number()
          .typeError("Stock must be a number")
          .required("Stock is required")
          .min(0, "Stock must be greater than or equal to 0"),
        images: Yup.array()
          .of(
            Yup.mixed()
              .required("Image is required")
              .test(
                "IMAGE_FILE_FORMAT", // Unique name for image format test
                "Only .jpg, .jpeg, and .png files are allowed",
                function (value) {
                  if (!value) return false; // Fail if no value

                  const mimeType = value?.type;
                  const fileName = value?.name || value; // Fallback to value if no name
                  const ext = fileName?.split(".").pop()?.toLowerCase();

                  // Allowed MIME types and extensions
                  const allowedMimeTypes = [
                    "image/jpg",
                    "image/jpeg",
                    "image/png",
                    "video/mp4",
                    "video/webm",
                  ];
                  const allowedExtensions = [
                    "jpg",
                    "jpeg",
                    "png",
                    "mp4",
                    "webm",
                  ];

                  // Check MIME type (if present) and extension
                  const isValidMimeType =
                    mimeType && allowedMimeTypes.includes(mimeType);
                  const isValidExtension =
                    ext && allowedExtensions.includes(ext);

                  // Explicitly reject .jfif even if MIME type is image/jpeg
                  if (ext === "jfif") return false;

                  // Pass if extension is valid and MIME type (if present) is valid
                  return isValidExtension && (!mimeType || isValidMimeType);
                }
              )
              .test(
                "imageFileSize",
                "The image size must not exceed 2 MB.",
                function (value) {
                  const type = value?.type?.split("/")?.[0];
                  if (value?.size && type == "image") {
                    return value.size < IMAGE_MAX_MB_SIZE;
                  } else {
                    return true;
                  }
                }
              )
              .test(
                "fileDimensions",
                `Image dimensions must be equal or less than ${IMAGE_MAX_WIDTH}x${IMAGE_MAX_HEIGHT}`,
                function (value) {
                  const type = value?.type?.split("/")?.[0];
                  if (value?.name && type == "image") {
                    const img = new Image();
                    img.src = URL.createObjectURL(value);
                    return new Promise((resolve) => {
                      img.onload = () => {
                        if (
                          img.width <= IMAGE_MAX_WIDTH &&
                          img.height <= IMAGE_MAX_HEIGHT
                        ) {
                          resolve(true);
                        } else {
                          resolve(false);
                        }
                      };
                      img.onerror = () => resolve(false);
                    });
                  } else {
                    return true; // If no file, return true
                  }
                }
              )
              .test(
                "FILE_FORMAT",
                "Only .mp4 and .webm files are allowed",
                function (value) {
                  const type = value?.type?.split("/")?.[0];
                  if (value?.name && type == "video") {
                    if (!value?.name) {
                      const ext = value?.split(".")[1];
                      return ["mp4", "webm"].includes(ext);
                    } else {
                      return ["video/mp4", "video/webm"].includes(value?.type);
                    }
                  } else {
                    return true;
                  }
                }
              )
              .test(
                "videoFileSize",
                "The video size must not exceed 10 MB.",
                function (value) {
                  const type = value?.type?.split("/")?.[0];
                  if (value?.size && type == "video") {
                    return value.size < VIDEO_MAX_MB_SIZE;
                  } else {
                    return true;
                  }
                }
              )
          )
          .min(1, "At least 1 file is required")
          .max(6, "Maximum of 6 files allowed"),
      })
    )
    .min(1, "At least one attribute is required"),
  width: Yup.number()
    .typeError("Width must be a number")
    .required("Width is required")
    .min(0, "Width must be greater than or equal to 0"),
  height: Yup.number()
    .typeError("Height must be a number")
    .required("Height is required")
    .min(0, "Height must be greater than or equal to 0"),
  weight: Yup.number()
    .typeError("Weight must be a number")
    .required("Weight is required")
    .min(0, "Weight must be greater than or equal to 0"),
});

export const sellerValidationSchema = Yup.object().shape({
  businessName: Yup.string().required("Business name is required"),

  businessEmail: Yup.string().required("Business email is required"),

  businessPhoneNumber: Yup.string().required(
    "Business phone number is required"
  ),
  addressName: Yup.string().required("Business address is required"),

  state: Yup.string().required("State is required"),

  city: Yup.string().required("City is required"),

  zipcode: Yup.string()
    .matches(
      /^\d{6}$/,
      "Zipcode must be exactly 6 digits and contain only numbers"
    )
    .test(
      "not-all-zeros",
      "Zipcode cannot be all zeros",
      (value) => value != "000000"
    )
    .required("Zip code is required"),
  pocName: Yup.string().required("POC name is required"),

  pocPhoneNumber: Yup.string().required("POC phone number is required"),
  bankName: Yup.string().required("Bank name is required"),

  accountNumber: Yup.string()
    .matches(/^[0-9]{9,18}$/, "Account number must be 9 to 18 digits")
    .required("Account number is required"),
  ifscCode: Yup.string()
    .matches(ifscRegex, "Invalid IFSC code")
    .required("IFSC code is required"),
  gstNumber: Yup.string()
    .matches(
      gstRegex,
      "Invalid GST number. Must be 15 characters (e.g., 22AAAAA0000A1Z5) with no special characters"
    )
    .required("GST number is required"),
  // password: Yup.string().when("isEdit", {
  //   is: (isEdit) => {
  //     isEdit === false;
  //     console.log("isEdit", isEdit);
  //   },
  //   then: () => {
  //     Yup.string().required("Password is required");
  //   },
  // }),
  password: Yup.string().when("isEdit", {
    is: (isEdit) => {
      console.log("isEdit", isEdit);
      return isEdit === false;
    },
    then: () => Yup.string().required("Password is required"),
    otherwise: () => Yup.string().notRequired(),
  }),
});
