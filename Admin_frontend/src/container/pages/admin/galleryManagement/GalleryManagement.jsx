import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./GalleryManagement.css";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import {
  gallaryBackgroundEditSchema,
  gallaryBackgroundSchema
} from "../../../../validation/FormikValidation";

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

const GalleryManagement = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const dispatch = useDispatch();
  const formikRef = useRef();
  const navigate = PagesIndex.useNavigate();
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [classList, setClassList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [editData, setEditData] = useState({});
  const [id, setId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [isOpenGallaryBackground, setIsOpenGallaryBackground] = useState(false);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [removeData, setRemoveData] = useState(false);
  const [isExistGallaryBg, setIsExistGallaryBg] = useState(false);
  // for change status
  const [loadingState, setLoadingState] = useState({});

  let initialValues;

  if (addOrEdit == "Edit") {
    initialValues = {
      title: editData?.title,
      description: editData?.description,
      image: ""
    };
  } else {
    initialValues = {
      title: "",
      description: "",
      image: ""
    };
  }

  if (isOpenGallaryBackground) {
    delete initialValues.description;
  }

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
  };

  const handleClose = () => {
    setId("");
    setImageUrl("");
    setAddOpen(false);
    setIsOpenGallaryBackground(false);
    formikRef.current.resetForm();
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
      status: event.target.checked
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(
      PagesIndex.Api.UPDATE_CINEMA_GALLERY_STATUS,
      data
    )
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        getGalleryList();
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
  };
  // Search on table
  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = classList?.filter(
      (data) =>
        data?.title?.toLowerCase().includes(searched?.toLowerCase()) ||
        (data &&
          data?.createdAt &&
          PagesIndex.moment(data?.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched?.toLowerCase()))
    );
    setFilteredData(filteredData);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const getGalleryList = () => {
    PagesIndex.DataService.post(
      PagesIndex.Api.GET_CINEMA_GALLERY + "?" + new Date().getTime()
    )
      .then((res) => {
        setClassList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((title) =>
            title?.title?.toLowerCase().includes(searchValue?.toLowerCase())
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
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };
  const handleClassSubmit = (values) => {
    setIsSubmit(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }
    urlEncoded.append("title", values?.title);
    if (!isOpenGallaryBackground) {
      urlEncoded.append("description", values?.description);
    }
    urlEncoded.append("poster", values?.image);
    PagesIndex.DataService.post(
      !isOpenGallaryBackground
        ? PagesIndex.Api.ADD_EDIT_CINEMA_GALLERY
        : PagesIndex.Api.ADD_EDIT_GALLARY_BACKGROUND,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getGalleryList();
        setIsSubmit(false);
        setTitleError("");
      })
      .catch((err) => {
        if (err?.response?.data?.message == "This category already exist") {
          setTitleError("Title already exist");
        } else {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
        setIsSubmit(false);
        handleClose();
      });
  };

  const handleClassRemove = () => {
    setIsSubmit(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_CLASS, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getGalleryList();
        setIsSubmit(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsSubmit(false);
      });
  };

  // Check if background post is available than Add Background button is not show
  useEffect(() => {
    if (filteredData.length) {
      let filter = filteredData.filter(
        (item) => item.type == "gallary_background"
      );
      if (filter.length > 0) {
        setIsExistGallaryBg(true);
      } else {
        setIsExistGallaryBg(false);
      }
    }

    if (
      filteredData?.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ).length == 0 &&
      currentPage !== 0
    ) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [filteredData]);

  useEffect(() => {
    getGalleryList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("gallery_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleClassSubmit}
        initialValues={initialValues}
        innerRef={formikRef}
        validationSchema={
          isOpenGallaryBackground
            ? addOrEdit === "Add"
              ? gallaryBackgroundSchema
              : gallaryBackgroundEditSchema
            : !isOpenGallaryBackground && addOrEdit === "Add"
            ? PagesIndex.gallerySchema
            : PagesIndex.galleryEditSchema
        }
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue
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
                        Gallery Management
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "gallery_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button mobile-blog-grp-btn common-mobile-show-export">
                          {!isExistGallaryBg && (
                            <Index.Button
                              variant="contained"
                              disableRipple
                              className="no-text-decoration"
                              onClick={() => {
                                handleOpen("Add");
                                setIsOpenGallaryBackground(true);
                              }}
                            >
                              Add Background
                            </Index.Button>
                          )}
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Gallery
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
                        "gallery_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button blog-grp-btn desktop-export-details">
                          {!isExistGallaryBg && (
                            <Index.Button
                              variant="contained"
                              disableRipple
                              className="no-text-decoration"
                              onClick={() => {
                                handleOpen("Add");
                                setIsOpenGallaryBackground(true);
                              }}
                            >
                              Add Background
                            </Index.Button>
                          )}
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Gallery
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
                      className="table-design-main one-line-table class-manage-table"
                    >
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell width="8%">Image</Index.TableCell>
                          <Index.TableCell width="15%">Title</Index.TableCell>
                          <Index.TableCell width="10%">Date</Index.TableCell>
                          <Index.TableCell width="5%" align="right">
                            {adminLoginData?.roleId?.permissions?.includes(
                              "gallery_edit"
                            ) && <Index.Box>Status</Index.Box>}
                          </Index.TableCell>
                          <Index.TableCell width="10%" align="right">
                            Action
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
                                <Index.TableRow
                                  // className="inquiry-list"
                                  key={item?._id}
                                >
                                  <Index.TableCell>
                                    <Index.Box className="rectangle-img-box">
                                      <img
                                        src={
                                          item?.poster
                                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        onClick={handleClose}
                                        alt=""
                                        className="rectangle-img"
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.title ? item?.title : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.createdAt
                                      ? PagesIndex.moment(
                                          item?.createdAt
                                        ).format("DD/MM/YYYY hh:mm A")
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="right">
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "gallery_edit"
                                    ) && (
                                      <Index.Box className="status-main">
                                        <CustomToggleButton
                                          defaultChecked={item?.status}
                                          onChange={(e) =>
                                            handleStatus(e, item?._id)
                                          }
                                          disabled={
                                            loadingState[item?._id] || false
                                          }
                                        />
                                      </Index.Box>
                                    )}
                                  </Index.TableCell>
                                  {
                                    <Index.TableCell align="right">
                                      <Index.IconButton
                                        onClick={(e) => {
                                          navigate({
                                            pathname: `/admin/gallery/${item?._id}`
                                          });
                                        }}
                                      >
                                        <Index.Visibility />
                                      </Index.IconButton>
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "gallery_edit"
                                      ) && (
                                        <Index.IconButton
                                          onClick={(e) => {
                                            handleOpen("Edit");
                                            setId(item?._id);
                                            if (item.type) {
                                              setIsOpenGallaryBackground(true);
                                            }
                                            if (item?.poster) {
                                              setImageUrl(
                                                `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.poster}`
                                              );
                                            }
                                            setEditData(item);
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      )}
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "gallery_delete"
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
                                  }
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
                className="modal-inner-main add-class-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} Gallery{" "}
                    {isOpenGallaryBackground ? "Background" : "Category"}
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
                        Title
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="title"
                          className="form-control"
                          placeholder="Enter title"
                          value={values?.title}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 50) {
                              setFieldValue("title", newValue);
                            }
                            if (e.target.value.length <= 0) {
                              setTitleError("");
                            } else {
                              setTitleError("");
                            }
                          }}
                          error={errors.title && touched.title ? true : false}
                          helperText={
                            errors.title && touched.title ? errors.title : null
                          }
                        />
                        <Index.FormHelperText sx={{ color: "red" }}>
                          {errors?.title === undefined && titleError
                            ? titleError
                            : ""}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    {!isOpenGallaryBackground && (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Description
                        </Index.FormHelperText>
                        <Index.Box className="form-group d-flex-textarea">
                          <Index.TextareaAutosize
                            fullWidth
                            id="fullWidth"
                            className="form-control form-text-area"
                            minRows={3}
                            name="description"
                            placeholder="Enter description"
                            value={values?.description}
                            maxLength={200}
                            // onChange={(e) => {
                            //   const newValue = e.target.value
                            //     .replace(/^\s+/, "")
                            //     .replace(/\s\s+/g, " ");
                            //   if (newValue.length <= 200) {
                            //     setFieldValue("description", newValue);
                            //   }
                            // }}
                            onInput={(event) => {
                              const input = event.target;
                              let inputValue = input.value;

                              // Trim leading spaces
                              inputValue = inputValue.trimLeft();

                              // Replace multiple spaces with a single space
                              inputValue = inputValue.replace(/\s{2,}/g, " ");

                              // Trim the input to 200 characters
                              if (inputValue.length > 200) {
                                inputValue = inputValue.slice(0, 200);
                              }

                              // Update the input value
                              input.value = inputValue;
                            }}
                            onChange={handleChange}
                            error={
                              errors.description && touched.description
                                ? true
                                : false
                            }
                          />
                        </Index.Box>
                        <Index.FormHelperText error>
                          {errors.description && touched.description
                            ? errors.description
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    )}

                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Image (Size 630x280 px) (Max 2 mb)
                      </Index.FormHelperText>
                      {/* {imageUrl && <img src={imageUrl} className="class-image" />}
                    <Index.Box
                      className={`form-group class_img_upload ${
                        errors.image && touched.image ? "error" : ""
                      }`}
                    >
                      <Index.Box className="common-button grey-button change-profile">
                        <Index.InputLabel>
                          <input
                            type="file" 
                            className="change-profile-input"
                            accept="image/*"
                            name="image"
                            onChange={(e) => {
                              try {
                                setFieldValue(
                                  "image",
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
                            error={errors.image && touched.image ? true : false}
                            helperText={
                              errors.image && touched.image
                                ? errors.image
                                : false
                            }
                          />
                        </Index.InputLabel>
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
                          <Index.LoadingButton
                            type="submit"
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            loading={isSubmit}
                            loadingPosition="center"
                            startIcon={
                              !isSubmit && (
                                <img
                                  src={PagesIndex.Svg.save}
                                  className="user-save-icon"
                                  alt="save"
                                />
                              )
                            }
                          >
                            {!isSubmit && addOrEdit === "Add"
                              ? "Save"
                              : "Update"}
                          </Index.LoadingButton>
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
              handleDeleteRecord={!isSubmit && handleClassRemove}
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

export default GalleryManagement;
