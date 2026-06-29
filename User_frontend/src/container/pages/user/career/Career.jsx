import React, { useEffect, useRef } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

function Career() {
  const dispatch = PagesIndex.useDispatch();
  const [careerDetails, setCareerDetails] = useState({});
  const formikRef = useRef();
  const recaptchaRef = useRef();
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    position: "",
    resume: "",
    message: "",
    reCaptcha: "",
  };
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileTypeError, setFileTypeError] = useState("");
  const handleSubmit = (values, {setFieldValue ,setSubmitting }) => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new FormData();
    urlEncoded.append("firstName", values.firstName);
    urlEncoded.append("lastName", values.lastName);
    urlEncoded.append("city", values.city);
    urlEncoded.append("position", values.position);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("message", values.message);
    urlEncoded.append("resume", values.resume);

    PagesIndex.apiPostHandler(
      PagesIndex.Api.SUBMIT_CAREER_APPLICATION,
      urlEncoded
    ).then((res) => {
      dispatch(PagesIndex.hideLoader());
      if (res?.status === 201) {
        PagesIndex.toast.success(res?.message);
        setPdfUrl("");
        recaptchaRef.current?.reset();
        formikRef.current.resetForm();
        setFieldValue("reCaptcha", "");
        setSubmitting(false);
      } else {
        PagesIndex.toast.error(res?.message);
        setSubmitting(false);
      }
    });
  };

  const getCareerDetails = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_CAREER_BANNER).then((res) => {
      dispatch(PagesIndex.hideLoader());

      if (res?.status === 200) {
        setCareerDetails(res?.data?.[0]);
      }
    });
  };

  console.log(careerDetails);

  useEffect(() => {
    getCareerDetails();
  }, []);

  return (
    <Index.Box className="main-career">
      <PagesIndex.BannerImage
        bannerImage={
          careerDetails?.filebg
            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${careerDetails?.filebg}`
            : PagesIndex.Jpg.contactBanner
        }
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle={careerDetails?.title || "Career With Us"}
        bannerDescription={careerDetails?.description}
      />
      <Index.Box className="main-career-wrapper">
        <Index.Box className="cus-container">
          <Index.Grid container spacing={{ md: 5, xxs: 4 }} alignItems="center">
            <Index.Grid item lg={6} xxs={12} className="career-left">
              <Index.Box className="career-img">
                <img
                  src={
                    careerDetails?.file
                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${careerDetails?.file}`
                      : PagesIndex.Jpg.membership
                  }
                  alt="career"
                />
              </Index.Box>
            </Index.Grid>
            <Index.Grid item lg={6} xxs={12} className="career-right">
              <Index.Box className="career-form">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="career-form-title"
                >
                  Career With Us
                </Index.Typography>
                <PagesIndex.Formik
                  enableReinitialize
                  onSubmit={handleSubmit}
                  initialValues={initialValues}
                  validationSchema={PagesIndex.careersWithUsSchema}
                  innerRef={formikRef}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    isSubmitting,
                  }) => (
                    <Index.Stack
                      className="form-control"
                      component="form"
                      noValidate
                      autoComplete="off"
                      onSubmit={handleSubmit}
                    >
                      <Index.Grid container spacing={2} className="form-group">
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            First name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="firstNameCareer"
                            className="form-control"
                            placeholder="Enter first name"
                            name="firstName"
                            value={values?.firstName}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 30) {
                                setFieldValue("firstName", newValue);
                              }
                            }}
                            error={
                              errors.firstName && touched.firstName
                                ? true
                                : false
                            }
                            helperText={
                              errors.firstName && touched.firstName
                                ? errors.firstName
                                : null
                            }
                            inputProps={{ maxLength: 30 }}
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Last name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="lastNameCareer"
                            className="form-control"
                            placeholder="Enter last name"
                            name="lastName"
                            value={values?.lastName}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 30) {
                                setFieldValue("lastName", newValue);
                              }
                            }}
                            error={
                              errors.lastName && touched.lastName ? true : false
                            }
                            helperText={
                              errors.lastName && touched.lastName
                                ? errors.lastName
                                : null
                            }
                            inputProps={{ maxLength: 30 }}
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Email
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="emailCareer"
                            className="form-control"
                            placeholder="Enter email"
                            // type="email"
                            name="email"
                            inputProps={{ maxLength: 320 }}
                            value={values?.email}
                            onChange={(e) => {
                              setFieldValue("email", e.target.value.trim());
                            }}
                            error={errors.email && touched.email ? true : false}
                            helperText={
                              errors.email && touched.email
                                ? errors.email
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Phone number
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="phoneCareer"
                            className="form-control"
                            placeholder="Enter phone number"
                            name="phoneNumber"
                            inputProps={{ maxLength: 10 }}
                            value={values?.phoneNumber}
                            onChange={(e) => {
                              const newValue = e.target.value.replace(
                                /\D+/g,
                                ""
                              );
                              if (newValue.length <= 10) {
                                setFieldValue("phoneNumber", newValue);
                              }
                            }}
                            error={
                              errors.phoneNumber && touched.phoneNumber
                                ? true
                                : false
                            }
                            helperText={
                              errors.phoneNumber && touched.phoneNumber
                                ? errors.phoneNumber
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            City
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="cityCareer"
                            className="form-control"
                            placeholder="Enter city"
                            name="city"
                            inputProps={{ maxLength: 50 }}
                            value={values?.city}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 50) {
                                setFieldValue("city", newValue);
                              }
                            }}
                            error={errors.city && touched.city ? true : false}
                            helperText={
                              errors.city && touched.city ? errors.city : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Position
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="positionCareer"
                            className="form-control"
                            placeholder="Enter position"
                            name="position"
                            inputProps={{ maxLength: 50 }}
                            value={values?.position}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 50) {
                                setFieldValue("position", newValue);
                              }
                            }}
                            error={
                              errors.position && touched.position ? true : false
                            }
                            helperText={
                              errors.position && touched.position
                                ? errors.position
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={12} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Message
                          </Index.FormHelperText>
                          <Index.TextareaAutosize
                            minRows={5}
                            placeholder="Enter message"
                            name="message"
                            value={values?.message}
                            maxLength={251}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 251) {
                                setFieldValue("message", newValue);
                              }
                            }}
                            error={
                              errors.message && touched.message ? true : false
                            }
                          />
                          <Index.FormHelperText error>
                            {errors.message && touched.message
                              ? errors.message
                              : null}
                          </Index.FormHelperText>
                        </Index.Grid>
                        <Index.Grid item sm={12} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Resume
                          </Index.FormHelperText>
                          <Index.Box className="file-upload-box">
                            {pdfUrl ? (
                              <Index.Box className="file-value">
                                <Index.Link to={pdfUrl} target="_blank">
                                  <Index.PictureAsPdfIcon />
                                  <Index.Typography
                                    component="span"
                                    variant="span"
                                  >
                                    {values?.resume?.name}
                                  </Index.Typography>
                                </Index.Link>
                                <PagesIndex.Button
                                  onClick={() => {
                                    setFieldValue("resume", "");
                                    setPdfUrl("");
                                  }}
                                >
                                  X
                                </PagesIndex.Button>
                              </Index.Box>
                            ) : (
                              <label className="file-label">
                                <Index.CloudUploadIcon />
                                Drag & drop file or Browse
                              </label>
                            )}
                            <input
                              id="resumeCareer"
                              className="form-control"
                              type="file"
                              accept="application/pdf"
                              name="resume"
                              onChange={(event) => {
                                // setFieldValue(
                                //   "resume",
                                //   event.currentTarget.files[0],
                                // );
                                // setPdfUrl(
                                //   URL.createObjectURL(
                                //     event.currentTarget.files[0]
                                //   )
                                // );
                                const selectedFile =
                                  event.currentTarget.files[0];

                                if (
                                  selectedFile &&
                                  selectedFile.type !== "application/pdf"
                                ) {
                                  setFileTypeError(
                                    "Only .pdf file is allowed"
                                  );
                                } else {
                                  setFileTypeError("");
                                  setFieldValue("resume", selectedFile);
                                  setPdfUrl(URL.createObjectURL(selectedFile));
                                }
                              }}
                              onClick={(event) => {
                                event.target.value = null;
                              }}
                              onDragOverCapture={(event) => {
                                event.target.value = null;
                              }}
                              onDrop={(event) => {
                                setFileTypeError("");
                                setFieldValue(
                                  "resume",
                                  event.dataTransfer.files[0]
                                );
                                setPdfUrl(
                                  URL.createObjectURL(
                                    event.dataTransfer.files[0]
                                  )
                                );
                              }}
                            />
                          </Index.Box>
                          <Index.FormHelperText error>
                            {fileTypeError ||
                              (errors.resume && touched.resume
                                ? errors.resume
                                : null)}
                          </Index.FormHelperText>
                        </Index.Grid>
                        <Index.Grid item sm={12} xxs={12}>
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            theme="dark"
                            sitekey={"6LfXhiIpAAAAAEKbVvjPA_4xw2xJrJQYiIxn8fE3"}
                            onChange={(value) => {
                              setFieldValue(
                                "reCaptcha",
                                value,
                                "setFieldValue"
                              );
                            }}
                            badge={"inline"}
                          />
                          <Index.FormHelperText error>
                            {errors.reCaptcha && touched.reCaptcha
                              ? errors.reCaptcha
                              : null}
                          </Index.FormHelperText>
                        </Index.Grid>
                        <Index.Grid
                          item
                          sm={12}
                          xxs={12}
                          className="form-action"
                        >
                          <PagesIndex.Button
                            type="submit"
                            primary
                            disabled={isSubmitting}
                          >
                            Submit
                          </PagesIndex.Button>
                        </Index.Grid>
                      </Index.Grid>
                    </Index.Stack>
                  )}
                </PagesIndex.Formik>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Career;
