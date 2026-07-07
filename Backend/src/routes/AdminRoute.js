import { Router } from "express";
import { validateFun } from "../utils/Validate.js";
import Uploads from "../middleware/ImageUpload.js";
import { auth, isAdmin } from "../middleware/Auth.js";
import * as admin from "../controller/admin/AdminController.js";
import * as cinema from "../controller/admin/Cinema.js";
import * as vistaServices from "../services/VistaService.js";
import * as movies from "../controller/admin/MovieController.js";
import * as region from "../controller/admin/RegionController.js";
import * as person from "../controller/admin/PersonController.js";
import * as movieSlider from "../controller/admin/MovieSliders.js";
import * as dataSync from "../controller/admin/DataSync.js";
import * as cinemaWiseSync from "../controller/admin/CinemaWiseDataSync.js";
import * as booking from "../controller/admin/Booking.js";
import * as foodAndBvg from "../controller/booking/FoodAndBvg.js";
import * as CinemaGallary from "../controller/admin/CinemaGallary.js";
import * as banner from "../controller/admin/Banner.js";
import * as contactUs from "../controller/admin/ContactUsController.js";
import * as bookingController from "../controller/booking/Booking.js";
import * as adminPartner from "../controller/admin/AdminPartner.js";
import * as GroupBookingController from "../controller/user/GroupBookingController.js";
import * as InfluencerController from "../controller/user/InfluencerController.js";
import * as BlogsController from "../controller/admin/BlogsController.js";
import * as MemberShipController1 from "../controller/admin/MemberShipController1.js";
import * as CouponController from "../controller/admin/CouponController.js";
import * as SubscriptionController from "../controller/admin/SubscriptionController.js";
import * as RewardsController from "../controller/admin/AdminController.js";
import * as GlobalNotification from "../controller/admin/GlobalNotification.js";
import * as RewardConfigController from "../controller/admin/RewardConfigController.js";
import * as DashBoard from "../controller/admin/DashboardController.js";
import cacheMiddleware from "../middleware/CacheMiddleware.js";
import cacheKeys from "../utils/cacheKeys.js";

const router = Router();
//#region Admin
router.post("/login", admin.loginAdmin);
router.post("/forgot-password", admin.forgotPassword);
router.post("/reset-password", admin.resetPassword);
router.post("/verify-otp", admin.verifyOtp);
router.post("/resend-otp", admin.resendOtp);
router.post("/upload-image", auth, Uploads, admin.updateAdmin);
router.post("/profile-change-password", auth, admin.changePassword);
router.post("/edit-profile", Uploads, auth, admin.editProfile);
router.post("/add-role", auth, admin.addRole);
router.post("/edit-role", auth, admin.editRole);
router.get("/remove-role/:id", auth, admin.removeRole);
router.get("/roles", auth, admin.getAllRole);
router.get("/get-role-permissions-by-id", auth, admin.getRolePermissionsById);
router.post("/add-edit-person", Uploads, person.addEditPerson);
router.get("/persons", person.getPersons);
router.post("/remove-person", person.removePerson);
router.get("/get-by-id", auth, admin.getAdminById);
router.get("/user-details", auth, admin.getUserDetails);
router.post("/get-admin-login-activity", admin.getAdminLoginActivityDetails);
//#endregion

//#region Admin Partner
router.post(
  "/add-partner",
  [auth, isAdmin],
  validateFun("adminPartnerSchema"),
  adminPartner.addEditPartner
);
router.get(
  "/list-partner",
  cacheMiddleware(cacheKeys.partnersData),
  adminPartner.listPartner
);
router.post("/delete-partner", [auth, isAdmin], adminPartner.deletePartner);
router.post(
  "/status-change-partner",
  [auth, isAdmin],
  adminPartner.statusChangePartner
);
//#endregion

//#region Region routes
router.post("/add-edit-region", auth, Uploads, region.addEditRegion);
router.get("/get-region", auth, region.getRegion);
router.post("/remove-region", auth, region.deleteRegion);
router.post("/active-in-active-region", auth, region.regionActiveDeActive);
//#endregion

