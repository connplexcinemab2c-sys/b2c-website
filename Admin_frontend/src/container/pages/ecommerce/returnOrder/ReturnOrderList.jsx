import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Search, StyledInputBase } from "../../../../common/Search/Search";
import { toast } from "react-toastify";

const ReturnOrderList = () => {
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [orderList, setOrderList] = useState([]);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const returnOrderStatus = [
    { id: 1, title: "Pending" },
    { id: 2, title: "Processing" },
    { id: 3, title: "PickUp" },
    { id: 4, title: "Return Accepted" },
  ];
  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Search on table
  const requestSearch = (searched) => {
    let filteredData = orderList?.filter(
      (data) =>
        data?.orderId?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.shippingStatus?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.cartId?.productId?.productName
          ?.toLowerCase()
          .includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getReturnOrderList = async () => {
    try {
      const { data } = await PagesIndex.EcommerceService.get(
        PagesIndex.EcommerceApi.GET_RETURN_ORDER
      );
      setOrderList(data?.data);
      setFilteredData(data?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const handleOrderStatus = async (event, id, returnStatus) => {
    try {
      const { data } = await PagesIndex.EcommerceService.post(
        PagesIndex.EcommerceApi.UPDATE_RETURN_ORDER_STATUS,
        {
          id, // The order ID
          status: event.target.value, // The new status selected from the dropdown
          returnStatus, // The return status of the order
        }
      );
      if (data) {
        toast.success(data?.message, {
          autoClose: 1000,
        });
        getReturnOrderList();
      }
      // if(res?.payload.status);
    } catch (error) {}
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  useEffect(() => {
    getReturnOrderList();
  }, []);
  return (
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
                Return Order Management
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

        <Index.Box className="page-table-main banner-table-main">
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
                  <Index.TableCell width="4%">Order Id</Index.TableCell>
                  <Index.TableCell width="10%">Product Name</Index.TableCell>
                  <Index.TableCell width="10%">Seller</Index.TableCell>
                  <Index.TableCell width="10%">Payment Mode</Index.TableCell>
                  <Index.TableCell width="10%">Payment Status</Index.TableCell>
                  <Index.TableCell width="10%">
                    Order Return Status
                  </Index.TableCell>
                  <Index.TableCell width="10%">Return Reason</Index.TableCell>
                  <Index.TableCell width="10%">Return Date</Index.TableCell>
                  <Index.TableCell width="5%">Total Price</Index.TableCell>

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
                      ?.map((order, index) => (
                        <Index.TableRow key={order?._id}>
                          <Index.TableCell>
                            #{order?.orderId || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.cartId?.productId?.productName || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.sellerId?.businessName || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.paymentMethod || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.paymentStatus || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.TableCell>
                              <Index.Box className="input-box modal-input-box">
                                <Index.Box className="form-group">
                                  <Index.Select
                                    fullWidth
                                    id="fullWidth"
                                    className="form-control select-font-size"
                                    displayEmpty
                                    value={order?.OrderReturn?.returnStatus}
                                    onChange={(e) =>
                                      handleOrderStatus(
                                        e,
                                        order?._id,
                                        "returnStatus"
                                      )
                                    }
                                  >
                                    {returnOrderStatus?.map((item) => {
                                      const currentStatusId =
                                        returnOrderStatus?.find(
                                          (item) =>
                                            item?.title ==
                                            order?.OrderReturn?.returnStatus
                                        )?.id || 0;
                                      return (
                                        <Index.MenuItem
                                          value={item?.title}
                                          className="status-menuitem"
                                          key={item?.id}
                                          disabled={
                                            item?.id < currentStatusId ||
                                            item?.id - 1 > currentStatusId
                                          }
                                        >
                                          <Index.Typography className="status-menuitem-text">
                                            {item?.title}
                                          </Index.Typography>
                                        </Index.MenuItem>
                                      );
                                    })}
                                  </Index.Select>
                                </Index.Box>
                              </Index.Box>
                            </Index.TableCell>
                            {/* {order?.OrderReturn?.returnStatus || "-"} */}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.OrderReturn?.reasonForReturn || "-"}
                          </Index.TableCell>
                          <Index.TableCell component="td" className="table-td">
                            {order?.OrderReturn?.returnRequestedDate
                              ? PagesIndex.moment(
                                  order?.OrderReturn?.returnRequestedDate
                                ).format("DD/MM/YYYY")
                              : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            ₹
                            {order?.totalAmount
                              ? order?.totalAmount?.toFixed(2)
                              : "-"}
                          </Index.TableCell>

                          {/* <Index.TableCell align="right">
                          <Index.Box className="flex-action-details">
                            <Index.Box className="icon-width-action">
                              <Index.IconButton>
                                <Index.Visibility />
                              </Index.IconButton>
                            </Index.Box>
                          </Index.Box>
                        </Index.TableCell> */}
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
  );
};

export default ReturnOrderList;
