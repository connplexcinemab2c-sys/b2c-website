import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useFormik } from "formik";
import { MemberShipSchema } from "../../../../validation/FormikValidation";
import { useLocation, useNavigate } from "react-router-dom";

const AddMemberShip = () => {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const uploadInputRef = useRef();
  const editId = location?.state?.data;

  const initialValues = {
    title: editId?.title ? editId?.title : "",
    image: editId?.file ? editId?.file : "",
    description: editId?.description ? editId?.description : "",
  };

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("memberShipImg", values.image);
    formData.append("description", values.description);
    if (editId?._id) {
      formData.append("id", editId?._id);
    }

    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_MEMBERSHIP, formData)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        navigate("/admin/memberShip");
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: MemberShipSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  useEffect(() => {
    if (editId?.file) {
      let url = `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.file}`;
      setImageUrl(url);
    }
  }, [editId]);

  useEffect(() => {
    if (uploadInputRef?.current?.files?.length == 0 && editId?.file) {
      let url = `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.file}`;
      setImageUrl(url);
    }
  },[imageUrl, uploadInputRef]);

  const handleCancelImg = (e) => {
    setImageUrl("");
    formik.setFieldValue("image", "");
  };


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
                {editId ? "Edit Membership" : "Add Membership"}
              </Index.Typography>
            </Index.Box>
            <form onSubmit={formik.handleSubmit}>
              <Index.Box className="blog-add-box">
                <Index.Grid container>
                  <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                    <Index.Box className="input-box modal-input-box video-membership">
                      <Index.Box className="file-upload-btn-main">
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          {imageUrl ? (
                            <>
                              <video
                                className="membership-video"
                                controls="false"
                                autoPlay="true"
                                muted
                                loop
                                data-wf-ignore="true"
                                data-object-fit="cover"
                              >
                                <source
                                  src={
                                    imageUrl
                                      ? imageUrl
                                      : PagesIndex.Png.NoImageAvailable
                                  }
                                  className="member-img"
                                  alt="Membership"
                                  type="video/mp4"
                                />
                              </video>
                              <Index.Button
                                className="close-icon-details"
                                onClick={() => handleCancelImg()}
                              >
                                <Index.Tooltip
                                  title="Upload video"
                                  placement="right-end"
                                >
                                  <Index.EditIcon className="editicon" />
                                </Index.Tooltip>
                              </Index.Button>
                            </>
                          ) : (
                            <img
                              className="
                              upload-img"
                              src={PagesIndex.Svg.add}
                              alt="Add Image"
                            />
                          )}
                          <input
                            ref={uploadInputRef}
                            hidden
                            accept="video/*"
                            name="image"
                            type="file"
                            onChange={(e) => {
                              try {
                                if (
                                  e.currentTarget.files.length == 0 &&
                                  editId
                                ) {
                                  let url = `${PagesIndex.IMAGES_API_ENDPOINT}/${editId?.file}`;
                                  setImageUrl(url);
                                } else {
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

                          // Trim leading spaces
                          inputValue = inputValue.trimLeft();

                          // Replace multiple spaces with a single space
                          inputValue = inputValue.replace(/\s{2,}/g, " ");

                          // Trim the input to 200 characters
                          if (inputValue.length > 250) {
                            inputValue = inputValue.slice(0, 250);
                          }
                          // Update the input value
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
                            onClick={() => navigate(-1)}
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

export default AddMemberShip;
