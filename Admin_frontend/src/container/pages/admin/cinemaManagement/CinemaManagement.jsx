import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./CinemaManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";

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

const CinemaManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const formikRef = useRef();
  let initialValues = {
    cinemaName: "",
    displayName: "",
    poster: "",
    images: [],
    address: "",
    regionId: "",
    emailId: "",
    mobileNumber: "",
    googleUrl: "",
    cinemaPromoUrl: "",
    cinemaWebServiceUrl: "",
    cinemaWebServiceUrl2: "",
    serviceCharge: "",
    convenienceFees: "",
    cinemaAmenities: [],
    GSTNumber: "",
  };
  const [loading, setLoading] = useState(true);
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [regionList, setRegionList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [titleError, setTitleError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [deleteImageUrls, setDeleteImageUrls] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
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

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // model
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);

  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [loadingState, setLoadingState] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync log modal
  const [syncLogOpen, setSyncLogOpen] = useState(false);
  const [syncLogData, setSyncLogData] = useState([]);
  const [syncLogLoading, setSyncLogLoading] = useState(false);
  const [syncLogCinema, setSyncLogCinema] = useState(null);
  const [syncLogPage, setSyncLogPage] = useState(0);
  const [syncLogRowsPerPage, setSyncLogRowsPerPage] = useState(10);
  const [syncLogTotal, setSyncLogTotal] = useState(0);
  const [syncLogStartDate, setSyncLogStartDate] = useState(null);
  const [syncLogEndDate, setSyncLogEndDate] = useState(null);

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
    formikRef.current?.resetForm();
  };
  const handleClose = () => {
    setId("");
    setImageUrl("");
    setImageURLs([]);
    setAddOpen(false);
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = cinemaList.filter(
      (data) =>
        data?.cinemaName?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.cinemaId?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.displayName?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.emailId?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.mobileNumber?.toString()?.includes(searched?.toString()) ||
        (data &&
          data.lastSync &&
          PagesIndex.moment(data.lastSync)
            .format("DD MMM YYYY, hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched.toLowerCase()))
    );
    setFilteredData(filteredData);
    // setCurrentPage(0)
    setCurrentPage(0);
  };
  // get region list
  const getRegionList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_REGION + "?" + new Date().getTime()
    )
      .then((res) => {
        setRegionList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  // get cinema list
  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
        const cinemaListData = res?.data?.data?.filter((data) => {
          if (location?.state?.displayName) {
            return location?.state?.displayName == data?.displayName;
          } else {
            return data;
          }
        });
        setFilteredData(cinemaListData);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = cinemaListData?.filter(
            (title) =>
              title?.cinemaName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              title?.displayName
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(cinemaListData);
          setSearchValue("");
          setRemoveData(false);
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

  const handleCinemaSubmit = (values) => {
    setLoading(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }

    // console.log(values);

    urlEncoded.append("cinemaName", values?.cinemaName);
    urlEncoded.append("cinemaBranchCode", values?.cinemaBranchCode);
    urlEncoded.append("displayName", values?.displayName);
    urlEncoded.append("address", values?.address);
    urlEncoded.append("regionId", values?.regionId);
    urlEncoded.append("mobileNumber", values?.mobileNumber);
    urlEncoded.append("emailId", values?.emailId);
    urlEncoded.append("poster", values?.poster);
    urlEncoded.append("GSTNumber", values?.GSTNumber);
    urlEncoded.append("googleUrl", values?.googleUrl);
    urlEncoded.append("cinemaPromoUrl", values?.cinemaPromoUrl);
    urlEncoded.append("cinemaWebServiceUrl", values?.cinemaWebServiceUrl);
    urlEncoded.append("lat", values?.lat);
    urlEncoded.append("long", values?.long);
    urlEncoded.append(
      "cinemaWebServiceUrl2",
      values?.cinemaWebServiceUrl2 || ""
    );
    urlEncoded.append("serviceCharge", values?.serviceCharge);
    urlEncoded.append("convenienceFees", values?.convenienceFees);
    urlEncoded.append(
      "cinemaAmenities",
      JSON.stringify(values?.cinemaAmenities)
    );
    deleteImageUrls?.map((item) => {
      urlEncoded.append("removedImageUrl", item);
    });
    images?.map((e) => {
      urlEncoded.append("images", e);
    });
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_CINEMA, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getCinemaList();
        setTitleError("");
        setLoading(false);
      })
      .catch((err) => {
        if (
          err.response.data.message == "Cinema already exist in this region"
        ) {
          setTitleError("Cinema name already exist");
        } else {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
        setLoading(false);
      });
  };
  const handleCinemaSync = (id) => {
    PagesIndex.DataService.get(`${PagesIndex.Api.CINEMAWISE_SYNC}/${id}`)
      .then((res) => {
        getCinemaList();
        PagesIndex.toast.success(res?.data?.message);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const handleViewSyncLogs = (cinema, page = 0, rowsPerPage = 10, startDate = syncLogStartDate, endDate = syncLogEndDate) => {
    setSyncLogCinema(cinema);
    setSyncLogOpen(true);
    setSyncLogLoading(true);
    setSyncLogPage(page);
    setSyncLogRowsPerPage(rowsPerPage);
    let url = `${PagesIndex.Api.GET_CINEMA_SYNC_LOGS}/${cinema.cinemaId}?page=${page + 1}&limit=${rowsPerPage}`;
    if (startDate) url += `&startDate=${PagesIndex.moment(startDate).format("YYYY-MM-DD")}`;
    if (endDate) url += `&endDate=${PagesIndex.moment(endDate).format("YYYY-MM-DD")}`;
    PagesIndex.DataService.get(url)
      .then((res) => {
        setSyncLogData(res?.data?.data || []);
        setSyncLogTotal(res?.data?.totalCount || 0);
        setSyncLogLoading(false);
      })
      .catch(() => {
        setSyncLogData([]);
        setSyncLogLoading(false);
      });
  };

  const handleSyncLogClose = () => {
    setSyncLogOpen(false);
    setSyncLogData([]);
    setSyncLogCinema(null);
    setSyncLogPage(0);
    setSyncLogTotal(0);
    setSyncLogStartDate(null);
    setSyncLogEndDate(null);
  };

  const handleCinemaRemove = () => {
    setIsLoading(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_CINEMA, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getCinemaList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };
  const handleInput = (event) => {
    const input = event.target;
    const inputValue = input.value;

    if (inputValue.length > 10) {
      input.value = inputValue.slice(0, 10);
    }
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const handleStatus = (event, id) => {
    const data = {
      id: id,
      isActive: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_CINEMA, data)
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          getCinemaList();
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

  const filterMovie = (data) => {
    let resultMovie = cinemaList;

    if (data && data !== "") {
      resultMovie = resultMovie.filter((item) => {
        return item?._id === data;
      });
    }

    setFilteredData(resultMovie);
    setCurrentPage(0);
  };
  const clearFilters = () => {
    setSearchValue("");
    setSelectedMovie("");
    setFilteredData(cinemaList);
  };
  useEffect(() => {
    getCinemaList();
    getRegionList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("cinema_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleCinemaSubmit}
        initialValues={initialValues}
        validationSchema={
          addOrEdit === "Add"
            ? PagesIndex.cinemaSchema
            : PagesIndex.cinemaEditSchema
        }
        innerRef={formikRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
          resetForm,
        }) => (
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
                        Cinema Management
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "cinema_add"
                      ) && (
                        <>
                          {/* <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => {
                              handleOpen("Add");
                            }}
                          >
                            Add Cinema
                          </Index.Button>
                        </Index.Box> */}
                        </>
                      )}{" "}
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
                      {adminLoginData?.roleId?.permissions?.includes(
                        "cinema_add"
                      ) && (
                        <>
                          {/* <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => {
                              handleOpen("Add");
                            }}
                          >
                            Add Cinema 
                          </Index.Button>
                        </Index.Box> */}
                        </>
                      )}
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
                          <Index.TableCell width="5%">Image</Index.TableCell>
                          <Index.TableCell width="5%">CinemaId</Index.TableCell>
                          <Index.TableCell width="25%">Cinema</Index.TableCell>
                          <Index.TableCell width="20%">
                            Display Name
                          </Index.TableCell>
                          <Index.TableCell width="10%">
                            Last Synced
                          </Index.TableCell>
                          {adminLoginData?.roleId?.permissions?.includes(
                            "cinema_edit"
                          ) && (
                            <Index.TableCell width="10%">
                              Status
                            </Index.TableCell>
                          )}
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "cinema_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "cinema_delete"
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
                                <Index.TableRow key={item?._id}>
                                  <Index.TableCell>
                                    <Index.Box className="cinema_img">
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
                                    {item?.cinemaId ? item?.cinemaId : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    <Index.Typography className="cinema-mb-table">
                                      {" "}
                                      {item?.cinemaName
                                        ? item?.cinemaName
                                        : "-"}
                                    </Index.Typography>
                                    <Index.Typography className="cinema-mb-table">
                                      {" "}
                                      {item?.emailId ? item?.emailId : ""}
                                    </Index.Typography>
                                    <Index.Typography className="cinema-mb-table">
                                      {" "}
                                      {item?.mobileNumber
                                        ? item?.mobileNumber
                                        : ""}
                                    </Index.Typography>
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.displayName
                                      ? item?.displayName
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.lastSync
                                      ? PagesIndex.moment(
                                          item?.lastSync
                                        ).format("DD MMM YYYY, hh:mm A")
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="center" width="5%">
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "cinema_edit"
                                    ) && (
                                      <CustomToggleButton
                                        defaultChecked={item?.isActive}
                                        onChange={(e) =>
                                          handleStatus(e, item?._id)
                                        }
                                        disabled={
                                          loadingState[item?._id] || false
                                        }
                                      />
                                    )}
                                  </Index.TableCell>
                                  {(adminLoginData?.roleId?.permissions?.includes(
                                    "cinema_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "cinema_delete"
                                    )) && (
                                    <Index.TableCell align="right">
                                      <Index.Box class="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          <Index.Tooltip title="View Sync Logs" arrow>
                                            <Index.IconButton
                                              onClick={() => handleViewSyncLogs(item)}
                                            >
                                              <Index.VisibilitySharpIcon />
                                            </Index.IconButton>
                                          </Index.Tooltip>
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "cinema_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={(e) => {
                                                handleCinemaSync(
                                                  item?.cinemaId
                                                );
                                              }}
                                            >
                                              <Index.SyncIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "cinema_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={(e) => {
                                                setId(item?._id);
                                                handleOpen("Edit");
                                                if (item?.poster) {
                                                  setImageUrl(
                                                    `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.poster}`
                                                  );
                                                }
                                                setFieldValue(
                                                  "poster",
                                                  item?.poster || ""
                                                );

                                                for (let key in item) {
                                                  if (key === "regionId") {
                                                    setFieldValue(
                                                      key,
                                                      item[key]?._id
                                                    );
                                                  }
                                                  if (key === "cinema_images") {
                                                    const imageArr = item[
                                                      key
                                                    ]?.map(
                                                      (data) =>
                                                        `${PagesIndex?.IMAGES_API_ENDPOINT}/${data}`
                                                    );
                                                    setImages(imageArr);
                                                    setFieldValue(
                                                      "images",
                                                      imageArr
                                                    );
                                                    setImageURLs(imageArr);
                                                  }
                                                  if (
                                                    key !== "poster" &&
                                                    key !== "regionId"
                                                  ) {
                                                    setFieldValue(
                                                      key,
                                                      item[key]
                                                    );
                                                  }
                                                }
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "cinema_delete"
                                          ) && (
                                            <Index.IconButton
                                              onClick={() =>
                                                handleDeleteOpen(item?._id)
                                              }
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

            {/* add modal */}
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
                    {addOrEdit} Cinema
                  </Index.Typography>
                  <img
                    src={PagesIndex.Svg.cancel}
                    className="modal-close-icon"
                    onClick={handleClose}
                  />
                </Index.Box>
                <Index.Box className="modal-body">
                  <Index.Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="cinemaName"
                          className="form-control"
                          placeholder="Enter cinema name"
                          value={values?.cinemaName}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 50) {
                              setFieldValue("cinemaName", newValue);
                            }
                            if (e.target.value.length <= 0) {
                              setTitleError("");
                            } else {
                              setTitleError("");
                            }
                          }}
                          error={errors.cinemaName && touched.cinemaName}
                          helperText={
                            errors.cinemaName && touched.cinemaName
                              ? errors.cinemaName
                              : null
                          }
                        />
                        <Index.FormHelperText sx={{ color: "red" }}>
                          {errors?.cinemaName === undefined && titleError
                            ? titleError
                            : ""}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Display Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="displayName"
                          className="form-control"
                          placeholder="Enter display name"
                          value={values?.displayName}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 50) {
                              setFieldValue("displayName", newValue);
                            }
                          }}
                          error={
                            errors.displayName && touched.displayName
                              ? true
                              : false
                          }
                          helperText={
                            errors.displayName && touched.displayName
                              ? errors.displayName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Branch Code
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="cinemaBranchCode"
                          className="form-control"
                          placeholder="Enter Cinema Branch Code"
                          value={values?.cinemaBranchCode}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            setFieldValue("cinemaBranchCode", e.target.value);
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Promo URL
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="cinemaPromoUrl"
                          className="form-control"
                          placeholder="Enter Cinema Promo URL"
                          value={values?.cinemaPromoUrl}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, "");
                            e.target.value = value;
                            handleChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " && e.target.value.trim() === "") {
                              e.preventDefault();
                            }
                          }}
                          error={
                            errors.cinemaPromoUrl && touched.cinemaPromoUrl
                          }
                          helperText={
                            errors.cinemaPromoUrl && touched.cinemaPromoUrl
                              ? errors.cinemaPromoUrl
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Address
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="address"
                          className="form-control"
                          placeholder="Enter address"
                          value={values?.address}
                          inputProps={{ maxLength: 100 }}
                          onInput={(event) => {
                            const input = event.target;
                            let inputValue = input.value;
                            inputValue = inputValue.trimLeft();
                            inputValue = inputValue.replace(/\s{2,}/g, " ");
                            if (inputValue.length > 100) {
                              inputValue = inputValue.slice(0, 100);
                            }
                            input.value = inputValue;
                          }}
                          onChange={handleChange}
                          error={errors.address && touched.address}
                          helperText={
                            errors.address && touched.address
                              ? errors.address
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Cover Image
                      </Index.FormHelperText>
                      {/* {imageUrl && (
                      <img src={imageUrl} className="cinema-image" />
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
                            onChange={(e) => {
                              try {
                                setFieldValue(
                                  "poster",
                                  e.currentTarget.files[0]
                                );
                                setImageUrl(
                                  URL.createObjectURL(e.currentTarget.files[0])
                                );
                              } catch (error) {
                                console.error(error);
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
                      </Index.Box>
                      <Index.FormHelperText error>
                        {errors.poster && touched.poster ? errors.poster : null}
                      </Index.FormHelperText>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Theatre Image
                      </Index.FormHelperText>
                      <Index.Box className="file-upload-btn-main multiple-images">
                        {imageURLs.length
                          ? imageURLs.map((data, key) => {
                              return (
                                <Index.Button
                                  key={key}
                                  variant="contained"
                                  component="span"
                                  className="file-upload-btn file-upload-btn-close"
                                  onClick={() => {
                                    const imageArray = images?.filter(
                                      (data, index) => key !== index
                                    );
                                    typeof images[key] == "string" &&
                                      setDeleteImageUrls((prev) => [
                                        ...prev,
                                        images[key],
                                      ]);
                                    const imageArrayForFile = images?.filter(
                                      (data, index) =>
                                        key !== index &&
                                        typeof data === "object"
                                    );

                                    const remainingImgUrl =
                                      values?.images?.filter(
                                        (ele, index) => index !== key
                                      );
                                    setFieldValue("images", remainingImgUrl);
                                    setImages(imageArray);
                                    const newImageUrls = [];
                                    imageArray.forEach((image) => {
                                      if (typeof image === "object") {
                                        newImageUrls.push(
                                          URL.createObjectURL(image)
                                        );
                                      } else {
                                        newImageUrls.push(image);
                                      }
                                    });
                                    setImageURLs(newImageUrls);
                                  }}
                                >
                                  <img
                                    src={data}
                                    className="upload-profile-img"
                                  />
                                </Index.Button>
                              );
                            })
                          : ""}
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          <img
                            className="
                          upload-img"
                            src={PagesIndex.Svg.add}
                          />
                          <input
                            hidden
                            accept="image/*"
                            multiple
                            name="images"
                            type="file"
                            onChange={(e) => {
                              const keys = Object.keys(e.currentTarget.files);
                              const imageArray = keys?.map((data) => {
                                return e.currentTarget.files[data];
                              });
                              try {
                                setFieldValue("images", [
                                  ...values?.images,
                                  ...imageArray,
                                ]);
                                setImages((prev) => [...prev, ...imageArray]);
                                const newImageUrls = [];
                                imageArray.forEach((image) =>
                                  newImageUrls.push(URL.createObjectURL(image))
                                );
                                setImageURLs((prev) => [
                                  ...prev,
                                  ...newImageUrls,
                                ]);
                              } catch (error) {
                                console.error(error);
                                e.currentTarget.value = null;
                              }
                            }}
                            error={errors.images && touched.images}
                            helperText={
                              errors.images && touched.images
                                ? errors.images
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.FormHelperText error>
                        {errors.images && touched.images ? errors.images : null}
                      </Index.FormHelperText>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Region
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="regionId"
                          className="form-control"
                          value={values?.regionId}
                          displayEmpty
                          renderValue={
                            values?.regionId ? undefined : () => "Select region"
                          }
                          onChange={handleChange}
                          error={errors.regionId && touched.regionId}
                        >
                          {regionList.map((data, key) => {
                            return (
                              <Index.MenuItem value={data?._id} key={key}>
                                {data?.region}
                              </Index.MenuItem>
                            );
                          })}
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.regionId && touched.regionId
                            ? errors.regionId
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Email
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="emailId"
                          className="form-control"
                          placeholder="Enter email"
                          value={values?.emailId}
                          inputProps={{ maxLength: 320 }}
                          onChange={(e) => {
                            setFieldValue("emailId", e.target.value.trim());
                          }}
                          error={errors.emailId && touched.emailId}
                          helperText={
                            errors.emailId && touched.emailId
                              ? errors.emailId
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Phone Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          name="mobileNumber"
                          className="form-control"
                          placeholder="Enter phone number"
                          inputProps={{ maxLength: 10 }}
                          value={values?.mobileNumber}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\D+/g, "");
                            if (newValue.length <= 10) {
                              setFieldValue("mobileNumber", newValue);
                            }
                          }}
                          onInput={handleInput}
                          error={
                            errors.mobileNumber && touched.mobileNumber
                              ? true
                              : false
                          }
                          helperText={
                            errors.mobileNumber && touched.mobileNumber
                              ? errors.mobileNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        GST Identification Number
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="GSTNumber"
                          className="form-control"
                          placeholder="Enter GST identification number"
                          value={values?.GSTNumber}
                          inputProps={{ maxLength: 15 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 15) {
                              setFieldValue("GSTNumber", newValue);
                            }
                          }}
                          error={errors.GSTNumber && touched.GSTNumber}
                          helperText={
                            errors.GSTNumber && touched.GSTNumber
                              ? errors.GSTNumber
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Amenities
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Autocomplete
                          className="cinema-auto-input"
                          multiple
                          options={[
                            "Ticket Cancellation",
                            "Wheelchair Facility",
                            "Parking Facility",
                            "M Ticket",
                            "F&B",
                          ]}
                          getOptionLabel={(option) => option}
                          defaultValue={() => {
                            let idArray = [];
                            values?.cinemaAmenities?.map((data1, index) => {
                              idArray.push(data1);
                            });
                            return idArray;
                          }}
                          disableCloseOnSelect
                          renderOption={(props, option, { selected }) => {
                            return (
                              <Index.MenuItem
                                key={option}
                                value={option}
                                sx={{ justifyContent: "space-between" }}
                                {...props}
                              >
                                <Index.ListItemText>
                                  {option}
                                </Index.ListItemText>
                                {selected ? <Index.Check /> : null}
                              </Index.MenuItem>
                            );
                          }}
                          renderInput={(params) => (
                            <Index.TextField
                              {...params}
                              error={
                                errors.cinemaAmenities &&
                                touched.cinemaAmenities
                                  ? true
                                  : false
                              }
                              helperText={
                                errors.cinemaAmenities &&
                                touched.cinemaAmenities
                                  ? errors.cinemaAmenities
                                  : null
                              }
                              placeholder="Select amenities name"
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
                            val.map((item) => {
                              idArray.push(item);
                            });
                            setFieldValue("cinemaAmenities", idArray);
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Google URL
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="googleUrl"
                          className="form-control"
                          placeholder="Enter Google URL"
                          value={values?.googleUrl}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " && e.target.value.trim() === "") {
                              e.preventDefault();
                            }
                          }}
                          error={errors.googleUrl && touched.googleUrl}
                          helperText={
                            errors.googleUrl && touched.googleUrl
                              ? errors.googleUrl
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Web Service URL 1
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="cinemaWebServiceUrl"
                          className="form-control"
                          placeholder="Enter cinema web service url 1"
                          inputProps={{ maxLength: 100 }}
                          value={values?.cinemaWebServiceUrl}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " && e.target.value.trim() === "") {
                              e.preventDefault();
                            }
                          }}
                          error={
                            errors.cinemaWebServiceUrl &&
                            touched.cinemaWebServiceUrl
                              ? true
                              : false
                          }
                          helperText={
                            errors.cinemaWebServiceUrl &&
                            touched.cinemaWebServiceUrl
                              ? errors.cinemaWebServiceUrl
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Cinema Web Service URL 2
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="cinemaWebServiceUrl2"
                          className="form-control"
                          placeholder="Enter cinema web service url 2"
                          inputProps={{ maxLength: 100 }}
                          value={values?.cinemaWebServiceUrl2}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " && e.target.value.trim() === "") {
                              e.preventDefault();
                            }
                          }}
                          error={
                            errors.cinemaWebServiceUrl2 &&
                            touched.cinemaWebServiceUrl2
                              ? true
                              : false
                          }
                          helperText={
                            errors.cinemaWebServiceUrl2 &&
                            touched.cinemaWebServiceUrl2
                              ? errors.cinemaWebServiceUrl2
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Service Charge
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          name="serviceCharge"
                          className="form-control"
                          placeholder="Enter convenience fees"
                          inputProps={{ maxLength: 5 }}
                          value={values?.serviceCharge}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\D+/g, "");
                            if (newValue.length <= 5) {
                              setFieldValue("serviceCharge", newValue);
                            }
                          }}
                          error={errors.serviceCharge && touched.serviceCharge}
                          helperText={
                            errors.serviceCharge && touched.serviceCharge
                              ? errors.serviceCharge
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Convenience Fees
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          name="convenienceFees"
                          className="form-control"
                          placeholder="Enter convenience fees"
                          inputProps={{ maxLength: 5 }}
                          value={values?.convenienceFees}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\D+/g, "");
                            if (newValue.length <= 5) {
                              setFieldValue("convenienceFees", newValue);
                            }
                          }}
                          error={
                            errors.convenienceFees && touched.convenienceFees
                          }
                          helperText={
                            errors.convenienceFees && touched.convenienceFees
                              ? errors.convenienceFees
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Latitude
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          name="lat"
                          className="form-control"
                          placeholder="Enter latitude"
                          value={values?.lat}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Allow only positive numbers and one decimal point
                            const isValidInput = /^\d*\.?\d*$/.test(newValue);
                            if (isValidInput) {
                              setFieldValue("lat", newValue);
                            }
                          }}
                          error={errors.lat && touched.lat}
                          helperText={
                            errors.lat && touched.lat ? errors.lat : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Longitude
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          // type="number"
                          name="long"
                          className="form-control"
                          placeholder="Enter longitude"
                          value={values?.long}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            // Allow only positive numbers and one decimal point
                            const isValidInput = /^\d*\.?\d*$/.test(newValue);
                            if (isValidInput) {
                              setFieldValue("long", newValue);
                            }
                          }}
                          error={errors.long && touched.long}
                          helperText={
                            errors.long && touched.long ? errors.long : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
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
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            disabled={loading}
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
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>

            {/* Sync Log Modal */}
            <Index.Dialog
              open={syncLogOpen}
              onClose={handleSyncLogClose}
              maxWidth="lg"
              fullWidth
              PaperProps={{ style: { borderRadius: 12, maxHeight: "90vh" } }}
            >
              <Index.Box className="modal-header" style={{ padding: "16px 24px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Index.Typography variant="h6" component="h2" className="modal-title">
                  Sync Logs — {syncLogCinema?.cinemaName || ""}{syncLogCinema?.cinemaId ? ` (${syncLogCinema.cinemaId})` : ""}
                </Index.Typography>
                <img
                  src={PagesIndex.Svg.cancel}
                  className="modal-close-icon"
                  onClick={handleSyncLogClose}
                  style={{ cursor: "pointer" }}
                />
              </Index.Box>
              <Index.DialogContent style={{ padding: "16px 24px" }}>
                {/* Date filter bar */}
                <Index.Box style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <Index.LocalizationProvider dateAdapter={Index.AdapterDayjs}>
                    <Index.DatePicker
                      label="From Date"
                      format="DD/MM/YYYY"
                      value={syncLogStartDate ? PagesIndex.dayjs(PagesIndex.moment(syncLogStartDate).format("YYYY-MM-DD")) : null}
                      maxDate={PagesIndex.dayjs(PagesIndex.moment().format("YYYY-MM-DD"))}
                      slotProps={{ textField: { size: "small", readOnly: true, style: { width: 160 } } }}
                      onChange={(date) => {
                        const formatted = date ? PagesIndex.moment(date.$d).format("YYYY-MM-DD") : null;
                        setSyncLogStartDate(formatted);
                        if (syncLogEndDate && formatted && formatted > syncLogEndDate) {
                          setSyncLogEndDate(null);
                        }
                      }}
                    />
                  </Index.LocalizationProvider>
                  <Index.LocalizationProvider dateAdapter={Index.AdapterDayjs}>
                    <Index.DatePicker
                      label="To Date"
                      format="DD/MM/YYYY"
                      value={syncLogEndDate ? PagesIndex.dayjs(PagesIndex.moment(syncLogEndDate).format("YYYY-MM-DD")) : null}
                      minDate={syncLogStartDate ? PagesIndex.dayjs(syncLogStartDate) : undefined}
                      maxDate={PagesIndex.dayjs(PagesIndex.moment().format("YYYY-MM-DD"))}
                      slotProps={{ textField: { size: "small", readOnly: true, style: { width: 160 } } }}
                      onChange={(date) => {
                        const formatted = date ? PagesIndex.moment(date.$d).format("YYYY-MM-DD") : null;
                        setSyncLogEndDate(formatted);
                      }}
                    />
                  </Index.LocalizationProvider>
                  <Index.Button
                    variant="contained"
                    size="small"
                    disabled={!syncLogStartDate && !syncLogEndDate}
                    onClick={() => handleViewSyncLogs(syncLogCinema, 0, syncLogRowsPerPage, syncLogStartDate, syncLogEndDate)}
                    style={{ height: 40 }}
                  >
                    Search
                  </Index.Button>
                  {(syncLogStartDate || syncLogEndDate) && (
                    <Index.Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSyncLogStartDate(null);
                        setSyncLogEndDate(null);
                        handleViewSyncLogs(syncLogCinema, 0, syncLogRowsPerPage, null, null);
                      }}
                      style={{ height: 40 }}
                    >
                      Clear
                    </Index.Button>
                  )}
                </Index.Box>
                {syncLogLoading ? (
                  <Index.Box style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                    <Index.CircularProgress size={32} />
                  </Index.Box>
                ) : syncLogData.length === 0 ? (
                  <Index.Box style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                    No sync logs found for this cinema.
                  </Index.Box>
                ) : (
                  <>
                    <Index.TableContainer component={Index.Paper} style={{ boxShadow: "none", border: "1px solid #e0e0e0", borderRadius: 8 }}>
                      <Index.Table aria-label="sync logs table" size="small">
                        <Index.TableHead style={{ backgroundColor: "#f5f5f5" }}>
                          <Index.TableRow>
                            <Index.TableCell style={{ fontWeight: 600, minWidth: 155, whiteSpace: "nowrap" }}>Date & Time</Index.TableCell>
                            <Index.TableCell style={{ fontWeight: 600, minWidth: 180, whiteSpace: "nowrap" }}>API Called</Index.TableCell>
                            <Index.TableCell style={{ fontWeight: 600, minWidth: 80 }}>Trigger</Index.TableCell>
                            <Index.TableCell style={{ fontWeight: 600, minWidth: 80 }}>Result</Index.TableCell>
                            <Index.TableCell style={{ fontWeight: 600 }}>What Happened</Index.TableCell>
                          </Index.TableRow>
                        </Index.TableHead>
                        <Index.TableBody>
                          {syncLogData.map((log) => {
                            const details = log.cinemaDetails || {};
                            const isSuccess = log.status === "Success";
                            const isDatabaseSync = log.type === "DatabaseSync";

                            const renderWhatHappened = () => {
                              const row = (label, value, color) => (
                                <Index.Box style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                                  <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap", minWidth: 110 }}>{label}</span>
                                  <span style={{ fontSize: 11, color: color || "#333", wordBreak: "break-all" }}>{value}</span>
                                </Index.Box>
                              );

                              if (isDatabaseSync) {
                                return (
                                  <Index.Box>
                                    {details.failedUrl
                                      ? row("Failed on URL:", details.failedUrl, "#c62828")
                                      : row("Checked URL:", details.activeUrl || "—", "#555")}
                                    {!isSuccess && (
                                      details.urlSwitchAttempted
                                        ? row("Switching to:", details.switchingToUrl || "—", "#1565c0")
                                        : row("Note:", "No secondary URL — update Vista with same URL", "#e65100")
                                    )}
                                    {isSuccess && row("Status:", "DB sync completed successfully", "#2e7d32")}
                                  </Index.Box>
                                );
                              }

                              // UpdateCinemawebservicesURL
                              return (
                                <Index.Box>
                                  {details.previousUrl
                                    ? row("Previous URL:", details.previousUrl, "#555")
                                    : null}
                                  {isSuccess
                                    ? row("Updated to:", details.updatedToUrl || details.attemptedUrl || "—", "#2e7d32")
                                    : row("Attempted URL:", details.updatedToUrl || details.attemptedUrl || "—", "#c62828")}
                                  {details.urlSwitched === true
                                    ? row("URL swapped:", "Yes — DB switched primary ↔ secondary", "#1565c0")
                                    : row("URL swapped:", "No — only one URL configured", "#888")}
                                  {!isSuccess && details.errorMessage
                                    ? row("Error:", details.errorMessage, "#c62828")
                                    : null}
                                </Index.Box>
                              );
                            };

                            return (
                              <Index.TableRow key={log._id} hover style={{ verticalAlign: "top" }}>
                                <Index.TableCell style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                                  {log.createdAt
                                    ? PagesIndex.moment(log.createdAt).format("DD MMM YYYY, hh:mm:ss A")
                                    : "-"}
                                </Index.TableCell>
                                <Index.TableCell>
                                  <span style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    background: isDatabaseSync ? "#e8eaf6" : "#fce4ec",
                                    color: isDatabaseSync ? "#283593" : "#880e4f",
                                  }}>
                                    {isDatabaseSync ? "DatabaseSync" : "UpdateCinemawebservicesURL"}
                                  </span>
                                </Index.TableCell>
                                <Index.TableCell>
                                  <span style={{
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: details.triggerSource === "manual" ? "#fff3e0" : "#e3f2fd",
                                    color: details.triggerSource === "manual" ? "#e65100" : "#1565c0",
                                  }}>
                                    {details.triggerSource === "manual" ? "Manual" : "Auto"}
                                  </span>
                                </Index.TableCell>
                                <Index.TableCell>
                                  <span style={{
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: isSuccess ? "#e8f5e9" : "#ffebee",
                                    color: isSuccess ? "#2e7d32" : "#c62828",
                                  }}>
                                    {log.status || "-"}
                                  </span>
                                </Index.TableCell>
                                <Index.TableCell style={{ padding: "8px 12px" }}>
                                  {renderWhatHappened()}
                                </Index.TableCell>
                              </Index.TableRow>
                            );
                          })}
                        </Index.TableBody>
                      </Index.Table>
                    </Index.TableContainer>
                    <Index.Box style={{ marginTop: 8 }}>
                      <Index.TablePagination
                        component="div"
                        count={syncLogTotal}
                        page={syncLogPage}
                        onPageChange={(e, newPage) => {
                          handleViewSyncLogs(syncLogCinema, newPage, syncLogRowsPerPage, syncLogStartDate, syncLogEndDate);
                        }}
                        rowsPerPage={syncLogRowsPerPage}
                        onRowsPerPageChange={(e) => {
                          handleViewSyncLogs(syncLogCinema, 0, parseInt(e.target.value, 10), syncLogStartDate, syncLogEndDate);
                        }}
                        rowsPerPageOptions={[10, 20, 50]}
                      />
                    </Index.Box>
                  </>
                )}
              </Index.DialogContent>
            </Index.Dialog>

            {/* delete modal */}
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handleCinemaRemove}
            />

            <React.Fragment key="right">
              <Index.Drawer
                anchor="right"
                open={isOpen}
                onClose={toggleDrawer(false)}
              >
                <Index.Box className="common-main-drawer">
                  <Index.Box
                    role="presentation"
                    className="common-drawer-details"
                  >
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
                                      filterMovie(e.target.value);
                                    }}
                                    renderValue={
                                      selectedMovie
                                        ? undefined
                                        : () => "Select cinema"
                                    }
                                  >
                                    <Index.MenuItem value={""}>
                                      All
                                    </Index.MenuItem>
                                    {cinemaList?.map((data) => (
                                      <Index.MenuItem
                                        key={data?._id}
                                        value={data?._id}
                                        className="menu-movie-max cus-drop"
                                      >
                                        {data?.cinemaName}
                                      </Index.MenuItem>
                                    ))}
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
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default CinemaManagement;
