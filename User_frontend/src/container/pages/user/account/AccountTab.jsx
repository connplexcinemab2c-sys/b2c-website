import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";

function AccountTab() {
  const navigate = useNavigate();
  const initialValuesAccount = {
    email: "",
    phoneNumber: "",
  };
  const initialValues = {
    profile: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    maritalStatus: "",
    address: "",
    city: "",
  };
  const initialValuesOtp = {
    otp: "",
  };
  const dispatch = PagesIndex.useDispatch();
  const formikRef = useRef();
  const formikRefAccount = useRef();
  const formikRefOtp = useRef();
  const { userDetails, userToken, otpTimer } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const [imageUrl, setImageUrl] = useState("");
  const [edit, setEdit] = useState(false);
  const [modalType, setModalType] = useState();
  const [editType, setEditType] = useState("email");
  const [openOTPModal, setOpenOTPModal] = useState(false);
  const [changedCredential, setChangedCredential] = useState("");
  const [isDisabledOtp, setIsDisabledOtp] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (
      (modalType == "Edit" && formikRefAccount?.current?.value?.email == "") ||
      (modalType == "Edit" &&
        formikRefAccount?.current?.value?.phoneNumber == "")
    ) {
      getUser();
    }
  }, [modalType, edit]);
  useEffect(() => {
    getUser();
  }, []);
  useEffect(() => {
    let myInterval;
    if (openOTPModal) {
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
  function getUser() {
    dispatch(PagesIndex.showLoader());

    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_USER + "?" + new Date().getTime(),
      "",
      userToken
    )
      .then((res) => {
        if (res?.status === 200) {
          updateFormFields(res?.data);
          dispatch(PagesIndex.getUserData(res?.data));
        }
        //  else {
        //   PagesIndex.toast(res?.message);
        // }

        dispatch(PagesIndex.hideLoader());
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function updateFormFields(data) {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      birthDate,
      gender,
      maritalStatus,
      address,
      city,
      profile,
    } = data;

    formikRef?.current?.setFieldValue("firstName", firstName);
    formikRef?.current?.setFieldValue("lastName", lastName);
    formikRef?.current?.setFieldValue("email", email);
    formikRef?.current?.setFieldValue("phoneNumber", mobileNumber);

    formikRefAccount?.current?.setFieldValue("email", email);
    formikRefAccount?.current?.setFieldValue("phoneNumber", mobileNumber);

    if (birthDate) {
      formikRef?.current?.setFieldValue(
        "birthDate",
        PagesIndex.moment(birthDate)
      );
    }

    formikRef?.current?.setFieldValue("gender", gender || "");
    formikRef?.current?.setFieldValue("maritalStatus", maritalStatus || "");
    // formikRef?.current?.setFieldValue(
    //   "maritalStatus",
    //   maritalStatus === true
    //     ? "Married"
    //     : maritalStatus == false
    //     ? "Unmarried"
    //     : ""
    // );
    formikRef?.current?.setFieldValue("address", address ? address : "");
    formikRef?.current?.setFieldValue("city", city ? city : "");

    if (profile) {
      setImageUrl(`${PagesIndex.IMAGES_API_ENDPOINT}/${profile}`);
    }
  }
  function handleSubmit(values) {
    setIsSubmit(true);
    dispatch(PagesIndex.showLoader());
    const formdata = new FormData();
    formdata.append("profile", values?.profile);
    formdata.append("firstName", values?.firstName);
    formdata.append("lastName", values?.lastName);
    if (values?.birthDate) {
      formdata.append(
        "birthDate",
        PagesIndex.moment(values?.birthDate).format("YYYY/MM/DD")
      );
    } else {
      formdata.append("birthDate", values?.birthDate);
    }
    formdata.append("gender", values?.gender);

    formdata.append("maritalStatus", values?.maritalStatus);
    // formdata.append("maritalStatus", values?.maritalStatus == "Married");
    formdata.append("address", values?.address);
    formdata.append("city", values?.city);
    PagesIndex.apiPostHandler(
      PagesIndex.Api.UPDATE_USER,
      formdata,
      userToken
    ).then((res) => {
      setIsSubmit(false);
      if (res?.status === 200) {
        getUser();
        PagesIndex.toast.success(res?.message);
        navigate("/");
      } else {
        PagesIndex.toast.error(res?.message);
      }
    });
    dispatch(PagesIndex.hideLoader());
  }
  function handleSubmitAccountDetails(values) {
    const formdata = new URLSearchParams();
    setIsDisabledOtp(true);
    if (editType === "email") {
      formdata.append("email", values?.email?.toLowerCase());
    }
    if (editType === "phone") {
      formdata.append("mobileNumber", values?.phoneNumber);
    }
    if (editType === "email") {
      setChangedCredential(values?.email?.toLowerCase());
      PagesIndex.apiPostHandler(
        PagesIndex.Api.VERIFY_EMAIL,
        formdata,
        userToken
      ).then((res) => {
        if (res?.status === 200) {
          editModalClose();
          otpModalOpen();
          dispatch(
            PagesIndex.getOtpTimer({
              minute: 0,
              seconds: 30,
            })
          );
          setIsDisabledOtp(false);
          PagesIndex.toast.success(res?.message);
        } else {
          setIsDisabledOtp(false);
          PagesIndex.toast.error(res?.message);
        }
      });
    }
    if (editType === "phone") {
      setChangedCredential(values?.phoneNumber);
      PagesIndex.apiPostHandler(
        PagesIndex.Api.VERIFY_MOBILENUMBER,
        formdata,
        userToken
      ).then((res) => {
        if (res?.status === 200) {
          editModalClose();
          otpModalOpen();
          dispatch(
            PagesIndex.getOtpTimer({
              seconds: 30,
              minute: 0,
            })
          );
          setIsDisabledOtp(false);
          PagesIndex.toast.success(res.message);
        } else {
          setIsDisabledOtp(false);
          PagesIndex.toast.error(res?.message);
        }
      });
    }
  }
  const handleSubmitOtp = (values, { resetForm }) => {
    let payload;
    if (editType === "email") {
      payload = {
        id: userDetails?._id,
        otp: values?.otp,
        flag: 1,
        email: changedCredential,
      };
    }
    if (editType === "phone") {
      payload = {
        id: userDetails?._id,
        otp: values?.otp,
        flag: 1,
        mobileNumber: changedCredential,
      };
    }
    PagesIndex.apiPostHandler(PagesIndex.Api.VERIFY_OTP, payload).then(
      (res) => {
        resetForm();
        if (res?.status === 200) {
          formikRef.current.resetForm();
          formikRefAccount.current.resetForm();
          PagesIndex.toast.success(res?.message);
          otpModalClose();
          getUser();
          setChangedCredential("");
        } else {
          PagesIndex.toast.error(res?.message);
        }
      }
    );
  };
  const resendOtp = () => {
    let payload;
    if (editType === "email") {
      payload = {
        id: userDetails?._id,
        email: changedCredential,
      };
    }
    if (editType === "phone") {
      payload = {
        id: userDetails?._id,
        mobileNumber: changedCredential,
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
        } else {
          PagesIndex.toast.error(res?.message);
        }
      }
    );
  };
  const otpModalOpen = () => {
    setOpenOTPModal(true);
  };
  const otpModalClose = () => {
    setOpenOTPModal(false);
    formikRefOtp.current.resetForm();
  };
  const editModalOpen = (type, modal_type) => {
    setEdit(true);
    if (modal_type !== "Otp") {
      formikRefAccount?.current?.setFieldValue(
        "email",
        formikRef.current.values.email
      );
      formikRefAccount?.current?.setFieldValue(
        "phoneNumber",
        formikRef.current.values.phoneNumber
      );
    }

    modal_type == "Add" && formikRefAccount.current.resetForm();
    modal_type !== "Otp" && setModalType(modal_type);
    setEditType(type);
  };

  const editModalClose = () => {
    setEdit(false);

    // formikRefAccount.current.setFieldValue(
    //   "phoneNumber",
    //   formikRef.current.values.phoneNumber
    // );
  };

  return (
    <>
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.userDetailsSchema}
        innerRef={formikRef}
        validateOnMount
        initialTouched={{ zip: true }}
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
            <Index.Box className="account-tab-main">
              <Index.Box className="profile-header-box">
                <Index.Box className="profile-img-box">
                  <Index.Box className="profile-img">
                    <img
                      src={imageUrl ? imageUrl : PagesIndex.Png.Avatar}
                      width="80"
                      height="80"
                      alt="profile"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = PagesIndex.Png.Avatar;
                      }}
                    />
                    <input
                      name="profile"
                      type="file"
                      accept="image/*"
                      id="profile"
                      className="profile-input"
                      onChange={(event) => {
                        event?.currentTarget?.files?.length &&
                          setFieldValue(
                            "profile",
                            event.currentTarget.files[0]
                          );
                        event?.currentTarget?.files?.length &&
                          setImageUrl(
                            URL.createObjectURL(event.currentTarget.files[0])
                          );
                      }}
                      onBlur={handleBlur}
                    />
                    <label htmlFor="profile" className="profile-label">
                      <Index.CreateIcon />
                    </label>
                  </Index.Box>
                </Index.Box>
                <Index.FormHelperText error>
                  {errors.profile ? errors?.profile : null}
                </Index.FormHelperText>
              </Index.Box>
              <Index.Grid
                container
                spacing={{ sm: 2, xxs: 1 }}
                className="form-group"
              >
                <Index.Grid item sm={12} xxs={12} className="account-tab-title">
                  Account Details
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Email address
                    {values?.email ? (
                      <Index.Typography
                        variant="span"
                        component="span"
                        className="edit-label"
                        onClick={() => {
                          editModalOpen("email", "Edit");
                        }}
                      >
                        <Index.CreateIcon />
                        Edit
                      </Index.Typography>
                    ) : (
                      ""
                    )}
                  </Index.FormHelperText>
                  {values?.email ? (
                    <Index.TextField
                      name="email"
                      fullWidth
                      id="emailAcc"
                      className="form-control"
                      placeholder="Add email address"
                      type="email"
                      disabled
                      inputProps={{ maxLength: 320 }}
                      value={values?.email}
                      error={errors.email && touched.email}
                      helperText={
                        errors.email && touched.email ? errors.email : null
                      }
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <Index.InputAdornment
                            position="end"
                            className="verify-label"
                          >
                            Verified
                          </Index.InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Index.Box
                      className="add-email-phone"
                      onClick={() => {
                        editModalOpen("email", "Add");
                        formikRefAccount.current.setErrors({ email: "" });
                      }}
                    >
                      + Add email address
                    </Index.Box>
                  )}
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Phone number
                    {values?.phoneNumber ? (
                      <Index.Typography
                        variant="span"
                        component="span"
                        className="edit-label"
                        onClick={() => editModalOpen("phone", "Edit")}
                        // onChange={(e) => {
                        //   const newValue = e.target.value.replace(/\D+/g, "");
                        //   if (newValue.length <= 10) {
                        //     editModalOpen("phone");
                        //   }
                        // }}
                      >
                        <Index.CreateIcon />
                        Edit
                      </Index.Typography>
                    ) : (
                      ""
                    )}
                  </Index.FormHelperText>
                  {values?.phoneNumber ? (
                    <Index.TextField
                      name="phoneNumber"
                      fullWidth
                      id="phoneAcc"
                      className="form-control"
                      placeholder="Add phone number"
                      type="number"
                      disabled
                      inputProps={{ maxLength: 10 }}
                      value={values?.phoneNumber}
                      error={errors.phoneNumber && touched.phoneNumber}
                      helperText={
                        errors.phoneNumber && touched.phoneNumber
                          ? errors.phoneNumber
                          : null
                      }
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <Index.InputAdornment
                            position="end"
                            className="verify-label"
                          >
                            Verified
                          </Index.InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Index.Box
                      className="add-email-phone"
                      onClick={() => editModalOpen("phone", "Add")}
                    >
                      + Add phone number
                    </Index.Box>
                  )}
                </Index.Grid>
                <Index.Divider className="divider" />
                <Index.Grid item sm={12} xxs={12} className="account-tab-title">
                  Personal Details
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    First name
                  </Index.FormHelperText>
                  <Index.TextField
                    name="firstName"
                    fullWidth
                    id="firstNameAcc"
                    className="form-control"
                    placeholder="Enter first name"
                    inputProps={{ maxLength: 30 }}
                    value={values?.firstName}
                    error={errors.firstName && touched.firstName}
                    helperText={
                      errors.firstName && touched.firstName
                        ? errors.firstName
                        : null
                    }
                    onChange={(e) => {
                      const newValue = e.target.value
                        .replace(/^\s+/, "")
                        .replace(/\s\s+/g, " ");
                      if (newValue.length <= 30) {
                        setFieldValue("firstName", newValue);
                      }
                    }}
                    onBlur={handleBlur}
                  />
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Last name
                  </Index.FormHelperText>
                  <Index.TextField
                    name="lastName"
                    fullWidth
                    id="lastNameAcc"
                    className="form-control"
                    placeholder="Enter last name"
                    inputProps={{ maxLength: 30 }}
                    value={values?.lastName}
                    error={errors.lastName && touched.lastName}
                    helperText={
                      errors.lastName && touched.lastName
                        ? errors.lastName
                        : null
                    }
                    onChange={(e) => {
                      const newValue = e.target.value
                        .replace(/^\s+/, "")
                        .replace(/\s\s+/g, " ");
                      if (newValue.length <= 30) {
                        setFieldValue("lastName", newValue);
                      }
                    }}
                    onBlur={handleBlur}
                  />
                </Index.Grid>
                <Index.Grid item sm={4} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Birthdate
                  </Index.FormHelperText>
                  <PagesIndex.Datetime
                    name="birthDate"
                    closeOnSelect
                    timeFormat={false}
                    className="birth-input"
                    value={values?.birthDate}
                   
                    isValidDate={(current) => {
                      const today = PagesIndex.moment();
                      return (
                        current.isBefore(
                          PagesIndex.moment().endOf("year").subtract(11, "year")
                        ) &&
                        current.isAfter(
                          PagesIndex.moment("31/12/1899", "DD/MM/YYYY")
                        ) &&
                        !current.isSame(today, "day")
                      );
                    }}
                    inputProps={{ placeholder: "DD/MM/YYYY", readOnly : true }}
                    dateFormat="DD/MM/YYYY"
                    onChange={(e) => {
                      setFieldValue("birthDate", e);
                    }}
                  />
                  <PagesIndex.FormHelperText error>
                    {errors.birthDate && touched.birthDate
                      ? errors.birthDate
                      : null}
                  </PagesIndex.FormHelperText>
                </Index.Grid>
                <Index.Grid item sm={4} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Gender
                  </Index.FormHelperText>
                  <Index.Select
                    id={"gender"}
                    name="gender"
                    className="gender-select "
                    displayEmpty
                    fullWidth
                    renderValue={
                      values?.gender
                        ? undefined
                        : () => (
                            <span className="placeholder-text">
                              Select gender
                            </span>
                          )
                    }
                    inputProps={{ "aria-label": "Without label" }}
                    value={values?.gender}
                    error={errors.gender && touched.gender}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  >
                    <Index.MenuItem value={"Male"} className="menuitem">
                      Male
                    </Index.MenuItem>
                    <Index.MenuItem value={"Female"} className="menuitem">
                      Female
                    </Index.MenuItem>
                    <Index.MenuItem value={"Other"} className="menuitem">
                      Other
                    </Index.MenuItem>
                  </Index.Select>
                  <Index.FormHelperText error>
                    {errors.gender && touched.gender ? errors.gender : null}
                  </Index.FormHelperText>
                </Index.Grid>
                <Index.Grid item sm={4} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Marital status
                  </Index.FormHelperText>
                  <Index.Select
                    id={"maritalStatus"}
                    name="maritalStatus"
                    className="city-select "
                    displayEmpty
                    fullWidth
                    renderValue={
                      values?.maritalStatus !== ""
                        ? undefined
                        : values?.maritalStatus !== "" ? undefined :  () => (
                            <span className="placeholder-text">
                              Select marital status
                            </span>
                          )
                    }
                    inputProps={{ "aria-label": "Without label" }}
                    value={values?.maritalStatus}
                    error={errors.maritalStatus && touched.maritalStatus}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  >
                    <Index.MenuItem value={false} className="menuitem">
                      Unmarried
                    </Index.MenuItem>
                    <Index.MenuItem value={true} className="menuitem">
                      Married
                    </Index.MenuItem>
                  </Index.Select>
                  <Index.FormHelperText error>
                    {errors.maritalStatus && touched.maritalStatus
                      ? errors.maritalStatus
                      : null}
                  </Index.FormHelperText>
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    Address
                  </Index.FormHelperText>
                  <Index.TextField
                    name="address"
                    fullWidth
                    id="address1Acc"
                    className="form-control"
                    placeholder="Enter address"
                    inputProps={{ maxLength: 350 }}
                    value={values?.address}
                    error={errors.address && touched.address}
                    helperText={
                      errors.address && touched.address ? errors.address : null
                    }
                    onChange={(e) => {
                      const newValue = e.target.value
                        .replace(/^\s+/, "")
                        .replace(/\s\s+/g, " ");
                      if (newValue.length <= 350) {
                        setFieldValue("address", newValue);
                      }
                    }}
                  />
                </Index.Grid>
                <Index.Grid item sm={6} xxs={12}>
                  <Index.FormHelperText className="form-label">
                    City
                  </Index.FormHelperText>
                  <Index.TextField
                    name="city"
                    fullWidth
                    id="address2Acc"
                    className="form-control"
                    placeholder="Enter city"
                    inputProps={{ maxLength: 50 }}
                    value={values?.city}
                    error={errors.city && touched.city}
                    helperText={
                      errors.city && touched.city ? errors.city : null
                    }
                    onChange={(e) => {
                      const newValue = e.target.value
                        .replace(/^\s+/, "")
                        .replace(/\s\s+/g, " ");
                      if (newValue.length <= 50) {
                        setFieldValue("city", newValue);
                      }
                    }}
                  />
                </Index.Grid>
                <Index.Grid item sm={12} xxs={12} className="form-submit">
                  <PagesIndex.Button
                    primary
                    className="save-button form-btn"
                    type="submit"
                    disabled={
                      !values?.firstName || !values?.lastName || isSubmit
                    }
                  >
                    Update Profile
                  </PagesIndex.Button>
                </Index.Grid>
              </Index.Grid>
            </Index.Box>
          </Index.Stack>
        )}
      </PagesIndex.Formik>
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmitAccountDetails}
        initialValues={initialValuesAccount}
        validationSchema={
          editType === "email"
            ? PagesIndex.accountDetailsEmailSchema
            : PagesIndex.accountDetailsPhoneSchema
        }
        innerRef={formikRefAccount}
        validateOnMount
        initialTouched={{ zip: true }}
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
          <Index.Modal
            open={edit}
            onClose={() => {
              editModalClose();
              formikRefAccount.current.resetForm();
            }}
            className="edit-number-modal"
          >
            <Index.Box className="edit-number-modal-inner">
              <Index.Box className="modal-inner cus-scrollbar">
                <Index.Stack
                  className="form-control"
                  component="form"
                  noValidate
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <Index.Typography className="edit-number-title">
                    {modalType ? modalType : ""}{" "}
                    {editType === "email" ? "email address" : "phone number"}
                  </Index.Typography>
                  <Index.Typography className="edit-number-content">
                    This {editType === "email" ? "email" : "phone number"} will
                    be verified by an OTP
                  </Index.Typography>
                  <Index.Box className="edit-number-form">
                    <Index.TextField
                      fullWidth
                      name={editType === "email" ? "email" : `phoneNumber`}
                      className="form-control"
                      placeholder={`Enter your ${
                        editType === "email" ? "email" : "phone number"
                      }`}
                      inputProps={{
                        maxLength: editType === "phone" ? 10 : 100,
                      }}
                      value={
                        editType === "email"
                          ? values?.email
                          : values?.phoneNumber
                      }
                      onChange={(e) => {
                        let inputValue = e.target.value.trim();
                        let fieldType =
                          editType === "email" ? "email" : "phoneNumber";

                        if (fieldType === "phoneNumber") {
                          inputValue = inputValue.replace(/\D/g, "");
                        }
                        setFieldValue(fieldType, inputValue);
                      }}
                      error={
                        editType === "email" && errors.email && touched.email
                          ? true
                          : editType === "phone" &&
                            errors.phoneNumber &&
                            touched.phoneNumber
                      }
                      helperText={
                        editType === "email" && errors.email && touched.email
                          ? errors.email
                          : editType === "phone" &&
                            errors.phoneNumber &&
                            touched.phoneNumber
                          ? errors.phoneNumber
                          : null
                      }
                    />
                    <PagesIndex.Button
                      type="submit"
                      primary
                      className="edit-number-btn"
                      disabled={isDisabledOtp}
                    >
                      Verify
                    </PagesIndex.Button>
                  </Index.Box>
                </Index.Stack>
              </Index.Box>
            </Index.Box>
          </Index.Modal>
        )}
      </PagesIndex.Formik>
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubmitOtp}
        initialValues={initialValuesOtp}
        validationSchema={PagesIndex.otpSchema}
        innerRef={formikRefOtp}
        validateOnMount
        initialTouched={{ zip: true }}
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
          <Index.Modal
            open={openOTPModal}
            onClose={() => {
              otpModalClose();
              // formikRefAccount?.current?.resetForm();
            }}
            className="edit-number-modal"
          >
            <Index.Box className="edit-number-modal-inner">
              <Index.Box className="modal-inner cus-scrollbar">
                <Index.Stack
                  className="form-control"
                  component="form"
                  noValidate
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <Index.Typography className="edit-number-title">
                    Verify your{" "}
                    {editType === "email" ? "Email address" : "Phone Number"}
                  </Index.Typography>
                  <Index.Typography className="edit-number-content">
                    Enter OTP sent to{" "}
                    {
                      formikRefAccount.current?.values[
                        editType === "email" ? "email" : "phoneNumber"
                      ]
                    }
                  </Index.Typography>
                  <Index.Box className="otp-form-wrapper">
                    <Index.Box className="otp-form-inner-wrapper">
                      <PagesIndex.OTPInput
                        shouldAutoFocus
                        name="otp"
                        numInputs={4}
                        inputStyle="form-control"
                        containerStyle="otp-form"
                        inputType="number"
                        value={values.otp}
                        onChange={(value) => {
                          setFieldValue("otp", value);
                        }}
                        error={errors.otp && touched.otp}
                        renderInput={(props) => <input {...props} />}
                      />
                      <Index.FormHelperText error>
                        {errors.otp && touched.otp ? errors.otp : null}
                      </Index.FormHelperText>
                      <Index.Box className="resend-otp-box account-tab-otp">
                        <Index.Typography variant="span" component="span">
                          Didn't receive the OTP?
                        </Index.Typography>
                        {otpTimer.minute === 0 && otpTimer.seconds === 0 ? (
                          <button
                            className="resend-otp-btn"
                            onClick={() => {
                              resendOtp();
                              setErrors({});
                              formikRefOtp?.current?.resetForm();
                            }}
                            type="button"
                          >
                            Resend
                          </button>
                        ) : (
                            <Index.Typography className="resend-otp-box" variant="span" component="span">
                              Expire OTP in {otpTimer.minute < 10
                                ? `0${otpTimer.minute}`
                                : otpTimer.minute}
                              :
                              {otpTimer.seconds < 10
                                ? `0${otpTimer.seconds}`
                                : otpTimer.seconds} sec
                            </Index.Typography>
                        )}
                      </Index.Box>
                    </Index.Box>
                    <PagesIndex.Button
                      primary
                      className="otp-btn"
                      type="submit"
                    >
                      Verify OTP
                    </PagesIndex.Button>
                    <Index.Box className="back-btn-box">
                      <Index.Box
                        onClick={() => {
                          editModalOpen(editType, "Otp");
                          setOpenOTPModal(false);
                          setErrors({});
                          formikRefOtp?.current?.resetForm();
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
            </Index.Box>
          </Index.Modal>
        )}
      </PagesIndex.Formik>
    </>
  );
}

export default AccountTab;
