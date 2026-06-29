import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useDispatch } from "react-redux";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import moment from "moment";
import { RejectionRemarkModal } from "../../../../common/model/RequestRejectionModel";
import ApproveModal from "../../../../common/model/ApproveModal";

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
const statusList = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "Approved",
    label: "Approved",
  },
  {
    value: "Rejected",
    label: "Rejected",
  },
];
const SubscriptionRequestList = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const navigate = PagesIndex.useNavigate();
  const [subscriptionRequestList, setSubscriptionRequestList] = useState([]);
  const [filterDataList, setFilterDataList] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isApproveReject, setIsApproveReject] = useState(null);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
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
  const [total, setTotal] = useState(0);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleRemarkModalOpen = (id) => {
    setId(id);
    setRemarkModalOpen(true);
  };

  // handle remark modal close
  const handleRemarkModalClose = () => {
    setRemarkModalOpen(false);
    setId("");
  };

  const handleApproveModalOpen = (data) => {
    setId(data);
    setApproveModal(true);
  };
  const handleApproveModalClose = () => {
    setApproveModal(false);
    setId("");
  };
  const handleApproveStatus = () => {
    handleStatus({
      row: id,
      status: "Approved",
      id: id?._id,
    });
    handleApproveModalClose();
  };
  const getSubscriptionRequestList = () => {
    // setLoading(true);
    PagesIndex.DataService.get(
      `${
        PagesIndex.Api.GET_SUBSCRIPTION_REQUEST_LIST
      }?search=${searchValue}&limit=${rowsPerPage}&page=${
        currentPage + 1
      }&status=${selectedStatus === "All" ? "" : selectedStatus}`
    )
      .then((res) => {
        const data = res?.data.data;
        setFilterDataList(data);
        setSubscriptionRequestList(res?.data?.data);
        setTotal(res?.data?.meta?.totalCount);
        setCurrentPage(res?.data?.meta?.currentPage - 1);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        setFilterDataList([]);
        setSubscriptionRequestList([]);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      });
  };

  // Search on table
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    setCurrentPage(0);
  };

  const generateExcel = async () => {
    const headers = [
      "Title",
      "Price",
      "Discount of F & B",
      "Discount on tickets",
      "Coins",
      "Welcome gift",
      "Requested By",
      "Requested On",
      "ACTION By",
      "Action On",
      "Status",
      "Rejection Reason",
    ];
    const rows = filterDataList?.map((item) => ({
      title: item?.title ? item.title : "-",
      price: item?.price ? item.price : "-",
      discountOfFAndB: item?.discountOfFAndB ? item.discountOfFAndB : "-",
      discountOnTicket: item?.discountOnTicket ? item.discountOnTicket : "-",

      coins: item?.coins ? item.coins : "-",
      welcomeGift: item?.welcomeGift ? item.welcomeGift : "-",
      requestedBy: item?.requestedBy?.name ? item.requestedBy.name : "-",
      createdAt: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
      updatedBy: item?.updatedBy?.name ? item.updatedBy.name : "-",
      updatedOn: item?.updatedOn
        ? PagesIndex.moment(item?.updatedOn).format("DD/MM/YYYY hh:mm A")
        : "-",
      status: item?.status ? item.status : "-",
      rejectionReason: item?.rejectionReason
        ? item.rejectionReason
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

  const clearFilters = () => {
    setSelectedStatus("All");
    // setFilterDataList(subscriptionRequestList);
  };

  const handleStatus = async (values) => {
    const { id, status, remark, row = {} } = values;
    console.log({ values, status, row }, 123456789);
    setIsApproveReject(id);
    // setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    const requestBody = {
      status,
      rejectionReason: remark || "",
    };

    if (row && Object.keys(row).length > 0) {
      requestBody.subscriptionData = row;
    }

    await PagesIndex.DataService.patch(
      `${PagesIndex.Api.UPDATE_SUBSCRIPTION_REQUEST}?id=${id}`,
      requestBody
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          getSubscriptionRequestList();
          setIsApproveReject(null);
          handleRemarkModalClose();
          setId("");
          setTimeout(() => {
            // setLoadingState((prevState) => ({ ...prevState, [id]: false }));
          }, 1000);
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsApproveReject(null);
        handleRemarkModalClose();
        setTimeout(() => {
          //   setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
  };

  useEffect(() => {
    getSubscriptionRequestList();
  }, [currentPage, rowsPerPage, searchValue, selectedStatus]);

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
                  Subscription Requests
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
                    <Index.TableCell width="15%">Discount Price</Index.TableCell>
                    {/* <Index.TableCell width="15%">
                      Discount of F & B
                    </Index.TableCell>
                    <Index.TableCell width="15%">
                      Discount on tickets
                    </Index.TableCell>
                    <Index.TableCell width="15%">
                      Discount on ecommerce
                    </Index.TableCell> */}
                    <Index.TableCell width="10%">Requested By</Index.TableCell>
                    <Index.TableCell width="10%">Requested On</Index.TableCell>

                    <Index.TableCell width="10%">Updated By</Index.TableCell>
                    <Index.TableCell width="10%">Updated On</Index.TableCell>

                    {/* <Index.TableCell width="10%">Coins</Index.TableCell>
                    <Index.TableCell width="10%">Welcome gift</Index.TableCell> */}
                    <Index.TableCell width="7%">status</Index.TableCell>
                    <Index.TableCell width="7%">reason</Index.TableCell>
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
                      filterDataList.map((row, index) => {
                        const isApproveDisabled =
                          isApproveReject == row?._id ||
                          row?.status === "Approved" ||
                          row?.status === "Rejected";
                        const isRejectDisabled =
                          isApproveReject == row?._id ||
                          row?.status === "Rejected" ||
                          row?.status === "Approved";
                        return (
                          <Index.TableRow className="inquiry-list">
                            <Index.TableCell>
                              {" "}
                              {index + 1 + currentPage * rowsPerPage}
                            </Index.TableCell>

                            <Index.TableCell>
                              {row?.title
                                ? row?.title.charAt(0).toUpperCase() +
                                  row?.title.slice(1).toLowerCase()
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.price ? row?.price : 0}
                            </Index.TableCell>
                               {/* <Index.TableCell>
                              {row?.isDiscounted ? "True" : "False"}
                            </Index.TableCell> */}
                             <Index.TableCell>
                              {row?.discountedPrice ? row?.discountedPrice : 0}
                            </Index.TableCell>
                            {/* <Index.TableCell>
                              {row?.subscription?.discountOfFAndB
                                ? row?.subscription?.discountOfFAndB
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.subscription?.discountOnTicket
                                ? row?.subscription?.discountOnTicket
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.subscription?.discountOnEcommerce
                                ? row?.subscription?.discountOnEcommerce
                                : "-"}
                            </Index.TableCell> */}
                            <Index.TableCell>
                              {row?.requestedBy?.name
                                ? row?.requestedBy?.name
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.createdAt
                                ? PagesIndex.moment(row?.createdAt).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )
                                : "-"}
                            </Index.TableCell>

                            <Index.TableCell>
                              {row?.updatedBy?.name
                                ? row?.updatedBy?.name
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.updatedOn
                                ? PagesIndex.moment(row?.updatedOn).format(
                                    "DD/MM/YYYY hh:mm A"
                                  )
                                : "-"}
                            </Index.TableCell>
{/* 
                            <Index.TableCell>
                              {row?.subscription?.coins ? row?.subscription?.coins : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.subscription?.welcomeGift ? row?.subscription?.welcomeGift : "-"}
                            </Index.TableCell> */}
                            <Index.TableCell>
                              {row?.status ? row?.status : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {row?.rejectionReason
                                ? row?.rejectionReason
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell align="right">
                              <Index.Box className="flex-action-details">
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "subscription_request_edit"
                                ) && (
                                  <>
                                    <Index.Tooltip
                                      title="Approve"
                                      arrow
                                      placement="top"
                                    >
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={
                                            () => handleApproveModalOpen(row)
                                            // handleStatus({
                                            //   row: row,
                                            //   id: row._id,
                                            //   status: "Approved",
                                            // })
                                          }
                                          disabled={isApproveDisabled}
                                        >
                                          <Index.CheckCircleRoundedIcon
                                            sx={{
                                              color: isApproveDisabled
                                                ? "#77c978"
                                                : "#3fd441",
                                            }}
                                          />
                                        </Index.IconButton>
                                      </Index.Box>
                                    </Index.Tooltip>

                                    <Index.Tooltip
                                      title="Reject"
                                      arrow
                                      placement="top"
                                    >
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleRemarkModalOpen(row?._id)
                                          }
                                          disabled={isRejectDisabled}
                                        >
                                          <Index.CancelIcon
                                            sx={{
                                              color: isRejectDisabled
                                                ? "#c24f54"
                                                : "#c6131b",
                                            }}
                                          />
                                        </Index.IconButton>
                                      </Index.Box>
                                    </Index.Tooltip>
                                  </>
                                )}
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "subscription_request_view"
                                ) && (
                                  <Index.Tooltip
                                    title="View"
                                    arrow
                                    placement="top"
                                  >
                                    <Index.Box className="icon-width-action">
                                      <Index.IconButton
                                        //   onClick={() =>
                                        //     handleViewProduct(row?._id)
                                        //   }
                                        onClick={() =>
                                          navigate(
                                            `/admin/view-subscription/${row?._id}`,
                                            {
                                              state: { row: row, index: index },
                                            }
                                          )
                                        }
                                      >
                                        <Index.Visibility />
                                      </Index.IconButton>
                                    </Index.Box>
                                  </Index.Tooltip>
                                )}
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
                            <Index.Box className="form-group w-100-res-drop">
                              <Index.FormHelperText className="form-lable">
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
                                    value={data?.label}
                                    className="menu-movie-max cus-drop"
                                  >
                                    {data?.label}
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
      {remarkModalOpen && (
        <RejectionRemarkModal
          open={remarkModalOpen}
          handleClose={handleRemarkModalClose}
          rowId={id}
          handleSubmit={handleStatus}
        />
      )}
      {approveModal && (
        <ApproveModal
          open={approveModal}
          handleClose={handleApproveModalClose}
          handleSubmit={handleApproveStatus}
          isDisable={isApproveReject}
        />
      )}
    </>
  );
};

export default SubscriptionRequestList;
