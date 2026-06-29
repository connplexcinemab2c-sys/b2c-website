import React from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { DataService } from "../../config/DataService";

export default function BrandInfluencersModal({ open, onClose }) {
  const navigate = PagesIndex.useNavigate();
  const initialValues = {
    name: "",
    email: "",
    mobileNumber: "",
    city: "",
    instagramUsername: "",
    youTube: "",
    termsAndConditions: false,
  };
  const { userDetails, userToken } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const handleSubmit = (values, { setSubmitting }) => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("name", values.name);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.mobileNumber);
    urlEncoded.append("city", values.city);
    urlEncoded.append("instagramUsername", values.instagramUsername);
    urlEncoded.append("youTube", values.youTube);

    DataService.post(PagesIndex.Api.BRAND_INFLUENCERS, urlEncoded).then(
      (res) => {
        if (res?.status == 400) {
          PagesIndex.toast.error(res?.message);
          setSubmitting(false);
        } else {
          PagesIndex.toast.success(res?.data?.message);
          setSubmitting(false);
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
        validationSchema={PagesIndex.applyBrandInfluencerScheme}
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
                Apply For Brand Influencer
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
                      Name
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="name"
                      className="form-control"
                      placeholder="Enter name"
                      name="name"
                      inputProps={{ maxLength: 50 }}
                      value={values?.name}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 50) {
                          setFieldValue("name", newValue);
                        }
                      }}
                      error={errors.name && touched.name ? true : false}
                      helperText={
                        errors.name && touched.name ? errors.name : null
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
                      Instagram Username
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      name="instagramUsername "
                      id="instagramUsername"
                      className="form-control"
                      placeholder="Enter instagram username"
                      inputProps={{ maxLength: 50 }}
                      value={values?.instagramUsername}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 50) {
                          setFieldValue("instagramUsername", newValue);
                        }
                      }}
                      error={
                        errors.instagramUsername && touched.instagramUsername
                          ? true
                          : false
                      }
                      helperText={
                        errors.instagramUsername && touched.instagramUsername
                          ? errors.instagramUsername
                          : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Youtube Channel (Optional)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="fullWidth"
                        name="YouTube"
                        className="form-control"
                        placeholder="Enter youtube channel"
                        value={values?.youTube}
                        inputProps={{ maxLength: 200 }}
                        onChange={(e) => {
                          const newValue = e.target.value.replace(/^\s+/, "");
                          setFieldValue("youTube", newValue);
                        }}
                        error={errors.youTube && touched.youTube}
                        helperText={
                          errors.youTube && touched.youTube
                            ? errors.youTube
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Phone Number
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="mobileNumber"
                      className="form-control"
                      placeholder="Enter phone number"
                      name="mobileNumber"
                      inputProps={{ maxLength: 10 }}
                      value={values?.mobileNumber}
                      onInput={handleInput}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D+/g, "");
                        if (newValue.length <= 10) {
                          setFieldValue("mobileNumber", newValue);
                        }
                      }}
                      error={
                        errors.mobileNumber && touched.mobileNumber
                          ? true
                          : false
                      }
                      helperText={
                        errors.mobileNumber && touched.mobileNumber
                          ? errors.mobileNumber
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
            </Index.Box>
          </Index.Box>
        )}
      </PagesIndex.Formik>
    </Index.Modal>
  );
}
