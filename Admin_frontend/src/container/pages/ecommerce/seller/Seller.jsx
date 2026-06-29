import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import {
  Search,
  StyledInputBase,
  style,
} from "../../../../common/Search/Search";

const Seller = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [filteredData, setFilteredData] = useState([]);
  const [sellerList, setSellerList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  // const [timeData, setTimeData] = useState({});

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  let initialValues = {
    businessName: "",
    businessEmail: "",
    businessPhoneNumber: "",
    addressName: "",
    state: "",
    city: "",
    zipcode: "",
    pocName: "",
    pocPhoneNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    gstNumber: "",
    password: "",
    isEdit: false,
    selectedValues,
  };
  // handle open close
  const handleOpen = (mode) => {
    setAddOpen(true);
    setAddOrEdit(mode);
  };

  const handleClose = () => {
    setId("");
    setAddOpen(false);
    formik.current?.resetForm();
  };

  // handle delete
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleStatus = (event, id) => {
    const data = {
      id: id,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ACTIVE_DEACTIVE_SELLER,
      data
    )
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getSellerList();
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setLoadingState((prevState) => ({ ...prevState, [id]: false }));
      });
  };
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = sellerList?.filter(
      (data) =>
        // data?.title?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.businessName?.toLowerCase().includes(searched) ||
        data?.businessEmail?.toLowerCase().includes(searched) ||
        data?.businessPhoneNumber?.toLowerCase().includes(searched) ||
        (data?.isActive ? "Active" : "DeActive")
          ?.toLowerCase()
          .includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getSellerList = () => {
    PagesIndex.EcommerceService.post(PagesIndex.EcommerceApi.GET_ALL_SELLER)
      .then((res) => {
        console.log(res?.data?.data?.seller, "res?.data?.data?.seller");
        setSellerList(res?.data?.data?.seller);
        setFilteredData(res?.data?.data?.seller);
        setLoading(false);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.seller.filter(
            (title) =>
              title?.businessName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              title?.businessEmail
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          console.log("inside else");
          setFilteredData(res?.data?.data?.seller);
          setSearchValue("");
          setRemoveData(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleSellerSubmit = async (values) => {
    setButtonLoading(true);
    let data = { ...values };
    // console.log(values, 155);
    // const payload = {
    //   name: values?.businessName,
    //   email: values?.businessEmail,
    //   phone: values?.businessPhoneNumber,
    //   address: values?.addressName,
    //   city: values?.city,
    //   country: "India",
    //   pin: values?.zipcode,
    //   return_address: values?.addressName,
    //   return_pin: values?.zipcode,
    //   return_city: values?.city,
    //   return_state: values?.state,
    //   return_country: "India",
    // };
    console.log("values", values);
    const payload = new URLSearchParams();
    payload.append("businessName", values?.businessName);
    if (values?.isEdit == false) {
      payload.append("businessEmail", values?.businessEmail);
    }

    payload.append("businessPhoneNumber", values?.businessPhoneNumber);
    payload.append("addressName", values?.addressName);
    payload.append("state", values?.state);
    payload.append("city", values?.city);
    payload.append("zipcode", values?.zipcode);
    payload.append("pocName", values?.pocName);
    payload.append("pocPhoneNumber", values?.pocPhoneNumber);
    payload.append("bankName", values?.bankName);
    payload.append("accountNumber", values?.accountNumber);
    payload.append("ifscCode", values?.ifscCode);
    payload.append("gstNumber", values?.gstNumber);
    payload.append("password", values?.password);
    payload.append("isEdit", values?.isEdit);
    if (values?.isEdit) {
      payload.append("id", values?._id);

      const businessHours = {};

      values.selectedValues.forEach((day) => {
        // const startKey = `${day}-startTime`;
        // const endKey = `${day}-endTime`;

        // if (values[startKey] && values[endKey]) {
        businessHours[day.substring(0, 3).toUpperCase()] = {
          start_time: "10:30",
          close_time: "19:00",
        };
        // };
      });
      console.log("business_hours", businessHours);
      payload.append("business_hours", JSON.stringify(businessHours));

      payload.append(
        "business_days",
        JSON.stringify(
          values.selectedValues.map((day) => day.substring(0, 3).toUpperCase())
        )
      );
    }
    payload.append("name", values?.businessName);
    payload.append("email", values?.businessEmail);
    payload.append("phone", values?.businessPhoneNumber);
    payload.append("address", values?.addressName);
    // payload.append("city", values?.city);

    payload.append("country", "India");
    payload.append("pin", values?.zipcode);
    payload.append("return_address", values?.addressName);
    payload.append("return_pin", values?.zipcode);
    payload.append("return_city", values?.city);
    payload.append("return_state", values?.state);
    payload.append("return_country", "India");

    // if (values?.isEdit == true) {
    //   delete data.businessEmail;
    // }
    // data.id = id;
    payload.append("id", id);

    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ADD_EDIT_SELLER,
      payload
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getSellerList();
      })
      .catch((err) => {
        if (err?.response?.data?.message[0].length) {
          PagesIndex.toast.error("invalid pincode");
        }
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => setButtonLoading(false));
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  useEffect(() => {
    getSellerList();
  }, [removeData]);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("ecommerce") ||
    true
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSellerSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.sellerValidationSchema}
        innerRef={formik}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <>
            {console.log("eeeeee", errors)}
            <Index.Box className="">
              <Index.Box className="barge-common-box">
                <Index.Box className="title-header">
                  <Index.Box className="title-header-flex res-title-header-flex">
                    <Index.Box className="title-main common-export-flex">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="page-title"
                      >
                        Seller Management
                      </Index.Typography>
                    </Index.Box>
                    <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                      <Search className="search ">
                        <StyledInputBase
                          placeholder="Search"
                          inputProps={{ "aria-label": "search" }}
                          value={searchValue}
                          onChange={handleInputChange}
                        />
                      </Search>

                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Seller
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>

                <Index.Box className="page-table-main banner-table-main">
                  <Index.TableContainer
                    component={Index.Paper}
                    className="table-container"
                  >
                    <Index.Table
                      aria-label="simple table"
                      className="table-design-main"
                    >
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="5%">
                            Business Name
                          </Index.TableCell>
                          <Index.TableCell width="10%">
                            Business Email
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Phone number
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Address
                          </Index.TableCell>

                          <Index.TableCell align="center" width="5%">
                            POC Name
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            POC Phone Number
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Bank Name
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Account Number
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            IFSC Code
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Status
                          </Index.TableCell>

                          <Index.TableCell align="right" width="5%">
                            Action
                          </Index.TableCell>
                        </Index.TableRow>
                      </Index.TableHead>
                      {loading ? (
                        <Index.TableBody>
                          <Index.TableRow>
                            <Index.TableCell
                              component="td"
                              variant="td"
                              scope="row"
                              className="no-data-in-list"
                              colSpan={15}
                              align="center"
                            >
                              <Index.Loader />
                            </Index.TableCell>
                          </Index.TableRow>
                        </Index.TableBody>
                      ) : (
                        <Index.TableBody>
                          {filteredData?.length ? (
                            filteredData
                              ?.slice(
                                currentPage * rowsPerPage,
                                currentPage * rowsPerPage + rowsPerPage
                              )
                              ?.map((item, index) => (
                                <Index.TableRow key={item?._id}>
                                  <Index.TableCell>
                                    {item?.businessName
                                      ? item?.businessName
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.businessEmail
                                      ? item?.businessEmail
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.businessPhoneNumber
                                      ? item?.businessPhoneNumber
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.businessAddress
                                      ? Object.values(
                                          item?.businessAddress
                                        )?.join(", ")
                                      : "-"}
                                  </Index.TableCell>

                                  <Index.TableCell>
                                    {item?.pocDetails?.pocName
                                      ? item?.pocDetails?.pocName
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.pocDetails?.pocPhoneNumber
                                      ? item?.pocDetails?.pocPhoneNumber
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.bankDetails?.bankName
                                      ? item?.bankDetails?.bankName
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.bankDetails?.accountNumber
                                      ? item?.bankDetails?.accountNumber
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.bankDetails?.ifscCode
                                      ? item?.bankDetails?.ifscCode
                                      : "-"}
                                  </Index.TableCell>

                                  <Index.TableCell align="center">
                                    <CustomToggleButton
                                      defaultChecked={item?.isActive}
                                      onChange={(e) =>
                                        handleStatus(e, item?._id)
                                      }
                                      disabled={
                                        loadingState[item?._id] || false
                                      }
                                    />
                                  </Index.TableCell>

                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details">
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={(e) => {
                                            for (let key in item) {
                                              if (key === "business_days") {
                                                const dayMapping = {
                                                  MON: "Monday",
                                                  TUE: "Tuesday",
                                                  WED: "Wednesday",
                                                  THU: "Thursday",
                                                  FRI: "Friday",
                                                  SAT: "Saturday",
                                                  SUN: "Sunday",
                                                };
                                                const selectedValues =
                                                  item.business_days.map(
                                                    (day) =>
                                                      dayMapping[day] || day
                                                  );
                                                setFieldValue(
                                                  "selectedValues",
                                                  selectedValues
                                                );
                                              }
                                              // if (key === "business_hours") {
                                              //   const dayMapping = {
                                              //     MON: "Monday",
                                              //     TUE: "Tuesday",
                                              //     WED: "Wednesday",
                                              //     THU: "Thursday",
                                              //     FRI: "Friday",
                                              //     SAT: "Saturday",
                                              //     SUN: "Sunday",
                                              //   };
                                              //   Object.keys(
                                              //     item.business_hours
                                              //   ).forEach((shortDay) => {
                                              //     const fullDay =
                                              //       dayMapping[shortDay] ||
                                              //       shortDay;
                                              //     setFieldValue(
                                              //       `${fullDay}-startTime`,
                                              //       item.business_hours[
                                              //         shortDay
                                              //       ].start_time
                                              //     );
                                              //     setFieldValue(
                                              //       `${fullDay}-endTime`,
                                              //       item.business_hours[
                                              //         shortDay
                                              //       ].close_time
                                              //     );
                                              //   });
                                              // }
                                              if (key === "businessAddress") {
                                                let address = item[key];
                                                for (let addressKey in address) {
                                                  setFieldValue(
                                                    addressKey,
                                                    address[addressKey]
                                                  );
                                                }
                                              } else if (key === "pocDetails") {
                                                let poc = item[key];
                                                for (let pocKey in poc) {
                                                  setFieldValue(
                                                    pocKey,
                                                    poc[pocKey]
                                                  );
                                                }
                                              } else if (
                                                key === "bankDetails"
                                              ) {
                                                let bank = item[key];
                                                for (let bankKey in bank) {
                                                  setFieldValue(
                                                    bankKey,
                                                    bank[bankKey]
                                                  );
                                                }
                                              } else {
                                                setFieldValue(key, item[key]);
                                              }
                                            }
                                            setFieldValue("isEdit", true);
                                            setId(item?._id);
                                            handleOpen("Edit");
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      </Index.Box>
                                      {/* <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
                                      </Index.Box> */}
                                    </Index.Box>
                                  </Index.TableCell>
                                </Index.TableRow>
                              ))
                          ) : (
                            <Index.TableRow>
                              <Index.TableCell
                                component="td"
                                variant="td"
                                scope="row"
                                className="no-data-in-list"
                                colSpan={15}
                                align="center"
                              >
                                No Seller Available
                              </Index.TableCell>
                            </Index.TableRow>
                          )}
                        </Index.TableBody>
                      )}
                    </Index.Table>
                  </Index.TableContainer>
                </Index.Box>

                {filteredData?.length && !loading ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.length}
                          page={currentPage}
                          onPageChange={handleChangePage}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      </Index.Box>
                    </Index.Stack>
                  </Index.Box>
                ) : (
                  <></>
                )}
              </Index.Box>
            </Index.Box>

            {/* add and edit model */}
            <Index.Modal
              open={addOpen}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="modal"
            >
              <Index.Box
                sx={style}
                className="modal-inner-main add-region-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} Seller
                  </Index.Typography>
                  <img
                    src={PagesIndex.Svg.cancel}
                    className="modal-close-icon"
                    onClick={handleClose}
                  />
                </Index.Box>

                <Index.Box className="modal-body">
                  <Index.Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Business Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="businessName"
                          className="form-control"
                          placeholder="Enter business name"
                          value={values?.businessName}
                          onChange={handleChange}
                          error={
                            errors.businessName && touched.businessName
                              ? true
                              : false
                          }
                          helperText={
                            errors.businessName && touched.businessName
                              ? errors.businessName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Business Email
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="businessEmail"
                          className="form-control"
                          placeholder="Enter business Email"
                          value={values?.businessEmail}
                          onChange={handleChange}
                          error={
                            errors.businessEmail && touched.businessEmail
                              ? true
                              : false
                          }
                          helperText={
                            errors.businessEmail && touched.businessEmail
                              ? errors.businessEmail
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Business Phone Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="businessPhoneNumber"
                          className="form-control"
                          placeholder="Enter phone number"
                          value={values?.businessPhoneNumber}
                          onChange={handleChange}
                          error={
                            errors.businessPhoneNumber &&
                            touched.businessPhoneNumber
                              ? true
                              : false
                          }
                          helperText={
                            errors.businessPhoneNumber &&
                            touched.businessPhoneNumber
                              ? errors.businessPhoneNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Business Address
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="addressName"
                          className="form-control"
                          placeholder="Enter phone number"
                          value={values?.addressName}
                          onChange={handleChange}
                          error={
                            errors.addressName && touched.addressName
                              ? true
                              : false
                          }
                          helperText={
                            errors.addressName && touched.addressName
                              ? errors.addressName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        State
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="state"
                          className="form-control"
                          placeholder="Enter state"
                          value={values?.state}
                          // onChange={handleChange}
                          onChange={(e) => {
                            let input = e.target.value;
                            input = input.replace(/[^a-zA-Z\s]/g, "");
                            if (input.startsWith(" ")) {
                              input = input.trimStart();
                            }

                            setFieldValue("state", input);
                          }}
                          error={errors.state && touched.state ? true : false}
                          helperText={
                            errors.state && touched.state ? errors.state : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        City
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="city"
                          className="form-control"
                          placeholder="Enter city"
                          value={values?.city}
                          // onChange={handleChange}
                          onChange={(e) => {
                            let input = e.target.value;
                            input = input.replace(/[^a-zA-Z\s]/g, "");
                            if (input.startsWith(" ")) {
                              input = input.trimStart();
                            }
                            setFieldValue("city", input);
                          }}
                          error={errors.city && touched.city ? true : false}
                          helperText={
                            errors.city && touched.city ? errors.city : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Zip Code
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="zipcode"
                          className="form-control"
                          placeholder="Enter zipcode"
                          value={values?.zipcode}
                          // onChange={handleChange}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 6 && /^\d*$/.test(val)) {
                              handleChange(e);
                            }
                          }}
                          error={
                            errors.zipcode && touched.zipcode ? true : false
                          }
                          helperText={
                            errors.zipcode && touched.zipcode
                              ? errors.zipcode
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Poc Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="pocName"
                          className="form-control"
                          placeholder="Enter Poc Name"
                          value={values?.pocName}
                          onChange={handleChange}
                          error={
                            errors.pocName && touched.pocName ? true : false
                          }
                          helperText={
                            errors.pocName && touched.pocName
                              ? errors.pocName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Poc Phone Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="pocPhoneNumber"
                          className="form-control"
                          placeholder="Enter Poc Phone Number"
                          value={values?.pocPhoneNumber}
                          onChange={handleChange}
                          error={
                            errors.pocPhoneNumber && touched.pocPhoneNumber
                              ? true
                              : false
                          }
                          helperText={
                            errors.pocPhoneNumber && touched.pocPhoneNumber
                              ? errors.pocPhoneNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Bank Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="bankName"
                          className="form-control"
                          placeholder="Enter bank name"
                          value={values?.bankName}
                          onChange={handleChange}
                          error={
                            errors.bankName && touched.bankName ? true : false
                          }
                          helperText={
                            errors.bankName && touched.bankName
                              ? errors.bankName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Account Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="accountNumber"
                          className="form-control"
                          placeholder="Enter Account Number"
                          value={values?.accountNumber}
                          // onChange={handleChange}
                          onChange={(e) => {
                            const input = e.target.value;
                            const onlyDigits = input
                              .replace(/[^0-9]/g, "")
                              .slice(0, 18); // allows max 18 digits
                            setFieldValue("accountNumber", onlyDigits);
                          }}
                          error={
                            errors.accountNumber && touched.accountNumber
                              ? true
                              : false
                          }
                          helperText={
                            errors.accountNumber && touched.accountNumber
                              ? errors.accountNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        IFSC Code
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="ifscCode"
                          className="form-control"
                          placeholder="Enter IFSC Code"
                          value={values?.ifscCode}
                          // onChange={handleChange}
                          onChange={(e) => {
                            const value = e?.target?.value?.toLocaleUpperCase();
                            setFieldValue("ifscCode", value);
                          }}
                          inputProps={{
                            maxLength: 11,
                          }}
                          error={
                            errors.ifscCode && touched.ifscCode ? true : false
                          }
                          helperText={
                            errors.ifscCode && touched.ifscCode
                              ? errors.ifscCode
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        GST Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="gstNumber"
                          className="form-control"
                          placeholder="Enter GST Number"
                          value={values?.gstNumber}
                          onChange={(e) => {
                            const value = e?.target?.value?.toLocaleUpperCase();
                            setFieldValue("gstNumber", value);
                          }}
                          inputProps={{
                            maxLength: 15,
                          }}
                          error={
                            errors.gstNumber && touched.gstNumber ? true : false
                          }
                          helperText={
                            errors.gstNumber && touched.gstNumber
                              ? errors.gstNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    {!values?.isEdit && (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Password
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={values?.password}
                            onChange={handleChange}
                            error={
                              errors.password && touched.password ? true : false
                            }
                            helperText={
                              errors.password && touched.password
                                ? errors.password
                                : null
                            }
                            InputProps={{
                              endAdornment: (
                                <Index.InputAdornment position="end">
                                  <Index.IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <Index.Visibility />
                                    ) : (
                                      <Index.VisibilityOff />
                                    )}
                                  </Index.IconButton>
                                </Index.InputAdornment>
                              ),
                            }}
                          />
                        </Index.Box>
                      </Index.Box>
                    )}
                    {console.log(
                      values.selectedValues,
                      "values.selectedValues"
                    )}
                    {values?.isEdit && (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Select Days
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Select
                            fullWidth
                            multiple
                            name="selectedValues"
                            className="form-control"
                            displayEmpty
                            renderValue={(selected) =>
                              selected.length ? (
                                selected.join(", ")
                              ) : (
                                <span className="placeholder-text">
                                  Select Days
                                </span>
                              )
                            }
                            value={values.selectedValues}
                            onChange={handleChange}
                            error={Boolean(
                              errors.selectedValues && touched.selectedValues
                            )}
                          >
                            {[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ].map((day) => (
                              <Index.MenuItem key={day} value={day}>
                                {day}
                              </Index.MenuItem>
                            ))}
                          </Index.Select>
                          <Index.FormHelperText error>
                            {errors.selectedValues && touched.selectedValues
                              ? errors.selectedValues
                              : ""}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    )}

                    {/* {values?.isEdit && values.selectedValues.length > 0 && (
                      <Index.Box>
                        <Index.Grid container spacing={2}>
                          {values.selectedValues.map((day) => (
                            <React.Fragment key={day}>
                              <Index.Box></Index.Box>
                              <Index.Grid item xs={12} sm={6}>
                                <Index.Box className="input-box modal-input-box">
                                  <Index.FormHelperText className="form-lable">
                                    {day} Start Time
                                  </Index.FormHelperText>
                                  <Index.Box className="form-group">
                                    <Index.TextField
                                      fullWidth
                                      id={`${day}-startTime`}
                                      name={`${day}-startTime`}
                                      className="form-control"
                                      type="time"
                                      inputProps={{
                                        step: 60,
                                        min: "00:00",
                                        max: "23:59",
                                      }}
                                      value={values[`${day}-startTime`] || ""}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `${day}-startTime`,
                                          e.target.value
                                        )
                                      }
                                      error={
                                        errors[`${day}-startTime`] &&
                                        touched[`${day}-startTime`]
                                      }
                                      helperText={
                                        errors[`${day}-startTime`] &&
                                        touched[`${day}-startTime`]
                                          ? errors[`${day}-startTime`]
                                          : null
                                      }
                                    />
                                  </Index.Box>
                                </Index.Box>
                              </Index.Grid>
                              <Index.Grid item xs={12} sm={6}>
                                <Index.Box className="input-box modal-input-box">
                                  <Index.FormHelperText className="form-lable">
                                    {day} End Time
                                  </Index.FormHelperText>
                                  <Index.Box className="form-group">
                                    <Index.TextField
                                      fullWidth
                                      id={`${day}-endTime`}
                                      name={`${day}-endTime`}
                                      className="form-control"
                                      type="time"
                                      inputProps={{
                                        step: 60,
                                        min: "00:00",
                                        max: "23:59",
                                      }}
                                      value={values[`${day}-endTime`] || ""}
                                      onChange={(e) =>
                                        setFieldValue(
                                          `${day}-endTime`,
                                          e.target.value
                                        )
                                      }
                                      error={
                                        errors[`${day}-endTime`] &&
                                        touched[`${day}-endTime`]
                                      }
                                      helperText={
                                        errors[`${day}-endTime`] &&
                                        touched[`${day}-endTime`]
                                          ? errors[`${day}-endTime`]
                                          : null
                                      }
                                    />
                                  </Index.Box>
                                </Index.Box>
                              </Index.Grid>
                            </React.Fragment>
                          ))}
                        </Index.Grid>
                      </Index.Box>
                    )} */}
                    <Index.Box className="modal-user-btn-flex">
                      <Index.Box className="discard-btn-main btn-main-primary">
                        <Index.Box className="common-button blue-button res-blue-button">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={handleClose}
                          >
                            Discard
                          </Index.Button>

                          <Index.LoadingButton
                            type="submit"
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            loading={buttonLoading}
                            loadingPosition="center"
                            startIcon={
                              !buttonLoading && (
                                <img
                                  src={PagesIndex.Svg.save}
                                  className="user-save-icon"
                                  alt="save"
                                />
                              )
                            }
                          >
                            {!buttonLoading && addOrEdit === "Add"
                              ? "Save"
                              : "Update"}
                          </Index.LoadingButton>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default Seller;
