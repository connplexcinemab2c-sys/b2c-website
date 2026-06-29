import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./SliderManagement.css";
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
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const SliderManagement = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const formik = useRef();

  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );

  const [filteredData, setFilteredData] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [editData, setEditData] = useState(null);
  const [id, setId] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // search
  const [searchValue, setSearchValue] = useState("");

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // image
  const [imageUrl, setImageUrl] = useState("");

  // flags
  const [removeData, setRemoveData] = useState(false);

  // region list
  const [regionList, setRegionList] = useState([]);

  // toggle loading per row
  const [loadingState, setLoadingState] = useState({});

  // ---------- initialValues (supports Edit w/ single or multiple regionIds) ----------
// ---------- initialValues (supports Edit w/ ALL or City list) ----------
const initialValues =
  addOrEdit === "Edit" && editData
    ? {
        title: editData?.title || "",
        poster: editData?.image || "",

        // FIXED: Handle ALL selection properly
        regionId: (() => {
          // If slider is ALL
          if (
            editData?.type?.toLowerCase?.() === "all" ||
            editData?.regionId == null
          ) {
            return ["all"]; // <--- FIX: Preselect "all"
          }

          // If City is array of objects or ids
          if (Array.isArray(editData?.regionId)) {
            return editData.regionId
              .map((r) => (typeof r === "string" ? r : r?._id))
              .filter(Boolean);
          }

          // If City is single string id
          if (typeof editData?.regionId === "string") {
            return [editData.regionId];
          }

          // If City is object { _id, region }
          if (editData?.regionId?._id) {
            return [editData.regionId._id];
          }

          return [];
        })(),

        sliderType: editData?.sliderType || "",
      }
    : {
        title: "",
        poster: "",
        regionId: [],
        sliderType: "",
      };


  // ---------- handlers ----------
  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
  };

  const handleClose = () => {
    setId("");
    setImageUrl("");
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

  const handleChangePage = (event, newPage) => setCurrentPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleStatus = (event, id) => {
    const data = {
      id,
      status: event.target.checked,
    };
    setLoadingState((prev) => ({ ...prev, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_SLIDER, data)
      .then((res) => {
        if (res?.data?.status === 200 || res?.data?.status === 201) {
          PagesIndex.toast.success(res?.data?.message);
          getSliderList();
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => {
        setTimeout(() => {
          setLoadingState((prev) => ({ ...prev, [id]: false }));
        }, 600);
      });
  };

  // ---------- search over title, sliderType, type, and city names (array-safe) ----------
  const requestSearch = (searched) => {
    const q = (searched || "").toLowerCase();
    const filtered = sliderList?.filter((item) => {
      const inTitle = item?.title?.toLowerCase?.().includes(q);
      const inType = item?.type?.toLowerCase?.().includes(q);
      const inSliderType = item?.sliderType?.toLowerCase?.().includes(q);

      // region can be null (ALL), object, or array of objects/ids
      let inRegion = false;
      if (item?.regionId == null) {
        inRegion = "all".includes(q);
      } else if (Array.isArray(item?.regionId)) {
        inRegion = item.regionId.some((r) => {
          if (typeof r === "string") return false;
          return r?.region?.toLowerCase?.().includes(q);
        });
      } else if (typeof item?.regionId === "object") {
        inRegion = item?.regionId?.region?.toLowerCase?.().includes(q);
      }
      return inTitle || inType || inSliderType || inRegion;
    });
    setCurrentPage(0);
    setFilteredData(filtered);
  };

  const getSliderList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_SLIDER + "?" + new Date().getTime()
    )
      .then((res) => {
        const list = res?.data?.data || [];
        setSliderList(list);
        setFilteredData(list);
        setTimeout(() => setLoading(false), 800);

        if (searchValue !== "" && !removeData && filteredData !== []) {
          requestSearch(searchValue);
        } else {
          setFilteredData(list);
          setSearchValue("");
          setRemoveData(false);
        }
      })
      .catch((err) => {
        setTimeout(() => setLoading(false), 800);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleSliderSubmit = (values) => {
    setLoading(true);
    const urlEncoded = new FormData();
    if (id) urlEncoded.append("id", id);

    urlEncoded.append("title", values?.title || "");
    urlEncoded.append("poster", values?.poster || "");
    urlEncoded.append("sliderType", values?.sliderType || "");

    // Multi-select logic:
    // - If user picks special 'All', we send type='all' and no regionId[].
    // - Otherwise send regionId[] and type='City'
    const isAll = Array.isArray(values?.regionId)
      ? values.regionId.includes("all")
      : values?.regionId === "all";

    if (isAll) {
      urlEncoded.append("type", "all");
    } else if (Array.isArray(values?.regionId) && values.regionId.length > 0) {
      values.regionId.forEach((rid) => urlEncoded.append("regionId[]", rid));
      urlEncoded.append("type", "City");
    } else {
      // no selection treated as City with empty region list
      urlEncoded.append("type", "City");
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_SLIDER, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getSliderList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => setLoading(false));
  };

  const handleSliderRemove = () => {
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_SLIDER, { id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getSliderList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      });
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
      .then((res) => setRegionList(res?.data?.data || []))
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    getSliderList();
  }, [removeData]);

  useEffect(() => {
    getRegionList();
  }, []);

  // ---------- guard ----------
  if (
    !(adminLoginData?.type === "Admin" ||
      adminLoginData?.roleId?.permissions?.includes("slider_view"))
  ) {
    dispatch(adminLogout());
    return null;
  }

  return (
    <PagesIndex.Formik
      enableReinitialize
      onSubmit={handleSliderSubmit}
      initialValues={initialValues}
      validateOnChange={true}
      validateOnBlur={true}
      validationSchema={PagesIndex.sliderSchema}
      innerRef={formik}
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
            <Index.Box className="barge-common-box">
              <Index.Box className="title-header">
                <Index.Box className="title-header-flex res-title-header-flex">
                  <Index.Box className="title-main common-export-flex">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="page-title"
                    >
                      Slider Management
                    </Index.Typography>

                    {adminLoginData?.roleId?.permissions?.includes(
                      "slider_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Slider
                        </Index.Button>
                      </Index.Box>
                    )}
                  </Index.Box>

                  <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                    <Search className="search">
                      <StyledInputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        value={searchValue}
                        onChange={handleInputChange}
                      />
                    </Search>

                    {adminLoginData?.roleId?.permissions?.includes(
                      "slider_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Slider
                        </Index.Button>
                      </Index.Box>
                    )}
                  </Index.Box>
                </Index.Box>
              </Index.Box>

              <Index.Box className="page-table-main slider-table-main">
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
                        <Index.TableCell width="10%">Slider Image</Index.TableCell>
                        <Index.TableCell width="20%">Slider Name</Index.TableCell>
                        <Index.TableCell width="20%">Slider Type</Index.TableCell>
                        <Index.TableCell width="20%">City</Index.TableCell>
                        <Index.TableCell align="center" width="5%">
                          {adminLoginData?.roleId?.permissions?.includes(
                            "slider_edit"
                          ) && <Index.Box>Status</Index.Box>}
                        </Index.TableCell>
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
                            ?.map((item) => {
                              // City display
                              let cityDisplay = "ALL";
                              if (
                                item?.type?.toLowerCase?.() !== "all" &&
                                item?.regionId != null
                              ) {
                                if (Array.isArray(item?.regionId)) {
                                  cityDisplay = item.regionId
                                    .map((r) =>
                                      typeof r === "string" ? r : r?.region
                                    )
                                    .filter(Boolean)
                                    .join(", ");
                                } else if (typeof item?.regionId === "object") {
                                  cityDisplay = item?.regionId?.region || "-";
                                } else {
                                  cityDisplay = "-";
                                }
                              }

                              return (
                                <Index.TableRow key={item?._id}>
                                  <Index.TableCell>
                                    <Index.Box className="rectangle-img-box">
                                      <img
                                        src={
                                          item?.image
                                            ? `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.image}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        onClick={handleClose}
                                        alt=""
                                        className="rectangle-img"
                                      />
                                    </Index.Box>
                                  </Index.TableCell>

                                  <Index.TableCell>
                                    {item?.title || "-"}
                                  </Index.TableCell>

                                  <Index.TableCell>
                                    {item?.sliderType || "-"}
                                  </Index.TableCell>

                                  <Index.TableCell>{cityDisplay}</Index.TableCell>

                                  <Index.TableCell align="center">
                                    {adminLoginData?.roleId?.permissions?.includes(
                                      "slider_edit"
                                    ) && (
                                      <CustomToggleButton
                                        defaultChecked={item?.status}
                                        onChange={(e) => handleStatus(e, item?._id)}
                                        disabled={loadingState[item?._id] || false}
                                      />
                                    )}
                                  </Index.TableCell>

                                  {(adminLoginData?.roleId?.permissions?.includes(
                                    "slider_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "slider_delete"
                                    )) && (
                                    <Index.TableCell>
                                      <Index.Box className="flex-action-details">
                                        <Index.Box className="icon-width-action">
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "slider_edit"
                                          ) && (
                                            <Index.IconButton
                                              onClick={() => {
                                                setId(item?._id);
                                                if (item?.image) {
                                                  setImageUrl(
                                                    `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.image}`
                                                  );
                                                } else {
                                                  setImageUrl("");
                                                }
                                                setEditData(item);
                                                handleOpen("Edit");
                                              }}
                                            >
                                              <Index.EditIcon />
                                            </Index.IconButton>
                                          )}
                                        </Index.Box>

                                        <Index.Box className="icon-width-action">
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
              ) : null}
            </Index.Box>
          </Index.Box>

          {/* Add / Edit Modal */}
          <Index.Modal
            open={addOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="modal"
          >
            <Index.Box sx={style} className="modal-inner-main add-region-modal modal-inner">
              <Index.Box className="modal-header">
                <Index.Typography
                  id="modal-modal-title"
                  className="modal-title"
                  variant="h6"
                  component="h2"
                >
                  {addOrEdit} Slider
                </Index.Typography>
                <img
                  src={PagesIndex.Svg.cancel}
                  className="modal-close-icon"
                  onClick={handleClose}
                  alt="Close Modal"
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
                  {/* Slider Type */}
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Slider Type
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="sliderType"
                        className="form-control"
                        displayEmpty
                        renderValue={
                          values?.sliderType
                            ? undefined
                            : () => <span className="placeholder-text">Select slider type</span>
                        }
                        value={values?.sliderType}
                        onChange={(e) => {
                          // clear poster preview when type changes (optional)
                          setFieldValue("sliderType", e.target.value);
                        }}
                        onBlur={handleBlur}
                        error={Boolean(errors.sliderType && touched.sliderType)}
                      >
                        <Index.MenuItem value={"Web"}>Web</Index.MenuItem>
                        <Index.MenuItem value={"App"}>App</Index.MenuItem>
                      </Index.Select>
                      <Index.FormHelperText error>
                        {errors.sliderType && touched.sliderType ? errors.sliderType : ""}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Box>

                  {/* Slider Name */}
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Slider Name
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        id="fullWidth"
                        name="title"
                        className="form-control"
                        placeholder="Enter slider name"
                        value={values?.title}
                        inputProps={{ maxLength: 50 }}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          const newValue = e.target.value
                            .replace(/^\s+/, "")
                            .replace(/\s\s+/g, " ");
                          if (newValue.length <= 50) {
                            setFieldValue("title", newValue);
                          }
                        }}
                        error={!!(errors.title && touched.title)}
                        helperText={errors.title && touched.title ? errors.title : null}
                      />
                    </Index.Box>
                  </Index.Box>

                  {/* Image */}
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Image{" "}
                      {values?.sliderType !== "" && (
                        <>
                          size(
                          {values?.sliderType === "Web" ? "1920x600 px" : "1200x840 px"})
                        </>
                      )}{" "}
                      (Max 2mb)
                    </Index.FormHelperText>

                    <Index.Box className="file-upload-btn-main">
                      <Index.Button variant="contained" component="label" className="file-upload-btn">
                        {imageUrl ? (
                          <img src={imageUrl} className="upload-profile-img" alt="Uploaded" />
                        ) : (
                          <img className="upload-img" src={PagesIndex.Svg.add} alt="Add" />
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
                                setImageUrl(URL.createObjectURL(e.target.files[0]));
                                e.target.value = null; // allow re-upload same file
                              }
                            } catch (error) {
                              e.target.value = null;
                            }
                          }}
                        />
                      </Index.Button>
                    </Index.Box>

                    <Index.FormHelperText error>
                      {errors.poster && touched.poster ? errors.poster : false}
                    </Index.FormHelperText>
                  </Index.Box>

                  {/* City - MULTI SELECT */}
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      City
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        multiple
                        id="fullWidth"
                        name="regionId"
                        className="form-control"
                        value={Array.isArray(values?.regionId) ? values.regionId : []}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected || selected.length === 0) {
                            return <span className="placeholder-text">Select city</span>;
                          }
                          if (selected.includes("all")) return "ALL";
                          const names = regionList
                            ?.filter((r) => selected.includes(r?._id))
                            ?.map((r) => r?.region)
                            ?.filter(Boolean)
                            ?.join(", ");
                          return names || <span className="placeholder-text">Select city</span>;
                        }}
                        onChange={(e) => {
                          let value = e.target.value;
                          // if "all" selected, force only 'all'

                          if(values?.regionId?.includes("all") && value.includes("all")) {
                            value = value.filter(v => v !== "all");
                          }

                          if(values?.regionId?.includes("all") && !value.includes("all")) {
                            value = value.filter(v => v !== "all");
                          }

                          if (value.includes("all")) value = ["all"];
                          setFieldValue("regionId", value);
                        }}
                        error={!!(errors.regionId && touched.regionId)}
                      >
                        <Index.MenuItem value="all">
                          All
                        </Index.MenuItem>
                        {regionList?.length > 0
                          ? regionList.map((item) => (
                              <Index.MenuItem key={item?._id} value={item?._id}>
                                {item?.region}
                              </Index.MenuItem>
                            ))
                          : null}
                      </Index.Select>
                      <Index.FormHelperText error>
                        {errors.regionId && touched.regionId ? errors.regionId : null}
                      </Index.FormHelperText>
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
                          disabled={loading}
                        >
                          <img
                            src={PagesIndex.Svg.save}
                            className="user-save-icon"
                            alt="save"
                          />
                          {addOrEdit === "Add" ? "Save" : "Update"}
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
            handleDeleteRecord={handleSliderRemove}
          />
        </>
      )}
    </PagesIndex.Formik>
  );
};

export default SliderManagement;
