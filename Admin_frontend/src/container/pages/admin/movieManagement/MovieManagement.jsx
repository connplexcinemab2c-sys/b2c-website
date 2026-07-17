import React, { useCallback, useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./MovieManagement.css";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";

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
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};
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

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const MovieManagement = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [movieList, setMovieList] = useState([]);
  const [actorList, setActorList] = useState([]);
  const [crewList, setCrewList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [editData, setEditData] = useState("Add");
  const [id, setId] = useState("");
  const [uniqueFilmCode, setUniqueFileCode] = useState("");
  const [hasFilmCode, setHasFilmCode] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectStatus, setSelectStatus] = useState(0);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMovie, setSelectedMovie] = useState("");
  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpenUnique, setAddOpenUniuqe] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingState, setLoadingState] = useState({});
  const [item, setItem] = useState({});
  const [rowData, setRowData] = useState(null);
  const [nowPlayingMovielist, setNowPlayingMovieList] = useState([]);

  let durationValue = editData?.duration ? editData?.duration : "";
  const displayDuration = (durationInHours) => {
    const hours = Math.floor(durationInHours);
    const minutes = Math.round((durationInHours - hours) * 100);
    return hours + "." + minutes;
  };
  let initialValues;
  if (addOrEdit == "Edit") {
    initialValues = {
      isPosterUploaded: editData?.poster ? true : false,
      movieName: editData?.name,
      description: editData?.description,
      censorRating: editData?.censorRating,
      poster: editData?.poster,
      releaseDate: PagesIndex.dayjs(editData?.filmOpeningDate),
      releaseStatus: editData?.status,
      category: editData?.category,
      // duration: displayDuration(parseFloat(durationValue)),
      duration:
        displayDuration(parseFloat(durationValue)) < 4
          ? displayDuration(parseFloat(durationValue))
          : "",
      // duration: editData.duration,
      language: editData?.languages,
      cast: editData?.starCast,
      crew: editData?.crew,
      movieUrl: editData?.youtubeVideoUrl,
      movieCategory: editData?.movieCategory,
      movieType: editData?.movieType,
      ratings: editData?.rating,
      likes: editData?.likes?.toString(),
      linkNowplayingMovieId: editData?.linkNowplayingMovieId ? editData?.linkNowplayingMovieId : "",
    };
  } else {
    initialValues = {
      isPosterUploaded: false,
      movieName: "",
      description: "",
      censorRating: "",
      poster: "",
      releaseDate: "",
      releaseStatus: "",
      category: "",
      duration: "",
      cast: [],
      crew: [],
      language: "",
      movieUrl: "",
      ratings: "",
      likes: "",
      movieCategory: "",
      movieType: "",
      linkNowplayingMovieId: "",
    };
  }
  //
  useEffect(() => {
    if (openDrawer) {
      setIsOpen(openDrawer);
    } else {
      setOpenDrawer(false);
    }
  }, [openDrawer]);

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
  //
  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
  };

  const handleClose = () => {
    setHasFilmCode("");
    setId("");
    setImageUrl("");
    setAddOpen(false);
  };

  const handleOpenUnique = (item) => {
    if (item) {
      setRowData(item);
    }
    setAddOpenUniuqe(true);
  };
  const handleCloseUnique = () => {
    setRowData(null);
    setAddOpenUniuqe(false);
  };

  const handleDeleteOpen = (item) => {
    setItem(item);
    setUniqueFileCode(item?.uniqueFilmCode);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
    setUniqueFileCode("");
  };

  const filterMovie = (movie, status) => {
    let resultMovie = [...movieList];

    if (movie) {
      resultMovie = resultMovie.filter(
        (data) => data?.name.toLowerCase() === movie.toLowerCase()
      );
    }
    if (status > 0) {
      resultMovie = resultMovie.filter((data) => data?.status === status);
    }
    setFilteredData(resultMovie);
    setCurrentPage(0);
  };

  // Search on table
  const requestSearch = (searched) => {
    let filteredData = [
      ...movieList?.filter((data) => {
        const statusFilter = selectStatus === 0 || data.status === selectStatus;

        const searchFilter =
          data?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
          (data &&
            data.filmOpeningDate &&
            PagesIndex.moment(data.filmOpeningDate)
              .format("DD/MM/YYYY hh:mm A")
              ?.toString()
              ?.toLowerCase()
              .includes(searched.toLowerCase())) ||
          data?.cinemaObjectId?.cinemaName
            ?.toLowerCase()
            .includes(searched?.toLowerCase());

        return statusFilter && searchFilter;
      }),
    ];

    setFilteredData(filteredData);
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const getActorsList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_ACTORS + "?" + new Date().getTime()
    )
      .then((res) => {
        setActorList(
          res?.data?.data?.filter((data) => data?.category?.includes("Cast"))
        );
        setCrewList(
          res?.data?.data?.filter((data) => data?.category?.includes("Crew"))
        );
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const getMoviesList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_MOVIES + "?" + new Date().getTime()
    )
      .then((res) => {
        if (res?.data?.status === 200) {
          const movieListData = res?.data?.data
            ?.filter((data) => {
              if (location?.state?.name) {
                return location?.state?.name == data?.name;
              } else {
                return data;
              }
            })
            .map((data) => ({
              ...data,
            }));

          const nowPlayingMovie = movieListData?.filter(
            (movie) => movie?.status === 1
          );
          setNowPlayingMovieList(nowPlayingMovie);


          setMovieList([...movieListData?.map((data) => ({ ...data }))]);
          setFilteredData([...movieListData?.map((data) => ({ ...data }))]);
          setTimeout(() => {
            setLoading(false);
          }, 1500);
          if (searchValue != "" && !removeData && !filteredData == []) {
            let filteredDataFilter = res?.data?.data?.filter((item) =>
              item?.name?.toLowerCase().includes(searchValue?.toLowerCase())
            );
            setFilteredData([
              ...filteredDataFilter?.map((data) => ({ ...data })),
            ]);
          } else {
            setFilteredData([...movieListData?.map((data) => ({ ...data }))]);
            setSearchValue("");
            setRemoveData(false);
          }
          setSelectStatus(0);
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

  const handleMoviesSubmit = (values) => {
    setIsSubmit(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }
    if (hasFilmCode) {
      urlEncoded.append("filmCode", hasFilmCode);
    }
    urlEncoded.append("name", values?.movieName);
    urlEncoded.append("description", values?.description);
    urlEncoded.append("poster", values?.poster);
    urlEncoded.append(
      "filmOpeningDate",
      PagesIndex.dayjs(values?.releaseDate).format("YYYY-MM-DD")
    );
    urlEncoded.append("censorRating", values?.censorRating);
    urlEncoded.append("status", values?.releaseStatus);
    urlEncoded.append("category", values?.category);
    urlEncoded.append("duration", values?.duration);
    urlEncoded.append("languages", values?.language);
    urlEncoded.append("youtubeVideoUrl", values.movieUrl);
    urlEncoded.append("starCast", JSON.stringify(values.cast));
    urlEncoded.append("crew", JSON.stringify(values.crew));
    urlEncoded.append("rating", values.ratings ? values.ratings : 0);
    urlEncoded.append("likes", values?.likes ? values?.likes : 0);
    urlEncoded.append("movieCategory", values.movieCategory);
    urlEncoded.append("movieType", values.movieType);
    if(values?.linkNowplayingMovieId){
      urlEncoded.append("linkNowplayingMovieId", values.linkNowplayingMovieId);
    }

    PagesIndex.DataService.post(
      hasFilmCode ? PagesIndex.Api.EDIT_MOVIES : PagesIndex.Api.ADD_MOVIES,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getMoviesList();
        setIsSubmit(false);
        setSelectStatus(0);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };

  const handleStatus = (event, item) => {
    let payload = {
      isActive: event.target.checked,
    };

    if (item?.status === 2) {
      payload.id = item._id;
    } else {
      payload.uniqueFilmCode = item?.uniqueFilmCode;
    }
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_MOVIE, payload)
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          getMoviesList();
          setTimeout(() => {
            setLoadingState((prevState) => ({ ...prevState, [id]: false }));
          }, 1000);
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
  };

  const handleMovieRemove = () => {
    setIsSubmit(true);
    let payload = item?.status === 2 ? { id: item._id } : { uniqueFilmCode };
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_MOVIE, payload)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getMoviesList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };
  useEffect(() => {
    getActorsList();
    getMoviesList();
  }, [removeData]);

  const clearFilters = () => {
    setSelectStatus(0);
    setSelectedMovie("");
    setFilteredData(movieList);
    setCurrentPage(0);
  };

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
                    {adminLoginData?.roleId?.permissions?.includes(
                      "movie_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export movie-add-btn-res">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Movie
                        </Index.Button>
                      </Index.Box>
                    )}
                    {adminLoginData?.roleId?.permissions?.includes(
                      "movie_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Movie
                        </Index.Button>
                      </Index.Box>
                    )}
                    {adminLoginData?.roleId?.permissions?.includes(
                      "movie_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button common-unique-code">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => {
                            setItem({});
                            handleOpenUnique();
                          }}
                        >
                          Generate Unique Code
                        </Index.Button>
                      </Index.Box>
                    )}
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
                    Movie Management
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
                      <Index.TableCell width="15%">Image</Index.TableCell>
                      <Index.TableCell width="25%">Movie</Index.TableCell>
                      <Index.TableCell width="25%">
                        Release Date
                      </Index.TableCell>
                      {/* <Index.TableCell width="25%">Cinema Name</Index.TableCell> */}
                      {/* <Index.TableCell width="25%">Location</Index.TableCell> */}
                      <Index.TableCell width="25%">
                        Release Status
                      </Index.TableCell>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "movie_edit"
                      ) && (
                        <Index.TableCell width="10%">Status</Index.TableCell>
                      )}
                      {(adminLoginData?.roleId?.permissions?.includes(
                        "movie_edit"
                      ) ||
                        adminLoginData?.roleId?.permissions?.includes(
                          "movie_delete"
                        )) && (
                        <Index.TableCell align="right" width="10%">
                          Action
                        </Index.TableCell>
                      )}
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
                                <Index.Box className="class_img">
                                  <img
                                    src={
                                      item?.poster
                                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    onClick={handleClose}
                                    alt=""
                                  />
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.name ? item?.name : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.filmOpeningDate
                                  ? PagesIndex.dayjs(
                                      item?.filmOpeningDate
                                    ).format("DD/MM/YYYY")
                                  : "-"}
                              </Index.TableCell>
                              {/* <Index.TableCell>
                                <Index.Tooltip
                                  title={item?.cinemaObjectId?.cinemaName}
                                  placement="top"
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details">
                                    {item?.cinemaObjectId?.cinemaName
                                      ? (item?.cinemaObjectId?.cinemaName).slice(
                                          0,
                                          30
                                        ) + "..."
                                      : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell> */}
                              {/* <Index.TableCell>
                                <Index.Tooltip
                                  title={item?.cinemaObjectId?.address}
                                  placement="top"
                                  arrow
                                >
                                  {item?.cinemaObjectId?.address
                                    ? (item?.cinemaObjectId?.address).slice(
                                        0,
                                        30
                                      ) + "..."
                                    : "-"}
                                </Index.Tooltip>
                              </Index.TableCell> */}

                              <Index.TableCell>
                                {item?.status
                                  ? item?.status === 1
                                    ? "Now Playing"
                                    : "Upcoming"
                                  : "-"}
                              </Index.TableCell>
                              {adminLoginData?.roleId?.permissions?.includes(
                                "movie_edit"
                              ) && (
                                <Index.TableCell>
                                  <CustomToggleButton
                                    defaultChecked={item?.isActive}
                                    checked={item?.isActive && item?.isActive}
                                    onChange={(e) => handleStatus(e, item)}
                                    disabled={loadingState[item?._id] || false}
                                  />
                                </Index.TableCell>
                              )}
                              {(adminLoginData?.roleId?.permissions?.includes(
                                "movie_edit"
                              ) ||
                                adminLoginData?.roleId?.permissions?.includes(
                                  "movie_delete"
                                )) && (
                                <Index.TableCell align="right">
                                  <Index.Box className="flex-action-details">
                                    <Index.Box className="icon-width-action">
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "movie_edit"
                                      ) && (
                                        <Index.IconButton
                                          onClick={(e) => {
                                            // before it was "filmCode"
                                            if (item?.uniqueFilmCode) {
                                              setHasFilmCode(
                                                item?.uniqueFilmCode
                                              );
                                            }
                                            setId(item?._id);
                                            if (item?.poster) {
                                              setImageUrl(
                                                `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.poster}`
                                              );
                                            }
                                            handleOpen("Edit");
                                            setEditData(item);
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      )}
                                    </Index.Box>
                                    <Index.Box className="icon-width-action">
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "movie_delete"
                                      ) && (
                                        <Index.IconButton
                                          onClick={() => {
                                            handleOpenUnique(item);
                                          }}
                                        >
                                          <Index.Visibility />
                                        </Index.IconButton>
                                      )}
                                    </Index.Box>
                                    <Index.Box className="icon-width-action">
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "movie_delete"
                                      ) && (
                                        <Index.IconButton
                                          onClick={() => handleDeleteOpen(item)}
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
                                      )}
                                    </Index.Box>
                                  </Index.Box>
                                </Index.TableCell>
                              )}
                            </Index.TableRow>
                          ))
                      ) : (
                        <Index.TableRow>
                          <Index.TableCell
                            component="td"
                            variant="td"
                            scope="row"
                            className="no-data-in-list"
                            colSpan={15}
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

        {/* Add movie Modal start */}
        <Index.Modal
          open={addOpen}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal"
        >
          <Index.Box
            sx={style}
            className="modal-inner-main add-cinema-modal modal-inner"
          >
            <Index.Box className="modal-header">
              <Index.Typography
                id="modal-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
              >
                {addOrEdit} Movie
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleClose}
              />
            </Index.Box>
            <Index.Box className="modal-body">
              <PagesIndex.Formik
                enableReinitialize
                onSubmit={handleMoviesSubmit}
                initialValues={initialValues}
                validationSchema={
                  addOrEdit === "Add"
                    ? PagesIndex.movieSchema
                    : PagesIndex.movieEditSchema
                }
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  setFieldError,
                }) => (
                  <Index.Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Movie Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="movieName"
                          className="form-control"
                          placeholder="Enter movie name"
                          value={values?.movieName}
                          inputProps={{ maxLength: 51 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 51) {
                              setFieldValue("movieName", newValue);
                            }
                          }}
                          error={
                            errors.movieName && touched.movieName ? true : false
                          }
                          helperText={
                            errors.movieName && touched.movieName
                              ? errors.movieName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Description
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="description"
                          className="form-control"
                          placeholder="Enter description"
                          value={values?.description}
                          inputProps={{ maxLength: 500 }}
                          // onChange={(e) => {
                          //   const newValue = e.target.value
                          //     .replace(/^\s+/, "")
                          //     .replace(/\s\s+/g, " ");
                          //   if (newValue.length <= 201) {
                          //     setFieldValue("description", newValue);
                          //   }
                          // }}
                          onInput={(event) => {
                            const input = event.target;
                            let inputValue = input.value;
                            inputValue = inputValue.trimLeft();
                            inputValue = inputValue.replace(/\s{2,}/g, " ");
                            if (inputValue.length > 500) {
                              inputValue = inputValue.slice(0, 500);
                            }
                            input.value = inputValue;
                          }}
                          onChange={handleChange}
                          error={
                            errors.description && touched.description
                              ? true
                              : false
                          }
                          helperText={
                            errors.description && touched.description
                              ? errors.description
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Movie Poster (size 278x417 px)
                      </Index.FormHelperText>
                      {/* {imageUrl && (
                      <img src={imageUrl} className="region-image" />
                    )}
                    <Index.Box className="form-group region_img_upload">
                      <Index.Box className="common-button grey-button change-profile">
                        <input
                          name="poster"
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={(event) => {
                            setFieldValue("poster", event.currentTarget.files[0]);
                            setImageUrl(
                              URL.createObjectURL(event.currentTarget.files[0])
                            );
                          }}
                        />
                        <Index.FormHelperText error>
                          {errors.poster && touched.poster ? errors.poster : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box> */}
                      <Index.Box className="file-upload-btn-main">
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              className="upload-profile-img"
                            />
                          ) : (
                            <img
                              className="
                            upload-img"
                              src={PagesIndex.Svg.add}
                            />
                          )}
                          <input
                            hidden
                            accept="image/*"
                            name="poster"
                            type="file"
                            // onChange={(e) => {
                            //   try {
                            //     setFieldValue("poster", e.currentTarget.files[0]);
                            //     setImageUrl(
                            //       URL.createObjectURL(e.currentTarget.files[0])
                            //     );
                            //   } catch (error) {
                            //     e.currentTarget.value = null;
                            //   }
                            // }}
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files &&
                                  e.currentTarget.files[0]
                                ) {
                                  setFieldValue(
                                    "poster",
                                    e.currentTarget.files[0]
                                  );
                                  setImageUrl(
                                    URL.createObjectURL(
                                      e.currentTarget.files[0]
                                    )
                                  );
                                }
                              } catch (error) {
                                e.currentTarget.value = null;
                              }
                            }}
                            error={errors.image && touched.image}
                            helperText={
                              errors.image && touched.image
                                ? errors.image
                                : false
                            }
                          />
                        </Index.Button>
                        <Index.FormHelperText error>
                          {errors.poster && touched.poster
                            ? errors.poster
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Release Date
                      </Index.FormHelperText>
                      <Index.Box className="form-group date-picker">
                        <Index.LocalizationProvider
                          dateAdapter={Index.AdapterDayjs}
                        >
                          <Index.DatePicker
                            fullWidth
                            id="fullWidth"
                            name="releaseDate"
                            // value={values.releaseDate}
                            className="form-control"
                            format="DD/MM/YYYY"
                            placeholder="Enter release date"
                            value={values?.releaseDate || null}
                            slotProps={{
                              textField: {
                                helperText:
                                  errors.releaseDate && touched.releaseDate
                                    ? errors.releaseDate
                                    : null,
                                error:
                                  errors.releaseDate && touched.releaseDate,
                              },
                            }}
                            onChange={(e) => {
                              setFieldValue("releaseDate", e, true);
                            }}
                            minDate={
                              values?.releaseStatus == 2
                                ? dayjs(
                                    PagesIndex.moment().format("YYYY-MM-DD")
                                  ).add(1, "day")
                                : null
                            }
                            renderInput={(params) => (
                              <Index.TextField
                                {...params}
                                sx={{ width: "100%" }}
                              />
                            )}
                          />
                        </Index.LocalizationProvider>
                      </Index.Box>
                      {/* {errors.releaseDate && touched.releaseDate ? (
                        <Index.FormHelperText error>
                          {errors.releaseDate}
                        </Index.FormHelperText>
                      ) : (
                        ""
                      )} */}
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Movie Category
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="movieCategory"
                          className="form-control"
                          value={values?.movieCategory}
                          displayEmpty
                          renderValue={
                            values?.movieCategory
                              ? undefined
                              : () => (
                                  <span className="placeholder-text">
                                    Select movie category
                                  </span>
                                )
                          }
                          onChange={handleChange}
                          error={errors.movieCategory && touched.movieCategory}
                        >
                          <Index.MenuItem value={"Bollywood"}>
                            Bollywood
                          </Index.MenuItem>
                          <Index.MenuItem value={"Hollywood"}>
                            Hollywood
                          </Index.MenuItem>
                          <Index.MenuItem value={"Regional"}>
                            Regional
                          </Index.MenuItem>
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.movieCategory && touched.movieCategory
                            ? errors.movieCategory
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Movie Type
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="movieType"
                          className="form-control"
                          value={values?.movieType}
                          displayEmpty
                          renderValue={
                            values?.movieType
                              ? undefined
                              : () => (
                                  <span className="placeholder-text">
                                    Select movie type
                                  </span>
                                )
                          }
                          onChange={handleChange}
                          error={errors.movieType && touched.movieType}
                        >
                          <Index.MenuItem value={"2D"}>2D</Index.MenuItem>
                          <Index.MenuItem value={"3D"}>3D</Index.MenuItem>
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.movieType && touched.movieType
                            ? errors.movieType
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Release Status
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="releaseStatus"
                          className="form-control"
                          value={values?.releaseStatus}
                          displayEmpty
                          disabled={hasFilmCode}
                          renderValue={
                            values?.releaseStatus
                              ? undefined
                              : () => (
                                  <span className="placeholder-text">
                                    Select release status
                                  </span>
                                )
                          }
                          onChange={handleChange}
                          error={errors.releaseStatus && touched.releaseStatus}
                        >
                          <Index.MenuItem disabled value={1}>
                            Now Playing
                          </Index.MenuItem>
                          <Index.MenuItem value={2}>Upcoming</Index.MenuItem>
                          <Index.MenuItem value={3}>Closed</Index.MenuItem>
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.releaseStatus && touched.releaseStatus
                            ? errors.releaseStatus
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Censor Rating
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          type="text"
                          name="censorRating"
                          className="form-control censorRating-input"
                          placeholder="Enter censor rating"
                          value={values?.censorRating}
                          inputProps={{ maxLength: 10 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            setFieldValue("censorRating", newValue);
                          }}
                          error={errors.censorRating && touched.censorRating}
                          helperText={
                            errors.censorRating && touched.censorRating
                              ? errors.censorRating
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        {/* Duration (In Hours: 04:00) */}
                        Duration
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          // type="number"
                          type="tel"
                          fullWidth
                          id="fullWidth"
                          name="duration"
                          className="form-control duration-input"
                          placeholder="Enter duration"
                          // placeholder="Enter duration (e.g., 04:00)"
                          value={values?.duration}
                          inputProps={{ maxLength: 5 }}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          // onChange={(e) => {
                          //   const inputValue = e.target.value;
                          //   const colonIndex = inputValue.indexOf(":");

                          //   if (
                          //     colonIndex !== -1 &&
                          //     inputValue.length - colonIndex > 3
                          //   ) {
                          //     e.preventDefault();
                          //     return;
                          //   }

                          //   const regex = /^\d{0,2}(:\d{0,2})?$/;
                          //   // const regex = /^[0-9:]*$/;
                          //   if (!regex.test(inputValue)) {
                          //     e.preventDefault();
                          //     return;
                          //   }

                          //   handleChange(e);
                          // }}
                          error={errors.duration && touched.duration}
                          helperText={
                            errors.duration && touched.duration
                              ? errors.duration
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Youtube Url
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="movieUrl"
                          className="form-control"
                          placeholder="Enter movieUrl"
                          value={values?.movieUrl}
                          inputProps={{ maxLength: 200 }}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/^\s+/, "");
                            setFieldValue("movieUrl", newValue);
                          }}
                          error={errors.movieUrl && touched.movieUrl}
                          helperText={
                            errors.movieUrl && touched.movieUrl
                              ? errors.movieUrl
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Genre
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="category"
                          className="form-control"
                          placeholder="Enter genre"
                          value={values?.category}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 51) {
                              setFieldValue("category", newValue);
                            }
                          }}
                          error={errors.category && touched.category}
                          helperText={
                            errors.category && touched.category
                              ? errors.category
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Language
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="language"
                          className="form-control"
                          placeholder="Enter language"
                          value={values?.language}
                          inputProps={{ maxLength: 31 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 31) {
                              setFieldValue("language", newValue);
                            }
                          }}
                          error={errors.language && touched.language}
                          helperText={
                            errors.language && touched.language
                              ? errors.language
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box add-coupon-details">
                      <Index.FormHelperText className="form-lable">
                        Cast
                      </Index.FormHelperText>
                      <Index.Box className="form-group ">
                        <Index.Autocomplete
                          className="cinema-auto-input"
                          multiple
                          options={actorList}
                          getOptionLabel={(option) => option?.name}
                          defaultValue={() => {
                            let idArray = [];
                            values?.cast?.map((data1) => {
                              let item = actorList.find(
                                (data2) => data1?.starCastId?._id === data2?._id
                              );
                              idArray.push(item);
                            });
                            return idArray;
                          }}
                          disableCloseOnSelect
                          renderOption={(props, option, { selected }) => {
                            return (
                              <Index.MenuItem
                                key={option._id}
                                value={option?.name}
                                sx={{ justifyContent: "space-between" }}
                                {...props}
                              >
                                <Index.ListItemText>
                                  {option?.name}
                                </Index.ListItemText>
                                {selected ? <Index.Check /> : null}
                              </Index.MenuItem>
                            );
                          }}
                          renderInput={(params) => (
                            <Index.TextField
                              {...params}
                              error={errors.cast && touched.cast}
                              helperText={
                                errors.cast && touched.cast ? errors.cast : null
                              }
                              placeholder="Enter actor name"
                              className="movie-management-input movie-management-category"
                              onKeyDown={(event) => {
                                if (event.keyCode === 32) {
                                  event.preventDefault();
                                }
                              }}
                            />
                          )}
                          onChange={(e, val) => {
                            let idArray = [];
                            val?.map((item) => {
                              let objData = {
                                starCastId: item._id,
                              };
                              idArray.push(objData);
                            });
                            setFieldValue("cast", idArray);
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box add-coupon-details">
                      <Index.FormHelperText className="form-lable">
                        Crew
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Autocomplete
                          className="cinema-auto-input"
                          multiple
                          options={crewList}
                          getOptionLabel={(option) => option?.name}
                          defaultValue={() => {
                            let idArray = [];
                            values?.crew?.map((data1) => {
                              let item = crewList.find(
                                (data2) => data1?.starCastId === data2?._id
                              );
                              idArray.push(item);
                            });
                            return idArray;
                          }}
                          disableCloseOnSelect
                          renderOption={(props, option, { selected }) => {
                            return (
                              <Index.MenuItem
                                key={option._id}
                                value={option?.name}
                                sx={{ justifyContent: "space-between" }}
                                {...props}
                              >
                                <Index.ListItemText>
                                  {option?.name}
                                </Index.ListItemText>
                                {selected ? <Index.Check /> : null}
                              </Index.MenuItem>
                            );
                          }}
                          renderInput={(params) => (
                            <Index.TextField
                              {...params}
                              error={errors.crew && touched.crew ? true : false}
                              helperText={
                                errors.crew && touched.crew ? errors.crew : null
                              }
                              placeholder="Enter crew name"
                              className="movie-management-input movie-management-category"
                              onKeyDown={(event) => {
                                if (event.keyCode === 32) {
                                  event.preventDefault();
                                }
                              }}
                            />
                          )}
                          onChange={(e, val) => {
                            let idArray = [];
                            val?.map((item) => {
                              let objData = {
                                starCastId: item._id,
                              };
                              idArray.push(objData);
                            });
                            setFieldValue("crew", idArray);
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Ratings
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          type="tel"
                          name="ratings"
                          className="form-control ratings-input"
                          placeholder="Enter ratings"
                          value={values?.ratings}
                          inputProps={{ maxLength: 3 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            setFieldValue("ratings", newValue);
                          }}
                          error={
                            errors.ratings && touched.ratings ? true : false
                          }
                          helperText={
                            errors.ratings && touched.ratings
                              ? errors.ratings
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        No. Of Likes
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          type="tel"
                          name="likes"
                          className="form-control likes-input"
                          placeholder="Enter no. of likes"
                          value={values?.likes}
                          inputProps={{ maxLength: 10 }}
                          // onChange={(e) => {
                          //   const newValue = e.target.value.replace(/^\s+/, "");
                          //   setFieldValue("likes", newValue);
                          // }}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\D+/g, "");
                            if (newValue.length <= 10) {
                              setFieldValue("likes", newValue);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                          error={errors.likes && touched.likes ? true : false}
                          helperText={
                            errors.likes && touched.likes ? errors.likes : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    {values.releaseStatus == 2 && (
                      <Index.Box className="input-box modal-input-box add-coupon-details">
                        <Index.FormHelperText className="form-lable">
                          Link Now Playing Movie (Optional)
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Autocomplete
                            className="cinema-auto-input"
                            options={nowPlayingMovielist}
                            getOptionLabel={(option) => option?.name}
                            defaultValue={() => {
                              const selectedMovie =
                                nowPlayingMovielist.find(
                                  (data) => data?._id === values?.linkNowplayingMovieId
                                ) || null;
                              return selectedMovie;
                            }}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => {
                              return (
                                <Index.MenuItem
                                  key={option._id}
                                  value={option?.name}
                                  sx={{ justifyContent: "space-between" }}
                                  {...props}
                                >
                                  <Index.ListItemText>
                                    {option?.name}
                                  </Index.ListItemText>
                                  {selected ? <Index.Check /> : null}
                                </Index.MenuItem>
                              );
                            }}
                            renderInput={(params) => (
                              <Index.TextField
                                {...params}
                                error={
                                  errors.linkNowplayingMovieId && touched.linkNowplayingMovieId
                                }
                                helperText={
                                  errors.linkNowplayingMovieId && touched.linkNowplayingMovieId
                                    ? errors.linkNowplayingMovieId
                                    : null
                                }
                                placeholder="Select now playing movie"
                                className="movie-management-input movie-management-category"
                              />
                            )}
                            onChange={(e, val) => {
                              setFieldValue("linkNowplayingMovieId", val?._id);
                            }}
                          />
                        </Index.Box>
                      </Index.Box>
                    )}
                    <Index.Box className="modal-user-btn-flex">
                      <Index.Box className="discard-btn-main btn-main-primary">
                        <Index.Box className="common-button blue-button res-blue-button">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={handleClose}
                          >
                            Discard
                          </Index.Button>
                          <Index.Button
                            type="submit"
                            disabled={isSubmit == true}
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                          >
                            <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                            ></img>
                            {addOrEdit == "Add" ? "Add" : "Update"}
                          </Index.Button>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                )}
              </PagesIndex.Formik>
            </Index.Box>
          </Index.Box>
        </Index.Modal>

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
                            <Index.Box className="form-group w-100-res-drop">
                              <Index.Select
                                fullWidth
                                id="fullWidth"
                                name="category"
                                className="form-control"
                                displayEmpty
                                value={selectedMovie}
                                onChange={(e) => {
                                  setSelectedMovie(e.target.value);
                                  filterMovie(e.target.value, selectStatus);
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
                              </Index.Select>
                            </Index.Box>
                          </Index.Grid>

                          <Index.Grid
                            item
                            xs={12}
                            className="common-admin-grid-item"
                          >
                            <Index.Box className="form-group w-100-res-drop">
                              <Index.Select
                                fullWidth
                                id="fullWidth"
                                value={selectStatus}
                                onChange={(e) => {
                                  setSelectStatus(e.target.value);
                                  filterMovie(selectedMovie, e.target.value);
                                }}
                                displayEmpty
                                renderValue={
                                  selectStatus
                                    ? undefined
                                    : () => "Select release status"
                                }
                              >
                                {/* <Index.MenuItem value="" disabled>Select release status</Index.MenuItem> */}
                                <Index.MenuItem value={0}>All</Index.MenuItem>
                                <Index.MenuItem value={1}>
                                  Now Playing
                                </Index.MenuItem>
                                <Index.MenuItem value={2}>
                                  Upcoming
                                </Index.MenuItem>
                              </Index.Select>
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

        <PagesIndex.DeleteModal
          deleteOpen={deleteOpen}
          handleDeleteClose={handleDeleteClose}
          handleDeleteRecord={!isSubmit && handleMovieRemove}
          isDisable={isSubmit}
        />
        {addOpenUnique && (
          <GenerateUniqueCodeModal
            open={addOpenUnique}
            handleClose={handleCloseUnique}
            getMoviesList={getMoviesList}
            rowData={rowData}
          />
        )}
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

const GenerateUniqueCodeModal = (props) => {
  const { open, handleClose, getMoviesList, rowData } = props;
  const [loading, setLoading] = useState({
    tableLoading: false,
    isSubmitting: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);

  const handleMovieSelection = (e, id) => {
    setSelectedMovies((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((movieId) => movieId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = movieList
        .filter((item) => !item?.uniqueFilmCode || item?.uniqueFilmCode === rowData?.uniqueFilmCode)
        .map((item) => item._id);

      setSelectedMovies(selectableIds);
    } else {
      setSelectedMovies([]);
    }
  };

  const handleMoviesUniqueSubmit = async () => {
    setLoading((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const urlEncoded = new URLSearchParams();
      if (selectedMovies?.length > 0) {
        selectedMovies.forEach((id) => {
          urlEncoded.append("ids[]", id);
        });
      }

      if (rowData && rowData?._id) {
        urlEncoded.append("movieId", rowData?._id);
      }

      if (rowData && rowData?.uniqueFilmCode) {
        urlEncoded.append("uniqueFilmCode", rowData?.uniqueFilmCode);
      }

      const response = await PagesIndex.DataService.post(
        PagesIndex.Api.UPDATE_UNIQUE_MOVIE_CODE,
        urlEncoded
      );
      if (response?.data?.status === 200) {
        PagesIndex.toast.success(response?.data?.message);
        getMoviesList();
        handleClose();
      } else {
        PagesIndex.toast.error(response?.data?.message);
      }
    } catch (error) {
      PagesIndex.toast.error(error?.response?.data?.message);
    } finally {
      setTimeout(() => {
        setLoading((prev) => ({ ...prev, isSubmitting: false }));
      }, 1000);
    }
  };

  const fetchMovies = async (search = "") => {
    setLoading((prev) => ({ ...prev, tableLoading: true }));
    try {
      let filmCode = rowData?.filmCode?.slice(4);

      const response = await PagesIndex.DataService.get(
        `${PagesIndex.Api.GET_GENERATE_CODE_MOVIES}?search=${search}${
          filmCode ? `&filmCode=${filmCode}` : ""
        }`
      );
      const fetchedMovies = response?.data?.data ?? [];
      setMovieList(fetchedMovies);
      if (rowData?.uniqueFilmCode) {
        const initialSelected = fetchedMovies
          .filter((item) => item?.uniqueFilmCode === rowData?.uniqueFilmCode)
          .map((item) => item._id);
        setSelectedMovies(initialSelected);
      } else if (rowData?._id) {
        setSelectedMovies([rowData._id]);
      }
    } catch (error) {
      if (error?.response?.data?.message !== "jwt expired") {
        PagesIndex.toast.error(error?.response?.data?.message);
      }
    } finally {
      setLoading((prev) => ({ ...prev, tableLoading: false }));
    }
  };
  const debouncedSearch = useCallback(debounce(fetchMovies, 1000), []);

  useEffect(() => {
    if (rowData) {
      fetchMovies();
    }
  }, []);
  return (
    <Index.Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="modal"
    >
      <Index.Box
        sx={style}
        className="modal-inner-main unique-movie-modal modal-inner"
      >
        <Index.Box className="modal-header">
          <Index.Typography
            id="modal-modal-title"
            className="modal-title"
            variant="h6"
            component="h2"
          >
            Generate Unique Code
          </Index.Typography>
          <img
            src={PagesIndex.Svg.cancel}
            className="modal-close-icon"
            onClick={handleClose}
          />
        </Index.Box>
        <Index.Box className="d-flex flex-space-between align-items-center res-set-search uniq-code-serach-flex">
          <Index.Typography
            id="modal-modal-title"
            className="modal-title"
            variant="h6"
            component="h2"
          >
            {selectedMovies?.length > 0
              ? `${selectedMovies?.length} Selected Movies`
              : null}
          </Index.Typography>
          {!rowData ? (
            <Search className="search">
              <StyledInputBase
                autoFocus
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
                onChange={(e) => {
                  const value = e?.target?.value;
                  if (value) {
                    debouncedSearch(value);
                  } else {
                    setMovieList([]);
                    setSelectedMovies([]);
                  }
                  setSearchTerm(value);
                }}
                disabled={loading.isSubmitting || loading.tableLoading}
              />
            </Search>
          ) : (
            "\u00A0"
          )}
        </Index.Box>
        <Index.Box className="modal-body page-table-main">
          <Index.TableContainer
            component={Index.Paper}
            className="table-container"
          >
            <Index.Table
              stickyHeader
              aria-label="sticky table"
              className="table-design-main one-line-table unique-table"
            >
              <Index.TableHead>
                <Index.TableRow>
                  <Index.TableCell width="10%">Image</Index.TableCell>
                  <Index.TableCell width="50%">Movie</Index.TableCell>
                  <Index.TableCell width="30%">Cinema</Index.TableCell>
                  <Index.TableCell width="10%">
                    {" "}
                    <Index.Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={0.5}
                    >
                      <Index.Checkbox
                        size="small"
                        checked={
                          movieList?.length > 0 &&
                          movieList
                            .filter((item) => !item?.uniqueFilmCode || item?.uniqueFilmCode === rowData?.uniqueFilmCode)
                            .every((item) => selectedMovies.includes(item._id))
                        }
                        indeterminate={
                          selectedMovies.length > 0 &&
                          movieList
                            .filter((item) => !item?.uniqueFilmCode || item?.uniqueFilmCode === rowData?.uniqueFilmCode)
                            .some((item) =>
                              selectedMovies.includes(item._id)
                            ) &&
                          !movieList
                            .filter((item) => !item?.uniqueFilmCode || item?.uniqueFilmCode === rowData?.uniqueFilmCode)
                            .every((item) => selectedMovies.includes(item._id))
                        }
                        onChange={handleSelectAll}
                      />
                      <span>Action</span>
                    </Index.Box>
                  </Index.TableCell>
                </Index.TableRow>
              </Index.TableHead>
              <Index.TableBody>
                {loading.tableLoading ? (
                  <Index.TableRow>
                    <Index.TableCell
                      component="td"
                      variant="td"
                      scope="row"
                      className="no-data-in-list"
                      colSpan={4}
                      align="center"
                    >
                      Loading...
                    </Index.TableCell>
                  </Index.TableRow>
                ) : movieList?.length > 0 ? (
                  movieList?.map((item) => (
                    <Index.TableRow key={item?._id}>
                      <Index.TableCell>
                        <Index.Box className="class_img">
                          <img
                            src={
                              item?.poster
                                ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                : PagesIndex.Png.NoImageAvailable
                            }
                            onClick={handleClose}
                            alt=""
                          />
                        </Index.Box>
                      </Index.TableCell>
                      <Index.TableCell>
                        {item?.name ? item?.name : "-"}
                      </Index.TableCell>
                      <Index.TableCell>
                        {item?.cinemaObjectId?.displayName
                          ? item?.cinemaObjectId?.displayName
                          : "-"}
                      </Index.TableCell>
                      <Index.TableCell>
                        <Index.Checkbox
                          className="check-box-input"
                          checked={
                            selectedMovies?.includes(item?._id)
                          }
                          onChange={(e) => handleMovieSelection(e, item?._id)}
                          disabled={!!item?.uniqueFilmCode && item?.uniqueFilmCode !== rowData?.uniqueFilmCode}
                        />
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
                      colSpan={15}
                      align="center"
                    >
                      No data available
                    </Index.TableCell>
                  </Index.TableRow>
                )}
              </Index.TableBody>
            </Index.Table>
          </Index.TableContainer>
        </Index.Box>
        <Index.Box className="modal-footer">
          <Index.Box className="modal-user-btn-flex">
            <Index.Box className="discard-btn-main btn-main-primary">
              <Index.Box className="common-button blue-button res-blue-button">
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                  onClick={handleClose}
                >
                  Discard
                </Index.Button>
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                  disabled={
                    !selectedMovies.length ||
                    loading.isSubmitting ||
                    loading.tableLoading
                  }
                  onClick={handleMoviesUniqueSubmit}
                >
                  <img
                    src={PagesIndex.Svg.save}
                    className="user-save-icon"
                  ></img>
                  Save
                </Index.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};

export default MovieManagement;