//#region  Cinema routes
router.post("/add-edit-cinema", auth, Uploads, cinema.addEditCinema);
router.get("/get-cinema", auth, cinema.getCinemas);
router.post("/get-cinema-by-region", auth, cinema.getCinemasByRegion);
router.post("/remove-cinema", auth, cinema.removeCinema);
router.get("/get-cinema-licence", auth, cinema.getCinemasLicence);
router.post("/update-cinema-licence", auth, cinema.updateCinemaLicence);
router.post("/add-cinema-licence", auth, cinema.addCinemaLicence);
//#endregion
// global convience fee
router.get("/get-fee-activity-log", auth, cinema.getFeeActivityLog);
router.post(
  "/update-global-convenience-fee",
  auth,
  cinema.updateGlobalConvienceFee
);

//#region Add Edit Movies slider
router.post(
  "/add-edit-movie-slider",
  auth,
  Uploads,
  movieSlider.addEditMovieSlider
);
router.post("/delete-movie-slider", auth, movieSlider.deleteMovieSlider);
router.get("/get-movie-slider", auth, movieSlider.getMoviesSliders);
router.post("/update-slider-status", auth, movieSlider.updateSliderStatus);
//#endregion

//#region movies
router.post("/add-edit-movies", auth, Uploads, movies.addEditMovie);
router.post("/edit-movies", auth, Uploads, movies.editMovies);
router.post("/remove-movies", auth, movies.removeMovies);
router.get("/movies", movies.getMovies);
router.post("/active-de-active-movie", auth, movies.activeDeactiveMovie);
router.get(
  "/get-movies-for-generate-code",
  movies.getMoviesForGenerateUniqueCode
);
router.post("/generate-unique-code", movies.generateUniqueMovie);
router.get(
  "/interested-uninterested-movies-list",
  auth,
  movies.listInterestedMovies
);
router.get("/movies-list-for-filter", movies.getMoviesForFilterList);
//#endregion

//#region cms
router.post("/add-edit-cms", auth, admin.addEditCmsDetails);
router.post("/add-edit-faqs", auth, admin.addEditFAQs);
router.post("/remove-faq", auth, admin.removeFaq);
router.get("/faqs", auth, admin.getFaqList);
router.get("/contact-us-details", auth, admin.contactUsList);
router.get("/feedback-details", auth, contactUs.feedBacks);
router.get("/advertisement-details", auth, contactUs.advertisementList);
router.get("/career-details", auth, contactUs.careerList);
//#endregion

//#region subAdmin
router.post("/add-edit-subadmin", auth, admin.addEditSubAdmin);
router.post("/remove-subadmin", auth, admin.removeAdmin);
router.get("/subadmins", auth, admin.getAllSubAdmin);
router.post("/subadmin-details", auth, admin.getAdmin);
//#endregion

//#region dataSync
router.post("/data-sync", dataSync.syncAll);
router.post("/item-sync", dataSync.itemSync);
router.post("/cinema-sync", vistaServices.cinema);
router.get(
  "/vista-database-sync/:strCinemaId",
  cinemaWiseSync.syncVistaCinemas
);
router.get("/sync-status", dataSync.getSyncStatus);
router.get("/sync-history", dataSync.getSyncHistory);
//#endregion

//#region addEdit CinemaGallary
router.post(
  "/add-edit-cinema-gallary",
  auth,
  Uploads,
  CinemaGallary.addEditCinemaGallary
);
router.post("/cinema-gallary", auth, CinemaGallary.getCinemaGallary);
router.post(
  "/add-images-cinema-gallary",
  auth,
  Uploads,
  CinemaGallary.addImagesInCinemaGallary
);
router.post("/update-status-gallery", auth, CinemaGallary.updateStatus);
router.post("/remove-gallery", auth, CinemaGallary.removeGallary);
router.post(
  "/add-gallery-background",
  auth,
  Uploads,
  CinemaGallary.AddGallaryBackground
);

//#endregion

