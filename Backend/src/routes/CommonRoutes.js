import { Router } from "express";
import GoogleStrategy from "passport-google-oauth2";
import passport from "passport";
GoogleStrategy.Strategy;
const commonRouter = Router();
import { googlePassport } from "../config/Passport.config.js";
import { facebookPassport } from "../config/PassportFacebook.config.js";
import * as cms from "../controller/admin/AdminController.js";
import * as booking from "../controller/booking/Booking.js";
import * as payment from "../controller/payment/Payment.js";
import * as price from "../controller/booking/Price.js";
import * as foodAndBvg from "../controller/booking/FoodAndBvg.js";
import * as dataSync from "../controller/admin/DataSync.js";
import * as user from "../controller/user/UserController.js";
import * as region from "../controller/admin/RegionController.js";
import * as movies from "../controller/user/Movies.js";
import * as ticketCancel from "../controller/payment/TicketCancellation.js";
import * as general from "../controller/user/GeneralController.js";
import ImageUpload from "../middleware/ImageUpload.js";
import { auth } from "../middleware/Auth.js";
import { getCinemas } from "../controller/admin/Cinema.js";
import * as vistaDirect from "../controller/admin/VistaDirectController.js";
import * as MemberShipController1 from "../controller/admin/MemberShipController1.js";
import * as SubscriptionController from "../controller/admin/SubscriptionController.js";
import cacheMiddleware from "../middleware/CacheMiddleware.js";
import cacheKeys from "../utils/cacheKeys.js";
import { getFranchisePaymentStatus } from "../services/franchise/FranchiseHandlers.js";

//#region Social login
commonRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
commonRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/api/auth/google/success",
    failureRedirect: "/api/auth/google/failure",
  }),
);
commonRouter.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["public_profile"] }),
);
commonRouter.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/api/auth/facebook/success",
    failureRedirect: "/api/auth/facebook/failure",
  }),
);
//#endregion

//#region Booking
commonRouter.get(
  "/get-cms",
  cacheMiddleware(cacheKeys.cmsData),
  cms.getCmsDetails,
);
commonRouter.post("/movie-detils-with-shows", booking.moviesDetailsWithshow);
commonRouter.post(
  "/show-time-by-cinema-movie",
  booking.showTimeByCinemaIdAndMovie,
);
commonRouter.get("/seat-layout/:strCinemaId/:strSessId", booking.getSeatLayout);
commonRouter.get("/init-booking/:strCinemaId/:movieId", booking.initBooking);
commonRouter.post("/set-seats", booking.setSeats);
commonRouter.post("/add-seats", booking.addSeats);
commonRouter.get(
  "/ticket-cancel/:CinemaId/:strTransId",
  ticketCancel.cancelTicket,
);
commonRouter.get("/temp-cancel/:CinemaId/:strTransId", booking.tempCancel);
commonRouter.post(
  "/booking-details-by-transid",
  booking.bookingDetailsByTransId,
);
commonRouter.get(
  "/price-details/:pGroupCode/:cinemaId",
  price.listPriceDetails,
);
//#endregion

//#region General
commonRouter.get("/get-faqs", user.getFaqListUser);
commonRouter.get("/all-search", user.getAllSearch);
commonRouter.post("/subscribe", user.subscribe);
commonRouter.post("/submit-feedback", general.saveFeedBack);
commonRouter.post("/submit-advertisement", general.saveAdvertisement);
commonRouter.post("/submit-career", ImageUpload, general.saveCareer);
commonRouter.get("/check-voucher", general.getFranchiseVoucher);
//#endregion

//#region Payment
commonRouter.post("/create-order", payment.initOrder);
commonRouter.post(
  "/refund-payment",
  auth,
  ticketCancel.refundPaymentWithCondition,
);
commonRouter.post("/redirect-as-per-response", payment.paymentVerification);
//#endregion

//#region Movies & cinema
commonRouter.get("/item-details-by-cinema/:id", foodAndBvg.foodItemByCinemaId);
commonRouter.post("/add-conssesion", foodAndBvg.addConcessions);
commonRouter.get(
  "/upcoming-movies",
  cacheMiddleware(cacheKeys.upcomingMovieData),
  movies.upcomingMovies,
);
commonRouter.get("/seat-filter", dataSync.filterSeat);
commonRouter.get("/near-by-region/:lat/:long", region.calculateRegionDistance);
//#endregion
commonRouter.get("/get-cinema", getCinemas);

//#region Vista Direct API (No DB operations)
commonRouter.get("/vista-direct/movies", vistaDirect.getVistaMoviesByCinema);
commonRouter.get("/vista-direct/shows", vistaDirect.getVistaShowsByCinema);
//#endregion
commonRouter.get(
  "/get-loyaity-memberShip",
  cacheMiddleware(cacheKeys.membershipData),
  MemberShipController1.getLoyalityMemberShipDetails,
);

commonRouter.get(
  "/get-subscription-list",
  SubscriptionController.getAllSubscription,
);

commonRouter.get(
  "/franchise-payment-status/:transactionId/:trackingId?",
  getFranchisePaymentStatus,
);

commonRouter.get('/transaction-details/:transId', booking.getTransactionPaymentResponse);

export { commonRouter };
