import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./VistaLogs.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { Drawer } from "@mui/material";
import moment from "moment";
// import { API_ENDPOINT } from "../../../../config/DataService";

function extractDates(dateRange) {
  if (!dateRange) {
    return { startDate: null, endDate: null };
  }

  const [startStr, endStr] = dateRange.split(" - ");

  const startDate = moment(startStr, "D MMM YYYY");
  const endDate = moment(endStr, "D MMM YYYY");

  return { startDate, endDate };
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
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
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
      width: "20ch",
    },
  },
}));

const VistaLogs = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );

  const queryParams = new URLSearchParams(window.location.search);
  const dateRange = queryParams.get("date") || "";
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [bookingsList, setBookingsList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [count, setCount] = useState(0);
  const [excel, setExcel] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const fileName = "Transaction";
  const [searchValue, setSearchValue] = useState("");
  const [cinemaList, setCinemaList] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [bookingStatus, setBookingStatus] = useState("All");
  const [isBtnLoading, setIsBtnLoading] = useState(false); // To track if data is being fetched

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  //
  React.useEffect(() => {
    if (openDrawer) {
      setIsOpen(openDrawer);
    } else {
      setOpenDrawer(false);
    }
  }, [openDrawer]);

  const clearPrams = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("date")) {
      params.delete("date");
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}${window.location.hash || ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  };

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

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    setCurrentPage(1);
    // requestSearch(newValue);
  };
  // const requestSearch = (searched) => {
  //   setCurrentPage(0);

  //   let filteredData = bookingsList;

  //   if (searched) {
  //     filteredData = filteredData?.filter(
  //       (data) =>
  //         data?.userData?.email
  //           ?.toLowerCase()
  //           ?.includes(searched?.toLowerCase()) ||
  //         data?.cinemaData?.cinemaName
  //           ?.toLowerCase()
  //           ?.includes(searched?.toLowerCase()) ||
  //         data?.addSeatData?.strBookId
  //           ?.toLowerCase()
  //           ?.includes(searched?.toLowerCase()) ||
  //         data?.initTransId?.toString()?.includes(searched?.toString()) ||
  //         data?.userData?.mobileNumber
  //           ?.toString()
  //           ?.includes(searched?.toString()) ||
  //         (data &&
  //           data?.createdAt &&
  //           PagesIndex.moment(data?.createdAt)
  //             .format("DD/MM/YYYY hh:mm A")
  //             ?.toString()
  //             ?.toLowerCase()
  //             .includes(searched.toLowerCase()))
  //     );
  //   }

  //   if (fromDate && toDate) {
  //     const startDate = PagesIndex.moment(fromDate);
  //     const endDate = PagesIndex.moment(toDate);

  //     filteredData = filteredData?.filter((item) => {
  //       const itemDate = PagesIndex.moment(item?.createdAt);
  //       return (
  //         itemDate.isSameOrAfter(startDate, "day") &&
  //         itemDate.isSameOrBefore(endDate, "day")
  //       );
  //     });
  //   }

  //   setFilteredData(filteredData);
  // };

  // const handleFilter = () => {
  //   setSearchValue("");
  //   setCurrentPage(0);
  //   if (fromDate && toDate) {
  //     const filtered = bookingsList?.filter((item) => {
  //       const itemDate = PagesIndex.moment(item?.createdAt);
  //       if (fromDate && toDate) {
  //         const startDate = PagesIndex.moment(fromDate);
  //         const endDate = PagesIndex.moment(toDate);
  //         return (
  //           itemDate.isSameOrAfter(startDate, "day") &&
  //           itemDate.isSameOrBefore(endDate, "day")
  //         );
  //       }
  //       return true;
  //     });

  //     setFilteredData(filtered);
  //   }
  // };
  const clearFilters = () => {
    clearPrams();
    setOpenDrawer(false);
    setIsOpen(false);
    setIsBtnLoading(true);
    setFromDate("");
    setToDate("");
    setSearchValue("");
    setPaymentStatus("All");
    setBookingStatus("All");
    setSelectedCinema("");
    setCurrentPage(1);
    if (
      fromDate ||
      toDate ||
      searchValue ||
      paymentStatus !== "All" ||
      bookingStatus !== "All" ||
      selectedCinema !== ""
    ) {
      getBookingsList();
    }
    setFilteredData(bookingsList);
  };

  useEffect(() => {
    if (
      fromDate === "" &&
      toDate === "" &&
      searchValue === "" &&
      paymentStatus === "All" &&
      bookingStatus === "All" &&
      selectedCinema === ""
    ) {
      getBookingsList();
      setFilteredData(bookingsList);
    }
  }, [
    fromDate,
    toDate,
    searchValue,
    paymentStatus,
    bookingStatus,
    selectedCinema,
    dateRange,
  ]); // This runs whenever any of the filters change

  useEffect(() => {
    handleFilter();
  }, [fromDate, toDate, dateRange]);

  const getBookingsList = () => {
    setLoading(true);
    const data = {
      page: currentPage,
      search: searchValue,
      limit: rowsPerPage,
      startDate: fromDate || extractDates(dateRange).startDate,
      endDate: toDate || extractDates(dateRange).endDate,
      // startDate: new Date(
      //   PagesIndex.moment(fromDate).utcOffset("+5:30").format("YYYY-MM-DD") +
      //     "T00:00:00.000Z"
      // ),
      // endDate: new Date(
      //   PagesIndex.moment(toDate).utcOffset("+5:30").format("YYYY-MM-DD") +
      //     "T23:59:59.000Z"
      // ),
      cinemaId: selectedCinema === "All" ? "" : selectedCinema,
      paymentStatus: paymentStatus === "All" ? "" : paymentStatus,
      bookingStatus: bookingStatus === "All" ? "" : bookingStatus,
    };
    PagesIndex.DataService.post(PagesIndex.Api.GET_VISTA_LOGS_NEW, data)
      .then((res) => {
        setBookingsList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setCount(res?.data?.totalCount);
        setLoading(false);
        setIsBtnLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setBookingsList([]);
        setFilteredData([]);
        setLoading(false);
        setIsBtnLoading(false);
      });
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_CINEMA)
      .then((res) => {
        setCinemaList(res?.data?.data);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getCinemaList();
  }, []);
  useEffect(() => {
    const customHeadings =
      bookingsList &&
      bookingsList?.map((item) => {
        const userDetailsArray = [
          item?.userData?.firstName,
          item?.userData?.lastName,
          item?.userData?.email,
          item?.userData?.mobileNumber,
        ];

        const userDetails = userDetailsArray.some(Boolean)
          ? userDetailsArray.filter(Boolean).join(" ")
          : "-";

        return {
          "Cinema Name": item?.cinemaData?.cinemaName || "-",
          "User Details": userDetails,
          "Order Id": item?.initTransId || "-",
          "Booking Id": item?.addSeatData?.strBookId || "-",
          Amount: item?.paymentResponse?.amount
            ? (item?.paymentResponse?.amount)?.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })
            : "-",
          "Payment Status": item?.paymentsStatus ? "Success" : "Fail",
          "Booking Status": item?.commitStatus ? "Success" : "Fail",
          Date: item?.createdAt
            ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
            : "-",
        };
      });

    setExcel(customHeadings);
  }, [bookingsList]);

  const handleOpen = (msg) => {
    setOpen(true);
    setData(msg);
  };
  const handleClose = () => {
    setOpen(false);
    setData("");
  };

  const handleOpenJsonModal = (jsonResponse) => {
    setJsonData(jsonResponse);
    setJsonModalOpen(true);
  };

  const handleCloseJsonModal = () => {
    setJsonModalOpen(false);
    setJsonData(null);
  };

  const fetchAllData = async () => {
    const allData = [];
    const pageSize = 1000;
    let currentPage = 1;
    let totalCount = 0;

    const baseParameters = {
      search: searchValue,
      limit: pageSize,
      startDate: fromDate,
      endDate: toDate,
      cinemaId: selectedCinema === "All" ? "" : selectedCinema,
      paymentStatus: paymentStatus === "All" ? "" : paymentStatus,
      bookingStatus: bookingStatus === "All" ? "" : bookingStatus,
    };

    // First request
    const firstResponse = await PagesIndex.DataService.post(
      PagesIndex.Api.GET_FAILED_BOOKINGS_DETAILS,
      { ...baseParameters, page: currentPage }
    );

    const data = firstResponse.data.data || [];
    totalCount = firstResponse.data.totalCount || 0;

    const totalPages = Math.ceil(totalCount / pageSize);
    allData.push(...data);

    // Fetch remaining pages
    while (currentPage < totalPages) {
      currentPage += 1;

      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.GET_FAILED_BOOKINGS_DETAILS,
        { ...baseParameters, page: currentPage }
      );

      allData.push(...(response.data.data || []));
    }

    return allData;
  };

  const handleExport = async () => {
    setIsExporting(true);
    const allData = await fetchAllData();
    generateExcel(allData);
  };

  const generateExcel = async (allData) => {
    const headers = [
      "Cinema Name",
      "User Details",
      "Order Id",
      "Booking Id",
      "Ticket Amount",
      "F&B Amount",
      "Convenience Fee",
      "Membership Discount",
      "GST",
      "Total Amount",
      "Payment Status",
      "Booking Status",
      "Date",
    ];

    const getFailedBookings = (allData = []) => {
      return allData
        .filter((item) => {
          // Payment is FAIL when NOT (true,1,true)
          const isPaymentFail = !(
            item?.paymentsStatus === true &&
            item?.status === 1 &&
            item?.commitStatus === true
          );

          // Booking is FAIL when (true,4,false)
          const isBookingFail =
            item?.paymentsStatus === true &&
            item?.status === 4 &&
            item?.commitStatus === false;

          return isPaymentFail || isBookingFail;
        })
        .map((item) => {
          const ticketTotal = item?.finalBookingCalculation?.ticketCart?.total;
          const foodTotal = item?.finalBookingCalculation?.foodCart?.total;
          const convFees =
            item?.finalBookingCalculation?.convenienceFeesObject
              ?.convenienceFees;
          const gst = item?.finalBookingCalculation?.convenienceFeesObject?.gst;
          const membershipDiscount =
            item?.finalBookingCalculation?.ticketCart?.membershipDiscount;
          const responseAmt = item?.paymentResponse?.amount;

          return {
            cinema_name: item?.cinemaData?.cinemaName || "-",

            User_details: `${item?.userData?.firstName || ""} ${
              item?.userData?.lastName || ""
            } ${item?.userData?.email || ""} ${
              item?.userData?.mobileNumber || ""
            }`.trim(),

            Transaction_id: item?.initTransId || "-",
            Booking_id: item?.addSeatData?.strBookId || "-",

            ticket_amount: ticketTotal
              ? Number(ticketTotal).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })
              : "-",

            fandBAmount: foodTotal
              ? Number(foodTotal).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })
              : "-",

            ConvenienceFee: convFees
              ? Number(convFees).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })
              : "-",

            membershipDiscount: membershipDiscount
              ? Number(membershipDiscount).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })
              : "-",

            gst: gst
              ? Number(gst).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })
              : "-",

            total_amountincTax:
              responseAmt && !isNaN(parseFloat(responseAmt))
                ? Number(responseAmt).toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })
                : "-",

            // According to your logic
            Payment_status:
              item?.paymentsStatus === true &&
              item?.status === 1 &&
              item?.commitStatus === true
                ? "Success"
                : "Fail",

            Booking_status:
              item?.paymentsStatus === true &&
              item?.status === 4 &&
              item?.commitStatus === false
                ? "Fail"
                : "Success",

            Date: item?.createdAt
              ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
              : "-",
          };
        });
    };

    const rows = getFailedBookings(allData);

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction");

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `Transaction_history_${PagesIndex.moment().format("DD-MM-YYYY")}.xlsx`,
      { compression: true }
    );
    setIsExporting(false);
  };

  // const filterMovie = (data) => {
  //   let resultMovie = bookingsList;

  //   if (fromDate && toDate) {
  //     const startDate = PagesIndex.moment(fromDate);
  //     const endDate = PagesIndex.moment(toDate);

  //     resultMovie = resultMovie.filter((item) => {
  //       const itemDate = PagesIndex.moment(item?.createdAt);
  //       return (
  //         itemDate.isSameOrAfter(startDate, "day") &&
  //         itemDate.isSameOrBefore(endDate, "day")
  //       );
  //     });
  //   }

  //   if (data && data !== "") {
  //     resultMovie = resultMovie.filter((item) => {
  //       if (data === "Shipped") {
  //         return item?.paymentsStatus == true && item.commitStatus == true;
  //       } else if (data === "Aborted") {
  //         return item?.status == 0;
  //       } else if (data === "Unsuccessfull") {
  //         return (
  //           item?.status !== 0 && !item.paymentsStatus && !item.commitStatus
  //         );
  //       }
  //       return true;
  //     });
  //   }

  //   setFilteredData(resultMovie);
  //   setCurrentPage(0);
  // };
  const handleFilter = () => {
    if (bookingStatus || paymentStatus || selectedCinema || searchValue)
      setIsBtnLoading(true);

    getBookingsList();
  };

  const debounce = useEffect(() => {
    getBookingsList();
  }, [
    // fromDate,
    // toDate,
    // searchValue,
    dateRange,
    currentPage,
    rowsPerPage,
    // bookingStatus,
    // paymentStatus,
    // selectedCinema,
  ]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("transaction_view")
  ) {
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
                    {/* <a href={`${API_ENDPOINT}/admin/all-bookings`} download> */}
                    {/* <Index.Box className="common-button blue-button res-blue-button ">
                      <Index.Button
                        variant="contained"
                        className="no-text-decoration"
                        disabled={!filteredData.length || isExporting}
                        onClick={() => handleExport()}
                        endIcon={
                          isExporting ? (
                            <Index.CircularProgress
                              size={"18px"}
                              sx={{ color: "#84818a" }}
                            />
                          ) : null
                        }
                      >
                        {isExporting ? "Exporting..." : "Export excel"}
                      </Index.Button>
                    </Index.Box> */}
                    {/* </a> */}
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
                    Vista Logs
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="max-table-dash-scroll page-table-main">
              <Index.TableContainer
                component={Index.Paper}
                className="table-container"
              >
                <Index.Table
                  aria-label="simple table"
                  className="table-design-main one-line-table region-manage-table"
                >
                  <Index.TableHead>
                    <Index.TableRow>
                      <Index.TableCell width="15%">Type</Index.TableCell>
                      <Index.TableCell width="15%">Date</Index.TableCell>
                      <Index.TableCell width="15%">Time</Index.TableCell>
                      <Index.TableCell width="12%">URL</Index.TableCell>
                      <Index.TableCell width="12%">Response</Index.TableCell>

                      <Index.TableCell width="8%">Status</Index.TableCell>
                      <Index.TableCell width="8%">
                        Transaction ID
                      </Index.TableCell>
                      <Index.TableCell width="15%">Action</Index.TableCell>
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
                          <Index.CircularProgress size={"20px"} />
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableBody>
                  ) : (
                    <Index.TableBody>
                      {filteredData?.length ? (
                        filteredData?.map((item, index) => {
                          return (
                            <Index.TableRow
                              className="inquiry-list"
                              key={item?._id}
                              onClick={() => handleOpen(item)}
                            >
                              <Index.TableCell>
                                {item?.type || "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                <>
                                  {moment(item?.date).format("DD/MM/YYYY") ||
                                    "-"}
                                  <br />
                                </>
                              </Index.TableCell>

                              <Index.TableCell>
                                {moment(item?.date).format("HH:mm:ss") || "-"}
                                <br />{" "}
                              </Index.TableCell>

                              <Index.TableCell className="table-td">
                                {item?.url || "-"}
                              </Index.TableCell>

                              <Index.TableCell className="">
                                {item?.status === true ? (
                                  <span className="status-green">
                                    {" "}
                                    Success{" "}
                                  </span>
                                ) : (
                                  <span className="status-red"> Fail </span>
                                )}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.paymentResponse?.amount &&
                                !isNaN(
                                  parseFloat(item?.paymentResponse?.amount)
                                )
                                  ? parseFloat(
                                      item?.paymentResponse?.amount
                                    ).toLocaleString("en-IN", {
                                      style: "currency",
                                      currency: "INR",
                                    })
                                  : "-"}
                              </Index.TableCell>

                              <Index.TableCell>255784749</Index.TableCell>

                              <Index.TableCell>
                                <Index.Box className="action-buttons-group">
                                  {/* <Index.IconButton
                                    onClick={() => handleOpen(item)}
                                  >
                                    <Index.Visibility />
                                  </Index.IconButton> */}


                                  <Index.IconButton
                                    onClick={() =>
                                      handleOpenJsonModal(
                                        item?.paymentResponse || item
                                      )
                                    }
                                    // onClick={() => handleViewProduct(item?._id)}
                                  >
                                    <Index.Visibility />
                                  </Index.IconButton>
                                </Index.Box>
                              </Index.TableCell>
                            </Index.TableRow>
                          );
                        })
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
                      count={count}
                      page={currentPage - 1}
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
                <Index.Box
                  role="presentation"
                  className="common-drawer-details"
                >
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
                              {/* <Index.Box className="common-btn-details">
                                <Index.Box className="flex-gap-footer end-justify-content">
                                  <Index.Button
                                    className="btn-secondary"
                                    // disabled={!toDate || !fromDate}
                                    onClick={() => clearFilters()}
                                  >
                                    Clear
                                  </Index.Button>
                                </Index.Box>
                              </Index.Box> */}
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
                                      value={
                                        fromDate
                                          ? PagesIndex.dayjs(fromDate)
                                          : null
                                      }
                                      slotProps={{
                                        textField: {
                                          readOnly: true,
                                          error: false,
                                        },
                                      }}
                                      maxDate={PagesIndex.dayjs(
                                        PagesIndex.moment().format("YYYY-MM-DD")
                                      )}
                                      minDate={PagesIndex.dayjs("2022-01-01")}
                                      onChange={(date) => {
                                        clearPrams();
                                        setFromDate(
                                          PagesIndex.moment(date?.$d).format(
                                            "YYYY-MM-DD"
                                          )
                                        );
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
                                      value={
                                        toDate ? PagesIndex.dayjs(toDate) : null
                                      }
                                      onChange={(date) => {
                                        clearPrams();

                                        setToDate(
                                          PagesIndex.moment(date?.$d).format(
                                            "YYYY-MM-DD"
                                          )
                                        );
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
                                          error: false,
                                        },
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
                              <Index.Box className="input-box modal-input-box">
                                <Index.FormHelperText className="form-lable bold-label-common">
                                  Search
                                </Index.FormHelperText>
                                <Index.Box className="form-group date-picker">
                                  <Index.TextField
                                    fullWidth
                                    className="form-control"
                                    placeholder="Search by booking id, order id & user details..."
                                    value={searchValue}
                                    onChange={handleInputChange}
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                          </Index.Grid>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>

                    <Index.Box className="drawer-footer">
                      <Index.Box className="common-btn-details">
                        <Index.Box className="flex-gap-footer end-justify-content blue-button common-button">
                          <Index.Button
                            className="btn-secondary"
                            // disabled={!toDate || !fromDate}
                            disabled={isBtnLoading}
                            onClick={() => clearFilters()}
                          >
                            Clear
                          </Index.Button>
                          <Index.Button
                            disabled={isBtnLoading}
                            onClick={handleFilter}
                          >
                            Submit
                          </Index.Button>

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
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal"
        >
          <Index.Box
            sx={style}
            className="modal-inner-main add-role-modal modal-inner"
          >
            <Index.Box className="modal-header">
              <Index.Typography
                id="modal-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
              >
                View Details
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleClose}
              />
            </Index.Box>
            <Index.Box className="modal-body">
              <Index.Box className="booking-detail-inner">
                <Index.Box className="booking-detail-img">
                  <img
                    src={
                      data?.movieData?.poster
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.movieData?.poster}`
                        : PagesIndex.Png.NoImageAvailable
                    }
                    onClick={handleClose}
                    alt=""
                  />
                  <Index.Box className="booking-detail-id">
                    <Index.Typography className="booking-detail-id-value">
                      {data?.addSeatData?.strBookId
                        ? data?.addSeatData?.strBookId
                        : data?.addSeatData || "-"}
                    </Index.Typography>
                    <Index.Typography className="booking-detail-id-label">
                      (Booking Id)
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="booking-detail-right">
                  <Index.Box className="log-data">
                    <Index.Box className="log-title">
                      Payment Response:
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Transaction Id :
                      </Index.Box>{" "}
                      {data?.initTransId}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Amount :
                      </Index.Box>{" "}
                      {item?.paymentResponse?.amount ? parseFloat(item?.paymentResponse?.amount).toFixed(2) : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Payment Method :
                      </Index.Box>{" "}
                      {data?.paymentResponse?.method
                        ? data?.paymentResponse?.method
                            ?.charAt(0)
                            .toUpperCase() +
                          data?.paymentResponse?.method?.slice(1).toLowerCase()
                        : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Order Id :
                      </Index.Box>{" "}
                      {data?.paymentResponse?.order_id
                        ? data?.paymentResponse?.order_id
                        : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Payment Id :
                      </Index.Box>{" "}
                      {data?.paymentResponse?.id}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Payment Status :
                      </Index.Box>{" "}
                      {data?.paymentResponse?.status
                        ? data?.paymentResponse?.status
                            ?.charAt(0)
                            .toUpperCase() +
                          data?.paymentResponse?.status?.slice(1).toLowerCase()
                        : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Device Type :
                      </Index.Box>{" "}
                      {data?.bookedFrom || "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Modal>

        <Index.Modal
          open={jsonModalOpen}
          onClose={handleCloseJsonModal}
          aria-labelledby="json-modal-title"
          className="modal"
        >
          <Index.Box
            sx={style}
            className="modal-inner-main add-role-modal modal-inner json-modal"
          >
            <Index.Box className="modal-header">
              <Index.Typography
                id="json-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
              >
                JSON Response
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleCloseJsonModal}
              />
            </Index.Box>
            <Index.Box className="modal-body json-modal-body">
              <Index.Box className="json-response-container">
                <pre
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "15px",
                    borderRadius: "4px",
                    overflow: "auto",
                    maxHeight: "500px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    border: "1px solid #ddd",
                  }}
                >
                  {JSON.stringify(jsonData, null, 2)}
                </pre>
              </Index.Box>
            </Index.Box>
            <Index.Box
              className="modal-footer"
              style={{ padding: "15px", textAlign: "right" }}
            >
              <Index.Button
                variant="contained"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(jsonData, null, 2)
                  );
                  PagesIndex.toast.success("JSON copied to clipboard!");
                }}
                style={{
                  marginRight: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Copy JSON
              </Index.Button>
              <Index.Button
                onClick={handleCloseJsonModal}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Close
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Modal>
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default VistaLogs;
