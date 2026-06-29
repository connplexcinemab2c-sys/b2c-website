import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import PropTypes from "prop-types";
import AccountTab from "./AccountTab";
import BookingTab from "./BookingTab";
import MembershipTab from "./MembershipTab";
import OrderTab from "./OrderTab";
import NotificationTab from "./NotificationTab";
import SupportTab from "./SupportTab";
import "swiper/css/effect-fade";
import WishlistTab from "./WishlistTab";
import { useNavigate } from "react-router-dom";
import Transaction from "./Transaction";
import Reward from "./Reward";
import { membershipDurationConstant } from "../../../../constant";
import WelcomeGift from "./WelcomeGift";

function AccountTabItem(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Index.Box sx={{ p: 3 }}>
          <Index.Typography>{children}</Index.Typography>
        </Index.Box>
      )}
    </div>
  );
}

AccountTabItem.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function Account() {
  const { userDetails, userToken, membershipPlan } = PagesIndex.useSelector(
    (state) => state.UserReducer
  );

  const navigate = useNavigate();
  const location = PagesIndex.useLocation();
  const dispatch = PagesIndex.useDispatch();
  const [bookingList, setBookingList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [membershipItem, setMembershipItem] = useState([]);
  const [membershipHistory, setMembershipHistory] = useState([]);
  const [rewardList, setRewardList] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [value, setValue] = useState(
    location?.state?.tab ? location?.state?.tab : 0
  );
  const [bannerList, setBannerList] = useState([]);

  const getMembershipTransactionHistory = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(
      PagesIndex.Api.GET_MEMBERSHIP_TRANSACTION_LIST_HISTORY,
      "",
      userToken
    ).then((res) => {
      dispatch(PagesIndex.hideLoader());

      if (res?.status === 200) {
        // Sort the membership items by price in descending order
        setMembershipHistory(res?.data);
        // const filterData = res?.data?.filter((data) => {
        //   return data?.isActive === true;
        // });
      }
    });
  };

  const getRewardList = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.GET_REWARD, "", userToken).then(
      (res) => {
        dispatch(PagesIndex.hideLoader());

        if (res?.status === 200) {
          // Sort the membership items by price in descending order
          setRewardList(res?.data);
          const filterData = res?.data.filter((data) => {
            return data?.isActive === true;
          });
        }
      }
    );
  };

  useEffect(() => {
    getBookingList();
    getBannerImages();
    getPreviousOrders();
    getMembershipTransactionHistory();
    getRewardList();
  }, []);
  const getBookingList = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(PagesIndex.Api.MY_BOOKINGS, "", userToken).then(
      (res) => {
        if (res?.status === 200) {
          setBookingList(res.data);
        }
        dispatch(PagesIndex.hideLoader());
      }
    );
  };
  const getPreviousOrders = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(
      PagesIndex.Api.PREVIOUS_ORDERS,
      "",
      userToken
    ).then((res) => {
      if (res?.status === 200) {
        setOrderList(res.data);
      }
      dispatch(PagesIndex.hideLoader());
    });
  };
  const getBannerImages = () => {
    dispatch(PagesIndex.showLoader());
    PagesIndex.apiGetHandler(
      `${PagesIndex.Api.GET_BANNER_IMAGES}?bannerType=Web Banner`
    ).then((res) => {
      if (res?.status === 200) {
        const bannerList = res.data.filter((data) =>
          data?.bannerShowSection.includes("My Account Section")
        );
        setBannerList(bannerList);
      }
      dispatch(PagesIndex.hideLoader());
    });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Index.Box className="main-account">
        <Index.Box className="account-header">
          <Index.Box className="cus-container">
            <Index.Box className="account-ad-slider">
              <PagesIndex.Swiper
                modules={[PagesIndex.Autoplay]}
                loop={true}
                speed={1500}
                autoplay={{
                  delay: 8000,
                  disableOnInteraction: false,
                }}
              >
                {bannerList?.map((data, index) => {
                  return (
                    <PagesIndex.SwiperSlide key={index}>
                      <Index.Box
                        className={`ad-slider-img ${
                          data?.bannerLink ? "link" : ""
                        }`}
                        onClick={() => {
                          if (data?.bannerLink) {
                            window.open(
                              data?.bannerLink,
                              "_blank" // <- This is what makes it open in a new window.
                            );
                          }
                        }}
                      >
                        <img
                          src={
                            data?.banner
                              ? `${PagesIndex.IMAGES_API_ENDPOINT}/${data?.banner}`
                              : PagesIndex.Png.NoImage
                          }
                          alt="ad-slider slider"
                        />
                      </Index.Box>
                    </PagesIndex.SwiperSlide>
                  );
                })}
              </PagesIndex.Swiper>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Box className="account-body-box">
          <Index.Box className="cus-container">
            <Index.Box className="account-body">
              <Index.Box className="account-tab-box">
                <Index.Box className="profile-img-box">
                  <Index.Box className="profile-img">
                    <Index.Box className="profile-img-inner-custom">
                      <img
                        src={
                          userDetails?.profile
                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${userDetails?.profile}`
                            : PagesIndex.Png.Avatar
                        }
                        width="80"
                        height="80"
                        alt="profile"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = PagesIndex.Png.Avatar;
                        }}
                      />
                      {membershipPlan && (
                        <Index.Box className="profile-img-main-box">
                          <img
                            className="crown-image-cus"
                            src={PagesIndex.Svg.crown}
                            alt="crown"
                          />
                        </Index.Box>
                      )}
                    </Index.Box>
                  </Index.Box>
                  <Index.Typography className="profile-img-title">
                    Hi,{" "}
                    {userDetails?.firstName ? userDetails?.firstName : "Guest"}
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="account-tab-box-inner">
                  <Index.Typography className="profile-img-title">
                    Hi,
                    {userDetails?.firstName ? userDetails?.firstName : "Guest"}
                  </Index.Typography>
                  <Index.Box className="flex-coin-guest">
                    <Index.Box className="coin-icons">
                      <img
                        src={PagesIndex.Png.rewards}
                        alt="rewards"
                        className="rewards-icons"
                      />
                      <Index.Typography className="rewards-text-details">
                        {" "}
                        Rewards <span>:</span>{" "}
                        <span className="prices-left-coins">
                          {userDetails?.totalRewards
                            ? userDetails?.totalRewards
                            : 0}
                        </span>
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>

                  {membershipPlan ? (
                    <Index.Box
                      className="active-plan-main-container"
                      onClick={() => handleOpen()}
                    >
                      {/* <Index.Box className="active-plan-box">
                        <Index.Box className="active-plan-main-bg">
                          <Index.Box className="active-plan-content">
                            <Index.Box className="active-plan-title">
                              <Index.StarHalfIcon />
                            </Index.Box>
                            <Index.Box className="active-flex-between">
                              <Index.Typography className="profile-img-title active-plan-title">
                                {membershipPlan &&
                                  membershipPlan?.subscriptionId &&
                                  `${membershipPlan?.subscriptionId?.title} Membership`}
                              </Index.Typography>
                              <Index.Typography className="active-monthly-text">
                                {membershipPlan &&
                                  membershipPlan?.subscriptionId &&
                                  `${membershipPlan?.subscriptionId?.price}`}{" "}
                                / <span>Monthly</span>
                              </Index.Typography>
                            </Index.Box>
                          </Index.Box>
                          <Index.Typography className="active-expiry-text">
                            Membership plan expires on{" "}
                            {userDetails?.subscriptionId &&
                              PagesIndex.moment(
                                membershipPlan?.subscriptionEndDate
                              ).format("DD MMM YYYY")}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box> */}
                      <Index.Box className="active-plan-rewards">
                        <Index.Box className="active-membership-pd">
                          <Index.Box className="flex-active-rewards">
                            <Index.Box className="membership-contain">
                              <Index.Typography className="profile-img-title active-plan-title">
                                {membershipPlan?.subscriptionId?.title}{" "}
                                Membership
                              </Index.Typography>
                              {/* <Index.Typography className="active-monthly-text">
                                ₹
                                {membershipPlan?.subscriptionId?.price}{" "}
                            /    <span>{membershipDurationConstant[membershipPlan?.membershipDuration]}</span>
                                </Index.Typography> */}
                            </Index.Box>
                            <Index.Box className="coin-rewards">
                              <img
                                src={PagesIndex.Svg.coin}
                                className="member-coin"
                                alr="coin"
                              />
                            </Index.Box>
                          </Index.Box>
                          <Index.Box className="expire-member-details">
                            <Index.Typography className="active-expiry-text">
                              Membership plan expires on{" "}
                              {PagesIndex.moment(
                                membershipPlan?.subscriptionEndDate
                              ).format("DD MMM YYYY")}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  ) : (
                    ""
                  )}

                  <Index.Tabs
                    orientation="vertical"
                    value={value}
                    onChange={handleChange}
                    scrollButtons
                    variant="scrollable"
                    allowScrollButtonsMobile
                    aria-label="scrollable force tabs example"
                  >
                    <Index.Tab
                      className="account-tab"
                      label={
                        <>
                          <Index.PersonIcon />
                          My Account
                        </>
                      }
                      {...a11yProps(0)}
                    />
                    <Index.Tab
                      className="account-tab"
                      label={
                        <>
                          <Index.ConfirmationNumberIcon />
                          My Booking
                        </>
                      }
                      {...a11yProps(1)}
                    />
                    <Index.Tab
                      className="account-tab"
                      label={
                        <>
                          <Index.ReceiptLongIcon />
                          Transaction History
                        </>
                      }
                      {...a11yProps(2)}
                    />
                    <Index.Tab
                      className="account-tab"
                      label={
                        <>
                          <Index.SellIcon />
                          Rewards
                        </>
                      }
                      {...a11yProps(3)}
                    />
                    <Index.Tab
                      className="account-tab"
                      label={
                        <>
                          <Index.RedeemIcon />
                          Welcome Gifts
                        </>
                      }
                      {...a11yProps(4)}
                    />
                    {/* {
                        <Index.Tab
                          className="account-tab"
                          label={
                            <>
                              <Index.RedeemIcon />
                              My Orders
                            </>
                          }
                          {...a11yProps(2)}
                        />
                      } */}
                    {/* <Index.Tab
                  className="account-tab"
                  label={
                    <>
                      <Index.Favorite />
                      My Wishlist
                    </>
                  }
                  {...a11yProps(3)}
                /> */}
                    {/* <Index.Tab
                  className="account-tab"
                  label={
                    <>
                      <Index.LoyaltyIcon />
                      Membership
                    </>
                  }
                  {...a11yProps(4)}
                /> */}
                    {/* <Index.Tab
                        className="account-tab"
                        label={
                          <>
                            <Index.NotificationsIcon />
                            Notification
                          </>
                        }
                        {...a11yProps(3)}
                      /> */}
                    {/* <Index.Tab
                  className="account-tab"
                  label={
                    <>
                      <Index.PrivacyTipIcon />
                      Help & Support
                    </>
                  }
                  {...a11yProps(6)}
                /> */}
                  </Index.Tabs>
                </Index.Box>
              </Index.Box>
              <Index.Box className="account-tab-wrapper">
                <AccountTabItem
                  value={value}
                  index={0}
                  className="account-tab-content"
                >
                  <AccountTab />
                </AccountTabItem>
                <AccountTabItem
                  value={value}
                  index={1}
                  className="account-tab-content"
                >
                  <BookingTab bookingList={bookingList} />
                </AccountTabItem>
                <AccountTabItem
                  value={value}
                  index={2}
                  className="account-tab-content"
                >
                  <Transaction membershipItem={membershipHistory} />
                </AccountTabItem>
                <AccountTabItem
                  value={value}
                  index={3}
                  className="account-tab-content"
                >
                  <Reward rewardList={rewardList} />
                </AccountTabItem>
                <AccountTabItem
                  value={value}
                  index={4}
                  className="account-tab-content"
                >
                  <WelcomeGift />
                </AccountTabItem>
                {/* <AccountTabItem
              value={value}
              index={3}
              className="account-tab-content"
            >
              <WishlistTab />
            </AccountTabItem> */}
                {/* <AccountTabItem
              value={value}
              index={4}
              className="account-tab-content"
            >
              <MembershipTab />
            </AccountTabItem> */}
                {/* <AccountTabItem
                  value={value}
                  index={3}
                  className="account-tab-content"
                >
                  <NotificationTab />
                </AccountTabItem> */}
                {/* <AccountTabItem
                    value={value}
                    index={6}
                    className="account-tab-content"
                  >
                    <SupportTab />
                  </AccountTabItem> */}
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Box>
      <Index.Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="franchise-modal-title"
        aria-describedby="franchise-modal-description"
        className="franchise-modal common-modal memeber-show-modal"
      >
        <Index.Box className="franchise-modal-inner common-modal-inner">
          <Index.Box className="memebership-modal-body">
            <Index.Box className="main-membership">
              <Index.Box className="cus-container">
                <Index.Box className="membership-body">
                  <Index.Box className="membership-item-box">
                    <Index.Box className="membership-item">
                      <Index.Typography className="membership-title">
                        {membershipPlan?.subscriptionId?.title}
                      </Index.Typography>
                      <Index.Typography className="small-member-text">
                        {userDetails?.subscriptionDetails?.title === "Platinum"
                          ? "Enjoy exclusive benefits like free tickets and VIP access."
                          : userDetails?.subscriptionDetails?.title === "Gold"
                          ? "Unlock special discounts and perks for a premium movie experience."
                          : "Get started with basic savings and rewards."}
                      </Index.Typography>
                      {/* Show Active Plan text if this is the active plan */}

                      <Index.Typography className="small-member-text active-plan">
                        Active Plan
                      </Index.Typography>

                      <Index.Box className="button-inner-memberlist">
                        <Index.Box className="membership-price">
                          <Index.Typography className="membership-price-inner">
                            {/* ₹{userDetails?.subscriptionDetails?.price}
                            <br />
                            <span> Yearly</span> */}
                            ₹
                            {membershipPlan?.subscriptionDetails
                              ?.isDiscounted ? (
                              <>
                                <span className="line-add-prices">
                                  {membershipPlan?.subscriptionDetails?.price}{" "}
                                </span>{" "}
                                <span>
                                  {" "}
                                  /{" "}
                                  <span>
                                    {
                                      membershipPlan?.subscriptionDetails
                                        ?.discountedPrice
                                    }
                                  </span>
                                </span>{" "}
                              </>
                            ) : (
                              membershipPlan?.subscriptionDetails?.price
                            )}
                            <br />
                            <span className="yearly-title">
                              {
                                membershipDurationConstant?.[
                                  membershipPlan?.subscriptionDetails
                                    ?.membershipDuration
                                ]
                              }
                            </span>
                          </Index.Typography>
                        </Index.Box>
                        <Index.Box className="list-center-member">
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                membershipPlan?.subscriptionDetails
                                  ?.discountOnTicketUpTo === ""
                                  ? "membership-content disable"
                                  : "membership-content active"
                              }
                            >
                              {membershipPlan?.subscriptionDetails
                                ?.discountOnTicketUpTo === "" ? (
                                <Index.ClearIcon />
                              ) : (
                                <Index.CheckIcon />
                              )}
                              <Index.Box className="membership-content-box">
                                {membershipPlan?.subscriptionDetails
                                  ?.discountOnTicketUpTo === ""
                                  ? `No Discount on Tickets`
                                  : `Upto ${membershipPlan?.subscriptionDetails?.discountOnTicketUpTo}% Discount on Tickets: Get more movies for your
                                money`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                         
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                membershipPlan?.subscriptionDetails?.coins ===
                                ""
                                  ? "membership-content disable"
                                  : "membership-content active"
                              }
                            >
                              {membershipPlan?.subscriptionDetails?.coins ===
                              "" ? (
                                <Index.ClearIcon />
                              ) : (
                                <Index.CheckIcon />
                              )}

                              <Index.Box className="membership-content-box">
                                {membershipPlan?.subscriptionDetails?.coins ===
                                ""
                                  ? `No Coins To Earn Rewards`
                                  : `Upto ${membershipPlan?.subscriptionDetails?.coins}% Coins: Earn rewards redeemable for tickets.`}
                              </Index.Box>
                            </Index.Typography>
                          </Index.Box>
                          <Index.Box className="membership-content-box">
                            <Index.Typography
                              className={
                                membershipPlan?.subscriptionDetails
                                  ?.welcomeGift === "Yes"
                                  ? "membership-content active"
                                  : "membership-content disable"
                              }
                            >
                              {membershipPlan?.subscriptionDetails
                                ?.welcomeGift === "Yes" ? (
                                <Index.CheckIcon />
                              ) : (
                                <Index.ClearIcon />
                              )}

                              {membershipPlan?.subscriptionDetails
                                ?.welcomeGift === "Yes" ? (
                                <Index.Box className="membership-content-box">
                                  Welcome Gift: Receive a special surprise when
                                  you join.
                                </Index.Box>
                              ) : (
                                <Index.Box className="membership-content-box">
                                  No Welcome Gift
                                </Index.Box>
                              )}
                            </Index.Typography>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
}

export default Account;
