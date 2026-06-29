import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "../cinemaLicenseManagement/CinemaLicenseManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { update } from "lodash";

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

const GlobalConvenienceFee = () => {
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [cinemaList, setActivityLogList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
 ;

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const handleUpdateOpen = (item) => {
  
    setOpenUpdate(true);
  };

  const handleUpdateClose = () => {
    setOpenUpdate(false);
  };
  // Search on table

  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = cinemaList.filter(
      (data) =>
        data?.adminId?.name?.toLowerCase().includes(searched?.toLowerCase())||
        String(data?.globalConvienceFee || "")
            .toLowerCase()
            .includes(searched)
            
    );
    setFilteredData(filteredData);
  };
  // get cinema list
  const [removeData, setRemoveData] = useState(false);
  const getFeeActivityLog = () => {
    setLoading(true);
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_UPDATE_FEE_LIST
    )
      .then((res) => {
        setActivityLogList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (item) =>
              item?.adminId?.name?.toLowerCase().includes(
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
      }).finally(() => {
        setLoading(false);
      });
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const handleFeeSubmit = (values) => {
    setIsBtnLoading(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("convenienceFee", values?.fee);
    PagesIndex.DataService.post(
      PagesIndex.Api.UPDATE_FEE,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleUpdateClose();
        getFeeActivityLog();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setIsLoading(false);
      }).finally(() => {
        setIsBtnLoading(false);
      });
  };
  useEffect(() => {
    getFeeActivityLog();
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
                 Global Convenience Fee Activity Log
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
                {adminLoginData?.roleId?.permissions?.includes(
                  "cinema_edit"
                ) && (
                  <Index.Box className="common-button blue-button res-blue-button">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={handleUpdateOpen}
                    >
                      Update Fee
                    </Index.Button>
                  </Index.Box>
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
                    <Index.TableCell width="5%">Sr.No</Index.TableCell>
                    <Index.TableCell width="35%">User Name</Index.TableCell>
                    <Index.TableCell width="10%">Fee</Index.TableCell>
                    <Index.TableCell width="15%">
                      Updated Date and Time
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
                          <Index.TableRow key={item?._id}>
                             <Index.TableCell>
            {currentPage * rowsPerPage + index + 1}
          </Index.TableCell>
                            <Index.TableCell>
                              {item?.adminId?.name ? (
                                <Index.Tooltip
                                  title={item.adminId?.name}
                                  placement="top"
                                  arrow
                                >
                                  <Index.Typography
                                    component="p"
                                    variant="p"
                                    className="common-tooltip-details cinema-tooltip"
                                  >
                                    {item?.adminId?.name
                                      ? item?.adminId?.name
                                      : "-"}
                                  </Index.Typography>
                                </Index.Tooltip>
                              ) : (
                                <Index.Typography
                                  component="p"
                                  variant="p"
                                  className="common-tooltip-details cinema-tooltip"
                                >
                                  {item?.adminId?.name
                                    ? item?.adminId?.name
                                    : "-"}
                                </Index.Typography>
                              )}
                            </Index.TableCell>
                            <Index.TableCell>{item?.globalConvienceFee}</Index.TableCell>
                            <Index.TableCell>{PagesIndex.moment(item?.createdAt).format("DD-MM-YYYY h:mm A")}</Index.TableCell>
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
          open={openUpdate}
          onClose={handleUpdateClose}
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
                Update Global Convenience Fee
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleUpdateClose}
              />
            </Index.Box>
            <Index.Box className="modal-body">
              <PagesIndex.Formik
                enableReinitialize
                initialValues={{ fee: "" }}
                validationSchema={PagesIndex.feeSchema}
                onSubmit={handleFeeSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  isSubmitting,
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
                        Fee
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="fee"
                          className="form-control"
                          placeholder="Enter fee amount"
                          value={values?.fee}
                          inputProps={{ maxLength: 10 }}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            ); // allow only digits
                            setFieldValue("fee", newValue);
                          }}
                          error={errors.fee && touched.fee ? true : false}
                          helperText={
                            errors.fee && touched.fee ? errors.fee : null
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
                               disabled={isSubmitting}
                            onClick={handleUpdateClose}
                          >
                            Discard
                          </Index.Button>
                          <Index.Button
                            type="submit"
                               disabled={isSubmitting}
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                          >
                            {/* <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                            ></img> */}
                            Update
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
      </Index.Box>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default GlobalConvenienceFee;
