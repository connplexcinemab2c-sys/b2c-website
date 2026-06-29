import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
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
const typeList = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "membership",
    label: "Membership",
  },
  {
    value: "WELCOME_GIFT",
    label: "Welcome Gift",
  },
];
const statusList = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "issued",
    label: "Issued",
  },
  {
    value: "received",
    label: "Received",
  },
  {
    value: "expired",
    label: "Expired",
  },
];
const WelcomeGift = () => {
  const [welcomeGiftList, setWelcomeGiftList] = useState([]);
  const [filterDataList, setFilterDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [removeData, setRemoveData] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDrawer, setOpenDrawer] = useState(false);

  const clearFilters = () => {
    setSelectedCinema("All");
    setSelectedType("All");
    setSelectedStatus("All");
    setSearchValue("");
    setFilterDataList(welcomeGiftList);
    setCurrentPage(0);
    setFromDate(null);
    setToDate(null);
  };

  const applyFilters = (
    cinema = selectedCinema,
    type = selectedType,
    status = selectedStatus,
    search,
    fromDate = null,
    toDate = null
  ) => {
    let result = [...welcomeGiftList];

    // Filter by cinema
    if (cinema !== "All") {
      result = result.filter((item) => item?.cinemaDetails?._id === cinema);
    }

    // Filter by type
    if (type !== "All") {
      result = result.filter((item) => item?.type === type);
    }

    // Filter by status
    // if (status !== "All") {
    //   result = result.filter((item) => item?.status === status);
    // }
    // Filter by status
    if (status !== "All") {
      result = result.filter((item) => {
        const itemStatus = item?.status?.toLowerCase();
        const collectBeforeDate = item?.collectBeforeDate;

        const isIssued = itemStatus === "issued";
        const isExpired =
          isIssued &&
          collectBeforeDate &&
          PagesIndex.moment().isAfter(PagesIndex.moment(collectBeforeDate));

        if (status === "expired") {
          return isExpired;
        }

        if (status === "issued") {
          return isIssued && !isExpired;
        }

        return itemStatus === status?.toLowerCase();
      });
    }

    // Filter by search
    // console.log({ search });
    if (search && search.trim() !== "") {
      const lowerSearch = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item?.userDetails?.firstName?.toLowerCase().includes(lowerSearch) ||
          item?.userDetails?.lastName?.toLowerCase().includes(lowerSearch) ||
          String(item?.userDetails?.mobileNumber || "")
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    if (fromDate || toDate) {
      result = result.filter((item) => {
        if (!item?.dateOfCollection) return false;

        const collectionTime = new Date(item.dateOfCollection).getTime();

        let isValid = true;

        if (fromDate) {
          const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
          isValid = isValid && collectionTime >= fromTime;
        }

        if (toDate) {
          const toTime = new Date(toDate).setHours(23, 59, 59, 999);
          isValid = isValid && collectionTime <= toTime;
        }

        return isValid;
      });
    }

    setFilterDataList(result);
    setCurrentPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const getSubscriptionList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_WELCOME_GIFT_LIST)
      .then((res) => {
        const data = res?.data?.data ?? [];
        setFilterDataList(data);
        setWelcomeGiftList(data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && filterDataList?.length > 0) {
          let filteredDataFilter = data?.filter(
            (data) =>
              data?.userDetails?.firstName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              data?.userDetails?.lastName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              String(data?.userDetails?.mobileNumber || "")
                .toLowerCase()
                .includes(searchValue)
          );
          setFilterDataList(filteredDataFilter);
        } else {
          setFilterDataList(data);
          setSearchValue("");
        }
      })
      .catch((err) => {
        setFilterDataList([]);
        setWelcomeGiftList([]);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      });
  };

  // Search on table
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    console.log({ newValue });
    applyFilters(
      selectedCinema,
      selectedType,
      selectedStatus,
      newValue,
      fromDate,
      toDate
    );
    // requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    setCurrentPage(0);

    let filteredData = welcomeGiftList;

    if (searched) {
      filteredData = filteredData?.filter((row) => {
        const firstName = row?.userDetails?.firstName || "";
        const lastName = row?.userDetails?.lastName || "";
        const fullName = `${
          firstName ? firstName + " " : ""
        }${lastName}`.toLowerCase();
        const cinemaName = row?.cinemaDetails?.cinemaName?.toLowerCase() || "";
        const searchText = searched?.toLowerCase();
        return (
          firstName?.includes(searchText) ||
          lastName?.includes(searchText) ||
          fullName?.includes(searchText)
          // ||
          // cinemaName?.toLowerCase()?.includes(searchText)
        );
      });
    }

    setFilterDataList(filteredData);
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

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
        const cinemaListData = res?.data?.data?.filter((data) => {
          if (location?.state?.displayName) {
            return location?.state?.displayName == data?.displayName;
          } else {
            return data;
          }
        });
        setFilteredData(cinemaListData);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = cinemaListData?.filter(
            (title) =>
              title?.cinemaName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              title?.displayName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(cinemaListData);
          setSearchValue("");
          setRemoveData(false);
        }
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
    if (openDrawer) {
      setIsOpen(openDrawer);
    } else {
      setOpenDrawer(false);
    }
  }, [openDrawer]);
  useEffect(() => {
    getCinemaList();
  }, [removeData]);
  useEffect(() => {
    getSubscriptionList();
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
                  Welcome Gift
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
                <Index.Box className="booking-report-content mt-manage-coupon"></Index.Box>
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
                className="table-design-main one-line-table "
              >
                <Index.TableHead>
                  <Index.TableRow>
                    <Index.TableCell width="5%">Sr.No</Index.TableCell>
                    <Index.TableCell width="15%">User Name</Index.TableCell>
                    <Index.TableCell width="15%">Type</Index.TableCell>
                    <Index.TableCell width="15%">Cinema Name</Index.TableCell>
                    <Index.TableCell width="15%">Status</Index.TableCell>
                    <Index.TableCell width="15%">
                      Collection Date
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
                    {filterDataList?.length ? (
                      filterDataList
                        ?.slice(
                          currentPage * rowsPerPage,
                          currentPage * rowsPerPage + rowsPerPage
                        )
                        .map((row, index) => (
                          <Index.TableRow className="inquiry-list">
                            <Index.TableCell>
                              {currentPage * rowsPerPage + index + 1}
                            </Index.TableCell>
                            <Index.TableCell>
                              {/* {row?.userDetails?.firstName ?? ""}{" "}
                              {row?.userDetails?.lastName ?? ""} */}
                              {[
                                row?.userDetails?.firstName || "",
                                row?.userDetails?.lastName || "",
                              ]
                                .join(" ")
                                .trim() || "-"}
                              <br />
                              {row?.userDetails?.mobileNumber || "-"}
                            </Index.TableCell>
                            <Index.TableCell className="text-capitalize">
                              {row?.type || "-" }                             </Index.TableCell>
                            <Index.TableCell>
                              {row?.cinemaDetails?.cinemaName ?? "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {PagesIndex.moment().isAfter(
                                PagesIndex.moment(row?.collectBeforeDate)
                              ) && row?.status?.toUpperCase() === "ISSUED"
                                ? "EXPIRED"
                                : row?.status?.toUpperCase() || "-"}

                              {/* {row?.status?.toUpperCase() || "-"} */}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.dateOfCollection
                                ? PagesIndex.moment(
                                    row?.dateOfCollection
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
                          colSpan={16}
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

          {filterDataList?.length &&
          filterDataList?.length > rowsPerPage &&
          !loading ? (
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
                          <Index.Box className="form-group w-100-res-drop input-box ">
                            <Index.FormHelperText className="form-lable bold-label-common">
                              Cinema
                            </Index.FormHelperText>
                            <Index.Autocomplete
                              fullWidth
                              id="fullWidth"
                              name="category"
                              className="cinema-auto-input custom-input"
                              displayEmpty
                              options={[
                                { _id: "All", cinemaName: "All" },
                                ...(cinemaList || []),
                              ]}
                              disableClearable
                              getOptionLabel={(option) =>
                                option?.cinemaName || ""
                              }
                              value={
                                cinemaList.find(
                                  (item) => item?._id === selectedCinema
                                ) || { _id: "All", cinemaName: "All" }
                              }
                              // value={selectedCinema}
                              onChange={(e, value) => {
                                setSelectedCinema(value?._id);
                                applyFilters(
                                  value?._id,
                                  selectedType,
                                  selectedStatus,
                                  searchValue,
                                  fromDate,
                                  toDate
                                );
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
                                  {option.cinemaName}
                                </Index.MenuItem>
                              )}
                              renderInput={(params) => (
                                <Index.TextField
                                  {...params}
                                  placeholder="Select Cinema"
                                  className="form-control"
                                />
                              )}
                              // renderValue={
                              //   selectedCinema
                              //     ? undefined
                              //     : () => "Select cinema"
                              // }
                            />
                            {/* <Index.MenuItem value={"All"}>All</Index.MenuItem>
                              {cinemaList?.map((data) => (
                                <Index.MenuItem
                                  key={data?._id}
                                  value={data?._id}
                                  className="menu-movie-max cus-drop"
                                >
                                  {data?.cinemaName}
                                </Index.MenuItem>
                              ))}
                            </Index.Select> */}
                          </Index.Box>
                        </Index.Grid>
                        <Index.Grid
                          item
                          xs={12}
                          className="common-admin-grid-item"
                        >
                          <Index.Box className="form-group w-100-res-drop input-box ">
                            <Index.FormHelperText className="form-lable bold-label-common">
                              Type
                            </Index.FormHelperText>
                            <Index.Select
                              fullWidth
                              id="fullWidth"
                              name="type"
                              className="form-control"
                              displayEmpty
                              value={selectedType}
                              onChange={(e) => {
                                setSelectedType(e.target.value);
                                applyFilters(
                                  selectedCinema,
                                  e.target.value,
                                  selectedStatus,
                                  searchValue,
                                  fromDate,
                                  toDate
                                );
                              }}
                              renderValue={
                                selectedType ? undefined : () => "Select Type"
                              }
                            >
                              {/* <Index.MenuItem value={""}>All</Index.MenuItem> */}
                              {typeList?.map((data) => (
                                <Index.MenuItem
                                  key={data?.value}
                                  value={data?.value}
                                  className="menu-movie-max cus-drop"
                                >
                                  {data?.label}
                                </Index.MenuItem>
                              ))}
                            </Index.Select>
                          </Index.Box>
                        </Index.Grid>
                        <Index.Grid
                          item
                          xs={12}
                          className="common-admin-grid-item"
                        >
                          <Index.Box className="form-group w-100-res-drop input-box ">
                            <Index.FormHelperText className="form-lable bold-label-common">
                              Status
                            </Index.FormHelperText>
                            <Index.Select
                              fullWidth
                              id="fullWidth"
                              name="category"
                              className="form-control"
                              displayEmpty
                              value={selectedStatus}
                              onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                applyFilters(
                                  selectedCinema,
                                  selectedType,
                                  e.target.value,
                                  searchValue,
                                  fromDate,
                                  toDate
                                );
                              }}
                              renderValue={
                                selectedStatus
                                  ? undefined
                                  : () => "Select Status"
                              }
                            >
                              {/* <Index.MenuItem value={""}>All</Index.MenuItem> */}
                              {statusList?.map((data) => (
                                <Index.MenuItem
                                  key={data?.value}
                                  value={data?.value}
                                  className="menu-movie-max cus-drop"
                                >
                                  {data?.label}
                                </Index.MenuItem>
                              ))}
                            </Index.Select>
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
                                    applyFilters(
                                      selectedCinema,
                                      selectedType,
                                      selectedStatus,
                                      searchValue,
                                      date?.$d,
                                      toDate
                                    );
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
                                    applyFilters(
                                      selectedCinema,
                                      selectedType,
                                      selectedStatus,
                                      searchValue,
                                      fromDate,
                                      date?.$d
                                    );
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
    </>
  );
};

export default WelcomeGift;
