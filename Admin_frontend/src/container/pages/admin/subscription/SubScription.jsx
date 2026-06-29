import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useDispatch } from "react-redux";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import moment from "moment";

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

const SubScription = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const navigate = PagesIndex.useNavigate();
  const [bookingsList, setBookingsList] = useState([]);
  const [filterDataList, setFilterDataList] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [removeData, setRemoveData] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});

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

  const handleDeleteOpen = (id) => {
    setDeleteOpen(true);
    setId(id);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const getSubscriptionList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_SUBSCRIPTION_LIST)
      .then((res) => {
        const sortedItems = res?.data.data
        // const sortedItems = res?.data.data.sort((a, b) => a.price - b.price);
        setFilterDataList(sortedItems);
        setBookingsList(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && filterDataList?.length > 0) {
          let filteredDataFilter = res?.data?.data?.filter((data) =>
            data?.title?.toLowerCase().includes(searchValue?.toLowerCase())
          );
          setFilterDataList(filteredDataFilter);
        } else {
          setFilterDataList(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
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

  // Search on table
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
          row?.discountOfFAndB
            ?.toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          row?.discountOnTicket
            ?.toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          row?.freeTicket?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          // row?.priorityBooking
          //   ?.toLowerCase()
          //   ?.includes(searched?.toLowerCase()) ||
          // row?.accessToExclusiveScreening
          //   ?.toLowerCase()
          //   ?.includes(searched?.toLowerCase()) ||
          // row?.guestPasses?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          // row?.specialEventAccess
          //   ?.toLowerCase()
          //   ?.includes(searched?.toLowerCase()) ||
          // row?.earlyAccessToTickets
          //   ?.toLowerCase()
          //   ?.includes(searched?.toLowerCase()) ||
          // row?.support?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.coins?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.welcomeGift?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.title?.toLowerCase()?.includes(searched?.toLowerCase()) ||
          row?.price
            ?.toString()
            .toLowerCase()
            ?.includes(searched?.toLowerCase()) ||
          (row &&
            row?.createdAt &&
            PagesIndex.moment(row?.createdAt)
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

  const generateExcel = async () => {
    const headers = [
      "Title",
      "Price",
      "Discount of F & B",
      "Discount on tickets",
      "Coins",
      "Welcome gift",
    ];
    const rows = filterDataList?.map((item) => ({
      title: item?.title ? item.title : "-",
      price: item?.price ? item.price : "-",
      discountOfFAndB: item?.discountOfFAndB ? item.discountOfFAndB : "-",
      discountOnTicket: item?.discountOnTicket ? item.discountOnTicket : "-",

      coins: item?.coins ? item.coins : "-",
      welcomeGift: item?.welcomeGift ? item.welcomeGift : "-",
      createdAt: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
    }));
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Subscription list"
    );

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `subscription_list_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };

  useEffect(() => {
    handleFilter();
  }, [fromDate, toDate]);
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setFilterDataList(bookingsList);
  };
  const handleRemove = () => {
    setIsLoading(true);
    PagesIndex.DataService.post(
      `${PagesIndex.Api.DELETE_SUBSCRIPTION}?id=${id}`
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        getSubscriptionList();
        handleDeleteClose();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const handleStatus = (id) => {
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.patch(
      `${PagesIndex.Api.ACTIVE_DEACTIVE_SUBSCRIPTION}?id=${id}`
    )
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getSubscriptionList();
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

  useEffect(() => {
    getSubscriptionList();
  }, [removeData]);

  return (
    <>
      <Index.Box className="">
        {/* <Index.Box
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
               
              </Index.Stack>
            </Index.Box>
          </Index.Box>
        </Index.Box> */}

        <Index.Box className="barge-common-box">
          <Index.Box className="title-header">
            <Index.Box className="title-header-flex res-title-header-flex">
              <Index.Box className="title-main common-export-flex">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Subscription
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
                <Index.Box className="booking-report-content mt-manage-coupon">
                  {/* <Index.Box className="common-button blue-button res-blue-button">
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
                  </Index.Box> */}
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
                  {/* {bookingsList?.length !== 3 ? ( */}
                  {adminLoginData?.roleId?.permissions?.includes(
                    "subscription_add"
                  ) && (
                    <Index.Box className="common-button blue-button res-blue-button">
                      <Index.Button
                        variant="contained"
                        className="no-text-decoration"
                        onClick={(e) => {
                          navigate({
                            pathname: `/admin/add-subscription`,
                          });
                        }}
                      >
                        Add Subscription
                      </Index.Button>
                    </Index.Box>
                  )}
                  {/* ) : (
                    <></>
                  )} */}
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
                className="table-design-main one-line-table "
              >
                <Index.TableHead>
                  <Index.TableRow>
                    <Index.TableCell width="5%">Sr.No</Index.TableCell>
                    <Index.TableCell width="15%">Title</Index.TableCell>
                    <Index.TableCell width="15%">Price</Index.TableCell>
                    {/* <Index.TableCell width="15%">Discounted</Index.TableCell> */}
                    {/* <Index.TableCell width="15%">Discount Price</Index.TableCell> */}
                    <Index.TableCell width="15%">
                      Discount of F & B
                    </Index.TableCell>
                    <Index.TableCell width="15%">
                      Discount on tickets
                    </Index.TableCell>
                    <Index.TableCell width="15%">
                      Discount on ecommerce
                    </Index.TableCell>
                    {/* <Index.TableCell width="10%">Free tickets</Index.TableCell> */}
                    {/* <Index.TableCell width="10%">
                      Monthly Access
                    </Index.TableCell> */}

                    {/* <Index.TableCell width="10%">
                      Priority booking
                    </Index.TableCell> */}
                    {/* <Index.TableCell width="10%">
                      Access to exclusive screening
                    </Index.TableCell> */}
                    {/* <Index.TableCell width="10%">Guest passes</Index.TableCell> */}
                    {/* <Index.TableCell width="10%">
                      Special events access
                    </Index.TableCell> */}
                    {/* <Index.TableCell width="10%">
                      Early access to tickets
                    </Index.TableCell> */}
                    {/* <Index.TableCell width="10%">Support</Index.TableCell> */}
                    <Index.TableCell width="10%">Coins</Index.TableCell>
                    <Index.TableCell width="10%">Welcome gift</Index.TableCell>
                    <Index.TableCell width="7%" align="right">
                      Active
                    </Index.TableCell>
                     <Index.TableCell width="7%" align="right">
                      status
                    </Index.TableCell>
                      <Index.TableCell width="7%" align="right">
                      Published
                    </Index.TableCell>
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
                    {filterDataList?.length ? (
                      filterDataList
                        ?.slice(
                          currentPage * rowsPerPage,
                          currentPage * rowsPerPage + rowsPerPage
                        )
                        .map((row, index) => (
                          <Index.TableRow className="inquiry-list">
                            <Index.TableCell>{currentPage * rowsPerPage + index + 1 }</Index.TableCell>
                            <Index.TableCell>
                              {row?.title
                                ? row?.title.charAt(0).toUpperCase() +
                                  row?.title.slice(1).toLowerCase()
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.price ? row?.price : "-"}
                            </Index.TableCell>
                             {/* <Index.TableCell>
                              {row?.isDiscounted ? "True" : "False"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.discountedPrice ? row?.discountedPrice : "-"}
                            </Index.TableCell> */}
                            <Index.TableCell>
                              {row?.discountOfFAndB
                                ? row?.discountOfFAndB
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.discountOnTicket
                                ? row?.discountOnTicket
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.discountOnEcommerce
                                ? row?.discountOnEcommerce
                                : "-"}
                            </Index.TableCell>
                            {/* <Index.TableCell>
                              {row?.freeTicket ? row?.freeTicket : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.monthlyAccess ? row?.monthlyAccess : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.priorityBooking
                                ? row?.priorityBooking
                                : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.accessToExclusiveScreening
                                ? row?.accessToExclusiveScreening
                                : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.guestPasses ? row?.guestPasses : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.specialEventAccess
                                ? row?.specialEventAccess
                                : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.earlyAccessToTickets
                                ? row?.earlyAccessToTickets
                                : "-"}
                            </Index.TableCell> */}
                            {/* <Index.TableCell>
                              {row?.support ? row?.support : "-"}
                            </Index.TableCell> */}
                            <Index.TableCell>
                              {row?.coins ? row?.coins : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.welcomeGift ? row?.welcomeGift : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              <CustomToggleButton
                                checked={row?.isActive}
                                disabled={!row?.isPublished || loadingState[row?._id] || false}
                                onChange={() => handleStatus(row?._id)}
                                // disabled={loadingState[row?._id] || false}
                              />
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.status ? row?.status : "-"}
                            </Index.TableCell>
                               <Index.TableCell>
                              {row?.isPublished ? "True" : "False"}
                            </Index.TableCell>
                            <Index.TableCell align="right">
                              <Index.Box className="flex-action-details">
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "subscription_view"
                                ) && (
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton>
                                      <Index.Visibility
                                        onClick={() =>
                                          navigate(
                                            `/admin/view-subscription/${row?._id}`,
                                            {
                                              state: {
                                                row: row,
                                                index: index,
                                                isShowLog: true,
                                              },
                                            }
                                          )
                                        }
                                      />
                                    </Index.IconButton>
                                  </Index.Box>
                                )}
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "subscription_edit"
                                ) && (
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton disabled={row?.status==="Requested"}>
                                      <Index.EditIcon
                                        onClick={() =>
                                          navigate("/admin/add-subscription", {
                                            state: { row: row },
                                          })
                                        }
                                      />
                                    </Index.IconButton>
                                  </Index.Box>
                                )}
                                {/* <Index.Box className="icon-width-action">
                                  <Index.IconButton>
                                    <Index.DeleteIcon
                                      onClick={() => handleDeleteOpen(row?._id)}
                                    />
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

        {/* <React.Fragment key="right">
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
                                        error: false,
                                      },
                                    }}
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
        </React.Fragment> */}
      </Index.Box>
      <PagesIndex.DeleteModal
        deleteOpen={deleteOpen}
        handleDeleteClose={handleDeleteClose}
        handleDeleteRecord={!isLoading && handleRemove}
      />
    </>
  );
};

export default SubScription;
