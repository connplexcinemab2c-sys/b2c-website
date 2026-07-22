import React, { useState, useEffect, useRef } from "react";
import Index from "../../Index";
import "./Otp.css";
import PagesIndex from "../../PagesIndex";
import OTPInput from "react-otp-input";
import { otpSchema } from "../../../validation/FormikValidation";
import { verifyLoginOTP, resendOtpAction } from "../../../redux-toolkit/slice/admin-slice/AdminServices";

const VerifyLoginOTP = () => {
  const intervalRef = useRef(null);
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const [loading, setLoading] = useState(false);
  const { state } = PagesIndex.useLocation();
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const aadminId = state.ResetId

  const initialValues = {
    otp: "",
  };

  const handleAdminOtpVerification = async (values) => {
    setLoading(true);
    const data = {
      id: aadminId,
      otp: values.otp,
    };
    dispatch(verifyLoginOTP(data)).then((res) => {
      setLoading(false)
      if (res?.payload?.status === 200) {
        localStorage.setItem("token", res?.payload?.data?.token);
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      }
    });
  };



  //******* Resend OTP  function  ***********
  useEffect(() => {
    setRemainingSeconds(60);
  }, []);

  const resendOtp = () => {
    setRemainingMinutes(0);
    setRemainingSeconds(60);
    const data = {
      id: aadminId,
    };
    dispatch(resendOtpAction(data)).then((res) => {
      setLoading(false)
    });
  };

  useEffect(() => {
    if (remainingMinutes === 0 && remainingSeconds === 0) {
      clearInterval(intervalRef.current);
    }
  }, [remainingMinutes, remainingSeconds]);

  useEffect(() => {
    if (remainingMinutes === 0 && remainingSeconds === 0) {
      clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(() => {
        if (remainingSeconds > 0) {
          setRemainingSeconds((prevSeconds) => prevSeconds - 1);
        } else {
          if (remainingMinutes > 0) {
            setRemainingMinutes((prevMinutes) => prevMinutes - 1);
            setRemainingSeconds(59);
          }
        }
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [remainingMinutes, remainingSeconds]);

  return (
    <div>
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
                        style={{ fontSize: "25px" }}
                      >
                        Two-Step Verification
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="box-login-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        style={{ fontSize: "13px" }}
                      >
                        Please enter the OTP (one time password) to verify your account. A code has been sent to your registered mobile number and email address.
                      </Index.Typography>
                      {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
                        <Index.Typography
                          variant="body2"
                          component="p"
                          style={{ fontSize: "12px", color: "#ffc107", marginTop: "8px" }}
                        >
                          Note: For local testing, you can use the static OTP <strong>4444</strong>.
                        </Index.Typography>
                      )}
                    </Index.Box>
                    <Index.Box className="input-design-div admin-design-div login-input-design-div">
                      <PagesIndex.Formik
                        enableReinitialize
                        onSubmit={handleAdminOtpVerification}
                        initialValues={initialValues}
                        validationSchema={otpSchema}
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
                          <Index.Stack
                            component="form"
                            spacing={2}
                            noValidate
                            autoComplete="off"
                            onSubmit={handleSubmit}
                          >
                            <Index.Box className="otp-verification">
                              <OTPInput
                                name="otp"
                                numInputs={4}
                                inputStyle="otp-verification-input"
                                containerStyle="otp-verification-input-wrap"
                                inputType="number"
                                value={values.otp}
                                onChange={(file) => setFieldValue("otp", file)}
                                error={Boolean(errors.otp)}
                                renderInput={(props) => <input {...props} />}
                              />
                            </Index.Box>

                            <Index.Box className="resend-otp-box">
                              <Index.Typography className="acc-already-txt resend-otm-timer text-white" variant="p" component='p' style={{ color: "#fff" }}>
                                {
                                  remainingSeconds != 0 && (
                                    <>
                                      Resend OTP in <Index.Typography style={{ float: "right" }}>{`0${remainingMinutes}`}:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}</Index.Typography>
                                    </>
                                  )
                                }
                              </Index.Typography>

                              <Index.Typography className="acc-already-txt resend-link text-white" style={{ float: "right" }} variant="p" component="p">
                                <Index.Link
                                  aria-disabled={remainingSeconds != 0}
                                  onClick={remainingSeconds != 0 ? undefined : resendOtp}
                                  style={{ cursor: remainingSeconds != 0 ? 'not-allowed' : 'pointer' }}
                                >
                                  Resend OTP
                                </Index.Link>
                              </Index.Typography>
                            </Index.Box>

                            <Index.Box className="orange-btn login-btn login-btn-main">
                              <Index.Button
                                type="submit"
                                variant="contained"
                                disableRipple
                                disabled={loading}
                              >
                                Verify OTP
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
};

export default VerifyLoginOTP;
