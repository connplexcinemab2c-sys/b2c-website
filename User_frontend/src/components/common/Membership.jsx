import React, { useEffect, useState } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { useRef } from "react";

export default function Membership() {
  const initialValues = {
    email: "",
  };
  const formikRefAccount = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (values) => {
    setIsLoading(true);
    formikRefAccount.current.setTouched({ email: true });

    if (values.email === "") {
      formikRefAccount.current.setErrors({ email: "Please email is required" });
      setIsLoading(false);
      return;
    }
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("email", values?.email);
    PagesIndex.apiPostHandler(PagesIndex.Api.SUBSCRIBE, urlEncoded).then(
      (res) => {
        if (res?.status === 201) {
          PagesIndex.toast.success(res?.message);
          formikRefAccount.current.resetForm();
          setIsLoading(false);
        } else {
          formikRefAccount.current.resetForm();
          PagesIndex.toast.error(res?.message);
          setIsLoading(false);
        }
      }
    );
  };
  if (formikRefAccount.current) {
    formikRefAccount.current.resetForm();
  }
  return (
    <Index.Box className="main-trial-membership">
      <Index.Box className="cus-container">
        <Index.Grid
          container
          columnSpacing={2}
          rowSpacing={3}
          className="main-trial-container"
        >
          <Index.Grid item md={6} xxs={12}>
            <Index.Box className="newsletter-content">
              <Index.Typography variant="h4">
                {/* TRIAL START FIRST 30 DAYS. */}
                NEWSLETTER
              </Index.Typography>
              <Index.Typography variant="p" component="p">
                {/* Enter your email to create or restart your membership. */}
                Enter your email to get newsletters.
              </Index.Typography>
            </Index.Box>
          </Index.Grid>
          <Index.Grid item md={6} xxs={12}>
            <PagesIndex.Formik
              enableReinitialize
              onSubmit={handleSubmit}
              initialValues={initialValues}
              validationSchema={PagesIndex.membershipSchema}
              innerRef={formikRefAccount}
              validateOnBlur
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
                  className="form-control"
                  component="form"
                  noValidate
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <Index.Box className="trial-mail">
                    <Index.Input
                      name="email"
                      placeholder="Enter Your Email"
                      value={values?.email}
                      onChange={(e) => {
                        if (e.target.value.length > 0) {
                          formikRefAccount.current.setTouched({ email: true });
                        } else {
                          formikRefAccount.current.setTouched({ email: false });
                        }

                        setFieldValue("email", e.target.value.trim());
                      }}
                      // onFocus={() => {
                      //   formikRefAccount.current.setTouched({ email: true });
                      // }}
                      onBlur={() => {
                        formikRefAccount.current.setTouched({ email: false });
                      }}
                      error={errors.email && touched.email}
                    />
                    {!isLoading ? (
                      <PagesIndex.Button type="submit">
                        Get Started
                      </PagesIndex.Button>
                    ) : (
                      <PagesIndex.Button>Get Started</PagesIndex.Button>
                    )}
                  </Index.Box>
                  <Index.FormHelperText error>
                    <p className="error-msg-membership">
                      {errors.email && touched.email ? errors.email : null}
                    </p>
                  </Index.FormHelperText>
                </Index.Stack>
              )}
            </PagesIndex.Formik>
          </Index.Grid>
        </Index.Grid>
      </Index.Box>
    </Index.Box>
  );
}
