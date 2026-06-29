import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Drawer } from "@mui/material";

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

const StyledInputBase = Index.styled(Index.InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch"
    }
  }
}));

const MemberShipPlanList = () => {
  const navigate = useNavigate();
  const [memberShipPlanList, setMemberShipPlanList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  // Fetch Membership List
  const getMemberShipList = () => {
    PagesIndex.DataService.get(`${PagesIndex.Api.GET_MEMBERSHIP_LIST}`)
      .then((res) => {
        if (res?.status === 200) {
          setMemberShipPlanList(res?.data?.data);
          setFilteredData(res?.data?.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  useEffect(() => {
    getMemberShipList();
  }, []);

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

  const clearFilters = () => {
    setIsBtnLoading(true);
    setFromDate("");
    setToDate("");
    setSearchValue("");
    setCurrentPage(0);
    setFilteredData(memberShipPlanList);
    setIsBtnLoading(false);
  };

  useEffect(() => {
    if (fromDate === "" && toDate === "" && searchValue === "") {
      setFilteredData(memberShipPlanList);
    }
  }, [fromDate, toDate, searchValue, memberShipPlanList]);

  // Handle Search
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    setCurrentPage(0);
  };

  const requestSearch = (searched) => {
    const searchTerm = searched.toLowerCase();
    let filtered = memberShipPlanList;

    // Apply search filter
    if (searched) {
      filtered = filtered.filter((data) => {
        return (
          data?.subscriptionId?.title?.toLowerCase()?.includes(searchTerm) ||
          data?.userId?.email?.toLowerCase()?.includes(searchTerm) ||
          data?.payments[0]?.paymentResponse?.tracking_id?.toString()?.toLowerCase()?.includes(searchTerm) ||
          data?.payments[0]?.paymentResponse?.payment_mode
            ?.toLowerCase()
            ?.includes(searchTerm) ||
          data?.payments[0]?.paymentResponse?.order_status
            ?.toLowerCase()
            ?.includes(searchTerm) ||
          data?.userId?.mobileNumber
            ?.toString()
            .toLowerCase()
            ?.includes(searchTerm) ||
          data?.subscriptionId?.price?.toString()?.includes(searchTerm) ||
          (data?.subscriptionStartDate &&
            moment(data?.subscriptionStartDate)
              .format("DD/MM/YYYY")
              .includes(searchTerm)) ||
          (data?.subscriptionEndDate &&
            moment(data?.subscriptionEndDate)
              .format("DD/MM/YYYY")
              .includes(searchTerm))
        );
      });
    }

    // Apply date filter
    if (fromDate && toDate) {
      const startDate = moment(fromDate);
      const endDate = moment(toDate);

      filtered = filtered.filter((item) => {
        const itemDate = moment(item?.subscriptionStartDate);
        return (
          itemDate.isSameOrAfter(startDate, "day") &&
          itemDate.isSameOrBefore(endDate, "day")
        );
      });
    }

    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleFilter = () => {
    if (fromDate || toDate || searchValue) {
      setIsBtnLoading(true);
    }
    requestSearch(searchValue);
    setIsBtnLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Generate Excel File
  const generateExcel = async () => {
    const headers = [
      "Title",
      "Email",
      "Phone Number",
      "Amount",
      "Tracking Id",
      "Payment Type",
      "Payment Status",
      "Start Date",
      "End Date"
    ];

    const rows = filteredData.map((item) => (
      
      {
      Title: item?.subscriptionId?.title || "-",
      Email: item?.userId?.email || "-",
      "Phone_Number": item?.userId?.mobileNumber || "-",
      Amount: item?.payments?.[0] && item?.payments?.[0].paymentResponse?.amount || "-",
      "Tracking Id": item?.payments?.[0] && item?.payments?.[0].paymentResponse?.tracking_id || "-",
      "Payment Type":item?.payments?.[0]&&  item?.payments?.[0]?.paymentResponse?.payment_mode || "-",
      "Payment Status":item?.payments?.[0] && item?.payments?.[0].paymentResponse?.order_status || "-",
      "Start_Date": item?.subscriptionStartDate
        ? moment(item?.subscriptionStartDate).format("DD/MM/YYYY")
        : "-",
      "End_Date": item?.subscriptionEndDate
        ? moment(item?.subscriptionEndDate).format("DD/MM/YYYY")
        : "-"
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Membership Plans"
    );

    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    PagesIndex.XLSX.writeFile(
      workbook,
      `Membership_Plan_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };

  return (
    <Index.Box>
      <Index.Box className="barge-common-box">
        <Index.Box className="title-header">
          <Index.Box className="title-header-flex res-title-header-flex">
            <Index.Box className="title-main common-export-flex">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                Membership Plan
              </Index.Typography>
              <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                >
                  <img
                    src={PagesIndex.Svg.office}
                    className="mobile-export-icon"
                    alt="export"
                  />
                </Index.Button>
              </Index.Box>
            </Index.Box>
            <Index.Box className="booking-report-content mt-manage-coupon">
         
            </Index.Box>
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
              <Search className="search">
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
                  onClick={generateExcel}
                  disabled={filteredData?.length ? false : true}
                >
                  Export excel
                </Index.Button>


              </Index.Box>
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
                  <Index.TableCell>Title</Index.TableCell>
                  <Index.TableCell>User Details</Index.TableCell>
                  <Index.TableCell>Coupon</Index.TableCell>
                  <Index.TableCell>Amount</Index.TableCell>
                  <Index.TableCell>Payment Mode</Index.TableCell>
                  <Index.TableCell>Payment Status</Index.TableCell>
                  <Index.TableCell>Start Date</Index.TableCell>
                  <Index.TableCell>End Date</Index.TableCell>
                  <Index.TableCell>Action</Index.TableCell>
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
                      colSpan={8}
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
                      .slice(
                        currentPage * rowsPerPage,
                        currentPage * rowsPerPage + rowsPerPage
                      )
                      .map((data, index) => (
                        <Index.TableRow key={index}>
                          <Index.TableCell>
                          {data?.subscriptionId?.title
                            ? data?.subscriptionId?.title
                                .charAt(0)
                                .toUpperCase() +
                              data?.subscriptionId?.title.slice(1).toLowerCase()
                            : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.userId?.email && (
                              <>
                                <b>Email:</b> {data?.userId?.email || "-"}
                                <br />
                              </>
                            )}
                            {data?.userId?.mobileNumber && (
                              <>
                                <b>Phone Number:</b>{" "}
                                {data?.userId?.mobileNumber || "-"}
                                <br />
                              </>
                            )}
                          </Index.TableCell>
                            <Index.TableCell>
                            {data?.payments?.[0] && data?.payments?.[0]?.coupon?.couponCode ? (
                              <>
                                <b>Coupon Code:</b> {data?.payments?.[0]?.coupon?.couponCode || "-"}
                                <br />
                              </>
                            ):"-"}
                            {data?.payments?.[0] && data?.payments?.[0]?.coupon?.couponDiscount && (
                              <>
                                <b>Coupon Discount:</b>{" "}
                                {data?.payments?.[0]?.coupon?.couponDiscount || "-"}
                                <br />
                              </>
                            )}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.payments?.[0] && data?.payments?.[0].paymentResponse?.amount || "-"}
                          </Index.TableCell>
        
                          

                          <Index.TableCell>
                           {data?.payments[0]?.paymentResponse?.payment_mode || "-"}
                          <br />
                            {data?.payments[0]?.paymentResponse?.tracking_id ||
                              "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.payments[0]?.paymentResponse?.order_status ||
                              "-"}
                              <br />
                            { moment(data?.createdAt).format("DD/MM/YYYY HH:mm:ss") ||
                              "-"}
                          </Index.TableCell>

                          <Index.TableCell>
                            {data?.subscriptionStartDate
                              ? moment(data?.subscriptionStartDate).format(
                                  "DD/MM/YYYY"
                                )
                              : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.subscriptionEndDate
                              ? moment(data?.subscriptionEndDate).format(
                                  "DD/MM/YYYY"
                                )
                              : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Box
                              className="flex-action-details"
                              sx={{ justifyContent: "center" }}
                            >
                              <Index.Box className="icon-width-action">
                                <Index.IconButton
                                  onClick={() => {
                                    navigate(
                                      "/admin/view-membership-plan-list",
                                      {
                                        state: { row: data }
                                      }
                                    );
                                  }}
                                >
                                  <Index.Visibility />
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
                        colSpan={8}
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
        ) : null}
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
                    <Index.Box className="filter-input-field">
                      <Index.Grid
                        container
                        spacing={2}
                        className="common-admin-grid"
                      >
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
                                      error: false,
                                    },
                                  }}
                                  maxDate={PagesIndex.dayjs(
                                    PagesIndex.moment().format("YYYY-MM-DD")
                                  )}
                                  minDate={PagesIndex.dayjs("2022-01-01")}
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
                                placeholder="Search by title, email, phone, tracking id..."
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
  );
};

export default MemberShipPlanList;
