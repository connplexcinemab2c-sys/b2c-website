import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";

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

const RewardsSummary = () => {
  const navigate = useNavigate();
  const [rewardsData, setRewardsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const currentYear = new Date().getFullYear();
  const yearList = [{ label: "All Years", value: "all" }];
  for (let y = currentYear; y >= 2024; y--) {
    yearList.push({ label: y.toString(), value: y.toString() });
  }

  const monthList = [
    { label: "All Months", value: "all" },
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" }
  ];

  const fetchRewardsSummary = (yearVal, monthVal) => {
    setLoading(true);
    let params = [];
    if (yearVal && yearVal !== "all") params.push(`year=${yearVal}`);
    if (monthVal && monthVal !== "all") params.push(`month=${monthVal}`);
    const query = params.length > 0 ? `?${params.join("&")}` : "";

    PagesIndex.DataService.get(`${PagesIndex.Api.GET_REWARDS_SUMMARY}${query}`)
      .then((res) => {
        if (res?.status === 200) {
          const data = res?.data?.data || [];
          setRewardsData(data);
          setFilteredData(data);
          // Apply search filter if there was text previously typed
          if (searchValue) {
            const searchTerm = searchValue.toLowerCase();
            const filtered = data.filter((item) => {
              return (
                item?.userName?.toLowerCase()?.includes(searchTerm) ||
                item?.userEmail?.toLowerCase()?.includes(searchTerm)
              );
            });
            setFilteredData(filtered);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message || "Failed to fetch rewards summary");
      });
  };

  useEffect(() => {
    fetchRewardsSummary(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Handle Search
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    const searchTerm = searched.toLowerCase();

    const filtered = rewardsData.filter((data) => {
      return (
        data?.userName?.toLowerCase()?.includes(searchTerm) ||
        data?.userEmail?.toLowerCase()?.includes(searchTerm)
      );
    });

    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleYearChange = (e) => {
    const val = e.target.value;
    setSelectedYear(val);
    if (val === "all") {
      setSelectedMonth("all");
    }
    setCurrentPage(0);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setCurrentPage(0);
  };

  // Generate Excel File
  const generateExcel = async () => {
    const headers = [
      "User Name",
      "User Email",
      "Cinemas & Locations",
      "Total Earned Points",
      "Total Redeemed Points",
      "Total Pending Points",
      "First Redemption Date",
      "Last Redemption Date"
    ];

    const rows = filteredData.map((item) => ({
      "User Name": item?.userName || "N/A",
      "User Email": item?.userEmail || "N/A",
      "Cinemas & Locations": (item?.cinemas || [])
        .map((c) => `${c.cinemaName} (${c.location})`)
        .join(", ") || "-",
      "Total Earned Points": item?.totalEarnedPoints ?? 0,
      "Total Redeemed Points": item?.totalRedeemedPoints ?? 0,
      "Total Pending Points": item?.totalPendingPoints ?? 0,
      "First Redemption Date": item?.firstRedemptionDate
        ? moment(item?.firstRedemptionDate).format("DD/MM/YYYY")
        : "-",
      "Last Redemption Date": item?.lastRedemptionDate
        ? moment(item?.lastRedemptionDate).format("DD/MM/YYYY")
        : "-"
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Rewards Summary");
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

    PagesIndex.XLSX.writeFile(
      workbook,
      `Rewards_Summary_${PagesIndex.moment().format("DD-MM-YYYY_hh:mm:ss_A")}.xlsx`,
      { compression: true }
    );
  };

  // Metrics summary
  const totalEarnedFiltered = filteredData.reduce((acc, curr) => acc + (curr.totalEarnedPoints || 0), 0);
  const totalRedeemedFiltered = filteredData.reduce((acc, curr) => acc + (curr.totalRedeemedPoints || 0), 0);
  const totalPendingFiltered = filteredData.reduce((acc, curr) => acc + (curr.totalPendingPoints || 0), 0);

  const displayData = filteredData;
  const colSpan = 8;

  return (
    <Index.Box className="rewards-page">
      <Index.Box className="title-main common-export-flex" mb={2}>
        <Index.Typography variant="p" component="p" className="page-title">
          Rewards Summary
        </Index.Typography>
      </Index.Box>

      {/* Dashboard Metric Cards */}
      <Index.Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { title: "Total Points Earned", val: totalEarnedFiltered },
          { title: "Total Points Redeemed", val: totalRedeemedFiltered },
          { title: "Total Points Pending", val: totalPendingFiltered },
        ].map((metric, i) => (
          <Index.Grid item lg={3} md={4} sm={6} xs={12} key={i}>
            <Index.Box className="dash-card-box">
              <Index.Typography className="dash-card-title">
                {metric.title}
              </Index.Typography>
              <Index.Box className="dash-card-flex">
                <Index.Typography className="dash-card-amont">
                  {loading ? "..." : metric.val.toLocaleString()}
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
          <Index.Box className="title-header-flex res-title-header-flex" sx={{ flexWrap: "wrap", gap: 2 }}>
            
            {/* Year & Month Dropdown Selects */}
            <Index.Box className="d-flex align-items-center" sx={{ gap: 2, flexWrap: "wrap" }}>
              <Index.Box className="dash-dropdown-main" sx={{ m: 0 }}>
                <Index.FormControl className="dash-form-control" sx={{ minWidth: 120 }}>
                  <Index.Select
                    className="dash-dropdown-select"
                    value={selectedYear}
                    onChange={handleYearChange}
                    displayEmpty
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: { className: "dash-dropdown-box" }
                    }}
                  >
                    {yearList.map((year) => (
                      <Index.MenuItem key={year.value} value={year.value} className="dash-menuitem">
                        {year.label}
                      </Index.MenuItem>
                    ))}
                  </Index.Select>
                </Index.FormControl>
              </Index.Box>

              <Index.Box className="dash-dropdown-main" sx={{ m: 0 }}>
                <Index.FormControl className="dash-form-control" sx={{ minWidth: 150 }}>
                  <Index.Select
                    className="dash-dropdown-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    disabled={selectedYear === "all"}
                    displayEmpty
                    MenuProps={{
                      disableScrollLock: true,
                      PaperProps: { className: "dash-dropdown-box" }
                    }}
                  >
                    {monthList.map((month) => (
                      <Index.MenuItem key={month.value} value={month.value} className="dash-menuitem">
                        {month.label}
                      </Index.MenuItem>
                    ))}
                  </Index.Select>
                </Index.FormControl>
              </Index.Box>
            </Index.Box>

            {/* Search and Export Buttons */}
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search" sx={{ ml: "auto" }}>
              <Search className="search">
                <StyledInputBase
                  placeholder="Search user..."
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
            </Index.Box>

          </Index.Box>
        </Index.Box>

        {/* Table representation */}
        <Index.Box className="page-table-main">
          <Index.TableContainer component={Index.Paper} className="table-container">
            <Index.Table aria-label="simple table" className="table-design-main one-line-table">
              <Index.TableHead>
                <Index.TableRow>
                  <Index.TableCell>User Name</Index.TableCell>
                  <Index.TableCell>User Email</Index.TableCell>
                  <Index.TableCell>Cinemas & Locations</Index.TableCell>
                  <Index.TableCell align="right">Earned Points</Index.TableCell>
                  <Index.TableCell align="right">Redeemed Points</Index.TableCell>
                  <Index.TableCell align="right">Pending Points</Index.TableCell>
                  <Index.TableCell>First Redemption</Index.TableCell>
                  <Index.TableCell>Last Redemption</Index.TableCell>
                </Index.TableRow>
              </Index.TableHead>

              {loading ? (
                <Index.TableBody>
                  <Index.TableRow>
                    <Index.TableCell component="td" variant="td" scope="row" className="no-data-in-list" colSpan={colSpan} align="center">
                      <Index.Loader />
                    </Index.TableCell>
                  </Index.TableRow>
                </Index.TableBody>
              ) : (
                <Index.TableBody>
                  {displayData?.length ? (
                    displayData
                      .slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)
                      .map((data, index) => (
                        <Index.TableRow key={index}>
                          <Index.TableCell sx={{ fontWeight: "600" }}>{data?.userName || "N/A"}</Index.TableCell>
                          <Index.TableCell>{data?.userEmail || "N/A"}</Index.TableCell>
                          <Index.TableCell>
                            <Index.Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {(data?.cinemas || []).map((cinema, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: "#e3f2fd",
                                    color: "#0d47a1",
                                    fontSize: 11,
                                    fontFamily: "poppins-medium",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {cinema.cinemaName} ({cinema.location})
                                </span>
                              ))}
                              {(!data?.cinemas || data?.cinemas.length === 0) && "-"}
                            </Index.Box>
                          </Index.TableCell>
                          <Index.TableCell align="right" style={{ color: "#1a6b2e", fontWeight: "600" }}>
                            {data?.totalEarnedPoints ?? 0}
                          </Index.TableCell>
                          <Index.TableCell align="right" style={{ color: "#b91c1c", fontWeight: "600" }}>
                            {data?.totalRedeemedPoints ?? 0}
                          </Index.TableCell>
                          <Index.TableCell align="right" style={{ color: "#e65100", fontWeight: "600" }}>
                            {data?.totalPendingPoints ?? 0}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.firstRedemptionDate ? moment(data?.firstRedemptionDate).format("DD/MM/YYYY") : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {data?.lastRedemptionDate ? moment(data?.lastRedemptionDate).format("DD/MM/YYYY") : "-"}
                          </Index.TableCell>
                        </Index.TableRow>
                      ))
                  ) : (
                    <Index.TableRow>
                      <Index.TableCell component="td" variant="td" scope="row" className="no-data-in-list" colSpan={colSpan} align="center">
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
    </Index.Box>
  );
};

export default RewardsSummary;
