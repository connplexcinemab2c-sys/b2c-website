import React, { useEffect, useMemo, useRef, useState } from "react";
import Index from "../../../../Index";
import PagesIndex from "../../../../PagesIndex";
import { adminLogout } from "../../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import CanvasJSReact from "@canvasjs/react-charts";
import moment from "moment";
import { ECOMMERCE_IMAGES_API_ENDPOINT } from "../../../../../config/EcommerceService";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
const periods = [
  {
    value: "yesterday",
    label: "Yesterday",
  },
  {
    value: "month",
    label: "Month",
  },
  {
    value: "year",
    label: "Year",
  },
];
const ecommerceFilterKeys = ["orders_count", "ecommerceRevenue"];

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const isFirstLoad = useRef(true);

  const yearList = useMemo(() => {
    const startYear = 2021;
    const currentYear = +PagesIndex.moment().format("YYYY");
    const currentMonth = +PagesIndex.moment().format("M"); // 1-12

    // If current month is Jan–Mar, we're still in the previous financial year
    const latestFYStartYear = currentMonth < 4 ? currentYear - 1 : currentYear;

    return Array.from({ length: latestFYStartYear - startYear + 1 }, (_, i) => {
      const fyStart = startYear + i;
      const fyEnd = fyStart + 1;
      return {
        label: `${fyStart} - ${fyEnd}`,
        value: fyStart,
      };
    });
  }, []);

  const monthList = useMemo(() => {
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (i + 3) % 12;
      return {
        label: PagesIndex.moment().month(monthIndex).format("MMMM"),
        value: monthIndex,
      };
    });

    return [{ label: "All Months", value: null }, ...allMonths];
  }, []);

  const [value, setValue] = React.useState("month");
  const [filter, setFilter] = useState({
    // year: +PagesIndex.moment().format("YYYY"),
    year:
      PagesIndex.moment().month() < 3
        ? PagesIndex.moment().year() - 1
        : PagesIndex.moment().year(),
    month: PagesIndex.moment().month(),
  });
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  // const [filteredData, setFilteredData] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [ecommerceDashboardData, setEcommerceDashboardData] = useState([]);

  const handleDateRangeChange = (newValue) => {
    setDateRangeFilter(newValue);
    if (newValue?.[0] && newValue?.[1]) {
      fetchDashboardData(newValue);
      fetchEcommerceDashboardData(newValue);
    }
  };

  const handleToggleDateRange = () => {
    setShowDateRange((prev) => {
      if (prev && dateRangeFilter?.[0] && dateRangeFilter?.[1]) {
        fetchDashboardData();
        fetchEcommerceDashboardData();
        setDateRangeFilter([null, null]);
      }
      return !prev;
    });
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };
  const getCurrentMonthRange = (filter, dateRange) => {
    let start, end;
    const { year, month } = filter;
    if (dateRange?.[0] && dateRange?.[1]) {
      // Custom start/end date range
      const startDate = moment(dateRange[0]?.$d).format("YYYY-MM-DD");
      const endDate = moment(dateRange[1]?.$d).format("YYYY-MM-DD");
      console.log("startDate", filter, dateRange, startDate, endDate);
      start = moment(startDate, "YYYY-MM-DD")
        .startOf("day")
        .format("D MMM YYYY");
      end = moment(endDate, "YYYY-MM-DD").endOf("day").format("D MMM YYYY");
      return `${start} - ${end}`;
    } else if (year && (month || month === 0)) {
      // Month is provided (0-indexed)
      start = moment({ year: month < 3 ? year + 1 : year, month })
        .startOf("month")
        .startOf("day")
        .format("D MMM YYYY");
      end = moment({ year: month < 3 ? year + 1 : year, month })
        .endOf("month")
        .endOf("day")
        .format("D MMM YYYY");
      return `${start} - ${end}`;
    } else {
      // Financial Year
      start = moment({ year, month: 3 })
        .startOf("month")
        .startOf("day")
        .format("D MMM YYYY");
      end = moment({ year: year + 1, month: 2 })
        .endOf("month")
        .endOf("day")
        .format("D MMM YYYY");
      return `${start} - ${end}`;
    }
  };

  const fetchDashboardData = (dateRange) => {
    // setLoading(true);
    let dashboardFilters = { ...filter };

    if (dateRange?.[0] && dateRange?.[1]) {
      dashboardFilters.startDate = PagesIndex.moment(dateRange[0]?.$d).format(
        "YYYY-MM-DD"
      );
      dashboardFilters.endDate = PagesIndex.moment(dateRange[1]?.$d).format(
        "YYYY-MM-DD"
      );
    }

    PagesIndex.DataService.post(PagesIndex.Api.GET_DASHBOARD_DATA, {
      filter: dashboardFilters,
    })
      .then((res) => {
        setDashboardData(res?.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const fetchEcommerceDashboardData = (dateRange) => {
    // setLoading(true);
    let ecommerceFilters = { ...filter };

    if (dateRange?.[0] && dateRange?.[1]) {
      ecommerceFilters.startDate = PagesIndex.moment(dateRange[0]?.$d).format(
        "YYYY-MM-DD"
      );
      ecommerceFilters.endDate = PagesIndex.moment(dateRange[1]?.$d).format(
        "YYYY-MM-DD"
      );
    }

    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.GET_ECOMMERCE_DASHBOARD_DATA,
      {
        filter: ecommerceFilters,
        permissions: adminLoginData?.roleId?.permissions,
        adminType: adminLoginData?.type,
      }
    )
      .then((res) => {
        setEcommerceDashboardData(res?.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const handleChangedropdown = (e, name) => {
    setValue(e.target.value);
    const selectedPeriod = e.target.value;
    // setValue(selectedPeriod);
    setFilter((prev) => ({ ...prev, [name]: selectedPeriod }));
  };
  // console.log({ filter });

  useEffect(() => {
    if (isFirstLoad.current) {
      setLoading(true);
      fetchDashboardData();
      fetchEcommerceDashboardData();
      isFirstLoad.current = false;
    } else {
      fetchDashboardData();
      fetchEcommerceDashboardData();
    }
  }, [filter]);

  const hasPermission = (userData = [], requiredPermissions = []) => {
    if (userData?.type === "Admin") return true;
    const userPermissions = userData?.roleId?.permissions ?? [];
    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    return required.some((permission) => userPermissions?.includes(permission));
  };

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("dashboard_view")
  ) {
    return (
      <>
        {loading ? (
          <Index.Loader />
        ) : (
          <Index.Box className="dashboard-main">
            <Index.Box className="dash-bg-section">
              <Index.Box className="dash-content-section">
                <Index.Typography className="dash-title">
                  {getGreeting()},{" "}
                  <span>
                    {adminLoginData?.name?.charAt(0)?.toUpperCase() +
                      adminLoginData?.name?.slice(1)?.toLowerCase()}
                  </span>
                </Index.Typography>
                <Index.Typography className="dash-title-para">
                  {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit */}
                </Index.Typography>
                {hasPermission(adminLoginData, [
                  "total_revenue_dashboard_card_view",
                  "ecommerce_revenue_dashboard_card_view",
                  "ticket_revenue_dashboard_card_view",
                  "ticket_transactions_dashboard_card_view",
                  "membership_transactions_dashboard_card_view",
                  "movie_dashboard_card_view",
                  "app_downloads_dashboard_card_view",
                  "top_selling_products_dashboard_card_view",
                  "admit_count_dashboard_card_view",
                  "user_count_dashboard_card_view",
                  "membership_dashboard_card_view",
                  "brand_influencer_dashboard_card_view",
                  "group_booking_dashboard_card_view",
                  "franchise_dashboard_card_view",
                  "twentymin_franchise_dashboard_card_view",
                  "food_beverages_dashboard_card_view",
                  "ecommerce_orders_dashboard_card_view",
                ]) && (
                  <Index.Box className="dashboard-filter-flex">
                    <Index.Box className="dash-dropdown-main">
                      <Index.FormControl className="dash-form-control">
                        <Index.Select
                          className="dash-dropdown-select"
                          value={filter?.year}
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              year: e.target.value,
                            }))
                          }
                          disabled={showDateRange}
                          displayEmpty
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              className: "dash-dropdown-box",
                            },
                          }}
                        >
                          {yearList?.map((year) => (
                            <Index.MenuItem
                              key={year.value}
                              value={year.value}
                              className="dash-menuitem"
                            >
                              {year.label}
                            </Index.MenuItem>
                          ))}
                        </Index.Select>
                      </Index.FormControl>
                    </Index.Box>
                    <Index.Box className="dash-dropdown-main">
                      <Index.FormControl className="dash-form-control">
                        <Index.Select
                          className="dash-dropdown-select "
                          value={filter?.month}
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              month: e.target.value,
                            }))
                          }
                          disabled={showDateRange}
                          displayEmpty
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              className: "dash-dropdown-box",
                            },
                          }}
                        >
                          {monthList?.map((month) => (
                            <Index.MenuItem
                              key={month.value}
                              value={month.value}
                              className="dash-menuitem"
                            >
                              {month.label}
                            </Index.MenuItem>
                          ))}
                        </Index.Select>
                      </Index.FormControl>
                    </Index.Box>
                    <Index.Box className="dash-date-toggle-main">
                      <Index.IconButton
                        onClick={handleToggleDateRange}
                        className={`filter-icon-btn ${
                          showDateRange ? "active" : ""
                        }`}
                      >
                        <img
                          src={PagesIndex.Svg.filterIcon}
                          alt="filter-icon"
                          className=""
                        />
                      </Index.IconButton>
                    </Index.Box>
                    {showDateRange && (
                      <Index.Box className="dash-date-range-main">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={["DateRangePicker"]}>
                            <DateRangePicker
                              className="range-picker-input"
                              value={[
                                PagesIndex.dayjs(dateRangeFilter[0]),
                                PagesIndex.dayjs(dateRangeFilter[1]),
                              ]}
                              onChange={handleDateRangeChange}
                              format="DD-MM-YYYY"
                              slotProps={{
                                textField: ({ position }) => ({
                                  error: false, // <- Set error explicitly to false
                                  focused: false,
                                }),
                              }}
                            />
                          </DemoContainer>
                        </LocalizationProvider>
                      </Index.Box>
                    )}
                  </Index.Box>
                )}
              </Index.Box>
            </Index.Box>
            <Index.Box className="dash-section-wrraper">
              <Index.Box className="dash-card-row">
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "total_revenue_dashboard_card_view"
                  )) && (
                  <Index.Box className="dash-card-box">
                    <Index.Typography className="dash-card-title">
                      Revenue
                    </Index.Typography>
                    <Index.Typography className="dash-card-para">
                      {getCurrentMonthRange(filter, dateRangeFilter)}
                    </Index.Typography>
                    <Index.Box className="dash-card-flex">
                      <Index.Typography className="dash-card-amont">
                        {(
                          (ecommerceDashboardData?.totalRevenue || 0) +
                          (dashboardData?.totalTicketsRevenue || 0)
                        )
                          // (dashboardData?.totalRevenue || 0)
                          .toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                      </Index.Typography>
                      <Index.Box className="dash-card-icon-box">
                        <img
                          src={PagesIndex.Svg.yellowWalletIcon}
                          alt="dashcard1"
                        />
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}

                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "ecommerce_revenue_dashboard_card_view"
                  )) && (
                  <Index.Box className="dash-card-box">
                    <Index.Typography className="dash-card-title">
                      Ecommerce Revenure
                    </Index.Typography>
                    <Index.Typography className="dash-card-para">
                      {getCurrentMonthRange(filter, dateRangeFilter)}
                    </Index.Typography>
                    <Index.Box className="dash-card-flex">
                      <Index.Typography className="dash-card-amont">
                        {(
                          ecommerceDashboardData?.totalEcommerceRevenue || 0
                        )?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }) || "0.00"}
                      </Index.Typography>
                      <Index.Box className="dash-card-icon-box">
                        <img
                          src={PagesIndex.Svg.yellowWalletIcon}
                          alt="dashcard1"
                        />
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "ticket_revenue_dashboard_card_view"
                  )) && (
                  <Index.Box className="dash-card-box">
                    <Index.Typography className="dash-card-title">
                      Tickets Booking
                    </Index.Typography>
                    <Index.Typography className="dash-card-para">
                      {getCurrentMonthRange(filter, dateRangeFilter)}
                    </Index.Typography>
                    <Index.Box className="dash-card-flex">
                      <Index.Typography className="dash-card-amont">
                        {dashboardData?.totalTicketsRevenue?.toLocaleString(
                          "en-IN",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        ) || "0.00"}
                      </Index.Typography>
                      <Index.Box className="dash-card-icon-box">
                        <img
                          src={PagesIndex.Svg.yellowWalletIcon}
                          alt="dashcard1"
                        />
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "ticket_transactions_dashboard_card_view"
                  ) ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "ticket_transactions_dashboard_card_view_view"
                  )) && (
                  <Index.Box className="dash-card-box">
                    <Index.Typography className="dash-card-title">
                      Ticket Transactions
                    </Index.Typography>
                    <Index.Typography className="dash-card-para">
                      {getCurrentMonthRange(filter, dateRangeFilter)}
                    </Index.Typography>
                    <Index.Box className="dash-card-flex">
                      <Index.Box className="dash-amount-main">
                        <Index.Typography className="dash-card-amont-label success">
                          Success
                        </Index.Typography>
                        <Index.Typography className="dash-card-amont">
                          {dashboardData?.totalTicketSuccessTransactions || 0}
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box
                        className="dash-amount-main"
                        onClick={() =>
                          navigate(
                            `/admin/failed-history?date=${getCurrentMonthRange(
                              filter,
                              dateRangeFilter
                            )}`
                          )
                        }
                      >
                        <Index.Typography className="dash-card-amont-label failed">
                          Failed
                        </Index.Typography>
                        <Index.Typography className="dash-card-amont">
                          {dashboardData?.totalTicketFailedTransactions || 0}
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "membership_transactions_dashboard_card_view"
                  ) ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "membership_transactions_dashboard_card_view_view"
                  )) && (
                  <Index.Box className="dash-card-box">
                    <Index.Typography className="dash-card-title">
                      Membership Transactions
                    </Index.Typography>
                    <Index.Typography className="dash-card-para">
                      {getCurrentMonthRange(filter, dateRangeFilter)}
                    </Index.Typography>
                    <Index.Box className="dash-card-flex">
                      <Index.Box className="dash-amount-main">
                        <Index.Typography className="dash-card-amont-label success">
                          Success
                        </Index.Typography>
                        <Index.Typography className="dash-card-amont">
                          {dashboardData?.totalMembershipSuccessTransactions ||
                            0}
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-amount-main">
                        <Index.Typography className="dash-card-amont-label failed">
                          Failed
                        </Index.Typography>
                        <Index.Typography className="dash-card-amont">
                          {dashboardData?.totalMembershipFailedTransactions ||
                            0}
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
              </Index.Box>
              <Index.Box
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                className="dash-chart-row"
              >
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "top_locations_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 4",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          Top Locations - Ticket Bookings
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-chart-box dash-card-scroll">
                          <PagesIndex.ChartTopLocations
                            topLocations={dashboardData?.topCinemas}
                          />
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "movie_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 4",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          Movies - Ticket Bookings
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-chart-box dash-card-scroll">
                          <PagesIndex.ChartTopLocations
                            topCinemasForMovie={dashboardData?.topMovies}
                          />
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "app_downloads_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 4",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          {/* App Downloads */}
                          Registered Users
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-chart-box dash-card-scroll">
                          <PagesIndex.ChartAppDownloads
                            totalAppDownloadsByPlatform={
                              dashboardData?.totalAppDownloadsByPlatform
                            }
                          />
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "top_selling_products_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 4",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          Most Selling Products
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-product-wrapper dash-card-scroll">
                          {ecommerceDashboardData?.topSellingProducts?.length >
                          0
                            ? ecommerceDashboardData?.topSellingProducts?.map(
                                (product, index) => (
                                  <Index.Box
                                    className="dash-product-flex"
                                    key={index}
                                  >
                                    <Index.Box className="dash-product-img-flex">
                                      <img
                                        src={
                                          product?.image
                                            ? `${ECOMMERCE_IMAGES_API_ENDPOINT}/${product?.image}`
                                            : PagesIndex.Png.dashProductImg
                                        }
                                        alt={`product-${index}`}
                                        className="dash-product-img"
                                      />
                                      <Index.Box className="dash-product-content">
                                        <Index.Typography className="dash-product-title">
                                          {product?.productName?.length > 30 ? (
                                            <Index.Tooltip
                                              title={product?.productName}
                                              arrow
                                            >
                                              <span>
                                                {product?.productName.slice(
                                                  0,
                                                  30
                                                ) + "..."}
                                              </span>
                                            </Index.Tooltip>
                                          ) : (
                                            product?.productName || "-"
                                          )}
                                        </Index.Typography>
                                        <Index.Typography className="dash-product-para">
                                          ID :{" "}
                                          <span>
                                            {product?.productCode || ""}
                                          </span>
                                        </Index.Typography>
                                      </Index.Box>
                                    </Index.Box>
                                    <Index.Box className="dash-prodct-price-box">
                                      <Index.Typography className="dash-prodct-price">
                                        {product?.soldCount || ""}
                                      </Index.Typography>
                                    </Index.Box>
                                  </Index.Box>
                                )
                              )
                            : "No Data Found"}
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}

                <Index.Box
                  gridColumn={{
                    xs: "span 12",
                    sm: "span 12",
                    md: "span 6",
                    lg: "span 6",
                    xl: "span 4",
                  }}
                  className="grid-column"
                >
                  <Index.Box className="dash-mini-chart-flex">
                    {/* {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "admin_count_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Admins
                          </Index.Typography>
                          <Index.Box className="dash-dropdown-main dash-chart-dropdown-main">
                            <Index.FormControl className="dash-form-control">
                              <Index.Select
                                className="dash-dropdown-select "
                                value={filter?.admin_count}
                                onChange={(e) =>
                                  handleChangedropdown(e, "admin_count")
                                }
                                displayEmpty
                                MenuProps={{
                                  disableScrollLock: true,
                                  PaperProps: {
                                    className: "dash-dropdown-box",
                                  },
                                }}
                              >
                                {periods.map((period) => (
                                  <Index.MenuItem
                                    key={period.value}
                                    value={period.value}
                                    className="dash-menuitem"
                                  >
                                    {period.label}
                                  </Index.MenuItem>
                                ))}
                              </Index.Select>
                            </Index.FormControl>
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalAdmins || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )} */}
                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "admit_count_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Admits
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalAdmits || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}
                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "user_count_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Users
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalUsers || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}

                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "brand_influencer_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Brand Influencer
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalBrandInfluencer || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}
                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "group_booking_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Group Booking
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalGroupBooking || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}
                  </Index.Box>
                </Index.Box>

                <Index.Box
                  gridColumn={{
                    xs: "span 12",
                    sm: "span 12",
                    md: "span 6",
                    lg: "span 6",
                    xl: "span 4",
                  }}
                  className="grid-column"
                >
                  {(adminLoginData?.type == "Admin" ||
                    adminLoginData?.roleId?.permissions?.includes(
                      "membership_dashboard_card_view"
                    )) && (
                    <Index.Box className="dash-chart-box-main dash-chart-bottom-space">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-mini-title">
                          Memberships
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Typography className="dash-mini-chart-content-text">
                          {dashboardData?.totalMemberships || 0}
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  )}

                  <Index.Box className="dash-mini-chart-flex">
                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "franchise_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            Franchise
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalFranchise || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}
                    {(adminLoginData?.type == "Admin" ||
                      adminLoginData?.roleId?.permissions?.includes(
                        "twentymin_franchise_dashboard_card_view"
                      )) && (
                      <Index.Box className="dash-chart-box-main">
                        <Index.Box className="dash-chart-header">
                          <Index.Typography className="dash-chart-mini-title">
                            20 Mins Fran.
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="dash-chart-body">
                          <Index.Typography className="dash-mini-chart-content-text">
                            {dashboardData?.totalTwentyMinFranchise || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    )}
                  </Index.Box>
                </Index.Box>
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "food_beverages_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 12",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 4",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          Top Location - SPH
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-location-wrapper dash-card-scroll">
                          {dashboardData?.topFoodAndBeveragesCinemas?.length > 0
                            ? dashboardData?.topFoodAndBeveragesCinemas?.map(
                                (location, index) => (
                                  <Index.Box className="dash-location-flex">
                                    <Index.Typography className="dash-location-title">
                                      {location?.cinemaName ||
                                        "Unknown Location"}
                                    </Index.Typography>
                                    <Index.Box className="dash-location-price-box">
                                      <Index.Typography className="dash-location-price">
                                        {location?.bookingCount || 0}
                                      </Index.Typography>
                                    </Index.Box>
                                  </Index.Box>
                                )
                              )
                            : "No Data Available"}
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
                {(adminLoginData?.type == "Admin" ||
                  adminLoginData?.roleId?.permissions?.includes(
                    "ecommerce_orders_dashboard_card_view"
                  )) && (
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 12",
                      md: "span 6",
                      lg: "span 6",
                      xl: "span 8",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="dash-chart-box-main">
                      <Index.Box className="dash-chart-header">
                        <Index.Typography className="dash-chart-title">
                          Orders Count
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-chart-body">
                        <Index.Box className="dash-order-content-box">
                          <Index.Typography className="dash-order-content-text">
                            Orders Count
                          </Index.Typography>
                          <Index.Typography className="dash-order-content-digit">
                            {ecommerceDashboardData?.totalOrders || 0}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="dash-order-status-flex">
                      <Index.Box className="dash-order-status-box">
                        <Index.Typography className="dash-order-status-text">
                          Orders In Process
                        </Index.Typography>
                        <Index.Typography className="dash-order-status-digit">
                          {ecommerceDashboardData?.totalOrdersInProcess || 0}
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-order-status-box">
                        <Index.Typography className="dash-order-status-text">
                          Orders Delivered
                        </Index.Typography>
                        <Index.Typography className="dash-order-status-digit">
                          {ecommerceDashboardData?.totalOrdersDelivered || 0}
                        </Index.Typography>
                      </Index.Box>
                      <Index.Box className="dash-order-status-box">
                        <Index.Typography className="dash-order-status-text">
                          Orders Undelivered
                        </Index.Typography>
                        <Index.Typography className="dash-order-status-digit">
                          {ecommerceDashboardData?.totalOrdersUndelivered || 0}
                        </Index.Typography>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                )}
              </Index.Box>
            </Index.Box>
          </Index.Box>
        )}
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default Dashboard;
