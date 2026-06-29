import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import ReCAPTCHA from "react-google-recaptcha";
import { IMAGES_API_ENDPOINT } from "../../../../config/DataService";

function Advertise() {
  const dispatch = PagesIndex.useDispatch();
  const [advertiseDetails, setAdvertiseDetails] = useState({});
  const formikRef = useRef();
  const recaptchaRef = useRef();
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
    brandName: "",
    designation: "",
    websiteUrl: "",
    reCaptcha: "",
  };
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("name", `${values.firstName} ${values.lastName}`);
    urlEncoded.append("brandName", values.brandName);
    urlEncoded.append("websiteName", values.websiteUrl);
    urlEncoded.append("designation", values.designation);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("message", values.message);

    PagesIndex.apiPostHandler(PagesIndex.Api.SUBMIT_ADVERTISEMENT, urlEncoded)
      .then((res) => {
        if (res?.status === 201) {
          PagesIndex.toast.success(res?.message);
          setSubmitting(false)
        } else {
          PagesIndex.toast.error(res?.message);
          setSubmitting(false)
        }
        dispatch(PagesIndex.hideLoader());
        recaptchaRef.current?.reset();
        formikRef.current.resetForm();
        window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.log(error);
        setSubmitting(false)
        dispatch(PagesIndex.hideLoader());
      });
  };
  const handleInput = (event) => {
    const input = event.target;
    const inputValue = input.value;

    if (inputValue.length > 10) {
      input.value = inputValue.slice(0, 10);
    }
  };

  const getAdvertiseDetails = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_ADVERTISE_BANNER).then(
      (res) => {
        dispatch(PagesIndex.hideLoader());

        if (res?.status === 200) {
          setAdvertiseDetails(res?.data?.[0]);
        }
      }
    );
  };

  useEffect(() => {
    getAdvertiseDetails();
  }, []);

  return (
    <Index.Box className="main-advertise">
      <PagesIndex.BannerImage
        bannerImage={
          advertiseDetails?.filebg
            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${advertiseDetails?.filebg}`
            : PagesIndex.Jpg.contactBanner
        }
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle={advertiseDetails?.title || "Advertise With Us"}
        bannerDescription={advertiseDetails?.description}
      />

      <Index.Box className="main-advertise-wrapper">
        <Index.Box className="cus-container">
          <Index.Grid container spacing={{ md: 5, xxs: 4 }} alignItems="center">
            <Index.Grid item lg={6} xxs={12} className="advertise-left">
              <Index.Box className="advertise-img">
                <img
                  src={
                    advertiseDetails?.file
                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${advertiseDetails?.file}`
                      : PagesIndex.Jpg.membership
                  }
                  alt="advertise"
                />
              </Index.Box>
            </Index.Grid>
            <Index.Grid item lg={6} xxs={12} className="advertise-right">
              <Index.Box className="advertise-form">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="advertise-form-title"
                >
                  Advertise With Us
                </Index.Typography>
                <PagesIndex.Formik
                  enableReinitialize
                  onSubmit={handleSubmit}
                  initialValues={initialValues}
                  validationSchema={PagesIndex.adWithUsSchema}
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
                    isSubmitting
                  }) => (
                    <Index.Stack
                      className="form-control"
                      component="form"
                      noValidate
                      autoComplete="off"
                      onSubmit={handleSubmit}
                    >
                      <Index.Grid container spacing={2} className="form-group">
                        <Index.Grid item sm={12} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Brand name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="brandNameAdvertise"
                            className="form-control"
                            placeholder="Enter brand name"
                            name="brandName"
                            inputProps={{ maxLength: 50 }}
                            value={values?.brandName}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 50) {
                                setFieldValue("brandName", newValue);
                              }
                            }}
                            error={
                              errors.brandName && touched.brandName
                                ? true
                                : false
                            }
                            helperText={
                              errors.brandName && touched.brandName
                                ? errors.brandName
                                : null
                            }
                          />
                        </Index.Grid>

                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Website
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="websiteAdvertise"
                            className="form-control"
                            placeholder="Enter website url"
                            name="websiteUrl"
                            value={values?.websiteUrl}
                            onChange={(e) => {
                              handleChange(e);
                            }}
                            onKeyDown={(e) => {
                              if (
                                e.key === " " &&
                                e.target.value.trim() === ""
                              ) {
                                e.preventDefault();
                              }
                            }}
                            error={
                              errors.websiteUrl && touched.websiteUrl
                                ? true
                                : false
                            }
                            helperText={
                              errors.websiteUrl && touched.websiteUrl
                                ? errors.websiteUrl
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            First name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="firstNameAdvertise"
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
                            id="lastNameAdvertise"
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
                            Designation
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="designationAdvertise"
                            className="form-control"
                            placeholder="Enter designation"
                            name="designation"
                            inputProps={{ maxLength: 50 }}
                            value={values?.designation}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 50) {
                                setFieldValue("designation", newValue);
                              }
                            }}
                            error={
                              errors.designation && touched.designation
                                ? true
                                : false
                            }
                            helperText={
                              errors.designation && touched.designation
                                ? errors.designation
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Email
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="emailAdvertise"
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
                            id="phoneAdvertise"
                            className="form-control"
                            placeholder="Enter phone number"
                            name="phoneNumber"
                            inputProps={{ maxLength: 10 }}
                            value={values?.phoneNumber}
                            onInput={handleInput}
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
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            theme="dark"
                            sitekey={"6LfXhiIpAAAAAEKbVvjPA_4xw2xJrJQYiIxn8fE3"}
                            onChange={(value) => {
                              setFieldValue("reCaptcha", value);
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
                          <PagesIndex.Button type="submit" primary disabled={isSubmitting}>
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

export default Advertise;
