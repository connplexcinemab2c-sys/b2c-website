import React, { useEffect, useMemo, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useFormik } from "formik";
import DataService from "../../../../config/DataService";
import { notificationSchema } from "../../../../validation/FormikValidation";
import { useNavigate, useParams } from "react-router-dom";
const AddNotificaion = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(!!params?.id);
  const [invalidImageError, setInvalidImageError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [cinemaList, setCinemaList] = useState([]);
  const [isCinemaSelectionEnabled, setIsCinemaSelectionEnabled] =
    useState(false);

  const initialValues = {
    title: editData?.title || "",
    image: editData?.image || "",
    description: editData?.description || "",
    date: editData?.date || "",
    time: editData?.time ? PagesIndex.dayjs(editData?.time, "hh:mm A") : "",
    cinemaIds: editData?.cinemaIds || [],
  };

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();

    if (params?.id) {
      formData.append("id", params?.id);
    }
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("date", values.date);
    formData.append("time", PagesIndex.dayjs(values.time).format("hh:mm A"));
    if (isCinemaSelectionEnabled) {
      formData.append("cinemaIds", JSON.stringify(values.cinemaIds));
    }
    if (values.image instanceof Blob) {
      formData.append("notificationImage", values.image);
    }

    PagesIndex.DataService.post(
      PagesIndex.Api.ADD_EDIT_GLOBAL_NOTIFICATION,
      formData
    )
      .then((res) => {
        setLoading(false);
        if ([200, 201]?.includes(res?.data?.status)) {
          PagesIndex.toast.success(res?.data?.message);
          navigate("/admin/global-notification");
        } else {
          PagesIndex.toast.error("Something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        PagesIndex.toast.error(
          err?.response?.data?.message || "Submission failed"
        );
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: notificationSchema(isCinemaSelectionEnabled),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
    const handleRemoveImage = () => {
      if (formik.values?.image instanceof Blob) {
        formik.setFieldValue("image", editData?.image ?? "");
      } else {
        formik.setFieldValue("image", "");
      }
    };
    const isToday = useMemo(() => {
      return (
        formik.values.date &&
        PagesIndex.dayjs(formik.values.date).isSame(PagesIndex.dayjs(), "day")
      );
    }, [formik.values?.date, formik.values?.time]);
  
    function uploadAdapter(loader) {
      return {
        upload: () => {
          return new Promise((resolve, reject) => {
            const formdata = new FormData();
            loader.file.then((file) => {
              formdata.append("imageCkeditor", file);
              DataService.post(PagesIndex.Api.CK_EDITOR_IMAGES, formdata, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
                .then((res) => {
                  resolve({
                    default: `${PagesIndex.IMAGES_API_ENDPOINT}/${res.data.fileName?.[0]?.filename}`,
                  });
                })
                .catch((err) => {
                  console.log(err, "err");
                  reject(err);
                });
            });
          });
        },
      };
    }
    function uploadPlugin(editor) {
      editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
        return uploadAdapter(loader);
      };
    }
  
    const fetchData = async () => {
      try {
        const response = await PagesIndex.DataService.get(
          `${PagesIndex.Api.GET_GLOBAL_NOTIFICATION}/${params?.id}`
        );
        if (response?.status === 200) {
          setEditData(response?.data?.data);
        } else {
          setEditData(null);
        }
      } catch (error) {
        setEditData(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
  
    useEffect(() => {
      if (params?.id) {
        fetchData();
      }
    }, [params?.id]);
  
    const getCinemaList = () => {
      PagesIndex.DataService.get(
        PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
      )
        .then((res) => {
          const cinemas = res?.data?.data || [];
          const sortedCinemaList = cinemas.sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          );
  
          setCinemaList(sortedCinemaList);
          // setSelectedCinema(sortedCinemaList[0]?._id);
        })
        .catch((err) => {
          if (err?.response?.data?.message !== "jwt expired") {
            PagesIndex.toast.error(err?.response?.data?.message);
          }
        });
    };
  
    useEffect(() => {
      getCinemaList();
    }, []);
  
    return (
      <>
        <Index.Box className="barge-common-box cms-box">
          {loading ? (
            <Index.Loader />
          ) : (
            <Index.Box className="title-header">
              <Index.Box className="res-title-header-flex">
                <Index.Box className="title-main">
                  <Index.Typography
                    // variant="p"
                    component="p"
                    className="page-title"
                  >
                    {params?.id ? "Edit" : "Add"} Global Notification
                  </Index.Typography>
                </Index.Box>
                <form onSubmit={formik.handleSubmit}>
                  <Index.Box className="blog-add-box">
                    <Index.Grid container spacing={1}>
                      <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable">
                            Image (size 1100x540 px)
                          </Index.FormHelperText>
                          <Index.Box className="file-upload-btn-main upload-clear-main">
                            <Index.Button
                              variant="contained"
                              component="label"
                              className="file-upload-btn"
                            >
                              {formik.values?.image ? (
                                <img
                                  src={
                                    formik.values?.image instanceof Blob
                                      ? URL.createObjectURL(formik.values?.image)
                                      : `${PagesIndex.IMAGES_API_ENDPOINT}/${formik.values?.image}`
                                  }
                                  className="upload-profile-img"
                                  alt="Uploaded Image"
                                />
                              ) : (
                                <img
                                  className="
                                upload-img"
                                  src={PagesIndex.Svg.add}
                                  alt="Add Image"
                                />
                              )}
                              <input
                                hidden
                                accept="image/*"
                                value=""
                                name="image"
                                type="file"
                                onChange={(e) => {
                                  try {
                                    if (e.target.files && e.target.files[0]) {
                                      const acceptedFileExt = ["jpg", "png", "jpeg"];
                                      const fileExt = e.target.files[0].type
                                        ?.split("/")
                                        ?.at(-1);
                                      const maxSizeInBytes = 500 * 1024; // 500 KB
                                      if (acceptedFileExt?.includes(fileExt)) {
                                        if (
                                          e.target.files[0].size > maxSizeInBytes
                                        ) {
                                          formik.setFieldTouched("image", true);
                                          setInvalidImageError(
                                            "File size should not exceed 500 KB"
                                          );
                                          formik.setFieldValue("image", "");
                                        } else {
                                          formik.setFieldValue(
                                            "image",
                                            e.target.files[0]
                                          );
                                          if (invalidImageError) {
                                            setInvalidImageError(null);
                                          }
                                        }
                                      } else {
                                        formik.setFieldTouched("image", true);
                                        setInvalidImageError(
                                          "Please select a valid image format (jpg, png)"
                                        );
                                        formik.setFieldValue("image", "");
                                      }
                                    }
                                  } catch (error) {
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </Index.Button>
                            {formik.values?.image && (
                              <Index.IconButton
                                className="clear-image-icon-btn"
                                onClick={handleRemoveImage}
                              >
                                <img
                                  src={PagesIndex.Svg.cancel}
                                  className="clear-icon"
                                  alt="Clear img icon"
                                />
                              </Index.IconButton>
                            )}
                          </Index.Box>
                          <Index.FormHelperText error>
                            {(invalidImageError || formik.errors.image) &&
                            formik.touched.image
                              ? invalidImageError || formik.errors.image
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Grid>
  
                      <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable">
                            Notification Title
                          </Index.FormHelperText>
                          <Index.Box className="form-group">
                            <Index.TextField
                              fullWidth
                              id="fullWidth"
                              name="title"
                              className="form-control"
                              placeholder="Enter title"
                              value={formik.values.title}
                              onBlur={formik.handleBlur}
                              inputProps={{ maxLength: 60 }}
                              onChange={(e) => {
                                const newValue = e.target.value
                                  .replace(/^\s+/, "")
                                  .replace(/\s\s+/g, " ");
                                if (newValue.length <= 60) {
                                  formik.setFieldValue("title", newValue);
                                }
                              }}
                            />
                          </Index.Box>
                          <Index.FormHelperText error>
                            {formik.errors.title && formik.touched.title
                              ? formik.errors.title
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Grid>
                      <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable bold-label-common">
                            From Date
                          </Index.FormHelperText>
                          <Index.Box className="form-group date-picker">
                            <Index.LocalizationProvider
                              dateAdapter={Index.AdapterDayjs}
                            >
                              <Index.DatePicker
                                name="date"
                                value={
                                  PagesIndex.dayjs(formik.values.date) || null
                                }
                                onChange={(newValue) => {
                                  const formattedDate = PagesIndex.moment(
                                    newValue?.$d
                                  ).format("YYYY-MM-DD");
                                  formik.setFieldValue("date", formattedDate);
                                  formik.setFieldValue("time", "");
                                }}
                                onBlur={formik.handleBlur}
                                format="DD/MM/YYYY"
                                disablePast
                                slotProps={{
                                  textField: {
                                    error: false,
                                    fullWidth: true,
                                    className: "form-control",
                                  },
                                }}
                              />
                            </Index.LocalizationProvider>
                          </Index.Box>
                          <Index.FormHelperText error>
                            {formik.errors.date && formik.touched.date
                              ? formik.errors.date
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Grid>
                      <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                        <Index.Box className="input-box modal-input-box">
                          <Index.FormHelperText className="form-lable bold-label-common">
                            Time
                          </Index.FormHelperText>
                          <Index.Box className="form-group date-picker">
                            <Index.LocalizationProvider
                              dateAdapter={Index.AdapterDayjs}
                            >
                              <Index.TimePicker
                                ampm={true}
                                value={
                                  PagesIndex.dayjs(formik.values.time) || null
                                }
                                name="time"
                                onChange={(newValue) => {
                                  const formattedDate = PagesIndex.moment(
                                    newValue?.$d
                                  ).format("YYYY-MM-DDTHH:mm");
                                  formik.setFieldValue("time", formattedDate);
                                }}
                                onBlur={formik.handleBlur}
                                timeSteps={{ minutes: 1 }}
                                disabled={!formik.values.date}
                                minTime={
                                  isToday
                                    ? PagesIndex.dayjs().add(1, "minute")
                                    : null
                                }
                                slotProps={{
                                  textField: {
                                    error: false,
                                    fullWidth: true,
                                    className: "form-control",
                                  },
                                }}
                              />
                            </Index.LocalizationProvider>
                          </Index.Box>
                          <Index.FormHelperText error>
                            {formik.errors.time && formik.touched.time
                              ? formik.errors.time
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Grid>
  
                      <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                        <Index.Box className="input-box ">
                          <Index.Box display="flex" alignItems="center">
                            <Index.FormHelperText className="form-lable bold-label-common">
                              Cinema
                            </Index.FormHelperText>
                            <Index.Switch
                              checked={isCinemaSelectionEnabled}
                              onChange={(e) => {
                                setIsCinemaSelectionEnabled(e.target.checked);
                                if (!e.target.checked) {
                                  formik.setFieldValue("cinemaIds", []);
                                }
                              }}
                            />
                          </Index.Box>
                          <Index.Box className="input-box ">
                            <Index.Box className="form-group">
                              <Index.Autocomplete
                                multiple
                                fullWidth
                                disabled={!isCinemaSelectionEnabled}
                                name="cinemaIds"
                                id="cinema-autocomplete"
                                className="cinema-auto-input custom-input"
                                options={[
                                  { _id: "All", displayName: "All" },
                                  ...cinemaList,
                                ]}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.displayName}
                                value={cinemaList.filter((cinema) =>
                                  formik.values.cinemaIds.includes(cinema._id)
                                )}
                                onChange={(event, newValue) => {
                                  if (newValue.some((c) => c._id === "All")) {
                                    if (
                                      formik.values.cinemaIds.length ===
                                      cinemaList.length
                                    ) {
                                      formik.setFieldValue("cinemaIds", []);
                                    } else {
                                      formik.setFieldValue(
                                        "cinemaIds",
                                        cinemaList.map((c) => c._id)
                                      );
                                    }
                                  } else {
                                    formik.setFieldValue(
                                      "cinemaIds",
                                      newValue.map((c) => c._id)
                                    );
                                  }
                                }}
                                renderOption={(props, option, { selected }) => (
                                  <li {...props}>
                                    <Index.Checkbox
                                      style={{ marginRight: 8 }}
                                      checked={
                                        option._id === "All"
                                          ? formik.values.cinemaIds.length ===
                                            cinemaList.length
                                          : selected
                                      }
                                    />
                                    {option.displayName}
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <Index.TextField
                                    {...params}
                                    placeholder="Select Cinema"
                                    className="form-control"
                                  />
                                )}
                              />
                              <Index.FormHelperText error>
                                {formik.errors.cinemaIds &&
                                formik.touched.cinemaIds
                                  ? formik.errors.cinemaIds
                                  : false}
                              </Index.FormHelperText>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      </Index.Grid>
                      <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                        <Index.Box className="input-box modal-input-box add-blog-ck-hgt">
                          <Index.FormHelperText className="form-lable bold-label-common">
                            Notification Description
                          </Index.FormHelperText>
                          <Index.Box
                            sx={{
                              width: "100%",
                              maxHeight: "calc(100vh - 300px)",
                              overflowY: "auto",
                            }}
                          >
                            <CKEditor
                              editor={ClassicEditor}
                              data={formik?.values?.description}
                              name="description"
                              config={{
                                toolbar: [
                                  "heading",
                                  "|",
                                  "bold",
                                  "italic",
                                  "blockQuote",
                                  "imageUpload",
                                  "link",
                                  "|",
                                  "undo",
                                  "redo",
                                ],
                                extraPlugins: [uploadPlugin],
                              }}
                              onReady={(editor) => {}}
                              onChange={(event, editor) => {
                                const data = editor.getData();
                                formik.setFieldValue("description", data);
                              }}
                              onFocus={(event, editor) => {}}
                            />
                          </Index.Box>
  
                          <Index.FormHelperText error>
                            {formik.errors.description &&
                            formik.touched.description
                              ? formik.errors.description
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Grid>
  
                      <Index.Grid item lg={12}>
                        <Index.Box className="modal-user-btn-flex mt-blog-details">
                          <Index.Box className="discard-btn-main btn-main-primary">
                            <Index.Box className="common-button blue-button res-blue-button">
                              <Index.Button
                                variant="contained"
                                disableRipple
                                className="no-text-decoration"
                                onClick={() => navigate(-1)}
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
                                ></img>
  
                                {"Save"}
                              </Index.Button>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      </Index.Grid>
                    </Index.Grid>
                  </Index.Box>
                </form>
              </Index.Box>
            </Index.Box>
          )}
        </Index.Box>
      </>
    );
  };
  
  export default AddNotificaion;
