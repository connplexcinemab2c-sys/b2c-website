import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./GalleryImageManagement.css";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

const GalleryImageManagement = () => {
  const params = PagesIndex.useParams();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );
  const navigate = PagesIndex.useNavigate();
  const formikRef = useRef();
  const { cId } = params;
  const [imageList, setImageList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for searching and set data
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  let initialValues;

  if (addOrEdit == "Edit") {
    initialValues = {
      image: "",
    };
  } else {
    initialValues = {
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
      id: cId,
      imageId: id,
      status: event.target.checked,
    };
    PagesIndex.DataService.post(
      PagesIndex.Api.UPDATE_CINEMA_GALLERY_STATUS,
      data
    )
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        getGalleryList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
      });
  };
  const getGalleryList = () => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("id", cId);
    PagesIndex.DataService.post(
      PagesIndex.Api.GET_CINEMA_GALLERY,
      urlEncoded + `&timestamp=${new Date().getTime()}`
    )
      .then((res) => {
        setImageList(res?.data?.data?.imageGallery);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const handleClassSubmit = (values) => {
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("imageId", id);
    }
    urlEncoded.append("id", cId);
    urlEncoded.append("poster", values?.image);
    PagesIndex.DataService.post(
      PagesIndex.Api.ADD_EDIT_CINEMA_GALLERY_IMAGES,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getGalleryList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
      });
  };

  const handleClassRemove = () => {
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_CLASS, {
      id: cId,
      imageId: id,
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        getGalleryList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };
  useEffect(() => {
    getGalleryList();
  }, []);
  return (
    <PagesIndex.Formik
      enableReinitialize
      onSubmit={handleClassSubmit}
      initialValues={initialValues}
      innerRef={formikRef}
      validationSchema={
        addOrEdit === "Add"
          ? PagesIndex.galleryImageSchema
          : PagesIndex.galleryImageEditSchema
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
      }) => (
        <>
          <Index.Box className="">
            <Index.Box className="barge-common-box gallery-image-management">
              <Index.Box className="title-header">
                <Index.Box className="title-header-flex res-title-header-flex flex-gallery-details">
                  <Index.Box className="title-main  common-export-flex w-100-res">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="page-title"
                    >
                      Gallery Image Management
                    </Index.Typography>
                    <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => navigate("/admin/gallery")}
                      >
                        <img
                          src={PagesIndex.Svg.leftarrow}
                          alt="left-arrow"
                          className="left-back-arrow"
                        />
                        Back
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="d-flex align-items-center res-set-search">
                    <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => navigate("/admin/gallery")}
                      >
                        <img
                          src={PagesIndex.Svg.leftarrow}
                          alt="left-arrow"
                          className="left-back-arrow"
                        />
                        Back
                      </Index.Button>
                    </Index.Box>
                    {adminLoginData?.roleId?.permissions?.includes(
                      "gallery_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Gallery Image
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
                        <Index.TableCell width="20%">Image</Index.TableCell>
                        <Index.TableCell width="60%" align="right">
                          Status
                        </Index.TableCell>
                        {adminLoginData?.roleId?.permissions?.includes(
                          "gallery_edit"
                        ) &&
                          adminLoginData?.roleId?.permissions?.includes(
                            "gallery_delete"
                          ) && (
                            <Index.TableCell width="20%" align="right">
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
                        {imageList?.length ? (
                          imageList
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
                                <Index.TableCell align="right">
                                  <CustomToggleButton
                                    defaultChecked={item?.status}
                                    onChange={(e) => handleStatus(e, item?._id)}
                                  />
                                </Index.TableCell>
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "gallery_edit"
                                ) &&
                                  adminLoginData?.roleId?.permissions?.includes(
                                    "gallery_delete"
                                  ) && (
                                    <Index.TableCell align="right">
                                      <Index.Box className="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "gallery_edit"
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
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        <Index.Box className="icon-width-action">
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

              {imageList?.length && !loading ? (
                <Index.Box className="pagination-design flex-end">
                  <Index.Stack spacing={2}>
                    <Index.Box className="pagination-count">
                      <Index.TablePagination
                        component="div"
                        count={imageList?.length}
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
                  {addOrEdit} Image
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
                      Image (size 1300x700 px)
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
                          <img src={imageUrl} className="upload-profile-img" />
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
                                  URL.createObjectURL(e.currentTarget.files[0])
                                );
                              }
                            } catch (error) {
                              e.currentTarget.value = null;
                            }
                          }}
                          error={errors.image && touched.image ? true : false}
                          helperText={
                            errors.image && touched.image ? errors.image : false
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
            handleDeleteRecord={handleClassRemove}
          />
        </>
      )}
    </PagesIndex.Formik>
  );
};

export default GalleryImageManagement;
