import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

export default function FranchiseModal({ open, onClose }) {
  const navigate = PagesIndex.useNavigate();
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    city: "",
    state: "",
    jobTitle: "",
    company: "",
    termsAndConditions: false,
  };

  const handleSubmit = (values, { setSubmitting }) => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("firstName", values.firstName);
    urlEncoded.append("lastName", values.lastName);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("city", values.city);
    urlEncoded.append("state", values.state);
    urlEncoded.append("jobTitle", values.jobTitle);
    urlEncoded.append("company", values.company);
    PagesIndex.apiPostHandler(PagesIndex.Api.APPLY_FRANCHISE, urlEncoded).then(
      (res) => {
        if (res?.status == 400) {
          PagesIndex.toast.error(res?.message);
          setSubmitting(false);
        } else {
          setSubmitting(false);
          PagesIndex.toast.success(res?.message);
          onClose();
        }
      }
    );
  };
  const handleInput = (event) => {
    const input = event.target;
    const inputValue = input.value;

    if (inputValue.length > 10) {
      input.value = inputValue.slice(0, 10);
    }
  };

  return (
    <Index.Modal
      open={open}
      onClose={onClose}
      aria-labelledby="franchise-modal-title"
      aria-describedby="franchise-modal-description"
      className="franchise-modal common-modal"
    >
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.applyFranchiseScheme}
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
          <Index.Box className="franchise-modal-inner common-modal-inner">
            <Index.Box className="modal-inner cus-scrollbar">
              <Index.Typography
                variant="p"
                component="p"
                className="franchise-form-title common-modal-title"
              >
                Apply For Franchise
              </Index.Typography>
              <Index.Stack
                className="form-control"
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <Index.Grid
                  container
                  spacing={{ sm: 2, xxs: 1 }}
                  className="form-group"
                >
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      First name
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="firstNameFranchise"
                      className="form-control"
                      placeholder="Enter first name"
                      name="firstName"
                      inputProps={{ maxLength: 30 }}
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
                        errors.firstName && touched.firstName ? true : false
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
                      id="lastNameFranchise"
                      className="form-control"
                      placeholder="Enter last name"
                      name="lastName"
                      inputProps={{ maxLength: 30 }}
                      value={values?.lastName}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 30) {
                          setFieldValue("lastName", newValue);
                        }
                      }}
                      error={errors.lastName && touched.lastName ? true : false}
                      helperText={
                        errors.lastName && touched.lastName
                          ? errors.lastName
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
                      id="emailFranchise"
                      className="form-control"
                      placeholder="Enter email"
                      // type="text"
                      name="email"
                      inputProps={{ maxLength: 320 }}
                      value={values?.email}
                      onChange={(e) => {
                        setFieldValue("email", e.target.value.trim());
                      }}
                      error={errors.email && touched.email ? true : false}
                      helperText={
                        errors.email && touched.email ? errors.email : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Phone number
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="phoneFranchise"
                      className="form-control"
                      placeholder="Enter phone number"
                      name="phoneNumber"
                      inputProps={{ maxLength: 10 }}
                      value={values?.phoneNumber}
                      onInput={handleInput}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D+/g, "");
                        if (newValue.length <= 10) {
                          setFieldValue("phoneNumber", newValue);
                        }
                      }}
                      error={
                        errors.phoneNumber && touched.phoneNumber ? true : false
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
                      name="city"
                      id="cityFranchise"
                      className="form-control"
                      placeholder="Enter city"
                      inputProps={{ maxLength: 30 }}
                      value={values?.city}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 30) {
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
                      State
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      name="state"
                      id="stateFranchise"
                      className="form-control"
                      placeholder="Enter state"
                      inputProps={{ maxLength: 30 }}
                      value={values?.state}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 30) {
                          setFieldValue("state", newValue);
                        }
                      }}
                      error={errors.state && touched.state ? true : false}
                      helperText={
                        errors.state && touched.state ? errors.state : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Job title
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      name="jobTitle"
                      id="jobTitleFranchise"
                      className="form-control"
                      placeholder="Enter job title"
                      inputProps={{ maxLength: 50 }}
                      value={values?.jobTitle}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 50) {
                          setFieldValue("jobTitle", newValue);
                        }
                      }}
                      error={errors.jobTitle && touched.jobTitle ? true : false}
                      helperText={
                        errors.jobTitle && touched.jobTitle
                          ? errors.jobTitle
                          : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Company
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      name="company"
                      id="companyFranchise"
                      className="form-control"
                      placeholder="Enter company"
                      inputProps={{ maxLength: 50 }}
                      value={values?.company}
                      // onKeyDown={(e) => e?.key === " " && e.preventDefault()}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 50) {
                          setFieldValue("company", newValue);
                        }
                      }}
                      error={errors.company && touched.company ? true : false}
                      helperText={
                        errors.company && touched.company
                          ? errors.company
                          : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={12} xxs={12} className="agree-terms-box">
                    <Index.FormControlLabel
                      control={
                        <Index.Checkbox
                          size="small"
                          name="termsAndConditions"
                          onChange={(e) => {
                            setFieldValue(
                              "termsAndConditions",
                              e.target.checked
                            );
                          }}
                        />
                      }
                      label={
                        <Index.Typography className="agree-terms-link cus-scrollbar">
                          <Index.Typography className="agree-terms-inner">
                            I authorize Connplex Smart Theatres and its
                            representatives to Call, SMS, Email or WhatsApp me
                            about its products and offers. This consent
                            overrides any registration for DNC / NDNC. When you
                            voluntarily send us electronic mail, we will keep a
                            record of this information so that we can respond to
                            you. We only collect information from you when you
                            register on our site or fill out a form. Also, when
                            filling out a form on our site, you may be asked to
                            enter your: name, e-mail address or phone number.
                            You may, however, visit our site anonymously. In
                            case you have submitted your personal information
                            and contact details, we reserve the rights to Call,
                            SMS, Email or WhatsApp about our products and
                            offers, even if your number has DND activated on it.
                          </Index.Typography>
                        </Index.Typography>
                      }
                    />
                    <Index.FormHelperText error>
                      {errors.termsAndConditions && touched.termsAndConditions
                        ? errors.termsAndConditions
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>
                  <Index.Grid item sm={12} xxs={12}>
                    <Index.Box className="franchise-modal-action">
                      {/* <Index.Box className="store-btns">
                        <Index.Link to="#" className="play-store-btns">
                          <img
                            src={PagesIndex.Svg.PlayStore}
                            width="150"
                            height="48"
                            alt="Play Store"
                          />
                        </Index.Link>
                        <Index.Link to="#" className="apple-store-btns">
                          <img
                            src={PagesIndex.Svg.AppleStore}
                            width="150"
                            height="48"
                            alt="Apple Store"
                          />
                        </Index.Link>
                      </Index.Box> */}
                      <PagesIndex.Button
                        primary
                        type="submit"
                        className="apply-button form-btn"
                        disabled={isSubmitting}
                      >
                        Apply
                      </PagesIndex.Button>
                    </Index.Box>
                  </Index.Grid>
                </Index.Grid>
              </Index.Stack>
              {/* <Index.Box className="success-screen">
                <Index.Typography className="success-screen-intrest">
                    Thanks for showing intrest in Connplex
                </Index.Typography>
                <Index.Typography className="success-screen-record">
                    <Index.Typography variant="span" component="span" className="icon">
                    <Index.CheckIcon />
                    </Index.Typography>
                    <Index.Typography variant="span" component="span" className="text">
                    Your message has been recorded.
                    </Index.Typography>
                </Index.Typography>
                <Index.Typography className="success-screen-reach">
                    Our consultant will reach you out within 24 hours.
                </Index.Typography>
              </Index.Box> */}
            </Index.Box>
          </Index.Box>
        )}
      </PagesIndex.Formik>
    </Index.Modal>
  );
}
