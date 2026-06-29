import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./RegionManagement.css";
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

const RegionManagement = () => {
  const [loading, setLoading] = useState(true);
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const dispatch = useDispatch();
  const formikRef = useRef();
  const [filteredData, setFilteredData] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [editData, setEditData] = useState("Add");
  const [id, setId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [removeData, setRemoveData] = useState(false);
  const [loadingState, setLoadingState] = useState({});

  let initialValues;

  if (addOrEdit == "Edit") {
    initialValues = {
      regionName: editData?.region,
      image: editData?.image,
    };
  } else {
    initialValues = {
      regionName: "",
      image: "",
    };
  }

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
  };

  const handleClose = () => {
    setId("");
    setImageUrl("");
    setAddOpen(false);
    formikRef.current?.resetForm();
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
  const handleStatus = (event, id) => {
    const data = {
      id: id,
      isActive: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_REGION, data)
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          getRegionList();
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
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = regionList?.filter((data) =>
      data?.region?.toLowerCase().includes(searched?.toLowerCase())
    );
    setFilteredData(filteredData);
    setCurrentPage(0);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const getRegionList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_REGION + "?" + new Date().getTime()
    )
      .then((res) => {
        setRegionList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((region) =>
            region?.region?.toLowerCase().includes(searchValue?.toLowerCase())
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

  const handleRegionSubmit = (values) => {
    setIsSubmit(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }
    urlEncoded.append("region", values?.regionName);
    urlEncoded.append("poster", values?.image);
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_REGION, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getRegionList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };

  const handleRegionRemove = () => {
    setIsSubmit(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_REGION, { id: id })
      .then((res) => {
        if (res?.data?.status == 200) {
          PagesIndex.toast.success(res?.data?.message);
          setRemoveData(true);
          handleDeleteClose();
          getRegionList();
          setCurrentPage(0);
          setIsSubmit(false);
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };
  useEffect(() => {
    getRegionList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("region_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleRegionSubmit}
        initialValues={initialValues}
        validationSchema={
          addOrEdit === "Add"
            ? PagesIndex.regionSchema
            : PagesIndex.regionEditSchema
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
                        Cities
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "region_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add City
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
                        "region_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add City
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
                          <Index.TableCell width="10%">Place</Index.TableCell>
                          <Index.TableCell width="50%">City</Index.TableCell>
                          <Index.TableCell width="5%" align="center">
                            {adminLoginData?.roleId?.permissions?.includes(
                              "region_edit"
                            ) && <Index.Box>Status</Index.Box>}
                          </Index.TableCell>
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "region_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "region_delete"
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
                                  <Index.TableCell width="10%">
                                    <Index.Box className="region_img">
                                      <img
                                        src={
                                          item?.image
                                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.image}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        onClick={handleClose}
                                        alt=""
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell width="50%">
                                    {item?.region ? item?.region : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="center" width="5%">
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "region_edit"
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
                                    "region_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "region_delete"
                                    )) && (
                                    <Index.TableCell width="10%">
                                      <Index.Box className="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "region_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={(e) => {
                                                setId(item?._id);
                                                handleOpen("Edit");
                                                if (item?.image) {
                                                  setImageUrl(
                                                    `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.image}`
                                                  );
                                                }
                                                setEditData(item);
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "region_delete"
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
                    {addOrEdit} City
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
                        City
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="regionName"
                          className="form-control"
                          placeholder="Enter city"
                          value={values?.regionName}
                          inputProps={{ maxLength: 31 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 31) {
                              setFieldValue("regionName", newValue);
                            }
                          }}
                          error={
                            errors.regionName && touched.regionName
                              ? true
                              : false
                          }
                          helperText={
                            errors.regionName && touched.regionName
                              ? errors.regionName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Image (size 50x50 px)
                      </Index.FormHelperText>

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
                            name="image"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files &&
                                  e.currentTarget.files[0]
                                ) {
                                  setFieldValue(
                                    "image",
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
                            error={errors.image && touched.image ? true : false}
                            helperText={
                              errors.image && touched.image
                                ? errors.image
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>

                      <Index.FormHelperText error>
                        {errors.image && touched.image ? errors.image : false}
                      </Index.FormHelperText>
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
                            disabled={isSubmit == true}
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                          >
                            <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                            ></img>

                            {addOrEdit == "Add" ? "Save" : "Update"}
                          </Index.Button>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isSubmit && handleRegionRemove}
              isDisable={isSubmit}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default RegionManagement;
