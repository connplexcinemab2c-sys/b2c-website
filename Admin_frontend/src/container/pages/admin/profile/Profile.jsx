import React, { useState } from "react";
import Index from "../../../Index";
import "./Profile.css";
import { ProfileSchema } from "../../../../validation/FormikValidation";
import PagesIndex from "../../../PagesIndex";
import {
  adminEditProfile,
  adminProfile,
} from "../../../../redux-toolkit/slice/admin-slice/AdminServices";
import { useSelector } from "react-redux";

const Item = Index.styled(Index.Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function Profile() {
  // state for image upload
  const [image, setImage] = useState("");

  const dispatch = PagesIndex.useDispatch();

  const { adminLoginData } = useSelector((state) => state.admin.AdminSlice);

  // initial values
  const initialValues = {
    fullName: adminLoginData ? adminLoginData.name : "",
    email: adminLoginData ? adminLoginData.email : "",
    mobileNumber: adminLoginData ? adminLoginData.mobileNumber : "",
    image: adminLoginData ? adminLoginData.image : "",
  };
  // update admin  profile handler
  const handleProfileSubmit = async (values) => {
    const urlEncoded = new FormData();
    urlEncoded.append("name", values.fullName);
    urlEncoded.append("email", values.email);
    urlEncoded.append("mobileNumber", values.mobileNumber);
    urlEncoded.append("profile", image);
    dispatch(adminEditProfile(urlEncoded)).then(() => {
      dispatch(adminProfile());
    });
  };
  return (
    <PagesIndex.Formik
      initialValues={initialValues}
      validationSchema={ProfileSchema}
      onSubmit={handleProfileSubmit}
    >
      {({
        values,
        setFieldValue,
        errors,
        touched,
        handleChange,
        handleBlur,
        onChange,
        handleSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <Index.Box className="p-15 background-ed profile-content flex-center ">
            <Index.Box className=" h-100">
              <Index.Box className="card-center">
                <Index.Box className="card-main profile-card-main">
                  <Index.Box className="title-main mb-15">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="page-title"
                    >
                      Update Profile
                    </Index.Typography>
                  </Index.Box>
                  <Index.Box className="profile-image text-center mb-20">
                    <Index.Box className="profile_img_wrap">
                      <img
                        src={
                          image
                            ? URL.createObjectURL(image)
                            : adminLoginData?.image
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${adminLoginData?.image}`
                            : PagesIndex?.Png?.user
                        }
                        alt="user-profile"
                      />
                    </Index.Box>
                    <Index.Box className="flex-center">
                      <Index.Box className="common-button grey-button change-profile">
                        <Index.Button variant="contained" type="button">
                          Change Profile
                        </Index.Button>
                        <input
                          type="file"
                          className="change-profile-input"
                          accept="image/*"
                          name="image"
                          onChange={(event) => {
                            setImage(event.currentTarget.files[0]);
                          }}
                        />
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="profile-inner">
                    <Index.Box className="">
                      <Index.Grid
                        container
                        columnSpacing={{ xs: 3.75, sm: 3.75, md: 3.75 }}
                      >
                        <Index.Grid item xs={12}>
                          <Item className="dashboard-item">
                            <Index.Box>
                              <Index.Typography
                                variant="label"
                                component="label"
                                className="change-input-label"
                              >
                                Full Name
                              </Index.Typography>
                              <Index.Box className="input-design-div with-border mb-15">
                                <Index.TextField
                                  hiddenLabel
                                  id="filled-hidden-label-normal"
                                  placeholder=""
                                  variant="filled"
                                  className="admin-input-design input-placeholder"
                                  //   defaultvalue={"barge@admin.com"}
                                  name="fullName"
                                  onBlur={handleBlur}
                                  value={values.fullName}
                                  onChange={handleChange}
                                  helperText={
                                    touched.fullName && errors.fullName
                                  }
                                  error={Boolean(
                                    errors.fullName && touched.fullName
                                  )}
                                />
                              </Index.Box>
                            </Index.Box>
                          </Item>
                        </Index.Grid>
                        {/* <Index.Grid item xs={12} sm={6} md={12} lg={6}>
                          <Item className="dashboard-item">
                            <Index.Box>
                              <Index.Typography
                                variant="label"
                                component="label"
                                className="input-label"
                              >
                                Last Name
                              </Index.Typography>
                              <Index.Box className="input-design-div with-border mb-15">
                                <Index.TextField
                                  hiddenLabel
                                  id="filled-hidden-label-normal"
                                  placeholder=""
                                  variant="filled"
                                  className="admin-input-design input-placeholder"
                                  //   defaultvalue={"barge@admin.com"}
                                  name="lastName"
                                  onBlur={handleBlur}
                                  value={values.lastName}
                                  onChange={handleChange}
                                  helperText={
                                    touched.lastName && errors.lastName
                                  }
                                  error={Boolean(
                                    errors.lastName && touched.lastName
                                  )}
                                />
                              </Index.Box>
                            </Index.Box>
                          </Item>
                        </Index.Grid> */}
                        <Index.Grid item xs={12} sm={6} md={12} lg={6}>
                          <Item className="dashboard-item">
                            <Index.Box>
                              <Index.Typography
                                variant="label"
                                component="label"
                                className="input-label"
                              >
                                Email
                              </Index.Typography>
                              <Index.Box className="input-design-div with-border mb-15">
                                <Index.TextField
                                  hiddenLabel
                                  id="filled-hidden-label-normal"
                                  placeholder=""
                                  variant="filled"
                                  className="admin-input-design input-placeholder"
                                  name="email"
                                  onBlur={handleBlur}
                                  value={values.email}
                                  onChange={handleChange}
                                  helperText={touched.email && errors.email}
                                  error={Boolean(errors.email && touched.email)}
                                />
                              </Index.Box>
                            </Index.Box>
                          </Item>
                        </Index.Grid>
                        <Index.Grid item xs={12} sm={6} md={12} lg={6}>
                          <Item className="dashboard-item">
                            <Index.Box>
                              <Index.Typography
                                variant="label"
                                component="label"
                                className="input-label"
                              >
                                Phone Number
                              </Index.Typography>
                              <Index.Box className="input-design-div with-border mb-15">
                                <Index.TextField
                                  hiddenLabel
                                  id="filled-hidden-label-normal"
                                  placeholder=""
                                  variant="filled"
                                  className="admin-input-design input-placeholder"
                                  name="mobileNumber"
                                  onBlur={handleBlur}
                                  value={values.mobileNumber}
                                  onChange={handleChange}
                                  helperText={
                                    touched.mobileNumber && errors.mobileNumber
                                  }
                                  error={Boolean(
                                    errors.mobileNumber && touched.mobileNumber
                                  )}
                                />
                              </Index.Box>
                            </Index.Box>
                          </Item>
                        </Index.Grid>
                        {/* <Index.Grid item xs={12}>
                          <Index.Box className="set-text-area mb-20">
                            <Index.Typography
                              variant="label"
                              component="label"
                              className="input-label"
                            >
                              Address
                            </Index.Typography>
                            <Index.Box className="set-textarea-box-top">
                              <Index.TextField
                                className="set-textarea-box"
                                aria-label="empty textarea"
                                placeholder=""
                                multiline
                                name="address"
                                onBlur={handleBlur}
                                value={values.address}
                                onChange={handleChange}
                                helperText={touched.address && errors.address}
                                error={Boolean(
                                  errors.address && touched.address
                                )}
                              />
                            </Index.Box>
                          </Index.Box>
                        </Index.Grid> */}
                      </Index.Grid>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="common-button blue-button change-password-btn update_priofile_btn">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      type="submit"
                    >
                      Update Profile
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </form>
      )}
    </PagesIndex.Formik>
  );
}

export default Profile;
