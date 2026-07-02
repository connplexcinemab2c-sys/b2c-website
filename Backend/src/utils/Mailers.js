import dotenv from "dotenv";
import ejs from "ejs";
// import pdf from "html-pdf";
// import pdf from "html-pdf";
import html_to_pdf from "html-pdf-node";
import path from "path";
import QRCode from "qrcode";
import { fileURLToPath } from "url";
import { smtpTransporter, transporter } from "../config/Email.config.js";
import fs from "fs/promises";
import moment from "moment";
import Rewards from "../models/Rewards.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
//#region booking success mail

// icons
const getLinkAndIcons = () => {
  const brandLink = "https://www.theconnplex.com/";
  const connplexLogo = `${process.env.LIVE_IMAGE_URL}/Connplex-logo.png`;
  const facebookIcon = `${process.env.LIVE_IMAGE_URL}/facebook-icon.png`;
  const twitterIcon = `${process.env.LIVE_IMAGE_URL}/twitter-icon.png`;
  const instaIcon = `${process.env.LIVE_IMAGE_URL}/instagram-icon.png`;
  const linkedinIcon = `${process.env.LIVE_IMAGE_URL}/linkdin-icon.png`;
  const youtubeIcon = `${process.env.LIVE_IMAGE_URL}/youtube-icon.png`;

  return {
    brandLink,
    connplexLogo,
    facebookIcon,
    twitterIcon,
    instaIcon,
    linkedinIcon,
    youtubeIcon,
  };
};

export const bookingSuccess = async (data) => {
  let to = [data.email];
  let url = data.url;
  let message = data.message;
  ejs.renderFile(
    path.join(__dirname, "../views/Booking.ejs"),
    { data, url, message, ...getLinkAndIcons() },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "Your Movie Ticket Booking Confirmation",
            html: data,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message, "error in sent mail");
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};
//#endregion

