import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import Paper from "@mui/material/Paper";
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
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: { width: "20ch" },
  },
}));

const TypeBadge = ({ type }) =>
  type === "redeemed" ? (
    <span className="reward-type-badge redeemed">Redeemed</span>
  ) : (
    <span className="reward-type-badge earned">Earned</span>
  );

const ExpiryCell = ({ data }) => {
  if (data?.type !== "earned") return <span>-</span>;
  if (data?.isExpired)
    return <span className="reward-expiry-badge expired">Expired</span>;
  if (data?.isExpiringSoon)
    return (
      <Index.Tooltip
        title={`Expires on ${PagesIndex.moment(data?.expiryDate).format("DD/MM/YYYY")}`}
      >
        <span className="reward-expiry-badge expiring">
          {PagesIndex.moment(data?.expiryDate).format("DD/MM/YYYY")} ⚠
        </span>
      </Index.Tooltip>
    );
  if (data?.expiryDate)
    return (
      <span className="reward-expiry-text">
        {PagesIndex.moment(data?.expiryDate).format("DD/MM/YYYY")}
      </span>
    );
  return <span>-</span>;
};

const Reward = ({ rewardList }) => {
  const { userToken } = PagesIndex.useSelector((state) => state.UserReducer);

  const [filterType, setFilterType] = useState("all");
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [balance, setBalance] = useState({
    availableCoins: 0,
    conversionPoints: 100,
    conversionValue: 10,
  });

  // Fetch live balance for summary cards
  useEffect(() => {
    if (userToken) {
      PagesIndex.apiGetHandler(PagesIndex.Api.REWARD_BALANCE, "", userToken)
        .then((res) => {
          if (res?.status === 200) setBalance(res.data);
        })
        .catch(() => {});
    }
  }, [userToken]);

  // Reapply filter whenever list or filterType changes
  useEffect(() => {
    applyFilter(filterType, searchValue, rewardList);
  }, [rewardList, filterType]);

  const applyFilter = (type, search, list) => {
    const base = (list || []).filter((r) =>
      type === "all" ? true : r.type === type
    );
    if (!search) {
      setFilteredData(base);
      return;
    }
    const term = search.toLowerCase();
    setFilteredData(
      base.filter(
        (d) =>
          d?.coins?.toString()?.includes(term) ||
          d?.transactionId?.movieId?.name?.toLowerCase()?.includes(term) ||
          d?.transactionId?.initTransId?.toString()?.includes(term) ||
          (d?.createdAt &&
            PagesIndex.moment(d?.createdAt)
              .format("DD/MM/YYYY")
              .includes(term))
      )
    );
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setSearchValue("");
    setPage(0);
    applyFilter(type, "", rewardList);
  };

  const handleSearch = (e) => {
    const val = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(val);
    setPage(0);
    applyFilter(filterType, val, rewardList);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Summary computed from rewardList
  const totalEarned = (rewardList || [])
    .filter((r) => r.type === "earned")
    .reduce((sum, r) => sum + (r.coins || 0), 0);

  const totalRedeemed = (rewardList || [])
    .filter((r) => r.type === "redeemed")
    .reduce((sum, r) => sum + (r.coins || 0), 0);

  const expiringSoonCoins = (rewardList || [])
    .filter((r) => r.type === "earned" && r.isExpiringSoon && !r.isExpired)
    .reduce((sum, r) => sum + Math.max(0, (r.coins || 0) - (r.redeemCoins || 0)), 0);

  const colSpan = filterType === "redeemed" ? 3 : 5;
  const paginated = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Index.Box className="account-tab-booking-main">
      {/* ── Summary Cards ── */}
      <Index.Box className="reward-summary-cards">
        <Index.Box className="reward-summary-card">
          <Index.Box className="reward-summary-icon">
            <Index.MonetizationOnIcon />
          </Index.Box>
          <Index.Box className="reward-summary-info">
            <Index.Typography className="reward-summary-label">
              Total Earned
            </Index.Typography>
            <Index.Typography className="reward-summary-value">
              {totalEarned.toLocaleString()} pts
            </Index.Typography>
          </Index.Box>
        </Index.Box>

        <Index.Box className="reward-summary-card">
          <Index.Box className="reward-summary-icon redeemed">
            <Index.RedeemIcon />
          </Index.Box>
          <Index.Box className="reward-summary-info">
            <Index.Typography className="reward-summary-label">
              Total Redeemed
            </Index.Typography>
            <Index.Typography className="reward-summary-value">
              {totalRedeemed.toLocaleString()} pts
            </Index.Typography>
          </Index.Box>
        </Index.Box>

        <Index.Box className="reward-summary-card highlight">
          <Index.Box className="reward-summary-icon available">
            <Index.MonetizationOnIcon />
          </Index.Box>
          <Index.Box className="reward-summary-info">
            <Index.Typography className="reward-summary-label">
              Available Balance
            </Index.Typography>
            <Index.Typography className="reward-summary-value gold">
              {balance.availableCoins.toLocaleString()} pts
            </Index.Typography>
            <Index.Typography className="reward-summary-sub">
              {balance.conversionPoints} pts = ₹{balance.conversionValue}
            </Index.Typography>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* ── Expiry warning banner ── */}
      {expiringSoonCoins > 0 && (
        <Index.Box className="reward-expiry-warning-banner">
          <span className="reward-expiry-warning-icon">⚠</span>
          <Index.Typography className="reward-expiry-warning-text">
            <strong>{expiringSoonCoins.toLocaleString()} pts</strong> expiring
            in 7 days — redeem before they expire!
          </Index.Typography>
        </Index.Box>
      )}

      {/* ── Header: filters + search ── */}
      <Index.Box className="account-tab-heading-box" style={{ marginTop: 20 }}>
        <Index.Box className="flex-align-member-search">
          <Index.Box className="reward-filter-btns">
            <button
              className={`reward-filter-btn${filterType === "all" ? " active-all" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              All
            </button>
            <button
              className={`reward-filter-btn${filterType === "earned" ? " active-earned" : ""}`}
              onClick={() => handleFilterChange("earned")}
            >
              Earned
            </button>
            <button
              className={`reward-filter-btn${filterType === "redeemed" ? " active-redeemed" : ""}`}
              onClick={() => handleFilterChange("redeemed")}
            >
              Redeemed
            </button>
          </Index.Box>

          <Index.Box className="membership-search">
            <Search className="search">
              <StyledInputBase
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={searchValue}
                onChange={handleSearch}
              />
            </Search>
            <Index.Box className="search-icon-transaction">
              <Index.SearchIcon />
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* ── Table ── */}
      <Index.Box className="transaction-user-table">
        <Index.TableContainer
          component={Paper}
          className="user-transaction-container"
        >
          <Index.Table className="user-transaction-table">
            <Index.TableHead className="user-transaction-table-head">
              <Index.TableRow className="transaction-table-row">
                <Index.TableCell className="transaction-table-cell">
                  Date
                </Index.TableCell>
                {filterType !== "redeemed" && (
                  <Index.TableCell className="transaction-table-cell">
                    Movie / Booking Id
                  </Index.TableCell>
                )}
                {filterType === "redeemed" && (
                  <Index.TableCell className="transaction-table-cell">
                    Booking Reference
                  </Index.TableCell>
                )}
                <Index.TableCell className="transaction-table-cell">
                  {filterType === "redeemed" ? "Points Redeemed" : "Coins"}
                </Index.TableCell>
                {filterType !== "redeemed" && (
                  <Index.TableCell className="transaction-table-cell">
                    Amount
                  </Index.TableCell>
                )}
                {filterType !== "redeemed" && (
                  <Index.TableCell className="transaction-table-cell">
                    Expiry Date
                  </Index.TableCell>
                )}
                <Index.TableCell className="transaction-table-cell">
                  Type
                </Index.TableCell>
              </Index.TableRow>
            </Index.TableHead>

            <Index.TableBody className="transaction-table-body">
              {paginated.length > 0 ? (
                paginated.map((item, idx) => (
                  <Index.TableRow className="transaction-table-row" key={idx}>
                    {/* Date */}
                    <Index.TableCell className="transaction-table-cell">
                      {item?.createdAt
                        ? PagesIndex.moment(item.createdAt).format("DD/MM/YYYY")
                        : "-"}
                    </Index.TableCell>

                    {/* Movie / Booking Id — earned & all */}
                    {filterType !== "redeemed" && (
                      <Index.TableCell className="transaction-table-cell">
                        {item?.transactionId?.movieId?.name && (
                          <>
                            <b>Movie:</b> {item.transactionId.movieId.name}
                            <br />
                          </>
                        )}
                        {item?.transactionId?.initTransId && (
                          <>
                            <b>Booking Id:</b> {item.transactionId.initTransId}
                          </>
                        )}
                        {!item?.transactionId?.movieId?.name &&
                          !item?.transactionId?.initTransId &&
                          "-"}
                      </Index.TableCell>
                    )}

                    {/* Booking Reference — redeemed */}
                    {filterType === "redeemed" && (
                      <Index.TableCell className="transaction-table-cell">
                        {item?.transactionId?.initTransId || "-"}
                      </Index.TableCell>
                    )}

                    {/* Coins */}
                    <Index.TableCell className="transaction-table-cell">
                      {item?.coins != null ? item.coins : "-"}
                    </Index.TableCell>

                    {/* Amount — earned & all */}
                    {filterType !== "redeemed" && (
                      <Index.TableCell className="transaction-table-cell">
                        {item?.transactionId?.paymentResponse?.amount
                          ? `₹${item.transactionId.paymentResponse.amount}`
                          : "-"}
                      </Index.TableCell>
                    )}

                    {/* Expiry — earned & all */}
                    {filterType !== "redeemed" && (
                      <Index.TableCell className="transaction-table-cell">
                        <ExpiryCell data={item} />
                      </Index.TableCell>
                    )}

                    {/* Type badge */}
                    <Index.TableCell className="transaction-table-cell">
                      <TypeBadge type={item?.type} />
                    </Index.TableCell>
                  </Index.TableRow>
                ))
              ) : (
                <Index.TableRow>
                  <Index.TableCell
                    component="td"
                    scope="row"
                    colSpan={colSpan}
                    align="center"
                    className="transaction-table-cell"
                  >
                    No rewards available
                  </Index.TableCell>
                </Index.TableRow>
              )}
            </Index.TableBody>
          </Index.Table>
        </Index.TableContainer>

        <Index.TablePagination
          className="pagination-user-table"
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Index.Box>
    </Index.Box>
  );
};

export default Reward;
