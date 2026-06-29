import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import RewardConfigDrawer from "./RewardConfigDrawer";

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

const Rewards = () => {
  const navigate = useNavigate();
  const [rewardList, setRewardList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    totalIssued: 0,
    totalRedeemed: 0,
    outstandingLiability: 0,
    activeUsers: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  const getRewardMetrics = () => {
    setMetricsLoading(true);
    PagesIndex.DataService.get(PagesIndex.Api.REWARD_METRICS)
      .then((res) => {
        if (res?.status === 200) setMetrics(res.data.data);
      })
      .catch(() => {})
      .finally(() => setMetricsLoading(false));
  };

  // Fetch Reward List
  const getRewardList = (type = "all") => {
    setLoading(true);
    const query = type !== "all" ? `?type=${type}` : "";
    PagesIndex.DataService.get(`${PagesIndex.Api.GET_REWARDS}${query}`)
      .then((res) => {
        if (res?.status === 200) {
          setRewardList(res?.data?.data);
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
    getRewardList();
    getRewardMetrics();
  }, []);

  // Handle Search
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    const searchTerm = searched.toLowerCase();

    const filtered = rewardList.filter((data) => {
      return (
        data?.transactionId?.movieId?.name?.toLowerCase()?.includes(searchTerm) ||
        data?.userId?.email?.toLowerCase()?.includes(searchTerm) ||
        data?.userId?.mobileNumber?.toString()?.toLowerCase()?.includes(searchTerm) ||
        data?.coins?.toString()?.toLowerCase()?.includes(searchTerm) ||
        data?.transactionId?.initTransId?.toString().toLowerCase()?.includes(searchTerm) ||
        data?.transactionId?.paymentResponse?.amount?.toString()?.includes(searchTerm) ||
        (data?.createdAt && moment(data?.createdAt).format("DD/MM/YYYY").includes(searchTerm))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(0);
    setSearchValue("");
    getRewardList(type);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const displayData = filteredData;
  const colSpan = filterType === "redeemed" ? 7 : 8  ;

  // Generate Excel File
  const generateExcel = async () => {
    const headers = [
      "Date",
      "User Details\t",
      "Movie Name",
      "Coins",
      "Booking Id",
      "Amount"
    ];

    const rows = filteredData.map((item) => ({
      Date: item?.createdAt ? moment(item?.createdAt).format("DD/MM/YYYY") : "-",
      "User Details\t": item?.userId?.email || "-",
      "Movie Name": item?.transactionId?.movieId?.name || "-",
      Coins: item?.coins || "-",
      "Booking Id": item?.transactionId?.initTransId || "-",
      Amount: item?.transactionId?.paymentResponse?.amount || "-"
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Membership Plans");
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    PagesIndex.XLSX.writeFile(
      workbook,
      `Membership_Plan_${PagesIndex.moment().format("DD-MM-YYYY_hh:mm:ss_A")}.xlsx`,
      { compression: true }
    );
  };



  return (
    <Index.Box className="rewards-page">
           <Index.Box className="title-main common-export-flex" mb={2}>
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                Reward / Coin
              </Index.Typography>
            </Index.Box>
      {/* Dashboard Metric Cards */}
      <Index.Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { title: "Total Points Issued", key: "totalIssued" },
          { title: "Total Points Redeemed", key: "totalRedeemed" },
          // { title: "Outstanding Liability", key: "outstandingLiability" },
          // { title: "Active Users", key: "activeUsers" },
        ].map((metric) => (
          <Index.Grid item lg={3} md={4} sm={6} xs={12} key={metric.key}>
            <Index.Box className="dash-card-box">
              <Index.Typography className="dash-card-title">
                {metric.title}
              </Index.Typography>
              <Index.Box className="dash-card-flex">
                <Index.Typography className="dash-card-amont">
                  {metricsLoading
                    ? "..."
                    : (metrics[metric.key] ?? 0).toLocaleString()}
                </Index.Typography>
                <Index.Box className="dash-card-icon-box">
                  <img src={PagesIndex.Svg.yellowWalletIcon} alt={metric.title} />
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Grid>
        ))}
      </Index.Grid>

      {/* Main Table Section */}
      <Index.Box className="barge-common-box">
        <Index.Box className="title-header">
          <Index.Box className="title-header-flex res-title-header-flex">
            <Index.Box className="title-main common-export-flex">
              <Index.Box className="common-reward-filter-btns">
                <Index.Button
                  variant="contained"
                  disableRipple
                  className={`${filterType === "all" ? "blue-btn" : "white-btn"} all-btn`}
                  onClick={() => handleFilterChange("all")}
                >
                  All
                </Index.Button>
                <Index.Button
                  variant="contained"
                  disableRipple
                  className={`${filterType === "earned" ? "green-btn" : "white-btn"} earned-btn`}
                  onClick={() => handleFilterChange("earned")}
                >
                  Earned
                </Index.Button>
                <Index.Button
                  variant="contained"
                  disableRipple
                  className={`${filterType === "redeemed" ? "red-btn" : "white-btn"} redeemed-btn`}
                  onClick={() => handleFilterChange("redeemed")}
                >
                  Redeemed
                </Index.Button>
              </Index.Box>
              
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
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
              <Search className="search">
                <StyledInputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={searchValue}
                  onChange={handleInputChange}
                />
              </Search>
             
              <Index.Box className="common-button blue-button res-blue-button desktop-export-details" sx={{ mr: 1 }}>
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                  onClick={() => setConfigDrawerOpen(true)}
                >
                  Reward Configuration
                </Index.Button>
              </Index.Box>
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
                 
                      <Index.TableCell>Date</Index.TableCell>
                      <Index.TableCell>User Details</Index.TableCell>
                      <Index.TableCell>Movie Details</Index.TableCell>
                      <Index.TableCell>Coins</Index.TableCell>
                      <Index.TableCell>Amount</Index.TableCell>
                      <Index.TableCell>Expiry Date</Index.TableCell>
                      <Index.TableCell>Type</Index.TableCell>
                
                  
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
                      colSpan={colSpan}
                      align="center"
                    >
                      <Index.Loader />
                    </Index.TableCell>
                  </Index.TableRow>
                </Index.TableBody>
              ) : (
                <Index.TableBody>
                  {displayData?.length ? (
                    displayData
                      .slice(
                        currentPage * rowsPerPage,
                        currentPage * rowsPerPage + rowsPerPage
                      )
                      .map((data, index) =>
                       
                          <Index.TableRow key={index}>
                            <Index.TableCell>
                              {data?.createdAt
                                ? moment(data?.createdAt).format("DD/MM/YYYY")
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
                              {data?.transactionId?.initTransId || "-"}
                              <br />
                              {data?.transactionId?.movieId?.name || "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {data?.coins || "-"}
                            </Index.TableCell>
                           
                            <Index.TableCell>
                              {data?.transactionId?.paymentResponse?.amount ||
                                "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {data?.isExpired ? (
                                <span
                                  style={{
                                    background: "#fde8e8",
                                    color: "#c56767",
                                    fontSize: 11,
                                    fontFamily: "poppins-medium",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                  }}
                                >
                                  Expired
                                </span>
                              ) : data?.isExpiringSoon ? (
                                <Index.Tooltip
                                  title={`Expires on ${moment(data?.expiryDate).format("DD/MM/YYYY")}`}
                                >
                                  <span
                                    style={{
                                      background: "#fff3e0",
                                      color: "#c09a42",
                                      fontSize: 11,
                                      fontFamily: "poppins-medium",
                                      padding: "2px 8px",
                                      borderRadius: 4,
                                      cursor: "default",
                                    }}
                                  >
                                    {moment(data?.expiryDate).format(
                                      "DD/MM/YYYY"
                                    )}{" "}
                                    ⚠
                                  </span>
                                </Index.Tooltip>
                              ) : data?.expiryDate ? (
                                <span style={{ fontSize: 12, color: "#555" }}>
                                  {moment(data?.expiryDate).format("DD/MM/YYYY")}
                                </span>
                              ) : (
                                "-"
                              )}
                            </Index.TableCell>
                            <Index.TableCell>
                              <span
                                style={{
                                  background: `${data?.type === "redeemed" ? "#fde8e8" : "#e8f5e9"}`,
                                  color: `${data?.type === "redeemed" ? "#b91c1c" : "#1a6b2e"}`,
                                  fontSize: 11,
                                  fontFamily: "poppins-medium",
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                }}
                              >
                                {data?.type === "redeemed" ? "Redeemed" : "Earned"}
                              </span>
                            </Index.TableCell>
                          </Index.TableRow>
                        
                      )
                  ) : (
                    <Index.TableRow>
                      <Index.TableCell
                        component="td"
                        variant="td"
                        scope="row"
                        className="no-data-in-list"
                        colSpan={colSpan}
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

        {displayData?.length && !loading ? (
          <Index.Box className="pagination-design flex-end">
            <Index.Stack spacing={2}>
              <Index.Box className="pagination-count">
                <Index.TablePagination
                  component="div"
                  count={displayData?.length}
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

      <RewardConfigDrawer
        open={configDrawerOpen}
        onClose={() => setConfigDrawerOpen(false)}
      />
    </Index.Box>
  );
};

export default Rewards;
