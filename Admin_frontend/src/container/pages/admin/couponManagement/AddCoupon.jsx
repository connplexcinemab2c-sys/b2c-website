import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import "./CouponManagement.css";
import dayjs from "dayjs";

import { useFormik } from "formik";
import moment from "moment";
import PagesIndex from "../../../PagesIndex";
import { useLocation, useNavigate } from "react-router-dom";
import { couponSchema } from "../../../../validation/FormikValidation";
import { IMAGES_API_ENDPOINT } from "../../../../config/DataService";

const AddCoupon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const movieLanguage = [
    "All",
    "Hindi",
    "English",
    "Tamil",
    "Telugu",
    "Gujarati",
  ];
  const [imageUrl, setImageUrl] = useState("");
  // const [userList, setUserList] = useState([]);
  const [subscriberList, setSubscriberList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const editData = location?.state?.row;
  const [loading, setLoading] = useState(false);

  const initialValues = {
    couponFor: editData?.couponFor ? editData?.couponFor : "",
    couponCategory: editData?.couponCategory ? editData?.couponCategory : "",
    couponType: editData?.couponType ? editData?.couponType : "",
    couponTitle: editData?.couponTitle ? editData?.couponTitle : "",
    couponUsage: editData?.couponUsage ? editData?.couponUsage : "",
    couponStartDate: editData?.couponStartDate ? editData?.couponStartDate : "",
    couponEndDate: editData?.couponEndDate ? editData?.couponEndDate : "",
    couponCodeOverAllUsage: editData?.couponCodeOverAllUsage
      ? editData?.couponCodeOverAllUsage
      : "",
    couponDescription: editData?.couponDescription
      ? editData?.couponDescription
      : "",
    movieLanguage: editData?.movieLanguage ? editData?.movieLanguage : "",
    city: editData?.cityId ? editData?.cityId.map((city) => city._id) : "",
    cinema: editData?.cinemaObjectId
      ? editData?.cinemaObjectId.map((cinema) => cinema._id)
      : "",
    mergeWithAnotherCoupon: editData?.advancedSettings.mergeWithAnotherCoupon
      ? editData?.advancedSettings.mergeWithAnotherCoupon
      : 0,
    autoApplyOnCheckOut: editData?.advancedSettings.autoApplyOnCheckOut
      ? editData?.advancedSettings.autoApplyOnCheckOut
      : 0,
    privateCoupon: editData?.advancedSettings.privateCoupon
      ? editData?.advancedSettings.privateCoupon
      : 0,
    assignUserId: editData?.assignCoupon?.assignUserId
      ? editData?.assignCoupon?.assignUserId.map((user) => user._id)
      : "",
    subscriptionId: editData?.assignCoupon?.subscriptionId
      ? editData?.assignCoupon?.subscriptionId
      : "",
    spentForm: editData?.assignCoupon?.rangeOfSpent?.spentForm
      ? editData?.assignCoupon?.rangeOfSpent?.spentForm
      : "",
    spentTo: editData?.assignCoupon?.rangeOfSpent?.spentTo
      ? editData?.assignCoupon?.rangeOfSpent?.spentTo
      : "",
    discountType: editData?.discountType ? editData?.discountType : "",
    discount: editData?.discount ? editData?.discount : "",
    couponUpTo: editData?.couponUpTo ? editData?.couponUpTo : "",
    image: editData?.couponImage ? editData?.couponImage : "",
  };
  const handleSubmit = (values) => {
    if (values.city == "all") {
      values.city = regionList
        .map((row) => row._id)
        .filter((id) => id !== "all");
    }
    if (values.cinema == "all") {
      values.cinema = cinemaList
        .map((row) => row._id)
        .filter((id) => id !== "all");
    }
    if (values.movieLanguage == "All") {
      values.movieLanguage = movieLanguage.filter((row) => row !== "All");
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("couponFor", values.couponFor);
    formData.append("couponType", values.couponType);
    formData.append("couponTitle", values.couponTitle);
    formData.append("couponUsage", values.couponUsage);
    formData.append("couponStartDate", values.couponStartDate);
    formData.append("couponEndDate", values.couponEndDate);
    formData.append("couponCodeOverAllUsage", values.couponCodeOverAllUsage);
    formData.append("couponDescription", values.couponDescription);
    if (values.couponType !== "Ecommerce") {
      // formData.append("movieLanguage", values.movieLanguage);
      // formData.append("city", values.city);
      // formData.append("cinema", values.cinema);
      // formData.append("membershipId", values.subscriptionId);
    }

    formData.append("mergeWithAnotherCoupon", values.mergeWithAnotherCoupon);
    formData.append("autoApplyOnCheckOut", values.autoApplyOnCheckOut);
    // formData.append("privateCoupon", values.privateCoupon);
    // formData.append("assignUserId", values.assignUserId);
    // formData.append("subscriptionId", values.subscriptionId);
    formData.append("spentForm", values.spentForm);
    formData.append("spentTo", values.spentTo);
    formData.append("discountType", values.discountType);
    formData.append("discount", values.discount);
    formData.append("couponCategory", values.couponCategory);
    formData.append("couponUpTo", values.couponUpTo);
    formData.append("couponImage", values.image);

    if (editData?._id) {
      formData.append("id", editData?._id);
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_COUPON, formData)
      .then((res) => {
        if (res?.status == 200 || res?.status == 201) {
          PagesIndex.toast.success(res?.data?.message);
          setLoading(false);
        } else if (res?.status == 400) {
          PagesIndex.toast.error(res?.message);
          setLoading(false);
        }
        navigate("/admin/coupon-management");
      })
      .catch((err) => {
        console.log(err);
        PagesIndex.toast.error(err?.response?.data?.message);
        setLoading(false);
      });
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: couponSchema,
    onSubmit: handleSubmit,
  });

  const selectedOption = subscriberList.find(
    (option) => option._id === formik.values.subscriptionId
  );

  // const getUserList = () => {
  //   PagesIndex.DataService.get(
  //     PagesIndex.Api.GET_USER_LIST + "?" + new Date().getTime()
  //   )
  //     .then((res) => {
  //       setUserList(res?.data?.data);
  //     })
  //     .catch((err) => {
  //       PagesIndex.toast.error(err?.response?.data.message);
  //     });
  // };
  const getFranchiseApplication = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_SUBSCRIPTION_LIST)
      .then((res) => {
        setSubscriberList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        const cinemaList = res?.data?.data;

        const filteredList = cinemaList.filter((row) =>
          formik.values.city.includes(row?.regionId?._id)
        );

        const cinemaListWithAll = [
          { _id: "all", cinemaName: "All" },
          ...cinemaList,
        ];

        const filteredListWithAll = [
          { _id: "all", cinemaName: "All" },
          ...filteredList,
        ];

        if (formik.values.city == "all") {
          setCinemaList(cinemaListWithAll);
        } else {
          setCinemaList(filteredListWithAll);
        }
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const getRegionList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_REGION + "?" + new Date().getTime()
    )
      .then((res) => {
        const data = res?.data?.data;

        const regionListWithAll = [
          {
            _id: "all",
            region: "All",
          },
          ...data,
        ];

        setRegionList(regionListWithAll);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    // getUserList();
    getFranchiseApplication();

    getRegionList();
  }, []);
  useEffect(() => {
    getCinemaList();
  }, [formik.values.city]);

  useEffect(() => {
    if (editData?.couponImage) {
      setImageUrl(`${IMAGES_API_ENDPOINT}/${editData?.couponImage}`);
    } else {
      console.log("else");
    }
  }, [editData?.couponImage]);

  console.log(formik.errors, "formik.errors");
  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Index.Box
          className="barge-common-box cms-box"
          sx={{ marginBottom: "15px" }}
        >
          <Index.Box className="title-header">
            <Index.Box className="res-title-header-flex add-coupon-flex">
              <Index.Box className="title-main">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  {editData?._id ? "Edit Coupon" : "Add Coupon"}
                </Index.Typography>
              </Index.Box>
              {/* <Index.Box>
                <Index.Box className="common-button blue-button res-blue-button">
                  <Index.Button
                    variant="contained"
                    className="no-text-decoration"
                  >
                    Advance Settings
                  </Index.Button>
                </Index.Box>
              </Index.Box> */}
            </Index.Box>
          </Index.Box>

          <Index.Box className="add-coupon-details">
            <Index.Box className="blog-add-box">
              <Index.Grid container spacing={1}>
                <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      {/* Image (size 1100x540 px) */}
                      Image
                    </Index.FormHelperText>
                    <Index.Box className="file-upload-btn-main">
                      <Index.Button
                        variant="contained"
                        component="label"
                        className="file-upload-btn"
                      >
                        <img
                          className={`${
                            imageUrl ? "upload-profile-img" : "upload-img"
                          }
                              `}
                          src={`${imageUrl ? imageUrl : PagesIndex.Svg.add}`}
                          alt="Add Image"
                        />
                        <input
                          hidden
                          accept="image/*"
                          name="image"
                          type="file"
                          onChange={(e) => {
                            try {
                              if (
                                e.currentTarget.files &&
                                e.currentTarget.files[0]
                              ) {
                                formik.setFieldValue(
                                  "image",
                                  e.currentTarget.files[0]
                                );
                                setImageUrl(
                                  URL.createObjectURL(e.currentTarget.files[0])
                                );
                              }
                            } catch (error) {
                              e.currentTarget.value = null;
                            }
                          }}
                        />
                      </Index.Button>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.image && formik.touched.image
                        ? formik.errors.image
                        : false}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                {formik?.values?.couponType !== "Membership" && (
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="advanced-sm-flex">
                      <Index.Box className="advance-flex-checkbox">
                        <Index.Checkbox
                          name="couponFor"
                          value="website"
                          checked={formik.values.couponFor.includes("website")}
                          onChange={() => {
                            const newValue = formik.values.couponFor.includes(
                              "website"
                            )
                              ? formik.values.couponFor.filter(
                                  (item) => item !== "website"
                                )
                              : [...formik.values.couponFor, "website"];
                            formik.setFieldValue("couponFor", newValue);
                          }}
                        />
                        <Index.Typography className="title-checkbox-coupon">
                          Website
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="advance-flex-checkbox">
                        <Index.Checkbox
                          name="couponFor"
                          value="app"
                          checked={formik.values.couponFor.includes("app")}
                          onChange={() => {
                            const newValue = formik.values.couponFor.includes(
                              "app"
                            )
                              ? formik.values.couponFor.filter(
                                  (item) => item !== "app"
                                )
                              : [...formik.values.couponFor, "app"];
                            formik.setFieldValue("couponFor", newValue);
                          }}
                        />
                        <Index.Typography className="title-checkbox-coupon">
                          App
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.couponFor && formik.touched.couponFor
                        ? formik.errors.couponFor
                        : false}
                    </Index.FormHelperText>
                  </Index.Grid>
                )}

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Type of Coupon
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        className="form-control"
                        value={formik.values.couponType}
                        onBlur={formik.handleBlur}
                        name="couponType"
                        // onChange={formik.handleChange}
                        onChange={(e) => {
                          formik.handleChange(e);
                          if (e.target.value === "Ecommerce") {
                            formik.setFieldValue("couponCategory", "Private");
                            formik.setFieldValue("movieLanguage", "");
                            formik.setFieldValue("city", "");
                            formik.setFieldValue("cinema", "");
                          } else {
                            formik.setFieldValue("couponCategory", "");
                            formik.setFieldValue("couponUsage", "1");
                          }
                        }}
                        displayEmpty
                        renderValue={
                          formik.values.couponType
                            ? undefined
                            : () => (
                                <span className="placeholder-text">
                                  Select Type of Coupon
                                </span>
                              )
                        }
                      >
                        {/* <Index.MenuItem value="All">All</Index.MenuItem> */}

                        {/* <Index.MenuItem value="Ecommerce">
                          Ecommerce
                        </Index.MenuItem> */}
                        <Index.MenuItem value="Membership">
                          Membership
                        </Index.MenuItem>
                        {/* <Index.MenuItem value="Cinema">Cinema</Index.MenuItem>
                        <Index.MenuItem value="F&B">F&B</Index.MenuItem> */}
                        <Index.MenuItem value="Ecommerce">
                          Ecommerce{" "}
                        </Index.MenuItem>
                        {/* <Index.MenuItem value="Subscription">
                          Subscription
                        </Index.MenuItem> */}
                      </Index.Select>
                      <Index.FormHelperText error>
                        {formik.errors.couponType && formik.touched.couponType
                          ? formik.errors.couponType
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                {formik?.values?.couponType !== "Membership" && (
                  <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Coupon Category
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          className="form-control"
                          value={formik.values.couponCategory}
                          onBlur={formik.handleBlur}
                          name="couponCategory"
                          onChange={formik.handleChange}
                          displayEmpty
                          disabled={formik.values.couponType === "Ecommerce"}
                          renderValue={
                            formik.values.couponCategory
                              ? undefined
                              : () => (
                                  <span className="placeholder-text">
                                    Select type of coupon category
                                  </span>
                                )
                          }
                        >
                          <Index.MenuItem value="Public">Public</Index.MenuItem>
                          <Index.MenuItem value="Private">
                            Private
                          </Index.MenuItem>
                        </Index.Select>
                        <Index.FormHelperText error>
                          {formik.errors.couponCategory &&
                          formik.touched.couponCategory
                            ? formik.errors.couponCategory
                            : false}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                  </Index.Grid>
                )}
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Coupon code title
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="fullWidth"
                        name="couponTitle"
                        className="form-control"
                        placeholder="Enter Coupon code title"
                        value={formik.values.couponTitle}
                        inputProps={{ maxLength: 12 }}
                        onChange={(e) => {
                          const input = e.target;
                          const start = input.selectionStart;
                          const end = input.selectionEnd;

                          let newValue = input.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "");

                          if (newValue.length > 12) {
                            newValue = newValue.slice(0, 12);
                          }

                          formik.setFieldValue("couponTitle", newValue);

                          requestAnimationFrame(() => {
                            input.selectionStart = start;
                            input.selectionEnd = end;
                          });
                        }}
                        onBlur={formik.handleBlur}
                      />
                      <Index.FormHelperText error>
                        {formik.errors.couponTitle && formik.touched.couponTitle
                          ? formik.errors.couponTitle
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Coupon code (per user)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="fullWidth"
                        name="couponUsage"
                        className="form-control"
                        placeholder="Enter Coupon code (per user)"
                        value={formik.values.couponUsage}
                        disabled={formik.values.couponType === "Membership"}
                        inputProps={{ maxLength: 51 }}
                        onChange={(e) => {
                          let newValue = e.target.value.replace(/[^0-9]/g, "");

                          if (
                            newValue.startsWith("0") ||
                            /0000000/.test(newValue)
                          ) {
                            return;
                          }

                          if (newValue.length > 7) {
                            newValue = newValue.slice(0, 7);
                          }

                          formik.setFieldValue("couponUsage", newValue);

                          if (newValue.length === 7) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                      <Index.FormHelperText error>
                        {formik.errors.couponUsage && formik.touched.couponUsage
                          ? formik.errors.couponUsage
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Over all Coupon code usage
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="fullWidth"
                        name="couponCodeOverAllUsage"
                        value={formik.values.couponCodeOverAllUsage}
                        onChange={(e) => {
                          let newValue = e.target.value.replace(/[^0-9]/g, "");

                          if (
                            newValue.startsWith("0") ||
                            /0000000/.test(newValue)
                          ) {
                            return;
                          }

                          if (newValue.length > 7) {
                            newValue = newValue.slice(0, 7);
                          }

                          formik.setFieldValue(
                            "couponCodeOverAllUsage",
                            newValue
                          );

                          if (newValue.length === 7) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={formik.handleBlur}
                        className="form-control"
                        placeholder="Enter coupon code over all usage"
                      />
                      <Index.FormHelperText error>
                        {formik.errors.couponCodeOverAllUsage &&
                        formik.touched.couponCodeOverAllUsage
                          ? formik.errors.couponCodeOverAllUsage
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Start Date
                    </Index.FormHelperText>
                    <Index.Box className="form-group date-picker">
                      <Index.LocalizationProvider
                        dateAdapter={Index.AdapterDayjs}
                      >
                        <Index.DatePicker
                          fullWidth
                          id="fullWidth"
                          name="couponStartDate"
                          onBlur={formik.handleBlur}
                          value={dayjs(formik.values.couponStartDate)}
                          onChange={(val) => {
                            formik.setFieldValue(
                              "couponStartDate",
                              moment(val.$d).format("YYYY-MM-DD")
                            );
                            formik.setFieldValue("couponEndDate", "");
                          }}
                          className="form-control"
                          format="DD/MM/YYYY"
                          placeholder="Enter release date"
                          disablePast
                          slotProps={{
                            textField: {
                              readOnly: true,
                              error: false,
                            },
                          }}
                        />
                      </Index.LocalizationProvider>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.couponStartDate &&
                      formik.touched.couponStartDate
                        ? formik.errors.couponStartDate
                        : false}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={3} md={6} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      End Date
                    </Index.FormHelperText>
                    <Index.Box className="form-group date-picker">
                      <Index.LocalizationProvider
                        dateAdapter={Index.AdapterDayjs}
                      >
                        <Index.DatePicker
                          fullWidth
                          id="fullWidth"
                          name="couponEndDate"
                          value={dayjs(formik.values.couponEndDate)}
                          onChange={(val) =>
                            formik.setFieldValue(
                              "couponEndDate",
                              moment(val.$d).format("YYYY-MM-DD")
                            )
                          }
                          onBlur={formik.handleBlur}
                          disabled={!formik.values.couponStartDate}
                          className="form-control"
                          format="DD/MM/YYYY"
                          placeholder="Enter release date"
                          slotProps={{
                            textField: {
                              readOnly: true,
                              error: false,
                            },
                          }}
                          minDate={dayjs(formik.values.couponStartDate)}
                        />
                      </Index.LocalizationProvider>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.couponEndDate &&
                      formik.touched.couponEndDate
                        ? formik.errors.couponEndDate
                        : false}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
 {formik?.values?.couponType !== "Membership" && (
                <Index.Grid item lg={6} md={8} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Range of spent
                    </Index.FormHelperText>
                    <Index.Box className="flex-range-contain">
                      <Index.Box className="form-group w-50-input-contain">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="spentForm"
                          className="form-control"
                          placeholder="From (Enter the amount)"
                          value={formik.values.spentForm}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            let newValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );

                            if (
                              newValue.startsWith("0") ||
                              /0000000/.test(newValue)
                            ) {
                              return;
                            }

                            if (newValue.length > 7) {
                              newValue = newValue.slice(0, 7);
                            }
                            if (newValue.length === 0) {
                              formik.setFieldValue("spentTo", "");
                            }
                            formik.setFieldValue("spentForm", newValue);

                            if (newValue.length === 7) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Index.Box>
                      <Index.Typography className="range-to-title">
                        To
                      </Index.Typography>
                      <Index.Box className="form-group w-50-input-contain">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="spentTo"
                          className="form-control"
                          placeholder="To (Enter the amount)"
                          value={formik.values.spentTo}
                          disabled={!formik.values.spentForm}
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            let newValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );

                            if (
                              newValue.startsWith("0") ||
                              /0000000/.test(newValue)
                            ) {
                              return;
                            }

                            if (newValue.length > 7) {
                              newValue = newValue.slice(0, 7);
                            }

                            formik.setFieldValue("spentTo", newValue);

                            if (newValue.length === 7) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="flex-range-contain">
                      <Index.Box className="spent-error-msg">
                        <Index.FormHelperText error>
                          {formik.errors.spentForm && formik.touched.spentForm
                            ? formik.errors.spentForm
                            : false}
                        </Index.FormHelperText>
                      </Index.Box>
                      <Index.Box className="to-spent"></Index.Box>
                      <Index.Box className="spent-error-msg">
                        <Index.FormHelperText error>
                          {formik.errors.spentTo && formik.touched.spentTo
                            ? formik.errors.spentTo
                            : false}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
 )}
{!["Ecommerce", "Membership"].includes(formik.values.couponType) && (                  <>
                    <Index.Grid item lg={6} md={4} sm={6} xs={12}>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Movie Language
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Autocomplete
                            className="cinema-auto-input"
                            options={movieLanguage}
                            multiple
                            onChange={(e, v) =>
                              formik.setFieldValue("movieLanguage", v)
                            }
                            value={movieLanguage?.filter((movie) =>
                              formik.values.movieLanguage.includes(movie)
                            )}
                            disableCloseOnSelect
                            onBlur={() =>
                              formik.setFieldTouched("movieLanguage", true)
                            }
                            isOptionEqualToValue={(option, value) =>
                              option === value
                            }
                            getOptionLabel={(option) => option}
                            renderOption={(props, option, { selected }) => {
                              return (
                                <Index.MenuItem
                                  key={option}
                                  value={formik.values.movieLanguage}
                                  sx={{ justifyContent: "space-between" }}
                                  {...props}
                                >
                                  <Index.ListItemText>
                                    {option}
                                  </Index.ListItemText>
                                </Index.MenuItem>
                              );
                            }}
                            renderInput={(params) => (
                              <Index.TextField
                                {...params}
                                placeholder={
                                  formik.values?.movieLanguage?.length === 0
                                    ? "Select movie language"
                                    : ""
                                }
                              />
                            )}
                          />
                          <Index.FormHelperText error>
                            {formik.errors.movieLanguage &&
                            formik.touched.movieLanguage
                              ? formik.errors.movieLanguage
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Area/City
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Autocomplete
                            disablePortal
                            className="cinema-auto-input"
                            options={regionList}
                            multiple
                            disableCloseOnSelect
                            getOptionLabel={(option) => option?.region || ""}
                            onChange={(e, v) => {
                              const ids = v.map((city) => city._id);
                              formik.setFieldValue("city", ids);
                              // if (!editData) {
                              //   formik.setFieldValue("cinema", "");
                              // }
                              let cinemaSelected = formik.values.cinema;
                              formik.values.cinema.forEach((cinemaId) => {
                                if (
                                  !cinemaList.find(
                                    (cinema) => cinema._id === cinemaId
                                  )
                                ) {
                                  // cinemaSelected.splice(
                                  //   cinemaSelected.indexOf(cinemaId),
                                  //   1
                                  // );
                                  let tempCinemaSelected =
                                    cinemaSelected.filter(
                                      (cinema) => cinema !== cinemaId
                                    );
                                  cinemaSelected = tempCinemaSelected;
                                }
                              });
                              formik.setFieldValue("cinema", cinemaSelected);
                            }}
                            onBlur={() => formik.setFieldTouched("city", true)}
                            value={regionList.filter((city) =>
                              formik.values.city.includes(city._id)
                            )}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value._id
                            }
                            disableClearable
                            renderOption={(props, option, { selected }) => {
                              return (
                                <Index.MenuItem
                                  key={option?._id}
                                  value={formik.values.city}
                                  sx={{ justifyContent: "space-between" }}
                                  {...props}
                                >
                                  <Index.ListItemText>
                                    {option?.region}
                                  </Index.ListItemText>
                                </Index.MenuItem>
                              );
                            }}
                            renderInput={(params) => (
                              <Index.TextField
                                {...params}
                                placeholder={
                                  formik.values?.city?.length === 0
                                    ? "Select city"
                                    : ""
                                }
                              />
                            )}
                          />
                          <Index.FormHelperText error>
                            {formik.errors.city && formik.touched.city
                              ? formik.errors.city
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Cinemas (theater)
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Autocomplete
                            className="cinema-auto-input"
                            options={cinemaList}
                            multiple
                            getOptionLabel={(option) =>
                              option?.cinemaName || ""
                            }
                            onChange={(e, v) => {
                              const ids = v.map((user) => user._id);
                              formik.setFieldValue("cinema", ids);
                            }}
                            onBlur={() =>
                              formik.setFieldTouched("cinema", true)
                            }
                            // disabled={!formik.values.city}
                            value={cinemaList.filter((cinema) =>
                              formik.values.cinema.includes(cinema._id)
                            )}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value._id
                            }
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => {
                              return (
                                <Index.MenuItem
                                  className="add-menu-coupon-item"
                                  key={option._id}
                                  value={formik.values.cinema}
                                  sx={{ justifyContent: "space-between" }}
                                  {...props}
                                >
                                  <Index.ListItemText>
                                    {option?.cinemaName}
                                  </Index.ListItemText>
                                </Index.MenuItem>
                              );
                            }}
                            renderInput={(params) => (
                              <Index.TextField
                                {...params}
                                placeholder={
                                  formik.values?.cinema?.length === 0
                                    ? "Select cinema"
                                    : ""
                                }
                              />
                            )}
                          />
                          <Index.FormHelperText error>
                            {formik.errors.cinema && formik.touched.cinema
                              ? formik.errors.cinema
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                  </>
                )}

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount Type
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        className="form-control"
                        value={formik.values.discountType}
                        onBlur={formik.handleBlur}
                        name="discountType"
                        onChange={(e) => {
                          formik.setFieldValue("discountType", e.target.value);
                          formik.setFieldValue("discount", "");
                          formik.setFieldValue("couponUpTo", "");
                        }}
                        displayEmpty
                        renderValue={
                          formik.values.discountType
                            ? undefined
                            : () => (
                                <span className="placeholder-text">
                                  Select Discount Type
                                </span>
                              )
                        }
                      >
                        <Index.MenuItem value="flat">Flat</Index.MenuItem>
                        <Index.MenuItem value="%">Percentage</Index.MenuItem>
                      </Index.Select>
                      <Index.FormHelperText error>
                        {formik.errors.discountType &&
                        formik.touched.discountType
                          ? formik.errors.discountType
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                {formik.values.discountType ? (
                  <>
                    <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Discount
                        </Index.FormHelperText>
                        <Index.Box className="form-group background-increase">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            name="discount"
                            className="form-control"
                            placeholder="Enter Discount"
                            value={formik.values.discount}
                            disabled={!formik.values.discountType}
                            inputProps={{ maxLength: 51 }}
                            onBlur={formik.handleBlur}
                            onChange={(event) => {
                              const inputValue = event.target.value;
                              const isPercentage =
                                formik.values.discountType === "%";
                              let newValue = inputValue.replace(/[^0-9]/g, "");

                              if (isPercentage) {
                                const decimalRegex = /^\d*$/;
                                const percentageRegex = /^(100|[1-9][0-9]?)?$/;

                                if (
                                  decimalRegex.test(inputValue) &&
                                  percentageRegex.test(inputValue)
                                ) {
                                  formik.setFieldValue("discount", newValue);
                                }
                              } else {
                                newValue = newValue
                                  .replace(/^\s+/, "")
                                  .replace(/^0+/, "");

                                if (newValue.length > 7) {
                                  newValue = newValue.slice(0, 7);
                                }

                                if (
                                  !newValue.startsWith("0") &&
                                  !/0000000/.test(newValue)
                                ) {
                                  formik.setFieldValue("discount", newValue);
                                }

                                if (formik.values.discountType == "flat") {
                                  formik.setFieldValue("couponUpTo", newValue);
                                }
                              }
                              formik.handleChange(event);
                            }}
                          />
                          <Index.FormHelperText error>
                            {formik.errors.discount && formik.touched.discount
                              ? formik.errors.discount
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Discount Upto
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            name="couponUpTo"
                            className="form-control"
                            placeholder="Enter Discount Upto"
                            value={formik.values.couponUpTo}
                            inputProps={{ maxLength: 51 }}
                            onChange={(e) => {
                              let newValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );

                              if (
                                newValue.startsWith("0") ||
                                /0000000/.test(newValue)
                              ) {
                                return;
                              }

                              if (newValue.length > 7) {
                                newValue = newValue.slice(0, 7);
                              }

                              formik.setFieldValue("couponUpTo", newValue);
                            }}
                            onBlur={formik.handleBlur}
                          />
                          <Index.FormHelperText error>
                            {formik.errors.couponUpTo &&
                            formik.touched.couponUpTo
                              ? formik.errors.couponUpTo
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                  </>
                ) : (
                  <></>
                )}
                {formik.values.couponType !== "Membership" && (
                <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Coupon code description
                    </Index.FormHelperText>
                    <Index.Box className="form-group d-flex-textarea">
                      <Index.TextareaAutosize
                        fullWidth
                        id="fullWidth"
                        className="form-control form-text-area"
                        minRows={3}
                        name="couponDescription"
                        placeholder="Enter Coupon code description"
                        value={formik.values.couponDescription}
                        maxLength={250}
                        onInput={(event) => {
                          const input = event.target;
                          let inputValue = input.value;

                          inputValue = inputValue.trimLeft();

                          inputValue = inputValue.replace(/\s{2,}/g, " ");

                          if (inputValue.length > 250) {
                            inputValue = inputValue.slice(0, 250);
                          }

                          input.value = inputValue;
                        }}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={
                          formik.errors.couponDescription &&
                          formik.touched.couponDescription
                            ? true
                            : false
                        }
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.couponDescription &&
                      formik.touched.couponDescription
                        ? formik.errors.couponDescription
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                )}
              </Index.Grid>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        {formik.values.couponCategory == "Public" ? (
          <Index.Box className="barge-common-box cms-box">
            <Index.Box className="title-header">
              <Index.Box
                className="res-title-header-flex add-coupon-flex"
                sx={{ marginBottom: "20px" }}
              >
                <Index.Box className="title-main">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Advance Settings
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="advance-setting-box-details">
              <Index.Box className="advance-setting-box">
                <>
                  <Index.Box className="advance-flex-checkbox">
                    <Index.Checkbox
                      checked={
                        formik.values.mergeWithAnotherCoupon === 1
                          ? true
                          : false
                      }
                      name="mergeWithAnotherCoupon"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "mergeWithAnotherCoupon",
                          e.target.checked == true ? 1 : 0
                        )
                      }
                    />
                    <Index.Typography className="title-checkbox-coupon">
                      Can Merge with Another Coupon
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="advance-flex-checkbox">
                    <Index.Checkbox
                      checked={
                        formik.values.autoApplyOnCheckOut === 1 ? true : false
                      }
                      name="autoApplyOnCheckOut"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "autoApplyOnCheckOut",
                          e.target.checked == true ? 1 : 0
                        )
                      }
                    />
                    <Index.Typography className="title-checkbox-coupon">
                      Auto Apply on Check Out Page
                    </Index.Typography>
                  </Index.Box>
                </>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        ) : (
          <></>
        )}

        <Index.Box
          className="barge-common-box cms-box"
          sx={{ marginTop: "15px" }}
        >
          {/* <Index.Box className="title-header">
            <Index.Box
              className="res-title-header-flex add-coupon-flex"
              sx={{ marginBottom: "20px" }}
            >
              <Index.Box className="title-main">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Assign the Coupon
                </Index.Typography>
              </Index.Box>
            </Index.Box>
          </Index.Box> */}

          {/* <Index.Box className="advance-setting-box-details add-coupon-details ">
            <Index.Grid container columnSpacing={2}>
              <Index.Grid item lg={4} md={4} sm={12} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Assign the Coupon
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.Autocomplete
                      className="cinema-auto-input"
                      multiple
                      options={userList}
                      value={userList.filter((user) =>
                        formik.values.assignUserId.includes(user._id)
                      )}
                      onBlur={() =>
                        formik.setFieldTouched("assignUserId", true)
                      }
                      getOptionLabel={(option) =>
                        option.firstName ||
                        option.email ||
                        option.mobileNumber.toString()
                      }
                      disableCloseOnSelect
                      onChange={(e, v) => {
                        const ids = v.map((user) => user._id);

                        formik.setFieldValue("assignUserId", ids);
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      renderOption={(props, option, { selected }) => (
                        <Index.MenuItem
                          key={`${option._id}-${option.mobileNumber}`}
                          value={formik.values.assignUserId}
                          sx={{ justifyContent: "space-between" }}
                          {...props}
                        >
                          <Index.ListItemText>
                            {option.firstName
                              ? option.firstName
                              : option.email
                              ? option.email
                              : option.mobileNumber}
                          </Index.ListItemText>
                        </Index.MenuItem>
                      )}
                      renderInput={(params) => (
                        <Index.TextField
                          {...params}
                          placeholder="Assign the coupon"
                        />
                      )}
                    />
                    <Index.FormHelperText error>
                      {formik.errors.assignUserId && formik.touched.assignUserId
                        ? formik.errors.assignUserId
                        : false}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
              <Index.Grid item lg={4} md={4} sm={12} xs={12}>
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Subscription
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.Autocomplete
                      className="cinema-auto-input"
                      options={subscriberList}
                      getOptionLabel={(option) => option.title}
                      disableClearable
                      onChange={(e, v) => {
                        if (v) {
                          formik.setFieldValue("subscriptionId", v._id);
                        } else {
                          formik.setFieldValue("subscriptionId", "");
                        }
                      }}
                      onBlur={() =>
                        formik.setFieldTouched("subscriptionId", true)
                      }
                      value={selectedOption || null}
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      renderOption={(props, option, { selected }) => (
                        <Index.MenuItem
                          key={`${option._id}-${option.title}`}
                          value={option._id}
                          sx={{ justifyContent: "space-between" }}
                          {...props}
                        >
                          <Index.ListItemText>
                            {option.title}
                          </Index.ListItemText>
                        </Index.MenuItem>
                      )}
                      renderInput={(params) => (
                        <Index.TextField
                          {...params}
                          placeholder="Select a subscription"
                        />
                      )}
                    />
                    <Index.FormHelperText error>
                      {formik.errors.subscriptionId &&
                      formik.touched.subscriptionId
                        ? formik.errors.subscriptionId
                        : false}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>

             
            </Index.Grid>
          </Index.Box> */}
          <Index.Box className="flex-advance-settings-btn">
            <Index.Box className="common-button blue-button res-blue-button">
              <Index.Button
                variant="contained"
                className="no-text-decoration"
                onClick={() => navigate(-1)}
              >
                Discard
              </Index.Button>
            </Index.Box>
            <Index.Box className="common-button blue-button res-blue-button">
              <Index.Button
                type="submit"
                variant="contained"
                disableRipple
                className="no-text-decoration"
                disabled={loading}
              >
                <img src={PagesIndex.Svg.save} className="user-save-icon"></img>
                {editData ? "Update" : "Save"}
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </form>
    </>
  );
};

export default AddCoupon;
