import React, { useState, useEffect } from "react";
import Index from "../../Index";
import { loginSchema } from "../../../validation/FormikValidation";
import PagesIndex from "../../PagesIndex";
import { adminLogin } from "../../../redux-toolkit/slice/admin-slice/AdminServices";
import { messaging } from "../../../config/FirebaseConfig.js";
// import { getToken } from "firebase/messaging";
function Login() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fcmToken, setFcmToken] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // async function requestPermission() {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission === "granted") {
  //       const token = await getToken(messaging, {
  //         vapidKey:
  //           "BLkr6W6lDiW0cCzLaG0q47KmSoDtv0S3sgZRBTACZQhQfRkMjO3byvf5gMcPweSJ8eV9kUsOz1eemEeP8V2q6_c",
  //       });
  //       if (token) {
  //         console.log("token", token);
  //         setFcmToken(token);
  //       }
  //     } else if (permission === "denied") {
  //       alert("You denied the notification permission.");
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error during permission request or token retrieval:",
  //       error
  //     );
  //   }
  // }
  // useEffect(() => {
  //   requestPermission();
  // }, []);

  let initialValues = {
    email: "",
    password: "",
  };

  const handleAdminLoginForm = (values) => {
    setLoading(true);
    const data = {
      fcmToken: fcmToken || "",
      email: values.email,
      password: values.password,
    };
    dispatch(adminLogin(data)).then((res) => {
      setLoading(false);
      if (res?.payload?.status === 200) {
        const ResetId = res?.payload?.data?.id;
        setTimeout(() => {
          navigate("/verify-otp", { state: { ResetId } });
        }, 1000);
      }
    });
  };

  // handleFocus for login button disabled
  const handleFocus = () => {
    setLoading(false);
  };

  return (
    <>
      {/* <Index.Box> */}
      <Index.Box>
        <Index.Box className="main-login">
          <Index.Box>
            <Index.Box className=" white-login-main">
              <Index.Box className="white-login-box">
                <Index.Box className="logo-set2">
                  <img src={PagesIndex.Png.connplexlogo} alt="Loading..." />
                </Index.Box>
                <Index.Box className="main-box">
                  <Index.Box>
                    <Index.Box className="box-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Welcome back!
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="box-login-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Login your account.
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="input-design-div admin-design-div login-input-design-div">
                      <PagesIndex.Formik
                        enableReinitialize
                        onSubmit={handleAdminLoginForm}
                        initialValues={initialValues}
                        validationSchema={loginSchema}
                      >
                        {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          handleSubmit,
                          setFieldTouched,
                          setFieldValue,
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
                              placeholder="Enter Email"
                              variant="filled"
                              className="admin-input-design input-placeholder"
                              name="email"
                              autoComplete="off"
                              onFocus={handleFocus}
                              value={values.email}
                              onChange={(e) => {
                                const newValue = e.target.value.replace(
                                  /\s/g,
                                  ""
                                );
                                setFieldValue("email", newValue);
                              }}
                              onBlur={handleBlur}
                              error={
                                errors.email && touched.email ? true : false
                              }
                              helperText={
                                errors.email && touched.email
                                  ? errors.email
                                  : null
                              }
                            />
                            <Index.TextField
                              hiddenLabel
                              placeholder="Enter Password"
                              variant="filled"
                              className="admin-input-design input-placeholder password"
                              name="password"
                              onFocus={handleFocus}
                              type={showPassword ? "text" : "password"}
                              autoComplete="off"
                              inputProps={{
                                className: "input_props",
                                maxLength: 16,
                              }}
                              InputLabelProps={{ className: "add-formlabel" }}
                              FormHelperTextProps={{
                                className: "input_label_props",
                              }}
                              value={values.password}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              onBlur={handleBlur}
                              error={errors.password && touched.password}
                              helperText={
                                errors.password && touched.password
                                  ? errors.password
                                  : null
                              }
                              sx={{ mb: 3 }}
                              InputProps={{
                                // <-- This is where the toggle button is added.
                                endAdornment: (
                                  <Index.InputAdornment position="end">
                                    <Index.IconButton
                                      aria-label="toggle password visibility"
                                      onClick={handleClickShowPassword}
                                      edge="end"
                                    >
                                      {showPassword ? (
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
                              className="box-login-text forgot bluebox-text"
                              sx={{ mt: 3 }}
                            >
                              {/* <Link to="/admin/forgot-password"> */}
                              <Index.routeLink to="/forgotpassword">
                                <Index.Typography
                                  variant="body1"
                                  component="p"
                                  className="forgot_password"
                                >
                                  Forgot password?
                                </Index.Typography>
                              </Index.routeLink>
                            </Index.Box>
                            <Index.Box className="orange-btn login-btn login-btn-main">
                              <Index.Button
                                type="submit"
                                variant="contained"
                                disableRipple
                                disabled={loading}
                              >
                                Login
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
    </>
  );
}

export default Login;
