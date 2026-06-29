import React, { useEffect, useRef, useState } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";

export default function FeedbackModal({ open, onClose }) {
  const dispatch = PagesIndex.useDispatch();
  const formikRef = useRef();
  const [loading, setLoading] = useState({
    regionLoading: false,
    cinemaLoading: false,
  });
  const [regionList, setRegionList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
    city: "",
    cinemaId: "",
  };
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(PagesIndex.showLoader());
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("name", `${values.firstName} ${values.lastName}`);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.phoneNumber);
    urlEncoded.append("message", values.message);
    urlEncoded.append("city", values.city);
    urlEncoded.append("cinemaId", values.cinemaId);

    PagesIndex.apiPostHandler(PagesIndex.Api.SUBMIT_FEEDBACK, urlEncoded).then(
      (res) => {
        if (res?.status === 201) {
          PagesIndex.toast.success(res?.message);
          setSubmitting(false);
        } else {
          PagesIndex.toast.error(res?.message);
          setSubmitting(false);
        }
        onClose();
        dispatch(PagesIndex.hideLoader());
        formikRef.current.resetForm();
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

  // Fetching region list
  const getRegionList = async () => {
    setLoading((prev) => ({ ...prev, regionLoading: true }));
    try {
      const response = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_REGION
      );
      if (response?.status === 200) {
        setRegionList(response?.data);
      } else {
        setRegionList([]);
      }
    } catch (error) {
    } finally {
      setLoading((prev) => ({ ...prev, regionLoading: false }));
    }
  };

  // Fetching cinema list based on region
  const getCinemaList = async (regionId) => {
    setLoading((prev) => ({ ...prev, cinemaLoading: true }));
    setCinemaList([]);
    try {
      const response = await PagesIndex.apiGetHandler(
        PagesIndex.Api.GET_CINEMA +
          "?" +
          new Date().getTime() +
          "&regionId=" +
          regionId
      );
      if (response?.status === 200) {
        setCinemaList(response?.data);
      } else {
        setCinemaList([]);
      }
    } catch (error) {
      if (error?.response?.data?.message !== "jwt expired") {
        PagesIndex.toast.error(error?.response?.data?.message);
      }
    } finally {
      setLoading((prev) => ({ ...prev, cinemaLoading: false }));
    }
  };

  useEffect(() => {
    getRegionList();
  }, []);

  return (
    <Index.Modal open={open} onClose={onClose} className="common-modal">
      <Index.Box className="franchise-modal-inner common-modal-inner">
        <Index.Box className="modal-inner cus-scrollbar">
          <Index.Typography
            variant="p"
            component="p"
            className="common-modal-title"
          >
            Feedback
          </Index.Typography>
          <PagesIndex.Formik
            enableReinitialize
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={PagesIndex.feedbackSchema}
            innerRef={formikRef}
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
                      id="firstNameFeedback"
                      className="form-control"
                      placeholder="Enter first name"
                      name="firstName"
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
                      inputProps={{ maxLength: 50 }}
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Last name
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="lastNameFeedback"
                      className="form-control"
                      placeholder="Enter last name"
                      name="lastName"
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
                      inputProps={{ maxLength: 50 }}
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Email
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="emailFeedback"
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
                      id="phoneFeedback"
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
                    <Index.Select
                      fullWidth
                      id="fullWidth"
                      name="city"
                      className="form-control cinema-dropdown"
                      value={values?.city}
                      // defaultValue={selectedCinema}
                      displayEmpty
                      onChange={handleChange}
                      renderValue={
                        values?.city !== "" ? undefined : () => `Select city`
                      }
                      error={errors.city && touched.city ? true : false}
                      helperText={
                        errors.city && touched.city ? errors.city : null
                      }
                    >
                      {!loading.regionLoading ? (
                        regionList?.length > 0 ? (
                          regionList?.map((data) => {
                            return (
                              <Index.MenuItem
                                value={data?.region}
                                key={data?._id}
                                onClick={() => {
                                  setFieldValue("cinemaId", "");
                                  getCinemaList(data?._id);
                                }}
                              >
                                {data?.region}
                              </Index.MenuItem>
                            );
                          })
                        ) : (
                          <Index.MenuItem>No data found</Index.MenuItem>
                        )
                      ) : (
                        <Index.MenuItem>Loading...</Index.MenuItem>
                      )}
                    </Index.Select>
                    <Index.FormHelperText error>
                      {errors.city && touched.city ? errors.city : null}
                    </Index.FormHelperText>
                  </Index.Grid>

                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Cinema
                    </Index.FormHelperText>
                    <Index.Select
                      fullWidth
                      id="fullWidth"
                      name="cinemaId"
                      className="form-control cinema-dropdown"
                      value={values?.cinemaId}
                      // defaultValue={selectedCinema}
                      displayEmpty
                      onChange={handleChange}
                      renderValue={
                        values?.cinemaId !== ""
                          ? undefined
                          : () => `Select cinema`
                      }
                      error={errors.cinemaId && touched.cinemaId ? true : false}
                      helperText={
                        errors.cinemaId && touched.cinemaId
                          ? errors.cinemaId
                          : null
                      }
                    >
                      {!loading.cinemaLoading ? (
                        cinemaList?.length > 0 ? (
                          cinemaList?.map((data) => {
                            return (
                              <Index.MenuItem value={data?._id}>
                                {data?.displayName}
                              </Index.MenuItem>
                            );
                          })
                        ) : (
                          <Index.MenuItem>No data found</Index.MenuItem>
                        )
                      ) : (
                        <Index.MenuItem>Loading...</Index.MenuItem>
                      )}
                    </Index.Select>
                    <Index.FormHelperText error>
                      {errors.cinemaId && touched.cinemaId
                        ? errors.cinemaId
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>

                  <Index.Grid item sm={12} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Message
                    </Index.FormHelperText>
                    {/* <Index.FormHelperText className="form-label">
                      {values?.message?.length}/250
                    </Index.FormHelperText> */}
                    <Index.TextareaAutosize
                      minRows={5}
                      placeholder="Enter message"
                      name="message"
                      value={values?.message}
                      maxLength={251}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 250) {
                          setFieldValue("message", newValue);
                        }
                      }}
                      error={errors.message && touched.message ? true : false}
                    />
                    <Index.FormHelperText error>
                      {errors.message && touched.message
                        ? errors.message
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>
                  <Index.Grid item sm={12} xxs={12}>
                    <Index.Box className="common-modal-action">
                      <PagesIndex.Button
                        primary
                        type="submit"
                        className="common-modal-btn"
                        disabled={isSubmitting}
                      >
                        Submit
                      </PagesIndex.Button>
                    </Index.Box>
                  </Index.Grid>
                </Index.Grid>
              </Index.Stack>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
}
