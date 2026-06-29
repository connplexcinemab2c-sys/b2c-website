import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./VistaMovies.css";

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

const VistaMovies = () => {
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cinemaList, setCinemaList] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "now_showing", label: "Now Showing" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const getVistaMovies = () => {
    setLoading(true);
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_VISTA_MOVIES_BY_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          const data = res?.data?.data || {};
          const cinemas = res?.data?.cinemas || [];
          setMovieData(data);
          setCinemaList(cinemas);

          // Flatten movies for table view
          const allMovies = [];
          Object.keys(data).forEach((cinemaId) => {
            const cinemaInfo = data[cinemaId];
            cinemaInfo.movies?.forEach((movie) => {
              allMovies.push({
                ...movie,
                cinemaId: cinemaId,
                cinemaName: cinemaInfo.cinemaName || cinemaId,
                cinemaDetails: cinemaInfo.cinemaDetails || {},
              });
            });
          });
          setFilteredData(allMovies);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(
            err?.response?.data?.message || "Failed to fetch Vista movies"
          );
        }
      });
  };

  useEffect(() => {
    getVistaMovies();
  }, []);

  // Filter movies based on search, cinema and status selection
  const filterMovies = (search, cinema, status) => {
    let allMovies = [];
    Object.keys(movieData).forEach((cinemaId) => {
      const cinemaInfo = movieData[cinemaId];
      cinemaInfo.movies?.forEach((movie) => {
        allMovies.push({
          ...movie,
          cinemaId: cinemaId,
          cinemaName: cinemaInfo.cinemaName || cinemaId,
          cinemaDetails: cinemaInfo.cinemaDetails || {},
        });
      });
    });

    if (cinema) {
      allMovies = allMovies.filter((movie) => movie.cinemaId === cinema);
    }

    if (status) {
      if (status === "now_showing") {
        allMovies = allMovies.filter((movie) => movie.nowShowingFlag === "Y");
      } else if (status === "upcoming") {
        allMovies = allMovies.filter((movie) => movie.upcomingFlag === "Y");
      }
    }

    if (search) {
      allMovies = allMovies.filter(
        (movie) =>
          movie?.name?.toLowerCase().includes(search.toLowerCase()) ||
          movie?.filmCode?.toLowerCase().includes(search.toLowerCase()) ||
          movie?.category?.toLowerCase().includes(search.toLowerCase()) ||
          movie?.cinemaName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(allMovies);
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    filterMovies(newValue, selectedCinema, selectedStatus);
  };

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
    filterMovies(searchValue, e.target.value, selectedStatus);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    filterMovies(searchValue, selectedCinema, e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusLabel = (movie) => {
    if (movie.nowShowingFlag === "Y") return "Now Showing";
    if (movie.upcomingFlag === "Y") return "Upcoming";
    if (movie.featureFlag === "Y") return "Featured";
    return movie.status || "-";
  };

  const getStatusClass = (movie) => {
    if (movie.nowShowingFlag === "Y") return "status-now-showing";
    if (movie.upcomingFlag === "Y") return "status-upcoming";
    if (movie.featureFlag === "Y") return "status-featured";
    return "status-default";
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedCinema("");
    setSelectedStatus("");
    filterMovies("", "", "");
  };

  console.log(cinemaList, ":cinemaList")

  return (
    <Index.Box className="">
      <Index.Box className="barge-common-box" style={{ marginBottom: "15px" }}>
        <Index.Box className="title-header title-header-booking-form">
          <Index.Box className="booking-flex-content">
            <Index.Stack
              component="form"
              className="transaction-history-flex"
              noValidate
              autoComplete="off"
            >
              <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search flex-wrap">
                <Index.Box className="form-group w-100-res-drop" sx={{ minWidth: 180, mr: 2, mb: 1 }}>
                  <Index.Select
                    fullWidth
                    id="cinema-select"
                    name="cinema"
                    className="form-control"
                    displayEmpty
                    value={selectedCinema}
                    onChange={handleCinemaChange}
                    renderValue={
                      selectedCinema
                        ? () => {
                            const cinema = cinemaList.find(
                              (c) => c.cinemaId === selectedCinema
                            );
                            return cinema?.cinemaName || selectedCinema;
                          }
                        : () => "Select Cinema"
                    }
                  >
                    <Index.MenuItem value="">All Cinemas</Index.MenuItem>
                    {cinemaList?.map((cinema, index) => (
                      <Index.MenuItem key={index} value={cinema.cinemaId}>
                        {cinema.cinemaName} ({cinema.totalMovies} movies)
                      </Index.MenuItem>
                    ))}
                  </Index.Select>
                </Index.Box>

                <Index.Box className="form-group w-100-res-drop" sx={{ minWidth: 150, mr: 2, mb: 1 }}>
                  <Index.Select
                    fullWidth
                    id="status-select"
                    name="status"
                    className="form-control"
                    displayEmpty
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    renderValue={
                      selectedStatus
                        ? () => statusOptions.find((s) => s.value === selectedStatus)?.label
                        : () => "Select Status"
                    }
                  >
                    {statusOptions.map((option, index) => (
                      <Index.MenuItem key={index} value={option.value}>
                        {option.label}
                      </Index.MenuItem>
                    ))}
                  </Index.Select>
                </Index.Box>

                <Index.Box className="common-button blue-button res-blue-button" sx={{ mb: 1 }}>
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Index.Button>
                </Index.Box>
                <Index.Box className="common-button blue-button res-blue-button" sx={{ ml: 2, mb: 1 }}>
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={getVistaMovies}
                  >
                    <Index.SyncIcon sx={{ mr: 1 }} />
                    Refresh
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Stack>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      <Index.Box className="barge-common-box">
        <Index.Box className="title-header">
          <Index.Box className="title-header-flex res-title-header-flex">
            <Index.Box className="title-main common-export-flex">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                Vista Movies (Direct from API)
              </Index.Typography>
              <Index.Typography
                variant="span"
                component="span"
                className="page-subtitle"
                sx={{ ml: 2, color: "#666" }}
              >
                Total: {filteredData.length} movies | Cinemas: {cinemaList.length}
              </Index.Typography>
            </Index.Box>
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
              <Search className="search">
                <StyledInputBase
                  placeholder="Search movies..."
                  inputProps={{ "aria-label": "search" }}
                  value={searchValue}
                  onChange={handleInputChange}
                />
              </Search>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <Index.Box className="page-table-main">
          <Index.TableContainer component={Index.Paper} className="table-container">
            <Index.Table
              aria-label="vista movies table"
              className="table-design-main one-line-table"
            >
              <Index.TableHead>
                <Index.TableRow>
                  <Index.TableCell width="5%">S.No</Index.TableCell>
                  <Index.TableCell width="14%">Film Code</Index.TableCell>
                  <Index.TableCell width="25%">Movie Name</Index.TableCell>
                  <Index.TableCell width="18%">Cinema</Index.TableCell>
                  <Index.TableCell width="10%">Duration</Index.TableCell>
                  <Index.TableCell width="14%">Category</Index.TableCell>
                  <Index.TableCell width="12%">Status</Index.TableCell>
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
                      colSpan={7}
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
                      .slice(
                        currentPage * rowsPerPage,
                        currentPage * rowsPerPage + rowsPerPage
                      )
                      .map((movie, index) => (
                        <Index.TableRow key={`${movie.filmCode}-${index}`}>
                          <Index.TableCell>
                            {currentPage * rowsPerPage + index + 1}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip title={movie?.filmCode} placement="top" arrow>
                              <span>{movie?.filmCode || "-"}</span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip title={movie?.name} placement="top" arrow>
                              <span>
                                {movie?.name
                                  ? movie.name.length > 28
                                    ? movie.name.slice(0, 28) + "..."
                                    : movie.name
                                  : "-"}
                              </span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip
                              title={`${movie?.cinemaName} (${movie?.cinemaId})`}
                              placement="top"
                              arrow
                            >
                              <span>
                                {movie?.cinemaName
                                  ? movie.cinemaName.length > 18
                                    ? movie.cinemaName.slice(0, 18) + "..."
                                    : movie.cinemaName
                                  : movie?.cinemaId || "-"}
                              </span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            {formatDuration(movie?.duration)}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip title={movie?.category} placement="top" arrow>
                              <span>
                                {movie?.category
                                  ? movie.category.length > 15
                                    ? movie.category.slice(0, 15) + "..."
                                    : movie.category
                                  : "-"}
                              </span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Box
                              className={`status-badge ${getStatusClass(movie)}`}
                            >
                              {getStatusLabel(movie)}
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
                        colSpan={7}
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
        ) : null}
      </Index.Box>
    </Index.Box>
  );
};

export default VistaMovies;
