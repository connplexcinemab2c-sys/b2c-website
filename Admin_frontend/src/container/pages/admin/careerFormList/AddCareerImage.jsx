import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useFormik } from "formik";
import {
  advertiseImageSchema,
  careerImageSchema,
} from "../../../../validation/FormikValidation";
import { useLocation, useNavigate } from "react-router-dom";

const AddCareerImage = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [bgImageURL, setBgImageURL] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location?.state?.data;

  const initialValues = {
    title: editId?.title ? editId?.title : "",
    careerWithUsImg: editId?.file ? editId?.file : "",
    careerBgImg: editId?.filebg ? editId?.filebg : "",
    description: editId?.description ? editId?.description : "",
  };

  const handleSubmit = (values) => {
    setIsSubmit(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("careerWithUsImg", values.careerWithUsImg);
    formData.append("careerBgImg", values.careerBgImg);
    formData.append("description", values.description);
    if (editId?._id) {
      formData.append("id", editId?._id);
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_CAREER, formData)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        localStorage.setItem("returnToTab", "1");
        navigate("/admin/career_requests");
      })
      .catch((err) => {
        setIsSubmit(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: careerImageSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    if (editId?.file) {
      let url = `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.file}`;
      setImageUrl(url);
    }
    if (editId?.filebg) {
      let url = `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.filebg}`;
      setBgImageURL(url);
    }
  }, [editId]);

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
                {editId ? "Edit Career Banner" : "Add Career Banner"}
              </Index.Typography>
            </Index.Box>
            <form onSubmit={formik.handleSubmit}>
              <Index.Box className="blog-add-box">
                <Index.Grid container>
                  <Index.Grid item lg={2} md={2} sm={2} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Banner Image <br /> (size 1920x350 px)
                      </Index.FormHelperText>
                      <Index.Box className="file-upload-btn-main">
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          <img
                            src={bgImageURL || PagesIndex.Svg.add}
                            className={
                              bgImageURL ? "upload-profile-img" : "upload-img"
                            }
                            alt={bgImageURL ? "Uploaded Image" : "Add Image"}
                          />
                          <input
                            hidden
                            accept="image/*"
                            name="careerBgImg"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files &&
                                  e.currentTarget.files[0]
                                ) {
                                  formik.setFieldValue(
                                    "careerBgImg",
                                    e.currentTarget.files[0]
                                  );

                                  setBgImageURL(
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
                              formik.errors.advertiseBgImg &&
                              formik.touched.advertiseBgImg
                                ? true
                                : false
                            }
                            helperText={
                              formik.errors.careerBgImg &&
                              formik.touched.careerBgImg
                                ? formik.errors.careerBgImg
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.FormHelperText error>
                        {formik.errors.careerBgImg && formik.touched.careerBgImg
                          ? formik.errors.careerBgImg
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Grid>
                  <Index.Grid item lg={6} md={6} sm={6} xs={12}>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Image <br /> (size 630x570 px)
                      </Index.FormHelperText>
                      <Index.Box className="file-upload-btn-main">
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          <img
                            src={imageUrl || PagesIndex.Svg.add}
                            className={
                              imageUrl ? "upload-profile-img" : "upload-img"
                            }
                            alt={imageUrl ? "Uploaded Image" : "Add Image"}
                          />
                          <input
                            hidden
                            accept="image/*"
                            name="careerWithUsImg"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files &&
                                  e.currentTarget.files[0]
                                ) {
                                  formik.setFieldValue(
                                    "careerWithUsImg",
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
                              formik.errors.careerWithUsImg &&
                              formik.touched.careerWithUsImg
                                ? true
                                : false
                            }
                            helperText={
                              formik.errors.careerWithUsImg &&
                              formik.touched.careerWithUsImg
                                ? formik.errors.careerWithUsImg
                                : false
                            }
                          />
                        </Index.Button>
                      </Index.Box>
                      <Index.FormHelperText error>
                        {formik.errors.careerWithUsImg &&
                        formik.touched.careerWithUsImg
                          ? formik.errors.careerWithUsImg
                          : false}
                      </Index.FormHelperText>
                    </Index.Box>
                  </Index.Grid>
                  <Index.Grid item lg={6} md={6} sm={6} xs={12}>
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
                          value={formik.values.title}
                          onBlur={formik.handleBlur}
                          inputProps={{ maxLength: 100 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 100) {
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
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box add-blog-ck-hgt">
                      <Index.FormHelperText className="form-lable">
                        Description
                      </Index.FormHelperText>

                      <Index.TextareaAutosize
                        fullWidth
                        id="fullWidth"
                        className="form-control form-text-area"
                        minRows={4}
                        name="description"
                        placeholder="Enter description"
                        value={formik?.values?.description}
                        maxLength={250}
                        onInput={(event) => {
                          const input = event.target;
                          let inputValue = input.value;

                          inputValue = inputValue.trimLeft();

                          inputValue = inputValue.replace(/\s{2,}/g, " ");

                          if (inputValue.length > 250) {
                            inputValue = inputValue.slice(0, 250);
                          }

                          input.value = inputValue;
                        }}
                        onChange={formik?.handleChange}
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
                            onClick={() => {
                              localStorage.setItem("returnToTab", "1");
                              navigate(-1);
                            }}
                          >
                            Discard
                          </Index.Button>
                          <Index.Button
                            type="submit"
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            disabled={isSubmit}
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

export default AddCareerImage;
