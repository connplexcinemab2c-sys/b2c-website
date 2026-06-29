import React from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

function Contact() {
  const dispatch = PagesIndex.useDispatch();
  const formikRef = useRef();
  const recaptchaRef = useRef();
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
    reCaptcha: "",
  };
  const [settingsState, setSettingsState] = useState({});
  useEffect(() => {
    getGeneralSettings();
  }, []);
  const getGeneralSettings = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_GENERAL_SETTINGS).then(
      (res) => {
        if (res?.status === 200) {
          setSettingsState(res?.data);
        } else {
          PagesIndex.toast.error(res?.message);
        }
        dispatch(PagesIndex.hideLoader());
      }
    );
  };
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("firstName", values.firstName);
    urlEncoded.append("lastName", values.lastName);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("message", values.message);

    PagesIndex.apiPostHandler(PagesIndex.Api.CONTACT_US, urlEncoded)
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
  return (
    <Index.Box className="main-contact">
      <PagesIndex.BannerImage
        bannerImage={PagesIndex.Jpg.contactBanner}
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle="Contact Us"
      />
      <Index.Box className="contact-experience">
        <Index.Box className="cus-container">
          <Index.Grid container spacing={{ lg: 6, xxs: 3 }}>
            <Index.Grid
              item
              lg={6}
              xxs={12}
              className="contact-experience-left"
            >
              <Index.Typography variant="h3" component="h3" className="title">
                ULTRA LUXURIOUS EXPERIENCE FOR THE INDIAN AUDIENCE
              </Index.Typography>
              <Index.Box className="owner-name-box">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="owner-name owner-after-remover"
                >
                  Fastest Growing Cinema Chain
                </Index.Typography>
                {/* <Index.Typography
                  variant="p"
                  component="p"
                  className="owner-designation"
                >
                  Founders & Directors
                </Index.Typography> */}
              </Index.Box>
            </Index.Grid>
            <Index.Grid
              item
              lg={6}
              xxs={12}
              className="contact-experience-right"
            >
              <Index.Box className="history-box-wrapper">
                <Index.Box className="history-box">
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="history-box-icon"
                  >
                    <Index.CountUp
                      end={settingsState?.yearOfExperience}
                      enableScrollSpy
                      scrollSpyDelay={2}
                    />
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="history-box-text"
                  >
                    Years of Experience <br /> In Industry
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="history-box">
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="history-box-icon"
                  >
                    <Index.CountUp
                      end={settingsState?.noOfTheaterScreen}
                      enableScrollSpy
                      scrollSpyDelay={2}
                    />
                    +
                  </Index.Typography>
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="history-box-text"
                  >
                    Theater Screens Are Operational / Under Process
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>
        </Index.Box>
      </Index.Box>
      <Index.Box className="contact-form-wrapper">
        <Index.Box className="cus-container">
          <Index.Box className="contact-form-box">
            <Index.Grid container spacing={2}>
              <Index.Grid item md={6} xxs={12} className="contact-map">
                <iframe
                  title="Connplex Map"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29373.868726577603!2d72.509351!3d23.033552!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b2c7e872525%3A0x84c8da9116b4e6ac!2sThe%20Connplex%20Smart%20Theater!5e0!3m2!1sen!2sin!4v1691739893972!5m2!1sen!2sin"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </Index.Grid>
              <PagesIndex.Formik
                enableReinitialize
                onSubmit={handleSubmit}
                initialValues={initialValues}
                validationSchema={PagesIndex.contactUsSchema}
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
                  <Index.Grid item md={6} xxs={12} className="contact-form">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="contact-form-title"
                    >
                      Get In Touch
                    </Index.Typography>
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
                            id="firstName"
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
                          />
                        </Index.Grid>
                        <Index.Grid item sm={6} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Last name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="lastName"
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
                          />
                        </Index.Grid>
                        <Index.Grid item sm={12} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Email
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="email"
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
                        <Index.Grid item sm={12} xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Phone number
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="phone"
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
                        <Index.Grid item sm={12} xxs={12}>
                          <PagesIndex.Button
                            className="submit-button form-btn"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            Submit
                          </PagesIndex.Button>
                        </Index.Grid>
                      </Index.Grid>
                    </Index.Stack>
                  </Index.Grid>
                )}
              </PagesIndex.Formik>
            </Index.Grid>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Box className="contact-info res-contact-infos">
        <Index.Box className="cus-container">
          <Index.Typography
            variant="p"
            component="p"
            className="contact-info-title"
          >
            Contact Information
          </Index.Typography>
          <Index.Box className="contact-info-box">
            <Index.Box className="contact-info-col">
              <Index.Typography
                variant="span"
                component="span"
                className="contact-info-icon"
              >
                <Index.HomeIcon />
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="contact-info-content"
              >
                {settingsState?.address1}
              </Index.Typography>
            </Index.Box>
            <Index.Box className="contact-info-col">
              <Index.Typography
                variant="span"
                component="span"
                className="contact-info-icon"
              >
                <Index.CallIcon />
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="contact-info-content"
              >
                <Index.Link
                  to={`tel:+91${settingsState?.contactNumber1}`}
                  className="contact-info-link"
                >
                   {settingsState?.contactNumber1
                    ? `+91 ${settingsState?.contactNumber1}`
                    : ""}
                </Index.Link>
                <Index.Link
                  to={`tel:+91${settingsState?.contactNumber2}`}
                  className="contact-info-link"
                >
                  {settingsState?.contactNumber2
                    ? `+91 ${settingsState?.contactNumber2}`
                    : ""}
                </Index.Link>
              </Index.Typography>
            </Index.Box>
            <Index.Box className="contact-info-col">
              <Index.Typography
                variant="span"
                component="span"
                className="contact-info-icon"
              >
                <Index.MailIcon />
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="contact-info-content"
              >
                <Index.Link
                  to={`mailto:${settingsState?.email}`}
                  className="contact-info-link"
                >
                  {settingsState?.email}
                </Index.Link>
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
}

export default Contact;
