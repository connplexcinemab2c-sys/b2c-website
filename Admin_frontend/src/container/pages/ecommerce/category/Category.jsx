import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import {
  Search,
  StyledInputBase,
  style,
} from "../../../../common/Search/Search";

const Category = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [filteredData, setFilteredData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);

  let initialValues = {
    name: "",
    image: "",
    isEdit: false,
  };
  // handle open close
  const handleOpen = (mode) => {
    setAddOpen(true);
    setAddOrEdit(mode);
  };

  const handleClose = () => {
    setId("");
    setImageUrl("");
    setAddOpen(false);
    formik.current?.resetForm();
  };

  // handle delete
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  // pagination
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
      status: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ACTIVE_DEACTIVE_CATEGORY,
      data
    )
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getCategoryList();
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setLoadingState((prevState) => ({ ...prevState, [id]: false }));
      });
  };
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = categoryList?.filter(
      (data) =>
        data?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        (data?.isActive ? "Active" : "DeActive")
          ?.toLowerCase()
          .includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getCategoryList = () => {
    PagesIndex.EcommerceService.get(PagesIndex.EcommerceApi.GET_ALL_CATEGORIES)
      .then((res) => {
        setCategoryList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setLoading(false);
        console.log("searchValuesearchValue", searchValue);

        if (searchValue !== "" && !removeData && !filteredData == []) {
          console.log("filteredDataFilter");

          let filteredDataFilter = res?.data?.data?.filter(
            (title) =>
              title?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
              (data?.isActive ? "Active" : "DeActive")
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase())
          );
          console.log("testing", filteredDataFilter);

          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleCategorySubmit = (values) => {
    setButtonLoading(true);
    const formData = new FormData();
    if (id) {
      formData.append("id", id);
    }
    formData.append("name", values?.name?.trim());
    formData.append("categoryImage", values?.image);
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ADD_EDIT_CATEGORY,
      formData
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getCategoryList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => setButtonLoading(false));
  };

  const handleCategoryRemove = () => {
    setIsLoading(true);
    PagesIndex.EcommerceService.post(PagesIndex.EcommerceApi.DELETE_CATEGORY, {
      id: id,
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getCategoryList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  useEffect(() => {
    getCategoryList();
  }, [removeData]);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("ecommerce") ||
    true
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleCategorySubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.addEditCategorySchema}
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
              {console.log(errors, "errors")}
              <Index.Box className="barge-common-box">
                <Index.Box className="title-header">
                  <Index.Box className="title-header-flex res-title-header-flex">
                    <Index.Box className="title-main common-export-flex">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="page-title"
                      >
                        Category Management
                      </Index.Typography>
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

                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Category
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>

                <Index.Box className="page-table-main banner-table-main">
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
                          <Index.TableCell width="5%">
                            Category Image
                          </Index.TableCell>
                          <Index.TableCell width="10%">
                            Category Name
                          </Index.TableCell>
                          <Index.TableCell align="center" width="5%">
                            Status
                          </Index.TableCell>
                          <Index.TableCell align="right" width="5%">
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
                                <Index.TableRow key={item?._id}>
                                  <Index.TableCell>
                                    <Index.Box className="rectangle-img-box">
                                      <img
                                        src={
                                          item?.image
                                            ? `${PagesIndex?.ECOMMERCE_IMAGES_API_ENDPOINT}/${item?.image}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        onClick={handleClose}
                                        alt=""
                                        className="rectangle-img"
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.name ? item?.name : "-"}
                                  </Index.TableCell>

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

                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details">
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={(e) => {
                                            for (let key in item) {
                                              setFieldValue(key, item[key]);
                                            }
                                            setFieldValue("isEdit", true);
                                            setId(item?._id);
                                            if (item?.image) {
                                              setImageUrl(
                                                `${PagesIndex?.ECOMMERCE_IMAGES_API_ENDPOINT}/${item?.image}`
                                              );
                                            }
                                            handleOpen("Edit");
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      </Index.Box>
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                          disabled={item?.isUsed}
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
                                      </Index.Box>
                                    </Index.Box>
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
                                No category available
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

            {/* add and edit model */}
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
                    {addOrEdit} Category
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
                        Category Name
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="name"
                          className="form-control"
                          placeholder="Enter category name"
                          value={values?.name}
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
                        Image{" "}
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
                                if (e.target.files && e.target.files[0]) {
                                  setFieldValue("image", e.target.files[0]);
                                  setImageUrl(
                                    URL.createObjectURL(e.target.files[0])
                                  );
                                }
                              } catch (error) {
                                e.target.value = null;
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
                            loading={buttonLoading}
                            loadingPosition="center"
                            startIcon={
                              !buttonLoading && (
                                <img
                                  src={PagesIndex.Svg.save}
                                  className="user-save-icon"
                                  alt="save"
                                />
                              )
                            }
                          >
                            {!buttonLoading && addOrEdit === "Add"
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
            {/* delete modal */}
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handleCategoryRemove}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default Category;
