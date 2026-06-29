import React, { useEffect, useState, useCallback } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./OverviewDashboard.css";

const OverviewDashboard = () => {
  // Loading states
  const [countsLoading, setCountsLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [cinemasLoading, setCinemasLoading] = useState(true);
  const [nowPlayingLoading, setNowPlayingLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [syncLogsLoading, setSyncLogsLoading] = useState(true);

  // Data states
  const [counts, setCounts] = useState({});
  const [regions, setRegions] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);

  // Filter states
  const [activeRegionTab, setActiveRegionTab] = useState("all");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("");

  // Drawer states
  const [cinemaDrawerOpen, setCinemaDrawerOpen] = useState(false);
  const [movieDrawerOpen, setMovieDrawerOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cinemaDetailsLoading, setCinemaDetailsLoading] = useState(false);
  const [movieShowsLoading, setMovieShowsLoading] = useState(false);
  const [cinemaDetails, setCinemaDetails] = useState(null);
  const [movieShows, setMovieShows] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchCounts();
    fetchRegions();
    fetchCinemas();
    fetchNowPlayingMovies();
    fetchUpcomingMovies();
    fetchSyncData();
  }, []);

  // Refetch cinemas when region filter changes
  useEffect(() => {
    fetchCinemas();
  }, [selectedRegionFilter]);

  const fetchCounts = useCallback(() => {
    setCountsLoading(true);
    PagesIndex.DataService.get(PagesIndex.Api.GET_OVERVIEW_COUNTS)
      .then((res) => {
        if (res?.data?.status === 200) {
          setCounts(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch counts");
      })
      .finally(() => setCountsLoading(false));
  }, []);

  const fetchRegions = useCallback(() => {
    setRegionsLoading(true);
    PagesIndex.DataService.get(PagesIndex.Api.GET_OVERVIEW_REGIONS)
      .then((res) => {
        if (res?.data?.status === 200) {
          setRegions(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch regions");
      })
      .finally(() => setRegionsLoading(false));
  }, []);

  const fetchCinemas = useCallback(() => {
    setCinemasLoading(true);
    const url = selectedRegionFilter
      ? `${PagesIndex.Api.GET_OVERVIEW_CINEMAS}?regionId=${selectedRegionFilter}`
      : PagesIndex.Api.GET_OVERVIEW_CINEMAS;

    PagesIndex.DataService.get(url)
      .then((res) => {
        if (res?.data?.status === 200) {
          setCinemas(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch cinemas");
      })
      .finally(() => setCinemasLoading(false));
  }, [selectedRegionFilter]);

  const fetchNowPlayingMovies = useCallback(() => {
    setNowPlayingLoading(true);
    PagesIndex.DataService.get(`${PagesIndex.Api.GET_NOW_PLAYING_MOVIES}?limit=30`)
      .then((res) => {
        if (res?.data?.status === 200) {
          setNowPlayingMovies(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch now playing movies");
      })
      .finally(() => setNowPlayingLoading(false));
  }, []);

  const fetchUpcomingMovies = useCallback(() => {
    setUpcomingLoading(true);
    PagesIndex.DataService.get(PagesIndex.Api.GET_UPCOMING_MOVIES)
      .then((res) => {
        if (res?.data?.status === 200) {
          setUpcomingMovies(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch upcoming movies");
      })
      .finally(() => setUpcomingLoading(false));
  }, []);

  const fetchSyncData = useCallback(() => {
    setSyncLogsLoading(true);
    Promise.all([
      PagesIndex.DataService.get(PagesIndex.Api.GET_SYNC_STATUS),
      PagesIndex.DataService.get(PagesIndex.Api.GET_SYNC_HISTORY),
    ])
      .then(([statusRes, historyRes]) => {
        if (statusRes?.data?.status === 200) {
          setSyncStatus(statusRes?.data?.data);
        }
        if (historyRes?.data?.status === 200) {
          setSyncHistory(historyRes?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch sync data");
      })
      .finally(() => setSyncLogsLoading(false));
  }, []);

  // Cinema drawer handler
  const handleCinemaClick = useCallback((cinema) => {
    setSelectedCinema(cinema);
    setCinemaDrawerOpen(true);
    setCinemaDetailsLoading(true);
    setCinemaDetails(null);

    PagesIndex.DataService.get(`${PagesIndex.Api.GET_CINEMA_DETAILS}/${cinema._id}`)
      .then((res) => {
        if (res?.data?.status === 200) {
          setCinemaDetails(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch cinema details");
      })
      .finally(() => setCinemaDetailsLoading(false));
  }, []);

  // Movie drawer handler
  const handleMovieClick = useCallback((movie) => {
    setSelectedMovie(movie);
    setMovieDrawerOpen(true);
    setMovieShowsLoading(true);
    setMovieShows(null);

    PagesIndex.DataService.get(`${PagesIndex.Api.GET_MOVIE_SHOWS}/${movie._id}`)
      .then((res) => {
        if (res?.data?.status === 200) {
          setMovieShows(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Failed to fetch movie shows");
      })
      .finally(() => setMovieShowsLoading(false));
  }, []);

  const handleCloseCinemaDrawer = useCallback(() => {
    setCinemaDrawerOpen(false);
    setTimeout(() => {
      setSelectedCinema(null);
      setCinemaDetails(null);
    }, 300);
  }, []);

  const handleCloseMovieDrawer = useCallback(() => {
    setMovieDrawerOpen(false);
    setTimeout(() => {
      setSelectedMovie(null);
      setMovieShows(null);
    }, 300);
  }, []);

  // Utility functions
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatShowTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  const groupShowsByDate = (shows) => {
    if (!shows || !Array.isArray(shows)) return {};
    return shows.reduce((acc, show) => {
      const date = formatDate(show.sessionRealShow);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(show);
      return acc;
    }, {});
  };

  const getFilteredRegions = () => {
    if (!regions || !Array.isArray(regions)) return [];
    if (activeRegionTab === "all") return regions;
    if (activeRegionTab === "active") return regions.filter((r) => r.isActive);
    return regions.filter((r) => !r.isActive);
  };

  // Stats card data
  const statsCards = [
    {
      id: "regions",
      label: "Total Regions",
      value: counts.totalRegions,
      icon: <Index.PlaceIcon />,
      color: "purple",
    },
    {
      id: "cinemas",
      label: "Active Cinemas",
      value: counts.totalCinemas,
      icon: <Index.LocationCityIcon />,
      color: "teal",
    },
    {
      id: "movies",
      label: "Now Playing",
      value: counts.nowPlayingMovies,
      icon: <Index.MovieIcon />,
      color: "pink",
    },
    {
      id: "shows",
      label: "Total Shows",
      value: counts.totalShows,
      icon: <Index.LocalActivityIcon />,
      color: "blue",
    },
    {
      id: "today",
      label: "Today's Shows",
      value: counts.todayShows,
      icon: <Index.AccessTimeIcon />,
      color: "orange",
    },
  ];

  return (
    <Index.Box className="dashboard-container">
      {/* Sync Status Bar - Top of Dashboard */}
      {/* <Index.Box className="sync-status-bar-top">
        <Index.Box className="sync-status-indicator">
          <Index.Box className={`sync-pulse ${syncStatus?.currentSyncStatus === "running" ? "running" : "idle"}`}>
            <Index.SyncIcon />
          </Index.Box>
          <Index.Box className="sync-status-text">
            <span className="sync-status-label">Sync Status</span>
            <span className={`sync-status-value ${syncStatus?.currentSyncStatus === "running" ? "running" : "idle"}`}>
              {syncStatus?.currentSyncStatus === "running" ? "Syncing..." : "Idle"}
            </span>
          </Index.Box>
        </Index.Box>

        {syncStatus?.currentSyncStatus === "running" && syncStatus?.currentProgress && (
          <Index.Box className="sync-progress-info">
            <Index.Box className="sync-progress-item">
              <Index.LocationCityIcon />
              <span>{syncStatus.currentProgress.cinemasSynced || 0}/{syncStatus.currentProgress.totalCinemas || 0}</span>
              <span className="progress-label">Cinemas</span>
            </Index.Box>
            <Index.Box className="sync-progress-item">
              <Index.MovieIcon />
              <span>{syncStatus.currentProgress.moviesAdded || 0}</span>
              <span className="progress-label">Movies</span>
            </Index.Box>
            <Index.Box className="sync-progress-item">
              <Index.LocalActivityIcon />
              <span>{syncStatus.currentProgress.showsAdded || 0}</span>
              <span className="progress-label">Shows</span>
            </Index.Box>
          </Index.Box>
        )}

        <Index.Box className="sync-time-info">
          <Index.Box className="sync-time-item">
            <Index.AccessTimeIcon />
            <Index.Box className="sync-time-text">
              <span className="sync-time-label">Last Sync</span>
              <span className="sync-time-value">
                {syncStatus?.lastSyncTime ? getRelativeTime(syncStatus.lastSyncTime) : "N/A"}
              </span>
            </Index.Box>
          </Index.Box>
          <Index.Box className="sync-time-item">
            <Index.UpcomingIcon />
            <Index.Box className="sync-time-text">
              <span className="sync-time-label">Next Sync</span>
              <span className="sync-time-value">
                {syncStatus?.nextSyncTime ? formatShowTime(syncStatus.nextSyncTime) : "N/A"}
              </span>
            </Index.Box>
          </Index.Box>
        </Index.Box>

        <button className="refresh-button sync-refresh" onClick={fetchSyncData}>
          <Index.SyncIcon />
        </button>
      </Index.Box> */}

      {/* Dashboard Header */}
      <Index.Box className="dashboard-header">
        <Index.Box className="header-left">
          <Index.Typography className="dashboard-title">
            Overview Dashboard
          </Index.Typography>
          {/* <Index.Typography className="dashboard-subtitle">
            Real-time overview of your cinema operations
          </Index.Typography> */}
        </Index.Box>
        {/* <Index.Box className="header-right">
          <Index.Box className="last-updated">
            <Index.AccessTimeIcon />
            <span>Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </Index.Box>
        </Index.Box> */}
      </Index.Box>

      {/* Stats Cards Grid */}
      <Index.Box className="stats-section">
        {countsLoading ? (
          <Index.Box className="stats-loading">
            <Index.CircularProgress size={40} />
            <span>Loading statistics...</span>
          </Index.Box>
        ) : (
          <Index.Box className="stats-grid">
            {statsCards.map((card) => (
              <Index.Box key={card.id} className={`stat-card ${card.color}`}>
                <Index.Box className="stat-icon-wrapper">
                  {card.icon}
                </Index.Box>
                <Index.Box className="stat-content">
                  <Index.Typography className="stat-value">
                    {formatNumber(card.value)}
                  </Index.Typography>
                  <Index.Typography className="stat-label">
                    {card.label}
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            ))}
          </Index.Box>
        )}
      </Index.Box>

      {/* Regions Section */}
      <Index.Box className="content-section">
        <Index.Box className="section-card">
          <Index.Box className="section-header">
            <Index.Box className="section-title-wrapper">
              <Index.Box className="section-icon purple">
                <Index.PlaceIcon />
              </Index.Box>
              <Index.Typography className="section-title">
                Region Overview
              </Index.Typography>
              <Index.Box className="section-badge">
                {regions?.length || 0} regions
              </Index.Box>
            </Index.Box>
            <Index.Box className="section-actions">
              <Index.Box className="tab-group">
                <button
                  className={`tab-button ${activeRegionTab === "all" ? "active" : ""}`}
                  onClick={() => setActiveRegionTab("all")}
                >
                  All
                </button>
                <button
                  className={`tab-button ${activeRegionTab === "active" ? "active" : ""}`}
                  onClick={() => setActiveRegionTab("active")}
                >
                  Active
                </button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="section-body">
            {regionsLoading ? (
              <Index.Box className="section-loading">
                <Index.CircularProgress size={32} />
                <span>Loading regions...</span>
              </Index.Box>
            ) : getFilteredRegions()?.length > 0 ? (
              <Index.Box className="regions-grid">
                {getFilteredRegions().map((region) => (
                  <Index.Box
                    key={region._id}
                    className="region-card"
                    onClick={() => {
                      setSelectedRegionFilter(region._id);
                      document.querySelector('.cinemas-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Index.Box className="region-header">
                      <img
                        src={
                          region.image
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${region.image}`
                            : PagesIndex.Png.NoImageAvailable
                        }
                        alt={region.region}
                        className="region-image"
                        onError={(e) => { e.target.src = PagesIndex.Png.NoImageAvailable; }}
                      />
                      <Index.Box className="region-info">
                        <Index.Typography className="region-name">
                          {region.region}
                        </Index.Typography>
                        <span className={`status-badge ${region.isActive ? "active" : "inactive"}`}>
                          {region.isActive ? "Active" : "Inactive"}
                        </span>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="region-stats">
                      <Index.Box className="region-stat">
                        <Index.LocationCityIcon />
                        <span className="stat-number">{region.cinemaCount || 0}</span>
                        <span className="stat-text">Cinemas</span>
                      </Index.Box>
                      <Index.Box className="region-stat">
                        <Index.MovieIcon />
                        <span className="stat-number">{region.movieCount || 0}</span>
                        <span className="stat-text">Movies</span>
                      </Index.Box>
                      <Index.Box className="region-stat">
                        <Index.LocalActivityIcon />
                        <span className="stat-number">{region.showCount || 0}</span>
                        <span className="stat-text">Shows</span>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="empty-state">
                <Index.PlaceIcon />
                <span>No regions found</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box>

     

      {/* Cinemas Section */}
      <Index.Box className="content-section cinemas-section">
        <Index.Box className="section-card">
          <Index.Box className="section-header">
            <Index.Box className="section-title-wrapper">
              <Index.Box className="section-icon teal">
                <Index.LocationCityIcon />
              </Index.Box>
              <Index.Typography className="section-title">
                Cinema Distribution
              </Index.Typography>
              {selectedRegionFilter && (
                <Index.Box className="filter-chip">
                  <span>{regions.find(r => r._id === selectedRegionFilter)?.region}</span>
                  <Index.IconButton
                    size="small"
                    onClick={() => setSelectedRegionFilter("")}
                  >
                    <Index.ClearIcon />
                  </Index.IconButton>
                </Index.Box>
              )}
              <Index.Box className="section-badge teal">
                {cinemas?.length || 0} cinemas
              </Index.Box>
            </Index.Box>
            <Index.Box className="section-actions">
              <button className="refresh-button" onClick={fetchCinemas}>
                <Index.SyncIcon />
                <span>Refresh</span>
              </button>
            </Index.Box>
          </Index.Box>
          <Index.Box className="section-body">
            {cinemasLoading ? (
              <Index.Box className="section-loading">
                <Index.CircularProgress size={32} />
                <span>Loading cinemas...</span>
              </Index.Box>
            ) : cinemas?.length > 0 ? (
              <Index.Box className="cinemas-grid">
                {cinemas.map((cinema) => (
                  <Index.Box
                    key={cinema._id}
                    className="cinema-card"
                    onClick={() => handleCinemaClick(cinema)}
                  >
                    <Index.Box className="cinema-header">
                      <Index.Tooltip title={cinema.cinemaName} arrow placement="top">
                        <Index.Typography className="cinema-name">
                          {cinema.cinemaName}
                        </Index.Typography>
                      </Index.Tooltip>
                      <Index.Box className="cinema-location">
                        <Index.PlaceIcon />
                        <span>{cinema.regionName || "No Region"}</span>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="cinema-stats">
                      <Index.Box className="cinema-stat">
                        <Index.MovieIcon />
                        <span>{cinema.movieCount || 0} Movies</span>
                      </Index.Box>
                      <Index.Box className="cinema-stat">
                        <Index.LocalActivityIcon />
                        <span>{cinema.showCount || 0} Shows</span>
                      </Index.Box>
                    </Index.Box>
                    {cinema.lastSync && (
                      <Index.Box className={`sync-info ${cinema.lastSyncStatus ? "success" : "error"}`}>
                        <Index.SyncIcon />
                        <span>
                          {new Date(cinema.lastSync).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Index.Box>
                    )}
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="empty-state">
                <Index.LocationCityIcon />
                <span>No cinemas found</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box>

       {/* Now Playing Movies Section */}
      <Index.Box className="content-section">
        <Index.Box className="section-card">
          <Index.Box className="section-header">
            <Index.Box className="section-title-wrapper">
              <Index.Box className="section-icon green">
                <Index.PlayCircleFilledIcon />
              </Index.Box>
              <Index.Typography className="section-title">
                Now Playing Movies
              </Index.Typography>
              <Index.Box className="section-badge green">
                {nowPlayingMovies?.length || 0} movies
              </Index.Box>
            </Index.Box>
            <Index.Box className="section-actions">
              <button className="refresh-button" onClick={fetchNowPlayingMovies}>
                <Index.SyncIcon />
                <span>Refresh</span>
              </button>
            </Index.Box>
          </Index.Box>
          <Index.Box className="section-body movies-body">
            {nowPlayingLoading ? (
              <Index.Box className="section-loading">
                <Index.CircularProgress size={32} />
                <span>Loading movies...</span>
              </Index.Box>
            ) : nowPlayingMovies?.length > 0 ? (
              <Index.Box className="movies-grid">
                {nowPlayingMovies.map((movie) => (
                  <Index.Box
                    key={movie._id}
                    className="movie-card"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <Index.Box className="movie-poster-wrapper">
                      <img
                        src={
                          movie.poster
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movie.poster}`
                            : PagesIndex.Png.NoImageAvailable
                        }
                        alt={movie.name}
                        className="movie-poster"
                        onError={(e) => { e.target.src = PagesIndex.Png.NoImageAvailable; }}
                      />
                      <Index.Box className="show-badge">
                        <Index.LocalActivityIcon />
                        <span>{movie.showCount || 0}</span>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="movie-info">
                      <Index.Tooltip title={movie.name} arrow placement="top">
                        <Index.Typography className="movie-name">
                          {movie.name}
                        </Index.Typography>
                      </Index.Tooltip>
                      <Index.Box className="movie-meta">
                        {movie.censorRating && (
                          <span className="meta-tag rating">{movie.censorRating}</span>
                        )}
                        {movie.duration && (
                          <span className="meta-tag duration">{movie.duration}m</span>
                        )}
                      </Index.Box>
                      <Index.Box className="movie-meta">
                        {movie.languages && (
                          <span className="meta-tag language">{movie.languages}</span>
                        )}
                        {movie.movieType && (
                          <span className="meta-tag type">{movie.movieType}</span>
                        )}
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="empty-state">
                <Index.MovieIcon />
                <span>No movies currently playing</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box>

      {/* Sync Activity Logs Section */}
      {/* <Index.Box className="content-section">
        <Index.Box className="section-card">
          <Index.Box className="section-header">
            <Index.Box className="section-title-wrapper">
              <Index.Box className="section-icon">
                <Index.SyncIcon />
              </Index.Box>
              <Index.Typography className="section-title">
                Sync Activity Logs
              </Index.Typography>
              <Index.Box className="section-badge">
                {syncHistory?.length || 0} records
              </Index.Box>
            </Index.Box>
            <Index.Box className="section-actions">
              <button className="refresh-button" onClick={fetchSyncData}>
                <Index.SyncIcon />
                <span>Refresh</span>
              </button>
            </Index.Box>
          </Index.Box>
          <Index.Box className="section-body sync-logs-body">
            {syncLogsLoading ? (
              <Index.Box className="section-loading">
                <Index.CircularProgress size={32} />
                <span>Loading sync history...</span>
              </Index.Box>
            ) : syncHistory?.length > 0 ? (
              <Index.Box className="sync-logs-list">
                {syncHistory.map((log) => (
                  <Index.Box key={log._id} className={`sync-log-item ${log.status}`}>
                    <Index.Box className={`sync-log-icon ${log.status}`}>
                      {log.status === "running" ? (
                        <Index.CircularProgress size={20} />
                      ) : log.status === "completed" ? (
                        <Index.CheckCircleRoundedIcon />
                      ) : (
                        <Index.ReportProblemIcon />
                      )}
                    </Index.Box>
                    <Index.Box className="sync-log-content">
                      <Index.Box className="sync-log-header">
                        <Index.Typography className="sync-log-title">
                          {log.status === "running" ? "Sync In Progress" :
                           log.status === "completed" ? "Sync Completed" : "Sync Failed"}
                        </Index.Typography>
                        <span className={`sync-log-status ${log.status}`}>
                          {log.status}
                        </span>
                      </Index.Box>
                      <Index.Box className="sync-log-stats">
                        <Index.Box className="sync-log-stat">
                          <Index.LocationCityIcon />
                          <span>{log.cinemasSynced || 0}/{log.totalCinemas || 0}</span>
                          <span className="stat-label">Cinemas</span>
                        </Index.Box>
                        <Index.Box className="sync-log-stat">
                          <Index.MovieIcon />
                          <span>{log.moviesAdded || 0}</span>
                          <span className="stat-label">Movies</span>
                        </Index.Box>
                        <Index.Box className="sync-log-stat">
                          <Index.LocalActivityIcon />
                          <span>{log.showsAdded || 0}</span>
                          <span className="stat-label">Shows</span>
                        </Index.Box>
                        <Index.Box className="sync-log-stat">
                          <Index.SellIcon />
                          <span>{log.pricesAdded || 0}</span>
                          <span className="stat-label">Prices</span>
                        </Index.Box>
                        <Index.Box className="sync-log-stat">
                          <Index.FastfoodIcon />
                          <span>{log.itemsAdded || 0}</span>
                          <span className="stat-label">Items</span>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="sync-log-meta">
                        <span className="sync-log-tag time">
                          <Index.AccessTimeIcon />
                          Started: {formatDateTime(log.startTime)}
                        </span>
                        {log.endTime && (
                          <span className="sync-log-tag time">
                            <Index.DoneIcon />
                            Ended: {formatDateTime(log.endTime)}
                          </span>
                        )}
                        <span className="sync-log-tag duration">
                          {getRelativeTime(log.startTime)}
                        </span>
                      </Index.Box>
                      {log.error && (
                        <Index.Box className="sync-log-error">
                          <Index.ReportProblemIcon />
                          <span>{log.error}</span>
                        </Index.Box>
                      )}
                    </Index.Box>
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="empty-state">
                <Index.SyncIcon />
                <span>No sync history found</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box> */}

      {/* Upcoming Movies Section */}
      {/* <Index.Box className="content-section">
        <Index.Box className="section-card upcoming-card">
          <Index.Box className="section-header">
            <Index.Box className="section-title-wrapper">
              <Index.Box className="section-icon amber">
                <Index.UpcomingIcon />
              </Index.Box>
              <Index.Typography className="section-title">
                Upcoming Releases
              </Index.Typography>
              <Index.Box className="section-badge amber">
                {upcomingMovies?.reduce((acc, m) => acc + (m.movies?.length || 0), 0) || 0} movies
              </Index.Box>
            </Index.Box>
            <Index.Box className="section-actions">
              <button className="refresh-button" onClick={fetchUpcomingMovies}>
                <Index.SyncIcon />
                <span>Refresh</span>
              </button>
            </Index.Box>
          </Index.Box>
          <Index.Box className="section-body">
            {upcomingLoading ? (
              <Index.Box className="section-loading">
                <Index.CircularProgress size={32} />
                <span>Loading upcoming movies...</span>
              </Index.Box>
            ) : upcomingMovies?.length > 0 ? (
              <Index.Box className="upcoming-container">
                {upcomingMovies.map((monthData) => (
                  <Index.Box key={monthData.month} className="upcoming-month">
                    <Index.Box className="month-header">
                      <Index.CalendarMonthIcon />
                      <Index.Typography className="month-title">
                        {monthData.month}
                      </Index.Typography>
                      <span className="month-count">
                        {monthData.movies?.length || 0} movies
                      </span>
                    </Index.Box>
                    <Index.Box className="upcoming-movies-grid">
                      {monthData.movies?.map((movie) => (
                        <Index.Box
                          key={movie._id}
                          className="upcoming-movie-card"
                          onClick={() => handleMovieClick(movie)}
                        >
                          <img
                            src={
                              movie.poster
                                ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movie.poster}`
                                : PagesIndex.Png.NoImageAvailable
                            }
                            alt={movie.name}
                            className="upcoming-poster"
                            onError={(e) => { e.target.src = PagesIndex.Png.NoImageAvailable; }}
                          />
                          <Index.Box className="upcoming-info">
                            <Index.Tooltip title={movie.name} arrow placement="top">
                              <Index.Typography className="upcoming-name">
                                {movie.name}
                              </Index.Typography>
                            </Index.Tooltip>
                            <Index.Box className="upcoming-meta">
                              {movie.languages && (
                                <span className="meta-tag">{movie.languages}</span>
                              )}
                              {movie.movieType && (
                                <span className="meta-tag">{movie.movieType}</span>
                              )}
                            </Index.Box>
                            {movie.filmOpeningDate && (
                              <Index.Box className="release-date">
                                <Index.CalendarTodayIcon />
                                <span>{formatDate(movie.filmOpeningDate)}</span>
                              </Index.Box>
                            )}
                          </Index.Box>
                        </Index.Box>
                      ))}
                    </Index.Box>
                  </Index.Box>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="empty-state">
                <Index.UpcomingIcon />
                <span>No upcoming releases</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Box> */}

      {/* Cinema Details Drawer */}
      <Index.Drawer
        anchor="right"
        open={cinemaDrawerOpen}
        onClose={handleCloseCinemaDrawer}
        PaperProps={{ className: "drawer-paper-half" }}
      >
        <Index.Box className="drawer-container">
          {/* Drawer Header */}
          <Index.Box className="drawer-header cinema-drawer-header">
            <Index.Box className="drawer-header-content">
              <Index.Typography className="drawer-title">
                {cinemaDetails?.cinema?.cinemaName || selectedCinema?.cinemaName || "Cinema Details"}
              </Index.Typography>
              <Index.Box className="drawer-subtitle">
                <Index.PlaceIcon />
                <span>
                  {cinemaDetails?.cinema?.regionName || selectedCinema?.regionName || "No Region"}
                  {cinemaDetails?.cinema?.address && ` - ${cinemaDetails.cinema.address}`}
                </span>
              </Index.Box>
            </Index.Box>
            <Index.IconButton className="drawer-close" onClick={handleCloseCinemaDrawer}>
              <Index.ClearIcon />
            </Index.IconButton>
          </Index.Box>

          {/* Drawer Stats */}
          {!cinemaDetailsLoading && cinemaDetails && (
            <Index.Box className="drawer-stats">
              <Index.Box className="drawer-stat-card">
                <Index.Box className="drawer-stat-icon pink">
                  <Index.MovieIcon />
                </Index.Box>
                <Index.Box className="drawer-stat-info">
                  <span className="drawer-stat-value">{cinemaDetails.totalMovies || 0}</span>
                  <span className="drawer-stat-label">Movies</span>
                </Index.Box>
              </Index.Box>
              <Index.Box className="drawer-stat-card">
                <Index.Box className="drawer-stat-icon blue">
                  <Index.LocalActivityIcon />
                </Index.Box>
                <Index.Box className="drawer-stat-info">
                  <span className="drawer-stat-value">{cinemaDetails.totalShows || 0}</span>
                  <span className="drawer-stat-label">Shows</span>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          )}

          {/* Drawer Body */}
          <Index.Box className="drawer-body">
            {cinemaDetailsLoading ? (
              <Index.Box className="drawer-loading">
                <Index.CircularProgress size={40} />
                <span>Loading cinema details...</span>
              </Index.Box>
            ) : cinemaDetails?.movies?.length > 0 ? (
              <Index.Box className="drawer-movies-list">
                {cinemaDetails.movies.map((movie, movieIndex) => (
                  <Index.Accordion key={movie._id} className="movie-accordion" defaultExpanded={movieIndex === 0}>
                    <Index.AccordionSummary
                      expandIcon={<Index.ExpandMoreIcon />}
                      className="movie-accordion-header"
                    >
                      <Index.Box className="accordion-movie-content">
                        <img
                          src={
                            movie.poster
                              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movie.poster}`
                              : PagesIndex.Png.NoImageAvailable
                          }
                          alt={movie.name}
                          className="accordion-movie-poster"
                          onError={(e) => { e.target.src = PagesIndex.Png.NoImageAvailable; }}
                        />
                        <Index.Box className="accordion-movie-info">
                          <Index.Typography className="accordion-movie-name">
                            {movie.name}
                          </Index.Typography>
                          <Index.Box className="accordion-movie-meta">
                            {movie.censorRating && <span className="meta-tag">{movie.censorRating}</span>}
                            {movie.duration && <span className="meta-tag">{movie.duration} min</span>}
                            {movie.languages && <span className="meta-tag">{movie.languages}</span>}
                            {movie.movieType && <span className="meta-tag">{movie.movieType}</span>}
                          </Index.Box>
                          <Index.Box className="accordion-show-count">
                            <Index.LocalActivityIcon />
                            <span>{movie.showCount || 0} shows</span>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.AccordionSummary>
                    <Index.AccordionDetails className="movie-accordion-body">
                      {movie.shows?.length > 0 ? (
                        <Index.Box className="date-accordion-container">
                          {Object.entries(groupShowsByDate(movie.shows)).map(([date, shows], dateIndex) => (
                            <Index.Accordion key={date} className="date-accordion" defaultExpanded={dateIndex === 0}>
                              <Index.AccordionSummary
                                expandIcon={<Index.ExpandMoreIcon />}
                                className="date-accordion-header"
                              >
                                <Index.Box className="date-accordion-content">
                                  <Index.CalendarTodayIcon />
                                  <span className="date-accordion-title">{date}</span>
                                  <span className="date-accordion-count">{shows.length} shows</span>
                                </Index.Box>
                              </Index.AccordionSummary>
                              <Index.AccordionDetails className="date-accordion-body">
                                <Index.Box className="cinema-shows-grid">
                                  {shows.map((show, idx) => (
                                    <Index.Box key={idx} className="cinema-show-chip">
                                      <Index.Box className="show-chip-time">
                                        <Index.AccessTimeIcon />
                                        <span>{formatShowTime(show.sessionRealShow)}</span>
                                      </Index.Box>
                                      <Index.Box className="show-chip-details">
                                        <span className="show-chip-screen">
                                          {show.screenName || `Screen ${show.screenNumber}`}
                                        </span>
                                        <span className="show-chip-seats">
                                          <Index.PeopleIcon />
                                          {show.sessionSeatsAvail}/{show.sessionSeatsTotal}
                                        </span>
                                      </Index.Box>
                                    </Index.Box>
                                  ))}
                                </Index.Box>
                              </Index.AccordionDetails>
                            </Index.Accordion>
                          ))}
                        </Index.Box>
                      ) : (
                        <Index.Box className="no-shows">No shows available</Index.Box>
                      )}
                    </Index.AccordionDetails>
                  </Index.Accordion>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="drawer-empty">
                <Index.MovieIcon />
                <span>No movies with upcoming shows</span>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Drawer>

      {/* Movie Shows Drawer */}
      <Index.Drawer
        anchor="right"
        open={movieDrawerOpen}
        onClose={handleCloseMovieDrawer}
        PaperProps={{ className: "drawer-paper-half movie-drawer-paper" }}
      >
        <Index.Box className="drawer-container movie-drawer-container">
          {/* Drawer Header with Movie Info */}
          <Index.Box className="movie-drawer-hero">
            <Index.Box className="movie-drawer-poster-section">
              <img
                src={
                  (movieShows?.movie?.poster || selectedMovie?.poster)
                    ? `${PagesIndex.IMAGES_API_ENDPOINT}/${movieShows?.movie?.poster || selectedMovie?.poster}`
                    : PagesIndex.Png.NoImageAvailable
                }
                alt={movieShows?.movie?.name || selectedMovie?.name || "Movie"}
                className="movie-drawer-poster"
                onError={(e) => { e.target.src = PagesIndex.Png.NoImageAvailable; }}
              />
            </Index.Box>
            <Index.Box className="movie-drawer-info">
              <Index.Typography className="movie-drawer-title">
                {movieShows?.movie?.name || selectedMovie?.name || "Movie Shows"}
              </Index.Typography>
              <Index.Box className="movie-drawer-meta">
                {(movieShows?.movie?.censorRating || selectedMovie?.censorRating) && (
                  <span className="meta-badge rating">
                    {movieShows?.movie?.censorRating || selectedMovie?.censorRating}
                  </span>
                )}
                {(movieShows?.movie?.duration || selectedMovie?.duration) && (
                  <span className="meta-badge duration">
                    <Index.AccessTimeIcon />
                    {movieShows?.movie?.duration || selectedMovie?.duration} min
                  </span>
                )}
              </Index.Box>
              <Index.Box className="movie-drawer-meta">
                {(movieShows?.movie?.languages || selectedMovie?.languages) && (
                  <span className="meta-badge language">
                    {movieShows?.movie?.languages || selectedMovie?.languages}
                  </span>
                )}
                {(movieShows?.movie?.movieType || selectedMovie?.movieType) && (
                  <span className="meta-badge type">
                    {movieShows?.movie?.movieType || selectedMovie?.movieType}
                  </span>
                )}
              </Index.Box>
              {/* Stats inside hero */}
              {!movieShowsLoading && movieShows && (
                <Index.Box className="movie-drawer-hero-stats">
                  <Index.Box className="hero-stat">
                    <Index.LocationCityIcon />
                    <span className="hero-stat-value">{movieShows.totalCinemas || 0}</span>
                    <span className="hero-stat-label">Cinemas</span>
                  </Index.Box>
                  <Index.Box className="hero-stat">
                    <Index.LocalActivityIcon />
                    <span className="hero-stat-value">{movieShows.totalShows || 0}</span>
                    <span className="hero-stat-label">Shows</span>
                  </Index.Box>
                </Index.Box>
              )}
            </Index.Box>
            <Index.IconButton className="drawer-close movie-drawer-close" onClick={handleCloseMovieDrawer}>
              <Index.ClearIcon />
            </Index.IconButton>
          </Index.Box>

          {/* Drawer Body - Shows by Cinema */}
          <Index.Box className="movie-drawer-body">
            <Index.Box className="movie-drawer-section-header">
              <Index.Typography className="section-label">
                Shows by Cinema
              </Index.Typography>
            </Index.Box>

            {movieShowsLoading ? (
              <Index.Box className="drawer-loading">
                <Index.CircularProgress size={40} />
                <span>Loading movie shows...</span>
              </Index.Box>
            ) : movieShows?.showsByCinema?.length > 0 ? (
              <Index.Box className="movie-cinema-list">
                {movieShows.showsByCinema.map((cinema) => (
                  <Index.Accordion key={cinema._id} className="cinema-accordion" defaultExpanded={movieShows.showsByCinema.indexOf(cinema) === 0}>
                    <Index.AccordionSummary
                      expandIcon={<Index.ExpandMoreIcon />}
                      className="cinema-accordion-header"
                    >
                      <Index.Box className="cinema-accordion-content">
                        <Index.Box className="cinema-accordion-icon">
                          <Index.LocationCityIcon />
                        </Index.Box>
                        <Index.Box className="cinema-accordion-info">
                          <Index.Typography className="cinema-accordion-name">
                            {cinema.cinemaName}
                          </Index.Typography>
                          <Index.Box className="cinema-accordion-meta">
                            <Index.PlaceIcon />
                            <span>{cinema.regionName || "No Region"}</span>
                            {cinema.cinemaAddress && (
                              <>
                                <span className="meta-divider">|</span>
                                <span className="cinema-address">{cinema.cinemaAddress}</span>
                              </>
                            )}
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="cinema-accordion-badge">
                          <Index.LocalActivityIcon />
                          <span>{cinema.showCount} shows</span>
                        </Index.Box>
                      </Index.Box>
                    </Index.AccordionSummary>
                    <Index.AccordionDetails className="cinema-accordion-body">
                      {cinema.shows?.length > 0 ? (
                        <Index.Box className="date-accordion-container">
                          {Object.entries(groupShowsByDate(cinema.shows)).map(([date, shows], dateIndex) => (
                            <Index.Accordion key={date} className="date-accordion" defaultExpanded={dateIndex === 0}>
                              <Index.AccordionSummary
                                expandIcon={<Index.ExpandMoreIcon />}
                                className="date-accordion-header"
                              >
                                <Index.Box className="date-accordion-content">
                                  <Index.CalendarTodayIcon />
                                  <span className="date-accordion-title">{date}</span>
                                  <span className="date-accordion-count">{shows.length} shows</span>
                                </Index.Box>
                              </Index.AccordionSummary>
                              <Index.AccordionDetails className="date-accordion-body">
                                <Index.Box className="cinema-shows-grid">
                                  {shows.map((show, idx) => (
                                    <Index.Box key={idx} className="cinema-show-chip">
                                      <Index.Box className="show-chip-time">
                                        <Index.AccessTimeIcon />
                                        <span>{formatShowTime(show.sessionRealShow)}</span>
                                      </Index.Box>
                                      <Index.Box className="show-chip-details">
                                        <span className="show-chip-screen">
                                          {show.screenName || `Screen ${show.screenNumber}`}
                                        </span>
                                        <span className="show-chip-seats">
                                          <Index.PeopleIcon />
                                          {show.sessionSeatsAvail}/{show.sessionSeatsTotal}
                                        </span>
                                      </Index.Box>
                                    </Index.Box>
                                  ))}
                                </Index.Box>
                              </Index.AccordionDetails>
                            </Index.Accordion>
                          ))}
                        </Index.Box>
                      ) : (
                        <Index.Box className="no-shows-message">No shows available</Index.Box>
                      )}
                    </Index.AccordionDetails>
                  </Index.Accordion>
                ))}
              </Index.Box>
            ) : (
              <Index.Box className="drawer-empty movie-drawer-empty">
                <Index.Box className="empty-icon-wrapper">
                  <Index.LocalActivityIcon />
                </Index.Box>
                <Index.Typography className="empty-title">No Shows Available</Index.Typography>
                <Index.Typography className="empty-subtitle">
                  There are no upcoming shows scheduled for this movie
                </Index.Typography>
              </Index.Box>
            )}
          </Index.Box>
        </Index.Box>
      </Index.Drawer>
    </Index.Box>
  );
};

export default OverviewDashboard;
