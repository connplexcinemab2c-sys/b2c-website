import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./CinemaLicenseManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";

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

const CinemaLicenseManagement = () => {
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [cinemaList, setCinemaList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cinemaData, setCinemaData] = useState({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addLicenseOpen, setAddLicenseOpen] = useState(false);
  const [isNewCinema, setIsNewCinema] = useState(false);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [customCinemaName, setCustomCinemaName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [allCinemas, setAllCinemas] = useState([]);

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const handleDeleteOpen = (item) => {
    setCinemaData({
      cinemaId: item?.Cinema_strID,
      licenseNo: item?.License_strCode,
    });
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };
  // Search on table
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = cinemaList.filter(
      (data) =>
        data?.Cinema_strName?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.License_strCode?.toLowerCase().includes(searched?.toLowerCase())
    );
    setFilteredData(filteredData);
  };
  // get cinema list
  const [removeData, setRemoveData] = useState(false);
  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA_LICENSE + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (title) =>
              title?.Cinema_strName?.toLowerCase().includes(
                searchValue?.toLowerCase()
              ) ||
              title?.License_strCode?.toLowerCase().includes(
                searchValue?.toLowerCase()
              )
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
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
    setIsLoading(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("cinemaId", cinemaData?.cinemaId);
    urlEncoded.append("licenceCode", cinemaData?.licenseNo);
    PagesIndex.DataService.post(
      PagesIndex.Api.UPDATE_CINEMA_LICENSE,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleDeleteClose();
        getCinemaList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setIsLoading(false);
      });
  };

  const getAllCinemas = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setAllCinemas(res?.data?.data || []);
      })
      .catch((err) => {
        console.error("Error fetching all cinemas:", err);
      });
  };

  const handleAddLicenseOpen = () => {
    setIsNewCinema(false);
    setSelectedCinemaId("");
    setCustomCinemaName("");
    setLicenseNo("");
    setAddLicenseOpen(true);
  };

  const handleAddLicenseClose = () => {
    setAddLicenseOpen(false);
  };

  const handleAddLicenseSubmit = () => {
    if (isNewCinema) {
      if (!customCinemaName.trim() || !licenseNo.trim()) {
        PagesIndex.toast.error("Please fill all required fields");
        return;
      }
    } else {
      if (!selectedCinemaId || !licenseNo.trim()) {
        PagesIndex.toast.error("Please fill all required fields");
        return;
      }
    }

    setIsLoading(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("isNewCinema", isNewCinema);
    urlEncoded.append("cinemaId", selectedCinemaId);
    urlEncoded.append("cinemaName", customCinemaName);
    urlEncoded.append("licenceCode", licenseNo);

    PagesIndex.DataService.post(
      PagesIndex.Api.ADD_CINEMA_LICENSE,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(
          res.data.message || "Cinema license added successfully"
        );
        handleAddLicenseClose();
        getCinemaList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(
          err?.response?.data?.message || "Something went wrong"
        );
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getCinemaList();
    getAllCinemas();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("cinema_view")
  ) {
    return (
      <Index.Box className="">
        <Index.Box className="barge-common-box">
          <Index.Box className="title-header">
            <Index.Box className="title-header-flex res-title-header-flex">
              <Index.Box className="title-main common-export-flex">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  Cinema License
                </Index.Typography>
                {(adminLoginData?.roleId?.permissions?.includes("cinema_add") ||
                  adminLoginData?.type === "Admin") && (
                  <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => handleAddLicenseOpen()}
                    >
                      Add Cinema License
                    </Index.Button>
                  </Index.Box>
                )}
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
                    <Index.TableCell width="80%">Cinema</Index.TableCell>
                    <Index.TableCell width="10%">License no.</Index.TableCell>
                    <Index.TableCell align="right" width="10%">
                      {(adminLoginData?.roleId?.permissions?.includes(
                        "cinema_edit"
                      ) ||
                        adminLoginData?.roleId?.permissions?.includes(
                          "cinema_delete"
                        )) && <Index.Box>Action</Index.Box>}
                    </Index.TableCell>
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
                              {item?.Cinema_strName ? (
                                <Index.Tooltip
                                  title={item.Cinema_strName}
                                  placement="top"
                                  arrow
                                >
                                  <Index.Typography
                                    component="p"
                                    variant="p"
                                    className="common-tooltip-details cinema-tooltip"
                                  >
                                    {item?.Cinema_strName
                                      ? item?.Cinema_strName
                                      : "-"}
                                  </Index.Typography>
                                </Index.Tooltip>
                              ) : (
                                <Index.Typography
                                  component="p"
                                  variant="p"
                                  className="common-tooltip-details cinema-tooltip"
                                >
                                  {item?.Cinema_strName
                                    ? item?.Cinema_strName
                                    : "-"}
                                </Index.Typography>
                              )}
                            </Index.TableCell>
                            <Index.TableCell>
                              <Index.TextField
                                className="table-cus-input"
                                value={item.License_strCode}
                                inputProps={{ maxLength: 10 }}
                                onChange={(e) => {
                                  setFilteredData((prev) => {
                                    let data = [...prev];
                                    let index = data.findIndex(
                                      (x) =>
                                        x.Cinema_strName === item.Cinema_strName
                                    );
                                    data[index].License_strCode =
                                      e.target.value;

                                    return data;
                                  });
                                }}
                              />
                            </Index.TableCell>
                            <Index.TableCell align="right">
                              {adminLoginData?.roleId?.permissions?.includes(
                                "cinema_edit"
                              ) && (
                                <Index.Box>
                                  {adminLoginData?.roleId?.permissions?.includes(
                                    "cinema_edit"
                                  ) && (
                                    <Index.IconButton
                                      onClick={(e) => {
                                        handleDeleteOpen(item);
                                      }}
                                    >
                                      <Index.EditIcon />
                                    </Index.IconButton>
                                  )}
                                </Index.Box>
                              )}
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
        {/* delete model */}
        <Index.Modal
          open={deleteOpen}
          onClose={handleDeleteClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal-delete modal"
        >
          <Index.Box sx={style} className="delete-modal-inner-main modal-inner">
            {/* <Index.Box className="modal-circle-main">
              <img
                src={PagesIndex.Svg.close}
                className="user-circle-img"
                alt="icon"
              />
            </Index.Box> */}
            <Index.Typography
              className="delete-modal-title"
              component="h2"
              variant="h2"
            >
              Are you sure?
            </Index.Typography>
            <Index.Typography
              className="delete-modal-para common-para"
              component="p"
              variant="p"
            >
              Do you really want to update these cinema license code?
            </Index.Typography>
            <Index.Box className="delete-modal-btn-flex">
              <Index.Button
                className="modal-cancel-btn modal-btn"
                onClick={handleDeleteClose}
              >
                Cancel
              </Index.Button>
              <Index.Button
                className="modal-delete-btn modal-btn"
                onClick={() => {
                  if (!isLoading) {
                    handleCinemaSubmit();
                  }
                }}
              >
                Update
              </Index.Button>
            </Index.Box>
          </Index.Box>
        </Index.Modal>
        {/* add license model */}
        <Index.Modal
          open={addLicenseOpen}
          onClose={handleAddLicenseClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal-delete modal"
        >
          <Index.Box sx={{ ...style, width: 450 }} className="delete-modal-inner-main modal-inner">
            <Index.Box className="modal-header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Index.Typography
                id="modal-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold", color: "#191510" }}
              >
                Add Cinema License
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleAddLicenseClose}
                style={{ cursor: "pointer", width: "20px", height: "20px" }}
              />
            </Index.Box>
            
            <Index.Box className="modal-body" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Index.FormControlLabel
                control={
                  <Index.Checkbox
                    checked={isNewCinema}
                    onChange={(e) => {
                      setIsNewCinema(e.target.checked);
                      setSelectedCinemaId("");
                      setCustomCinemaName("");
                    }}
                    color="primary"
                  />
                }
                label="Is this a new / custom cinema?"
              />

              {!isNewCinema ? (
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Select Cinema
                  </Index.FormHelperText>
                  <Index.FormControl fullWidth className="form-group">
                    <Index.Select
                      value={selectedCinemaId}
                      onChange={(e) => setSelectedCinemaId(e.target.value)}
                      displayEmpty
                      variant="outlined"
                    >
                      <Index.MenuItem value="">
                        <em>Select Cinema</em>
                      </Index.MenuItem>
                      {allCinemas.map((cinema) => (
                        <Index.MenuItem key={cinema.cinemaId || cinema._id} value={cinema.cinemaId || cinema._id}>
                          {cinema.displayName || cinema.cinemaName}
                        </Index.MenuItem>
                      ))}
                    </Index.Select>
                  </Index.FormControl>
                </Index.Box>
              ) : (
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Cinema Name
                  </Index.FormHelperText>
                  <Index.Box className="form-group">
                    <Index.TextField
                      fullWidth
                      className="form-control"
                      placeholder="Enter cinema name"
                      value={customCinemaName}
                      onChange={(e) => setCustomCinemaName(e.target.value)}
                    />
                  </Index.Box>
                </Index.Box>
              )}

              <Index.Box className="input-box modal-input-box">
                <Index.FormHelperText className="form-lable">
                  License Number
                </Index.FormHelperText>
                <Index.Box className="form-group">
                  <Index.TextField
                    fullWidth
                    className="form-control"
                    placeholder="Enter license number"
                    value={licenseNo}
                    inputProps={{ maxLength: 10 }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, ""); // only digits
                      setLicenseNo(value);
                    }}
                  />
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="modal-user-btn-flex" sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Index.Box className="discard-btn-main btn-main-primary">
                <Index.Box className="common-button blue-button res-blue-button" sx={{ gap: 2 }}>
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={handleAddLicenseClose}
                  >
                    Discard
                  </Index.Button>
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={handleAddLicenseSubmit}
                    disabled={isLoading}
                  >
                    Add
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Modal>
      </Index.Box>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default CinemaLicenseManagement;
