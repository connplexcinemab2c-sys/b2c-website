import React, { useState } from "react";
import Index from "../../Index";
// import { resetPassword } from "../../../redux/admin/action";
import connplexlogo from "../../../assests/images/Png/connplexlogo.png";

import PagesIndex from "../../PagesIndex";
import { resetPasswordSchema } from "../../../validation/FormikValidation";

function ResetPassword() {
  const navigate = PagesIndex.useNavigate();
  const { state } = PagesIndex.useLocation();
  const adminId = state.aadminId;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  let initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const handleResetPassword = async (values) => {
    const data = {
      adminId: adminId,
      ...values,
    };
    try {
      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.RESET_PASSWORD,
        data
      );
      PagesIndex.toast.success(response?.data?.message);
      setTimeout(() => {
        navigate("/");
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
                  <img src={connplexlogo} alt="logo" className="" />
                </Index.Box>
                <Index.Box className="main-box">
                  <Index.Box>
                    <Index.Box className="box-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Reset Password
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="box-login-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Please enter your new password
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="input-design-div admin-design-div login-input-design-div">
                      <PagesIndex.Formik
                        enableReinitialize
                        onSubmit={handleResetPassword}
                        initialValues={initialValues}
                        validationSchema={resetPasswordSchema}
                      >
                        {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
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
                              variant="filled"
                              id="new-password"
                              placeholder="Enter New Password"
                              className="admin-input-design input-placeholder"
                              name="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              autoComplete="off"
                              inputProps={{
                                className: "input_props",
                              }}
                              InputLabelProps={{ className: "add-formlabel" }}
                              FormHelperTextProps={{
                                className: "input_label_props",
                              }}
                              onBlur={handleBlur}
                              value={values.newPassword}
                              onChange={handleChange}
                              helperText={
                                errors.newPassword && touched.newPassword
                                  ? errors.newPassword
                                  : null
                              }
                              error={
                                errors.newPassword && touched.newPassword
                                  ? true
                                  : false
                              }
                              InputProps={{
                                endAdornment: (
                                  <Index.InputAdornment position="end">
                                    <Index.IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowNewPassword}
                                      edge="end"
                                    >
                                      {showNewPassword ? (
                                        <Index.VisibilityOff />
                                      ) : (
                                        <Index.Visibility />
                                      )}
                                    </Index.IconButton>
                                  </Index.InputAdornment>
                                ),
                              }}
                            />
                            <Index.TextField
                              hiddenLabel
                              variant="filled"
                              id="confirm-password"
                              placeholder="Enter Confirm Password"
                              className="admin-input-design input-placeholder password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="off"
                              inputProps={{
                                className: "input_props",
                              }}
                              InputLabelProps={{ className: "add-formlabel" }}
                              FormHelperTextProps={{
                                className: "input_label_props",
                              }}
                              onBlur={handleBlur}
                              value={values.confirmPassword}
                              onChange={handleChange}
                              helperText={
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? errors.confirmPassword
                                  : null
                              }
                              error={
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? true
                                  : false
                              }
                              sx={{ mb: 3 }}
                              InputProps={{
                                endAdornment: (
                                  <Index.InputAdornment position="end">
                                    <Index.IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowConfirmPassword}
                                      edge="end"
                                    >
                                      {showConfirmPassword ? (
                                        <Index.VisibilityOff />
                                      ) : (
                                        <Index.Visibility />
                                      )}
                                    </Index.IconButton>
                                  </Index.InputAdornment>
                                ),
                              }}
                            />
                            <Index.Box
                              className="orange-btn login-btn login-btn-main"
                              sx={{ mt: 4 }}
                            >
                              <Index.Button
                                variant="contained"
                                type="submit"
                                disableRipple
                              >
                                Submit
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

export default ResetPassword;
