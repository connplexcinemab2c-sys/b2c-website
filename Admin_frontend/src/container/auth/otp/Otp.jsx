import React from "react";
import Index from "../../Index";
import "./Otp.css";
import PagesIndex from "../../PagesIndex";
import OTPInput from "react-otp-input";
import { otpSchema } from "../../../validation/FormikValidation";

const Otp = () => {
  const navigate = PagesIndex.useNavigate();
  const { state } = PagesIndex.useLocation();
  const aadminId = state.ResetId

  const initialValues = {
    otp: "",
  };

  const handleAdminOtpVerification = async (values) => {
    const data = {
      id: aadminId,
      otp: values.otp,
    };
    try {
      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.VERIFY_OTP,
        data
      );
      PagesIndex.toast.success(response?.data?.message);
      setTimeout(() => {
        navigate("/resetpassword", { state: { aadminId } });
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
                  {/* <img src={Index?.Svg?.logo} alt="" className="" /> */}
                  {/* <img src={connplexlogo} alt="" className="" /> */}
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
                        Otp!
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="box-login-text bluebox-text">
                      <Index.Typography
                        variant="body1"
                        component="p"
                        className=""
                      >
                        Please enter your credentials to Otp!
                      </Index.Typography>
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

                            <Index.Box className="orange-btn login-btn login-btn-main">
                              <Index.Button
                                type="submit"
                                variant="contained"
                                disableRipple
                                // disabled={loading}
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

export default Otp;
