import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./BookingManagementReport.css";
import moment from "moment";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { Drawer } from "@mui/material";
import { toast } from "react-toastify";
import { debounce } from "lodash";

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

const BookingManagementReport = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );
  const dispatch = useDispatch();
  const initialValues = {
    fromDate: "",
    toDate: "",
  };

  const [bookingsList, setBookingsList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterDataList, setFilterDataList] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState(0);
  const [cinemaList, setCinemaList] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedCinemaName, setSelectedCinemaName] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedMovieName, setSelectedMovieName] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [isBtnLoading, setIsBtnLoading] = useState(false); // To track if data is being fetched
  const [isReporting, setIsReporting] = useState(false); // To track if data is being fetched
  const [reloadList, setReloadList] = useState(false);
  //
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
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const bookingListTable = () => {
    // setLoading(true);
    // PagesIndex.DataService.post(PagesIndex.Api.GET_BOOKINGS_DETAILS_REPORT)
    //   .then((res) => {
    //     setFilterDataList(res?.data?.data);
    //     setBookingsList(res?.data?.data);
    //     setTimeout(() => {
    //       setLoading(false);
    //       setIsBtnLoading(false);
    //     }, 1500);
    //   })
    //   .catch((err) => {
    //     setTimeout(() => {
    //       setLoading(false);
    //       setIsBtnLoading(false);
    //     }, 1500);
    //   });
    // setSelectedCinema("");
    // setSelectedCinemaName("");
    // setSelectedMovie("");
    // setSelectedMovieName("");
  };
  const getBookingsList = () => {
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append(
      "fromDate",
      fromDate && moment(fromDate).format("YYYY-MM-DD")
    );
    formData.append("toDate", toDate && moment(toDate).format("YYYY-MM-DD"));
    formData.append("cinema", selectedCinema == "All" ? "" : selectedCinema);
    formData.append("movie", selectedMovie == "All" ? "" : selectedMovie);
    formData.append("search", searchValue);
    formData.append("page", currentPage + 1);
    formData.append("limit", rowsPerPage);
    PagesIndex.DataService.post(
      PagesIndex.Api.GET_BOOKINGS_DETAILS_REPORT,
      formData
    )
      .then((res) => {
        setBookingsList(res?.data?.data);
        setFilterDataList(res?.data?.data);
        setTotal(res?.data?.pagination?.total);

        setTimeout(() => {
          setLoading(false);
          setIsBtnLoading(false);
        }, 1500);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setTimeout(() => {
          setLoading(false);
          setIsBtnLoading(false);
        }, 1500);
      });
  };
  const handleOpen = (msg) => {
    setOpen(true);
    setData(msg);
  };
  const handleClose = () => {
    setOpen(false);
    setData("");
  };

  const generateExcel = async () => {
    const headers = [
      "Init_TransId",
      "Bkg_Id",
      "Bkg_Commit",
      "Pay_Status",
      "Trans_Date",
      "Cinema_Name",
      "Movie_Name",
      "Cinema_RefCode",
      "Screen_Number",
      "Event_Name",
      "Show_Date_Disp",
      "Ticketwise_Qty",
      "Seat_Info",
      "Area_Category",
      "Ticket_Qty",
      "Ticket_Amt",
      "Item_Desc",
      "ItemWise_Qty",
      "ItemWise_Amt",
      "Inv_Qty",
      "Inv_Amt",
      "Additional_Desc",
      "Add_strAmt",
      "Add_Charges",
      "Cust_Emailid",
      "Cust_MobileNo",
      "BinExists",
      "devicetype",
    ];
    setIsBtnLoading(true);
    const formData = new URLSearchParams();
    formData.append(
      "fromDate",
      fromDate && moment(fromDate).format("YYYY-MM-DD")
    );
    formData.append("toDate", toDate && moment(toDate).format("YYYY-MM-DD"));
    formData.append("cinema", selectedCinema == "All" ? "" : selectedCinema);
    formData.append("movie", selectedMovie == "All" ? "" : selectedMovie);
    formData.append("search", searchValue);
    formData.append("exportSheet", "true");
    PagesIndex.DataService.post(
      PagesIndex.Api.GET_BOOKINGS_DETAILS_REPORT,
      formData
    )
      .then((res) => {
        const rows = res?.data?.data?.map((item) => ({
          initTransId: item?.initTransId ? item?.initTransId : "-",
          bookingId: item?.addSeatData?.strBookId
            ? item?.addSeatData?.strBookId
            : "-",
          commitStatus: item?.commitStatus ? "Success" : "Fail",
          paymentsStatus: item?.paymentsStatus ? "Success" : "Fail",
          transDate: item?.paymentResponse?.trans_date
            ? item?.paymentResponse?.trans_date
            : PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A"),
          cinemaName: item?.cinemaId?.displayName
            ? item?.cinemaId?.displayName
            : "-",
          movieName: item?.movieId?.name ? item?.movieId?.name : "-",
          cinemaRefCode: "-",
          screenName: item?.showId?.screenName ? item?.showId?.screenName : "-",
          eventName: "-",
          showDate: item?.showId?.sessionRealShow
            ? `${PagesIndex.moment(item?.showId?.sessionRealShow).format(
                "MMM DD, YYYY hh:mm A"
              )}`
            : "-",
          // ticketWiseQty: item?.addSeatData?.strSeatInfo
          //   ? item?.addSeatData?.strSeatInfo?.split("-")[1]?.trim()?.split(",")
          //       .length
          //   : "-",
          ticketWiseQty: item?.commitBookingData?.strSeatInfo
            ? item?.commitBookingData?.strSeatInfo
                ?.split("-")[1]
                ?.trim()
                ?.split(",").length
            : "-",
          // seatInfo: item?.addSeatData?.strSeatInfo
          //   ? item?.addSeatData?.strSeatInfo
          //   : "-",
          seatInfo: item?.commitBookingData?.strSeatInfo
            ? item?.commitBookingData?.strSeatInfo
            : "-",
          areaCat: "-",
          // ticketQty: item?.addSeatData?.strSeatInfo
          //   ? item?.addSeatData?.strSeatInfo?.split("-")[1]?.trim()?.split(",")
          //       .length
          //   : "-",
          ticketQty: item?.commitBookingData?.strSeatInfo
            ? item?.commitBookingData?.strSeatInfo
                ?.split("-")[1]
                ?.trim()
                ?.split(",").length
            : "-",
          // ticketPrice: item?.addSeatData?.curTicketsTotal
          //   ? item?.addSeatData?.curTicketsTotal /
          //     item?.addSeatData?.strSeatInfo?.split("-")[1]?.trim()?.split(",")
          //       .length
          //   : "-",
          ticketPrice: item?.commitBookingData?.curTicketsTotal
            ? item?.commitBookingData?.curTicketsTotal /
              item?.commitBookingData?.strSeatInfo
                ?.split("-")[1]
                ?.trim()
                ?.split(",").length
            : "-",
          Item_Desc: "-",
          ItemWise_Qty: "-",
          ItemWise_Amt: "-",
          Inv_Qty: "-",
          Inv_Amt: item?.finalBookingCalculation?.finalAmount || "-",
          Additional_Desc: "-",
          Add_strAmt: "-",
          Add_Charges:
            item?.finalBookingCalculation?.convenienceFeesObject?.total || "-",
          Cust_Emailid: item?.userId?.email ? item?.userId?.email : "-",
          Cust_MobileNo: item?.userId?.mobileNumber
            ? item?.userId?.mobileNumber
            : "-",
          BinExists: "-",
          devicetype: item?.bookedFrom ? item?.bookedFrom : "-",
        }));
        const workbook = PagesIndex.XLSX.utils.book_new();
        const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

        worksheet["!cols"] = Object.keys(rows[0])?.map((item) => {
          return {
            width: 15,
          };
        });
        PagesIndex.XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Booking report"
        );

        // customize header names
        PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

        let fileName =
          selectedCinema && selectedMovie
            ? `${selectedCinemaName.replace(
                /[^A-Z0-9]/gi,
                "_"
              )}_${selectedMovieName.replace(
                /[^A-Z0-9]/gi,
                "_"
              )}_${PagesIndex.moment().format(
                "DD-MM-YYYY"
              )}_Booking_report.xlsx`
            : `Booking_report_${PagesIndex.moment().format("DD-MM-YYYY")}.xlsx`;

        PagesIndex.XLSX.writeFile(workbook, fileName, { compression: true });
        setIsBtnLoading(false);
      })
      .catch((err) => {})
      .finally(() => setIsBtnLoading(false));
  };

  const generateSalesReportExcel = async () => {
    setIsReporting(true);

    const formData = new URLSearchParams();
    formData.append("fromDate", moment(fromDate).format("YYYY-MM-DD"));
    formData.append("toDate", moment(toDate).format("YYYY-MM-DD"));

    PagesIndex.DataService.post(PagesIndex.Api.GENERATE_SALES_REPORT, formData)
      .then((res) => {
        const report = res?.data?.report;

        const rows = [
          { "Website Report": "Sales Total", Value: report?.salesTotal || 0 },
          { "Website Report": "Discount", Value: report?.discountTotal || 0 },
          {
            "Website Report": "Convenience Fees",
            Value: report?.convenienceFees || 0,
          },
          {
            "Website Report": "Transactions Shipped",
            Value: report?.shipped || 0,
          },
          {
            "Website Report": "Transactions Failed",
            Value: report?.failed || 0,
          },
          {
            "Website Report": "Payment Success but Booking Failed",
            Value: report?.paymentSuccessBookingFailed || 0,
          },
          {
            "Website Report": "Total Transactions",
            Value: report?.totalTransactions || 0,
          },
        ];

        const workbook = PagesIndex.XLSX.utils.book_new();
        const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

        worksheet["!cols"] = [{ width: 40 }, { width: 20 }];

        PagesIndex.XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Sales Summary"
        );

        const fileName = `Sales_Report_${moment(fromDate).format(
          "DD-MM-YYYY"
        )}_to_${moment(toDate).format("DD-MM-YYYY")}.xlsx`;

        PagesIndex.XLSX.writeFile(workbook, fileName, { compression: true });
      })
      .catch((err) => {
        console.error("Sales Excel Error", err);
      })
      .finally(() => setIsReporting(false));
  };

  const handleInputChange = debounce((value) => {
    setSearchValue(value);
    setCurrentPage(0);
  }, 800);

  const getMoviesList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_MOVIES + "?" + new Date().getTime()
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          const movieListData = res?.data?.data
            ?.filter((data) => data?.uniqueFilmCode) // Remove entries without uniqueFilmCode
            .map((data) => ({
              ...data,
            }))
            .sort((a, b) => a?.name?.localeCompare(b?.name));
          setMovieList([...movieListData?.map((data) => ({ ...data }))]);
        }
      })
      .catch((err) => {});
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        const cinemas = res?.data?.data || [];
        const sortedCinemaList = cinemas.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );

        setCinemaList(sortedCinemaList);
        // setSelectedCinema(sortedCinemaList[0]?._id);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    bookingListTable();
    getCinemaList();
    getMoviesList();
  }, []);

  const handleFilter = () => {
    setLoading(true);
    setIsBtnLoading(true);
    setCurrentPage(0);
    getBookingsList();
  };

  const clearFilters = () => {
    setIsBtnLoading(true);
    setFromDate("");
    setToDate("");
    setSelectedMovie("");
    setSelectedCinema("");
    setSelectedMovieName("");
    setSelectedCinemaName("");
    setReloadList((prev) => !prev);
    bookingListTable();
  };

  useEffect(() => {
    getBookingsList();
  }, [currentPage, rowsPerPage, searchValue, reloadList]);

  const isDateNotSelected = !fromDate || !toDate;
