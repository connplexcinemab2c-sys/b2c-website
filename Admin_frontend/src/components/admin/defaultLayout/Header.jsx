import React, { useEffect, useRef, useState } from "react";
// import Index from "../../Index";
import { Link } from "react-router-dom";
import Index from "../../../container/Index";
import PagesIndex from "../../../container/PagesIndex";
import { adminLogout } from "../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { adminProfile } from "../../../redux-toolkit/slice/admin-slice/AdminServices";
import { Form } from "formik";

// import { useDispatch } from "react-redux";
// import { adminLogout } from "../../../redux/admin/action";
// const preventDefault = (event) => event.preventDefault();
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
};

function Header({
  setOpen,
  open,
  anchorEl,
  handleClose2,
  open2,
  handleClick2,
}) {
  // Vista dropdown state
  const [vistaAnchorEl, setVistaAnchorEl] = React.useState(null);
  const vistaOpen = Boolean(vistaAnchorEl);
  const handleVistaClick = (event) => {
    setVistaAnchorEl(event.currentTarget);
  };
  const handleVistaClose = () => {
    setVistaAnchorEl(null);
  };
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  //   document.body.classList["add"]("menu-set-main");
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  //   document.body.classList["remove"]("menu-set-main");
  // };

  // const [openSidebar, setOpenSidebar] = useState(true);

  // const handleSidebarToogle = () => {
  //   setOpenSidebar(!openSidebar);
  // };
  // const dispatch = useDispatch();
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [generalDetails, setGeneralDetails] = useState({});

  const initialValues = {
    facebook: generalDetails?.facebookUrl || "",
    twitter: generalDetails?.twitterUrl || "",
    instagram: generalDetails?.instagramUrl || "",
    youtube: generalDetails?.youtubeUrl || "",
    linkedin: generalDetails?.linkedInUrl || "",
    companyName: generalDetails?.companyName ? generalDetails?.companyName : "",
    address: generalDetails?.address1 ? generalDetails?.address1 : "",
    contact1: generalDetails?.contactNumber1
      ? generalDetails?.contactNumber1
      : "",
    contact2: generalDetails?.contactNumber2
      ? generalDetails?.contactNumber2
      : "",
    email: generalDetails?.email ? generalDetails?.email : "",
    exp: generalDetails?.yearOfExperience
      ? generalDetails?.yearOfExperience
      : "",
    noOfScreens: generalDetails?.noOfTheaterScreen
      ? generalDetails?.noOfTheaterScreen
      : "",
    underMaintenance: generalDetails?.underMaintenance,
    isWelcomeGift: generalDetails?.isWelcomeGift,
    ticketsRequired: generalDetails?.ticketsRequired,
  };

  useEffect(() => {
    dispatch(adminProfile()).then((res) => {
      if (res?.payload?.message === "jwt expired") {
        PagesIndex.toast.error("Session expired");
        handlelogout();
      }
    });
  }, []);
  useEffect(() => {
    if (openSettingsModal) {
      getGeneralSettings();
    }
  }, [openSettingsModal]);
  const handlelogout = () => {
    dispatch(adminLogout());
    localStorage.removeItem("token");
    navigate("/");
    PagesIndex.toast.success("Admin Logged out successfully");
  };
  const handleOpenSettingsModal = () => {
    setOpenSettingsModal(true);
  };
  const handleCloseSettingsModal = () => {
    setOpenSettingsModal(false);
  };
  const getGeneralSettings = async () => {
    await PagesIndex.DataService.get(PagesIndex.Api.GET_GENERAL_SETTINGS)
      .then((res) => {
        setGeneralDetails(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };
  const handleSettingsSubmit = async (values) => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append("facebookUrl", values?.facebook);
    urlEncoded.append("twitterUrl", values?.twitter);
    urlEncoded.append("instagramUrl", values?.instagram);
    urlEncoded.append("youtubeUrl", values?.youtube);
    urlEncoded.append("linkedInUrl", values?.linkedin);
    urlEncoded.append("companyName", values?.companyName);
    urlEncoded.append("address1", values?.address);
    urlEncoded.append("contactNumber1", values?.contact1);
    urlEncoded.append("contactNumber2", values?.contact2);
    urlEncoded.append("email", values?.email);
    urlEncoded.append("yearOfExperience", values?.exp);
    urlEncoded.append("noOfTheaterScreen", values?.noOfScreens);
    urlEncoded.append("underMaintenance", values?.underMaintenance);
    urlEncoded.append("isWelcomeGift", values?.isWelcomeGift);
    urlEncoded.append("ticketsRequired", values?.ticketsRequired);

    await PagesIndex.DataService.post(
      PagesIndex.Api.ADD_GENERAL_SETTINGS,
      urlEncoded
    )
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleCloseSettingsModal();
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
      });
  };

  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );

  return (
    <div>
      <header>
        <Index.Box className={`main-header ${!open ? "" : "side-bar"}`}>
          <Index.Box className="admin-header-left">
            <Index.Box
              className="collapse-btn"
              onClick={() => setOpen((e) => !e)}
            >
              <img src={PagesIndex?.Svg?.collapse} />
            </Index.Box>
            {/* <Index.Box className="head-left" sx={{ ml: 2 }}>
              <Index.Button
                id="vista-menu-button"
                aria-controls={vistaOpen ? "vista-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={vistaOpen ? "true" : undefined}
                onClick={handleVistaClick}
                className="vista-header-btn"
                sx={{
                  color: "#333",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                }}
              >
                <Index.DvrIcon sx={{ mr: 1, fontSize: 20 }} />
                Vista
                {vistaOpen ? (
                  <Index.ExpandLess sx={{ ml: 0.5 }} />
                ) : (
                  <Index.ExpandMore sx={{ ml: 0.5 }} />
                )}
              </Index.Button>
              <Index.Menu
                id="vista-menu"
                anchorEl={vistaAnchorEl}
                open={vistaOpen}
                onClose={handleVistaClose}
                MenuListProps={{
                  "aria-labelledby": "vista-menu-button",
                }}
              >
                <Link to="/admin/vista-dash" style={{ textDecoration: "none", color: "inherit" }}>
                  <Index.MenuItem onClick={handleVistaClose}>
                    <Index.DashboardIcon sx={{ mr: 1, fontSize: 18 }} />
                    Vista Dashboard
                  </Index.MenuItem>
                </Link>
                <Link to="/admin/vista-movies" style={{ textDecoration: "none", color: "inherit" }}>
                  <Index.MenuItem onClick={handleVistaClose}>
                    <Index.MovieIcon sx={{ mr: 1, fontSize: 18 }} />
                    Vista Movies
                  </Index.MenuItem>
                </Link>
                <Link to="/admin/vista-shows" style={{ textDecoration: "none", color: "inherit" }}>
                  <Index.MenuItem onClick={handleVistaClose}>
                    <Index.LocalActivityIcon sx={{ mr: 1, fontSize: 18 }} />
                    Vista Shows
                  </Index.MenuItem>
                </Link>
              </Index.Menu>
            </Index.Box> */}
          </Index.Box>
          <Index.Box className="admin-header-right">
            {/* <Index.Button className="admin-header-btn">
              <img src={PagesIndex.Svg.bell} className="bell-icon" />
            </Index.Button> */}
            <Index.Button
              className="admin-header-btn"
              onClick={handleOpenSettingsModal}
            >
              <img src={PagesIndex.Svg.settings} className="search-icon" />
            </Index.Button>
            <Index.Box className="admin-header-drop-main">
              <Index.Button
                className="drop-header-btn"
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick2}
              >
                <Index.Box className="head-right">
                  <Index.Box className="header-user-detail">
                    <Index.Typography variant="p" className="head-user-title">
                      {adminLoginData?.name}
                    </Index.Typography>
                    <Index.Typography variant="p" className="head-user-mail">
                      {adminLoginData?.email}
                    </Index.Typography>
                  </Index.Box>
                  <img
                    src={
                      adminLoginData?.image
                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${adminLoginData?.image}`
                        : PagesIndex?.Png?.user
                    }
                    className="headprofile"
                    alt=""
                  />
                </Index.Box>
              </Index.Button>
            </Index.Box>
            <Index.Menu
              className="drop-header-menu admin-header-profile-ul"
              id="basic-menu"
              anchorEl={anchorEl}
              open={open2}
              onClose={handleClose2}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <Link to="/admin/profile">
                <Index.MenuItem
                  onClick={() => {
                    handleClose2();
                  }}
                  className="drop-header-menuitem"
                >
                  Profile
                </Index.MenuItem>
              </Link>
              <Link to="/admin/change-password">
                <Index.MenuItem
                  onClick={handleClose2}
                  className="drop-header-menuitem"
                >
                  {" "}
                  Change Password
                </Index.MenuItem>
              </Link>
              <Index.MenuItem
                onClick={() => {
                  handleClose2();
                  handlelogout();
                }}
                className="drop-header-menuitem logout-profile"
              >
                Logout
              </Index.MenuItem>
            </Index.Menu>
          </Index.Box>
        </Index.Box>
      </header>
      <Index.Modal
        open={openSettingsModal}
        onClose={handleCloseSettingsModal}
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
              className="modal-title"
              variant="h6"
              component="h2"
            >
              General Settings
            </Index.Typography>
            <img
              src={PagesIndex.Svg.cancel}
              className="modal-close-icon"
              onClick={() => {
                setOpenSettingsModal(false);
              }}
            />
          </Index.Box>

          <Index.Box className="modal-body">
            <PagesIndex.Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={PagesIndex.generalSettingSchema}
              onSubmit={handleSettingsSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                handleBlur,
                setFieldTouched,
                setFieldValue,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Facebook
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="facebook"
                        className="form-control"
                        placeholder="Enter facebook link"
                        value={values?.facebook}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          errors?.facebook && touched?.facebook ? true : false
                        }
                        helperText={
                          errors?.facebook && touched?.facebook
                            ? errors?.facebook
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Twitter
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="twitter"
                        className="form-control"
                        placeholder="Enter twitter link"
                        value={values?.twitter}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          errors?.twitter && touched?.twitter ? true : false
                        }
                        helperText={
                          errors.twitter && touched.twitter
                            ? errors.twitter
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Instagram
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="instagram"
                        className="form-control"
                        placeholder="Enter instagram link"
                        value={values?.instagram}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          errors.instagram && touched.instagram ? true : false
                        }
                        helperText={
                          errors.instagram && touched.instagram
                            ? errors.instagram
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      YouTube
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="youtube"
                        className="form-control"
                        placeholder="Enter youtube link"
                        value={values?.youtube}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.youtube && touched.youtube ? true : false}
                        helperText={
                          errors.youtube && touched.youtube
                            ? errors.youtube
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      LinkedIn
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="linkedin"
                        className="form-control"
                        placeholder="Enter linkedin link"
                        value={values?.linkedin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          errors.linkedin && touched.linkedin ? true : false
                        }
                        helperText={
                          errors.linkedin && touched.linkedin
                            ? errors.linkedin
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Contact 1
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="contact1"
                        className="form-control"
                        placeholder="Enter contact number"
                        inputProps={{ maxLength: 10 }}
                        value={values?.contact1}
                        // onChange={(e) => {

                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        error={
                          errors.contact1 && touched.contact1 ? true : false
                        }
                        helperText={
                          errors.contact1 && touched.contact1
                            ? errors.contact1
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Contact 2
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="contact2"
                        className="form-control"
                        placeholder="Enter contact number"
                        inputProps={{ maxLength: 10 }}
                        value={values?.contact2}
                        // onChange={(e) => {
                        //   // setFieldTouched("contact2");
                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        // error={
                        //   errors.contact2 && touched.contact2 ? true : false
                        // }
                        // helperText={
                        //   errors.contact2 && touched.contact2
                        //     ? errors.contact2
                        //     : null
                        // }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Email
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={values?.email}
                        inputProps={{ maxLength: 320 }}
                        // onChange={(e) => {
                        //   // setFieldTouched("email");
                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        error={errors.email && touched.email ? true : false}
                        helperText={
                          errors.email && touched.email ? errors.email : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Company Name
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="companyName"
                        className="form-control"
                        placeholder="Enter company name"
                        value={values?.companyName}
                        inputProps={{ maxLength: 50 }}
                        // onChange={(e) => {
                        //   // setFieldTouched("companyName");
                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        error={
                          errors.companyName && touched.companyName
                            ? true
                            : false
                        }
                        helperText={
                          errors.companyName && touched.companyName
                            ? errors.companyName
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Address
                    </Index.FormHelperText>
                    <Index.Box className="form-group d-flex-textarea">
                      <Index.TextareaAutosize
                        fullWidth
                        className="form-control form-text-area"
                        minRows={3}
                        name="address"
                        placeholder="Enter address"
                        value={values?.address}
                        onChange={handleChange}
                        // error={errors.address && touched.address ? true : false}
                      />
                    </Index.Box>
                    <Index.FormHelperText error>
                      {errors.address && touched.address
                        ? errors.address
                        : null}
                    </Index.FormHelperText>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      Years of experience
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="exp"
                        className="form-control"
                        placeholder="Enter years of experience"
                        value={values?.exp}
                        inputProps={{ maxLength: 5 }}
                        // onChange={(e) => {
                        //   // setFieldTouched("exp");
                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        error={errors.exp && touched.exp ? true : false}
                        helperText={
                          errors.exp && touched.exp ? errors.exp : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="input-box modal-input-box">
                    <Index.FormHelperText className="form-lable">
                      No of theater screens
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.TextField
                        fullWidth
                        name="noOfScreens"
                        className="form-control"
                        placeholder="Enter no of theater screens"
                        value={values?.noOfScreens}
                        // onChange={(e) => {
                        //   // setFieldTouched("noOfScreens");
                        //   handleChange(e);
                        // }}
                        onChange={handleChange}
                        error={
                          errors.noOfScreens && touched.noOfScreens
                            ? true
                            : false
                        }
                        helperText={
                          errors.noOfScreens && touched.noOfScreens
                            ? errors.noOfScreens
                            : null
                        }
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box
                    className="input-box modal-input-box"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Index.FormHelperText className="form-lable">
                      Site Under Maintenance:
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Switch
                        checked={values?.underMaintenance || false}
                        onChange={(e) => {
                          setFieldValue("underMaintenance", e.target.checked);
                        }}
                        name="underMaintenance"
                        color="primary"
                      />
                    </Index.Box>
                  </Index.Box>
                  <Index.Box
                    className="input-box modal-input-box"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Index.FormHelperText className="form-lable">
                      Welcome Gift:
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Switch
                        checked={values?.isWelcomeGift || false}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            setFieldValue("ticketsRequired", "");
                          } else {
                            setFieldValue("ticketsRequired", 1);
                          }
                          setFieldValue("isWelcomeGift", e.target.checked);
                        }}
                        name="isWelcomeGift"
                        color="primary"
                      />
                    </Index.Box>
                  </Index.Box>
                  {values?.isWelcomeGift && (
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Required Tickets
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          name="ticketsRequired"
                          className="form-control"
                          placeholder="Enter required tickets"
                          value={values?.ticketsRequired}
                          inputProps={{ maxLength: 2 }}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(
                              /\D/g,
                              ""
                            );
                            setFieldValue("ticketsRequired", onlyNumbers);
                          }}
                          // onChange={handleChange}
                          error={
                            errors.ticketsRequired && touched.ticketsRequired
                              ? true
                              : false
                          }
                          helperText={
                            errors.ticketsRequired && touched.ticketsRequired
                              ? errors.ticketsRequired
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                  )}

                  <Index.Box className="modal-user-btn-flex">
                    <Index.Box className="discard-btn-main btn-main-primary">
                      <Index.Box className="common-button blue-button res-blue-button">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={handleCloseSettingsModal}
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
                            alt="save-btn"
                          />
                          Save
                        </Index.Button>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </form>
              )}
            </PagesIndex.Formik>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </div>
  );
}

export default Header;
