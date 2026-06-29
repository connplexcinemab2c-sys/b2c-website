import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./BookingManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
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

const BookingManagement = () => {
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [bookingsList, setBookingsList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [count, setCount] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [cinemaList, setCinemaList] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [reloadList, setReloadList] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpen = (msg) => {
    setOpen(true);
    setData(msg);
  };
  const handleClose = () => {
    setOpen(false);
    setData("");
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // Search on table

  // const handleInputChange = (e) => {
  //   const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
  //   setSearchValue(newValue);
  //   // requestSearch(newValue);
  // };

  const handleInputChange = debounce((value) => {
    setSearchValue(value);
    setCurrentPage(1);
  }, 800);

  // Drawer open function
  useEffect(() => {
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

  const getBookingsList = () => {
    setLoading(true);
    const data = {
      page: currentPage,
      search: searchValue,
      limit: rowsPerPage,
      ...(!!fromDate ? { startDate: fromDate } : {}),
      ...(!!toDate ? { endDate: toDate } : {}),
      ...(!!selectedMovie && selectedMovie !== "All"
        ? { movieId: selectedMovie }
        : {}),
      ...(!!selectedCinema && selectedCinema !== "All"
        ? { cinemaId: selectedCinema }
        : {}),
      showAbortedTransaction: "No"
    };
    PagesIndex.DataService.post(PagesIndex.Api.GET_BOOKINGS_DETAILS, data)
      .then((res) => {
        setBookingsList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setCount(res?.data?.totalCount);
        setLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);

        setLoading(false);
      });
  };

  const downloadTxtFile = (log, bookingInfo) => {
    const getContent = () => {
      if (log?.paymentFailed) return bookingInfo?.paymentResponse;
      if (log?.ticketFailed) return bookingInfo?.vistaErrorResponse;
      return {};
    };

    const fileName = log?.paymentFailed
      ? `${bookingInfo?.initTransId}_Payment_failed.txt`
      : `${bookingInfo?.initTransId}_Vista_failed.txt`;

    const textContent = JSON.stringify(getContent(), null, 2);

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  const getLogKey = (log) => {
    if (log?.initBooking) return "Started Booking";
    if (log?.addSeat) return "Added Seat";
    if (log?.proceedToPay) return "Clicked on Proceed to Pay";
    if (log?.paymentSuccess) return "Payment Response";
    if (log?.ticketBooked) return "Vista Response";
    if (log?.paymentFailed) return "Payment Response";
    if (log?.ticketFailed) return "Vista Response";
    return "";
  };

  const handleFilter = () => {
    setCurrentPage(1);
    getBookingsList();
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSelectedMovie("");
    setSelectedCinema("");
    setReloadList((prev) => !prev);
  };

   useEffect(() => {
    getBookingsList();
  }, [searchValue, currentPage, rowsPerPage, reloadList]);

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
    getCinemaList();
    getMoviesList();
  }, []);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("bookings_view")
  ) {
    return (
      <>
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
                    Bookings
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
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

            <Index.Box className="page-table-main booking-table-main">
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
                      <Index.TableCell width="7%">Image</Index.TableCell>
                      <Index.TableCell width="15%">
                        Movie & Show
                      </Index.TableCell>
                      <Index.TableCell width="10%">
                        Foods & Beverages
                      </Index.TableCell>
                      <Index.TableCell width="10%">
                        User Details
                      </Index.TableCell>
                      <Index.TableCell width="10%">
                        Discount (Offer)
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
                        filteredData?.map((item, index) => (
                          <Index.TableRow
                            className="inquiry-list"
                            key={item?._id}
                            onClick={() => handleOpen(item)}
                          >
                            <Index.TableCell>
                              <Index.Box className="vertical-img-box">
                                <img
                                  src={
                                    item?.movieData?.poster
                                      ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.movieData?.poster}`
                                      : PagesIndex.Png.NoImageAvailable
                                  }
                                  onClick={handleClose}
                                  alt=""
                                  className="vertical-img"
                                />
                              </Index.Box>
                            </Index.TableCell>
                            <Index.TableCell>
                              <b>{item?.movieData?.name}</b> <br></br>
                              {`${PagesIndex.moment(
                                item?.showData?.sessionRealShow
                              ).format("MMM DD, YYYY hh:mm A")}`}
                              <br></br>
                              {item?.cinemaData?.cinemaName}
                              <br></br>
                              {item?.showData?.screenName} -{" "}
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
                              <b>Total Ticket Amount :</b>{" "}
                              {item?.finalBookingCalculation?.ticketCart?.ticketTotal?.toLocaleString(
                                "en-IN",
                                {
                                  style: "currency",
                                  currency: "INR",
                                }
                              ) || "0.00"}
                              <br></br>
                              <b>Total Paid Amount :</b>{" "}
                              {item?.paymentResponse?.amount ? (item?.paymentResponse?.amount)?.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }) : "-"}
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
                            <Index.TableCell>
                              {item?.userData?.firstName &&
                                `${item?.userData?.firstName} ${item?.userData?.lastName}`}
                              <br></br>
                              {item?.userData?.email && item?.userData?.email}
                              {item?.userData?.email && <br></br>}
                              {item?.userData?.mobileNumber &&
                                item?.userData?.mobileNumber}
                            </Index.TableCell>
                            <Index.TableCell>
                              {
                                item?.finalBookingCalculation?.totalDiscount > 0 &&
                              <Index.Box>
                                <b>Coupon</b>
                                <br></br>
                                Ticket : {" "}
                                {item?.finalBookingCalculation?.totalDiscount
                                  ? item?.finalBookingCalculation?.totalDiscount
                                  : 0}
                                <br></br>
                                F&B : {" "}0<br></br>
                              </Index.Box>
                          }
                          {
                            item?.finalBookingCalculation?.ticketCart?.membershipDiscount > 0 &&
                              <Index.Box>
                                <b>Membership</b>
                                <br></br>
                                Ticket : {" "}
                                - ₹{item?.finalBookingCalculation?.ticketCart
                                  ?.membershipDiscount
                                  ? item?.finalBookingCalculation?.ticketCart?.membershipDiscount.toFixed(
                                      2
                                    )
                                  : 0}
                                <br></br>
                              </Index.Box>
  }
  {
    item?.finalBookingCalculation?.rewardCoinsRedeemed > 0 && 
                               <Index.Box>
                                <b>Reward</b>
                                <br></br>
                                 Redeemed : {" "}
                                {`${item?.finalBookingCalculation?.rewardCoinsRedeemed} pts` || 0}
                                <br></br>
                                 Discount : {" "}
                                - ₹{item?.finalBookingCalculation?.rewardDiscount.toFixed(2) || 0}
                                <br></br>
                               
                              </Index.Box>
                      }
                            </Index.TableCell>
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
                                <span className="status-green">Shipped</span>
                              ) : (
                                <span className="status-red">
                                  Unsuccessfull
                                </span>
                              )}
                            </Index.TableCell> */}
                            <Index.TableCell align="right">
                              <Index.IconButton onClick={handleOpen}>
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
                                    // disableClearable
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
                                      } else {
                                        setSelectedMovie(
                                          // value?._id || ""
                                          value?.uniqueFilmCode || ""
                                        );
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
                                        setToDate(
                                          PagesIndex.moment(date?.$d).format(
                                            "YYYY-MM-DD"
                                          )
                                        );
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
                            disabled={loading}
                          >
                            Clear
                          </Index.Button>
                          <Index.Button
                            disabled={loading}
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
          <Index.Box sx={style} className="modal-inner-main booking-view-modal">
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
              <Index.Box className="booking-detail-main">
                <Index.Box className="booking-details-img-flex">
                  <img
                    src={
                      data?.movieData?.poster
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.movieData?.poster}`
                        : PagesIndex.Png.NoImageAvailable
                    }
                    onClick={handleClose}
                    alt=""
                    className="booking-details-img"
                  />
                  <Index.Box className="booking-details-wrapper">
                    {data?.addSeatData?.strBookId ? (
                      <Index.Box className="view-details-heighlight-box">
                        <Index.Typography className="view-details-heighlight-lable">
                          {data?.addSeatData?.strBookId
                            ? data?.addSeatData?.strBookId
                            : data?.addSeatData || "-"}
                        </Index.Typography>
                        <Index.Typography className="view-details-heighlight-value">
                          (Booking Id)
                        </Index.Typography>
                      </Index.Box>
                    ) : (
                      ""
                    )}

                    <Index.Box className="view-details-wrapper">
                      <Index.Box className="sub-title-box">
                        <Index.Box className="sub-title">
                          Payment Response:
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="view-details-main">
                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Transaction Id
                          </Index.Typography>{" "}
                          <Index.Typography className="view-details-value">
                            {data?.initTransId}
                          </Index.Typography>
                        </Index.Box>

                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Amount
                          </Index.Typography>
                          <Index.Typography className="view-details-value">
                            {data?.paymentResponse?.amount ? parseFloat(data?.paymentResponse?.amount).toFixed(2) : "-"}
                          </Index.Typography>
                        </Index.Box>

                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Payment Method
                          </Index.Typography>{" "}
                          <Index.Typography className="view-details-value">
                            {data?.paymentResponse?.method
                              ? data?.paymentResponse?.method
                                  ?.charAt(0)
                                  .toUpperCase() +
                                data?.paymentResponse?.method
                                  ?.slice(1)
                                  .toLowerCase()
                              : data?.paymentResponse?.payment_mode
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  data?.paymentResponse?.payment_mode
                                    ?.slice(1)
                                    .toLowerCase() || "N/A"}
                          </Index.Typography>
                        </Index.Box>

                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Order Id
                          </Index.Typography>{" "}
                          <Index.Typography className="view-details-value">
                            {data?.paymentResponse?.order_id || "N/A"}
                          </Index.Typography>
                        </Index.Box>

                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Payment Status
                          </Index.Typography>{" "}
                          <Index.Typography className="view-details-value">
                            {data?.paymentResponse?.status
                              ? data?.paymentResponse?.status
                                  ?.charAt(0)
                                  .toUpperCase() +
                                data?.paymentResponse?.status
                                  ?.slice(1)
                                  .toLowerCase()
                              : data?.paymentResponse?.order_status
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  data?.paymentResponse?.order_status
                                    ?.slice(1)
                                    .toLowerCase() || "N/A"}
                          </Index.Typography>
                        </Index.Box>

                        <Index.Box className="view-details-box">
                          <Index.Typography className="view-details-lable">
                            Device Type
                          </Index.Typography>{" "}
                          <Index.Typography className="view-details-value">
                            {data?.bookedFrom || "-"}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>

              <Index.Box className="view-booking-table-main page-table-main">
                <Index.Box className="sub-title-box">
                  <Index.Box className="sub-title">Activity Log</Index.Box>
                </Index.Box>
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table aria-label="simple table" className="table">
                    <Index.TableHead className="table-head">
                      <Index.TableRow className="table-row">
                        <Index.TableCell
                          component="th"
                          variant="th"
                          className="table-th"
                          width="20%"
                        >
                          Timing
                        </Index.TableCell>

                        <Index.TableCell
                          component="th"
                          variant="th"
                          className="table-th"
                          width="80%"
                        >
                          Actions
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableHead>
                    <Index.TableBody className="table-body">
                      {data?.logs?.length ? (
                        data.logs.map((log, index) => {
                          const key = getLogKey(log);

                          return (
                            <Index.TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <Index.TableCell
                                component="td"
                                variant="td"
                                className="table-td"
                              >
                                <Index.Typography className="admin-table-data-text">
                                  {PagesIndex.moment(
                                    Object.values(log)[0]
                                  ).format("hh:mm:ss A")}
                                </Index.Typography>
                              </Index.TableCell>

                              <Index.TableCell
                                component="td"
                                variant="td"
                                className="table-td"
                              >
                                <Index.Box className="download-btn-flex">
                                  <Index.Typography className="admin-table-data-text">
                                    {key}
                                  </Index.Typography>
                                  {(log?.paymentFailed ||
                                    log?.ticketFailed) && (
                                    <Index.DownloadIcon
                                      onClick={() => downloadTxtFile(log, data)}
                                      sx={{
                                        cursor: "pointer",
                                        color: "#795548",
                                      }}
                                    />
                                  )}
                                </Index.Box>
                              </Index.TableCell>
                            </Index.TableRow>
                          );
                        })
                      ) : (
                        <Index.TableRow
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <Index.TableCell
                            component="td"
                            variant="td"
                            className="table-td"
                            colSpan={5}
                            align="center"
                          >
                            No log found
                          </Index.TableCell>
                        </Index.TableRow>
                      )}
                    </Index.TableBody>
                  </Index.Table>
                </Index.TableContainer>
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

export default BookingManagement;
