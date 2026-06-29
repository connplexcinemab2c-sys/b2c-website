import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Search, StyledInputBase } from "../../../../common/Search/Search";

const OrderList = () => {
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [orderList, setOrderList] = useState([]);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");

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

  // const getOrderList = async () => {
  //   try {
  //     const { data } = await PagesIndex.EcommerceService.get(
  //       PagesIndex.EcommerceApi.GET_ALL_ORDERS
  //     );
  //     setOrderList(data?.data);
  //     setFilteredData(data?.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };

  // const getOrderList = async () => {
  //   try {
  //     const { data } = await PagesIndex.EcommerceService.get(
  //       PagesIndex.EcommerceApi.GET_ALL_ORDERS
  //     );

  //     const orders = data?.data || [];
  //     const updatedOrders = await Promise.all(
  //       orders.map(async (order) => {
  //         console.log("order", order);

  //         if (!order.waybill)
  //           return { ...order, trackingStatus: order.shippingStatus || "-" };

  //         try {
  //           const trackingResponse = await PagesIndex.EcommerceService.get(
  //             `${PagesIndex.EcommerceApi.GET_ALL_ORDER_TRACKING}?waybill=${order.waybill}`
  //           );
  //           console.log("trackingResponsetrackingResponse", trackingResponse);

  //           const orderTrackingList =
  //             trackingResponse?.data?.trackingDetails || [];

  //           const statusMapping = {
  //             "Manifest uploaded": "Ordered",
  //             "Out for delivery": "Out for delivery",
  //             "Delivered to consignee": "Delivered",
  //           };
  //           console.log("orderTrackingList", orderTrackingList);

  //           let latestStatus = order.shippingStatus || "-";
  //           for (let i = orderTrackingList.length - 1; i >= 0; i--) {
  //             const mappedStatus =
  //               statusMapping[orderTrackingList[i]?.ScanDetail?.Instructions];
  //             if (mappedStatus) {
  //               latestStatus = mappedStatus;
  //               break;
  //             }
  //           }

  //           return { ...order, trackingStatus: latestStatus };
  //         } catch (error) {
  //           return { ...order, trackingStatus: order.shippingStatus || "-" };
  //         }
  //       })
  //     );

  //     setOrderList(updatedOrders);
  //     setFilteredData(updatedOrders);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };
  // const getOrderList = async () => {
  //   try {
  //     const { data } = await PagesIndex.EcommerceService.get(
  //       PagesIndex.EcommerceApi.GET_ALL_ORDERS
  //     );

  //     const orders = data?.data || [];
  //     console.log("Fetched Orders:", orders);

  //     const updatedOrders = await Promise.all(
  //       orders.map(async (order, index) => {
  //         console.log(`Processing Order ${index + 1}:`, order);

  //         if (!order?.waybill) {
  //           console.warn(`No waybill found for order:`, order);
  //           return { ...order, trackingStatus: order.shippingStatus || "-" };
  //         }

  //         try {
  //           const trackingResponse = await PagesIndex.EcommerceService.get(
  //             `${PagesIndex.EcommerceApi.GET_ALL_ORDER_TRACKING}?waybill=${order.waybill}`
  //           );

  //           console.log(
  //             `Tracking API Response for ${order.referenceNo}:`,
  //             trackingResponse
  //           );

  //           const orderTrackingList =
  //             trackingResponse?.data?.trackingDetails || [];

  //           console.log(
  //             `Tracking Details for ${order.referenceNo}:`,
  //             orderTrackingList
  //           );

  //           const statusMapping = {
  //             "Manifest uploaded": "Ordered",
  //             "Out for delivery": "Out for delivery",
  //             "Delivered to consignee": "Delivered",
  //           };

  //           let latestStatus = order.shippingStatus || "-";
  //           console.log("[[[]]]]", latestStatus);

  //           for (let i = orderTrackingList.length - 1; i >= 0; i--) {
  //             const scanDetail = orderTrackingList[i]?.ScanDetail?.Instructions;
  //             console.log("scanDetail", scanDetail);

  //             if (scanDetail && statusMapping[scanDetail]) {
  //               latestStatus = statusMapping[scanDetail];
  //               break;
  //             }
  //           }

  //           console.log(`Final Tracking Status for ${order}:`, latestStatus);

  //           return { ...order, trackingStatus: latestStatus };
  //         } catch (error) {
  //           console.error(
  //             `Error fetching tracking data for ${order.referenceNo}:`,
  //             error
  //           );
  //           return { ...order, trackingStatus: order.shippingStatus || "-" };
  //         }
  //       })
  //     );

  //     console.log("Final Updated Orders:", updatedOrders);

  //     setOrderList(updatedOrders);
  //     setFilteredData(updatedOrders);
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getOrderList = async () => {
    try {
      const { data } = await PagesIndex.EcommerceService.get(
        PagesIndex.EcommerceApi.GET_ALL_ORDERS
      );

      const orders = data?.data || [];
      console.log("Fetched Orders:", orders);

      const updatedOrders = await Promise.all(
        orders.map(async (order, index) => {
          console.log(`Processing Order ${index + 1}:`, order);

          if (!order?.waybill) {
            console.warn(`No waybill found for order:`, order);
            return { ...order, trackingStatus: order.shippingStatus || "-" };
          }

          try {
            const trackingResponse = await PagesIndex.EcommerceService.get(
              `${PagesIndex.EcommerceApi.GET_ALL_ORDER_TRACKING}?waybill=${order.waybill}`
            );
            // console.log("trackingResponse", trackingResponse);

            // console.log(
            //   `Tracking API Response for ${order.referenceNo}:`,
            //   trackingResponse
            // );
            console.log(
              "trackingResponse?.data?",
              trackingResponse?.data?.data[0]?.Shipment?.Scans
            );

            let orderTrackingList = trackingResponse?.data?.data || [];
            // console.log("orderTrackingList", orderTrackingList);

            console.log(`Tracking Details fo`, orderTrackingList);

            const statusMapping = {
              "Manifest uploaded": "Ordered",
              "Out for delivery": "Out for delivery",
              "Delivered to consignee": "Delivered",
            };

            let trackingStatuses = [];
            console.log("orderTrackingList", orderTrackingList);

            // Extract tracking statuses from latest to earliest (max 3)
            // for (let i = orderTrackingList.length - 1; i >= 0; i--) {
            //   console.log("orderTrackingList", orderTrackingList);

            //   const scanDetail =
            //     orderTrackingList[i]?.Shipment?.Instructions ||
            //     orderTrackingList[i]?.Shipment?.ScanType ||
            //     orderTrackingList[i]?.Shipment?.Scans;

            //   console.log(`Scan Detail at index`, scanDetail);

            //   if (scanDetail && statusMapping[scanDetail]) {
            //     trackingStatuses.push(statusMapping[scanDetail]);
            //   }

            //   if (trackingStatuses.length === 3) break; // Only get last 3 statuses
            // }
            for (let i = orderTrackingList.length - 1; i >= 0; i--) {
              console.log("orderTrackingList", orderTrackingList);

              const shipment = orderTrackingList[i]?.Shipment;
              const scanDetailsArray = shipment?.Scans || [];

              console.log("Scan Details Array:", scanDetailsArray);

              if (Array.isArray(scanDetailsArray)) {
                for (let j = scanDetailsArray.length - 1; j >= 0; j--) {
                  const scan = scanDetailsArray[j]?.ScanDetail;

                  const key =
                    scan?.Instructions || scan?.Scan || scan?.ScanType;

                  console.log("Individual Scan Key:", key);

                  if (key && statusMapping[key]) {
                    trackingStatuses.push(statusMapping[key]);
                  }

                  if (trackingStatuses.length === 3) break;
                }
              }

              if (trackingStatuses.length === 3) break;
            }

            const latestStatuses = trackingStatuses.join(" → ") || "-";
            console.log("latestStatuses", latestStatuses);

            console.log(
              `Final Tracking Statuses for ${order.referenceNo}:`,
              latestStatuses
            );

            return { ...order, trackingStatus: latestStatuses };

            // const latestStatuses = trackingStatuses.join(" → ") || "-";
            // console.log("latestStatuses", latestStatuses);

            // console.log(
            //   `Final Tracking Statuses for ${order.referenceNo}:`,
            //   latestStatuses
            // );

            // return { ...order, trackingStatus: latestStatuses };
          } catch (error) {
            console.error(
              `Error fetching tracking data for ${order.referenceNo}:`,
              error
            );
            return { ...order, trackingStatus: order.shippingStatus || "-" };
          }
        })
      );

      console.log("Final Updated Orders:", updatedOrders);

      setOrderList(updatedOrders);
      setFilteredData(updatedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  useEffect(() => {
    getOrderList();
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
                Order Management
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
                  <Index.TableCell width="10%">Ordered Date </Index.TableCell>
                  <Index.TableCell width="10%">Quantity</Index.TableCell>
                  <Index.TableCell width="10%">Payment Status</Index.TableCell>
                  <Index.TableCell width="10%">Order Status</Index.TableCell>
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
                          {/* <Index.TableCell>
                            {order?.cartId?.productId?.productName || "-"}
                          </Index.TableCell> */}
                          <Index.TableCell>
                            {order?.cartId?.productId?.productName
                              ? order.cartId.productId.productName
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")
                              : "-"}
                          </Index.TableCell>

                          <Index.TableCell>
                            {order?.sellerId?.businessName || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.paymentMethod || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.createdAt
                              ? PagesIndex.moment(order?.createdAt).format(
                                  "DD/MM/YYYY"
                                )
                              : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.cartId?.quantity || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.paymentStatus || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {order?.trackingStatus || "-"}
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
                        No Order Available
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

export default OrderList;
