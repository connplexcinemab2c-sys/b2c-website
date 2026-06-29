import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Form, useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { blogBackgroundSchema, blogSchema } from "../../../../validation/FormikValidation";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

const AddBlogBackground = ({ open, editData, handleClose }) => {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const editId = editData;

  const initialValues = {
    title: editId?.title ? editId?.title : "",
    image: editId?.imageBlog ? editId?.imageBlog : "",
  };

  useEffect(() => {
    if (editId?.imageBlog) {
      setImageUrl(
        `${PagesIndex?.IMAGES_API_ENDPOINT}/${editId?.imageBlog}`
      );
    }else{
      setImageUrl("")
    }
  }, [editId?.imageBlog]);

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("imageBlog", values.image);
    if (editId?._id) {
      formData.append("id", editId?._id);
    }

    PagesIndex.DataService.post(
      PagesIndex.Api.ADD_EDIT_BLOG_BACKGROUND,
      formData
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: blogBackgroundSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });
  return (
    <Index.Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="modal"
    >
      <>
        <Index.Box
          sx={style}
          className="modal-inner-main add-region-modal modal-inner"
        >
          <Index.Box className="modal-header">
            <Index.Typography
              className="modal-title"
              variant="h6"
              component="h2"
            >
              {editId ? "Edit" : "Add"} Blog Background
            </Index.Typography>
            <img
              src={PagesIndex.Svg.cancel}
              className="modal-close-icon"
              onClick={() => {
                handleClose();
              }}
            />
          </Index.Box>

          <Index.Box className="modal-body">
            <form onSubmit={formik.handleSubmit}>
              <Index.Box className="blog-add-box">
                <Index.Grid container>
            
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Image (size 1100x540 px)
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
                            name="image"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files &&
                                  e.currentTarget.files[0]
                                ) {
                                  formik.setFieldValue(
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
                            error={
                              formik.errors.image && formik.touched.image
                                ? true
                                : false
                            }
                            helperText={
                              formik.errors.image && formik.touched.image
                                ? formik.errors.image
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.FormHelperText error>
                        {formik.errors.image && formik.touched.image
                          ? formik.errors.image
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Grid>
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Blog Title
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="title"
                          className="form-control"
                          placeholder="Enter blog title"
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

                  {/* <Index.Grid item lg={12}> */}
                  <Index.Box className="modal-user-btn-flex mt-blog-details">
                    <Index.Box className="discard-btn-main btn-main-primary">
                      <Index.Box className="common-button blue-button res-blue-button">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleClose()}
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
                          Save
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  {/* </Index.Grid> */}
                </Index.Grid>
              </Index.Box>
            </form>
          </Index.Box>
        </Index.Box>
      </>
    </Index.Modal>
  );
};

export default AddBlogBackground;
