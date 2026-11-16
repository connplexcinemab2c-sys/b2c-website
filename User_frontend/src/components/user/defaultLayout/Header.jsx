import React, { useEffect, useState } from "react";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import LogoNew from "../../../assets/images/png/logoNew.png";
import { autoDetectNearestRegion } from "../../../utils/locationHelper";

function Header() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();
  const regionId = new URLSearchParams(location.search).get("rId");

  const { isLoggedIn, region, userToken, userDetails } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );
  const [selectedRegion, setSelectedRegion] = useState({});
  const [open, setOpen] = useState(false);
  const [searchOptionId, setSearchOptionId] = useState("");
  const [toggle, setToggle] = useState(false);
  const [selectCity, setSelectCity] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [regionList, setRegionList] = useState([]);
  const [filteredRegionList, setFilteredRegionList] = useState([]);
  const openMenu = Boolean(anchorEl);
  const handleChangedropdown = (data, isManual = false) => {
    setSelectedRegion(data);
    dispatch(PagesIndex.changeRegion(data));
    if (isManual) {
      sessionStorage.setItem("connplex_manual_city_selected", "true");
    }
    changeCityClose();
  };
  const handleOpen = (id) => {
    setOpen(true);
    setSearchOptionId(id);
  };

  console.log(searchOptionId, ":searchOptionId");
  const handleClose = () => setOpen(false);
  const signInOpen = () => {
    setToggle(true);
    handleMenuClose();
  };
  const signInClose = () => {
    setToggle(false);
  };
  const handleMenuClick = (event) => {
    if (isLoggedIn) {
      setAnchorEl(event.currentTarget);
    } else {
      signInOpen();
    }
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    window.scroll(0, 0);
  };
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoDetectLocation = async (
    availableRegions = regionList,
    isAutoInitial = false
  ) => {
    setIsLocating(true);
    const targetList =
      availableRegions && availableRegions.length > 0
        ? availableRegions
        : regionList;

    const result = await autoDetectNearestRegion(
      targetList,
      PagesIndex.apiGetHandler,
      PagesIndex.Api
    );

    setIsLocating(false);

    if (result.success && result.region) {
      sessionStorage.removeItem("connplex_manual_city_selected");
      handleChangedropdown(result.region, false);
      if (!isAutoInitial) {
        const distStr = result.distanceKm ? ` (~${result.distanceKm} km away)` : "";
        PagesIndex.toast.success(
          `📍 Nearest location selected: ${result.region.region}${distStr}`
        );
      }
      changeCityClose();
    } else {
      if (isAutoInitial) {
        if (!region?._id && targetList.length > 0) {
          handleChangedropdown(targetList[0], false);
        }
        changeCityClose();
      } else {
        if (result.code === "PERMISSION_DENIED") {
          PagesIndex.toast.error(
            "Location access denied. Please select your city manually below."
          );
        } else {
          PagesIndex.toast.error(
            result.message || "Failed to detect nearest location. Please choose manually."
          );
        }
      }
    }
  };

  const getRegionList = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_REGION).then((res) => {
      if (res?.status === 200) {
        const fetchedRegions = res?.data || [];
        setRegionList(fetchedRegions);
        setFilteredRegionList(fetchedRegions);

        const isManuallySelected =
          sessionStorage.getItem("connplex_manual_city_selected") === "true";

        if (regionId) {
          const regionData = fetchedRegions.find((data) => data?._id === regionId);
          if (regionData) {
            setSelectedRegion(regionData);
            dispatch(PagesIndex.changeRegion(regionData));
          } else {
            handleAutoDetectLocation(fetchedRegions, true);
          }
        } else if (isManuallySelected && region?._id) {
          const regionData = fetchedRegions.find((data) => data?._id === region._id);
          if (regionData) {
            setSelectedRegion(regionData);
            dispatch(PagesIndex.changeRegion(regionData));
          } else {
            handleAutoDetectLocation(fetchedRegions, true);
          }
        } else {
          // On website open: automatically fetch nearest location!
          if (!region?._id && fetchedRegions.length > 0) {
            setSelectedRegion(fetchedRegions[0]);
            dispatch(PagesIndex.changeRegion(fetchedRegions[0]));
          }
          handleAutoDetectLocation(fetchedRegions, true);
        }
      }
      dispatch(PagesIndex.hideLoader());
    });
  };
  const changeCityOpen = () => {
    setSelectCity(true);
    setFilteredRegionList(regionList);
  };
  const changeCityClose = () => setSelectCity(false);

  useEffect(() => {
    setSelectCity(false);
  }, []);

  const pageOpened = () => {
    getRegionList();
  };

  const [scroll, setScroll] = useState(true);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY === 0);
    });
    getRegionList();
  }, []);
  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => {
        getUser();
      }, 800);
    }
  }, []);

  useEffect(() => {
    setSelectCity(false);
  }, [location?.pathname]);

  const [openFranchise, setOpenFranchise] = useState(false);
  const handleOpenFranchise = () => {
    setOpenFranchise(true);
  };
  const handleOpenFranchiseMobile = () => {
    setOpenFranchise(true);
    // mobileNav();
  };
  const handleCloseFranchise = () => setOpenFranchise(false);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNav = () => {
    if (!mobileNavOpen) {
      setMobileNavOpen(true);
      document.body.classList.add("mobile-nav-open");
    } else {
      setMobileNavOpen(false);
      document.body.classList.remove("mobile-nav-open");
    }
  };
  function getUser() {
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_USER + "?" + new Date().getTime(),
      "",
      userToken
    ).then((res) => {
      if (
        res?.message === "Session has expired" ||
        res?.message === "Token not authorized"
      ) {
        dispatch(PagesIndex.userLogOut());
        setSelectedRegion("");
        navigate("/");
        PagesIndex.toast.error("Session has expired");
      }
    });
  }
  const onSearchRegion = (e) => {
    const filteredRegionList = regionList.filter((data) =>
      data?.region.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredRegionList(filteredRegionList);
  };

  return (
    <Index.Box
      className={
        !scroll
          ? mobileNavOpen
            ? "main-header mui-fixed is-sticky mobile-nav-open"
            : "main-header mui-fixed is-sticky"
          : "main-header mui-fixed"
      }
    >
      <Index.Box className="cus-container">
        <Index.Box className="top-head">
          <Index.Box className="top-logo">
            <Index.Link to="/">
              <img
                src={LogoNew}
                width="300"
                height="69"
                className="head-logo"
                alt="Company Logo"
              />
            </Index.Link>
          </Index.Box>
          <Index.Box className="top-link">
            <Index.Box className="any-options">
              <Index.Box
                className="header-search-icon"
                onClick={() => handleOpen(1)}
              >
                <Index.SearchIcon />
              </Index.Box>
              <Index.Box
                className="any-options-text"
                onClick={() => handleOpen(1)}
              >
                AnyWhere
              </Index.Box>
              {/* <Index.Box
                className="any-options-text"
                onClick={() => handleOpen(2)}
              >
                AnyWeek
              </Index.Box> */}
              <Index.Box
                className="any-options-text"
                onClick={() => handleOpen(3)}
              >
                AnyMovie
              </Index.Box>
              <Index.Box
                className="any-options-text"
                onClick={() => handleOpen(4)}
              >
                AnyOffer
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="header-action">
            <Index.Box onClick={handleOpen} className="header-search-icon">
              <Index.SearchIcon />
            </Index.Box>
            {/* {!(location.pathname === "/add-snacks") && ( */}
            {
              <Index.Box className="main-city-select" onClick={changeCityOpen}>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="select-icon map"
                >
                  <Index.LocationOnIcon />
                </Index.Typography>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="city-name"
                >
                  {region && region?.region
                    ? region?.region
                    : selectedRegion?.region
                    ? selectedRegion?.region
                    : "Select your current location"}
                </Index.Typography>
                <Index.Typography
                  variant="span"
                  component="span"
                  className="select-icon arrow"
                >
                  <Index.ArrowDropDownIcon />
                </Index.Typography>
              </Index.Box>
            }
            <Index.Box className="user-profile-head" onClick={handleMenuClick}>
                <img
                  src={PagesIndex.Png.profile_img}
                  width="34"
                  height="34"
                  alt="profile"
                />
              
            </Index.Box>
            <Index.Menu
              className="user-profile-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
            >
              <Index.MenuItem
                onClick={() => {
                  navigate("/account", { state: { tab: 0 } });
                  handleMenuClose();
                }}
                className="user-profile-menuitem"
              >
                <Index.PersonIcon /> My Account
              </Index.MenuItem>
              {/* <Index.MenuItem
                onClick={() => {
                  navigate("/");
                  handleMenuClose();
                }}
                className="user-profile-menuitem"
              >
                <Index.Favorite /> My Wishlist
              </Index.MenuItem> */}
              {/* <Index.MenuItem
                onClick={() => {
                  navigate("/");
                  handleMenuClose();
                }}
                className="user-profile-menuitem"
              >
                <Index.NotificationsIcon /> Notifications
              </Index.MenuItem> */}
              {/* <Index.MenuItem
                onClick={handleMenuClose}
                className="user-profile-menuitem"
              >
                <Index.PrivacyTipIcon /> Help & Support
              </Index.MenuItem> */}
              <Index.MenuItem
                onClick={() => {
                  handleMenuClose();
                  dispatch(PagesIndex.userLogOut());
                  PagesIndex.toast.success("Logged out successfully");
                  navigate("/");
                }}
                className="user-profile-menuitem"
              >
                <Index.ExitToAppIcon /> Sign Out
              </Index.MenuItem>
            </Index.Menu>
            <Index.Box className={`mobile-navigation ${!scroll ? "show" : ""}`}>
              <Index.Box
                className={
                  mobileNavOpen ? "mobile-nav-btn open" : "mobile-nav-btn"
                }
                onClick={mobileNav}
              >
                <Index.MenuIcon />
              </Index.Box>
              <Index.Box
                className={
                  mobileNavOpen ? "mobile-nav-box open" : "mobile-nav-box"
                }
              >
                <Index.Box className="mobile-nav-header">
                  <Index.Link
                    to="/"
                    className="mobile-nav-logo"
                    onClick={mobileNav}
                  >
                    <img
                      src={LogoNew}
                      width="300"
                      height="69"
                      className="head-logo"
                      alt="Company Logo"
                    />
                  </Index.Link>
                  <Index.Typography
                    variant="span"
                    component="span"
                    className="mobile-nav-close"
                    onClick={mobileNav}
                  >
                    X
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="mobile-nav-body">
                  <ul className="cus-scrollbar">
                    <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/"
                        className="mobile-nav-link"
                      >
                        Home
                      </Index.Link>
                    </li>
                    <li>
                      <Index.Typography
                        variant="span"
                        component="span"
                        onClick={handleOpenFranchiseMobile}
                        className="mobile-nav-link"
                      >
                        Apply For Franchise
                      </Index.Typography>
                    </li>
                    <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/cinema"
                        className="mobile-nav-link"
                      >
                        Cinemas
                      </Index.Link>
                    </li>
                    <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/gallery"
                        className="mobile-nav-link"
                      >
                        Gallery
                      </Index.Link>
                    </li>
                    {/* <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/membership"
                        className="mobile-nav-link"
                      >
                        Membership
                      </Index.Link>
                    </li> */}
                    <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/calender"
                        className="mobile-nav-link"
                      >
                        Calendar
                      </Index.Link>
                    </li>
                    {/* <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/ecommerce"
                        className="mobile-nav-link"
                      >
                        Ecommerce
                      </Index.Link>
                    </li> */}
                    <li>
                      <Index.Link
                        onClick={mobileNav}
                        to="/about"
                        className="mobile-nav-link"
                      >
                        About Connplex
                      </Index.Link>
                    </li>
                  </ul>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      {scroll !== false && (
        <Index.Box className="btm-head">
          <Index.Box className="head-btm-links">
            <ul>
              <li>
                <Index.Typography
                  variant="span"
                  component="span"
                  onClick={handleOpenFranchise}
                >
                  Apply For Franchise
                </Index.Typography>
              </li>
              <li>
                <Index.Link to="/cinema">Cinemas</Index.Link>
              </li>
              <li>
                <Index.Link to="/gallery">Gallery</Index.Link>
              </li>
              {/* <li>
                <Index.Link to="/membership">Membership</Index.Link>
              </li> */}
              <li>
                <Index.Link to="/calender">Calendar</Index.Link>
              </li>
              {/* <li>
                <Index.Link to="/ecommerce">Ecommerce</Index.Link>
              </li> */}
              <li>
                <Index.Link to="/about">About Connplex</Index.Link>
              </li>
            </ul>
          </Index.Box>
        </Index.Box>
      )}
      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
        className="search-modal"
      >
        <PagesIndex.SearchModal
          handleClose={handleClose}
          optionId={searchOptionId}
          setSearchOptionId={setSearchOptionId}
        />
      </Index.Modal>
      <Index.Modal
        open={toggle}
        onClose={signInClose}
        aria-labelledby="signin-modal-title"
        aria-describedby="signin-modal-description"
        className="signin-modal"
      >
        <PagesIndex.Login signInClose={signInClose} toggle={toggle} />
      </Index.Modal>
      <Index.Modal
        open={selectCity}
        onClose={changeCityClose}
        aria-labelledby="select-city-modal-title"
        aria-describedby="select-city-modal-description"
        className="select-city-modal"
      >
        <Index.Box className="select-city-modal-inner">
          <Index.Box className="modal-inner cus-scrollbar">
            <Index.Box className="popular-city-box">
              <Index.Box className="popular-city-header">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="popular-city-title"
                >
                  Select City
                </Index.Typography>
                <Index.Box className="city-input-box">
                  <Index.Input
                    autoFocus
                    className="city-input"
                    placeholder="Search City"
                    onChange={onSearchRegion}
                  />
                  <Index.Box className="svg-box">
                    {/* <PagesIndex.Loader secondary /> */}
                    <Index.SearchIcon />
                  </Index.Box>
                </Index.Box>
              </Index.Box>
              {/* Auto-detect Location Button */}
              <Index.Box
                className={`auto-detect-location-bar ${isLocating ? "locating" : ""}`}
                onClick={() =>
                  !isLocating && handleAutoDetectLocation(regionList, false)
                }
                role="button"
                tabIndex={0}
              >
                <Index.Box className="auto-detect-icon-box">
                  <Index.MyLocationIcon
                    className={`auto-detect-icon ${isLocating ? "detect-spin" : ""}`}
                  />
                </Index.Box>
                <Index.Box className="auto-detect-content">
                  <Index.Typography className="auto-detect-text">
                    {isLocating
                      ? "Detecting Nearest Location..."
                      : "Auto-detect My Location"}
                  </Index.Typography>
                  <Index.Typography className="auto-detect-desc">
                    {isLocating
                      ? "Finding the closest cinema to your current GPS position..."
                      : "Use current GPS location to find nearest cinema"}
                  </Index.Typography>
                </Index.Box>
                {isLocating && (
                  <Index.Box className="auto-detect-spinner" />
                )}
              </Index.Box>

              <Index.Box className="popular-city-divider">
                <span>OR SELECT MANUALLY</span>
              </Index.Box>
              <Index.Box className="popular-city-wrapper-main cus-scrollbar">
                <Index.Box className="popular-city-wrapper">
                  {filteredRegionList.length ? (
                    filteredRegionList.map((item, key) => (
                      <Index.Box
                        key={key}
                        className={`popular-city-item ${
                          selectedRegion?._id === item._id ? "active" : ""
                        }`}
                        onClick={() => handleChangedropdown(item, true)}
                      >
                        <img
                          src={
                            item.image
                              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item.image}`
                              : PagesIndex.Png.NoImage
                          }
                          alt=""
                        />
                        <Index.Typography
                          variant="p"
                          component="p"
                          className="popular-city-name"
                        >
                          {item.region}
                        </Index.Typography>
                      </Index.Box>
                    ))
                  ) : (
                    <Index.Box className="no-found-img-box">
                      <img src={PagesIndex.Png.Theatre} alt="No Found" />
                      No City Available
                    </Index.Box>
                  )}
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
      <PagesIndex.FranchiseModal
        open={openFranchise}
        onClose={handleCloseFranchise}
      />
    </Index.Box>
  );
}

export default Header;