//#region Verification mail
export const emailVerification = (data) => {
  let to = [data.email];
  let otpCode = data.otp;
  return new Promise((resolve) => {
    ejs.renderFile(
      path.join(__dirname, "../views/EmailVerification.ejs"),
      { data, otpCode, ...getLinkAndIcons() },
      (err, renderData) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          const apiKey = process.env.MAIL_PASSWORD;
          if (!apiKey || !apiKey.startsWith("SG.")) {
            console.log("-----------------------------------------");
            console.log(`[EMAIL MOCK] Sending verification OTP to: ${to}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log("-----------------------------------------");
            resolve(true);
            return;
          }

          const mailOptions = {
            from: process.env.FROM_MAIL || "no-reply@connplex.com",
            to: to,
            subject: `${otpCode} is your ConnPlex OTP`,
            html: renderData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              console.log(error.message);
              resolve(false);
            } else {
              console.log("Message %s", info[0].statusCode);
              resolve(true);
            }
          });
        }
      },
    );
  });
};

//#endregion
//#region Forgot Password mail
export const emailForgotPassword = (data) => {
  let to = [data.email];
  let otpCode = data.otpCode;
  let brandLink = "https://www.theconnplex.com/";
  return new Promise((resolve) => {
    ejs.renderFile(
      path.join(__dirname, "../views/forgotPassword.ejs"),
      { otpCode, brandLink },
      (err, renderData) => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          const apiKey = process.env.MAIL_PASSWORD;
          if (!apiKey || !apiKey.startsWith("SG.")) {
            console.log("-----------------------------------------");
            console.log(`[EMAIL MOCK] Sending forgot password OTP to: ${to}`);
            console.log(`OTP Code: ${otpCode}`);
            console.log("-----------------------------------------");
            resolve(true);
            return;
          }

          const mailOptions = {
            from: process.env.FROM_MAIL || "no-reply@connplex.com",
            to: to,
            subject: `${otpCode} is your ConnPlex OTP`,
            html: renderData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              console.log(error.message);
              resolve(false);
            } else {
              console.log("Message %s", info[0].statusCode);
              resolve(true);
            }
          });
        }
      },
    );
  });
};
//#endregion

//#region Newsletter Confirmation mail
export const emailNewsletter = async (data) => {
  let to = [data.email];
  let brandLink = "https://www.theconnplex.com/";
  ejs.renderFile(
    path.join(__dirname, "../views/EmailNewsletter.ejs"),
    { brandLink },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "Welcome to ConnPlex Newsletter!",
            html: data,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};
//#endregion

//#region Contact Us Confirmation mail
export const emailContactUs = async (data) => {
  let to = [data.email, "sumitpanchal.vhits@gmail.com"];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailContactUs.ejs"),
    { ...getLinkAndIcons() },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "Thank you for contacting us!",
            html: data,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};
//#endregion

//#region ApplyForTwentyMinFranchise Confirmation mail
export const emailApplyForTwentyMinFranchise = async (data) => {
  console.log({ data }, "emailApplyForTwentyMinFranchise data");
  const to = [data.email];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForTwentyMinFranchise.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
            to: to,
            subject:
              "Thank you for applying for our 20-minute franchise opportunity!",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};
//#endregion

//#region ApplyForFranchise Confirmation mail
export const emailApplyForFranchise = async (data) => {
  const to = [
    data.email,
    // process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
    "sumitpanchal.vhits@gmail.com",
  ];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForFranchise.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
            to: to,
            subject: "Thank you for applying for our franchise opportunity!",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};

//#endregion

//#region dataSync Mail
export const dataSyncMail = async (data) => {
  let to = data.email;
  let status = data.status;
  ejs.renderFile(
    path.join(__dirname, "../views/DataSync.ejs"),
    { status, syncResults: data.syncResults },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "Data Sync Status",
            html: data,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};
//#endregion

//#region Ticket Booking pdf
export const generateTicketBookingPdf = async (data) => {
  // Find earned reward coins for this transaction (if any) to display in ticket PDF
  const rewardDetails = await Rewards.findOne({ transactionId: data._id, type:"earned" }).sort({ createdAt: -1 });
  const earnRewads = rewardDetails?.coins || 0;
  //
  const rewardAppliedDiscount = data?.finalBookingCalculation?.rewardDiscountApplied || 0;
  const rewardCoinsRedeemed = data?.finalBookingCalculation?.rewardCoinsRedeemed || 0;

  let convenienceFees =
    data?.finalBookingCalculation?.convenienceFeesObject?.total > 0
      ? parseFloat(
          data?.finalBookingCalculation?.convenienceFeesObject?.total,
        ).toFixed(2)
      : "0.00";

  let fAndBDetails = data?.fAndBDetails;

  let netTicketCharge = parseFloat(
    data?.addSeatData?.curTicketsTotal -
      data?.addSeatData?.curTicketsTax1 -
      data?.addSeatData?.curTicketsTax2,
  ).toFixed(2);

  let noOfTicket = data?.setSeatData?.strSeatInfo
    .split(" - ")[1]
    .split(",").length;

  let movieDate = moment(data?.showId?.sessionRealShow)
    .utcOffset("+05:30")
    .format("DD MMM YYYY");

  let movieTime = moment(data?.showId?.sessionRealShow)
    .utcOffset("+05:30")
    .format("hh:mm A");

  // let QRCodeTicket = await QRCode.toDataURL(`https://ticketing.theconnplex.com/download-ticket?transId=${data.initTransId}`);
  let QRCodeTicket = await QRCode.toDataURL(`${data?.addSeatData?.strBookId}`);

  let GSTIN = data?.cinemaId?.GSTNumber;

  return new Promise((resolve, reject) => {
    // Render the EJS template to HTML
    ejs.renderFile(
      path.join(__dirname, "../views/TicketBookingPDF.ejs"),
      {
        data: data,
        convenienceFees: convenienceFees,
        netTicketCharge: netTicketCharge,
        noOfTicket: noOfTicket,
        movieDate: movieDate,
        movieTime: movieTime,
        QRCodeTicket: QRCodeTicket,
        fAndBDetails: fAndBDetails,
        gstIn: GSTIN,
        connplexLogo: `${process.env.LIVE_IMAGE_URL}/Connplex-logo.png`,
        rewardAppliedDiscount: rewardAppliedDiscount,
        rewardCoinsRedeemed: rewardCoinsRedeemed,
        earnRewads: earnRewads,
      },
      async (err, html) => {
        if (err) {
          console.log(err);
          reject("Internal Server Error");
          return;
        }
        const options = {
          format: "A4", // PDF format
          printBackground: true,
        };
        const file = {
          content: html,
        };
        html_to_pdf
          .generatePdf(file, options)
          .then((pdfBuffer) => {
            resolve(pdfBuffer);
          })
          .catch((err) => {
            console.log(err, ":err");
            reject("Internal Server Error");
          });
      },
    );
  });
};
//#

export const ReportAndIssueMail = async (reportIssuelist) => {
  const toEmail = [
    "marketing@theconnplex.com",
    "finance@theconnplex.com",
    "gm.fnb@theconnplex.com",
    "vp@theconnplex.com",
    "gm.operations@theconnplex.com",
    "it@theconnplex.com",
    "nikita.vhits@gmail.com",
  ];
  let Date = moment(reportIssuelist[0].date)
    .utcOffset("+05:30")
    .format("YYYY-MM-DD HH:mm:ss");
  const mailInfo = await ejs.renderFile(
    path.join(__dirname, "../views/reportIssue.ejs"),
    {
      name: reportIssuelist[0].name,
      email: toEmail,
      date: Date,
      CinemaName: reportIssuelist[0].cinemaObjectId.cinemaName,
      TransactionType: reportIssuelist[0].transaction_type,
      description: reportIssuelist[0].description,
      mobileNumber: reportIssuelist[0].mobileNumber,
    },
  );

  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.FROM_MAIL,
      to: toEmail,
      subject: "Report Issue",
      html: mailInfo,
    };
    transporter.send(mailOptions, (error, info) => {
      if (error) {
        reject(error.message);
        console.log(error.message, "error");
      } else {
        resolve(1);
        console.log(error.message, "error");
      }
    });
  });
};
export const emailApplyForGroupBooking = async (data) => {
  const to = [
    data.email,
    // process.env.FROM_GROUP_BOOKING,
    "sumitpanchal.vhits@gmail.com",
  ];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForGroupBooking.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: "bookings@theconnplex.com",
            to: to,
            subject: "Thank you for applying for our Group Booking",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message, "err mail");
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};
export const emailApplyForInfluencer = async (data) => {
  const to = [
    data.email,
    "sumitpanchal.vhits@gmail.com",
    // process.env.FROM_BRAND_INFLUENCER,
  ];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForInfluencer.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_BRAND_INFLUENCER,
            to: to,
            subject: "Thank you for applying to become a brand Influencer",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};
export const emailApplyForFeedback = async (data) => {
  const to = [
    data.email,
    "sumitpanchal.vhits@gmail.com",
    // process.env.FROM_FEEDBACK,
  ];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForFeedback.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_FEEDBACK,
            to: to,
            // cc: cc,
            subject: "Thank you for your valuable feedback",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};

export const emailApplyForCareer = async (data) => {
  const to = [
    data.email,
    "sumitpanchal.vhits@gmail.com",
    // process.env.FROM_CAREER,
  ];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForCareer.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_CAREER,
            to: to,
            subject: "Thank you for applying for career",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};

export const emailApplyForAdvertisement = async (data) => {
  const to = [
    data.email,
    "sumitpanchal.vhits@gmail.com",
    // process.env.FROM_ADVERTISE_WITH_US,
  ];
  ejs.renderFile(
    path.join(__dirname, "../views/EmailApplyForAdvertisement.ejs"),
    { ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_ADVERTISE_WITH_US,
            to: to,
            subject: "Thank you for applying for advertise with us",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info.response);
            }
          });
        });
      }
    },
  );
};

