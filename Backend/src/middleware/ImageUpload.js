import multer from "multer";
import multerS3 from "multer-s3";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../utils/ResponseMessage.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/S3.js"; // AWS S3 config
import fs from "fs";
import path from "path";

const hasValidAWSCredentials = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== "dummy_access_key" && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_SECRET_ACCESS_KEY !== "dummy_secret_key" && 
  process.env.S3_BUCKET_NAME && 
  process.env.S3_BUCKET_NAME !== "dummy-bucket";

let storage;

if (hasValidAWSCredentials) {
  storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = file.originalname.split(".").pop();
      cb(null, `uploads/${Date.now()}.${ext}`);
    },
  });
} else {
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = "./public/uploads";
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const ext = file.originalname.split(".").pop();
      cb(null, `${Date.now()}.${ext}`);
    },
  });
}

const upload = multer({ storage }).fields([
  { name: "profile", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "poster", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "slider", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "images" },
  { name: "resume", maxCount: 1 },
  { name: "imageBlog", maxCount: 1 },
  { name: "imageCkeditor" },
  { name: "memberShipImg" },
  { name: "ReportIssueImages" },
  { name: "advertiseWithUsImg" },
  { name: "advertiseBgImg" },
  { name: "careerWithUsImg" },
  { name: "careerBgImg" },
  { name: "couponImage" },
  { name: "notificationImage", maxCount: 1 },
]);

export default function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [err.message],
      });
    }

    if (!req.files) return next();

    Object.keys(req.files).forEach((field) => {
      req.files[field].forEach((file) => {
        const fileNameOnly = file.key ? file.key.split("/").pop() : file.filename;
        file.key = fileNameOnly;
        file.filename = fileNameOnly;
      });
    });

    let sliderImages = [];
    let CkEditorImages = [];
    let ReportIssueImages = [];

    // ✅ SINGLE FILES (KEY = filename only)
    req.profileUrl = req.files.profile?.[0]?.key || "";
    req.posterUrl = req.files.poster?.[0]?.key || "";
    req.pdfUrl = req.files.pdf?.[0]?.key || "";
    req.sliderUrl = req.files.slider?.[0]?.key || "";
    req.bannerUrl = req.files.banner?.[0]?.key || "";
    req.resumeUrl = req.files.resume?.[0]?.key || "";
    req.fileUrl = req.files.memberShipImg?.[0]?.key || "";
    req.advertiseWithUsUrl = req.files.advertiseWithUsImg?.[0]?.key || "";
    req.advertiseBgUrl = req.files.advertiseBgImg?.[0]?.key || "";
    req.careerWithUsUrl = req.files.careerWithUsImg?.[0]?.key || "";
    req.careerWithUsBgUrl = req.files.careerBgImg?.[0]?.key || "";
    req.blogsUrl = req.files.imageBlog?.[0]?.key || "";
    req.couponImageUrl = req.files.couponImage?.[0]?.key || "";
    req.notificationImageUrl = req.files.notificationImage?.[0]?.key || "";

    // ✅ MULTIPLE FILES
    if (req.files.images?.length) {
      req.files.images.forEach((file) => {
        sliderImages.push(file.key);
      });
      req.sliderImages = sliderImages;
    }

    if (req.files.imageCkeditor?.length) {
      req.files.imageCkeditor.forEach((file) => {
        CkEditorImages.push(file.key);
      });
      req.ckEditor = CkEditorImages;
    }

    if (req.files.ReportIssueImages?.length) {
      req.files.ReportIssueImages.forEach((file) => {
        ReportIssueImages.push(file.key);
      });
      req.ReportIssueImages = ReportIssueImages;
    }
    next();
  });
}

export const deleteS3File = async (fileKey) => {
  if (!fileKey) return;
  if (!hasValidAWSCredentials) {
    try {
      const localPath = path.join("./public/uploads", fileKey);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (error) {
      console.error("Local file delete error:", error);
    }
    return;
  }
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${fileKey}`,
    });
    await s3.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw error;
  }
};
