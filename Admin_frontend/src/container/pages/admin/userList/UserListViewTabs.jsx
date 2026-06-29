import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PropTypes from "prop-types";
import "./UserList.css";
import PagesIndex from "../../../PagesIndex";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import dayjs from "dayjs";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Index.Box className="children-tab-main">{children}</Index.Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Search = Index.styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: Index.alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: Index.alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const StyledInputBase = Index.styled(Index.InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const UserListViewTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location?.state?.row;

  const [value, setValue] = React.useState(0);
  const [userViewData, setUserViewData] = useState({
    userDetails: {},
    transactionList: [],
    couponList: [],
    movieInterest: [],
    membershipDetails: [],
    rewardsDetails: [],
  });
  const [cinemaList, setCinemaList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState({
    userDetails: {},
    transactionList: [],
    couponList: [],
    movieInterest: [],
    membershipDetails: [],
    rewardsDetails: [],
  });
  const [loading, setLoading] = useState(true);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSearchValue("");
    setFilteredData(userViewData);
    setCurrentPage(0);
    setRowsPerPage(10);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
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
        setRegionList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const getUserDetails = () => {
    PagesIndex.DataService.get(
      `${PagesIndex.Api.GET_USER_DETAILS}?id=${userId?._id}`
    )
      .then((res) => {
        setUserViewData({
          userDetails: res?.data?.data?.userDetails,
          transactionList: res?.data?.data?.transactions,
          couponList: res?.data?.data?.couponDetails,
          movieInterest: res?.data?.data?.moviesInterested,
          membershipDetails: res?.data?.data?.membershipDetails,
          rewardsDetails: res?.data?.data?.rewardsDetails,
        });
        setFilteredData({
          userDetails: res?.data?.data?.userDetails,
          transactionList: res?.data?.data?.transactions,
          couponList: res?.data?.data?.couponDetails,
          movieInterest: res?.data?.data?.moviesInterested,
          membershipDetails: res?.data?.data?.membershipDetails,
          rewardsDetails: res?.data?.data?.rewardsDetails,
        });
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  };

  const getCinemaName = (id) => {
    const data = cinemaList?.find((data) => data._id == id);
    return data ? data?.cinemaName : "";
  };

  const getRegionName = (id) => {
    const data = regionList?.find((data) => data._id == id);
    return data ? data?.region : "";
  };
  const requestSearch = (searched, type) => {
    setCurrentPage(0);
    let filteredData = userViewData[type].filter(
      (data) =>
        `${data?.firstName?.toLowerCase()} ${data?.lastName?.toLowerCase()}`.includes(
          searched?.toLowerCase()
        ) ||
        data?.couponId?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.couponTitle?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.couponType?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.addSeatData?.strBookId
          ?.toLowerCase()
          ?.includes(searched?.toLowerCase()) ||
        getRegionName(data?.cityId)
          ?.toLowerCase()
          ?.includes(searched?.toLowerCase()) ||
        getCinemaName(data?.cinemaObjectId)
          ?.toLowerCase()
          ?.includes(searched?.toLowerCase()) ||
        data?.initTransId?.toString()?.includes(searched?.toString()) ||
        data?.paymentResponse?.amount
          ?.toString()
          ?.includes(searched?.toString()) ||
        data?.movieId?.name?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        (data?.subscriptionId?.title &&
          data?.subscriptionId?.title
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.payments?.[0]?.paymentResponse?.payment_mode &&
          data?.payments[0]?.paymentResponse?.payment_mode
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.payments?.[0]?.paymentResponse?.order_status &&
          data?.payments?.[0]?.paymentResponse?.order_status
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.payments?.[0]?.paymentResponse?.tracking_id &&
          data?.payments?.[0]?.paymentResponse?.tracking_id
            ?.toString()
            ?.toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.subscriptionId?.price &&
          data?.subscriptionId?.price
            .toString()
            .includes(searched?.toLowerCase())) ||
        (data?.subscriptionStartDate &&
          PagesIndex.moment(data.subscriptionStartDate)
            .format("YYYY-MM-DD")
            .includes(searched?.toLowerCase())) ||
        (data?.subscriptionEndDate &&
          PagesIndex.moment(data.subscriptionEndDate)
            .format("YYYY-MM-DD")
            .includes(searched?.toLowerCase())) ||
        (data?.createdAt &&
          moment(data.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            .toString()
            .toLowerCase()
            .includes(searched.toLowerCase())) ||
        (data?.coins &&
          data?.coins
            .toString()
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.transactionId?.movieId?.name &&
          data?.transactionId?.movieId?.name
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.transactionId?.initTransId &&
          data?.transactionId?.initTransId
            .toString()
            .toLowerCase()
            .includes(searched?.toLowerCase())) ||
        (data?.transactionId?.paymentResponse?.amount &&
          data?.transactionId?.paymentResponse?.amount
            .toString()
            .toLowerCase()
            .includes(searched?.toLowerCase()))
    );

    if (type === "transactionList") {
      setFilteredData((prevState) => ({
        ...prevState,
        transactionList: filteredData,
      }));
    } else if (type === "couponList") {
      setFilteredData((prevState) => ({
        ...prevState,
        couponList: filteredData,
      }));
    } else if (type === "membershipDetails") {
      setFilteredData((prevState) => ({
        ...prevState,
        membershipDetails: filteredData,
      }));
    } else if (type === "movieInterest") {
      setFilteredData((prevState) => ({
        ...prevState,
        movieInterest: filteredData,
      }));
    } else if (type === "reward") {
      setFilteredData((prevState) => ({
        ...prevState,
        rewardsDetails: filteredData,
      }));
    }
  };

  const handleInputChange = (e, type) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue, type);
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    getCinemaList();
    getRegionList();
  }, []);

  if (loading) {
    return <Index.Loader />;
  } else {
    return (
      <Index.Box className="barge-common-box cms-box">
        <Index.Box className="title-header">
          <Index.Box className="res-title-header-flex">
            <Index.Box className="title-main">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                <span onClick={() => navigate(-1)} className="cursor">
                  User Details
                </span>
                {userId?.firstName && " / "}
                <span>
                  {`${
                    userId?.firstName
                      ? `${userId.firstName || "-"} ${userId.lastName || "-"}`
                      : ""
                  }`}
                </span>
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="user-tab-listing">
          <Index.Box className="w-100-tabs-user">
            <Index.Box className="tab-user-contain">
              <Index.Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                className="tabs-user-list"
              >
                <Index.Tab
                  className="tab-label-details"
                  label="General Setting"
                  {...a11yProps(0)}
                />
                <Index.Tab
                  className="tab-label-details"
                  label="Transactions"
                  {...a11yProps(1)}
                />
                <Index.Tab
                  className="tab-label-details"
                  label="Movie Interested"
                  {...a11yProps(2)}
                />
                <Index.Tab
                  className="tab-label-details"
                  label="Membership Plan"
                  {...a11yProps(3)}
                />
                <Index.Tab
                  className="tab-label-details"
                  label="Rewards"
                  {...a11yProps(4)}
                />
                {/* <Index.Tab
                  className="tab-label-details"
                  label="Coupon List"
                  {...a11yProps(3)}
                />
                <Index.Tab
                  className="tab-label-details"
                  label="Membership"
                  {...a11yProps(4)}
                /> */}
                {/* <Index.Tab
                  className="tab-label-details"
                  label="Franchise"
                  {...a11yProps(5)}
                /> */}
              </Index.Tabs>
            </Index.Box>
            <CustomTabPanel
              value={value}
              index={0}
              className="tab-custom-panel-users"
            >
              <Index.Box className="generral-table-container">
                <Index.Grid container spacing={3}>
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="general-info-card">
                      <Index.Box className="general-info-body">
                        <Index.Box className="card-user-setting">
                          <Index.Box className="seeting-profile-card">
                            <Index.Box className="bg-setting-profile">
                              <img
                                src={PagesIndex.Jpg.userbg}
                                alt="userbg"
                                className="user-bg-show"
                              />
                            </Index.Box>
                            <Index.Box className="setting-show-body">
                              <Index.Box className="setting-max-profile">
                                <Index.Box className="setting-profile-show">
                                  <img
                                    src={
                                      userViewData?.userDetails?.profile
                                        ? `${PagesIndex?.IMAGES_API_ENDPOINT}/${userViewData?.userDetails?.profile}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    alt="user"
                                    className="user-show-profile"
                                  />
                                </Index.Box>
                                {/* <Index.Box className="flex-center user-profile-icon">
                                  <Index.Box className="common-button grey-button change-profile">
                                    <Index.Button
                                      variant="contained"
                                      type="button"
                                    >
                                      <img
                                        src={PagesIndex.Svg.edit}
                                        className="edit-icon"
                                        alt="edit-icon"
                                      />
                                    </Index.Button>
                                    <input
                                      type="file"
                                      className="change-profile-input"
                                      accept="image/*"
                                      name="image"
                                    />
                                  </Index.Box>
                                </Index.Box> */}
                              </Index.Box>
                              <Index.Box className="textcenter-profile-details">
                                <Index.Typography className="user-name-profile">
                                  {`${userViewData?.userDetails?.firstName} ${userViewData?.userDetails?.lastName}`}
                                </Index.Typography>
                              </Index.Box>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="general-details-show">
                          <Index.Grid container spacing={1}>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  First Name
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    value={
                                      userViewData?.userDetails?.firstName ||
                                      "-"
                                    }
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Last Name
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.lastName || "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Email address
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.email || "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Phone Number
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.mobileNumber ||
                                      "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Birthdate
                                </Index.FormHelperText>
                                <Index.Box className="form-group date-picker">
                                  {/* <Index.LocalizationProvider
                                    dateAdapter={Index.AdapterDayjs}
                                  >
                                    <Index.DatePicker
                                      fullWidth
                                      id="fullWidth"
                                      name="fromDate"
                                      className="form-control"
                                      format="DD/MM/YYYY"
                                      placeholder="Add from date"
                                      value={dayjs(
                                        userViewData?.userDetails?.birthDate
                                      )}
                                      slotProps={{
                                        textField: {
                                          readOnly: true,
                                          error: false,
                                        },
                                      }}
                                    />
                                  </Index.LocalizationProvider> */}
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.birthDate
                                        ? dayjs(
                                            userViewData?.userDetails?.birthDate
                                          ).format("DD/MM/YYYY")
                                        : "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Gender
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  {/* <Index.Select
                                    fullWidth
                                    id="fullWidth"
                                    name="bannerType"
                                    className="form-control"
                                    displayEmpty
                                    value={userViewData?.userDetails?.gender}
                                  >
                                    <Index.MenuItem value="Female">
                                      Female
                                    </Index.MenuItem>
                                    <Index.MenuItem value="Male">
                                      Male
                                    </Index.MenuItem>
                                    <Index.MenuItem value="Other">
                                      Other
                                    </Index.MenuItem>
                                  </Index.Select> */}

                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.gender || "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Marital Status
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  {/* <Index.Select
                                    fullWidth
                                    id="fullWidth"
                                    name="bannerType"
                                    className="form-control"
                                    displayEmpty
                                    value={
                                      userViewData?.userDetails?.maritalStatus
                                    }
                                  >
                                    <Index.MenuItem value="false">
                                      Unmarried
                                    </Index.MenuItem>
                                    <Index.MenuItem value="true">
                                      Married
                                    </Index.MenuItem>
                                  </Index.Select> */}

                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails
                                        ?.maritalStatus == true
                                        ? "Married"
                                        : "Unmarried"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  City
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.city || "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable">
                                  Address
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    name="title"
                                    className="form-control"
                                    InputProps={{
                                      readOnly: true,
                                    }}
                                    value={
                                      userViewData?.userDetails?.address || "-"
                                    }
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            {/* <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                              <Index.Box className="common-button blue-button res-blue-button flex-end-user">
                                <Index.Button
                                  variant="contained"
                                  disableRipple
                                  className="no-text-decoration"
                                >
                                  Save
                                </Index.Button>
                              </Index.Box>
                            </Index.Grid> */}
                          </Index.Grid>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Grid>
                </Index.Grid>
              </Index.Box>
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={1}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "transactionList")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="transaction-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="15%">Order Id</Index.TableCell>
                        <Index.TableCell width="15%">
                          Booking Id
                        </Index.TableCell>
                        <Index.TableCell width="15%">Amount</Index.TableCell>
                        <Index.TableCell width="15%">Date</Index.TableCell>
                        <Index.TableCell width="15%">
                          Payment Status
                        </Index.TableCell>
                        <Index.TableCell width="15%">
                          Boooking Status
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>

                    <Index.TableBody>
                      {filteredData?.transactionList?.length ? (
                        filteredData?.transactionList
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          ?.map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                {item?.initTransId || "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.addSeatData?.strBookId || "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.paymentResponse?.amount
                                  ? (item?.paymentResponse?.amount)?.toLocaleString("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                    })
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "YYYY-MM-DD HH:mm"
                                    )
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.paymentsStatus ? (
                                  <span className="status-green">Shipped</span>
                                ) : (
                                  <span className="status-red">
                                    {item?.status == 0
                                      ? "Aborted"
                                      : "Unsuccessfull"}
                                  </span>
                                )}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.commitStatus ? (
                                  <span className="status-green">Shipped</span>
                                ) : (
                                  <span className="status-red">
                                    {item?.status == 0
                                      ? "Aborted"
                                      : "Unsuccessfull"}
                                  </span>
                                )}
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
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>

                {filteredData?.transactionList?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.transactionList?.length}
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
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={2}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "movieInterest")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="franchise-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="25%">
                          Movie Name
                        </Index.TableCell>

                        <Index.TableCell width="15%">Date</Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      {filteredData?.movieInterest?.length ? (
                        filteredData?.movieInterest
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                {item?.movieId?.name}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY HH:mm A"
                                    )
                                  : "-"}
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
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
                {filteredData?.movieInterest?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.movieInterest?.length}
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
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={3}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "membershipDetails")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="couponlist-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="16.65%">
                          Membership
                        </Index.TableCell>
                        <Index.TableCell width="16.65%">Amount</Index.TableCell>

                        <Index.TableCell width="16.65%">
                          Payment Mode
                        </Index.TableCell>
                        <Index.TableCell width="16.65%">
                          Payment Status
                        </Index.TableCell>
                        <Index.TableCell width="16.65%">
                          Start Date
                        </Index.TableCell>
                        <Index.TableCell width="16.65%">
                          End Date
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      {filteredData?.membershipDetails?.length ? (
                        filteredData?.membershipDetails

                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                {item?.subscriptionId?.title
                                  ? item?.subscriptionId?.title
                                      .charAt(0)
                                      .toUpperCase() +
                                    item?.subscriptionId?.title
                                      .slice(1)
                                      .toLowerCase()
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.subscriptionId?.price
                                  ? item?.subscriptionId?.price
                                  : "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.payments[0]?.paymentResponse
                                  ?.payment_mode || "-"}
                                <br />
                                {item?.payments[0]?.paymentResponse
                                  ?.tracking_id || "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.payments[0]?.paymentResponse
                                  ?.order_status || "-"}
                                <br />
                                {moment(item?.createdAt).format(
                                  "DD/MM/YYYY HH:mm:ss"
                                ) || "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.subscriptionStartDate
                                  ? PagesIndex.moment(
                                      item?.subscriptionStartDate
                                    ).format("DD/MM/YYYY")
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.subscriptionEndDate
                                  ? PagesIndex.moment(
                                      item?.subscriptionEndDate
                                    ).format("DD/MM/YYYY")
                                  : "-"}
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
                            colSpan={6}
                            align="center"
                          >
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
                {filteredData?.membershipDetails?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.membershipDetails?.length}
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
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={4}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "reward")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="couponlist-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="12.50%">Date</Index.TableCell>
                        <Index.TableCell width="12.50%">
                          Movie Name
                        </Index.TableCell>
                        <Index.TableCell width="12.50%">Coins</Index.TableCell>
                        <Index.TableCell width="12.50%">
                          Booking Id
                        </Index.TableCell>
                        <Index.TableCell width="12.50%">Amount</Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      {filteredData?.rewardsDetails?.length ? (
                        filteredData?.rewardsDetails

                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY"
                                    )
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.transactionId?.movieId?.name
                                  ? item?.transactionId?.movieId?.name
                                  : "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.coins || "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.transactionId?.initTransId
                                  ? item?.transactionId?.initTransId
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.transactionId?.paymentResponse?.amount
                                  ? item?.transactionId?.paymentResponse?.amount
                                  : "-"}
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
                            colSpan={8}
                            align="center"
                          >
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
                {filteredData?.membershipDetails?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.membershipDetails?.length}
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
            </CustomTabPanel>
            {/* <CustomTabPanel
              value={value}
              index={3}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "couponList")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="couponlist-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="15%">Coupon Id</Index.TableCell>
                        <Index.TableCell width="20%">
                          Coupon Code
                        </Index.TableCell>
                        <Index.TableCell width="20%">Type</Index.TableCell>
                        <Index.TableCell width="15%">City</Index.TableCell>
                        <Index.TableCell width="15%">Cinemas</Index.TableCell>
                        <Index.TableCell width="15%">Date</Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      {filteredData?.couponList?.length ? (
                        filteredData?.couponList
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                {item?.couponId}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.couponTitle}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.couponType}
                              </Index.TableCell>
                              <Index.TableCell>
                                {getRegionName(item?.cityId)}
                              </Index.TableCell>
                              <Index.TableCell>
                                {getCinemaName(item?.cinemaObjectId)}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "YYYY-MM-DD HH:mm A"
                                    )
                                  : "-"}
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
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
                {filteredData?.couponList?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.couponList?.length}
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
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={4}
              className="tab-custom-panel-users"
            >
              <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchValue}
                    onChange={(e) => handleInputChange(e, "membershipDetails")}
                  />
                </Search>
              </Index.Box>
              <Index.Box className="membership-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="15%">Profile</Index.TableCell>
                        <Index.TableCell width="20%">User Name</Index.TableCell>
                        <Index.TableCell width="20%">Email</Index.TableCell>
                        <Index.TableCell width="15%">
                          Created Date
                        </Index.TableCell>
                        <Index.TableCell width="10%" align="right">
                          Action
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      {filteredData?.membershipDetails?.length ? (
                        filteredData?.membershipDetails
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((item) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                <img
                                  src={PagesIndex.Png.NoImageAvailable}
                                  className="user-profile"
                                />
                              </Index.TableCell>
                              <Index.TableCell>
                                <Index.Tooltip placement="top" arrow>
                                  <Index.Typography
                                    component="p"
                                    variant="p"
                                    className=""
                                  >
                                    Rahul Dhyani
                                  </Index.Typography>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                admin@theconnplex.com
                              </Index.TableCell>
                              <Index.TableCell>
                                {" "}
                                22/07/2024 11:21 AM
                              </Index.TableCell>
                              <Index.TableCell align="right">
                                <Index.IconButton>
                                  <Index.Visibility />
                                </Index.IconButton>
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
                            No data available
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
                {filteredData?.membershipDetails?.length ? (
                  <Index.Box className="pagination-design flex-end">
                    <Index.Stack spacing={2}>
                      <Index.Box className="pagination-count">
                        <Index.TablePagination
                          component="div"
                          count={filteredData?.membershipDetails?.length}
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
            </CustomTabPanel>
            <CustomTabPanel
              value={value}
              index={5}
              className="tab-custom-panel-users"
            >
              <Index.Box className="franchise-table-container">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main one-line-table"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="15%">Profile</Index.TableCell>
                        <Index.TableCell width="20%">User Name</Index.TableCell>
                        <Index.TableCell width="20%">Email</Index.TableCell>
                        <Index.TableCell width="15%">
                          Created Date
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody>
                      <Index.TableRow>
                        <Index.TableCell>
                          <img
                            src={PagesIndex.Png.NoImageAvailable}
                            className="user-profile"
                          />
                        </Index.TableCell>
                        <Index.TableCell>
                          <Index.Tooltip placement="top" arrow>
                            <Index.Typography
                              component="p"
                              variant="p"
                              className=""
                            >
                              Rahul Dhyani
                            </Index.Typography>
                          </Index.Tooltip>
                        </Index.TableCell>
                        <Index.TableCell>admin@theconnplex.com</Index.TableCell>
                        <Index.TableCell> 22/07/2024 11:22 AM</Index.TableCell>
                      </Index.TableRow>
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
              </Index.Box>
            </CustomTabPanel> */}
          </Index.Box>
        </Index.Box>
      </Index.Box>
    );
  }
};

export default UserListViewTabs;
