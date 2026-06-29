import React from "react";
import {
  BrowserRouter,
  Route,
  Routes as Routess,
  Navigate,
} from "react-router-dom";
import { createBrowserHistory } from "history";
import Login from "../container/auth/login/Login";
import ForgotPassword from "../container/auth/forgotPassword/ForgotPassword";
import ResetPassword from "../container/auth/resetPassword/ResetPassword";
import SignUp from "../container/auth/signUp/SignUp";
import DashboardLayout from "../container/pages/admin/dashboard/dashboardLayout/DashboardLayout";
import Dashboard from "../container/pages/admin/dashboard/dashboardPage/Dashboard";
import ManageUser from "../container/pages/admin/dashboard/dashboardPage/menageUser/ManageUser";
import Otp from "../container/auth/otp/Otp";
import VerifyLoginOTP from "../container/auth/otp/VerifyLoginOTP";

import ChangePassword from "../container/pages/admin/profile/ChangePassword";
import Profile from "../container/pages/admin/profile/Profile";

// import ManageUser from "../container/pages/admin/menageUser/ManageUserBarge";
import RolePermissionManagement from "../container/pages/admin/rolePermissionMangement/RolePermissionManagement";
import RegionManagement from "../container/pages/admin/regionManagement/RegionManagement";
import SubAdminManegement from "../container/pages/admin/subAdminManagement/SubAdminManegement";
import CinemaManagement from "../container/pages/admin/cinemaManagement/CinemaManagement";
import MovieManagement from "../container/pages/admin/movieManagement/MovieManagement";
import ActorsManagement from "../container/pages/admin/actorsManagement/ActorsManagement";
// import Home from "../container/pages/admin/dashboard";
import SliderManagement from "../container/pages/admin/sliderManagement/SliderManagement";
import CmsManagement from "../container/pages/admin/cmsManagement/CmsManagement";
import ContactUsList from "../container/pages/admin/contactUsList/ContactUsList";
import FranchiseApplicationList from "../container/pages/admin/franchiseApplicationList/FranchiseApplicationList";
import GalleryManagement from "../container/pages/admin/galleryManagement/GalleryManagement";
import GalleryImageManagement from "../container/pages/admin/galleryImageManagement/GalleryImageManagement";
import FoodsAndBeveregesManagement from "../container/pages/admin/foodsAndBeveregesManagement/FoodsAndBeveregesManagement";
import BookingManagement from "../container/pages/admin/bookingManagement/BookingManagement";
import BannerManagement from "../container/pages/admin/bannerManagement/BannerManagement";
import UserList from "../container/pages/admin/userList/UserList";
import TwentyMinFranchiseApplicationList from "../container/pages/admin/twentyMinFranchiseApplicationList/TwentyMinFranchiseApplicationList";
import SubscriberList from "../container/pages/admin/subscriberList/SubscriberList";
import FaqManagement from "../container/pages/admin/faqManagement/FaqManagement";
import TransactionHistory from "../container/pages/admin/transactionHistory/TransactionHistory";
import UserMovieReviewList from "../container/pages/admin/userMovieReviewList/UserMovieReviewList";
import FeedbackList from "../container/pages/admin/feedbackFormList/FeedbackList";
import AdvertisementRequestFormList from "../container/pages/admin/advertisementRequestFormList/AdvertisementRequestFormList";
import CareerFormList from "../container/pages/admin/careerFormList/CareerFormList";
import PartnersManagement from "../container/pages/admin/partnersManagement/PartnersManagement";
import BookingManagementReport from "../container/pages/admin/bookingManagementReport/BookingManagementReport";
import CinemaLicenseManagement from "../container/pages/admin/cinemaLicenseManagement/CinemaLicenseManagement";
import MovieInterested from "../container/pages/admin/movieInterested/MovieInterested";
import GroupBookingList from "../container/pages/admin/GroupBooking/GroupBookingList";
import InfluencerList from "../container/pages/admin/influencer/InfluencerList";
import BlogManagement from "../container/pages/admin/blogManagement/BlogManagement";
import AddBlog from "../container/pages/admin/blogManagement/AddBlog";
import ViewBlog from "../container/pages/admin/blogManagement/ViewBlog";
import Membership from "../container/pages/admin/membership/Membership";
import AddMemberShip from "../container/pages/admin/membership/AddMemberShip";
import CouponManagement from "../container/pages/admin/couponManagement/CouponManagement";
import AddCoupon from "../container/pages/admin/couponManagement/AddCoupon";
import ViewCoupon from "../container/pages/admin/couponManagement/ViewCoupon";
import ReportIssue from "../container/pages/admin/reportIssue/ReportIssue";
import ViewReport from "../container/pages/admin/reportIssue/ViewReport";
import UserListViewTabs from "../container/pages/admin/userList/UserListViewTabs";
import SubScription from "../container/pages/admin/subscription/SubScription";
import AddSubScription from "../container/pages/admin/subscription/AddSubScription";
import ViewSubScription from "../container/pages/admin/subscription/ViewSubScription";
import PublicLayout from "./public/PublicLayout";
import PrivateLayout from "./private/PrivateLayout";
import AdvertiseRequestAdd from "../container/pages/admin/advertisementRequestFormList/AdvertiseRequestAdd";
import AddCareerImage from "../container/pages/admin/careerFormList/AddCareerImage";
import MemberShipPlanList from "../container/pages/admin/membershipPlanList/MemberShipPlanList";
import ViewMembershipDetails from "../container/pages/admin/membershipPlanList/ViewMembershipDetails";
import Rewards from "../container/pages/admin/rewards/Rewards";
import LoginActivityDetails from "../container/pages/admin/subAdminManagement/LoginActivityDetails";
import Category from "../container/pages/ecommerce/category/Category";
import Product from "../container/pages/ecommerce/products/Product";
import AddProduct from "../container/pages/ecommerce/products/AddProduct";
import Attribute from "../container/pages/ecommerce/attributes/Attributes";
import Seller from "../container/pages/ecommerce/seller/Seller";
import OrderList from "../container/pages/ecommerce/orders/OrderList";
import ReturnOrderList from "../container/pages/ecommerce/returnOrder/ReturnOrderList";
// import { onMessage } from "firebase/messaging";
// import { messaging } from "../config/FirebaseConfig";
import PagesIndex from "../common/PageIndex";
import EcommerceBannerManagement from "../container/pages/ecommerce/ecommerceBanner/EcommerceBanner";
import ProductApproval from "../container/pages/ecommerce/productApproval/ProductApproval";
import ViewProduct from "../container/pages/ecommerce/productApproval/ViewProduct";
import SingleViewProduct from "../container/pages/ecommerce/products/ViewProduct";
import GlobalNotification from "../container/pages/admin/globalNotification/GlobalNotification";
import AddNotificaion from "../container/pages/admin/globalNotification/AddNotificaion";
import WelcomeGift from "../container/pages/admin/welcomeGift/WelcomeGift";
import GlobalConvenienceFee from "../container/pages/admin/globalConvenienceFee/GlobalConvenienceFee";
import SubscriptionRequestList from "../container/pages/admin/subscriptionRequest/SubscriptionRequestList";
import MovieShowsManagement from "../container/pages/admin/movieManagement/MovieShowsManagement";
import FailedTransaction from "../container/pages/admin/failedTransaction/FailedTransaction";
import VistaLogs from "../container/pages/admin/vistaLogs/VistaLogs";
import VistaMovies from "../container/pages/admin/vistaMovies/VistaMovies";
import VistaShows from "../container/pages/admin/vistaShows/VistaShows";
import VistaDashboard from "../container/pages/admin/vistaDashboard/VistaDashboard";
import OverviewDashboard from "../container/pages/admin/overviewDashboard/OverviewDashboard";

