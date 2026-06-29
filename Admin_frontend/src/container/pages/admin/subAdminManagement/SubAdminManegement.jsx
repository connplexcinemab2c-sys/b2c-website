import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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

const SubAdminManegement = () => {
  const formikRef = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const dispatch = useDispatch();
  const navigate =  useNavigate();
  const [loading, setLoading] = useState(true);
  const [subAdminList, setSubAdminList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [cinemaList, setCinemaList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [subAdminDetails, setSubAdminDetails] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);

  let initialValues = {
    name: id ? subAdminDetails.name : "",
    email: id ? subAdminDetails.email : "",
    mobileNumber: id ? subAdminDetails.mobileNumber : "",
    password: "",
    confirmPassword: "",
    roleId: id ? subAdminDetails.roleId : "",
    cinemaId: id ? subAdminDetails.cinemaId : "",
  };

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
    formikRef.current?.resetForm();
  };

  const handleClose = () => {
    setAddOpen(false);
    setId("");
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };
  const getSubAdminList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_SUBADMIN + "?" + new Date().getTime()
    )
      .then((res) => {
        setSubAdminList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (item) =>
              item?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
              item?.email?.toLowerCase().includes(searchValue?.toLowerCase())
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
  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res.data.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const getRolePermissionList = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_ROLEPERMISSION)
      .then((res) => {
        setRoleList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const handleSubAdminSubmit = (values) => {
    setIsSubmit(true);
    const urlEncoded = new URLSearchParams();
    if (id) {
      urlEncoded.append("id", id);
    }
    urlEncoded.append("name", values?.name);
    urlEncoded.append("email", values?.email);
    urlEncoded.append("mobileNumber", values?.mobileNumber);
    urlEncoded.append("password", values?.password);
    urlEncoded.append("roleId", values?.roleId);
    // urlEncoded.append("cinemaId", values.cinemaId);

    if (values.roleId === "6566d38b416a6b80a037fcf8") {
      urlEncoded.append("cinemaId", values.cinemaId);
    }

    // urlEncoded.append("permissions", permissions);
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_SUBADMIN, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleClose();
        getSubAdminList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setIsSubmit(false);
      });
  };

  const handleSubAdminRemove = () => {
    setIsSubmit(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_SUBADMIN, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getSubAdminList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = subAdminList?.filter(
      (data) =>
        data?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.email?.toLowerCase().includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
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
  useEffect(() => {
    getRolePermissionList();
    getCinemaList();
    getSubAdminList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("sub_admin_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleSubAdminSubmit}
        initialValues={initialValues}
        validationSchema={
          addOrEdit === "Add"
            ? PagesIndex.subAdminAddScema
            : PagesIndex.subAdminEditScema
        }
        innerRef={formikRef}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
          handleBlur,
          handleSubmit,
          setFieldTouched,
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
                        Sub Admin Management
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "sub_admin_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add User
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
                        "sub_admin_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add User
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
                          <Index.TableCell>User Name</Index.TableCell>
                          <Index.TableCell>Created Date</Index.TableCell>
                          <Index.TableCell align="center">
                            Email
                          </Index.TableCell>
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "sub_admin_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "sub_admin_delete"
                            )) && (
                            <Index.TableCell align="center">
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
                                  key={item?._id}
                                >
                                  <Index.TableCell>
                                    {item?.name ? item?.name : "-"}
                                  </Index.TableCell>
                                      <Index.TableCell>
                                    {item?.createdAt ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY") : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="center">
                                    {item?.email ? item?.email : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="center">
                                    <Index.IconButton
                                      onClick={() =>
                                        navigate('/admin/login-activity', { state: { adminId: item?._id, adminName: item?.name } })
                                      }
                                    >
                                      <Index.Visibility />
                                    </Index.IconButton>
                                    
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "sub_admin_edit"
                                    ) && (
                                        <Index.IconButton
                                          onClick={(e) => {
                                            setId(item?._id);
                                            setSubAdminDetails(item);
                                            handleOpen("Edit");

                                            // for (let key in item) {
                                            //   setFieldValue(key, item[key]);
                                            // }
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      )}
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "sub_admin_delete"
                                    ) && (
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
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
                className="modal-inner-main add-subAdmin-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} Sub Admin
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
                        Sub Admin Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          className="form-control"
                          name="name"
                          placeholder="Enter sub admin name"
                          value={values?.name}
                          inputProps={{ maxLength: 50 }}
                          // onChange={(e) => {
                          //   const newValue = e.target.value
                          //     .replace(/^\s+/, "")
                          //     .replace(/\s\s+/g, " ");
                          //   if (newValue.length <= 30)
                          //     setFieldValue("name", newValue);
                          // }}
                          onInput={(event) => {
                            const input = event.target;
                            let inputValue = input.value;

                            // Trim leading spaces
                            inputValue = inputValue.trimLeft();

                            // Replace multiple spaces with a single space
                            inputValue = inputValue.replace(/\s{2,}/g, " ");

                            // Trim the input to 200 characters
                            if (inputValue.length > 30) {
                              inputValue = inputValue.slice(0, 30);
                            }

                            // Update the input value
                            input.value = inputValue;
                          }}
                          onChange={handleChange}
                          error={errors.name && touched.name ? true : false}
                          helperText={
                            errors.name && touched.name ? errors.name : null
                          }
                        />
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
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          inputProps={{ maxLength: 320 }}
                          value={values?.email}
                          // onChange={(e) => {
                          //   handleChange(e);
                          // }}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\s/g, "");
                            setFieldValue("email", newValue);
                          }}
                          error={errors.email && touched.email ? true : false}
                          helperText={
                            errors.email && touched.email ? errors.email : null
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
                          name="mobileNumber"
                          className="form-control"
                          placeholder="Enter phone number"
                          value={values?.mobileNumber}
                          inputProps={{ maxLength: 10 }}
                          // onChange={(e) => {
                          //   handleChange(e);
                          // }}
                          onChange={(e) => {
                            const newValue = e.target.value.replace(/\D+/g, "");
                            if (newValue.length <= 10) {
                              setFieldValue("mobileNumber", newValue);
                            }
                          }}
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
                    {addOrEdit !== "Edit" && (
                      <>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable">
                            Password
                          </Index.FormHelperText>
                          <Index.Box className="form-group">
                            <Index.TextField
                              fullWidth
                              id="fullWidth"
                              name="password"
                              className="form-control"
                              placeholder="Enter password"
                              value={values?.password}
                              inputProps={{ maxLength: 50 }}
                              onChange={(e) => {
                                const newValue = e.target.value.replace(
                                  /\s/g,
                                  ""
                                );
                                setFieldValue("password", newValue);
                              }}
                              error={
                                errors.password && touched.password
                                  ? true
                                  : false
                              }
                              helperText={
                                errors.password && touched.password
                                  ? errors.password
                                  : null
                              }
                            />
                          </Index.Box>
                        </Index.Box>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable">
                            Confirm Password
                          </Index.FormHelperText>
                          <Index.Box className="form-group">
                            <Index.TextField
                              fullWidth
                              id="fullWidth"
                              className="form-control"
                              name="confirmPassword"
                              placeholder="Enter confirm password"
                              value={values?.confirmPassword}
                              inputProps={{ maxLength: 50 }}
                              onChange={(e) => {
                                const newValue = e.target.value.replace(
                                  /\s/g,
                                  ""
                                );
                                setFieldValue("confirmPassword", newValue);
                              }}
                              error={
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? true
                                  : false
                              }
                              helperText={
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? errors.confirmPassword
                                  : null
                              }
                            />
                          </Index.Box>
                        </Index.Box>
                      </>
                    )}
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Role
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="roleId"
                          className="form-control"
                          displayEmpty
                          renderValue={
                            values?.roleId ? undefined : () => "Select role"
                          }
                          value={values?.roleId}
                          onChange={handleChange}
                          error={errors.roleId && touched.roleId ? true : false}
                        >
                          {roleList?.map((data) => {
                            return (
                              <Index.MenuItem value={data?._id}>
                                {data?.role}
                              </Index.MenuItem>
                            );
                          })}
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.roleId && touched.roleId
                            ? errors.roleId
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    {values?.roleId === "6566d38b416a6b80a037fcf8" && (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Cinema
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Select
                            fullWidth
                            id="fullWidth"
                            name="cinemaId"
                            className="form-control"
                            displayEmpty
                            renderValue={
                              values?.cinemaId
                                ? undefined
                                : () => "Select Cinema"
                            }
                            value={values?.cinemaId}
                            onChange={handleChange}
                            error={
                              errors.cinemaId && touched.cinemaId ? true : false
                            }
                          >
                            {cinemaList?.map((data) => {
                              return (
                                <Index.MenuItem value={data?._id}>
                                  {data?.displayName}
                                </Index.MenuItem>
                              );
                            })}
                          </Index.Select>
                          <Index.FormHelperText error>
                            {errors.cinemaId && touched.cinemaId
                              ? errors.cinemaId
                              : null}
                          </Index.FormHelperText>
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
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            type="submit"
                            disabled={isSubmit === true}
                            // onClick={handleClose}
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
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={handleSubAdminRemove}
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

export default SubAdminManegement;
