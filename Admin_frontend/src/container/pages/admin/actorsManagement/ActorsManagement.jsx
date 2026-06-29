import { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./ActorsManagement.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";

const Search = Index.styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: Index.alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: Index.alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto"
  }
}));
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24
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
      width: "20ch"
    }
  }
}));
const ActorsManagement = () => {
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [actorList, setActorList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [imageUrl, setImageUrl] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  let initialValues = {
    profile: "",
    name: "",
    about: "",
    category: [],
    type: "Actor"
  };

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setOpenAdd(true);
    formik.current?.resetForm();
  };
  const handleClose = (e) => {
    setId("");
    setImageUrl("");
    setOpenAdd(false);
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  // Search on table
  const requestSearch = (searched) => {
    let filteredData = actorList.filter(
      (data) =>
        data?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.category?.some((item) =>
          item?.toLowerCase()?.includes(searched?.toLowerCase())
        )
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const getActorsList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_ACTORS + "?" + new Date().getTime()
    )
      .then((res) => {
        setActorList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((title) =>
            title?.name?.toLowerCase().includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
        }
        // setRemoveData(false)
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
  const handleSubmit = (values) => {
    setIsSubmit(true);
    const formData = new FormData();
    if (id) {
      formData.append("id", id);
    }
    formData.append("profile", values?.profile);
    formData.append("name", values?.name);
    formData.append("about", values?.about);
    formData.append("category", JSON.stringify(values?.category));
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_ACTORS, formData)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getActorsList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };
  const handleRemove = () => {
    setIsSubmit(true);
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("id", id);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_ACTORS, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getActorsList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  useEffect(() => {
    getActorsList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("actor_view")
  ) {
    return (
      <>
        <PagesIndex.Formik
          enableReinitialize
          onSubmit={handleSubmit}
          initialValues={initialValues}
          validationSchema={
            addOrEdit === "Add"
              ? PagesIndex.actorManagementSchema
              : PagesIndex.actorManagementEditSchema
          }
          innerRef={formik}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            setFieldValue
          }) => (
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
                        Actor Management
                      </Index.Typography>

                      {adminLoginData?.roleId?.permissions?.includes(
                        "actor_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Actor
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
                        "actor_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Actor
                          </Index.Button>
                        </Index.Box>
                      )}
                    </Index.Box>
                  </Index.Box>
                </Index.Box>

                <Index.Box className="page-table-main actor-table-main">
                  <Index.TableContainer
                    component={Index.Paper}
                    className="table-container"
                  >
                    <Index.Table
                      aria-label="simple table"
                      className="table-design-main"
                    >
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="10%">Image</Index.TableCell>
                          <Index.TableCell width="15%">Actor</Index.TableCell>
                          <Index.TableCell width="25%">
                            Category
                          </Index.TableCell>
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "actor_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "actor_delete"
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
                                  <Index.TableCell width="15%">
                                    <Index.Box className="class_img actor_img">
                                      <img
                                        src={
                                          item?.profile
                                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.profile}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        onClick={handleClose}
                                        alt=""
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell width="25%">
                                    {item?.name ? item?.name : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell width="25%">
                                    {item?.category
                                      ? item?.category?.join(", ")
                                      : "-"}
                                  </Index.TableCell>

                                  {(adminLoginData?.roleId?.permissions?.includes(
                                    "actor_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "actor_delete"
                                    )) && (
                                    <Index.TableCell width="10%" align="right">
                                      <Index.Box className="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "actor_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={() => {
                                                setId(item?._id);
                                                handleOpen("Edit");
                                                for (let key in item) {
                                                  if (key !== "profile")
                                                    setFieldValue(
                                                      key,
                                                      item[key]
                                                    );
                                                }
                                                if (item?.profile) {
                                                  setImageUrl(
                                                    `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.profile}`
                                                  );
                                                }
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "actor_delete"
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
              <Index.Modal
                open={openAdd}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="modal"
              >
                <Index.Box
                  sx={style}
                  className="modal-inner-main add-role-modal modal-inner"
                >
                  <Index.Box className="modal-header">
                    <Index.Typography
                      id="modal-modal-title"
                      className="modal-title"
                      variant="h6"
                      component="h2"
                    >
                      {addOrEdit} Actor
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
                          Profile (size 98x98 px)
                        </Index.FormHelperText>
                        {/* {imageUrl && (
                        <img src={imageUrl} className="profile-img" />
                      )}
                      <Index.Box className="form-group region_img_upload">
                        <Index.Box className="common-button grey-button change-profile">
                          <input
                            name="profile"
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={(event) => {
                              setFieldValue(
                                "profile",
                                event.currentTarget.files[0]
                              );
                              setImageUrl(
                                URL.createObjectURL(event.currentTarget.files[0])
                              );
                            }}
                          />
                          <Index.FormHelperText error>
                            {errors.profile && touched.profile
                              ? errors.profile
                              : null}
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
                              name="profile"
                              type="file"
                              onChange={(e) => {
                                try {
                                  if (
                                    e.currentTarget.files &&
                                    e.currentTarget.files[0]
                                  ) {
                                    setFieldValue(
                                      "profile",
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
                              error={
                                errors.image && touched.image ? true : false
                              }
                              helperText={
                                errors.image && touched.image
                                  ? errors.image
                                  : false
                              }
                            />
                          </Index.Button>
                          <Index.FormHelperText error>
                            {errors.profile && touched.profile
                              ? errors.profile
                              : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Actor's Name
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            name="name"
                            placeholder="Enter actor's name"
                            value={values?.name}
                            inputProps={{ maxLength: 51 }}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 51) {
                                setFieldValue("name", newValue);
                              }
                            }}
                            error={errors.name && touched.name ? true : false}
                            helperText={
                              errors.name && touched.name ? errors.name : null
                            }
                          />
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          About
                        </Index.FormHelperText>
                        <Index.Box className="form-group d-flex-textarea">
                          <Index.TextareaAutosize
                            fullWidth
                            id="fullWidth"
                            className="form-control form-text-area"
                            minRows={3}
                            name="about"
                            placeholder="Enter description about actor"
                            value={values?.about}
                            maxLength={501}
                            onChange={(e) => {
                              const newValue = e.target.value
                                .replace(/^\s+/, "")
                                .replace(/\s\s+/g, " ");
                              if (newValue.length <= 501) {
                                setFieldValue("about", newValue);
                              }
                            }}
                            error={errors.about && touched.about ? true : false}
                          />
                        </Index.Box>
                        <Index.FormHelperText error>
                          {errors.about && touched.about ? errors.about : null}
                        </Index.FormHelperText>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Category
                        </Index.FormHelperText>
                        <Index.Box className="form-group add-coupon-details ">
                          <Index.Autocomplete
                            className="cinema-auto-input"
                            multiple
                            options={["Cast", "Crew"]}
                            getOptionLabel={(option) => option}
                            defaultValue={() => {
                              let idArray = [];
                              values?.category?.map((data1, index) => {
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
                                  errors.category && touched.category
                                    ? true
                                    : false
                                }
                                helperText={
                                  errors.category && touched.category
                                    ? errors.category
                                    : null
                                }
                                placeholder="Select category"
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
                              setFieldValue("category", idArray);
                            }}
                          />
                        </Index.Box>
                        {/* <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="category"
                          className="form-control"
                          displayEmpty
                          renderValue={
                            values?.category
                              ? undefined
                              : () => "Select category"
                          }
                          value={values?.category}
                          onChange={handleChange}
                          error={
                            errors.category && touched.category ? true : false
                          }
                        >
                          <Index.MenuItem value={"Cast"}>Cast</Index.MenuItem>
                          <Index.MenuItem value={"Crew"}>Crew</Index.MenuItem>
                          <Index.MenuItem value={"Other"}>Other</Index.MenuItem>
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.category && touched.category
                            ? errors.category
                            : null}
                        </Index.FormHelperText>
                      </Index.Box> */}
                      </Index.Box>
                      {/* {values?.category && values?.category !== "Cast" && (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Type
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Select
                            fullWidth
                            id="fullWidth"
                            name="type"
                            className="form-control"
                            displayEmpty
                            renderValue={
                              values?.type
                                ? undefined
                                : () => "Select cast type"
                            }
                            value={values?.type}
                            onChange={handleChange}
                            error={errors.type && touched.type ? true : false}
                          >
                            <Index.MenuItem value={"Director"}>
                              Director
                            </Index.MenuItem>
                            <Index.MenuItem value={"Producer"}>
                              Producer
                            </Index.MenuItem>
                            <Index.MenuItem value={"Co-Producer"}>
                              Co-Producer
                            </Index.MenuItem>
                          </Index.Select>
                          <Index.FormHelperText error>
                            {errors.type && touched.type ? errors.type : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    )} */}
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
                  </Index.Box>
                </Index.Box>
              </Index.Modal>
              <PagesIndex.DeleteModal
                deleteOpen={deleteOpen}
                handleDeleteClose={handleDeleteClose}
                handleDeleteRecord={!isSubmit && handleRemove}
                isDisable={isSubmit}
              />
            </Index.Box>
          )}
        </PagesIndex.Formik>
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};
export default ActorsManagement;
