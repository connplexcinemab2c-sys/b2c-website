import "dotenv/config";
import cors from "cors";
import { CronJob } from "cron";
import * as dotenv from "dotenv";
import fs from "fs";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./src/config/S3.js";
import ejs from "ejs";
import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { dbConnection } from "./src/config/Db.config.js";
import { cinemaSyncBatch, syncAllCinema } from "./src/controller/admin/DataSync.js";
import { downloadBookingTicketAsPDF } from "./src/controller/user/GeneralController.js";
import { router } from "./src/routes/AdminRoute.js";
import { commonRouter } from "./src/routes/CommonRoutes.js";
import { userRouter } from "./src/routes/UserRoute.js";
import {
  globalNotification,
  reminderNotification,
} from "./src/services/Notification.js";
import { removeCoupanJob } from "./src/services/vistaServices/promotionCoupan.js";
import { expireRewardsPoints } from "./src/services/ExpireRewardsJob.js";
import { ensureIndexes } from "./src/utils/dbIndexer.js";
import { razorpayRecoverPendingPayments } from "./src/services/razorpay/RazorpayCronJob.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dbConnection();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
    "application/form-data",
    "multipart/form-data"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.get("/api/uploads/:file", async (req, res) => {
  try {
    const fileName = path.basename(req.params.file);
    const localPath = path.join(__dirname, "public", "uploads", fileName);

    // 1. Try to serve from local disk first (for legacy files)
    if (fs.existsSync(localPath)) {
      return res.sendFile(path.resolve(localPath));
    }

    // 2. Otherwise, fetch from AWS S3
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${fileName}`,
    });
    const s3Response = await s3.send(command);

    // Set correct content type
    res.setHeader("Content-Type", s3Response.ContentType || "image/jpeg");
    
    // Pipe the S3 stream directly to the response
    s3Response.Body.pipe(res);
  } catch (error) {
    console.error("S3 fetch error:", error);
    res.status(404).send("File not found");
  }
});
app.use(
  session({
    secret: "secr3t",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/admin", router);
app.use("/api/user", userRouter);
app.use("/api", commonRouter);
app.set("views", __dirname + "/src/views");
app.engine("html", ejs.renderFile);
app.set("view engine", "ejs");
const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};
app.get("/api/auth/google/success", isLoggedIn, (req, res) => {
  res.send({ user: req.user });
});
app.get("/t/:initTransId", async (req, res) => {
  try {
    const { initTransId } = req.params;
    let frontendUrl =
      process.env.FRONTEND_BASE_URL ||
      process.env.FRONTEND_BASE_URL_PRODUCTION ||
      "https://ticketing.theconnplex.com";
    if (frontendUrl.endsWith("/")) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    res.redirect(`${frontendUrl}/my-ticket?transId=${initTransId}`);
  } catch (error) {
    console.error("Error in ticket redirect:", error);
    res.status(500).send("Something went wrong");
  }
});
app.get("/:initTransId", async (req, res) => {
  try {
    const { initTransId } = req.params;
    let frontendUrl =
      process.env.FRONTEND_BASE_URL ||
      process.env.FRONTEND_BASE_URL_PRODUCTION ||
      "https://ticketing.theconnplex.com";
    if (frontendUrl.endsWith("/")) {
      frontendUrl = frontendUrl.slice(0, -1);
    }
    res.redirect(`${frontendUrl}/my-ticket?transId=${initTransId}`);
  } catch (error) {
    console.error("Error in ticket redirect:", error);
    res.status(500).send("Something went wrong");
  }
});

// const CinemaDataSyncJob = new CronJob(
//   //"30 */2 * * *", //In every 2:30 hours the cron job will run
//   // "    *",
//   "*/5 * * * *",
//   function () {

//     cinemaSyncBatch();

    
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );
// CinemaDataSyncJob.start();

// const globalNotificationCron = new CronJob(
//   "*/15 * * * *", // Every 10 minutes
//   function () {
//     globalNotification();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );
// globalNotificationCron.start();

// const notificationCron = new CronJob(
//   "* * * * *",
//   function () {
//     reminderNotification();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );
// notificationCron.start();

// const DataSyncJob = new CronJob(
//   // "30 */2 * * *",
//   "*/15 * * * *",
//   function () {},
//   null,
//   true,
//   "Asia/Kolkata"
// );
// DataSyncJob.start();
// //
// const coupanRemoveJob = new CronJob(
//   //"30 */2 * * *", //In every 2:30 hours the cron job will run
//   // "    *",
//   "*/18 * * * *", // Every 10 minutes
//   // '* * * * *', // Every 1 minute

//   function () {
//     removeCoupanJob();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );
// coupanRemoveJob.start();

const expireRewardsJob = new CronJob(
  "0 0 * * *", // daily at midnight IST
  function () {
    expireRewardsPoints();
  },
  null,
  true,
  "Asia/Kolkata"
);
expireRewardsJob.start();

const razorpayRecoveryJob = new CronJob(
  "*/5 * * * *", // every 5 minutes
  function () {
    razorpayRecoverPendingPayments();
  },
  null,
  true,
  "Asia/Kolkata"
);
razorpayRecoveryJob.start();



const optimizedSync = new CronJob('*/15 * * * *', async () => {
  console.log('Running cinema sync job...');

  try {
    await ensureIndexes();
    await syncAllCinema();

    console.log('Cinema sync completed successfully');
  } catch (error) {
    console.error('Cinema sync failed:', error);
  }
} , null, true, 'Asia/Kolkata');


optimizedSync.start();



app.listen(process.env.PORT || 3020, "0.0.0.0", async () => {
  console.log("server is listen at " + process.env.PORT);
    // await ensureIndexes();
    // await syncAllCinema();

});
