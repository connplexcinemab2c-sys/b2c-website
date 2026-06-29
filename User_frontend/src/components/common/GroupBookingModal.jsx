import React, { useEffect, useState } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { Api } from "../../config/Api";
import { DataService } from "../../config/DataService";
import dayjs from "dayjs";
import moment from "moment";
import { useFormik } from "formik";
export default function GroupBookingModal({ open, onClose }) {
  const navigate = PagesIndex.useNavigate();
  const [cinemaList, setCinemaList] = useState([]);

  const initialValues = {
    name: "",
    email: "",
    phoneNumber: "",
    cinemaId: "",
    bookingDate: "",
    city: "",
    noOfPax: "",
    termsAndConditions: false,
  };
  const [selectedCinema, setSelectedCinema] = useState("");
  const [loading, setLoading] = useState({
    regionLoading: false,
    cinemaLoading: false,
  });
  const [regionList, setRegionList] = useState([]);

  const handleSubmit = (values, { setSubmitting }) => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("name", values?.name);
    urlEncoded.append("email", values?.email);
    urlEncoded.append("mobileNumber", values?.phoneNumber);
    urlEncoded.append("city", values?.city);
    urlEncoded.append("cinemaId", values?.cinemaId);
    urlEncoded.append("noOfPax", values?.noOfPax);
    urlEncoded.append("bookingDate", values?.bookingDate);
    PagesIndex.apiPostHandler(PagesIndex.Api.GROUP_BOOKING, urlEncoded).then(
      (res) => {
        if (res?.status == 400) {
          PagesIndex.toast.error(res?.message);
          setSubmitting(false);
        } else {
          PagesIndex.toast.success(res?.message);
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
      const response = await DataService.get(
        Api.GET_CINEMA + "?" + new Date().getTime() + "&regionId=" + regionId
      );
      console.log(response, "response");
      if (response?.data?.status === 200) {
        setCinemaList(response?.data?.data);
      } else {
        setCinemaList([]);
      }
    } catch (error) {
      if (err?.response?.data?.message !== "jwt expired") {
        PagesIndex.toast.error(err?.response?.data?.message);
      }
    } finally {
      setLoading((prev) => ({ ...prev, cinemaLoading: false }));
    }
  };

  useEffect(() => {
    if (open) {
      getRegionList();
    }
  }, [open]);

  return (
    <Index.Modal
      open={open}
      onClose={onClose}
      aria-labelledby="franchise-modal-title"
      aria-describedby="franchise-modal-description"
      className="franchise-modal common-modal"
    >
      <PagesIndex.Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.applyGroupBookingScheme}
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
                Apply For Group Booking
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
                      Booking Date
                    </Index.FormHelperText>
                    <Index.LocalizationProvider
                      dateAdapter={Index.AdapterDayjs}
                    >
                      <DesktopDatePicker
                        className="form-control group-booking-datepicker"
                        name="bookingDate"
                        onKeyDown={(e) => e.preventDefault()}
                        value={dayjs(values?.bookingDate)}
                        onChange={(val) => {
                          console.log(val.$d, 201);
                          setFieldValue("bookingDate", moment(val.$d).format());
                        }}
                        disablePast
                        slotProps={{
                          textField: {
                            readOnly: true,
                          },
                        }}
                      />
                    </Index.LocalizationProvider>
                    <Index.FormHelperText error>
                      {errors.bookingDate && touched.bookingDate
                        ? errors.bookingDate
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Phone Number
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="phoneFranchise"
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
                      Number of persons
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="noOfPax"
                      className="form-control"
                      placeholder="Enter number of persons"
                      name="noOfPax"
                      inputProps={{ maxLength: 5 }}
                      value={values?.noOfPax}
                      onInput={handleInput}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D+/g, "");
                        if (newValue.length <= 5 && !/^[^1-9]/.test(newValue)) {
                          setFieldValue("noOfPax", newValue);
                        }
                      }}
                      error={errors.noOfPax && touched.noOfPax ? true : false}
                      helperText={
                        errors.noOfPax && touched.noOfPax
                          ? errors.noOfPax
                          : null
                      }
                    />
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
