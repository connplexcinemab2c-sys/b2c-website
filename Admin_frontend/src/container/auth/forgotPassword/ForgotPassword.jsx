import React, { useState } from "react";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";

import { ForgotPasswordSchema } from "../../../validation/FormikValidation";

function ForgotPassword() {
  const navigate = PagesIndex.useNavigate();
  const [loading, setLoading] = useState(false);

  const adminLoginData = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice.adminLoginData
  );

  let initialValues = {
    email: "",
  };

  const handleAdminForgotPassword = async (values) => {
    try {
      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.FORGOT_PASSWORD,
        values
      );
      const ResetId = response?.data?.data?._id;
      PagesIndex.toast.success(response?.data?.message);
      setTimeout(() => {
        navigate("/otp", { state: { ResetId } });
      }, 2000);
    } catch (error) {
      PagesIndex.toast.error(error?.response?.data?.message);
    }
  };


  return (
    <div>
      <Index.Box>
        <Index.Box className="main-login">
          <Index.Box>
            <Index.Box className=" white-login-main">
              <Index.Box className="white-login-box">
                <Index.Box className="logo-set2">
                  {/* <img src={Index?.Svg?.logo} alt="logo" className="" /> */}
                  <img
                    src={PagesIndex?.Svg?.connplexLogo}
                    alt="logo"
                    className=""
                  />
                </Index.Box>
                <Index.Box className="main-box">
                  <Index.Box>
                    <Index.Box className="box-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Forgot Password
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="box-login-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Please enter your credentials to Forgot Password
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="input-design-div admin-design-div login-input-design-div">
                      <PagesIndex.Formik
                        enableReinitialize
                        onSubmit={handleAdminForgotPassword}
                        initialValues={initialValues}
                        validationSchema={ForgotPasswordSchema}
                      >
                        {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          setFieldTouched,
                          handleSubmit,
                        }) => (
                          <Index.Stack
                            component="form"
                            spacing={2}
                            noValidate
                            autoComplete="off"
                            onSubmit={handleSubmit}
                          >
                            <Index.TextField
                              hiddenLabel
                              id="filled-hidden-label-normal"
                              placeholder="Enter email"
                              variant="filled"
                              className="admin-input-design input-placeholder"
                              name="email"
                              autoComplete="off"
                              onBlur={handleBlur}
                              onFocus={() => setLoading(false)}
                              value={values.email}
                              onChange={handleChange}
                              helperText={touched.email && errors.email}
                              error={Boolean(errors.email && touched.email)}
                              sx={{ mb: 3 }}
                            />
                            <Index.Box className="orange-btn login-btn login-btn-main">
                              <Index.Button
                                variant="contained"
                                type="submit"
                                disableRipple
                                disabled={loading}
                              >
                                Continue
                              </Index.Button>
                            </Index.Box>
                          </Index.Stack>
                        )}
                      </PagesIndex.Formik>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </div>
  );
}

export default ForgotPassword;