const history = createBrowserHistory();
export default function Routes() {
  // onMessage(messaging, (payload) => {
  //   const { title, body } = payload.notification || {};
  //   if (Notification.permission === "granted") {
  //     new Notification(title || "Notification", {
  //       body,
  //       icon: PagesIndex.Png.connplexlogo,
  //     });
  //   } else {
  //     toast.info(`${title}: ${body}`);
  //   }
  // });
  return (
    <BrowserRouter history={history}>
      <Routess>
        <Route element={<PublicLayout />}>
          <Route path="/" index element={<Login />} />
          <Route path="/verify-otp" index element={<VerifyLoginOTP />} />
          <Route path="/signup" index element={<SignUp />} />
          <Route path="/resetpassword" index element={<ResetPassword />} />
          <Route path="/forgotpassword" index element={<ForgotPassword />} />
          <Route path="/otp" index element={<Otp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" index element={<Dashboard />} />
            <Route path="overview-dashboard" index element={<OverviewDashboard />} />
            <Route path="profile" index element={<Profile />} />
            <Route path="change-password" index element={<ChangePassword />} />
            <Route path="manageuser" index element={<ManageUser />} />
            <Route
              path="role-permission"
              index
              element={<RolePermissionManagement />}
            />
            <Route path="user-list" index element={<UserList />} />
            <Route path="user-view" index element={<UserListViewTabs />} />
            <Route
              path="movie-interested"
              index
              element={<MovieInterested />}
            />
            <Route path="region" index element={<RegionManagement />} />
            <Route path="sub-admin" index element={<SubAdminManegement />} />
            <Route path="slider" index element={<SliderManagement />} />
            <Route path="banner" index element={<BannerManagement />} />
            <Route path="cinema" index element={<CinemaManagement />} />
            <Route
              path="global-convenience-fee"
              index
              element={<GlobalConvenienceFee />}
            />
            <Route
              path="cinema-license"
              index
              element={<CinemaLicenseManagement />}
            />
            <Route path="movie" index element={<MovieManagement />} />
            <Route
              path="movies-shows"
              index
              element={<MovieShowsManagement />}
            />
            <Route path="actors" index element={<ActorsManagement />} />
            <Route path="cms/:id" index element={<CmsManagement />} />
            <Route path="gallery" index element={<GalleryManagement />} />
            <Route path="partners" index element={<PartnersManagement />} />
            <Route
              path="gallery/:cId"
              index
              element={<GalleryImageManagement />}
            />
            <Route
              path="franchise"
              index
              element={<FranchiseApplicationList />}
            />
            <Route
              path="20-min-franchise"
              index
              element={<TwentyMinFranchiseApplicationList />}
            />
            <Route
              path="foods-and-beverages"
              index
              element={<FoodsAndBeveregesManagement />}
            />
            <Route path="bookings" index element={<BookingManagement />} />
            <Route
              path="transaction-report"
              index
              element={<BookingManagementReport />}
            />
            <Route path="contactUs" index element={<ContactUsList />} />
            <Route path="feedback" index element={<FeedbackList />} />
            <Route
              path="ad_requests"
              index
              element={<AdvertisementRequestFormList />}
            />
            <Route path="career_requests" index element={<CareerFormList />} />
            <Route path="trial_subs" index element={<SubscriberList />} />
            <Route path="faq" index element={<FaqManagement />} />
            <Route path="userReviews" index element={<UserMovieReviewList />} />
            <Route
              path="transaction-history"
              index
              element={<TransactionHistory />}
            />

     <Route
              path="failed-history"
              index
              element={<FailedTransaction />}
            />

            <Route path='vista-logs' index element={<VistaLogs />} />
            <Route path='vista-movies' index element={<VistaMovies />} />
            <Route path='vista-shows' index element={<VistaShows />} />
            <Route path='vista-dash' index element={<VistaDashboard />} />

            <Route path="group-booking" index element={<GroupBookingList />} />
            <Route path="influencer-list" index element={<InfluencerList />} />
            <Route path="blog" index element={<BlogManagement />} />
            <Route path="add-blog" index element={<AddBlog />} />
            <Route path="view-blog" index element={<ViewBlog />} />
            <Route path="memberShip" index element={<Membership />} />
            <Route path="add-memberShip" index element={<AddMemberShip />} />
            <Route
              path="membership-plan-list"
              index
              element={<MemberShipPlanList />}
            />
            <Route path="rewards" index element={<Rewards />} />
            <Route path="global-notification/">
              <Route index element={<GlobalNotification />} />
              <Route path="add" element={<AddNotificaion />} />
              <Route path="edit/:id" element={<AddNotificaion />} />
            </Route>
            <Route
              path="view-membership-plan-list"
              index
              element={<ViewMembershipDetails />}
            />

            <Route
              path="coupon-management"
              index
              element={<CouponManagement />}
            />
            <Route path="subscription" index element={<SubScription />} />
            <Route
              path="add-subscription"
              index
              element={<AddSubScription />}
            />
            <Route
              path="view-subscription/:id"
              index
              element={<ViewSubScription />}
            />
            <Route
              path="subscription-requests"
              index
              element={<SubscriptionRequestList />}
            />
            <Route path="add-coupon" index element={<AddCoupon />} />
            <Route path="view-coupon" index element={<ViewCoupon />} />
            <Route path="report-issue" index element={<ReportIssue />} />
            <Route path="view-report" index element={<ViewReport />} />

            <Route
              path="add-advertise-image"
              index
              element={<AdvertiseRequestAdd />}
            />
            <Route path="add-career-image" index element={<AddCareerImage />} />
            <Route
              path="login-activity"
              index
              element={<LoginActivityDetails />}
            />
            <Route path="welcome-gift" index element={<WelcomeGift />} />

            {/* E-commerce route */}
            <Route path="/admin/ecommerce">
              <Route path="category" index element={<Category />} />
              <Route path="attributes" index element={<Attribute />} />
              <Route path="products" index element={<Product />} />
              <Route path="add-product" index element={<AddProduct />} />
              <Route path="add-product/:id" element={<AddProduct />} />
              <Route path="seller" index element={<Seller />} />
              <Route path="orders" index element={<OrderList />} />
              <Route
                path="products/view/:id"
                index
                element={<SingleViewProduct />}
              />
              <Route
                path="banner"
                index
                element={<EcommerceBannerManagement />}
              />
              <Route path="return-order" index element={<ReturnOrderList />} />
              <Route
                path="products-approval"
                index
                element={<ProductApproval />}
              />
              <Route
                path="products-approval/view/:id"
                index
                element={<ViewProduct />}
              />
            </Route>
          </Route>
          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Routess>
    </BrowserRouter>
  );
}
