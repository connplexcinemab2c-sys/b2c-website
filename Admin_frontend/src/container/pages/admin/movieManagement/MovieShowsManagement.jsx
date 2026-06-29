import React, { useEffect, useState } from "react";
import PagesIndex from "../../../PagesIndex";
import { setRef } from "@mui/material";
import Index from "../../../Index";
import { current } from "@reduxjs/toolkit";
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
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const MovieShowsManagement = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );

  const [movieList, setMovieList] = React.useState([]);
  const [moviesShows, setMoviesShows] = React.useState([]);
  const [filteredData, setFilteredData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMovie, setSelectedMovie] = useState("All");
  const [selectedMovieCode, setSelectedMovieCode] = useState("All");
  const [removeData, setRemoveData] = useState(false);
  const [cinemaList, setCinemaList] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("All");
  const getMoviesShowsList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_MOVIES_FROM_ALL_REGIONS)
      .then((res) => {
        console.log(res, 1212312);
        if (res?.data?.status === 200) {
          console.log(res.data.data, 1231311);
          const movieListData = res?.data?.data;
          setMoviesShows(movieListData);
          setFilteredData(movieListData);

          setTimeout(() => {
            setLoading(false);
          }, 1500);
          if (searchValue != "" && !removeData && !filteredData == []) {
            let filteredDataFilter = res?.data?.data?.filter((item) =>
              item?.name
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase())
            );
            setFilteredData([
              ...filteredDataFilter?.map((data) => ({ ...data })),
            ]);
          } else {
            // setFilteredData([...movieListData?.map((data) => ({ ...data }))]);
            setSearchValue("");

            false;
          }
        }
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const getMoviesList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_MOVIES_LIST_FOR_FILTER)
    // PagesIndex.DataService.get(
    //       PagesIndex.Api.GET_MOVIES + "?" + new Date().getTime()
    //     )
    // PagesIndex.DataService.get(PagesIndex.Api.GET_MOVIES_FROM_ALL_REGIONS)

      .then((res) => {
        if (res?.data?.status === 200) {
          const movieListData = res?.data?.data;
          setMovieList([...movieListData?.map((data) => ({ ...data }))]);
          // setTimeout(() => {
          //   setLoading(false);
          // }, 1500);
        }
      })
      .catch((err) => {
        // setTimeout(() => {
        //   setLoading(false);
        // }, 1500);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        const cinemas = res?.data?.data || [];
        const sortedCinemaList = cinemas.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );

        setCinemaList(sortedCinemaList);
        // setSelectedCinema(sortedCinemaList[0]?._id);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
const filterMovie = (moviecode, name, cinemaId) => {
  console.log("reached", moviecode, name,cinemaId);
  let resultMovie = [...moviesShows];

  // Filter by cinema
  if (cinemaId && cinemaId !== "All") {
    resultMovie = resultMovie.filter((data) => data?.cinemaId === cinemaId);
    // resultMovie = resultMovie.filter((data) => data?.cinemaObjectId?._id === cinemaId);
  }

  // Filter by movie code or name
  const isMovieCodeFilter = moviecode && moviecode !== "All";
  const isMovieNameFilter = name && name !== "All";

  if (isMovieCodeFilter || isMovieNameFilter) {
    resultMovie = resultMovie.filter((data) => {
      const matchesCode = isMovieCodeFilter && data?.filmCode === moviecode;
      const matchesName =
        isMovieNameFilter &&
        data?.name?.toLowerCase() === name.toLowerCase();
      return matchesCode || matchesName;
    });
  }

  setFilteredData(resultMovie);
  setCurrentPage(0);
};


  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    let filteredData = [
      ...moviesShows?.filter((data) => {
        const searchFilter = data?.name
          ?.toLowerCase()
          .includes(searched?.toLowerCase());

        return selectedMovie == "All" ? searchFilter : searchFilter;
      }),
    ];

    setFilteredData(filteredData);
    setCurrentPage(0);
  };
  const clearFilters = () => {
    setSelectedMovie("");
    setSearchValue("");
    setSelectedCinema("");
    setFilteredData(moviesShows);
  };
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
    setOpenDrawer(false);
  };
  useEffect(() => {
    if (openDrawer) {
      setIsOpen(openDrawer);
    } else {
      setOpenDrawer(false);
    }
  }, [openDrawer]);

  useEffect(() => {
    getMoviesList();
    getMoviesShowsList();
    getCinemaList();
  }, []);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("movie_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box
            className="barge-common-box"
            style={{ marginBottom: "15px" }}
          >
            <Index.Box className="title-header title-header-booking-form">
              <Index.Box className="booking-flex-content">
                <Index.Stack
                  component="form"
                  className="transaction-history-flex"
                  noValidate
                  autoComplete="off"
                >
                  <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search ">
                    <Index.Box className="booking-report-content mt-manage-coupon">
                      <Index.Box className="common-button blue-button res-blue-button">
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
                      </Index.Box>
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
                    Movies Shows
                  </Index.Typography>
                </Index.Box>
                {/* <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                  <Search className="search ">
                    <StyledInputBase
                      placeholder="Search"
                      inputProps={{ "aria-label": "search" }}
                      value={searchValue}
                      onChange={handleInputChange}
                    />
                  </Search>
                </Index.Box> */}
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
                      <Index.TableCell width="1%"># </Index.TableCell>
                      <Index.TableCell width="25%">Cinema </Index.TableCell>
                      {/* <Index.TableCell width="25%">region </Index.TableCell> */}
                      <Index.TableCell width="25%">Movie</Index.TableCell>
                      {/* <Index.TableCell width="25%">Date</Index.TableCell> */}
                      <Index.TableCell width="15%">Shows</Index.TableCell>
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
                          colSpan={4}
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
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          ?.map((item, index) => (
                            <Index.TableRow
                              // className="inquiry-list"
                              key={index}
                            >
                              <Index.TableCell>
                                {currentPage * rowsPerPage + index + 1}
                              </Index.TableCell>
                              <Index.TableCell>
                                {`${item?.cinemaCode ? item?.cinemaCode : "-"}`}
                                {/* {`${item?.cinemaObjectId?.cinemaCode ? item?.cinemaObjectId?.cinemaCode : "-"}`} */}
                                <br />
                                {/* {`${item?.cinemaObjectId?.cinemaName ? item?.cinemaObjectId?.cinemaName : "-"}`} */}
                                {`${item?.cinemaName ? item?.cinemaName : "-"}`}
                              </Index.TableCell>
                              {/* <Index.TableCell>
                                {item?.region ? item?.region : "-"}
                              </Index.TableCell> */}
                              <Index.TableCell>
                                {item?.name ? item?.name : "-"}
                              </Index.TableCell>
                              {/* <Index.TableCell>
                                {item?.showTimings &&
                                item.showTimings.length > 0
                                  ? PagesIndex.moment(
                                      item.showTimings[0]?.sessionRealShow
                                    ).format("DD/MM/YYYY")
                                  : "-"}
                              </Index.TableCell> */}
                              <Index.TableCell>
                                {item?.showTimings &&
                                item.showTimings.length > 0
                                  ? item.showTimings
                                      .map((tim) =>
                                        PagesIndex.moment(tim?.startTime).format("hh:mm A")
                                      )
                                      .join(", ")
                                  : "-"}
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
                            colSpan={4}
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
            ) : (
              <></>
            )}
          </Index.Box>
        </Index.Box>
        <React.Fragment key="right">
          <Index.Drawer
            anchor="right"
            open={isOpen}
            onClose={toggleDrawer(false)}
          >
            <Index.Box className="common-main-drawer">
              <Index.Box role="presentation" className="common-drawer-details">
                <Index.Box className="common-pd-drawer">
                  <Index.Box className="drawer-header">
                    <Index.Box className="common-filter-content">
                      <Index.Typography
                        component="p"
                        variant="p"
                        className="common-filter-title"
                      >
                        Filter
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box className="drawer-details-hgt">
                    <Index.Box className="drawer-inner-content">
                      {/* filter date */}
                      <Index.Box className="filter-input-field">
                        <Index.Grid
                          container
                          spacing={2}
                          className="common-admin-grid"
                        >
                          {/* filter date */}
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="common-btn-details">
                              <Index.Box className="flex-gap-footer end-justify-content">
                                <Index.Button
                                  className="btn-secondary"
                                  onClick={() => clearFilters()}
                                >
                                  Clear
                                </Index.Button>
                              </Index.Box>
                            </Index.Box>
                          </Index.Grid>
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="input-box ">
                              <Index.FormHelperText className="form-lable bold-label-common">
                                Cinema
                              </Index.FormHelperText>
                              <Index.Box className="input-box ">
                                <Index.Box className="form-group">
                                  <Index.Autocomplete
                                    fullWidth
                                    name="cinemas"
                                    id="cinema-autocomplete"
                                    className="cinema-auto-input custom-input"
                                    options={[
                                      { _id: "All", displayName: "All" },
                                      ...(cinemaList || []),
                                    ]}
                                    disableClearable
                                    getOptionLabel={(option) =>
                                      option?.displayName || ""
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                      // option.displayName === value.displayName
                                      option?._id === value?._id
                                    }
                                    // disableCloseOnSelect
                                    value={
                                      cinemaList.find(
                                        (item) => item?._id === selectedCinema
                                      ) || { _id: "All", displayName: "All" }
                                    }
                                    onChange={(e, value) => {
                                      if (value?._id === "All") {
                                        setSelectedCinema("All");
                                      } else {
                                        setSelectedCinema(value?._id);
                                        let getCinemaName = value?.displayName;
                                      }
                                      console.log(value, "valudfdsfdsf e");
                                      filterMovie(
                                        selectedMovieCode,
                                        selectedMovie,
                                        value?._id
                                      );
                                    }}
                                    renderOption={(props, option) => (
                                      <Index.MenuItem
                                        {...props}
                                        key={option._id}
                                        value={option._id}
                                        sx={{
                                          fontSize: "14px",
                                          padding: "8px 16px",
                                        }}
                                      >
                                        {option.displayName}
                                      </Index.MenuItem>
                                    )}
                                    renderInput={(params) => (
                                      <Index.TextField
                                        {...params}
                                        placeholder="Select Cinema"
                                        className="form-control"
                                      />
                                    )}
                                  />
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                          </Index.Grid>
                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="input-box ">
                              <Index.FormHelperText className="form-lable bold-label-common">
                                Movie
                              </Index.FormHelperText>
                              <Index.Box className="form-group">
                                <Index.Autocomplete
                                  fullWidth
                                  id="movie-autocomplete"
                                  name="movies"
                                  className="cinema-auto-input custom-input"
                                  options={[
                                    {
                                      uniqueFilmCode: "All",
                                      filmCode: "All",
                                      name: "All",
                                      _id: "All",
                                    },
                                    ...(movieList || []),
                                  ]} // Add 'All' as the first option
                                  getOptionLabel={(option) =>
                                    option?.name || ""
                                  }
                                  disableClearable
                                  isOptionEqualToValue={(option, value) =>
                                    option._id === value._id
                                  }
                                  // disableCloseOnSelect
                                  value={
                                    movieList.find(
                                      (movie) =>
                                        // movie?._id === selectedMovie
                                        movie.filmCode === selectedMovie
                                        // movie.uniqueFilmCode === selectedMovie
                                    ) || {
                                      uniqueFilmCode: "All",
                                      filmCode: "All",
                                      _id: "All",
                                      name: "All",
                                    }
                                  }
                                  onChange={(e, value) => {
                                    // If 'All' is selected, set the selected movie to 'All'
                                    // if (value?._id === "All") {
                                    if (value?.filmCode === "All") {
                                      setSelectedMovie("All");
                                      setSelectedMovieCode("All");
                                    } else {
                                      // setSelectedMovie(
                                      
                                      //   value?.uniqueFilmCode || ""
                                      // );
                                      setSelectedMovie(value?.filmCode || "");
                                      setSelectedMovieCode(value?.name || "");
                                    }
                                    console.log(value, 1231231);
                                    filterMovie(
                                      // value?.uniqueFilmCode,
                                      value?.filmCode,
                                      value?.name,
                                      selectedCinema
                                    );
                                    // setCurrentPage(1); // Reset current page if filtering changes
                                  }}
                                  renderOption={(props, option) => (
                                    <Index.MenuItem
                                      {...props}
                                      key={option._id}
                                      sx={{
                                        fontSize: "14px",
                                        padding: "8px 16px",
                                      }}
                                    >
                                      {option.name}
                                    </Index.MenuItem>
                                  )}
                                  renderInput={(params) => (
                                    <Index.TextField
                                      {...params}
                                      placeholder="Select Movie"
                                      className="form-control"
                                    />
                                  )}
                                />
                              </Index.Box>
                              {/* <Index.Select
                                fullWidth
                                id="fullWidth"
                                name="category"
                                className="form-control"
                                displayEmpty
                                value={selectedMovie}
                                onChange={(e) => {
                                  setSelectedMovie(e.target.value);
                                  filterMovie(e.target.value);
                                }}
                                renderValue={
                                  selectedMovie
                                    ? undefined
                                    : () => "Select movie"
                                }
                              >
                                <Index.MenuItem value={""}>All</Index.MenuItem>
                                {movieList?.map((data, index) => (
                                  <Index.MenuItem
                                    key={index}
                                    value={data?.name}
                                    className="menu-movie-max"
                                  >
                                    {data?.name}
                                  </Index.MenuItem>
                                ))}
                              </Index.Select> */}
                            </Index.Box>
                          </Index.Grid>
                        </Index.Grid>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box className="drawer-footer">
                    <Index.Box className="common-btn-details">
                      <Index.Box className="flex-gap-footer end-justify-content blue-button common-button">
                        <Index.Button onClick={toggleDrawer(false)}>
                          Close
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Drawer>
        </React.Fragment>
      </>
    );
  }
};

export default MovieShowsManagement;
