import React, { useRef, useState } from "react";
import Index from "../../../Index";
import { useLocation, useNavigate } from "react-router-dom";
import PagesIndex from "../../../PagesIndex";
import { useFormik } from "formik";
import { subscriptionSchema } from "../../../../validation/FormikValidation";
import "./SubScription.css";

const membershipDurationList = [
  { id: 1, title: "1 Month", value: 30 },
  { id: 2, title: "3 Month", value: 90 },
  { id: 3, title: "1 Year", value: 365 },
];

const AddSubScription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submitAction = useRef("draft");
  const editId = location?.state?.row;
  const [disable, setDisable] = useState(false);
  const [valuesToPublish, setValuesForPublish] = useState();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const initialValues = {
    price: editId?.price ? editId?.price : "",
    discountOfFAndB: editId?.discountOfFAndB ? editId?.discountOfFAndB : "",
    discountOnTicket: editId?.discountOnTicket ? editId?.discountOnTicket : "",
    discountOnEcommerce: editId?.discountOnEcommerce
      ? editId?.discountOnEcommerce
      : "",
    freeTicket: editId?.freeTicket ? editId?.freeTicket : "",
    isPublished: editId?.isPublished ? editId?.isPublished : false,
    // monthlyAccess: editId?.monthlyAccess ? editId?.monthlyAccess : "",
    monthlyAccess: "1",
    discountOfFAndBUpTo: editId?.discountOfFAndBUpTo
      ? editId?.discountOfFAndBUpTo
      : "",
    discountOnTicketUpTo: editId?.discountOnTicketUpTo
      ? editId?.discountOnTicketUpTo
      : "",
    discountOnEcommerceUpTo: editId?.discountOnEcommerceUpTo
      ? editId?.discountOnEcommerceUpTo
      : "",

    // priorityBooking: editId?.priorityBooking ? editId?.priorityBooking : "",
    // accessToExclusiveScreening: editId?.accessToExclusiveScreening
    //   ? editId?.accessToExclusiveScreening
    //   : "",
    // guestPasses: editId?.guestPasses ? editId?.guestPasses : "",
    // specialEventAccess: editId?.specialEventAccess
    //   ? editId?.specialEventAccess
    //   : "",
    // earlyAccessToTickets: editId?.earlyAccessToTickets
    //   ? editId?.earlyAccessToTickets
    //   : "",
    // support: editId?.support ? editId?.support : "",
    coins: editId?.coins ? editId?.coins : "",
    welcomeGift: editId?.welcomeGift ? editId?.welcomeGift : "",
    membershipDuration: editId?.membershipDuration
      ? editId?.membershipDuration
      : "",
    // title: editId?.title
    //   ? editId?.title.charAt(0).toUpperCase() +
    //     editId?.title.slice(1).toLowerCase()
    //   : "",
    title: editId?.title ? editId?.title : "",
    isDiscounted: editId?.isDiscounted ? editId?.isDiscounted : false,
    discountedPrice: editId?.discountedPrice ? editId?.discountedPrice : 0,
  };

  const handlePublish = (values) => {
    values = values;
    if (editId?._id) {
      values.id = editId?._id;
    }
    values.isPublished = false;
    // values.isActive = true;
    values.status = "Requested";
    setDisable(true);
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_SUSCRIPTION, values)
      .then(async (res) => {
        await PagesIndex.DataService.post(
          PagesIndex.Api.ADD_SUBSCRIPTION_REQUEST,
          {
            id: res?.data?.data?._id,
            ...values,
            // wantToPublish:true
            // updatedBy: adminLoginData?._id,
            // updatedOn: Date.now(),
            // status: "Approved",
          }
        );
        PagesIndex.toast.success(res?.data?.message);
        navigate("/admin/subscription");
        setDisable(false);
      })
      .catch((err) => {
        console.log(err);
        setDisable(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const handleSubmit = (values) => {
    if (editId?._id) {
      values.id = editId?._id;
    } else {
      values.status = "Draft";
    }
    setDisable(true);
    let apiEndpoint = PagesIndex.Api.ADD_EDIT_SUSCRIPTION;
    if (editId?._id && editId?.isPublished === true) {
      apiEndpoint = PagesIndex.Api.ADD_SUBSCRIPTION_REQUEST;
    }
    // PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_SUSCRIPTION, values)
    PagesIndex.DataService.post(apiEndpoint, values)
      .then((res) => {
        if (values.status === "Draft") {
          PagesIndex.toast.success("Subscription saved in draft");
        } else {
          PagesIndex.toast.success(res?.data?.message);
        }
        // if (editId?._id) {
        //   navigate("/admin/subscription-requests");
        // } else {
        navigate("/admin/subscription");
        // }
        setDisable(false);
      })
      .catch((err) => {
        console.log(err);
        setDisable(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: subscriptionSchema,
    // onSubmit: handleSubmit,
    onSubmit: (values) => {
      if (submitAction.current === "publish") {
        handlePublish(values);
      } else {
        handleSubmit(values);
      }
    },
  });

  return (
    <>
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
                {editId?._id ? "Edit Subscription" : "Add Subscription"}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <form onSubmit={formik.handleSubmit}>
          <Index.Box className="add-coupon-details">
            <Index.Box className="blog-add-box">
              <Index.Grid container spacing={1}>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Title
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="title"
                        className="form-control"
                        placeholder="Enter subscription title"
                        autoComplete="off"
                        disabled={formik?.values?.isPublished}
                        value={formik.values.title}
                        onChange={(e) => {
                          // Get the new value from the event
                          let newValue = e.target.value;

                          // Remove non-alphabetic characters except spaces
                          newValue = newValue.replace(/[^a-zA-Z\s]/g, "");

                          // Replace multiple spaces with a single space
                          newValue = newValue.replace(/\s\s+/g, " ");

                          // Remove leading spaces
                          newValue = newValue.trimStart();

                          // Limit the length to 25 characters
                          newValue = newValue.slice(0, 25);

                          // Set the new value to formik
                          formik.setFieldValue("title", newValue);
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.title && formik.touched.title
                        ? formik.errors.title
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Price
                    </Index.FormHelperText>

                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="price"
                        name="price"
                        className="form-control"
                        autoComplete="off"
                        placeholder="Enter subscription price"
                        value={formik.values.price}
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

                          formik.setFieldValue("price", newValue);

                          if (newValue.length === 7) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.price && formik.touched.price
                        ? formik.errors.price
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.Box className="subscription-price">
                      <Index.FormHelperText className="form-lable">
                        Discounted Price
                      </Index.FormHelperText>
                      <Index.FormHelperText className="form-lable">
                        <Index.Checkbox
                          name="isDiscounted"
                          checked={formik?.values?.isDiscounted}
                          onChange={(event) => {
                            const newValue = event.target.checked;
                            formik.setFieldValue("isDiscounted", newValue);
                          }}
                        />
                      </Index.FormHelperText>
                    </Index.Box>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountedPrice"
                        name="discountedPrice"
                        className="form-control"
                        autoComplete="off"
                        disabled={!formik?.values?.isDiscounted}
                        placeholder="Enter subscription discounted price"
                        value={formik?.values?.discountedPrice}
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

                          formik.setFieldValue("discountedPrice", newValue);

                          if (newValue.length === 7) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountedPrice &&
                      formik.touched.discountedPrice
                        ? formik.errors.discountedPrice
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount of F & B (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOfFAndB"
                        className="form-control"
                        placeholder="Enter discount of F & B"
                        name="discountOfFAndB"
                        disabled={formik?.values?.isPublished}
                        autoComplete="off"
                        value={formik.values.discountOfFAndB}
                        inputProps={{ maxLength: 3 }}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOfFAndB", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue("discountOfFAndB", newValue);
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOfFAndB &&
                      formik.touched.discountOfFAndB
                        ? formik.errors.discountOfFAndB
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount on Tickets (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOnTicket"
                        name="discountOnTicket"
                        className="form-control"
                        placeholder="Enter discount on tickets"
                        autoComplete="off"
                        disabled={formik?.values?.isPublished}
                        value={formik.values.discountOnTicket}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOnTicket", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue("discountOnTicket", newValue);
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOnTicket &&
                      formik.touched.discountOnTicket
                        ? formik.errors.discountOnTicket
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount on Ecommerce (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOnEcommerce"
                        disabled={formik?.values?.isPublished}
                        name="discountOnEcommerce"
                        className="form-control"
                        placeholder="Enter discount on tickets"
                        autoComplete="off"
                        value={formik.values.discountOnEcommerce}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOnEcommerce", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue(
                              "discountOnEcommerce",
                              newValue
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOnEcommerce &&
                      formik.touched.discountOnEcommerce
                        ? formik.errors.discountOnEcommerce
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Free Tickets (Month)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="freeTicket"
                        name="freeTicket"
                        className="form-control"
                        placeholder="Enter free tickets"
                        value={formik.values.freeTicket}
                        autoComplete="off"
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("freeTicket", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 999) {
                            formik.setFieldValue("freeTicket", newValue);
                          }
                        }}
                        // onChange={(e) => {
                        //   // Extract and clean the input value
                        //   let newValue = e.target.value
                        //     .replace(/[^0-9]/g, "") // Remove non-numeric characters
                        //     .replace(/^0+(?!$)/, "") // Remove leading zeros, but keep a single zero
                        //     .slice(0, 3); // Limit to 3 characters for values up to 999

                        //   // Convert to number for validation
                        //   const numericValue = Number(newValue);

                        //   if (
                        //     newValue === "" ||
                        //     (numericValue <= 999 &&
                        //       Number.isInteger(numericValue))
                        //   ) {
                        //     formik.setFieldValue("freeTicket", newValue);
                        //   }
                        // }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.freeTicket && formik.touched.freeTicket
                        ? formik.errors.freeTicket
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid> */}

                {/* <Index.Grid item lg={4} md={4} sm={12} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Priority Booking
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="priorityBooking"
                        className="form-control"
                        displayEmpty
                        renderValue={
                          formik.values.priorityBooking
                            ? undefined
                            : () =>
                              <span className="placeholder-text">
                                Select priority booking
                              </span>
                        }
                        value={formik.values.priorityBooking}
                        onChange={formik.handleChange}
                      >
                        <Index.MenuItem value={"Yes"}>Yes</Index.MenuItem>
                        <Index.MenuItem value={"No"}>No</Index.MenuItem>
                      </Index.Select>
                      <Index.FormHelperText error>
                        {formik.errors.priorityBooking &&
                        formik.touched.priorityBooking
                          ? formik.errors.priorityBooking
                          : null}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Access to Exclusive Screenings
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="accessToExclusiveScreening"
                        className="form-control"
                        displayEmpty
                        renderValue={
                          formik.values.accessToExclusiveScreening
                            ? undefined
                            : () =>
                              <span className="placeholder-text">
                            Select access to exclusive screenings
                            </span>
                        }
                        value={formik.values?.accessToExclusiveScreening}
                        onChange={formik.handleChange}
                      >
                        <Index.MenuItem value={"Yes"}>Yes</Index.MenuItem>
                        <Index.MenuItem value={"No"}>No</Index.MenuItem>
                      </Index.Select>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.accessToExclusiveScreening &&
                      formik.touched.accessToExclusiveScreening
                        ? formik.errors.accessToExclusiveScreening
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Guest Passes (per Quarter)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="price"
                        name="guestPasses"
                        className="form-control"
                        placeholder="Enter guest passes"
                        value={formik.values.guestPasses}
                        onChange={(e) => {
                          const newValue = e.target.value
                            .replace(/^\s+/, "")
                            .replace(/\s\s+/g, " ");
                          if (newValue.length <= 60) {
                            formik.setFieldValue("guestPasses", newValue);
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.guestPasses && formik.touched.guestPasses
                        ? formik.errors.guestPasses
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Special Event Access
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="specialEventAccess"
                        className="form-control"
                        displayEmpty
                        renderValue={
                          formik.values.specialEventAccess
                            ? undefined
                            : () => 
                              <span className="placeholder-text">
                                Select special event access
                                </span>
                        }
                        value={formik.values?.specialEventAccess}
                        onChange={formik.handleChange}
                      >
                        <Index.MenuItem value={"Yes"}>Yes</Index.MenuItem>
                        <Index.MenuItem value={"No"}>No</Index.MenuItem>
                      </Index.Select>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.specialEventAccess &&
                      formik.touched.specialEventAccess
                        ? formik.errors.specialEventAccess
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Early Access to Tickets
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="earlyAccessToTickets"
                        className="form-control"
                        displayEmpty
                        renderValue={
                          formik.values.earlyAccessToTickets
                            ? undefined
                            : () =>(
                              <span className="placeholder-text">
                                Select early access to tickets
                              </span>
                            )
                            
                        }
                        value={formik.values?.earlyAccessToTickets}
                        onChange={formik.handleChange}
                      >
                        <Index.MenuItem value={"Yes"}>Yes</Index.MenuItem>
                        <Index.MenuItem value={"No"}>No</Index.MenuItem>
                      </Index.Select>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.earlyAccessToTickets &&
                      formik.touched.earlyAccessToTickets
                        ? formik.errors.earlyAccessToTickets
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Support
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="support"
                        name="support"
                        className="form-control"
                        placeholder="Enter support"
                        value={formik.values.support}
                        onChange={(e) => {
                          const newValue = e.target.value
                            .replace(/^\s+/, "")
                            .replace(/\s\s+/g, " ");
                          if (newValue.length <= 60) {
                            formik.setFieldValue("support", newValue);
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.support && formik.touched.support
                        ? formik.errors.support
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid> */}
                {/* <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Monthly Access
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="coins" // Keep id as "coins" if that's intentional
                        name="monthlyAccess"
                        className="form-control"
                        placeholder="Enter monthly access"
                        disabled
                        value={1}
                        onChange={(e) => {
                          const newValue = e.target.value
                            .replace(/^\s+/, "") // Remove leading spaces
                            .replace(/\s\s+/g, " "); // Replace multiple spaces with single space

                          // Parse the new value to an integer
                          const numericValue = parseInt(newValue, 10);

                          // Check if the numeric value is within the range of 1 to 12
                          if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 12) {
                            formik.setFieldValue("monthlyAccess", newValue);
                          } else if (newValue === "") {
                            // Clear the value if the input is empty
                            formik.setFieldValue("monthlyAccess", "");
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.monthlyAccess &&
                      formik.touched.monthlyAccess
                        ? formik.errors.monthlyAccess
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid> */}

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount of F & B Upto (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOfFAndBUpTo"
                        className="form-control"
                        placeholder="Enter discount of F & B up to"
                        name="discountOfFAndBUpTo"
                        disabled={formik?.values?.isPublished}
                        autoComplete="off"
                        value={formik.values.discountOfFAndBUpTo}
                        inputProps={{ maxLength: 3 }}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOfFAndBUpTo", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue(
                              "discountOfFAndBUpTo",
                              newValue
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOfFAndB &&
                      formik.touched.discountOfFAndB
                        ? formik.errors.discountOfFAndB
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount on Tickets Upto (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOnTicketUpTo"
                        className="form-control"
                        placeholder="Enter discount of tickets up to"
                        name="discountOnTicketUpTo"
                        disabled={formik?.values?.isPublished}
                        autoComplete="off"
                        value={formik.values.discountOnTicketUpTo}
                        inputProps={{ maxLength: 3 }}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOnTicketUpTo", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue(
                              "discountOnTicketUpTo",
                              newValue
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOfFAndB &&
                      formik.touched.discountOfFAndB
                        ? formik.errors.discountOfFAndB
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Discount on Ecommerce Upto (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="discountOnEcommerceUpTo"
                        className="form-control"
                        placeholder="Enter discount of e commerce up to"
                        name="discountOnEcommerceUpTo"
                        disabled={formik?.values?.isPublished}
                        autoComplete="off"
                        value={formik.values.discountOnEcommerceUpTo}
                        inputProps={{ maxLength: 3 }}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("discountOnEcommerceUpTo", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue(
                              "discountOnEcommerceUpTo",
                              newValue
                            );
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.discountOfFAndB &&
                      formik.touched.discountOfFAndB
                        ? formik.errors.discountOfFAndB
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Coins (%)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="coins"
                        name="coins"
                        className="form-control"
                        placeholder="Enter coins"
                        autoComplete="off"
                        disabled={formik?.values?.isPublished}
                        value={formik.values.coins}
                        onChange={(e) => {
                          let newValue = e.target.value
                            .replace(/[^0-9]/g, "") // Allow only numeric characters
                            .replace(/^0+/, "") // Remove leading zeros
                            .slice(0, 3); // Limit the length to 3 characters

                          if (newValue === "") {
                            formik.setFieldValue("coins", "");
                            return;
                          }

                          // Convert to number to check value range
                          const numericValue = Number(newValue);
                          if (numericValue <= 100) {
                            formik.setFieldValue("coins", newValue);
                          }
                        }}
                        onBlur={formik.handleBlur}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.coins && formik.touched.coins
                        ? formik.errors.coins
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Welcome Gift
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="welcomeGift"
                        className="form-control"
                        displayEmpty
                        disabled={formik?.values?.isPublished}
                        renderValue={
                          formik.values.welcomeGift
                            ? undefined
                            : () => (
                                <span className="placeholder-text">
                                  Select welcome gift
                                </span>
                              )
                        }
                        value={formik.values?.welcomeGift}
                        onChange={formik.handleChange}
                      >
                        <Index.MenuItem value={"Yes"}>Yes</Index.MenuItem>
                        <Index.MenuItem value={"No"}>No</Index.MenuItem>
                      </Index.Select>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.welcomeGift && formik.touched.welcomeGift
                        ? formik.errors.welcomeGift
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>

                <Index.Grid item lg={4} md={4} sm={6} xs={12}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Membership Duration
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="membershipDuration"
                        className="form-control"
                        displayEmpty
                        disabled={formik?.values?.isPublished}
                        renderValue={
                          formik.values.membershipDuration
                            ? undefined
                            : () => (
                                <span className="placeholder-text">
                                  Select membership duration
                                </span>
                              )
                        }
                        value={formik.values?.membershipDuration}
                        onChange={formik.handleChange}
                      >
                        {membershipDurationList?.map((item) => {
                          return (
                            <Index.MenuItem value={item?.value} key={item?.id}>
                              {item?.title}
                            </Index.MenuItem>
                          );
                        })}
                      </Index.Select>
                    </Index.Box>
                    <Index.FormHelperText error>
                      {formik.errors.membershipDuration &&
                      formik.touched.membershipDuration
                        ? formik.errors.membershipDuration
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                </Index.Grid>
              </Index.Grid>
            </Index.Box>
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
                  disabled={disable}
                  onClick={() => {
                    submitAction.current = "draft";
                  }}
                >
                  <img
                    src={PagesIndex.Svg.save}
                    className="user-save-icon"
                  ></img>
                  {editId ? "Update" : "Save As Draft"}
                </Index.Button>
              </Index.Box>
              {adminLoginData?.roleId?.permissions?.includes(
                "subscription_add"
              ) && (
                <Index.Box className="common-button blue-button res-blue-button">
                  <Index.Button
                    // onClick={() => {
                    //   handlePublish(formik);
                    // }}
                    type="submit"
                    variant="contained"
                    disableRipple
                    onClick={() => {
                      submitAction.current = "publish";
                    }}
                    className="no-text-decoration"
                    disabled={formik.values.isPublished || disable}
                  >
                    {/* <img
                    src={PagesIndex.Svg.save}
                    className="user-save-icon"
                  ></img> */}
                    {/* {editId ? "Update" : "Save"} */}
                    {formik.values.isPublished ? "Published" : "Publish"}
                  </Index.Button>
                </Index.Box>
              )}
            </Index.Box>
          </Index.Box>
        </form>
      </Index.Box>
    </>
  );
};

export default AddSubScription;
