import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Search, StyledInputBase } from "../../../../common/Search/Search";

const SubscriptionActivityLog = ({ title }) => {
  const navigate = Index.useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState("");
  const [filterDataList, setFilterDataList] = React.useState([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

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
  const getSubscriptionRequestList = () => {
    PagesIndex.DataService.get(
      `${
        PagesIndex.Api.GET_SUBSCRIPTION_REQUEST_LIST
      }?search=${debouncedSearchValue}&limit=${rowsPerPage}&page=${
        currentPage + 1
      }&title=${title}`
    )
      .then((res) => {
        const data = res?.data.data;
        setFilterDataList(data);
        // setSubscriptionActivityLogList(data);
        setTotal(res?.data?.meta?.totalCount);
        setCurrentPage(res?.data?.meta?.currentPage - 1);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        setFilterDataList([]);
        // setSubscriptionActivityLogList([]);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    setCurrentPage(0);
    // requestSearch(newValue);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    getSubscriptionRequestList();
  }, [currentPage, rowsPerPage, debouncedSearchValue, title]);
  return (
    <Index.Box className="barge-common-box">
      <Index.Box className="title-header">
        <Index.Box className="title-header-flex res-title-header-flex">
          <Index.Box className="title-main common-export-flex">
            <Index.Typography variant="p" component="p" className="page-title">
              {title
                ? title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
                : "-"}{" "}
              Activity Log
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
              {/* <Index.Box className="common-button blue-button res-blue-button">
                    <Index.Button
                      variant="contained"
                      className="no-text-decoration"
                      disabled={filterDataList.length ? false : true}
                      onClick={() => generateExcel()}
                    >
                      Export excel
                    </Index.Button>
                  </Index.Box> */}
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
                <Index.TableCell width="15%">Discounted Price</Index.TableCell>

                <Index.TableCell width="10%">Requested By</Index.TableCell>
                <Index.TableCell width="10%">Requested On</Index.TableCell>

                <Index.TableCell width="10%">Action By</Index.TableCell>
                <Index.TableCell width="10%">Action On</Index.TableCell>

                <Index.TableCell width="7%">status</Index.TableCell>
                <Index.TableCell width="15%">Rejection Reason</Index.TableCell>

                <Index.TableCell width="7%" align="right">
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
                    return (
                      <Index.TableRow className="inquiry-list">
                        <Index.TableCell>
                          {index + 1 + currentPage * rowsPerPage}
                        </Index.TableCell>
                        <Index.TableCell>
                          {row?.title
                            ? row?.title.charAt(0).toUpperCase() +
                              row?.title.slice(1).toLowerCase()
                            : "-"}
                        </Index.TableCell>
                        <Index.TableCell>
                          {row?.price ? row?.price : "-"}
                        </Index.TableCell>
                         <Index.TableCell>
                          {row?.discountedPrice ? row?.discountedPrice : "0"}
                        </Index.TableCell>
                     
      
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
                          {row?.updatedBy?.name ? row?.updatedBy?.name : "-"}
                        </Index.TableCell>
                        <Index.TableCell>
                          {row?.updatedOn
                            ? PagesIndex.moment(row?.updatedOn).format(
                                "DD/MM/YYYY hh:mm A"
                              )
                            : "-"}
                        </Index.TableCell>

                     
                        <Index.TableCell>
                          {row?.status ? row?.status : "-"}
                        </Index.TableCell>
                         <Index.TableCell>
                          {row?.rejectionReason ? row?.rejectionReason : "-"}
                        </Index.TableCell>
                        <Index.TableCell align="right">
                          <Index.Box className="flex-action-details">
                            <Index.Box className="icon-width-action">
                              <Index.IconButton
                                onClick={() =>
                                 navigate(`/admin/view-subscription/${row?._id}`, {
                                    state: { row: row, index: index },
                                  })
                                }
                              >
                                <Index.Visibility />
                              </Index.IconButton>
                            </Index.Box>
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
  );
};

export default SubscriptionActivityLog;