export const assignPrivateCoupon = async (data) => {
  console.log(data, "checking data...");

  let to = [data.email];
  console.log(to, "checking email...");
  console.log(process.env.FROM_MAIL, "checking env...");

  ejs.renderFile(
    path.join(__dirname, "../views/PrivateCoupon.ejs"),
    { data },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: `your private Coupon Code`,
            html: data,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message);
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};

// Ticket Booking Failed Mail
export const BookingFailed = async (data) => {
  let to = [data.email];
  let url = data.url;
  let message = data.message;
  ejs.renderFile(
    path.join(__dirname, "../views/BookingFailed.ejs"),
    { data: data, url: url, message: message },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "Movie Ticket Booking Failed",
            html: data,
          };

          console.log(mailOptions, ":mailOptions");
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.message, "error in sent mail");
            } else {
              resolve(1);
              console.log("Message %s", info[0].statusCode);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the details of user for the franchise
export const emailAdminForFranchise = async (userData) => {
  const to = [
    process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
    "mayankacharya.vhits@gmail.com",
    "sales@theconnplex.com",
  ];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForFranchise.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
            to: to,
            subject: "New Franchise Application Received",
            html: htmlData,
          };
          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the details of user for the franchise
export const emailAdminForInfluencer = async (userData) => {
  const to = [
    process.env.FROM_BRAND_INFLUENCER,
    "mayankacharya.vhits@gmail.com",
  ];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForInfluencer.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_BRAND_INFLUENCER,
            to: to,
            subject: "New Influencer Application Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the details of user for the franchise
export const emailAdminForGroupBooking = async (userData) => {
  const to = [process.env.FROM_GROUP_BOOKING, "mayankacharya.vhits@gmail.com"];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForGroupBooking.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_GROUP_BOOKING,
            to: to,
            subject: "New Group Booking Application Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the details of user for the twenty min franchise
export const emailAdminForTwentyMinFranchise = async (userData) => {
  const to = [
    process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
    "mayankacharya.vhits@gmail.com",
    "sales@theconnplex.com",
  ];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForTwentyMinFranchise.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL_APPLY_FOR_FRANCHISE,
            to: to,
            subject: "New 20-minute Franchise Application Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the contact us details
export const emailAdminForContactUs = async (userData) => {
  const to = [process.env.FROM_MAIL, "mayankacharya.vhits@gmail.com"];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForContactUs.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_MAIL,
            to: to,
            subject: "New Contact Us Application Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the feedback
export const emailAdminForFeedback = async (userData) => {
  const to = [process.env.FROM_FEEDBACK, "mayankacharya.vhits@gmail.com"];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForfeedback.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_FEEDBACK,
            to: to,
            subject: "New Feedback Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the advertisement
export const emailAdminForAdvertisement = async (userData) => {
  const to = [
    process.env.FROM_ADVERTISE_WITH_US,
    ,
    "mayankacharya.vhits@gmail.com",
  ];

  ejs.renderFile(
    path.join(__dirname, "../views/EmailAdminForAdvertisement.ejs"),
    { ...userData, ...getLinkAndIcons() },
    (err, htmlData) => {
      if (err) {
        console.log(err);
      } else {
        return new Promise(function (resolve, reject) {
          const mailOptions = {
            from: process.env.FROM_ADVERTISE_WITH_US,
            to: to,
            subject: "New Advertisement Application Received",
            html: htmlData,
          };

          transporter.send(mailOptions, (error, info) => {
            if (error) {
              reject(error.message);
              console.log(error.response.body.errors);
            } else {
              resolve(1);
              console.log("Admin Notification Sent: %s", info.response);
            }
          });
        });
      }
    },
  );
};

// #region send email to admin for the advertisement
export const emailAdminForCareer = async (userData) => {
  const to = [process.env.FROM_CAREER, "mayankacharya.vhits@gmail.com"];

  try {
    const htmlData = await ejs.renderFile(
      path.join(__dirname, "../views/EmailAdminForCareer.ejs"),
      { ...userData, ...getLinkAndIcons() },
    );

    const attachmentPath = path.join(__dirname, userData?.filePath);
    let attachments = [];

    try {
      const fileContent = await fs.readFile(attachmentPath, {
        encoding: "base64",
      });
      attachments.push({
        content: fileContent,
        filename: `${userData?.firstName} ${userData?.lastName}.pdf`,
        type: "application/octet-stream",
        disposition: "attachment",
      });
    } catch (error) {
      console.log(`File not found or inaccessible: ${attachmentPath}`);
    }

    const mailOptions = {
      from: process.env.FROM_CAREER,
      to: to,
      subject: "New Career Application Received",
      html: htmlData,
      attachments: attachments,
    };

    const info = await transporter.send(mailOptions);
    console.log("Admin Notification Sent: %s", info.response);
    return info;
  } catch (error) {
    console.error("Error in emailAdminForCareer:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

// #region send payment confirmation email to user
export const emailUserPaymentConfirmation = async (userData) => {
  const to = userData?.email;
  const cc = process.env.FINANCE_CC_EMAIL;

  try {
    const htmlData = await ejs.renderFile(
      path.join(__dirname, "../views/EmailUserPaymentConfirmation.ejs"),
      { ...userData, ...getLinkAndIcons() },
    );

    const mailOptions = {
      to,
      cc,
      from: process.env.FROM_MAIL,
      subject: "Payment Confirmation – Connplex Cinemas Limited",
      html: htmlData,
    };

    await smtpTransporter.sendMail(mailOptions);

    console.log("User Payment Confirmation Sent:", to);
    return true;
  } catch (error) {
    console.error(
      "Payment Email Error:",
      error?.response?.body || error?.message || error,
    );
    return false;
  }
};

// #endregion