//#region siteSetting
router.post("/add-edit-genralseting", auth, admin.generalSetting);
router.get("/site-setting", admin.getSetting);
router.post("/all-bookings", booking.getAllBookingAdmin);
router.post("/all-failed-bookings", booking.getAllFailedBooking);
//#endregion

//#region Items
router.get(
  "/item-details-by-cinema/:id",
  auth,
  foodAndBvg.adminFoodItemByCinemaId
);
router.post("/edit-food-item", auth, Uploads, foodAndBvg.editFoodItem);
router.post("/update-item-status", auth, foodAndBvg.updateStatusFoodAndBvg);
//#endregion

//#region Banners
router.post("/add-edit-banner", auth, Uploads, banner.addSliderBanner);
router.post("/delete-banner", auth, banner.removeBanner);
router.get("/get-banner", auth, banner.banners);
router.post("/update-banner-status", auth, banner.updateBannerStatus);
//#endregion

//#region Franchise & subscriber
router.get(
  "/twenty-min-franchise-lead-details",
  auth,
  admin.twentyMinfranchiseLeadList
);
router.get("/franchise-lead-details", auth, admin.franchiseLeadList);
router.get("/subscribe-list", auth, admin.subscriberList);
//#endregion

//#region User
router.get("/user-list", auth, admin.userList);
router.get("/usercount", auth, admin.userCount);
router.post("/remove-user", auth, admin.deleteUser);
//#endregion

//#region DashBoard
router.get("/total-revenue", auth, admin.totalRevenue);
router.get("/total-all-topdata", auth, admin.topData);
router.post("/transaction-report", auth, bookingController.transactionReport);
router.get(
  "/transaction-by-days-weeks-months",
  admin.transactionByDaysWeeksOrMonths
);
//#endregion

//#region Rate and review
router.post(
  "/active-de-active-rate-review",
  auth,
  movies.activeDeactiveRateReview
);
router.get("/list-rate-and-review", auth, movies.listRateAndReview);
//#endregion

//getAllGroupBooking
router.get("/list-group-booking", GroupBookingController.getAllGroupBooking);
//getInfluencerList
router.get("/influencer-list", InfluencerController.getInfluencerList);

//Create Api for active Deactive Cinema
router.post("/active-deactive-cinema", cinema.ActiveDeactiveCinema);
router.get("/cinema-sync-logs/:cinemaId", auth, cinema.getCinemaSyncLogs);

//#region add/Edit blogs
router.post("/add-edit-blogs", auth, Uploads, BlogsController.addEditBlogs);
router.post("/get-blogs", auth, BlogsController.getBlogs);
router.post(
  "/add-blogs-images",
  auth,
  Uploads,
  BlogsController.addImagesInBlogs
);
router.post(
  "/add-blog-background",
  auth,
  Uploads,
  BlogsController.AddBlogBackground
);
router.post("/update-blogs-status", auth, BlogsController.updateStatus);
router.post("/remove-blogs", BlogsController.removeBlogsImage);
router.post("/ck-editor-images", auth, Uploads, BlogsController.ckEditorImage);
//#endregion

// Add edit MemberShip1 api
router.post(
  "/add-edit-memberShip",
  auth,
  Uploads,
  MemberShipController1.AddEditMemberShip
);

router.post("/delete-memberShip", auth, MemberShipController1.deleteMemberShip);

//admin advertise
router.post(
  "/add-edit-advertiseWithUs",
  // auth,
  Uploads,
  contactUs.AddEditAdvertiseWIthUs
);
router.get("/get-advertiseWithUs", auth, contactUs.getAdvertiseWithUsDetails);
router.post("/delete-advertiseWithUs", auth, contactUs.deleteAdvertiseWitUs);

//admin career with us
router.post(
  "/add-edit-careerWithUs",
  auth,
  Uploads,
  contactUs.AddEditCareerWithUs
);
router.get("/get-careerWithUs", auth, contactUs.getCareerWithUsDetails);
router.post("/delete-careerWithUs", auth, contactUs.deleteCareerWitUs);

//Report issue
router.get("/report-issue-list", auth, admin.ReportIssueList);

//Coupon

