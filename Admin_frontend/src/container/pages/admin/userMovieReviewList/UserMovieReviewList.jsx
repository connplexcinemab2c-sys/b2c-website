import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./UserMovieReviewList.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";

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

const UserMovieReviewList = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [movieList, setMovieList] = useState([]);
  const [movieReviewbookingsList, setMovieReviewList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loadingState, setLoadingState] = useState({});
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
  const [selectedMovie, setSelectedMovie] = useState("");
  const getMoviesList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_MOVIES)
      .then((res) => {
        if (res?.data?.status === 200) {
          // setMovieList(res?.data?.data);
        }
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const requestSearch = (searched) => {
    let filteredData = movieReviewbookingsList?.filter(
      (data) =>
        data?.movieId?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.userId?.email?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.userId?.mobileNumber
          ?.toString()
          .includes(searched?.toLowerCase()) ||
        data?.connplexRate?.toString().includes(searched?.toLowerCase()) ||
        data?.movieRate?.toString().includes(searched?.toLowerCase()) ||
        `${data?.userId?.firstName?.toLowerCase()} ${data?.userId?.lastName?.toLowerCase()}`?.includes(
          searched?.toLowerCase()
        ) ||
        (data &&
          data?.createdAt &&
          PagesIndex.moment(data?.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched.toLowerCase()))
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
    // setMovieReviewList(filteredData);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const [removeData, setRemoveData] = useState(false);
  const getUserReviewList = (selectedMovie) => {
    PagesIndex.DataService.get(
      `${PagesIndex.Api.GET_RATE_REVIEW_LIST}?movieId=${selectedMovie || ""}` +
        `&timestamp=${new Date().getTime()}`
    )
      .then((res) => {
        setMovieReviewList(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);

        if (selectedMovie !== "") {
          const filteredData = res?.data?.data?.filter((data) => {
            return selectedMovie === data?.movieId?._id;
          });
          setFilteredData(filteredData);
        } else {
          setFilteredData(res?.data?.data);
          setMovieList(res?.data?.data);
        }

        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (data) =>
              data?.movieId?.name
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              data?.userId?.email
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              data?.userId?.mobileNumber
                ?.toString()
                .includes(searchValue?.toLowerCase()) ||
              data?.connplexRate
                ?.toString()
                .includes(searchValue?.toLowerCase()) ||
              data?.movieRate
                ?.toString()
                .includes(searchValue?.toLowerCase()) ||
              `${data?.userId?.firstName?.toLowerCase()} ${data?.userId?.lastName?.toLowerCase()}`?.includes(
                searchValue?.toLowerCase()
              )
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
        }
        setCurrentPage(0);
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        console.log(err);
      });
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedMovie("");
    setFilteredData(movieReviewbookingsList);
  };

  const handleStatus = (e, id) => {
    const data = {
      id: id,
      isActive: e.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(
      PagesIndex.Api.ACTIVE_DEACTIVE_USER_REVIEW,
      data
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          // getUserReviewList();
          getUserReviewList(selectedMovie);
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
  const handleOpen = (e, msg) => {
    setOpen(true);
    setData(msg);
  };
  const handleClose = () => {
    setOpen(false);
    setData("");
  };
  useEffect(() => {
    getUserReviewList(selectedMovie);
  }, [selectedMovie, removeData]);
  useEffect(() => {
    getMoviesList();
  }, []);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("movie_review_view")
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
                  </Index.Box>
                </Index.Stack>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="barge-common-box user-reviews">
            <Index.Box className="title-header">
              <Index.Box className="title-header-flex res-title-header-flex">
                <Index.Box className="title-main common-export-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Movie Reviews
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search common-dropdown-full">
                  <Index.Box className="d-flex align-items-center   res-set-search common-user-listing-search">
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
            </Index.Box>

            <Index.Box className="page-table-main">
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
                      <Index.TableCell width="15%">
                        User Details
                      </Index.TableCell>
                      <Index.TableCell width="10%">Email</Index.TableCell>
                      <Index.TableCell width="10%">
                        Mobile number
                      </Index.TableCell>
                      <Index.TableCell width="35%">Movie</Index.TableCell>
                      <Index.TableCell width="20%">
                        Movie Rating
                      </Index.TableCell>
                      <Index.TableCell width="10%">
                        Conpplex Rating
                      </Index.TableCell>
                      <Index.TableCell width="10%">Review Date</Index.TableCell>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "movie_review_edit"
                      ) && (
                        <Index.TableCell width="10%" align="center">
                          Status
                        </Index.TableCell>
                      )}
                      <Index.TableCell width="10%" align="right">
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
                            <Index.TableRow
                              // className="inquiry-list"
                              key={item?._id}
                              // onClick={(e) => handleOpen(e, item)}
                            >
                              <Index.TableCell>
                                <Index.Tooltip
                                  title={`${item?.userId?.firstName} ${item?.userId?.lastName}`}
                                  placement="top"
                                  disableInteractive
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details">
                                    {item?.userId?.firstName
                                      ? `${item?.userId?.firstName} ${item?.userId?.lastName}`
                                      : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.userId?.email
                                  ? item?.userId?.email
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.userId?.mobileNumber
                                  ? item?.userId?.mobileNumber
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.movieId?.name
                                  ? item?.movieId?.name
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell
                                component="td"
                                variant="td"
                                scope="row"
                                className="table-td"
                              >
                                {item?.movieRate ? item?.movieRate : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.connplexRate ? item?.connplexRate : "-"}
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
                              {adminLoginData?.roleId?.permissions?.includes(
                                "movie_review_edit"
                              ) && (
                                <Index.TableCell align="center">
                                  <PagesIndex.CustomToggleButton
                                    defaultChecked={item?.isActive}
                                    onChange={(e) => {
                                      handleStatus(e, item?._id);
                                    }}
                                    disabled={loadingState[item?._id] || false}
                                  />
                                </Index.TableCell>
                              )}
                              <Index.TableCell align="right">
                                <Index.IconButton
                                  onClick={(e) => handleOpen(e, item)}
                                >
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
                            <Index.Box className="form-group w-100-res">
                              <Index.Select
                                fullWidth
                                id="fullWidth"
                                name="category"
                                className="form-control"
                                displayEmpty
                                value={selectedMovie}
                                onChange={(e) => {
                                  setSelectedMovie(e.target.value);
                                }}
                                renderValue={
                                  selectedMovie
                                    ? undefined
                                    : () => "Select Movie"
                                }
                              >
                                <Index.MenuItem value={""}>All</Index.MenuItem>
                                {movieList?.length &&
                                  movieList
                                    ?.filter(
                                      (data, index, self) =>
                                        index ===
                                        self.findIndex(
                                          (t) =>
                                            t?.movieId &&
                                            data?.movieId &&
                                            t?.movieId?._id ===
                                              data?.movieId?._id
                                        )
                                    )
                                    ?.map((data) => {
                                      return (
                                        <Index.MenuItem
                                          value={data?.movieId?._id}
                                          key={data?.movieId?._id}
                                        >
                                          {data?.movieId?.name}
                                        </Index.MenuItem>
                                      );
                                    })}
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
                    alt=""
                  />
                </Index.Box>
                <Index.Box className="booking-detail-right">
                  <Index.Box className="log-data">
                    {/* <Index.Box className="log-title">Review:</Index.Box> */}
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        User Name :
                      </Index.Box>{" "}
                      {data?.userId?.firstName
                        ? `${data?.userId?.firstName} ${data?.userId?.lastName}`
                        : "User"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Movie Name :
                      </Index.Box>{" "}
                      {data?.movieId ? data?.movieId?.name : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Reviewed On :
                      </Index.Box>{" "}
                      {data?.createdAt
                        ? PagesIndex.moment(data?.createdAt).format(
                            "DD/MM/YYYY hh:mm A"
                          )
                        : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Connplex Rating :
                      </Index.Box>{" "}
                      {data?.connplexRate ? data?.connplexRate : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Movie Rating :
                      </Index.Box>{" "}
                      {data?.movieRate ? data?.movieRate : "-"}
                    </Index.Box>
                    <Index.Box className="log-text">
                      <Index.Box className="log-text-title" component="span">
                        Movie Review :
                      </Index.Box>{" "}
                      {data?.movieReview ? data?.movieReview : "-"}
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              {/* <Index.Box className="modal-user-btn-flex">
              <Index.Box className="discard-btn-main btn-main-primary">
                <Index.Box className="common-button blue-button res-blue-button">
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={handleClose}
                  >
                    Close
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box> */}
            </Index.Box>
          </Index.Box>
        </Index.Modal>
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default UserMovieReviewList;
