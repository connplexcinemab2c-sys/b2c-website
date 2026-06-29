import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./PartnersManagement.css";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
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

const PartnersManagement = () => {
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [partnerList, setPartnerList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});

  let initialValues = {
    partnerName: "",
    link: "",
  };
  const handleOpen = (mode) => {
    setAddOpen(true);
    setAddOrEdit(mode);
  };

  const handleClose = () => {
    setId("");
    setAddOpen(false);
    formik.current?.resetForm();
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
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    let filteredData = partnerList.filter((data) =>
      data?.partnerName?.toLowerCase().includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };
  const handleStatus = (event, id) => {
    const data = {
      id: id,
      isActive: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_PARTNER, data)
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getPartnerList();
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
  const getPartnerList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_PARTNER + "?" + new Date().getTime()
    )
      .then((res) => {
        setPartnerList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((item) =>
            item?.partnerName
              ?.toLowerCase()
              .includes(searchValue?.toLowerCase())
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

  const handlePartnerSubmit = (values) => {
    setIsLoading(true)
    const data = {
      partnerName: values?.partnerName,
      link: values?.link,
    };
    if (id) {
      data._id = id;
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_PARTNER, data)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getPartnerList();
        setIsLoading(false)
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false)
      });
  };

  const handlePartnerRemove = () => {
    setIsLoading(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_PARTNER, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        getPartnerList();
        setRemoveData(true);
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    getPartnerList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("partners_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handlePartnerSubmit}
        initialValues={initialValues}
        validationSchema={
          addOrEdit === "Add"
            ? PagesIndex.partnerSchema
            : PagesIndex.partnerEditSchema
        }
        innerRef={formik}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <>
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
                        Partner Management
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "partners_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Partner
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
                      {adminLoginData?.roleId?.permissions?.includes(
                        "partners_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Partner
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
                      className="table-design-main one-line-table cus-partner-table"
                    >
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="80%">
                            Partner Name
                          </Index.TableCell>
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "partners_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "partners_delete"
                            )) && (
                            <Index.TableCell width="10%" align="center">
                              Status
                            </Index.TableCell>
                          )}
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "partners_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "partners_delete"
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
                              ?.map((item, index) => {
                                return (
                                  <Index.TableRow key={item?._id}>
                                    <Index.TableCell>
                                      {item?.partnerName
                                        ? item?.partnerName
                                        : "-"}
                                    </Index.TableCell>
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "partners_edit"
                                    ) && (
                                      <Index.TableCell align="center">
                                        <CustomToggleButton
                                          defaultChecked={item?.isActive}
                                          onChange={(e) =>
                                            handleStatus(e, item?._id)
                                          }
                                          disabled={
                                            loadingState[item?._id] || false
                                          }
                                        />
                                      </Index.TableCell>
                                    )}
                                    {(adminLoginData?.roleId?.permissions?.includes(
                                      "partners_edit"
                                    ) ||
                                      adminLoginData?.roleId?.permissions?.includes(
                                        "partners_delete"
                                      )) && (
                                      <Index.TableCell align="right">
                                        <Index.Box className="flex-action-details">
                                          <Index.Box className="icon-width-action">
                                            {adminLoginData?.roleId?.permissions?.includes(
                                              "partners_edit"
                                            ) && (
                                              <Index.IconButton
                                                onClick={(e) => {
                                                  for (let key in item) {
                                                    setFieldValue(
                                                      key,
                                                      item[key]
                                                    );
                                                  }
                                                  setId(item?._id);
                                                  handleOpen("Edit");
                                                }}
                                              >
                                                <Index.EditIcon />
                                              </Index.IconButton>
                                            )}
                                          </Index.Box>
                                          <Index.Box className="icon-width-action">
                                            {adminLoginData?.roleId?.permissions?.includes(
                                              "partners_delete"
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
                                );
                              })
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
                className="modal-inner-main add-region-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} Partner
                  </Index.Typography>
                  <img
                    src={PagesIndex.Svg.cancel}
                    className="modal-close-icon"
                    onClick={handleClose}
                    alt="cancel icon"
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
                        Partner Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="partnerName"
                          className="form-control"
                          placeholder="Enter partner name"
                          value={values?.partnerName}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 50) {
                              setFieldValue("partnerName", newValue);
                            }
                          }}
                          error={errors.partnerName && touched.partnerName}
                          helperText={
                            errors.partnerName && touched.partnerName
                              ? errors.partnerName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Redirect Link
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="link"
                          className="form-control"
                          placeholder="Enter redirect link"
                          value={values?.link}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          error={errors.link && touched.link}
                          helperText={
                            errors.link && touched.link ? errors.link : null
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
                            disabled={isLoading}
                          >
                            <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                              alt="save icon"
                            ></img>

                            {addOrEdit === "Add" ? "Save" : "Update"}
                          </Index.Button>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>

            {/* delete modal */}
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handlePartnerRemove}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default PartnersManagement;
