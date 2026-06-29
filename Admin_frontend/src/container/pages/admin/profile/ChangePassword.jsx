import React, { useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { changePasswordSchema } from "../../../../validation/FormikValidation";

const ChangePassword = () => {
  const navigate = PagesIndex.useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const handleClickShowOldPassword = () => setShowOldPassword((show) => !show);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const [loading, setLoading] = useState(false);

  // Initital values
  let initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleChangePassword = async (values) => {
    const data = {
      newPassword: values.newPassword,
      oldPassword: values.oldPassword,
    };
    try {
      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.CHANGE_PASSWORD,
        data
      );
      PagesIndex.toast.success(response?.data?.message);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      PagesIndex.toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div>
      <Index.Box className="p-15 background-ed profile-content flex-center ">
        <Index.Box className="h-100">
          <Index.Box className="card-center">
            <Index.Box className="card-main change-password-main">
              <Index.Box className="title-main change-password-text">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Change Password
                </Index.Typography>
              </Index.Box>
              <Index.Box className="input-design-div admin-design-div input-design-div-set-back change-password">
                <PagesIndex.Formik
                  enableReinitialize
                  onSubmit={handleChangePassword}
                  initialValues={initialValues}
                  validationSchema={changePasswordSchema}
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
                      <Index.Typography
                        variant="label"
                        component="label"
                        className="change-input-label"
                      >
                        Old Password
                      </Index.Typography>
                      <Index.TextField
                        hiddenLabel
                        id="old-password"
                        variant="filled"
                        placeholder="Old Password"
                        className="admin-input-design input-placeholder password-set"
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        autoComplete="off"
                        inputProps={{
                          className: "input_props  ",
                        }}
                        InputLabelProps={{ className: "add-formlabel" }}
                        FormHelperTextProps={{
                          className: "input_label_props ",
                        }}
                        onBlur={handleBlur}
                        value={values.oldPassword}
                        onChange={handleChange}
                        helperText={
                          errors.oldPassword && touched.oldPassword
                            ? errors.oldPassword
                            : null
                        }
                        error={
                          errors.oldPassword && touched.oldPassword
                            ? true
                            : false
                        }
                        InputProps={{
                          // <-- This is where the toggle button is added.
                          endAdornment: (
                            <Index.InputAdornment position="end">
                              <Index.IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowOldPassword}
                                edge="end"
                              >
                                {showOldPassword ? (
                                  <Index.Visibility />
                                ) : (
                                  <Index.VisibilityOff />
                                )}
                              </Index.IconButton>
                            </Index.InputAdornment>
                          ),
                        }}
                      />

                      <Index.Typography
                        variant="label"
                        component="label"
                        className="change-input-label label-set "
                      >
                        New Password
                      </Index.Typography>
                      <Index.TextField
                        hiddenLabel
                        id="new-password1"
                        variant="filled"
                        placeholder="New Password"
                        className="admin-input-design input-placeholder password-set"
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
                          // <-- This is where the toggle button is added.
                          endAdornment: (
                            <Index.InputAdornment position="end">
                              <Index.IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowNewPassword}
                                edge="end"
                              >
                                {showNewPassword ? (
                                  <Index.Visibility />
                                ) : (
                                  <Index.VisibilityOff />
                                )}
                              </Index.IconButton>
                            </Index.InputAdornment>
                          ),
                        }}
                      />
                      <Index.Typography
                        variant="label"
                        component="label"
                        className="change-input-label label-set "
                      >
                        Confirm Password
                      </Index.Typography>
                      <Index.TextField
                        hiddenLabel
                        id="confirm-password1"
                        variant="filled"
                        placeholder="Confirm Password"
                        className="admin-input-design input-placeholder password-set-box"
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
                          errors.confirmPassword && touched.confirmPassword
                            ? errors.confirmPassword
                            : null
                        }
                        error={
                          errors.confirmPassword && touched.confirmPassword
                            ? true
                            : false
                        }
                        sx={{ mb: 3 }}
                        InputProps={{
                          // <-- This is where the toggle button is added.
                          endAdornment: (
                            <Index.InputAdornment position="end">
                              <Index.IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowConfirmPassword}
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <Index.Visibility />
                                ) : (
                                  <Index.VisibilityOff />
                                )}
                              </Index.IconButton>
                            </Index.InputAdornment>
                          ),
                        }}
                      />
                      <Index.Box
                        className="common-button blue-button change-password-btn"
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
    </div>
  );
};

export default ChangePassword;