const isListEmpty = !bookingsList || bookingsList.length === 0;

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("bookings_view")
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
                <Index.Box className="booking-report-content mt-manage-coupon">
                  <Index.Box className="common-button blue-button res-blue-button ">
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
                  <Index.Box className="common-button blue-button res-blue-button movie-add-btn-res">
                    <Index.Button
                      variant="contained"
                      className="no-text-decoration"
                      disabled={isReporting || isDateNotSelected || isListEmpty}

                      onClick={() => {
                        generateSalesReportExcel();
                      }}
                    >
                      Generate Report
                    </Index.Button>
                  </Index.Box>
                  <Index.Box className="common-button blue-button res-blue-button movie-add-btn-res">
                    <Index.Button
                      variant="contained"
                      className="no-text-decoration"
                      disabled={!bookingsList?.length || isBtnLoading}
                      onClick={() => {
                        generateExcel();
                      }}
                    >
                      Export excel
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
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
                    Bookings Report
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                  <Search className="search ">
                    <StyledInputBase
                      placeholder="Search"
                      inputProps={{ "aria-label": "search" }}
                      // value={searchValue}
                      onChange={(e) => {
                        handleInputChange(e.target.value);
                      }}
                    />
                  </Search>
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="page-table-main">
              <Index.TableContainer
                component={Index.Paper}
                className="table-container"
              >
                <Index.Table
                  aria-label="simple table"
                  className="table-design-main one-line-table region-manage-table custom-region-manage-table"
                >
                  <Index.TableHead>
                    <Index.TableRow>
                      <Index.TableCell width="11.46%">Image</Index.TableCell>
                      <Index.TableCell width="20%">
                        Movie & Show
                      </Index.TableCell>
                      <Index.TableCell width="20%">
                        Foods & Beverages
                      </Index.TableCell>
                      <Index.TableCell width="25%">
                        User Details
                      </Index.TableCell>
                      <Index.TableCell width="10%">Date</Index.TableCell>
                      <Index.TableCell width="10%">
                        Payment Status
                      </Index.TableCell>
                      <Index.TableCell width="10%">
                        Booking Status
                      </Index.TableCell>
                      {/* <Index.TableCell width="10%">
                        Refund Status
                      </Index.TableCell> */}
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
                          colSpan={9}
                          align="center"
                        >
                          <Index.CircularProgress size={"20px"} />
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableBody>
                  ) : (
                    <Index.TableBody>
                      {filterDataList?.length ? (
                        filterDataList?.map((item, index) => {
                          let userDetails = (
                            <>
                              {`${
                                item?.userId?.firstName +
                                  " " +
                                  item?.userId?.lastName || "-"
                              }`}
                              <br />
                              {`${item?.userId?.email || "-"}`}
                              <br />
                              {`${item?.userId?.mobileNumber || "-"}`}
                            </>
                          );

                          return (
                            <Index.TableRow
                              className="inquiry-list"
                              key={item?._id}
                              onClick={() => handleOpen(item)}
                            >
                              <Index.TableCell>
                                <Index.Box className="vertical-img-box">
                                  <img
                                    src={
                                      item?.movieId?.poster
                                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.movieId?.poster}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    className="vertical-img"
                                    onClick={handleClose}
                                    alt=""
                                  />
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell>
                                <b>{item?.movieId?.name}</b> <br></br>
                                {`${PagesIndex.moment(
                                  item?.showId?.sessionRealShow
                                ).format("MMM DD, YYYY hh:mm A")}`}
                                <br></br>
                                {item?.cinemaId?.displayName}
                                <br></br>
                                {item?.showId?.screenName} -{" "}
                                {item?.setSeatData?.strSeatInfo ||
                                  item?.addSeatData?.strSeatInfo}
                                <br></br>
                                <b>Total seat :</b>{" "}
                                {item?.setSeatData?.strSeatInfo
                                  ? item?.setSeatData?.strSeatInfo
                                      ?.split("-")[1]
                                      ?.trim()
                                      ?.split(",").length
                                  : item?.addSeatData?.strSeatInfo
                                      ?.split("-")[1]
                                      ?.trim()
                                      ?.split(",").length}
                                <br></br>
                                <b>Total Amount :</b>{" "}
                                {item?.paymentResponse?.amount ?(item?.paymentResponse?.amount)?.toLocaleString("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                }): "-"}
                                <br></br>
                                <b>Device Type :</b> {item?.bookedFrom || "-"}
                                 <br></br>
                              <b>Earned Reward :</b>{" "}
                              {item?.rewardData?.coins ? `${item?.rewardData?.coins} pts` :  "-"}
                              </Index.TableCell>
                              <Index.TableCell
                                component="td"
                                variant="td"
                                scope="row"
                                className="table-td"
                              >
                                <b>
                                  {item?.fAndBDetails?.length ? "Items:" : ""}
                                </b>
                                <br></br>
                                {item?.fAndBDetails
                                  ? item?.fAndBDetails?.map((data) => {
                                      return (
                                        <>
                                          {data?.name}(x{data?.quantity}) ₹
                                          {parseFloat(data?.price).toFixed(2)}
                                          <br></br>
                                        </>
                                      );
                                    })
                                  : "-"}
                                <br></br>
                                {item?.fAndBDetails ? (
                                  <>
                                    <b>F&B Total : </b>
                                    {item?.fAndBDetails
                                      ?.reduce(
                                        (currentValue, data) =>
                                          data?.price + currentValue,
                                        0
                                      )
                                      ?.toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                      })}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </Index.TableCell>
                              <Index.TableCell>{userDetails}</Index.TableCell>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY"
                                    )
                                  : "-"}
                                <br />
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "hh:mm A"
                                    )
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell align="center">
                                {item?.paymentsStatus ? (
                                  <span className="status-green">Shipped</span>
                                ) : (
                                  <span className="status-red">
                                    Unsuccessfull
                                  </span>
                                )}
                              </Index.TableCell>
                              <Index.TableCell align="center">
                                {item?.commitStatus ? (
                                  <span className="status-green">Shipped</span>
                                ) : (
                                  <span className="status-red">
                                    Unsuccessfull
                                  </span>
                                )}
                              </Index.TableCell>
                              {/* <Index.TableCell align="center">
                                  {item?.refundStatus ? (
                                    <span className="status-green">
                                      Shipped
                                    </span>
                                  ) : (
                                    <span className="status-red">
                                      Unsuccessfull
                                    </span>
                                  )}
                                </Index.TableCell> */}
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

            {filterDataList?.length && !loading ? (
              <Index.Box className="pagination-design flex-end">
                <Index.Stack spacing={2}>
                  <Index.Box className="pagination-count">
                    <Index.TablePagination
                      component="div"
                      count={total}
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
                              <Index.Box className="common-btn-details">
                                <Index.Box className="flex-gap-footer end-justify-content">
                                  {/* <Index.Button
                                    className="btn-secondary"
                                    onClick={() => clearFilters()}
                                    disabled={!toDate || !fromDate}
                                  >
                                    Clear
                                  </Index.Button> */}
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid
                              item
                              xs={12}
                              className="common-admin-grid-item"
                            >
                              <Index.Box className="input-box ">
                                <Index.FormHelperText className="form-lable bold-label-common">
                                  Movie
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.Autocomplete
                                    fullWidth
                                    id="movie-autocomplete"
                                    name="movies"
                                    className="cinema-auto-input custom-input"
                                    options={[
                                      {
                                        uniqueFilmCode: "All",
                                        name: "All",
                                        _id: "All",
                                      },
                                      ...(movieList || []),
                                    ]} // Add 'All' as the first option
                                    getOptionLabel={(option) =>
                                      option?.name || ""
                                    }
                                    disableClearable
                                    isOptionEqualToValue={(option, value) =>
                                      option._id === value._id
                                    }
                                    // disableCloseOnSelect
                                    value={
                                      movieList.find(
                                        (movie) =>
                                          // movie?._id === selectedMovie
                                          movie.uniqueFilmCode === selectedMovie
                                      ) || {
                                        uniqueFilmCode: "All",
                                        _id: "All",
                                        name: "All",
                                      }
                                    }
                                    onChange={(e, value) => {
                                      // If 'All' is selected, set the selected movie to 'All'
                                      // if (value?._id === "All") {
                                      if (value?.uniqueFilmCode === "All") {
                                        setSelectedMovie("All");
                                        setSelectedMovieName("All");
                                      } else {
                                        setSelectedMovie(
                                          // value?._id || ""
                                          value?.uniqueFilmCode || ""
                                        );
                                        setSelectedMovieName(value?.name || "");
                                      }
                                      // filterMovie(value?.uniqueFilmCode);
                                      // setCurrentPage(1); // Reset current page if filtering changes
                                    }}
                                    renderOption={(props, option) => (
                                      <Index.MenuItem
                                        {...props}
                                        key={option._id}
                                        sx={{
                                          fontSize: "14px",
                                          padding: "8px 16px",
                                        }}
                                      >
                                        {option.name}
                                      </Index.MenuItem>
                                    )}
                                    renderInput={(params) => (
                                      <Index.TextField
                                        {...params}
                                        placeholder="Select Movie"
                                        className="form-control"
                                      />
                                    )}
                                  />

                                  {/* <Index.Select
                                    fullWidth
                                    id="fullWidth"
                                    name="category"
                                    className="form-control"
                                    displayEmpty
                                    value={selectedMovie}
                                    onChange={(e) => {
                                      setSelectedMovie(e.target.value);
                                      filterMovie(e.target.value);
                                      let getMovieName = movieList?.filter(
                                        (item) =>
                                          item?.uniqueFilmCode == e.target.value
                                      )[0]?.name;
                                      setSelectedMovieName(
                                        getMovieName ? getMovieName : ""
                                      );
                                    }}
                                    // renderValue={
                                    //   selectedMovie
                                    //     ? undefined
                                    //     : () => "Select Movie"
                                    // }
                                    renderValue={(selected) => {
                                      if (!selected) return "All";
                                      const selectedMovieName = movieList.find(
                                        (item) =>
                                          item.uniqueFilmCode === selected
                                      )?.name;
                                      return (
                                        selectedMovieName || "Select Movie"
                                      );
                                    }}
                                  >
                                    <Index.MenuItem value={""}>
                                      All
                                    </Index.MenuItem>
                                    {movieList?.map((data) => (
                                      <Index.MenuItem
                                        key={data?._id}
                                        value={data?.uniqueFilmCode}
                                        className="menu-movie-max"
                                      >
                                        {data?.name}
                                      </Index.MenuItem>
                                    ))}
                                  </Index.Select> */}
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid
                              item
                              xs={12}
                              className="common-admin-grid-item"
                            >
                              <Index.Box className="input-box ">
                                <Index.FormHelperText className="form-lable bold-label-common">
                                  Cinema
                                </Index.FormHelperText>
                                <Index.Box className="input-box ">
                                  <Index.Box className="form-group">
                                    <Index.Autocomplete
                                      fullWidth
                                      name="cinemas"
                                      id="cinema-autocomplete"
                                      className="cinema-auto-input custom-input"
                                      options={[
                                        { _id: "All", displayName: "All" },
                                        ...(cinemaList || []),
                                      ]}
                                      disableClearable
                                      getOptionLabel={(option) =>
                                        option?.displayName || ""
                                      }
                                      isOptionEqualToValue={(option, value) =>
                                        // option.displayName === value.displayName
                                        option?._id === value?._id
                                      }
                                      // disableCloseOnSelect
                                      value={
                                        cinemaList.find(
                                          (item) => item?._id === selectedCinema
                                        ) || { _id: "All", displayName: "All" }
                                      }
                                      onChange={(e, value) => {
                                        if (value?._id === "All") {
                                          setSelectedCinema("All");
                                          setSelectedCinemaName("All");
                                        } else {
                                          setSelectedCinema(value?._id);
                                          let getCinemaName =
                                            value?.displayName;
                                          let modifyName =
                                            getCinemaName?.split("-").length > 1
                                              ? getCinemaName?.split("-")[1]
                                              : getCinemaName?.split("-")[0];

                                          setSelectedCinemaName(
                                            modifyName
                                              ? modifyName
                                                  ?.trim()
                                                  ?.replace(/[^A-Z0-9]/gi, "_")
                                              : ""
                                          );
                                        }
                                      }}
                                      renderOption={(props, option) => (
                                        <Index.MenuItem
                                          {...props}
                                          key={option._id}
                                          sx={{
                                            fontSize: "14px",
                                            padding: "8px 16px",
                                          }}
                                        >
                                          {option.displayName}
                                        </Index.MenuItem>
                                      )}
                                      renderInput={(params) => (
                                        <Index.TextField
                                          {...params}
                                          placeholder="Select Cinema"
                                          className="form-control"
                                        />
                                      )}
                                    />
                                    {/* <Index.Select
                                      fullWidth
                                      id="fullWidth"
                                      name="category"
                                      className="form-control"
                                      value={selectedCinema}
                                      displayEmpty
                                      onChange={(e) => {
                                        setSelectedCinema(e.target.value);
                                        let getCinemaName = cinemaList?.filter(
                                          (item) => item?._id == e.target.value
                                        )[0]?.displayName;
                                        let modifyName =
                                          getCinemaName?.split("-").length > 1
                                            ? getCinemaName?.split("-")[1]
                                            : getCinemaName?.split("-")[0];

                                        setSelectedCinemaName(
                                          modifyName
                                            ? modifyName
                                                ?.trim()
                                                ?.replace(/[^A-Z0-9]/gi, "_")
                                            : ""
                                        );
                                      }}
                                      // renderValue={
                                      //   selectedCinema
                                      //     ? undefined
                                      //     : () => "Select Cinema"
                                      // }
                                      renderValue={(selected) => {
                                        if (!selected) return "All";
                                        const selectedCinemaName =
                                          cinemaList.find(
                                            (item) => item?._id === selected
                                          )?.displayName;
                                        return (
                                          selectedCinemaName || "Select Cinema"
                                        );
                                      }}
                                    >
                                      <Index.MenuItem value={""}>
                                        All
                                      </Index.MenuItem>
                                      {cinemaList.map((data) => {
                                        return (
                                          <Index.MenuItem value={data?._id}>
                                            {data?.displayName}
                                          </Index.MenuItem>
                                        );
                                      })}
                                    </Index.Select> */}
                                  </Index.Box>
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
                                      id="fullWidth"
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
                                          error: false,
                                        },
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
                                      id="fullWidth"
                                      name="toDate"
                                      className="form-control"
                                      format="DD/MM/YYYY"
                                      placeholder="Add to date"
                                      slotProps={{
                                        textField: {
                                          readOnly: true,
                                          error: false,
                                        },
                                      }}
                                      value={PagesIndex.dayjs(
                                        PagesIndex.moment(toDate).format(
                                          "YYYY-MM-DD"
                                        )
                                      )}
                                      onChange={(date) => {
                                        setToDate(date?.$d);
                                      }}
                                      disabled={!fromDate}
                                      minDate={PagesIndex.dayjs(
                                        PagesIndex.moment(fromDate).format(
                                          "YYYY-MM-DD"
                                        )
                                      )}
                                      maxDate={PagesIndex.dayjs(
                                        PagesIndex.moment().format("YYYY-MM-DD")
                                      )}
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
                          </Index.Grid>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>

                    <Index.Box className="drawer-footer">
                      <Index.Box className="common-btn-details">
                        <Index.Box className="flex-gap-footer end-justify-content blue-button common-button">
                          <Index.Button
                            className="btn-secondary"
                            onClick={() => clearFilters()}
                            disabled={isBtnLoading}
                            // disabled={!toDate || !fromDate}
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
                      data?.movieId?.poster
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.movieId?.poster}`
                        : PagesIndex.Png.NoImageAvailable
                    }
                    onClick={handleClose}
                    alt=""
                  />
                  {data?.addSeatData?.strBookId ? (
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
                  ) : (
                    ""
                  )}
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
                      {data?.paymentResponse?.amount ? parseFloat(data?.paymentResponse?.amount).toFixed(2) : "-"}
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
                        : data?.paymentResponse?.payment_mode
                            ?.charAt(0)
                            .toUpperCase() +
                            data?.paymentResponse?.payment_mode
                              ?.slice(1)
                              .toLowerCase() || "N/A"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Order Id :
                      </Index.Box>{" "}
                      {data?.paymentResponse?.order_id || "N/A"}
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
                        : data?.paymentResponse?.order_status
                            ?.charAt(0)
                            .toUpperCase() +
                            data?.paymentResponse?.order_status
                              ?.slice(1)
                              .toLowerCase() || "N/A"}
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
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default BookingManagementReport;