router.post(
  "/add-update-coupon",
  auth,
  Uploads,
  CouponController.addOrEditCoupon
);
router.get("/get-coupon-list", auth, CouponController.getAllCouponList);
router.get("/get-coupon-by-id", auth, CouponController.getCouponById);
router.post(
  "/privates-coupon/:userId/:couponId",
  auth,
  CouponController.privateUserCoupon
);
router.post("/assign-private-coupon", CouponController.privateUserCoupon);

router.post("/delete-coupon", auth, CouponController.deleteCoupon);
router.patch(
  "/active-deactive-coupon",
  auth,
  CouponController.activeDeactiveCoupon
);
router.post("/coupon-use-history", auth, CouponController.getCouponUseDetails);

//#region Subscription
router.post(
  "/add-edit-subscription",
  auth,
  SubscriptionController.addOrEditSubscription
);

router.get(
  "/get-subscription-by-id",
  auth,
  SubscriptionController.getSingleSubscription
);
router.post(
  "/delete-subscription",
  auth,
  SubscriptionController.deleteSubscription
);
router.patch(
  "/active-deactive-subscription",
  auth,
  SubscriptionController.activeDeactiveSubscription
);
router.get("/cc-avenue", auth, admin.CCAvenueList);
//#endregion

//#region membership
router.get(
  "/get-all-subscription-membership",
  auth,
  SubscriptionController.getAllSubscriptionMemberShip
);
router.get("/get-details", auth, admin.getUserTransactionDetails);

router.get("/get-all-rewards", RewardsController.getAllReward);
router.get("/get-rewards-summary", auth, RewardsController.getRewardsSummary);
router.get("/reward-metrics", auth, RewardsController.getRewardMetrics);
router.post("/save-reward-config", auth, RewardConfigController.saveRewardConfig);
router.get("/get-reward-config", auth, RewardConfigController.getRewardConfig);
router.get("/get-all-admin", admin.getAllAdmin);
router.post(
  "/add-edit-global-notification",
  auth,
  Uploads,
  GlobalNotification.addGlobalNotification
);
router.post(
  "/global-notification-status",
  auth,
  GlobalNotification.changeGlobalNotificationStatus
);
router.get(
  "/get-all-global-notification",
  auth,
  GlobalNotification.getAllGlobalNotifications
);
router.get(
  "/get-global-notification/:id",
  auth,
  GlobalNotification.getGlobalNotification
);

//Subscription welcome gift
router.get(
  "/get-welcome-gift",
  auth,
  SubscriptionController.getSubscriptionWelcomeGifts
);

// subscription request
router.post(
  "/add-subscription-request",
  auth,
  SubscriptionController.addSubscriptionRequest
);
router.get(
  "/get-subscription-request",
  auth,
  SubscriptionController.getAllSubscriptionRequest
);
router.patch(
  "/update-subscription-request-status",
  auth,
  SubscriptionController.updateSubscriptionRequestStatus
);

router.post("/get-dashboard-data", auth, DashBoard.fetchDashboardData);

// Overview Dashboard APIs (separate endpoints for better performance)
router.get("/overview/counts", auth, DashBoard.fetchOverviewCounts);
router.get("/overview/regions", auth, DashBoard.fetchRegionWiseData);
router.get("/overview/cinemas", auth, DashBoard.fetchCinemasList);
router.get("/overview/movies", auth, DashBoard.fetchMoviesList);
router.get("/overview/now-playing", auth, DashBoard.fetchNowPlayingMovies);
router.get("/overview/upcoming", auth, DashBoard.fetchUpcomingMovies);
router.get("/overview/cinema/:cinemaId", auth, DashBoard.fetchCinemaDetails);
router.get("/overview/movie/:movieId", auth, DashBoard.fetchMovieShows);

router.get(
  "/get-all-region-movies-with-today-shows",
  cacheMiddleware(cacheKeys.moviesTodayWithShowsFromAllRegions),
  movies.getMoviesWithTodayShowTimings
);
router.post(
  "/generate-sales-report",
  auth,
  bookingController.transactionDateWiseReport
);

export { router };
