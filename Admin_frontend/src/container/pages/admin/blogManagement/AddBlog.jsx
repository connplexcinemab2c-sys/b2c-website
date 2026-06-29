import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useFormik } from "formik";
import DataService from "../../../../config/DataService";
import { blogSchema } from "../../../../validation/FormikValidation";
import { useLocation, useNavigate } from "react-router-dom";
import { Api } from "../../../../config/Api";

const AddBlog = () => {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location?.state?.data;
  const [loading, setLoading] = useState(false);

  const initialValues = {
    title: editId?.title ? editId?.title : "",
    image: editId?.imageBlog ? editId?.imageBlog : "",
    description: editId?.description ? editId?.description : "",
    itemSequence: editId?.itemSequence ? editId?.itemSequence : "",
  };

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("imageBlog", values.image);
    formData.append("description", values.description);
    formData.append("itemSequence", values.itemSequence);

    if (editId?._id) {
      formData.append("id", editId?._id);
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_BLOGS, formData)
      .then((res) => {
        setLoading(false);
        if (res.data.data.status == 400) {
        } else {
          PagesIndex.toast.success(res?.data?.message);

          navigate("/admin/blog");
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: blogSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

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

  useEffect(() => {
    if (editId?.imageBlog) {
      setImageUrl(
        `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.imageBlog}`
      );
    } else {
      console.log("else");
    }
  }, [editId?.imageBlog]);

  return (
    <>
      <Index.Box className="barge-common-box cms-box">
        <Index.Box className="title-header">
          <Index.Box className="res-title-header-flex">
            <Index.Box className="title-main">
              <Index.Typography
                variant="p"
                component="p"
                className="page-title"
              >
                {editId ? "Edit Blog" : "Add Blog"}
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
                            // error={
                            //   formik.errors.image && formik.touched.image
                            //     ? true
                            //     : false
                            // }
                            // helperText={
                            //   formik.errors.image && formik.touched.image
                            //     ? formik.errors.image
                            //     : false
                            // }
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

                  <Index.Grid item lg={6} md={6} sm={6} xs={12}>
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
                  <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Blog Sequence
                      </Index.FormHelperText>
              
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="itemSequence"
                          type="number"
                          className="form-control"
                          onKeyDown={(e) =>
                            (e.keyCode === 69 ||
                              e.keyCode === 190 ||
                              e.keyCode === 110) &&
                            e.preventDefault()
                          }
                          placeholder="Add item Sequence"
                          onWheel={(e) => e.target.blur()}
                          value={formik.values?.itemSequence}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            // Regex to check for decimal values and "e"
                            let check = /^[0-9]*$/.test(inputValue);
                            if (check) {
                              formik.setFieldValue("itemSequence", inputValue);
                            }
                          }}

                          // error={
                          //   formik.errors.itemSequence &&
                          //   formik.errors.itemSequence
                          //     ? true
                          //     : false
                          // }
                          // helperText={
                          //   formik.errors.itemSequence &&
                          //   formik.errors.itemSequence
                          //     ? formik.errors.itemSequence
                          //     : null
                          // }
                        />
                      </Index.Box>
                      {/* <Index.FormHelperText error>
                        {formik.errors.title && formik.touched.title
                          ? formik.errors.title
                          : false}
                      </Index.FormHelperText> */}
                    </Index.Box>
                  </Index.Grid>
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box add-blog-ck-hgt">
                      <Index.FormHelperText className="form-lable">
                        Blog Description
                      </Index.FormHelperText>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formik.values.description}
                        name="description"
                        contenteditable="true"
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
                          image: {
                            toolbar: [
                              "imageStyle:inline",
                              "imageStyle:block",
                              "imageStyle:side",
                              "|",
                              "toggleImageCaption",
                              "imageTextAlternative",
                            ],
                          },
                        }}
                        onReady={(editor) => {
                          // You can store the "editor" and use when it is needed.
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();

                          formik.setFieldValue("description", data);
                        }}
                        onFocus={(event, editor) => {}}
                      />
                      <Index.FormHelperText error>
                        {formik.errors.description && formik.touched.description
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
                            {editId ? "Update" : "Save"}
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
      </Index.Box>
    </>
  );
};

export default AddBlog;
