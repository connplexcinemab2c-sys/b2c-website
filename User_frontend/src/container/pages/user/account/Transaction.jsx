import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import Paper from "@mui/material/Paper";
import PagesIndex from "../../../PagesIndex";
import moment from "moment";
import { membershipDurationConstant } from "../../../../constant";

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
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Transaction = ({ membershipItem }) => {
  const [page, setPage] = useState(0);
  const [filterData, setFilterData] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewPlan, setViewPlan] = useState();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const handleOpen = (item) => {
    setOpen(true);
    setViewPlan(item);
  };
  useEffect(() => {
    console.log(membershipItem, "membershipItem");
    setFilterData(membershipItem?.transactions);
  }, [membershipItem]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Replace multiple spaces with a single space
    newValue = newValue.replace(/\s\s+/g, " ");

    // Remove leading spaces
    newValue = newValue.trimStart();
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    const searchTerm = searched.toLowerCase();

    const filtered = membershipItem.filter((data) => {
      return (
        data?.subscriptionId?.title?.toLowerCase()?.includes(searchTerm) ||
        data?.subscriptionId?.price?.toString()?.includes(searchTerm) ||
        data?.paymentResponse?.payment_mode
          ?.toLowerCase()
          ?.includes(searchTerm) ||
        data?.paymentResponse?.tracking_id
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTerm) ||
        data?.paymentResponse?.order_status
          ?.toLowerCase()
          ?.includes(searchTerm) ||
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

    setFilterData(filtered);
    setPage(0); // Reset to first page
  };
  const handleClose = () => {
    setOpen(false);
    setViewPlan();
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    //   <Index.Box className="account-tab-booking-main">
    //   <Index.Box className="account-tab-heading-box">
    //     <Index.Typography component="span" className="account-tab-heading">
    //        Transaction
    //     </Index.Typography>
    //   </Index.Box>
    //   {membershipItem?.length ? (
    //     <>
    //       <Index.Box className="account-tab-booking">
    //       {membershipItem
    //            ?.map((item, key) => (

    //             <Index.Box  className="your-booking-card">
    //                      {console.log(item, "item")}
    //               <Index.Box className="flex-card">
    //                 <Index.Box
    //                   className="your-booking-img-box"
    //                   // onClick={() => {
    //                   //   navigate({
    //                   //     pathname: `/my-booked-ticket`,
    //                   //     search: PagesIndex?.createSearchParams({
    //                   //       transId: item?.initTransId,
    //                   //     }).toString(),
    //                   //   });
    //                   // }}
    //                 >

    //                   {/* <Index.Box className="booking-cancel-main">
    //                   Cancelled
    //                 </Index.Box> */}
    //                 </Index.Box>
    //                 <Index.Box className="booking-card-summary">
    //                   <Index.Box className="booking-card-header">
    //                     <Index.Typography
    //                       variant="p"
    //                       component="p"
    //                       className="booking-card-title"
    //                     >
    //                       {item?.subscriptionId?.title}

    //                     </Index.Typography>

    //                   </Index.Box>
    //                   <Index.Box
    //                     className=""

    //                   >
    //                     <Index.Box className="booking-card-row">
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-label"
    //                       >
    //                         Amount :
    //                       </Index.Typography>
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-value"
    //                       >
    //                         {item?.subscriptionId?.price}
    //                       </Index.Typography>
    //                     </Index.Box>
    //                     <Index.Box className="booking-card-row">
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-label"
    //                       >
    //                        Start Date :
    //                       </Index.Typography>
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-value"
    //                       >
    //                          {PagesIndex.moment(
    //                           item?.subscriptionStartDate
    //                         ).format("MMM DD, YYYY")}

    //                       </Index.Typography>
    //                     </Index.Box>
    //                     <Index.Box className="booking-card-row">
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-label"
    //                       >
    //                         End Date :
    //                       </Index.Typography>
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-value"
    //                       >
    //                          {PagesIndex.moment(
    //                           item?.subscriptionEndDate
    //                         ).format("MMM DD, YYYY")}

    //                       </Index.Typography>
    //                     </Index.Box>

    //                     <Index.Box className="booking-card-row">
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-label"
    //                       >
    //                         Payment Mode :
    //                       </Index.Typography>
    //                       <Index.Typography
    //                         variant="p"
    //                         component="p"
    //                         className="booking-card-value"
    //                       >
    //                         {/* {item?.paymentResponse?.method
    //                           ? item?.paymentResponse?.method === "upi"
    //                             ? item?.paymentResponse?.method.toUpperCase()
    //                             : item?.paymentResponse?.method
    //                                 ?.charAt(0)
    //                                 .toUpperCase() +
    //                               item?.paymentResponse?.method
    //                                 ?.slice(1)
    //                                 .toLowerCase()
    //                           : item?.paymentResponse?.payment_mode
    //                               ?.charAt(0)
    //                               .toUpperCase() +
    //                               item?.paymentResponse?.payment_mode
    //                                 ?.slice(1)
    //                                 .toLowerCase() || "-"} */}

    //                       </Index.Typography>
    //                     </Index.Box>
    //                   </Index.Box>
    //                 </Index.Box>
    //               </Index.Box>

    //             </Index.Box>
    //           ))}
    //       </Index.Box>

    //     </>
    //   ) : (
    //     <Index.Box className="no-found-svg-box">
    //       <Index.ConfirmationNumberIcon />
    //       You don't seem to have any recent transaction.
    //     </Index.Box>
    //   )}

    //   {/* <Index.Box className="any-issues">
    //     <Index.Typography className="any-query-text">
    //       If you have any questions or need assistance.
    //       <br /> You can also report any issues you encounter.
    //       <span onClick={handleOpenReportIssue} className="span-issue">
    //         Report Issue
    //       </span>
    //     </Index.Typography>
    //   </Index.Box> */}

    // </Index.Box>
    <>
      <Index.Box className="account-tab-booking-main">
        <Index.Box className="account-tab-heading-box">
          <Index.Box className="flex-align-member-search">
            <Index.Typography component="span" className="account-tab-heading">
              Transaction History
            </Index.Typography>
            <Index.Box className="membership-search">
              <Search className="search">
                <StyledInputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={searchValue}
                  onChange={handleInputChange}
                />
              </Search>
              <Index.Box className="search-icon-transaction">
                <Index.SearchIcon />
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="transaction-user-table">
          <Index.TableContainer
            component={Paper}
            className="user-transaction-container"
          >
            <Index.Table className="user-transaction-table">
              <Index.TableHead className="user-transaction-table-head">
                <Index.TableRow className="transaction-table-row">
                  {/* <Index.TableCell className="transaction-table-cell" width="20%">
                  Subscription Id
                </Index.TableCell> */}

                  <Index.TableCell
                    className="transaction-table-cell"
                    width="14%"
                  >
                    Membership plan
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="10%"
                  >
                    Amount
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="14%"
                  >
                    Payment Type
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="20%"
                  >
                    Payment Status
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="10%"
                  >
                    Start Date
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="12%"
                  >
                    Expiry Date
                  </Index.TableCell>
                  <Index.TableCell
                    className="transaction-table-cell"
                    width="1%"
                  >
                    Action
                  </Index.TableCell>
                </Index.TableRow>
              </Index.TableHead>
              <Index.TableBody className="transaction-table-body">
                {filterData?.length > 0 ? (
                  filterData?.map((item, index) => {
                    const subscriptionStartDate =
                      item?.subscriptionStartDate &&
                      item?.subscriptionStartDate?.split("T")?.[0]
                        ? item?.subscriptionStartDate?.split("T")?.[0]
                        : "";
                    const subscriptionEndDate =
                      item?.subscriptionEndDate &&
                      item?.subscriptionEndDate?.split("T")?.[0]
                        ? item?.subscriptionEndDate?.split("T")?.[0]
                        : "";
                    return (
                      <Index.TableRow className="transaction-table-row">
                        <Index.TableCell className="transaction-table-cell">
                          {item?.subscription?.title
                            ? item?.subscription?.title
                                .charAt(0)
                                .toUpperCase() +
                              item?.subscription?.title.slice(1).toLowerCase()
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          ₹
                          {/* {item??.price
                            ? item?.subscriptionId?.price
                            : "-"} */}
                          {item?.paymentResponse?.amount
                            ? item?.paymentResponse?.amount
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          {item?.paymentResponse?.method 
                            ? item?.paymentResponse?.method
                            : item?.paymentResponse?.payment_mode ? item?.paymentResponse?.payment_mode :
                          "" }
                          <br></br>
                          {item?.paymentResponse?.tracking_id
                            ? item?.paymentResponse?.tracking_id
                            : null}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          {item?.paymentResponse?.order_status
                            ? item?.paymentResponse?.order_status
                            : "-"}
                          <br></br>
                          {item?.createdAt
                            ? item?.paymentResponse?.trans_date
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          {item?.subscriptionStartDate
                            ? PagesIndex.moment(
                                subscriptionStartDate,
                                "YYYY-MM-DD"
                              ).format("DD/MM/YYYY")
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          {item?.subscriptionEndDate
                            ? PagesIndex.moment(
                                subscriptionEndDate,
                                "YYYY-MM-DD"
                              ).format("DD/MM/YYYY")
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell className="transaction-table-cell">
                          <Index.VisibilityIcon
                            className="membership-view-icon"
                            onClick={() => handleOpen(item)}
                          />
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
                      colSpan={7}
                      align="center"
                    >
                      No transaction available
                    </Index.TableCell>
                  </Index.TableRow>
                )}
              </Index.TableBody>
            </Index.Table>
          </Index.TableContainer>

          <Index.TablePagination
            className="pagination-user-table"
            component="div"
            count={filterData?.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Index.Box>
      </Index.Box>

      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="franchise-modal-title"
        aria-describedby="franchise-modal-description"
        className="franchise-modal common-modal memeber-show-modal"
      >
        <Index.Box className="franchise-modal-inner common-modal-inner">
          <Index.Box className="memebership-modal-body">
            <Index.Box className="main-membership">
              <Index.Box className="cus-container">
                <Index.Box className="membership-body">
                  <Index.Box className="membership-item-box">
                    <Index.Box className="membership-item">
                      <Index.Typography className="membership-title">
                        {viewPlan?.subscription?.title}
                      </Index.Typography>
                      <Index.Typography className="small-member-text">
                        {viewPlan?.subscription?.title === "platinum"
                          ? "Enjoy exclusive benefits like free tickets and VIP access."
                          : viewPlan?.subscription?.title === "gold"
                          ? "Unlock special discounts and perks for a premium movie experience."
                          : "Get started with basic savings and rewards."}
                      </Index.Typography>
                      {/* Show Active Plan text if this is the active plan */}
                      {viewPlan?.isActive === true && (
                        <Index.Typography className="small-member-text active-plan">
                          Active Plan
                        </Index.Typography>
                      )}

                      <Index.Box className="button-inner-memberlist">
                        <Index.Box className="membership-price">
                          <Index.Typography className="membership-price-inner">
                            {/* ₹{viewPlan?.subscriptionId?.price}
                            <br />
                            <span> Yearly</span> */}
                            ₹
                            {viewPlan?.isDiscounted ? (
                              <>
                                <span className="line-add-prices">
                                  {viewPlan?.price}{" "}
                                </span>{" "}
                                <span>
                                  {" "}
                                  / <span>{viewPlan?.discountedPrice}</span>
                                </span>{" "}
                              </>
                            ) : (
                              viewPlan?.price
                            )}
                            <br />
                            <span className="yearly-title">
                              {" "}
                              {
                                membershipDurationConstant?.[
                                  viewPlan?.membershipDuration
                                ]
                              }
                            </span>
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="list-center-member">
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                viewPlan?.discountOnTicketUpTo === ""
                                  ? "membership-content disable"
                                  : "membership-content active"
                              }
                            >
                              {viewPlan?.discountOnTicketUpTo === "" ? (
                                <Index.ClearIcon />
                              ) : (
                                <Index.CheckIcon />
                              )}
                              <Index.Box className="membership-content-box">
                                {viewPlan?.discountOnTicketUpTo === ""
                                  ? "No Discount on Tickets"
                                  : `Upto ${viewPlan?.discountOnTicketUpTo}
                                % Discount on Tickets: Get more movies for your
                                money.`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                viewPlan?.coins === ""
                                  ? "membership-content disable"
                                  : "membership-content active"
                              }
                            >
                              {viewPlan?.coins === "" ? (
                                <Index.ClearIcon />
                              ) : (
                                <Index.CheckIcon />
                              )}
                              <Index.Box className="membership-content-box">
                                {viewPlan?.coins === ""
                                  ? "No Coins to Earn Rewards"
                                  : `Upto ${viewPlan?.coins}
                                % Coins:
                                Earn rewards redeemable for tickets.`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                viewPlan?.welcomeGift === "Yes"
                                  ? "membership-content active"
                                  : "membership-content disable"
                              }
                            >
                              {viewPlan?.welcomeGift === "Yes" ? (
                                <Index.CheckIcon />
                              ) : (
                                <Index.ClearIcon />
                              )}
                              {viewPlan?.welcomeGift === "Yes" ? (
                                <Index.Box className="membership-content-box">
                                  Welcome Gift: Receive a special surprise when
                                  you join.
                                </Index.Box>
                              ) : (
                                <Index.Box className="membership-content-box">
                                  No Welcome Gift
                                </Index.Box>
                              )}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
};

export default Transaction;
