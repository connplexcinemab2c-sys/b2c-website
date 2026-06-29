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
  useEffect(() => {
    getCinemaList();
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
                {/* {adminLoginData?.roleId?.permissions?.includes(
                  "cinema_add"
                ) && (
                  <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {}}
                    >
                      Add Cinema
                    </Index.Button>
                  </Index.Box>
                )} */}
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
      </Index.Box>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default CinemaLicenseManagement;
