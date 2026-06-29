import { Router } from "express";
import GoogleStrategy from "passport-google-oauth2";
import * as adminController from "../controller/admin/AdminController.js";
import { listPartner } from "../controller/admin/AdminPartner.js";
import * as booking from "../controller/booking/Booking.js";
import * as cinema from "../controller/user/Cinema.js";
import * as Coupon from "../controller/user/CouponController.js";
import * as franchise from "../controller/user/Franchise.js";
import * as general from "../controller/user/GeneralController.js";
import * as GeneralController from "../controller/user/GeneralController.js";
import * as GroupBookingController from "../controller/user/GroupBookingController.js";
import * as InfluencerController from "../controller/user/InfluencerController.js";
import * as MemberShipController from "../controller/user/SubscriptionController.js";
import * as movies from "../controller/user/Movies.js";
import * as user from "../controller/user/UserController.js";
import * as SubscriptionController from "../controller/admin/SubscriptionController.js";
import * as RewardsController from "../controller/user/RewardsController.js";

import * as CouponCart from "../controller/user/CouponCart.js";
import { auth } from "../middleware/Auth.js";
import Uploads from "../middleware/ImageUpload.js";
import {
  paymentRequest,
  paymentResponse,
  subscriptionPaymentRequest,
  subscriptionPaymentResponse,
  razorpayWebhook,
} from "../services/payment/PaymentHandler.js";
import { statusOfOrder } from "../services/ccavenue/CcavRequestHandler.js";
import { validateFun } from "../utils/Validate.js";
import cacheMiddleware from "../middleware/CacheMiddleware.js";
import cacheKeys from "../utils/cacheKeys.js";
import {
  franchisePaymentRequest,
  franchisePaymentResponse,
  getSingleFranchiseLead,
} from "../services/franchise/FranchiseHandlers.js";

const userRouter = Router();
GoogleStrategy.Strategy;
//#region User profile
userRouter.post("/profile-update", auth, Uploads, user.editUserProfile);
userRouter.post("/login", user.signup);
userRouter.get("/user-info", auth, user.getUser);
userRouter.post("/verify-otp", user.otpVerification);
userRouter.post(
  "/verify-mobilenumber",
  validateFun("verifyMobileSchema"),
  auth,
  user.updateMobileNumber
);
userRouter.post(
  "/verify-email",
  validateFun("verifyEmailSchema"),
  auth,
  user.updateEmail
);
userRouter.post("/resend-otp", user.resendOtp);
userRouter.post("/remove-account", user.removeUserAccount);
userRouter.post("/social-login", user.socialLogin);
userRouter.post("/logout", auth, user.logout);
userRouter.post("/update-fcm", auth, user.updateFcmToken);
//#endregion
userRouter.get("/app-download-ticket", user.downloadTicket);

//#region Region
userRouter.get(
  "/get-region",
  cacheMiddleware(cacheKeys.regionData),
  user.getRegion
);
userRouter.get("/get-cinema-by-region/:regionId", cinema.getCinemasByRegion);
//#endregion

//#region Movies
userRouter.get(
  "/get-movies-by-region/:regionId",
  // cacheMiddleware((req) => cacheKeys.moviesDataByRegion(req.params.regionId)),
  movies.getMoviesByRegion
);

userRouter.get(
  "/get-user-subscription-membership",
  auth,
  SubscriptionController.getUsersSubscriptionMemberShip
);
// userRouter.get(
//   "/get-recent-releases-movie-by-region/:regionId",
//   movies.getRecentReleasesMoviesByRegion
// );
userRouter.post("/movie-shows-by-cinema", movies.moviesShowByCinema);
userRouter.get("/movies-details-by-id", movies.getMoviesById);
userRouter.get("/similar-movies-details", movies.getSimilarMoviesDetails);
userRouter.post("/write-rate-review", auth, movies.rateAndReview);
userRouter.post("/like-dis-like-movie", auth, movies.likeDislikeMovie);
userRouter.post(
  "/interested-uninterested-movie",
  auth,
  movies.interestedUninterestedMovie
);
userRouter.post(
  "/interested-uninterested-movies-by-userId",
  auth,
  movies.interestedMoviesByUserId
);
//#endregion

//#region Franchise
userRouter.post(
  "/apply-franchise",
  validateFun("applyFranchiseSchema"),
  franchise.applyForFranchise
);
userRouter.post(
  "/apply-twenty-min-franchise",
  validateFun("applyTwentyMinFranchiseSchema"),
  franchise.applyForTwentyMinFranchise
);

userRouter.get("/active-partner", auth, user.activePartner);
//#endregion

//#region General
userRouter.post("/contact-us", validateFun("contactUsSchema"), user.contactUs);
userRouter.get(
  "/site-setting",
  cacheMiddleware(cacheKeys.siteSettingData),
  adminController.getSetting
);
userRouter.get("/gallery", cinema.getGallery);
userRouter.get("/my-booking", auth, booking.getAllBookingUser);
userRouter.get(
  "/my-food-bvg-order-list",
  auth,
  booking.getAllFoodAndBvgOrderHistory
);

userRouter.get(
  "/sliders/:regionId/:sliderType",

  user.userSlider
);

userRouter.get(
  "/banners",
  cacheMiddleware((req) =>
    cacheKeys.bannerData(req.query.bannerType.replace(/\s+/g, "").toLowerCase())
  ),
  user.userBanner
);

userRouter.post("/banner-click-count", user.updateUserBannerClickCount);
//#endregion

userRouter.get(
  "/notification-status-change/:id",
  auth,
  user.singleUserNotification
);
userRouter.get("/all-notification", auth, user.getAllUserNotification);

