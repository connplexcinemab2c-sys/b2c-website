import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./VistaDashboard.css";

const VistaDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState({});
  const [showData, setShowData] = useState({});
  const [cinemaList, setCinemaList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Summary stats
  const [stats, setStats] = useState({
    totalCinemas: 0,
    totalMovies: 0,
    totalShows: 0,
    onlineCinemas: 0,
    offlineCinemas: 0,
    nowShowingMovies: 0,
    upcomingMovies: 0,
    openShows: 0,
    closedShows: 0,
  });

  // Cinema stats for table
  const [cinemaStats, setCinemaStats] = useState([]);

  // Movie stats
  const [movieStats, setMovieStats] = useState([]);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [moviesRes, showsRes] = await Promise.all([
        PagesIndex.DataService.get(
          PagesIndex.Api.GET_VISTA_MOVIES_BY_CINEMA + "?" + new Date().getTime()
        ),
        PagesIndex.DataService.get(
          PagesIndex.Api.GET_VISTA_SHOWS_BY_CINEMA + "?" + new Date().getTime()
        ),
      ]);

      const moviesData = moviesRes?.data?.data || {};
      const showsData = showsRes?.data?.data || {};
      const cinemas = showsRes?.data?.cinemas || moviesRes?.data?.cinemas || [];

      setMovieData(moviesData);
      setShowData(showsData);
      setCinemaList(cinemas);
      setLastUpdated(new Date());

      // Calculate stats
      calculateStats(moviesData, showsData, cinemas);
    } catch (err) {
      if (err?.response?.data?.message !== "jwt expired") {
        PagesIndex.toast.error(
          err?.response?.data?.message || "Failed to fetch Vista data"
        );
      }
    }
    setLoading(false);
  };

  const calculateStats = (moviesData, showsData, cinemas) => {
    let totalMovies = 0;
    let totalShows = 0;
    let onlineCinemas = 0;
    let offlineCinemas = 0;
    let nowShowingMovies = 0;
    let upcomingMovies = 0;
    let openShows = 0;
    let closedShows = 0;

    const cinemaStatsMap = {};
    const movieStatsMap = {};

    // Process movies
    Object.keys(moviesData).forEach((cinemaId) => {
      const cinemaInfo = moviesData[cinemaId];
      totalMovies += cinemaInfo.movies?.length || 0;

      if (!cinemaStatsMap[cinemaId]) {
        cinemaStatsMap[cinemaId] = {
          cinemaId,
          cinemaName: cinemaInfo.cinemaName || cinemaId,
          isOnline: cinemaInfo.cinemaDetails?.isOnline === "Y",
          movieCount: 0,
          showCount: 0,
          nowShowing: 0,
          upcoming: 0,
        };
      }

      cinemaStatsMap[cinemaId].movieCount = cinemaInfo.movies?.length || 0;

      cinemaInfo.movies?.forEach((movie) => {
        if (movie.nowShowingFlag === "Y") {
          nowShowingMovies++;
          cinemaStatsMap[cinemaId].nowShowing++;
        }
        if (movie.upcomingFlag === "Y") {
          upcomingMovies++;
          cinemaStatsMap[cinemaId].upcoming++;
        }

        // Movie stats
        const filmCode = movie.filmCode?.toUpperCase();
        if (!movieStatsMap[filmCode]) {
          movieStatsMap[filmCode] = {
            filmCode,
            name: movie.name,
            duration: movie.duration,
            censorRating: movie.censorRating,
            category: movie.category,
            nowShowingFlag: movie.nowShowingFlag,
            upcomingFlag: movie.upcomingFlag,
            cinemaCount: 0,
            showCount: 0,
          };
        }
        movieStatsMap[filmCode].cinemaCount++;
      });
    });

    // Process shows
    Object.keys(showsData).forEach((cinemaId) => {
      const cinemaInfo = showsData[cinemaId];
      totalShows += cinemaInfo.shows?.length || 0;

      if (!cinemaStatsMap[cinemaId]) {
        cinemaStatsMap[cinemaId] = {
          cinemaId,
          cinemaName: cinemaInfo.cinemaName || cinemaId,
          isOnline: cinemaInfo.cinemaDetails?.isOnline === "Y",
          movieCount: 0,
          showCount: 0,
          nowShowing: 0,
          upcoming: 0,
        };
      }

      cinemaStatsMap[cinemaId].showCount = cinemaInfo.shows?.length || 0;

      cinemaInfo.shows?.forEach((show) => {
        if (show.status?.toUpperCase() === "O") openShows++;
        if (show.status?.toUpperCase() === "C") closedShows++;

        // Update movie stats with show data
        const filmCode = show.filmCode?.toUpperCase();
        if (movieStatsMap[filmCode]) {
          movieStatsMap[filmCode].showCount++;
        }
      });
    });

    // Count online/offline cinemas
    cinemas.forEach((cinema) => {
      if (cinema.isOnline === "Y") onlineCinemas++;
      else offlineCinemas++;
    });

    setStats({
      totalCinemas: cinemas.length,
      totalMovies,
      totalShows,
      onlineCinemas,
      offlineCinemas,
      nowShowingMovies,
      upcomingMovies,
      openShows,
      closedShows,
    });

    // Sort cinema stats by show count
    const sortedCinemaStats = Object.values(cinemaStatsMap).sort(
      (a, b) => b.showCount - a.showCount
    );
    setCinemaStats(sortedCinemaStats);

    // Sort movie stats by show count
    const sortedMovieStats = Object.values(movieStatsMap)
      .filter((m) => m.showCount > 0)
      .sort((a, b) => b.showCount - a.showCount);
    setMovieStats(sortedMovieStats);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const navigate = PagesIndex.useNavigate();

  return (
    <Index.Box className="vista-dashboard">
      {/* Header */}
      <Index.Box className="barge-common-box" style={{ marginBottom: "15px" }}>
        <Index.Box className="title-header">
          <Index.Box className="title-header-flex res-title-header-flex">
            <Index.Box className="title-main">
              <Index.Typography variant="h5" component="h5" className="page-title">
                Vista Dashboard
              </Index.Typography>
              {lastUpdated && (
                <Index.Typography variant="caption" className="last-updated">
                  Last updated: {PagesIndex.dayjs(lastUpdated).format("DD/MM/YYYY hh:mm:ss A")}
                </Index.Typography>
              )}
            </Index.Box>
            <Index.Box className="d-flex align-items-center">
              <Index.Box className="common-button blue-button" sx={{ mr: 2 }}>
                <Index.Button
                  variant="contained"
                  onClick={() => navigate("/admin/vista-movies")}
                >
                  <Index.MovieIcon sx={{ mr: 1 }} />
                  View Movies
                </Index.Button>
              </Index.Box>
              <Index.Box className="common-button blue-button" sx={{ mr: 2 }}>
                <Index.Button
                  variant="contained"
                  onClick={() => navigate("/admin/vista-shows")}
                >
                  <Index.DvrIcon sx={{ mr: 1 }} />
                  View Shows
                </Index.Button>
              </Index.Box>
              <Index.Box className="common-button blue-button">
                <Index.Button
                  variant="contained"
                  onClick={fetchAllData}
                  disabled={loading}
                >
                  <Index.SyncIcon sx={{ mr: 1 }} />
                  Refresh
                </Index.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {loading ? (
        <Index.Box className="loading-container">
          <Index.Loader />
        </Index.Box>
      ) : (
        <>
          {/* Summary Cards */}
          <Index.Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Total Cinemas */}
            <Index.Grid item xs={12} sm={6} md={4}>
              <Index.Box className="stat-card stat-card-primary">
                <Index.Box className="stat-icon">
                  <Index.LocationCityIcon />
                </Index.Box>
                <Index.Box className="stat-content">
                  <Index.Typography className="stat-value">
                    {formatNumber(stats.totalCinemas)}
                  </Index.Typography>
                  <Index.Typography className="stat-label">
                    Total Cinemas
                  </Index.Typography>
                  <Index.Typography className="stat-sub">
                    <span className="online">{stats.onlineCinemas} Online</span>
                    {" | "}
                    <span className="offline">{stats.offlineCinemas} Offline</span>
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Grid>

            {/* Total Movies */}
            <Index.Grid item xs={12} sm={6} md={4}>
              <Index.Box className="stat-card stat-card-success">
                <Index.Box className="stat-icon">
                  <Index.MovieIcon />
                </Index.Box>
                <Index.Box className="stat-content">
                  <Index.Typography className="stat-value">
                    {formatNumber(stats.totalMovies)}
                  </Index.Typography>
                  <Index.Typography className="stat-label">
                    Total Movies
                  </Index.Typography>
                  <Index.Typography className="stat-sub">
                    <span className="now-showing">{stats.nowShowingMovies} Now Showing</span>
                    {" | "}
                    <span className="upcoming">{stats.upcomingMovies} Upcoming</span>
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Grid>

            {/* Total Shows */}
            <Index.Grid item xs={12} sm={6} md={4}>
              <Index.Box className="stat-card stat-card-warning">
                <Index.Box className="stat-icon">
                  <Index.DvrIcon />
                </Index.Box>
                <Index.Box className="stat-content">
                  <Index.Typography className="stat-value">
                    {formatNumber(stats.totalShows)}
                  </Index.Typography>
                  <Index.Typography className="stat-label">
                    Total Shows
                  </Index.Typography>
                  <Index.Typography className="stat-sub">
                    <span className="open">{stats.openShows} Open</span>
                    {" | "}
                    <span className="closed">{stats.closedShows} Closed</span>
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Grid>
          </Index.Grid>

          {/* Tabs Section */}
          <Index.Box className="barge-common-box">
            <Index.Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="vista-tabs"
            >
              <Index.Tab label="Cinema Statistics" />
              <Index.Tab label="Movie Statistics" />
            </Index.Tabs>

            {/* Cinema Statistics Tab */}
            {activeTab === 0 && (
              <Index.Box className="tab-content">
                <Index.Box className="page-table-main">
                  <Index.TableContainer component={Index.Paper} className="table-container">
                    <Index.Table className="table-design-main one-line-table">
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="8%">S.No</Index.TableCell>
                          <Index.TableCell width="12%">Cinema ID</Index.TableCell>
                          <Index.TableCell width="30%">Cinema Name</Index.TableCell>
                          <Index.TableCell width="12%">Status</Index.TableCell>
                          <Index.TableCell width="18%">Movies</Index.TableCell>
                          <Index.TableCell width="15%">Shows</Index.TableCell>
                        </Index.TableRow>
                      </Index.TableHead>
                      <Index.TableBody>
                        {cinemaStats.length ? (
                          cinemaStats.map((cinema, index) => (
                            <Index.TableRow key={cinema.cinemaId}>
                              <Index.TableCell>{index + 1}</Index.TableCell>
                              <Index.TableCell>{cinema.cinemaId}</Index.TableCell>
                              <Index.TableCell>
                                <Index.Tooltip title={cinema.cinemaName} placement="top" arrow>
                                  <span>
                                    {cinema.cinemaName?.length > 25
                                      ? cinema.cinemaName.slice(0, 25) + "..."
                                      : cinema.cinemaName}
                                  </span>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                <Index.Box
                                  className={`status-badge ${cinema.isOnline ? "status-online" : "status-offline"}`}
                                >
                                  {cinema.isOnline ? "Online" : "Offline"}
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell>
                                <strong>{cinema.movieCount}</strong>
                                <span className="sub-info">
                                  ({cinema.nowShowing} NS / {cinema.upcoming} UC)
                                </span>
                              </Index.TableCell>
                              <Index.TableCell>
                                <strong>{cinema.showCount}</strong>
                              </Index.TableCell>
                            </Index.TableRow>
                          ))
                        ) : (
                          <Index.TableRow>
                            <Index.TableCell colSpan={6} align="center" className="no-data-in-list">
                              No cinema data available
                            </Index.TableCell>
                          </Index.TableRow>
                        )}
                      </Index.TableBody>
                    </Index.Table>
                  </Index.TableContainer>
                </Index.Box>
              </Index.Box>
            )}

            {/* Movie Statistics Tab */}
            {activeTab === 1 && (
              <Index.Box className="tab-content">
                <Index.Box className="page-table-main">
                  <Index.TableContainer component={Index.Paper} className="table-container">
                    <Index.Table className="table-design-main one-line-table">
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="8%">S.No</Index.TableCell>
                          <Index.TableCell width="15%">Film Code</Index.TableCell>
                          <Index.TableCell width="30%">Movie Name</Index.TableCell>
                          <Index.TableCell width="10%">Duration</Index.TableCell>
                          <Index.TableCell width="12%">Status</Index.TableCell>
                          <Index.TableCell width="12%">Cinemas</Index.TableCell>
                          <Index.TableCell width="12%">Shows</Index.TableCell>
                        </Index.TableRow>
                      </Index.TableHead>
                      <Index.TableBody>
                        {movieStats.length ? (
                          movieStats.map((movie, index) => (
                            <Index.TableRow key={movie.filmCode}>
                              <Index.TableCell>{index + 1}</Index.TableCell>
                              <Index.TableCell>
                                <Index.Tooltip title={movie.filmCode} placement="top" arrow>
                                  <span>
                                    {movie.filmCode?.length > 12
                                      ? movie.filmCode.slice(0, 12) + "..."
                                      : movie.filmCode}
                                  </span>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                <Index.Tooltip title={movie.name} placement="top" arrow>
                                  <span>
                                    {movie.name?.length > 30
                                      ? movie.name.slice(0, 30) + "..."
                                      : movie.name}
                                  </span>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                {formatDuration(movie.duration)}
                              </Index.TableCell>
                              <Index.TableCell>
                                <Index.Box
                                  className={`status-badge ${
                                    movie.nowShowingFlag === "Y"
                                      ? "status-now-showing"
                                      : movie.upcomingFlag === "Y"
                                      ? "status-upcoming"
                                      : "status-default"
                                  }`}
                                >
                                  {movie.nowShowingFlag === "Y"
                                    ? "Now Showing"
                                    : movie.upcomingFlag === "Y"
                                    ? "Upcoming"
                                    : "-"}
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell>
                                <strong>{movie.cinemaCount}</strong>
                              </Index.TableCell>
                              <Index.TableCell>
                                <strong>{movie.showCount}</strong>
                              </Index.TableCell>
                            </Index.TableRow>
                          ))
                        ) : (
                          <Index.TableRow>
                            <Index.TableCell colSpan={7} align="center" className="no-data-in-list">
                              No movie data available
                            </Index.TableCell>
                          </Index.TableRow>
                        )}
                      </Index.TableBody>
                    </Index.Table>
                  </Index.TableContainer>
                </Index.Box>
              </Index.Box>
            )}
          </Index.Box>

          {/* Quick Insights Section */}
          <Index.Box className="barge-common-box" sx={{ mt: 3 }}>
            <Index.Box className="title-header">
              <Index.Typography variant="h6" className="page-title">
                Quick Insights
              </Index.Typography>
            </Index.Box>
            <Index.Grid container spacing={2} sx={{ p: 2 }}>
              <Index.Grid item xs={12} md={4}>
                <Index.Box className="insight-card">
                  <Index.Typography className="insight-title">
                    Top Cinema by Shows
                  </Index.Typography>
                  {cinemaStats[0] && (
                    <Index.Box className="insight-content">
                      <Index.Typography className="insight-value">
                        {cinemaStats[0].cinemaName}
                      </Index.Typography>
                      <Index.Typography className="insight-sub">
                        {cinemaStats[0].showCount} shows | {cinemaStats[0].movieCount} movies
                      </Index.Typography>
                    </Index.Box>
                  )}
                </Index.Box>
              </Index.Grid>
              <Index.Grid item xs={12} md={4}>
                <Index.Box className="insight-card">
                  <Index.Typography className="insight-title">
                    Top Movie by Shows
                  </Index.Typography>
                  {movieStats[0] && (
                    <Index.Box className="insight-content">
                      <Index.Typography className="insight-value">
                        {movieStats[0].name?.length > 25
                          ? movieStats[0].name.slice(0, 25) + "..."
                          : movieStats[0].name}
                      </Index.Typography>
                      <Index.Typography className="insight-sub">
                        {movieStats[0].showCount} shows across {movieStats[0].cinemaCount} cinemas
                      </Index.Typography>
                    </Index.Box>
                  )}
                </Index.Box>
              </Index.Grid>
              <Index.Grid item xs={12} md={4}>
                <Index.Box className="insight-card">
                  <Index.Typography className="insight-title">
                    Average Shows per Cinema
                  </Index.Typography>
                  <Index.Box className="insight-content">
                    <Index.Typography className="insight-value">
                      {stats.totalCinemas > 0
                        ? Math.round(stats.totalShows / stats.totalCinemas)
                        : 0}
                    </Index.Typography>
                    <Index.Typography className="insight-sub">
                      shows per cinema on average
                    </Index.Typography>
                  </Index.Box>
                </Index.Box>
              </Index.Grid>
            </Index.Grid>
          </Index.Box>
        </>
      )}
    </Index.Box>
  );
};

export default VistaDashboard;
