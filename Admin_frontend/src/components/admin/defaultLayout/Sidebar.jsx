import React from "react";
import Index from "../../../container/Index";
import PagesIndex from "../../../container/PagesIndex";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const location = PagesIndex.useLocation();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [openCms, setOpenCms] = React.useState(false);
  const handleClickAccount = () => {
    setOpenCms(!openCms);
  };
  const [openMaster, setOpenMaster] = React.useState(false);
  const handleClickMaster = () => {
    setOpenMaster(!openMaster);
  };

  const [openVista, setOpenVista] = React.useState(false);
  const handleClickVista = () => {
    setOpenVista(!openVista);
  };
  const [openUser, setOpenUser] = React.useState(false);
  const handleClickUser = () => {
    setOpenUser(!openUser);
  };
  const [openBooking, setOpenBooking] = React.useState(false);
  const handleClickBooking = () => {
    setOpenBooking(!openBooking);
  };
  const [openEcom, setOpenEcom] = React.useState(false);
  const handleClickEcom = () => {
    setOpenEcom(!openEcom);
  };

  const hasPermission = (userData = [], requiredPermissions = []) => {
    if (userData?.type === "Admin") return true;
    const userPermissions = userData?.roleId?.permissions ?? [];
    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    return required.some((permission) => userPermissions?.includes(permission));
  };

  const sidebarMenus = [
    {
      title: "Dashboard",
      pathName: "/admin/dashboard",
      icon: <Index.DashboardIcon />,
      show: hasPermission(adminLoginData, "dashboard_view"),
    },
    {
      title: "Overview Dashboard",
      pathName: "/admin/overview-dashboard",
      icon: <Index.DvrIcon />,
      show: hasPermission(adminLoginData, "dashboard_view"),
    },
    // {
    //   title: "Manage User",
    //   pathName: "/admin/manageuser",
    //   icon: PagesIndex?.Svg?.sidebar2,
    // },

    {
      title: "Slider",
      pathName: "/admin/slider",
      icon: <Index.ViewCarouselIcon />,
      show: hasPermission(adminLoginData, "slider_view"),
    },
    {
      title: "Banner",
      pathName: "/admin/banner",
      icon: <Index.SwipeIcon />,
      show: hasPermission(adminLoginData, "slider_view"),
    },
    {
      title: "Blog",
      pathName: "/admin/blog",
      icon: <Index.ArticleIcon />,
      show: hasPermission(adminLoginData, "slider_view"),
    },

    {
      title: "Movie Interested",
      pathName: "/admin/movie-interested",
      icon: <Index.MovieIcon />,
      show: hasPermission(adminLoginData, "movie_interested_view"),
    },
    {
      title: "Coupon",
      pathName: "/admin/coupon-management",
      icon: <Index.LocalOfferIcon />,
      show: hasPermission(adminLoginData, "coupon_view"),
    },
    {
      title: "Subscription",
      pathName: "/admin/subscription",
      icon: <Index.SubscriptionsIcon />,
      // show: true,
      show: hasPermission(adminLoginData, "subscription_view"),
    },
    {
      title: "Subscription Requests",
      pathName: "/admin/subscription-requests",
      icon: <Index.SubscriptionsIcon />,
      show: hasPermission(adminLoginData, "subscription_request_view"),
    },
    {
      title: "Welcome Gift",
      pathName: "/admin/welcome-gift",
      icon: <Index.CardGiftcardIcon />,
      show: hasPermission(adminLoginData, "welcome_gift_view"),
    },
    {
      title: "Actors",
      pathName: "/admin/actors",
      icon: <Index.RecentActorsIcon />,
      show: hasPermission(adminLoginData, "actor_view"),
    },
    {
      title: "Gallery",
      pathName: "/admin/gallery",
      icon: <Index.CollectionsIcon />,
      show: hasPermission(adminLoginData, "gallery_view"),
    },

    {
      title: "Partners",
      pathName: "/admin/partners",
      icon: <Index.HandshakeIcon />,
      show: hasPermission(adminLoginData, "partners_view"),
    },

    {
      title: "Franchise",
      pathName: "/admin/franchise",
      icon: <Index.DomainAddIcon />,
      show: hasPermission(adminLoginData, "applyForFranchise_view"),
    },
    {
      title: "20 Min Franchise",
      pathName: "/admin/20-min-franchise",
      icon: <Index.DomainAddIcon />,
      show: hasPermission(adminLoginData, "applyForFranchise_view"),
    },
    {
      title: "Movie Reviews",
      pathName: "/admin/userReviews",
      icon: <Index.ReviewsIcon />,
      show: hasPermission(adminLoginData, "movie_review_view"),
    },
    {
      title: "Feedbacks",
      pathName: "/admin/feedback",
      icon: <Index.RateReviewIcon />,
      show: hasPermission(adminLoginData, "feedback_view"),
    },

    {
      title: "Brand Influencers",
      pathName: "/admin/influencer-list",
      icon: <Index.WorkIcon />,
      show: hasPermission(adminLoginData, "career_request_view"),
    },
    {
      title: "Newsletter",
      pathName: "/admin/trial_subs",
      icon: <Index.SubscriptionsIcon />,
      show: hasPermission(adminLoginData, "trial_subs_view"),
    },

    {
      title: "Report Issue",
      pathName: "/admin/report-issue",
      icon: <Index.ReportProblemIcon />,
      show: hasPermission(adminLoginData, "report_issue_view"),
    },
    {
      title: "Membership Plan",
      pathName: "/admin/membership-plan-list",
      icon: <Index.StarsIcon />,
      show: hasPermission(adminLoginData, "membership_plan_view"),
    },
    {
      title: "Reward / Coin",
      pathName: "/admin/rewards",
      icon: <Index.SellIcon />,
      show: hasPermission(adminLoginData, "reward_coin_view"),
    },
    {
      title: "Rewards",
      pathName: "/admin/rewards-summary",
      icon: <Index.SellIcon />,
      show: hasPermission(adminLoginData, "reward_coin_view"),
    },
    {
      title: "Global Notification",
      pathName: "/admin/global-notification",
      icon: <Index.SellIcon />,
      show: hasPermission(adminLoginData, "global_notification_view"),
    },
  ];

  return (
    <Index.Box className={`sidebar-main ${!open ? "active" : "sidebar-none"}`}>
      <Index.Box
        className="sidebar-logo"
        sx={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/admin/dashboard");
        }}
      >
        <img src={PagesIndex?.Svg?.connplexLogo} alt="logo123" />
      </Index.Box>

      <Index.Box className="sidebar-links">
        <Index.Box className="sidebar-ul">
          {sidebarMenus.map((item, index) => {
            return (
              item?.show && (
                <PagesIndex.Link
                  to={item.pathName}
                  onClick={(e) => setOpen(false)}
                  className="sidebar-links"
                  key={index}
                >
                  <Index.Box
                    className={`sidebar-li ${
                      location.pathname === item.pathName ? "active" : ""
                    }`}
                    key={index}
                  >
                    <Index.Box>
                      {/* <img src={item.icon} alt="dashboard-icon" />{" "} */}
                      {item?.icon}
                      {item.title}
                    </Index.Box>
                  </Index.Box>
                </PagesIndex.Link>
              )
            );
          })}

          {hasPermission(adminLoginData, "ecommerce_view") && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickEcom}>
                <Index.Box>
                  <Index.DvrIcon />
                  E-Commerce
                </Index.Box>
                {openEcom ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openEcom}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/attributes"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/attributes`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Attributes
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/banner"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/banner`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Banner
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/category"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/category`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Category
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/products"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/products` ||
                            // location.pathname ===
                            //   `/admin/ecommerce/add-product` ||
                            location.pathname.includes(
                              "/admin/ecommerce/add-product"
                            )
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Product
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/products-approval"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname.includes(
                              "/admin/ecommerce/products-approval"
                            )
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Product Approval
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/seller"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/seller`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Seller
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {hasPermission(adminLoginData, "ecommerce_view") ? (
                      <PagesIndex.Link
                        to={"/admin/ecommerce/orders"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ecommerce/orders`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Order
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {/* {adminLoginData?.roleId?.permissions?.includes("ecommerce") ||
                  true ? (
                    <PagesIndex.Link
                      to={"/admin/ecommerce/return-order"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/ecommerce/return-order`
                            ? "active"
                            : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.LocationCityIcon />
                            Retrun Order
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>
                  ) : (
                    <></>
                  )} */}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}
          {hasPermission(adminLoginData, [
            "cinema_view",
            "food_beverages_view",
            "movie_view",
            "region_view",
          ]) && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickVista}>
                <Index.Box>
                  <Index.DvrIcon />
                  Vista
                </Index.Box>
                {openVista ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openVista}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    {adminLoginData?.roleId?.permissions?.includes(
                      "cinema_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/cinema"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/cinema`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Cinema
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                    {adminLoginData?.roleId?.permissions?.includes(
                      "cinema_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/global-convenience-fee"}
                        onClick={(e) => setOpen(false)}
                        className="sidebar-links"
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname ===
                            `/admin/global-convenience-fee`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Global Convenience Fee
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                    {adminLoginData?.roleId?.permissions?.includes(
                      "cinema_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/cinema-license"}
                        onClick={(e) => setOpen(false)}
                        className="sidebar-links"
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/cinema-license`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocationCityIcon />
                              Cinema License
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "movie_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/movie"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/movie` ? "active" : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.MovieIcon />
                              Movie
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "food_beverages_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/foods-and-beverages"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/foods-and-beverages`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.FastfoodIcon />
                              Foods & Beverages
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "region_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/region"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/region`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.PlaceIcon />
                              Cities
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}

          {hasPermission(adminLoginData, [
            "user_view",
            "role_view",
            "sub_admin_view",
          ]) && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickUser}>
                <Index.Box>
                  <Index.GroupAddIcon />
                  Users
                </Index.Box>
                {openUser ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openUser}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    {adminLoginData?.roleId?.permissions?.includes(
                      "user_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/user-list"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/user-list`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.PeopleIcon />
                              Users
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "role_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/role-permission"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/role-permission`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LockPersonIcon />
                              Role Permission
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "sub_admin_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/sub-admin"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/sub-admin`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.ManageAccountsIcon />
                              Sub Admin
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}

          {hasPermission(adminLoginData, [
            "bookings_view",
            "transaction_view",
            "career_request_view",
          ]) && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickBooking}>
                <Index.Box>
                  <Index.PointOfSaleIcon />
                  Booking
                </Index.Box>
                {openBooking ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openBooking}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    {adminLoginData?.roleId?.permissions?.includes(
                      "bookings_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/bookings"}
                        onClick={(e) => setOpen(false)}
                        className="sidebar-links"
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/bookings`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocalActivityIcon />
                              Bookings
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "bookings_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/transaction-report"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/transaction-report`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LocalActivityIcon />
                              Bookings Report
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "transaction_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/transaction-history"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/transaction-history`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.ReceiptLongIcon />
                              Transaction History
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "career_request_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/group-booking"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/group-booking`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.ReceiptLongIcon />
                              Group Booking
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}

          {hasPermission(adminLoginData, [
            "career_request_view",
            "ad_request_view",
          ]) && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickMaster}>
                <Index.Box>
                  <Index.DvrIcon />
                  Master
                </Index.Box>
                {openMaster ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openMaster}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    <PagesIndex.Link
                      to={"/admin/memberShip"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/memberShip`
                            ? "active"
                            : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.WorkIcon />
                            Membership
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>

                    {adminLoginData?.roleId?.permissions?.includes(
                      "career_request_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/career_requests"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/career_requests`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.WorkIcon />
                              Career Requests
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "ad_request_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/ad_requests"}
                        onClick={(e) => setOpen(false)}
                        className="sidebar-links"
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/ad_requests`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.AdsClickIcon />
                              Advertisement Requests
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}

          {hasPermission(adminLoginData, "cms_view") && (
            <PagesIndex.Link className="sidebar-links">
              <Index.Box className={`sidebar-li`} onClick={handleClickAccount}>
                <Index.Box>
                  <Index.DvrIcon />
                  CMS
                </Index.Box>
                {openCms ? (
                  <Index.ExpandLess className="expandless-icon" />
                ) : (
                  <Index.ExpandMore className="expandmore-icon" />
                )}
              </Index.Box>
              <Index.Box className="submenu-main">
                <Index.Collapse
                  in={openCms}
                  timeout="auto"
                  unmountOnExit
                  className="submenu-collapse"
                >
                  <Index.List
                    component="div"
                    disablePadding
                    className="admin-sidebar-submenulist"
                  >
                    <PagesIndex.Link
                      to={"/admin/cms/1"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/1` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.GavelIcon />
                            Terms & conditions
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>

                      <PagesIndex.Link
                      to={"/admin/cms/5"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/5` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.GavelIcon />
                            Membership Terms & conditions
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>
                    <PagesIndex.Link
                      to={"/admin/cms/3"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/3` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.InfoIcon />
                            About Us
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>
                    <PagesIndex.Link
                      to={"/admin/cms/0"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/0` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.PolicyIcon />
                            Privacy Policy
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>
                    <PagesIndex.Link
                      to={"/admin/cms/2"}
                      onClick={(e) => setOpen(false)}
                      className="sidebar-links"
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/2` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.CurrencyExchangeIcon />
                            Refund Policy
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>
                    <PagesIndex.Link
                      to={"/admin/cms/4"}
                      className="sidebar-links"
                      onClick={(e) => setOpen(false)}
                    >
                      <Index.ListItem
                        className={`sidebar-li ${
                          location.pathname === `/admin/cms/4` ? "active" : ""
                        }`}
                      >
                        <Index.Box className={`sidebar-li-cms`}>
                          <Index.Box>
                            <Index.GavelIcon />
                            Legal Notice
                          </Index.Box>
                        </Index.Box>
                      </Index.ListItem>
                    </PagesIndex.Link>

                    {adminLoginData?.roleId?.permissions?.includes(
                      "contactUs_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/contactUs"}
                        onClick={(e) => setOpen(false)}
                        className="sidebar-links"
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/contactUs`
                              ? "active"
                              : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.ContactPageIcon />
                              Contact Us
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}

                    {adminLoginData?.roleId?.permissions?.includes(
                      "faq_view"
                    ) ? (
                      <PagesIndex.Link
                        to={"/admin/faq"}
                        className="sidebar-links"
                        onClick={(e) => setOpen(false)}
                      >
                        <Index.ListItem
                          className={`sidebar-li ${
                            location.pathname === `/admin/faq` ? "active" : ""
                          }`}
                        >
                          <Index.Box className={`sidebar-li-cms`}>
                            <Index.Box>
                              <Index.LiveHelpIcon />
                              FAQ
                            </Index.Box>
                          </Index.Box>
                        </Index.ListItem>
                      </PagesIndex.Link>
                    ) : (
                      <></>
                    )}
                  </Index.List>
                </Index.Collapse>
              </Index.Box>
            </PagesIndex.Link>
          )}
        </Index.Box>
      </Index.Box>
    </Index.Box>
  );
};

export default Sidebar;
