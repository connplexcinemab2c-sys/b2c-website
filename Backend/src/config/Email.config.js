import nodemailer from "nodemailer";
dotenv.config();
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
sgMail.setApiKey(process.env.MAIL_PASSWORD);

// Create a SendGrid transport
export const transporter = sgMail;

// module.exports = transporter;
export const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
