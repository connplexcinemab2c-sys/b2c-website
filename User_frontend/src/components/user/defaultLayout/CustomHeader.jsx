import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Index from "../../Index";
import PagesIndex from "../../PagesIndex";
import {
  closeLocationModel,
  membershipPlanAction,
  openLocationModel,
} from "../../../redux/user/action";
import LogoNew from "../../../assets/images/png/logoNew.png";

function CustomHeader() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const location = PagesIndex.useLocation();
  const [searchParams] = useSearchParams();

  const movieId = searchParams.get("mId");
  const regionId = searchParams.get("rId");

  const {
    isLoggedIn,
    region,
    userToken,
    openLocation,
    userDetails,
    membershipPlan,
  } = PagesIndex.useSelector((state) => state.UserReducer);

  const [open, setOpen] = useState(false);
  const [searchOptionId, setSearchOptionId] = useState("");
  const [toggle, setToggle] = useState(false);
  const [selectCity, setSelectCity] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [regionList, setRegionList] = useState([]);
  const [filteredRegionList, setFilteredRegionList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlan, setActivePlan] = useState(null);
  const openMenu = Boolean(anchorEl);

  const hideCityDropdownLocation = ["/seat-management", "/add-snacks"];
  const handleChangedropdown = (data) => {
    dispatch(PagesIndex.changeRegion(data));

    // If we are in movie-details page and user change the city at the time re navigate to movie-details page with the change region id
    if (location?.pathname === "/movie-details") {
      dispatch(PagesIndex.showLoader());
      navigate({
        pathname: `/movie-details`,
        search: PagesIndex?.createSearchParams({
          mId: movieId,
          rId: data?._id,
        }).toString(),
      });
    }

    changeCityClose();
  };

  // Added to ensure that when region changes on movie-details page, the new region data reflects. On navigating back, previous region data is restored.
  useEffect(() => {
    if (regionId) {
      const findRegion = regionList?.find((item) => item?._id === regionId);
      dispatch(PagesIndex.changeRegion(findRegion));
    }
  }, [regionId]);

  const handleOpen = (id) => {
    setOpen(true);
    setSearchOptionId(id);
  };

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
    window.scroll(0, 0);
    setAnchorEl(null);
  };
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getGeoLocation, errorCallback);
    } else {
      PagesIndex.toast.error("Geo tagging not supported");
    }
  };
  function errorCallback(error) {
    if (error) {
      console.log(error, "GEOLOCATION DENIED");
      // PagesIndex.toast.error(error?.message);
    }
  }

  const getRegionList = () => {
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_REGION).then((res) => {
      if (res?.status === 200) {
        setRegionList(res?.data);
        setFilteredRegionList(res?.data);

        if (region) {
          const regionData = res.data?.find(
            (data) => data?._id === region?._id
          );
          if (!regionData?.region) {
            getLocation();
            changeCityOpen();
          }

          dispatch(PagesIndex.changeRegion(regionData));
        }
      } else if (res?.status === 400) {
        dispatch(PagesIndex.changeRegion([]));
      }

      dispatch(PagesIndex.hideLoader());
    });
  };

  const getGeoLocation = (position) => {
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_GEO_LOCATION,
      `${position.coords.latitude}/${position.coords.longitude}`
    ).then((res) => {
      if (res?.status === 200) {
        if (!regionId) {
          dispatch(PagesIndex.changeRegion(res?.data));
        }
      }
    });
  };
  const changeCityOpen = () => {
    setSelectCity(true);
  };
  const changeCityClose = () => {
    dispatch(closeLocationModel());
    setSelectCity(false);
  };

  useEffect(() => {
    if (region?.region) {
      changeCityClose();
    }
  }, [region]);

  const [scroll, setScroll] = useState(true);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY === 0);
    });
    getRegionList();
  }, []);
  useEffect(() => {
    if (userToken) {
      setTimeout(() => {
        getUser();
      }, 800);
    }
  }, [userToken]);

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
    )
      .then((res) => {
        if (
          res?.status == 401 ||
          res?.message === "Session has expired" ||
          res?.message === "Token not authorized"
        ) {
          dispatch(PagesIndex.userLogOut());
          navigate("/");
          PagesIndex.toast.error("Session has expired");
        } else if (res?.status == 200) {
          dispatch(PagesIndex.getUserData(res?.data));
        } else if (res?.status == 500) {
          dispatch(PagesIndex.userLogOut());
          navigate("/");
          PagesIndex.toast.error(res?.message);
        }
      })
      .catch((err) => {
        console.log(err, ":Error 207");
      });
  }
  const onSearchRegion = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchQuery(newValue);
    const filteredRegionList = regionList.filter((data) =>
      data?.region.toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredRegionList(filteredRegionList);
  };

  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      // Check if the user is scrolling
      if (window.scrollY > 0) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };
    // Add event listener for scroll event
    window.addEventListener("scroll", handleScroll);
    // Clean up function to remove event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [isSticky, setIsSticky] = useState(false);
  const [isOtherSticky, setIsOtherSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if the window has scrolled beyond a certain threshold for the first sticky class
      const threshold = 98; // Adjust this value as needed
      if (window.scrollY > threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      // Check if the window has scrolled beyond a different threshold for the second sticky class
      const otherThreshold = 95; // Adjust this value as needed
      if (window.scrollY > otherThreshold) {
        setIsOtherSticky(true);
      } else {
        setIsOtherSticky(false);
      }
    };

    // Attach scroll event listener when the component mounts
    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array to ensure the effect runs only once

  //

  useEffect(() => {
    window.addEventListener("load", pageOpened, false);

    return () => {
      window.addEventListener("load", pageOpened, false);
    };
  }, []);

  const pageOpened = () => {
    if (
      window.document.body.innerText.includes("Select your current location")
    ) {
      getLocation();
      changeCityOpen();
      setSelectCity(true);
    }
  };

  useEffect(() => {
    pageOpened();
  }, []);

  useEffect(() => {
    if (!region?.region) {
      if (toggle == false) {
        dispatch(openLocationModel());
      }
    }
  }, [location?.pathname]);

  const getMembershipList = () => {
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_MEMBERSHIP_TRANSACTION_LIST,
      "",
      userToken
    ).then((res) => {
      if (res?.status === 200) {
        const membership = res?.data?.find((data) => {
          return data?.isActive === true;
        });

        if (membership) {
          dispatch(membershipPlanAction(membership ?? null));
        } else {
          dispatch(membershipPlanAction(null));
        }
      } else {
        dispatch(membershipPlanAction(null));
      }
    });
  };

  useEffect(() => {
    if (userToken) {
      getMembershipList();
    }
  }, [userToken]);

  return (
    <>
      <Index.Box
        // className={
        //     !scroll
        //         ?mobileNavOpen
        //             ? "main-header mui-fixed is-sticky mobile-nav-open"
        //             : "main-header mui-fixed is-sticky"
        //         : "main-header mui-fixed"
        // }
        className={
          // !scroll
          `main-header mui-fixed
                    ${
                      mobileNavOpen
                        ? "main-header mui-fixed is-sticky mobile-nav-open"
                        : ""
                    }
                     ${isSticky ? "is-sticky" : ""} 
                     ${isOtherSticky ? "is-other-sticky" : ""}`
        }
        key={filteredRegionList}
      >
        <Index.Box className="cus-container pos-relative">
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
              <Index.Box
                onClick={() => handleOpen(1)}
                className="header-search-icon"
              >
                <Index.SearchIcon />
              </Index.Box>
              {/* {!(
              location.pathname === "/seat-management" ||
              location.pathname === "/add-snacks"
            ) && ( */}

              <Index.Box className="profile-right-slider">
                {!hideCityDropdownLocation.includes(location?.pathname) && (
                  <Index.Box
                    className="main-city-select"
                    onClick={changeCityOpen}
                  >
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
                      {region?.region
                        ? region?.region
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
                )}

                <Index.Box
                  className="profile-header-web"
                  // onClick={handleMenuClick}
                >
                  <Index.Box
                    className="user-profile-head"
                    onClick={handleMenuClick}
                  >
                    <Index.Box className="user-profile-img">
                      <img
                        // src={PagesIndex.Png.profile_img}
                        src={
                          userDetails?.profile
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${userDetails?.profile}`
                            : PagesIndex.Png.profile_img
                        }
                        width="34"
                        height="34"
                        alt="profile"
                      />
                      {membershipPlan && (
                        <Index.Box className="user-profile-cus-header">
                          <img
                            className="crown-image-cus-header"
                            src={PagesIndex.Svg.crown}
                            alt="crown"
                          />
                        </Index.Box>
                      )}
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="user_firstName">
                    <Index.Typography className="header-profile-text" onClick={handleMenuClick} >
                      {userDetails?.firstName ? userDetails?.firstName : ""}
                    </Index.Typography>
                  </Index.Box>
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
              </Index.Box>
              <Index.Box className="mobile-navigation">
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
                          onClick={() => {
                            mobileNav();
                            if (location?.pathname === "/") {
                              window.scrollTo(0, 0);
                            }
                          }}
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
                      <li>
                        <Index.Link
                          onClick={mobileNav}
                          to="/investors"
                          className="mobile-nav-link"
                        >
                          Investor Section
                        </Index.Link>
                      </li>
                      <li>
                        <Index.Link
                          onClick={mobileNav}
                          to="/blog"
                          className="mobile-nav-link"
                        >
                          Blogs/PR
                        </Index.Link>
                      </li>
                    </ul>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>

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
          open={selectCity || openLocation}
          onClose={changeCityClose}
          // key={filteredRegionList}
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
                      value={searchQuery}
                    />
                    <Index.Box className="svg-box">
                      {/* <PagesIndex.Loader secondary /> */}
                      <Index.SearchIcon />
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="popular-city-wrapper-main cus-scrollbar">
                  <Index.Box className="popular-city-wrapper">
                    {filteredRegionList.length ? (
                      filteredRegionList.map((item, key) => (
                        <Index.Box
                          key={key}
                          className={`popular-city-item ${
                            region?._id === item._id ? "active" : ""
                          }`}
                          onClick={() => handleChangedropdown(item)}
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

      <Index.Box className="btm-head-content">
        {/* {scrollVisible && ( */}
        <Index.Box
          className={isScrolling ? "btm-head smooth-scroll" : "btm-head"}
        >
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
              <li>
                <Index.Link to="/calender">Calendar</Index.Link>
              </li>
              <li>
                <Index.Link to="/about">About Connplex</Index.Link>
              </li>
              <li>
                <Index.Link target="_blank" to="https://theconnplex.com/investors">Investor Section</Index.Link>
              </li>
              <li>
                <Index.Link to="/blog">Blogs/PR</Index.Link>
              </li>
            </ul>
          </Index.Box>
        </Index.Box>
        {/* )} */}
      </Index.Box>
    </>
  );
}

export default CustomHeader;
