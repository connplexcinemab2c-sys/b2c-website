import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useDispatch } from "react-redux";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import moment from "moment";
import { useFormik } from "formik";
import { addUserSchema } from "../../../../validation/FormikValidation";

const Search = Index.styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: Index.alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: Index.alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto"
  }
}));

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24
};

const StyledInputBase = Index.styled(Index.InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch"
    }
  }
}));

const CouponManagement = () => {
  const initialValues = {
    assignUserId: []
  };

  const navigate = PagesIndex.useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingsList, setBookingsList] = useState([]);
  const [filterDataList, setFilterDataList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectCoupon, setSelectCoupon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});
  const [openAddUser, setOpenAddUser] = useState(false);
  const [userList, setUserList] = useState([]);
  const [couponUsageOpen, setCouponUsageOpen] = useState(false);
  const [couponListLoading, setCouponListLoading] = useState(false);
  const [couponUsageList, setCouponUsageList] = useState([]);

  const handleOpenCouponUsage = () => {
    setCouponUsageOpen(true)
  }
  const handleCloseCouponUsage = () => {
    setCouponUsageOpen(false)
  }

  const handleOpenAddUser = () => {
    setOpenAddUser(true);
  };
  const handleCloseAddUser = () => {
    setOpenAddUser(false);
    formik.setFieldValue("assignUserId", []);
  };
  const handleSubmit = (values) => {
    setLoading(true);

    const formData = new URLSearchParams();

    formData.append("userIds", values.assignUserId);
    formData.append("couponId", selectCoupon.couponId);

    PagesIndex.DataService.post(PagesIndex.Api.ADD_USER, formData)
      .then((res) => {
        if (res?.status == 200 || res?.status == 201) {
          PagesIndex.toast.success(res?.data?.message);
          setLoading(false);
          handleCloseAddUser();
        } else if (res?.status == 400) {
          PagesIndex.toast.error(res?.message);
          setLoading(false);
          handleCloseAddUser();
        }
        navigate("/admin/coupon-management");
      })
      .catch((err) => {
        console.log(err);
        PagesIndex.toast.error(err?.response?.data?.message);
        setLoading(false);
      });
  };
  const getCouponUsageList = (couponId) => {
    setCouponListLoading(true)
    PagesIndex.DataService.post(
      PagesIndex.Api.COUPON_USE_HISTORY + "?" + "couponId=" + couponId
    )
      .then((res) => {
        setCouponUsageList(res?.data?.data);
        setCouponListLoading(false)
      })
      .catch((err) => {
        setCouponUsageList([]);
        setCouponListLoading(false)
      });
  }

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: handleSubmit,
    validationSchema: addUserSchema
  });

  React.useEffect(() => {
    if (openDrawer) {
      setIsOpen(openDrawer);
    } else {
      setOpenDrawer(false);
    }
  }, [openDrawer]);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
    setOpenDrawer(false);
  };
  //

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const getUserList = () => {
    setLoading(true);
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_USER_LIST + "?" + new Date().getTime()
    )
      .then((res) => {
        setUserList(res?.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data.message);
        setLoading(false);
        setUserList([]);
      });
  };

  useEffect(() => {
    getUserList();
  }, []);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const getBookingsList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_COUPONS)
      .then((res) => {
        setFilterDataList(res?.data?.data);
        setBookingsList(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !filterDataList == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (title) =>
              title?.couponId
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase()) ||
              title?.couponTitle
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase()) ||
              title?.couponType
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase()) ||
              title?.cityId?.region
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase()) ||
              title?.cinemaObjectId?.[0]?.cinemaName
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase()) ||
              title?.couponCategory
                ?.toLowerCase()
                ?.includes(searchValue?.toLowerCase())
          );
          setFilterDataList(filteredDataFilter);
        } else {
          setFilterDataList(res?.data?.data);
          setSearchValue("");
        }
      })
      .catch((err) => {
        setFilterDataList([]);
        setBookingsList([]);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      });
  };

  const generateExcel = async () => {
    const headers = [
      "Coupon Id",
      "Coupon Code",
      "Auto Apply",
      "Merge with another coupon",
      "Coupon Type",
      "City",
      "Cinema",
      "Coupon For",
      "Coupon code (per user)",
      "Over all Coupon code usage",
      "Range of Spent",
      "Discount Type",
      "Discount",
      "Discount Upto",
      "Coupon Category",
      "Description",
      "Start Date",
      "End Date"
    ];
    const rows = filterDataList?.map((row) => ({
      coupon_id: row?.couponId || "-",
      coupon_code: row?.couponTitle || "-",
      auto_option:
        row?.advancedSettings.autoApplyOnCheckOut == 1 ? "yes" : "no",
      merge_option:
        row?.advancedSettings.mergeWithAnotherCoupon == 1 ? "yes" : "no",
      type: row?.couponType ? row?.couponType : "-",
      city: Array.isArray(row?.cityId)
        ? row?.cityId.map((item) => item?.region).join(", ")
        : "-",
      cinema: Array.isArray(row?.cinemaObjectId)
        ? row?.cinemaObjectId.map((item) => item?.cinemaName).join(", ")
        : "-",
      coupon_for: Array.isArray(row?.couponFor)
        ? row?.couponFor.map((item) => item).join(", ")
        : "-",
      coupon_usage_per_user: row?.couponUsage ? row?.couponUsage : "-",
      over_all_usage: row?.couponCodeOverAllUsage
        ? row?.couponCodeOverAllUsage
        : "-",
      range_of_spent: `${row?.assignCoupon?.rangeOfSpent?.spentForm}-${row?.assignCoupon?.rangeOfSpent?.spentTo}`,
      discount_type: row?.discountType ? row?.discountType : "-",
      discount: row?.discount ? row?.discount : "-",
      discount_upto: row?.couponUpTo ? row?.couponUpTo : "-",
      coupon_category: row?.couponCategory ? row?.couponCategory : "-",
      description: row?.couponDescription ? row?.couponDescription : "-",
      start_date: row?.couponStartDate
        ? PagesIndex.moment(row?.couponStartDate).format("DD/MM/YYYY hh:mm A")
        : "-",
      end_date: row?.couponEndDate
        ? PagesIndex.moment(row?.couponEndDate).format("DD/MM/YYYY hh:mm A")
        : "-"
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction");

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `coupon_management_${PagesIndex.moment().format("DD-MM-YYYY")}.xlsx`,
      { compression: true }
    );
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    setCurrentPage(0);

    let filteredData = bookingsList;

    if (searched) {
      filteredData = filteredData?.filter(
        (row) =>
          row?.couponId?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.couponTitle?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.couponType?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.couponFor?.some((item) =>
            item?.toLowerCase()?.includes(searched?.toLowerCase())
          ) ||
          row?.cityId?.region
            ?.toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          row?.cinemaObjectId?.[0]?.cinemaName
            ?.toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          row?.couponCategory
            ?.toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          (row &&
            row?.couponEndDate &&
            PagesIndex.moment(row?.couponEndDate)
              .format("DD/MM/YYYY hh:mm A")
              ?.toString()
              ?.toLowerCase()
              .includes(searched.toLowerCase())) ||
          (row &&
            row?.couponStartDate &&
            PagesIndex.moment(row?.couponStartDate)
              .format("DD/MM/YYYY hh:mm A")
              ?.toString()
              ?.toLowerCase()
              .includes(searched.toLowerCase()))
      );
    }

    if (fromDate && toDate) {
      const startDate = PagesIndex.moment(fromDate);
      const endDate = PagesIndex.moment(toDate);

      filteredData = filteredData?.filter((item) => {
        const itemDate = PagesIndex.moment(item?.createdAt);
        return (
          itemDate.isSameOrAfter(startDate, "day") &&
          itemDate.isSameOrBefore(endDate, "day")
        );
      });
    }

    setFilterDataList(filteredData);
  };

  const handleFilter = () => {
    setSearchValue("");
    setSelectedMovie("");
    setCurrentPage(0);
    if (fromDate && toDate) {
      const filtered = bookingsList?.filter((item) => {
        const itemDate = PagesIndex.moment(item?.createdAt);
        if (fromDate && toDate) {
          const startDate = PagesIndex.moment(fromDate);
          const endDate = PagesIndex.moment(toDate);
          return (
            itemDate.isSameOrAfter(startDate, "day") &&
            itemDate.isSameOrBefore(endDate, "day")
          );
        }
        return true;
      });

      setFilterDataList(filtered);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [fromDate, toDate]);
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchValue("");
    setSelectedMovie("");
    setFilterDataList(bookingsList);
  };

  const filterMovie = (data) => {
    let resultMovie = bookingsList;

    if (fromDate && toDate) {
      const startDate = PagesIndex.moment(fromDate);
      const endDate = PagesIndex.moment(toDate);

      resultMovie = resultMovie.filter((item) => {
        const itemDate = PagesIndex.moment(item?.createdAt);
        return (
          itemDate.isSameOrAfter(startDate, "day") &&
          itemDate.isSameOrBefore(endDate, "day")
        );
      });
    }

    if (data && data !== "") {
      resultMovie = resultMovie.filter((item) => {
        return item?.cinemaObjectId?._id === data;
      });
    }

    setFilterDataList(resultMovie);
    setCurrentPage(0);
  };

  const handleRemove = () => {
    setIsLoading(true);
    const data = {
      id: id
    };

    PagesIndex.DataService.post(PagesIndex.Api.DELETE_COUPON, data)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        setIsLoading(false);
        getBookingsList();
        handleDeleteClose();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };
  const handleStatus = (id) => {
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.patch(
      `${PagesIndex.Api.ACTIVE_DEACTIVE_COUPON}?id=${id}`
    )
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getBookingsList();
          setTimeout(() => {
            setLoadingState((prevState) => ({ ...prevState, [id]: false }));
          }, 1000);
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
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

  useEffect(() => {
    getCinemaList();
    getBookingsList();
  }, []);

  return (
    <>
      <Index.Box className="">
        <Index.Box
          className="barge-common-box"
          style={{ marginBottom: "15px" }}
        >
          <Index.Box className="title-header title-header-booking-form">
            <Index.Box className="booking-flex-content">
              <Index.Stack
                component="form"
                className="transaction-history-flex"
                noValidate
                autoComplete="off"
              >
                <Index.Box className="booking-report-content mt-manage-coupon">
                  <Index.Box className="common-button blue-button res-blue-button">
                    <Index.Button
                      className="add-hover-plus-common no-text-decoration"
                      onClick={() => {
                        setOpenDrawer(true);
                      }}
                    >
                      <img
                        className="plus-export"
                        src={PagesIndex.Png.Filter}
                      ></img>
                    </Index.Button>
                  </Index.Box>
                  <Index.Box className="common-button blue-button res-blue-button">
                    <Index.Button
                      variant="contained"
                      className="no-text-decoration"
                      disabled={filterDataList.length ? false : true}
                      onClick={() => generateExcel()}
                    >
                      Export excel
                    </Index.Button>
                  </Index.Box>
                  <Index.Box className="common-button blue-button res-blue-button">
                    <Index.Button
                      variant="contained"
                      className="no-text-decoration"
                      onClick={(e) => {
                        navigate({
                          pathname: `/admin/add-coupon`
                        });
                      }}
                    >
                      Add Coupon
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
              </Index.Stack>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="barge-common-box">
          <Index.Box className="title-header">
            <Index.Box className="title-header-flex res-title-header-flex">
              <Index.Box className="title-main common-export-flex">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Coupon
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
              </Index.Box>
            </Index.Box>
          </Index.Box>

          <Index.Box className="page-table-main coupon-table-main">
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
                    <Index.TableCell width="5%">Sr.No</Index.TableCell>
                    <Index.TableCell width="5%">Coupon Id</Index.TableCell>
                    <Index.TableCell width="5%">
                      Cinema (theater)
                    </Index.TableCell>
                    <Index.TableCell width="5%">Coupon Code</Index.TableCell>
                    <Index.TableCell width="5%">Auto Apply</Index.TableCell>
                    <Index.TableCell width="5%">
                      Merge with another coupon
                    </Index.TableCell>
                    <Index.TableCell width="5%">Coupon For</Index.TableCell>
                    <Index.TableCell width="5%">
                      Coupon code (per user)
                    </Index.TableCell>

                    <Index.TableCell width="5%">
                      Over all Coupon code usage
                    </Index.TableCell>
                    <Index.TableCell width="5%">Range of Spent</Index.TableCell>
                    <Index.TableCell width="5%">Type</Index.TableCell>
                    <Index.TableCell width="5%">Discount Type</Index.TableCell>
                    <Index.TableCell width="5%">Discount</Index.TableCell>
                    <Index.TableCell width="5%">Discount Upto</Index.TableCell>

                    <Index.TableCell width="5%">
                      Coupon Category
                    </Index.TableCell>

                    <Index.TableCell width="5%">Description</Index.TableCell>
                    <Index.TableCell width="5%">Start Date</Index.TableCell>
                    <Index.TableCell width="5%">End Date</Index.TableCell>
                    <Index.TableCell width="5%" align="center">
                      Status
                    </Index.TableCell>
                    <Index.TableCell width="5%" align="right">
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
                        colSpan={17}
                        align="center"
                      >
                        <Index.Loader />
                      </Index.TableCell>
                    </Index.TableRow>
                  </Index.TableBody>
                ) : (
                  <Index.TableBody>
                    {filterDataList?.length ? (
                      filterDataList
                        ?.slice(
                          currentPage * rowsPerPage,
                          currentPage * rowsPerPage + rowsPerPage
                        )
                        .map((row, index) => (
                          <Index.TableRow className="inquiry-list">
                            <Index.TableCell>
                              {index + 1 + currentPage * rowsPerPage}
                            </Index.TableCell>
                            <Index.TableCell className="table-td">
                              <Index.Typography className="id-text">
                                {row?.couponId ? row?.couponId : "-"}
                              </Index.Typography>
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.cinemaObjectId?.[0]?.cinemaName
                                ? row?.cinemaObjectId?.[0]?.cinemaName
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponTitle ? row?.couponTitle : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.advancedSettings.autoApplyOnCheckOut ==
                              1 ? (
                                <Index.DoneIcon color="success" />
                              ) : (
                                <Index.ClearIcon color="error" />
                              )}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.advancedSettings.mergeWithAnotherCoupon ==
                              1 ? (
                                <Index.DoneIcon color="success" />
                              ) : (
                                <Index.ClearIcon color="error" />
                              )}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponFor
                                ?.map((coupon) => coupon)
                                .join(", ")}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponUsage ? row?.couponUsage : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponCodeOverAllUsage
                                ? row?.couponCodeOverAllUsage
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>{`${row?.assignCoupon?.rangeOfSpent?.spentForm}-${row?.assignCoupon?.rangeOfSpent?.spentTo}`}</Index.TableCell>
                            <Index.TableCell>
                              {row?.couponType ? row?.couponType : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.discountType ? row?.discountType : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.discount ? row?.discount : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponUpTo ? row?.couponUpTo : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.couponCategory ? row?.couponCategory : "-"}
                            </Index.TableCell>

                            <Index.Tooltip
                              arrow
                              title={
                                row?.couponDescription
                                  ? row?.couponDescription
                                  : "-"
                              }
                            >
                              <Index.TableCell className="table-data-text">
                                {row?.couponDescription
                                  ? row?.couponDescription
                                  : "-"}
                              </Index.TableCell>
                            </Index.Tooltip>
                            <Index.TableCell>
                              {moment(row?.couponStartDate).format(
                                "DD/MM/YYYY"
                              )}
                            </Index.TableCell>
                            <Index.TableCell>
                              {moment(row?.couponEndDate).format("DD/MM/YYYY")}
                            </Index.TableCell>
                            <Index.TableCell align="center">
                              <CustomToggleButton
                                defaultChecked={row?.isActive}
                                onChange={(e) => {
                                  handleStatus(row?._id);
                                }}
                                disabled={loadingState[row?._id] || false}
                              />
                            </Index.TableCell>
                            <Index.TableCell align="right">
                              <Index.Box className="flex-action-details">
                                {row?.couponCategory == "Private" && (
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton
                                      onClick={() => {
                                        handleOpenAddUser();
                                        // if(formik.values.assignUserId.length){
                                        //   formik.setFieldValue("assignUserId",[]);

                                        // }
                                        setSelectCoupon(row);
                                        formik.setErrors("");
                                      }}
                                    >
                                      <Index.MailIcon />
                                    </Index.IconButton>
                                  </Index.Box>
                                )}
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={(e) => {
                                      navigate(`/admin/view-coupon`, {
                                        state: { row: row }
                                      });
                                    }}
                                  >
                                    <Index.Visibility />
                                  </Index.IconButton>
                                </Index.Box>
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={(e) => {
                                      navigate(`/admin/add-coupon`, {
                                        state: { row: row }
                                      });
                                    }}
                                  >
                                    <Index.EditIcon />
                                  </Index.IconButton>
                                </Index.Box>
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton>
                                    <Index.DeleteIcon
                                      onClick={() => handleDeleteOpen(row?._id)}
                                    />
                                  </Index.IconButton>
                                </Index.Box>
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={() =>{ handleOpenCouponUsage(); getCouponUsageList(row?._id)}}
                                  >
                                    <Index.InfoIcon />
                                  </Index.IconButton>
                                </Index.Box>
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
                          colSpan={18}
                          align="center"
                        >
                          No data available
                        </Index.TableCell>
                      </Index.TableRow>
                    )}
                  </Index.TableBody>
                )}
              </Index.Table>
            </Index.TableContainer>
          </Index.Box>

          {filterDataList?.length && !loading ? (
            <Index.Box className="pagination-design flex-end">
              <Index.Stack spacing={2}>
                <Index.Box className="pagination-count">
                  <Index.TablePagination
                    component="div"
                    count={filterDataList?.length}
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

        <React.Fragment key="right">
          <Index.Drawer
            anchor="right"
            open={isOpen}
            onClose={toggleDrawer(false)}
          >
            <Index.Box className="common-main-drawer">
              <Index.Box role="presentation" className="common-drawer-details">
                <Index.Box className="common-pd-drawer">
                  <Index.Box className="drawer-header">
                    <Index.Box className="common-filter-content">
                      <Index.Typography
                        component="p"
                        variant="p"
                        className="common-filter-title"
                      >
                        Filter
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box className="drawer-details-hgt">
                    <Index.Box className="drawer-inner-content">
                      {/* filter date */}
                      <Index.Box className="filter-input-field">
                        <Index.Grid
                          container
                          spacing={2}
                          className="common-admin-grid"
                        >
                          {/* filter date */}
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="common-btn-details">
                              <Index.Box className="flex-gap-footer end-justify-content">
                                <Index.Button
                                  className="btn-secondary"
                                  onClick={() => clearFilters()}
                                >
                                  Clear
                                </Index.Button>
                              </Index.Box>
                            </Index.Box>
                          </Index.Grid>
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="input-box modal-input-box">
                              <Index.FormHelperText className="form-lable bold-label-common">
                                From Date
                              </Index.FormHelperText>
                              <Index.Box className="form-group date-picker">
                                <Index.LocalizationProvider
                                  dateAdapter={Index.AdapterDayjs}
                                >
                                  <Index.DatePicker
                                    fullWidth
                                    id="fromDate"
                                    name="fromDate"
                                    className="form-control"
                                    format="DD/MM/YYYY"
                                    placeholder="Add from date"
                                    value={PagesIndex.dayjs(
                                      PagesIndex.moment(fromDate).format(
                                        "YYYY-MM-DD"
                                      )
                                    )}
                                    slotProps={{
                                      textField: {
                                        readOnly: true,
                                        error: false
                                      }
                                    }}
                                    maxDate={PagesIndex.dayjs(
                                      PagesIndex.moment().format("YYYY-MM-DD")
                                    )}
                                    onChange={(date) => {
                                      setFromDate(date?.$d);
                                      if (!toDate || date >= toDate) {
                                        setToDate(null);
                                      }
                                    }}
                                    renderInput={(params) => (
                                      <Index.TextField
                                        {...params}
                                        sx={{ width: "100%" }}
                                      />
                                    )}
                                  />
                                </Index.LocalizationProvider>
                              </Index.Box>
                            </Index.Box>
                          </Index.Grid>
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="input-box modal-input-box  mt-remover-datepicker">
                              <Index.FormHelperText className="form-lable bold-label-common">
                                To Date
                              </Index.FormHelperText>
                              <Index.Box className="form-group date-picker">
                                <Index.LocalizationProvider
                                  dateAdapter={Index.AdapterDayjs}
                                >
                                  <Index.DatePicker
                                    fullWidth
                                    className="form-control"
                                    id="toDate"
                                    name="toDate"
                                    format="DD/MM/YYYY"
                                    placeholder="Add to date"
                                    value={PagesIndex.dayjs(
                                      PagesIndex.moment(toDate).format(
                                        "YYYY-MM-DD"
                                      )
                                    )}
                                    onChange={(date) => {
                                      setToDate(date?.$d);
                                    }}
                                    minDate={PagesIndex.dayjs(
                                      PagesIndex.moment(fromDate).format(
                                        "YYYY-MM-DD"
                                      )
                                    )}
                                    maxDate={PagesIndex.dayjs(
                                      PagesIndex.moment().format("YYYY-MM-DD")
                                    )}
                                    disabled={!fromDate}
                                    renderInput={(params) => (
                                      <Index.TextField
                                        {...params}
                                        sx={{ width: "100%" }}
                                      />
                                    )}
                                    slotProps={{
                                      textField: {
                                        readOnly: true,
                                        error: false
                                      }
                                    }}
                                  />
                                </Index.LocalizationProvider>
                              </Index.Box>
                            </Index.Box>
                          </Index.Grid>
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="form-group w-100-res-drop">
                              <Index.Select
                                fullWidth
                                id="fullWidth"
                                name="category"
                                className="form-control"
                                displayEmpty
                                value={selectedMovie}
                                onChange={(e) => {
                                  setSelectedMovie(e.target.value);
                                  filterMovie(e.target.value);
                                }}
                                renderValue={
                                  selectedMovie
                                    ? undefined
                                    : () => "Select cinema"
                                }
                              >
                                <Index.MenuItem value={""}>All</Index.MenuItem>
                                {cinemaList?.map((data) => (
                                  <Index.MenuItem
                                    key={data?._id}
                                    value={data?._id}
                                    className="menu-movie-max cus-drop"
                                  >
                                    {data?.cinemaName}
                                  </Index.MenuItem>
                                ))}
                              </Index.Select>
                            </Index.Box>
                          </Index.Grid>
                        </Index.Grid>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box className="drawer-footer">
                    <Index.Box className="common-btn-details">
                      <Index.Box className="flex-gap-footer end-justify-content blue-button common-button">
                        <Index.Button onClick={toggleDrawer(false)}>
                          Close
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Drawer>
        </React.Fragment>
      </Index.Box>

      <Index.Modal
        open={openAddUser}
        onClose={handleCloseAddUser}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="modal modal-delete copoun-modal-user"
      >
        <form onSubmit={formik.handleSubmit}>
          <Index.Box
            sx={style}
            className="modal-inner-main add-role-modal modal-inner modal-inner-user-details"
          >
            <Index.Box className="modal-header">
              <Index.Typography
                id="modal-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
              >
                User Select
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleCloseAddUser}
              />
            </Index.Box>

            <Index.Box className="modal-body">
              <Index.Box className="input-box modal-input-box">
                <Index.FormHelperText className="form-lable">
                  Please Select the users
                </Index.FormHelperText>
                <Index.Box className="form-group">
                  <Index.Autocomplete
                    className="cinema-auto-input"
                    multiple
                    options={userList}
                    value={userList.filter((user) =>
                      formik.values.assignUserId.includes(user._id)
                    )}
                    onBlur={() => formik.setFieldTouched("assignUserId", true)}
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
                        placeholder="Please select the users"
                      />
                    )}
                  />
                  <Index.FormHelperText error>
                    {formik.errors.assignUserId && formik.touched.assignUserId
                      ? formik.errors.assignUserId
                      : false}
                  </Index.FormHelperText>
                </Index.Box>

                <Index.Box className="delete-modal-btn-flex">
                  <Index.Button
                    className="modal-delete-btn modal-btn"
                    type="submit"
                  >
                    Submit
                  </Index.Button>
                  <Index.Button
                    className="modal-cancel-btn modal-btn"
                    onClick={handleCloseAddUser}
                  >
                    Cancel
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </form>
      </Index.Modal>

      {/* Coupon usage modal */}
      <Index.Modal
        open={couponUsageOpen}
        onClose={handleCloseCouponUsage}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="modal"
      >
        <Index.Box
          sx={style}
          className="modal-inner-main coupen-modal-inner modal-inner"
        >
          <Index.Box className="modal-header">
            <Index.Typography
              id="modal-modal-title"
              className="modal-title"
              variant="h6"
              component="h2"
            >
              {couponUsageList?.couponTitle} Usage List
            </Index.Typography>
            <img
              src={PagesIndex.Svg.cancel}
              className="modal-close-icon"
              onClick={handleCloseCouponUsage}
            />
          </Index.Box>
          <Index.Box className="modal-body">
            <Index.Box className="coupen-table-main">
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
                      Booking ID
                    </Index.TableCell>
                    <Index.TableCell width="5%">
                      Movie Name
                    </Index.TableCell>
                    <Index.TableCell width="5%">Cinema</Index.TableCell>
                    <Index.TableCell width="3%">Discount amount</Index.TableCell>
                    <Index.TableCell width="5%">
                      User name
                    </Index.TableCell>
                    <Index.TableCell width="5%">Date</Index.TableCell>


                  </Index.TableRow>
                </Index.TableHead>
                {couponListLoading ? (
                  <Index.TableBody>
                    <Index.TableRow>
                      <Index.TableCell
                        component="td"
                        variant="td"
                        scope="row"
                        className="no-data-in-list"
                        colSpan={17}
                        align="center"
                      >
                        Loading....
                      </Index.TableCell>
                    </Index.TableRow>
                  </Index.TableBody>
                ) : (
                  <Index.TableBody>
                    {couponUsageList?.transactions?.length ? (
                      couponUsageList?.transactions
                        .map((row, index) => (
                          <Index.TableRow className="inquiry-list">
                            <Index.TableCell>
                              {row?.strBookingId
                                ? row?.strBookingId
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.movieDetails?.name
                                ? row?.movieDetails?.name
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.cinemaDetails?.cinemaName
                                ? row?.cinemaDetails?.cinemaName
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.discountApplied
                                ? row?.discountApplied
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.userDetails?.email  
                                ? row?.userDetails?.email
                                : row?.userDetails?.mobileNumber
                                ? row?.userDetails?.mobileNumber
                                : "-"}
                            </Index.TableCell>

                            <Index.TableCell>
                              {moment(row?.createdAt).format("DD/MM/YYYY hh:mm A")}
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
                          colSpan={18}
                          align="center"
                        >
                          No data available
                        </Index.TableCell>
                      </Index.TableRow>
                    )}
                  </Index.TableBody>
                )}
              </Index.Table>
            </Index.TableContainer>
          </Index.Box>
          </Index.Box>
        </Index.Box>

      </Index.Modal>

      <PagesIndex.DeleteModal
        deleteOpen={deleteOpen}
        handleDeleteClose={handleDeleteClose}
        handleDeleteRecord={!isLoading && handleRemove}
      />
    </>
  );
};

export default CouponManagement;
