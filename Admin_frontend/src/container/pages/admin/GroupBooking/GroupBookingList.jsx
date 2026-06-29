import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
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

const GroupBookingList = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [groupBookingList, setgroupBookingList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const getGroupBookingList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GROUP_BOOKING_LIST)
      .then((res) => {
        setgroupBookingList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    getGroupBookingList();
  }, []);

  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = groupBookingList?.filter(
      (data) =>
        data?.name?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.email?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.mobileNumber?.toString()?.includes(searched?.toString()) ||
        data?.city?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.cinemaId?.cinemaName
          ?.toLowerCase()
          ?.includes(searched?.toLowerCase()) ||
        data?.noOfPax
          ?.toString()
          ?.toLowerCase()
          ?.includes(searched?.toLowerCase()) ||
        (data &&
          data?.bookingDate &&
          PagesIndex.moment(data?.bookingDate)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched?.toLowerCase()))
    );
    setFilteredData(filteredData);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("career_request_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box className="barge-common-box">
            <Index.Box className="title-header">
              <Index.Box className="title-header-flex res-title-header-flex">
                <Index.Box className="title-main  common-export-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Group Booking List
                  </Index.Typography>
                  <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        // generateExcel();
                      }}
                    >
                      <img
                        src={PagesIndex.Svg.office}
                        className="mobile-export-icon"
                        alt="export"
                      ></img>
                    </Index.Button>
                  </Index.Box>
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
                  {/* <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        // generateExcel();
                      }}
                    >
                      Export excel
                    </Index.Button>
                  </Index.Box> */}
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
                  className="table-design-main one-line-table"
                >
                  <Index.TableHead>
                    <Index.TableRow>
                      <Index.TableCell width="10%">Name</Index.TableCell>
                      <Index.TableCell width="20%">Email</Index.TableCell>
                      <Index.TableCell width="15%">
                        Mobile Number
                      </Index.TableCell>
                      <Index.TableCell width="15%">CinemaName</Index.TableCell>
                      <Index.TableCell width="12%">City</Index.TableCell>
                      <Index.TableCell width="8%">No of Pax</Index.TableCell>
                      <Index.TableCell width="5%">Booking Date</Index.TableCell>
                      <Index.TableCell width="5%">Created At</Index.TableCell>
                      {/* <Index.TableCell align="right" width="5%">
                        Action
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
                              className="inquiry-list"
                              key={item?._id}
                            >
                              <Index.TableCell width="10%">
                                <Index.Box className="common-tooltip-details">
                                  {item?.name ? item?.name : "-"}
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell width="20%">
                                {item?.email ? item?.email : "-"}
                              </Index.TableCell>
                              <Index.TableCell width="15%">
                                {item?.mobileNumber ? item?.mobileNumber : "-"}
                              </Index.TableCell>
                              <Index.TableCell width="12%">
                                {item?.cinemaId?.cinemaName
                                  ? item?.cinemaId?.cinemaName
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell width="8%">
                                <Index.Box className="common-tooltip-details">
                                  {item?.city ? item?.city : "-"}
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell width="20%">
                                <Index.Tooltip
                                  title={item?.message}
                                  placement="top"
                                  disableInteractive
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details">
                                    {item?.noOfPax ? item?.noOfPax : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell width="10%">
                                {item?.bookingDate
                                  ? PagesIndex.moment(item?.bookingDate).format(
                                      "DD/MM/YYYY"
                                    )
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell width="10%">
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY hh:mm A"
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
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default GroupBookingList;
