import React, { useEffect, useState } from "react";
import Index from "../Index";
import PagesIndex from "../PagesIndex";
import { DataService } from "../../config/DataService";
import { Api } from "../../config/Api";
import dayjs from "dayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import moment from "moment";

const ReportIssueModal = ({ open, onClose }) => {
  const [cinemaList, setCinemaList] = useState([]);
  const [multipleFile, setMultipleFile] = useState([]);
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);
  const [pickerOpen, setPickerOpen] = useState(false);

  const initialValues = {
    description: "",
    cinema_name: "",
    transaction_type: "",
    Images: [],
    termsAndConditions: false,
    email: "",
    date: "",
  };

  const handleSubmit = (values, { resetForm, setSubmitting }) => {
    const formData = new FormData();
    formData.append("description", values?.description);
    formData.append("cinemaObjectId", values?.cinema_name);
    formData.append("transaction_type", values?.transaction_type);
    formData.append("email", values?.email);
    formData.append("Date", values?.date);

    values.Images?.forEach((file) =>
      formData.append(
        "ReportIssueImages",
        file?._id ? JSON.stringify(file) : file
      )
    );

    PagesIndex.apiPostHandler(PagesIndex.Api.REPORT_ISSUE, formData, userToken)
      .then((res) => {
        if (res?.status === 400) {
          PagesIndex.toast.error(res?.message);
          setMultipleFile([]);
          setSubmitting(false);
          resetForm();
        } else {
          PagesIndex.toast.success(res?.message);
          setMultipleFile([]);
          setSubmitting(false);
          resetForm();
          onClose();
        }
      })
      .catch((err) => {});
  };

  const uploadMultipleFiles = (event, formik) => {
    const fileArray = Array.from(event.target.files);
    const maxAllowedImages = 5;

    if (fileArray.length + formik?.values.Images.length > maxAllowedImages) {
      formik?.setFieldError(
        "Images",
        `Maximum ${maxAllowedImages} images allowed.`
      );

      return;
    }

    const newMultipleFile = [...multipleFile];
    const newProductImage = [...formik?.values.Images];

    fileArray.forEach((file) => {
      newMultipleFile.push(URL.createObjectURL(file));
      newProductImage.push(file);
    });

    formik.setFieldValue("Images", newProductImage);
    setMultipleFile(newMultipleFile);
  };

  const handleRemoveImage = (index, formik) => {
    const newMultipleFile = [...multipleFile];
    newMultipleFile.splice(index, 1);
    setMultipleFile(newMultipleFile);

    const newProductImage = [...formik.values.Images];
    newProductImage.splice(index, 1);
    formik.setFieldValue("Images", newProductImage);
  };

  const getCinemaList = () => {
    DataService.get(Api.GET_CINEMA + "?" + new Date().getTime())
      .then((res) => {
        setCinemaList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  useEffect(() => {
    if (open) {
      getCinemaList();
    }
  }, [open]);
  useEffect(() => {
    setMultipleFile([]);
    setPickerOpen(false);
  }, [open]);
  return (
    <Index.Modal
      open={open}
      onClose={onClose}
      aria-labelledby="franchise-modal-title"
      aria-describedby="franchise-modal-description"
      className="franchise-modal common-modal"
    >
      <Index.Box className="franchise-modal-inner common-modal-inner">
        <Index.Box className="modal-inner cus-scrollbar">
          <Index.Typography
            variant="p"
            component="p"
            className="franchise-form-title common-modal-title"
          >
            Report An Issue
          </Index.Typography>
          <PagesIndex.Formik
            initialValues={initialValues}
            validationSchema={PagesIndex.reportAnIssueScheme}
            onSubmit={handleSubmit}
          >
            {(formik) => (
              <Index.Stack
                className="form-control"
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={formik.handleSubmit}
              >
                <Index.Grid
                  container
                  spacing={{ sm: 2, xxs: 1 }}
                  className="form-group"
                >
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Email
                    </Index.FormHelperText>
                    <Index.TextField
                      fullWidth
                      id="emailFranchise"
                      className="form-control"
                      placeholder="Enter email"
                      name="email"
                      inputProps={{ maxLength: 320 }}
                      value={formik.values?.email}
                      onChange={(e) => {
                        formik.setFieldValue("email", e.target.value.trim());
                      }}
                      error={
                        formik.errors.email && formik.touched.email
                          ? true
                          : false
                      }
                      helperText={
                        formik.errors.email && formik.touched.email
                          ? formik.errors.email
                          : null
                      }
                    />
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Date
                    </Index.FormHelperText>
                    <Index.LocalizationProvider
                      dateAdapter={Index.AdapterDayjs}
                    >
                      <DesktopDatePicker
                        className="form-control group-booking-datepicker choose-date-picker"
                        name="date"
                        onKeyDown={(e) => e.preventDefault()}
                        value={dayjs(formik.values?.date)}
                        onChange={(val) => {
                          formik.setFieldValue("date", moment(val.$d).format());
                          setPickerOpen(false);
                        }}
                        disableFuture
                        open={pickerOpen}
                        onOpen={() => setPickerOpen(true)}
                        onClose={() => setPickerOpen(false)}
                        slotProps={{
                          textField: {
                            InputProps: {
                              readOnly: true,
                              onClick: (e) => {
                                e.stopPropagation();
                                setPickerOpen(!pickerOpen);
                              },
                            },
                            inputProps: {
                              readOnly: true,
                            },
                          },
                        }}
                      />
                    </Index.LocalizationProvider>
                    <Index.FormHelperText error>
                      {formik.errors.date && formik.touched.date
                        ? formik.errors.date
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>
                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Cinema Name
                    </Index.FormHelperText>
                    <Index.Select
                      fullWidth
                      id="fullWidth"
                      name="cinema_name"
                      className="form-control cinema-dropdown choose-date-picker"
                      value={formik.values?.cinema_name}
                      displayEmpty
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      renderValue={
                        formik.values?.cinema_name !== ""
                          ? undefined
                          : () => `Select cinema name`
                      }
                      error={
                        formik.errors.cinema_name && formik.touched.cinema_name
                          ? true
                          : false
                      }
                      helperText={
                        formik.errors.cinema_name && formik.touched.cinema_name
                          ? formik.errors.cinema_name
                          : null
                      }
                    >
                      {cinemaList.map((data) => {
                        return (
                          <Index.MenuItem value={data?._id}>
                            {data?.displayName}
                          </Index.MenuItem>
                        );
                      })}
                    </Index.Select>
                    <Index.FormHelperText error>
                      {formik.errors.cinema_name && formik.touched.cinema_name
                        ? formik.errors.cinema_name
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>

                  <Index.Grid item sm={6} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Transaction Type
                    </Index.FormHelperText>
                    <Index.Select
                      fullWidth
                      id="fullWidth"
                      name="transaction_type"
                      className="form-control cinema-dropdown choose-date-picker"
                      value={formik.values?.transaction_type}
                      displayEmpty
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      renderValue={
                        formik.values?.transaction_type !== ""
                          ? undefined
                          : () => `Select Transaction Type`
                      }
                      error={
                        formik.errors.transaction_type &&
                        formik.touched.transaction_type
                          ? true
                          : false
                      }
                      helperText={
                        formik.errors.transaction_type &&
                        formik.touched.transaction_type
                          ? formik.errors.transaction_type
                          : null
                      }
                    >
                      <Index.MenuItem value="UPI">UPI</Index.MenuItem>
                      <Index.MenuItem value="Debit Or Credit Card">
                        Debit Or Credit Card
                      </Index.MenuItem>
                      <Index.MenuItem value="Internet Banking">
                        Internet Banking
                      </Index.MenuItem>
                    </Index.Select>
                    <Index.FormHelperText error>
                      {formik.errors.transaction_type &&
                      formik.touched.transaction_type
                        ? formik.errors.transaction_type
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>

                  <Index.Grid item sm={12} xxs={12}>
                    <Index.FormHelperText className="form-label">
                      Describe Issue
                    </Index.FormHelperText>
                    <Index.TextareaAutosize
                      minRows={5}
                      placeholder="Enter Issue"
                      name="description"
                      value={formik.values?.description}
                      onBlur={formik.handleBlur}
                      maxLength={2510}
                      onChange={(e) => {
                        const newValue = e.target.value
                          .replace(/^\s+/, "")
                          .replace(/\s\s+/g, " ");
                        if (newValue.length <= 2500) {
                          formik.setFieldValue("description", newValue);
                        }
                      }}
                      error={
                        formik.errors.description && formik.touched.description
                          ? true
                          : false
                      }
                    />
                    <Index.FormHelperText error>
                      {formik.errors.description && formik.touched.description
                        ? formik.errors.description
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>

                  <Index.Grid item sm={12} xxs={12} className="issue-modal">
                    <Index.FormHelperText className="form-label">
                      Images
                    </Index.FormHelperText>
                    <Index.Box className="flex-report">
                      <Index.Box className="file-upload-box-report">
                        <label className="file-label">
                          <Index.CloudUploadIcon />
                        </label>
                        <input
                          id="resumeCareer"
                          className="form-control"
                          type="file"
                          multiple
                          accept="image/*"
                          name="Images"
                          onChange={(e) => uploadMultipleFiles(e, formik)}
                          onBlur={formik.handleBlur}
                        />
                      </Index.Box>
                      {multipleFile?.length != 0 &&
                        multipleFile?.map((url, index) => (
                          <Index.Box
                            key={index}
                            className="file-upload-box-report"
                          >
                            <img className="img-fluid2" src={url} alt="..." />
                            <span
                              className="remove_img"
                              onClick={() => handleRemoveImage(index, formik)}
                            >
                              <img
                                src={PagesIndex.Png.Close}
                                className="close-img"
                              ></img>
                            </span>
                          </Index.Box>
                        ))}
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.Images && formik.touched.Images
                        ? formik.errors.Images
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
                            formik.setFieldValue(
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
                      {formik.errors.termsAndConditions &&
                      formik.touched.termsAndConditions
                        ? formik.errors.termsAndConditions
                        : null}
                    </Index.FormHelperText>
                  </Index.Grid>
                  <Index.Grid item sm={12} xxs={12}>
                    <Index.Box className="franchise-modal-action">
                      <PagesIndex.Button
                        primary
                        type="submit"
                        className="apply-button form-btn"
                        disabled={formik.isSubmitting}
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
};

export default ReportIssueModal;
