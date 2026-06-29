import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./VistaShows.css";

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

const VistaShows = () => {
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [cinemaList, setCinemaList] = useState([]);
  const [movieList, setMovieList] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "now_showing", label: "Now Showing" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const getVistaShows = () => {
    setLoading(true);
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_VISTA_SHOWS_BY_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          const data = res?.data?.data || {};
          const cinemas = res?.data?.cinemas || [];
          setShowData(data);
          setCinemaList(cinemas);

          // Flatten shows for table view
          const allShows = [];
          const allMovies = new Map();

          Object.keys(data).forEach((cinemaId) => {
            const cinemaInfo = data[cinemaId];
            cinemaInfo.shows?.forEach((show) => {
              allShows.push({
                ...show,
                cinemaId: cinemaId,
                cinemaName: cinemaInfo.cinemaName || cinemaId,
              });

              // Collect unique movies
              if (show.filmCode && !allMovies.has(show.filmCode)) {
                allMovies.set(show.filmCode, {
                  filmCode: show.filmCode,
                  movieName: show.movieName || show.filmCode,
                  nowShowingFlag: show.movieDetails?.nowShowingFlag,
                  upcomingFlag: show.movieDetails?.upcomingFlag,
                });
              }
            });
          });

          setFilteredData(allShows);
          setMovieList(Array.from(allMovies.values()));
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(
            err?.response?.data?.message || "Failed to fetch Vista shows"
          );
        }
      });
  };

  useEffect(() => {
    getVistaShows();
  }, []);

  // Update movie list when cinema changes
  useEffect(() => {
    if (selectedCinema && showData[selectedCinema]) {
      const cinemaMovies = showData[selectedCinema].movieWise || [];
      setMovieList(
        cinemaMovies.map((m) => ({
          filmCode: m.filmCode,
          movieName: m.movieName,
          totalShows: m.totalShows,
          nowShowingFlag: m.movieDetails?.nowShowingFlag,
          upcomingFlag: m.movieDetails?.upcomingFlag,
        }))
      );
    } else if (!selectedCinema) {
      // Reset to all movies
      const allMovies = new Map();
      Object.keys(showData).forEach((cinemaId) => {
        const cinemaInfo = showData[cinemaId];
        cinemaInfo.shows?.forEach((show) => {
          if (show.filmCode && !allMovies.has(show.filmCode)) {
            allMovies.set(show.filmCode, {
              filmCode: show.filmCode,
              movieName: show.movieName || show.filmCode,
              nowShowingFlag: show.movieDetails?.nowShowingFlag,
              upcomingFlag: show.movieDetails?.upcomingFlag,
            });
          }
        });
      });
      setMovieList(Array.from(allMovies.values()));
    }
    setSelectedMovie("");
  }, [selectedCinema, showData]);

  // Filter shows based on search, cinema, movie and status selection
  const filterShows = (search, cinema, movie, status) => {
    let allShows = [];
    Object.keys(showData).forEach((cinemaId) => {
      const cinemaInfo = showData[cinemaId];
      cinemaInfo.shows?.forEach((show) => {
        allShows.push({
          ...show,
          cinemaId: cinemaId,
          cinemaName: cinemaInfo.cinemaName || cinemaId,
        });
      });
    });

    if (cinema) {
      allShows = allShows.filter((show) => show.cinemaId === cinema);
    }

    if (movie) {
      allShows = allShows.filter((show) => show.filmCode === movie);
    }

    if (status) {
      if (status === "now_showing") {
        allShows = allShows.filter(
          (show) => show.movieDetails?.nowShowingFlag === "Y"
        );
      } else if (status === "upcoming") {
        allShows = allShows.filter(
          (show) => show.movieDetails?.upcomingFlag === "Y"
        );
      }
    }

    if (search) {
      allShows = allShows.filter(
        (show) =>
          show?.filmCode?.toLowerCase().includes(search.toLowerCase()) ||
          show?.movieName?.toLowerCase().includes(search.toLowerCase()) ||
          show?.screenName?.toLowerCase().includes(search.toLowerCase()) ||
          show?.cinemaName?.toLowerCase().includes(search.toLowerCase()) ||
          show?.sessionId?.toString().includes(search)
      );
    }

    setFilteredData(allShows);
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    filterShows(newValue, selectedCinema, selectedMovie, selectedStatus);
  };

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
    setSelectedMovie("");
    filterShows(searchValue, e.target.value, "", selectedStatus);
  };

  const handleMovieChange = (e) => {
    setSelectedMovie(e.target.value);
    filterShows(searchValue, selectedCinema, e.target.value, selectedStatus);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    filterShows(searchValue, selectedCinema, selectedMovie, e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return PagesIndex.dayjs(date).format("DD/MM/YYYY hh:mm A");
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "O":
        return "status-open";
      case "C":
        return "status-closed";
      case "S":
        return "status-sold-out";
      default:
        return "status-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case "O":
        return "Open";
      case "C":
        return "Closed";
      case "S":
        return "Sold Out";
      default:
        return status || "-";
    }
  };

  const getMovieStatusLabel = (show) => {
    if (show?.movieDetails?.nowShowingFlag === "Y") return "Now Showing";
    if (show?.movieDetails?.upcomingFlag === "Y") return "Upcoming";
    return "-";
  };

  const getMovieStatusClass = (show) => {
    if (show?.movieDetails?.nowShowingFlag === "Y") return "status-now-showing";
    if (show?.movieDetails?.upcomingFlag === "Y") return "status-upcoming";
    return "status-default";
  };

  const clearFilters = () => {
    setSearchValue("");
    setSelectedCinema("");
    setSelectedMovie("");
    setSelectedStatus("");
    filterShows("", "", "", "");
  };

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
                        {cinema.cinemaName} ({cinema.totalShows} shows)
                      </Index.MenuItem>
                    ))}
                  </Index.Select>
                </Index.Box>

                <Index.Box className="form-group w-100-res-drop" sx={{ minWidth: 180, mr: 2, mb: 1 }}>
                  <Index.Select
                    fullWidth
                    id="movie-select"
                    name="movie"
                    className="form-control"
                    displayEmpty
                    value={selectedMovie}
                    onChange={handleMovieChange}
                    renderValue={
                      selectedMovie
                        ? () => {
                            const movie = movieList.find(
                              (m) => m.filmCode === selectedMovie
                            );
                            return movie?.movieName || selectedMovie;
                          }
                        : () => "Select Movie"
                    }
                  >
                    <Index.MenuItem value="">All Movies</Index.MenuItem>
                    {movieList?.map((movie, index) => (
                      <Index.MenuItem key={index} value={movie.filmCode}>
                        {movie.movieName} {movie.totalShows ? `(${movie.totalShows} shows)` : ""}
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
                    onClick={getVistaShows}
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
                Vista Shows (Direct from API)
              </Index.Typography>
              <Index.Typography
                variant="span"
                component="span"
                className="page-subtitle"
                sx={{ ml: 2, color: "#666" }}
              >
                Total: {filteredData.length} shows
              </Index.Typography>
            </Index.Box>
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
              <Search className="search">
                <StyledInputBase
                  placeholder="Search shows..."
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
              aria-label="vista shows table"
              className="table-design-main one-line-table"
            >
              <Index.TableHead>
                <Index.TableRow>
                  <Index.TableCell width="5%">S.No</Index.TableCell>
                  <Index.TableCell width="10%">Session ID</Index.TableCell>
                  <Index.TableCell width="15%">Cinema</Index.TableCell>
                  <Index.TableCell width="22%">Movie</Index.TableCell>
                  <Index.TableCell width="12%">Screen</Index.TableCell>
                  <Index.TableCell width="18%">Show Time</Index.TableCell>
                  <Index.TableCell width="12%">Movie Status</Index.TableCell>
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
                      .map((show, index) => (
                        <Index.TableRow key={`${show.sessionId}-${index}`}>
                          <Index.TableCell>
                            {currentPage * rowsPerPage + index + 1}
                          </Index.TableCell>
                          <Index.TableCell>
                            {show?.sessionId || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip
                              title={`${show?.cinemaName} (${show?.cinemaId})`}
                              placement="top"
                              arrow
                            >
                              <span>
                                {show?.cinemaName
                                  ? show.cinemaName.length > 15
                                    ? show.cinemaName.slice(0, 15) + "..."
                                    : show.cinemaName
                                  : show?.cinemaId || "-"}
                              </span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Tooltip
                              title={`${show?.movieName} (${show?.filmCode})`}
                              placement="top"
                              arrow
                            >
                              <span>
                                {show?.movieName
                                  ? show.movieName.length > 25
                                    ? show.movieName.slice(0, 25) + "..."
                                    : show.movieName
                                  : show?.filmCode || "-"}
                              </span>
                            </Index.Tooltip>
                          </Index.TableCell>
                          <Index.TableCell>
                            {show?.screenName || `Screen ${show?.screenNumber}` || "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {formatDateTime(show?.sessionRealShow)}
                          </Index.TableCell>
                          <Index.TableCell>
                            <Index.Box
                              className={`status-badge ${getMovieStatusClass(show)}`}
                            >
                              {getMovieStatusLabel(show)}
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

export default VistaShows;