//UserGeneral Status
userRouter.post(
  "/add-edit-user-general-status",
  auth,
  GeneralController.addEditMoviStatus
);
userRouter.patch(
  "/update-user-general-status/:id",
  auth,
  GeneralController.updateMoviStatus
);
userRouter.get("/get-movi-status", auth, GeneralController.getMoviStatus);

userRouter.post(
  "/add-group-booking",
  GroupBookingController.addGroupBookingDetails
);
userRouter.post("/add-influencer", InfluencerController.addInfluencerDetails);

//#region Ccavenue payment
userRouter.get("/payment", function (req, res) {
  res.render("paymentCcavenue.html");
});
userRouter.post("/ccavRequestHandler", paymentRequest);
userRouter.post("/ccavResponseHandler", paymentResponse);
userRouter.get("/status-of-order", statusOfOrder);
userRouter.get("/ccavSuccessResponseHandler", function (request, response) {
  const htmlcode = "<p>Transaction Successfully done.</p>";
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(htmlcode);
  response.end();
});

userRouter.post(
  "/subscription-ccavRequestHandler",
  auth,
  subscriptionPaymentRequest
);
userRouter.post(
  "/subscription-ccavResponseHandler",
  subscriptionPaymentResponse
);

// Razorpay webhook — only active when ACTIVE_GATEWAY === 'razorpay'
if (razorpayWebhook) {
  userRouter.post("/razorpay-webhook", razorpayWebhook);
}

userRouter.get(
  "/subscription-transaction-list",
  auth,
  SubscriptionController.getSubscriptionTransactionHistory
);

userRouter.post("/ccavCancelResponseHandler", function (request, response) {
  const htmlcode = `<script>window.location.href='https://ticketing.theconnplex.com/'</script>`;
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(htmlcode);
  response.end();
});
userRouter.get("/list-partner", auth, listPartner);

userRouter.get(
  "/download-ticket-pdf/:initTransId/ticket.pdf",
  general.downloadBookingTicketAsPDF
);

userRouter.get("/blogs", user.getBlogs);
userRouter.get(
  "/get-recent-releases-movie-by-region/:regionId",
  cacheMiddleware((req) =>
    cacheKeys.recentRelaseMovieDataByRegion(req.params.regionId)
  ),
  movies.getRecentReleasesMoviesByRegion
);

userRouter.post("/report-issue", auth, Uploads, user.ReportIssueMail);

//#endregion
//# MemberShip
// userRouter.post(
//   "/apply-membership",
//   auth,
//   MemberShipController.applyMembership
// );
// userRouter.get(
//   "/get-membership-list",
//   auth,
//   MemberShipController.getMemberShip
// );
userRouter.get(
  "/get-membership-by-user",
  auth,
  MemberShipController.getMemberShipByUserId
);
userRouter.delete(
  "/delete-membership",
  auth,
  MemberShipController.deleteMemberShip
);

userRouter.post("/apply-coupan-new", auth, Coupon.applyCoupan);
userRouter.get("/get-career-list", user.getCareerDetails);
userRouter.get("/get-advertise-list", user.getAdvertiseDetails);

userRouter.get("/coupons/:cityId", Coupon.groupCouponsByLocation);
userRouter.post("/validate-coupon", auth, Coupon.validateCouponByTitle);
userRouter.delete("/delete-applied-coupon/:id", Coupon.deleteAppliedCoupon);
userRouter.get("/get-coupon-list", auth, Coupon.getCouponList);
userRouter.post(
  "/subscription/add",
  auth,
  Coupon.addOrUpgradeSubscriberMembership
);

userRouter.get(
  "/get-user-subscription-list",
  SubscriptionController.getUserAllSubscription
);

userRouter.get("/get-rewards", auth, RewardsController.getRewardsByUserId);
userRouter.get("/reward-balance", auth, RewardsController.getRewardBalance);
userRouter.get("/reward-by-transaction", auth, RewardsController.getRewardByTransaction);
userRouter.post("/redeem-coins", auth, RewardsController.redeemCoins);
userRouter.get(
  "/get-user-subscription",
  auth,
  RewardsController.getRewardsByUserId
);
userRouter.post("/coupon-cart", auth, CouponCart.couponCart);

userRouter.post(
  "/get-coupons-by-city-cinema-language",
  auth,
  Coupon.getAllCouponsByCityCinemaLanguage
);

userRouter.get("/get-cinema-show-count", cinema.getCinemaShowCount);
userRouter.get("/get-user-data", user.getUserData);
userRouter.get("/get-all-cinema", user.getAllCinema);

//Subscription welcome gift
userRouter.get(
  "/get-user-welcome-gift",
  auth,
  MemberShipController.getUserSubscriptionWelcomeGifts
);
userRouter.post(
  "/mark-gift-received",
  auth,
  MemberShipController.markAsReceivedSubscriptionGift
);
userRouter.post("/remove-cart-coupon", auth, CouponCart.removeCouponFromCart);
userRouter.post(
  "/verify-membership-coupon",
  auth,
  Coupon.membershipCouponVerify
);
userRouter.post(
  "/validate-ecommerce-coupon",
  auth,
  Coupon.validateCouponByTitleForEcommerce
);

userRouter.get("/booking-session/:id", auth, booking.getBookingSessionById);

userRouter.post("/franchise-payment-request", franchisePaymentRequest);
userRouter.post("/franchise-payment-response", franchisePaymentResponse);
userRouter.get("/franchise/:transId", getSingleFranchiseLead);

export { userRouter };
