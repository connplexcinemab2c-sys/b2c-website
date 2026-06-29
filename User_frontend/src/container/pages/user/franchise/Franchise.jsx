import React, { useEffect } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useRef } from "react";

function Franchise() {
  const franchiseItem = [
    {
      title: "1. What Is This 20 Minutes Franchise Approval?",
      content:
        "20 Minutes Franchise Approval is a unique concept by VCS Industries Limited, It Gives you the Opportunity to start your Theater Business within 20 Minutes, where our Business Expert will Give you all the details for owning The Connplex Smart Theater. It’s a Process of Sharing the Information with the Desired Franchise Planner.",
    },
    {
      title:
        "2. Do I Have To Pay Anything Upfront For 20 Minutes Franchise Approval?",
      content:
        "No, you don’t have to Pay Anything for the 20 Minutes Franchise Approval.",
    },
    {
      title:
        "3. Does It Mean, I Have To Take / Finalise Franchise With You After This?",
      content:
        "This is a Franchise Information System, Where We ask you about your Requirements, and Supply we provide for the Franchise. You may decide to finalise Franchise or not after this 20 Mins Session.",
    },
    {
      title: "4. How Can I Get 20 Minutes Franchise Approval?",
      content:
        "You can Simply fill up the Following Form, and Our Business Expert will Get in touch with you to Schedule your 20MFA.",
    },
  ];
  const formikRef = useRef();
  const initialValues = {
    name: "",
    email: "",
    phoneNumber: "",
    city: "",
    termsAndConditions: false,
  };
  const handleSubmitApplication = (values, { setSubmitting }) => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("name", values.name);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("city", values.city);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.TWENTY_MIN_FRANCHISE_APPLICATION,
      urlEncoded
    ).then((res) => {
      if (res?.status === 201) {
        PagesIndex.toast.success(res?.message);
        setSubmitting(false);
      } else {
        PagesIndex.toast.error(res?.message);
        setSubmitting(false);
      }
      formikRef.current.resetForm();
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
    <Index.Box className="main-franchise">
      <PagesIndex.BannerImage
        bannerImage={PagesIndex.Jpg.contactBanner}
        bannerImageWidth="900"
        bannerImageHeight="570"
        bannerTitle="20 Minutes Approval"
      />
      <Index.Box className="main-franchise-wrapper">
        <Index.Box className="cus-container">
          <Index.Grid container spacing={{ md: 5, xxs: 4 }} alignItems="center">
            <Index.Grid item xl={7} lg={6} xxs={12} className="franchise-left">
              {franchiseItem.map((item, key) => (
                <Index.Box key={key} className="franchise-qa">
                  <Index.Typography className="franchise-question" variant="h4">
                    {item.title}
                  </Index.Typography>
                  <Index.Typography
                    className="franchise-answer"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </Index.Box>
              ))}
            </Index.Grid>
            <Index.Grid item xl={5} lg={6} xxs={12} className="franchise-right">
              <Index.Box className="franchise-form">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="franchise-form-title"
                >
                  Apply For 20 Minutes Approval
                </Index.Typography>
                <PagesIndex.Formik
                  enableReinitialize
                  onSubmit={handleSubmitApplication}
                  initialValues={initialValues}
                  validationSchema={PagesIndex.applyTwentyMinFranchiseScheme}
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
                      autoComplete="off"
                      onSubmit={handleSubmit}
                    >
                      <Index.Grid container spacing={2} className="form-group">
                        <Index.Grid item xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Name
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="yourName"
                            className="form-control"
                            placeholder="Enter name"
                            name="name"
                            value={values?.name}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 50) {
                                setFieldValue("name", newValue);
                              }
                            }}
                            inputProps={{ maxLength: 50 }}
                            error={errors.name && touched.name}
                            helperText={
                              errors.name && touched.name ? errors.name : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Email
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="yourEmail"
                            className="form-control"
                            placeholder="Enter email"
                            name="email"
                            value={values?.email}
                            onChange={(e) => {
                              setFieldValue("email", e.target.value.trim());
                            }}
                            inputProps={{ maxLength: 50 }}
                            error={errors.email && touched.email}
                            helperText={
                              errors.email && touched.email
                                ? errors.email
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Phone number
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="yourMobile"
                            className="form-control"
                            placeholder="Enter phone number"
                            name="phoneNumber"
                            // type="number"
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
                            error={errors.phoneNumber && touched.phoneNumber}
                            helperText={
                              errors.phoneNumber && touched.phoneNumber
                                ? errors.phoneNumber
                                : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid item xxs={12}>
                          <Index.FormHelperText className="form-label">
                            Current city
                          </Index.FormHelperText>
                          <Index.TextField
                            fullWidth
                            id="yourCity"
                            className="form-control"
                            placeholder="Enter current city"
                            name="city"
                            value={values?.city}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 30) {
                                setFieldValue("city", newValue);
                              }
                            }}
                            inputProps={{ maxLength: 30 }}
                            error={errors.city && touched.city}
                            helperText={
                              errors.city && touched.city ? errors.city : null
                            }
                          />
                        </Index.Grid>
                        <Index.Grid
                          item
                          sm={12}
                          xxs={12}
                          className="agree-terms-box"
                        >
                          <Index.FormControlLabel
                            control={
                              <Index.Checkbox
                                size="small"
                                name="termsAndConditions"
                                checked={values.termsAndConditions}
                                onChange={(e) => {
                                  setFieldValue(
                                    "termsAndConditions",
                                    e.target.checked
                                  );
                                }}
                              />
                            }
                            label={
                              <Index.Typography
                                variant="span"
                                component="span"
                                className="agree-terms-link"
                              >
                                I authorize Connplex Smart Theatre and its
                                representatives to Call, SMS, Email or WhatsApp
                                me about its products and offers. This consent
                                overrides any registration for DNC / NDNC.
                              </Index.Typography>
                            }
                          />
                          <Index.FormHelperText error>
                            {errors.termsAndConditions &&
                            touched.termsAndConditions
                              ? errors.termsAndConditions
                              : null}
                          </Index.FormHelperText>
                        </Index.Grid>
                        <Index.Grid item xxs={12} className="form-action">
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

export default Franchise;
