import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
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

const EcommerceBannerManagement = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [filteredData, setFilteredData] = useState([]);
  const [bannerList, setBannerList] = useState([]);
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
    category: "",
    title: "",
    poster: "",
    description: "",
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
  const requestSearch = (searchVal) => {
    const filtered = bannerList.filter((banner) =>
      banner?.title?.toLowerCase().includes(searchVal.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Search on table

  const getBannerList = () => {
    PagesIndex.EcommerceService.get(
      PagesIndex.EcommerceApi.GET_ALL_ECOMMERCE_BANNER
    )
      .then((res) => {
        console.log(res.data.data, "sjfhsdfh");
        setBannerList(res?.data?.data || []);
        setFilteredData(res?.data?.data || []);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
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

  const handleBannerSubmit = (values) => {
    setButtonLoading(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }
    urlEncoded.append("categoryId", values?.category);
    urlEncoded.append("title", values?.title);
    urlEncoded.append("banner", values?.poster);
    urlEncoded.append("description", values?.description);

    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.UPDATE_ECOMMERCE_BANNER,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getBannerList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => setButtonLoading(false));
  };

  const handleBannerRemove = () => {
    setIsLoading(true);
    PagesIndex.EcommerceService.post(PagesIndex.Api.DELETE_BANNER, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getBannerList();
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
  const getCategoryList = () => {
    PagesIndex.EcommerceService.get(PagesIndex.EcommerceApi.GET_ALL_CATEGORIES)
      .then((res) => {
        setCategoryList(res?.data?.data || []);
        // setFilteredData(res?.data?.data);
        setLoading(false);
        // if (searchValue !== "" && !removeData && !filteredData == []) {
        //   let filteredDataFilter = res?.data?.data?.filter(
        //     (title) =>
        //       title?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
        //       (data?.isActive ? "Active" : "DeActive")
        //         ?.toLowerCase()
        //         .includes(searchValue?.toLowerCase())
        //   );
        //   setFilteredData(filteredDataFilter);
        // } else {
        //   setFilteredData(res?.data?.data);
        //   setSearchValue("");
        //   setRemoveData(false);
        // }
      })
      .catch((err) => {
        setLoading(false);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  useEffect(() => {
    getBannerList();
    getCategoryList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("slider_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleBannerSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.ecommerceBannerEditSchema}
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
                        Ecommerce Banner Management
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
                      {/* {adminLoginData?.roleId?.permissions?.includes(
                        "slider_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add Banner
                          </Index.Button>
                        </Index.Box>
                      )} */}
                    </Index.Box>
                  </Index.Box>
                </Index.Box>

                <Index.Box className="page-table-main ecommercebanner-table-main">
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
                          <Index.TableCell width="8%">
                            Banner Image
                          </Index.TableCell>
                          <Index.TableCell width="8%">
                            Banner Title
                          </Index.TableCell>
                          <Index.TableCell width="5%">Category</Index.TableCell>
                          <Index.TableCell width="8%">
                            Description
                          </Index.TableCell>
                          {/* {adminLoginData?.roleId?.permissions?.includes(
                            "slider_edit"
                          ) && (
                            <Index.TableCell align="center" width="5%">
                              Status
                            </Index.TableCell>
                          )} */}
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "slider_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "slider_delete"
                            )) && (
                            <Index.TableCell align="right" width="5%">
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
                                  <Index.TableCell>
                                    <Index.Box className="rectangle-img-box">
                                      <img
                                        src={
                                          item?.banner
                                            ? `${PagesIndex?.ECOMMERCE_IMAGES_API_ENDPOINT}/${item?.banner}`
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
                                    {item?.categoryId
                                      ? item?.categoryId?.name
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.description
                                      ? item?.description
                                      : "-"}
                                  </Index.TableCell>
                                  {(adminLoginData?.roleId?.permissions?.includes(
                                    "slider_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "slider_delete"
                                    )) && (
                                    <Index.TableCell align="right">
                                      <Index.Box className="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "slider_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={(e) => {
                                                for (let key in item) {
                                                  if (key !== "poster") {
                                                    setFieldValue(
                                                      key,
                                                      item[key]
                                                    );
                                                  }
                                                }
                                                setFieldValue(
                                                  "category",
                                                  item?.categoryId?._id || ""
                                                );
                                                setFieldValue(
                                                  "poster",
                                                  item?.banner || ""
                                                );
                                                setId(item?._id);
                                                if (item?.banner) {
                                                  setImageUrl(
                                                    `${PagesIndex?.ECOMMERCE_IMAGES_API_ENDPOINT}/${item?.banner}`
                                                  );
                                                }
                                                handleOpen("Edit");
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>
                                        {/* <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "slider_delete"
                                          ) && (
                                            <Index.IconButton
                                              onClick={() =>
                                                handleDeleteOpen(item?._id)
                                              }
                                            >
                                              <Index.DeleteIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box> */}
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
                                No Banner Available
                              </Index.TableCell>
                            </Index.TableRow>
                          )}
                        </Index.TableBody>
                      )}
                    </Index.Table>
                  </Index.TableContainer>
                </Index.Box>

                {/* {filteredData?.length && !loading ? (
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
                )} */}
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
                    {addOrEdit} Banner
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
                        Category
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          name="category"
                          className="form-control"
                          displayEmpty
                          renderValue={
                            values?.category
                              ? undefined
                              : () => (
                                  <span className="placeholder-text">
                                    Select category
                                  </span>
                                )
                          }
                          value={values?.category}
                          onChange={(e) => {
                            setFieldValue("category", e.target.value);
                          }}
                          error={
                            errors.category && touched.category ? true : false
                          }
                        >
                          {categoryList?.map((item, i) => (
                            <Index.MenuItem value={item?._id}>
                              {item?.name}
                            </Index.MenuItem>
                          ))}
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors.category && touched.category
                            ? errors.category
                            : null}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Banner Title
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="title"
                          className="form-control"
                          placeholder="Enter banner title"
                          value={values?.title}
                          inputProps={{ maxLength: 50 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 50) {
                              setFieldValue("title", newValue);
                            }
                          }}
                          error={errors.title && touched.title ? true : false}
                          helperText={
                            errors.title && touched.title ? errors.title : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Image{" "}
                        {/* {values?.bannerType !== "" && (
                          <>
                            size (
                            {values?.bannerType == "Web Banner"
                              ? "1920x600 px"
                              : "1080x1920 px"}
                            )
                          </>
                        )} */}
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
                            name="poster"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (e.target.files && e.target.files[0]) {
                                  setFieldValue("poster", e.target.files[0]);
                                  setImageUrl(
                                    URL.createObjectURL(e.target.files[0])
                                  );
                                }
                              } catch (error) {
                                e.target.value = null;
                              }
                            }}
                            error={
                              errors.poster && touched.poster ? true : false
                            }
                            helperText={
                              errors.poster && touched.poster
                                ? errors.poster
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.FormHelperText error>
                        {errors.poster && touched.poster
                          ? errors.poster
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                    {/* {imageUrl && <img src={imageUrl} className="slider-image" />} */}
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Description
                      </Index.FormHelperText>
                      <Index.Box className="form-group d-flex-textarea">
                        <Index.TextareaAutosize
                          fullWidth
                          className="form-control form-text-area"
                          minRows={2}
                          name="description"
                          placeholder="Enter address"
                          value={values?.description}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 150) {
                              setFieldValue("description", newValue);
                            }
                          }}
                          error={
                            errors.description && touched.description
                              ? true
                              : false
                          }
                          helperText={
                            errors.description && touched.description
                              ? errors.description
                              : null
                          }
                          // error={errors.address && touched.address ? true : false}
                        />
                      </Index.Box>
                    </Index.Box>
                    {/* {values?.bannerType === "Web Banner" ? (
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Banner Show Section
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Autocomplete
                            className="cinema-auto-input"
                            multiple
                            options={[
                              "Above Upcoming Section",
                              "Below Upcoming Section",
                              "My Account Section"
                            ]}
                            getOptionLabel={(option) => option}
                            defaultValue={() => {
                              let idArray = [];
                              values?.bannerShowSection?.map((data1, index) => {
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
                                  errors.bannerShowSection &&
                                  touched.bannerShowSection
                                    ? true
                                    : false
                                }
                                helperText={
                                  errors.bannerShowSection &&
                                  touched.bannerShowSection
                                    ? errors.bannerShowSection
                                    : null
                                }
                                className="movie-management-input movie-management-category"
                                placeholder={
                                  params.InputProps.startAdornment
                                    ? ""
                                    : "Select banner show section"
                                }
                                InputLabelProps={{
                                  shrink: !!params.InputProps.startAdornment // Shrink label when there are selected values
                                }}
                              />
                            )}
                            onChange={(e, val) => {
                              let idArray = [];
                              val.map((item) => {
                                idArray.push(item);
                              });
                              setFieldValue("bannerShowSection", idArray);
                            }}
                            onKeyDown={(event) => {
                              if (event.keyCode === 32) {
                                event.preventDefault();
                              }
                            }}
                          />
                        </Index.Box>
                      </Index.Box>
                    ) : (
                      ""
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
              handleDeleteRecord={!isLoading && handleBannerRemove}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default EcommerceBannerManagement;
