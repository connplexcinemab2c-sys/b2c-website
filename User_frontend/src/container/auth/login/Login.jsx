import React, { useCallback, useEffect, useRef, useState } from "react";
import Index from "../../../components/Index";
import PagesIndex from "../../../components/PagesIndex";
import {
  LoginSocialApple,
  LoginSocialFacebook,
  LoginSocialGoogle,
} from "reactjs-social-login";

function Login(props) {
  const signInRef = useRef();
  const otpRef = useRef();
  const googleRef = useRef();
  const facebookRef = useRef();
  const dispatch = PagesIndex.useDispatch();
  const { otpTimer } = PagesIndex.useSelector((state) => state.UserReducer);
  const { signInClose } = props;
  const [open, setOpen] = useState(true);
  const [id, setId] = useState();
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedContact, setMaskedContact] = useState("");

  const initialValues = {
    emailOrPhone: "",
    otp: "",
  };
  function toggleBool(values) {
    setOpen(!open);
  }

  const getMaskedEmailOrPhone = (emailOrPhone) => {
    if (!emailOrPhone) return '';
  
    if (!isNaN(emailOrPhone)) {
      return `xxxxxxx${emailOrPhone.slice(-3)}`;
    }
  
    const emailParts = emailOrPhone.split('@');
    if (emailParts.length === 2) {
      const domain = emailParts[1];
      return `${emailOrPhone.slice(0, 3)}xxxxxxx@${domain}`;
    }
    return emailOrPhone;
  }
  
  
  useEffect(() => {
    let myInterval;
    if (!open) {
      myInterval = setTimeout(() => {
        if (otpTimer.seconds > 0) {
          dispatch(
            PagesIndex.getOtpTimer({
              minute: otpTimer.minute,
              seconds: otpTimer.seconds - 1,
            })
          );
        }
        if (otpTimer.seconds == 0) {
          if (otpTimer.minute == 0) {
            clearTimeout(myInterval);
            dispatch(
              PagesIndex.getOtpTimer({
                seconds: 0,
                minute: 0,
              })
            );
          } else {
            dispatch(
              PagesIndex.getOtpTimer({
                minute: otpTimer.minute - 1,
                seconds: 59,
              })
            );
          }
        }
      }, 1000);
    }
    return () => {
      clearTimeout(myInterval);
    };
  });

  const onLogoutFailure = useCallback(() => {
    alert("logout fail");
  }, []);

  const onLogoutSuccess = useCallback(() => {
    alert("logout success");
  }, []);
  const signinContent = () => {
    function handleSubmitSignin(values) {
      setLoading(true)
      dispatch(PagesIndex.showLoader());
      let payload = { login_type: "Web" };
    
      // Store the masked value before making the API call
      const maskedValue = getMaskedEmailOrPhone(values.emailOrPhone);
      setMaskedContact(maskedValue);

      if (values?.emailOrPhone?.includes("@")) {
        payload.email = values?.emailOrPhone?.toLowerCase();
      } else {
        payload.mobileNumber = values?.emailOrPhone;
      }
      PagesIndex.apiPostHandler(PagesIndex.Api.LOGIN, payload).then((res) => {
        if (res?.status === 201) {
          setLoading(false)
          window.scroll(0, 0);
          setId(res?.data?._id);
          // signInRef.current.resetForm();
          PagesIndex.toast.success(res?.message);
          dispatch(
            PagesIndex.getOtpTimer({
              minute: 0,
              seconds: 30,
            })
          );
          // toggleBool();
          setOpen(!open);
        }
        setLoading(false)
        dispatch(PagesIndex.hideLoader());
      });
    }
    function handleSocialLogin(apiParams) {
      dispatch(PagesIndex.showLoader());
      let payload = apiParams;
      PagesIndex.apiPostHandler(PagesIndex.Api.SOCIAL_LOGIN, payload).then(
        (res) => {
          if (res?.status === 200 || res?.status === 201) {
            PagesIndex.toast.success(res?.message);
            signInClose();
            dispatch(PagesIndex.getUserData(res?.data));
            dispatch(PagesIndex.getUserToken(res?.data?.token));
          }
          dispatch(PagesIndex.hideLoader());
        }
      );
    }
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmitSignin}
        initialValues={initialValues}
        validationSchema={PagesIndex.loginValidationSchema}
        innerRef={signInRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <Index.Box className="signin-modal-right cus-scrollbar">
            <Index.Stack
              className="form-control"
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <Index.Typography
                variant="p"
                component="p"
                className="signin-title"
              >
                Sign In
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="signin-content"
              >
                Enter your phone number OR email to sign in
              </Index.Typography>
              <Index.Box className="signin-form">
                <Index.TextField
                  fullWidth
                  id="signInPhone"
                  name="emailOrPhone"
                  className="form-control"
                  placeholder="Phone number or email"
                  // onChange={(e) => {
                  //   handleChange(e);
                  // }}
                  onChange={(e) => {
                    const updatedValue = e.target.value.trim();
                    if (/^\d+$/.test(updatedValue)) {
                  
                      setFieldValue(
                        "emailOrPhone",
                        updatedValue.slice(0, 10)
                      );
                    } else {
                      setFieldValue("emailOrPhone", updatedValue.slice(0,60));
                    }
                  }}
                  inputProps={{ maxLength: /^\d+$/.test(values?.emailOrPhone) ? 10 : 60 }}
                  // inputProps={{ maxLength: 320 }}
                  error={
                    errors.emailOrPhone && touched.emailOrPhone ? true : false
                  }
                  helperText={
                    errors.emailOrPhone && touched.emailOrPhone
                      ? errors.emailOrPhone
                      : null
                  }
                />
                <PagesIndex.Button type="submit" primary className="signin-btn" disabled={loading}>
                  Get OTP
                </PagesIndex.Button>
              </Index.Box>
              <Index.Box className="signup-option">
                <Index.Box className="signup-title-box">
                  <Index.Box className="signup-title-line"></Index.Box>
                  <Index.Box className="signup-title">
                    Or Sign Up With
                  </Index.Box>
                  <Index.Box className="signup-title-line"></Index.Box>
                </Index.Box>
                <Index.Box className="signup-option-box">
                  {/* <LoginSocialApple
                    client_id={""}
                    scope={"name email"}
                    redirect_uri={""}
                    onLoginStart={onLoginStart}
                    onResolve={({ provider, data }) => {}}
                    onReject={(err) => {
                      console.log(err);
                    }}
                  > */}
                  {/* <Index.Box className="signup-option-item">
                    <img
                      src={PagesIndex.Svg.AppleIcon}
                      width="34"
                      height="45"
                      alt="Apple Icon"
                    />
                  </Index.Box> */}
                  {/* </LoginSocialApple> */}
                  <LoginSocialGoogle
                    ref={googleRef}
                    client_id="305133771930-3t5h0p786mi93rvmn91id531qj8l7hkb.apps.googleusercontent.com"
                    isOnlyGetToken={true}
                    onLogoutFailure={onLogoutFailure}
                    onLogoutSuccess={onLogoutSuccess}
                    onResolve={async ({ provider, data }) => {
                      try {
                        const accessToken = data?.access_token;
                        if (!accessToken) {
                          PagesIndex.toast.error("Failed to obtain access token from Google.");
                          return;
                        }

                        dispatch(PagesIndex.showLoader());
                        const response = await fetch(
                          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
                        );
                        if (!response.ok) {
                          throw new Error("Failed to fetch user info from Google");
                        }
                        const googleUser = await response.json();

                        handleSocialLogin({
                          firstName: googleUser?.given_name,
                          lastName: googleUser?.family_name,
                          email: googleUser?.email,
                          providerId: googleUser?.sub,
                          accessToken: accessToken,
                          source: "google",
                          login_type: "Web",
                        });
                      } catch (err) {
                        console.error("Google userinfo fetch failed:", err);
                        PagesIndex.toast.error("Failed to retrieve Google profile info.");
                        dispatch(PagesIndex.hideLoader());
                      }
                    }}
                    scope="openid profile email"
                    onReject={(err) => {
                      console.error("Google Login Rejected:", err);
                      PagesIndex.toast.error(err?.message || "Google Sign-In failed.");
                    }}
                  >
                    <Index.Box
                      className="signup-option-item"
                      // onClick={() => {
                      //   handleSocialLogin(PagesIndex.Api.GOOGLE_LOGIN);
                      // }}
                    >
                      <img
                        src={PagesIndex.Svg.GoogleIcon}
                        width="48"
                        height="48"
                        alt="Apple Icon"
                      />
                    </Index.Box>
                  </LoginSocialGoogle>
                  {/* <LoginSocialFacebook
                    ref={facebookRef}
                    appId={"765630185529886"}
                    fieldsProfile={
                      "id,first_name,last_name,middle_name,name,name_format,picture,short_name,email,gender"
                    }
                    onLogoutSuccess={onLogoutSuccess}
                    onResolve={({ provider, data }) => {
                      handleSocialLogin({
                        firstName: data?.first_name,
                        lastName: data?.last_name,
                        email: data?.email,
                        providerId: data?.id,
                        accessToken: data?.accessToken,
                        source: "facebook",
                        login_type: "Web",
                      });
                    }}
                    onReject={(err) => {
                      console.log(err);
                    }}
                  >
                    <Index.Box className="signup-option-item">
                      <img
                        src={PagesIndex.Svg.FacebookIcon}
                        width="24"
                        height="24"
                        alt="Apple Icon"
                      />
                    </Index.Box>
                  </LoginSocialFacebook> */}
                </Index.Box>
              </Index.Box>
            </Index.Stack>
          </Index.Box>
        )}
      </PagesIndex.Formik>
    );
  };

  const otpContent = () => {
    console.log(otpError, "otpError");
    const handleSubmit = (values, { resetForm, setErrors }) => {
      if (values?.otp?.length !== 4) {
        setOtpError("Please enter valid OTP");
      } else {
        let payload = {
          id: id,
          otp: values?.otp,
          type:"web"
        };
        PagesIndex.apiPostHandler(PagesIndex.Api.VERIFY_OTP, payload).then(
          (res) => {
            if (res?.status === 200) {
              dispatch(PagesIndex.hideLoader());
              setId("");
              signInClose();
              dispatch(PagesIndex.getUserData(res?.data));
              dispatch(PagesIndex.getUserToken(res?.data?.token));
              setOpen(!open);
              resetForm();
              setOtpError("");
              PagesIndex.toast.success("Logged in successfully");
            } else {
              PagesIndex.toast.error(res?.message);
              otpRef.current.setTouched({ otp: false });
              setErrors({});
              otpRef.current.setFieldValue("otp", "");
              setOtpError("");
            }
          }
        );
      }
    };
    const resendOtp = (userInput, { setErrors }) => {
      let payload;
      if (userInput?.emailOrPhone?.includes("@")) {
        payload = {
          id: id,
          email: userInput?.emailOrPhone,
        };
      } else {
        payload = {
          id: id,
          mobileNumber: userInput?.emailOrPhone,
        };
      }
      PagesIndex.apiPostHandler(PagesIndex.Api.RESEND_OTP, payload).then(
        (res) => {
          if (res?.status === 201) {
            dispatch(
              PagesIndex.getOtpTimer({
                seconds: 30,
                minute: 0,
              })
            );
            PagesIndex.toast.success(res?.message);
            otpRef.current.setTouched({ otp: false });
            otpRef.current.setFieldValue("otp", "");
            setErrors({});
            setOtpError("");
          } else {
            PagesIndex.toast.error(res?.message);
            setOtpError("");
          }
        }
      );
    };
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.otpSchema}
        innerRef={otpRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          setErrors,
        }) => (
          <Index.Box className="otp-modal-right cus-scrollbar">
            <Index.Stack
              className="form-control"
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <Index.Typography variant="p" component="p" className="otp-title">
                Verify OTP
              </Index.Typography>
              <Index.Typography
                variant="p"
                component="p"
                className="otp-content"
              >
               Enter the OTP sent on {maskedContact}
              </Index.Typography>
              <Index.Box className="otp-form-wrapper">
                <Index.Box className="otp-form-inner-wrapper">
                  <PagesIndex.OTPInput
                    // shouldAutoFocus
                    name="otp"
                    numInputs={4}
                    inputStyle="form-control"
                    containerStyle="otp-form"
                    inputType="number"
                    value={values?.otp}
                    onChange={(value) => {
                      console.log(value?.length, "value390");
                      setFieldValue("otp", value);
                      if (value?.length == 0 || value?.length == 4) {
                        setOtpError("");
                      }
                    }}
                    error={errors.otp && touched.otp ? true : false}
                    renderInput={(props) => <input {...props} />}
                  />
                  <Index.FormHelperText error sx={{marginLeft:"calc(100% - 225px) !important"}}>
                    {otpError
                      ? otpError
                      : errors.otp && touched.otp
                      ? errors.otp
                      : null}
                    {/* {otpError ? otpError : null} */}
                  </Index.FormHelperText>
                  <Index.Box className="resend-otp-box">
                    {/* <Index.Typography variant="span" component="span">
                      Didn't received OTP?
                    </Index.Typography> */}
                    {otpTimer.minute === 0 && otpTimer.seconds === 0 ? (
                      <>
                        <Index.Typography variant="span" component="span">
                          Didn't received OTP?
                        </Index.Typography>
                        <button
                          className="resend-otp-btn"
                          onClick={() => resendOtp(values, { setErrors })}
                          type="button"
                        >
                          RESEND
                        </button>
                      </>
                    ) : (
                      <Index.Typography
                        className="resend-otp-box"
                        variant="span"
                        component="span"
                      >
                        Expire OTP in{" "}
                        {otpTimer.minute < 10
                          ? `0${otpTimer.minute}`
                          : otpTimer.minute}
                        :
                        {otpTimer.seconds < 10
                          ? `0${otpTimer.seconds}`
                          : otpTimer.seconds}{" "}
                        sec
                      </Index.Typography>
                    )}
                  </Index.Box>
                </Index.Box>
                <PagesIndex.Button primary className="otp-btn" type="submit">
                  Verify OTP
                </PagesIndex.Button>
                <Index.Box className="back-btn-box">
                  <Index.Box
                    onClick={() => {
                      setOpen(!open);
                      signInRef?.current?.resetForm();
                      otpRef?.current?.resetForm();
                      setOtpError("");
                    }}
                    className="back-btn"
                  >
                    <Index.ArrowRightAltIcon />
                    Back
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Stack>
          </Index.Box>
        )}
      </PagesIndex.Formik>
    );
  };
  return (
    <Index.Box className="signin-modal-inner">
      <Index.Box className="modal-inner">
        <Index.Box className="signin-modal-left">
          <img
            src={PagesIndex.Gif.SigninImg2}
            width="279"
            height="450"
            alt="sign in"
            className="sign-in-bg"
          />
          <img
            src={PagesIndex.Gif.SigninImg1}
            width="279"
            height="450"
            alt="sign in"
            className="sign-in-logo"
          />
        </Index.Box>
        {open ? signinContent() : otpContent()}
      </Index.Box>
    </Index.Box>
  );
}

export default Login;
