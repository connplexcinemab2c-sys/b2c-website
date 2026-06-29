import multer from "multer";
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../utils/ResponseMessage.js";

var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function (request, file, callback) {
    var ext = file.originalname.split(".");
    callback(
      null,
      Date.now() +
        // (Math.random() + 1).toString(36).substring(7) +
        "." +
        ext[ext.length - 1]
    );
  },
});

var upload = multer({ storage }).fields([
  {
    name: "profile",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "poster",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
  {
    name: "slider",
    maxCount: 1,
  },
  {
    name: "banner",
    maxCount: 1,
  },
  {
    name: "images",
  },
  {
    name: "resume",
    maxCount: 1,
  },
  {
    name: "imageBlog",
    maxCount: 1,
  },
  {
    name: "imageCkeditor",
    // maxCount: 1,
  },
  {
    name: "memberShipImg",
  },
  {
    name: "ReportIssueImages",
    // maxCount: 5,
  },
  {
    name: "advertiseWithUsImg",
  },
  {
    name: "advertiseBgImg",
  },
  {
    name: "careerWithUsImg",
  },
  {
    name: "careerBgImg",
  },
  { name: "couponImage" },
  {
    name: "notificationImage",
    maxCount: 1,
  },
]);

export default function (req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      console.log("err", err);
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: [err.message],
      });
    } else {
      if (req.files) {
        let sliderImages = [];
        let CkEditorImages = [],
          ReportIssueImages = [];
        var profile = req.files.profile ? req.files.profile[0].filename : "";
        req.profileUrl = profile;
        var poster = req.files.poster ? req.files.poster[0].filename : "";
        req.posterUrl = poster;
        var pdf = req.files.pdf ? req.files.pdf[0].filename : "";
        req.pdfUrl = pdf;
        var slider = req.files.slider ? req.files.slider[0].filename : "";
        req.sliderUrl = slider;
        var banner = req.files.banner ? req.files.banner[0].filename : "";
        req.bannerUrl = banner;
        var resume = req.files.resume ? req.files.resume[0].filename : "";
        req.resumeUrl = resume;
        var memberShipImage = req.files.memberShipImg
          ? req.files.memberShipImg[0].filename
          : "";

        req.fileUrl = memberShipImage;
        var advertiseWithUsImg = req.files.advertiseWithUsImg
          ? req.files.advertiseWithUsImg[0].filename
          : "";
        req.advertiseWithUsUrl = advertiseWithUsImg;
        var advertiseBgImg = req.files.advertiseBgImg
          ? req.files.advertiseBgImg[0].filename
          : "";
        req.advertiseBgUrl = advertiseBgImg;

        var careerWithUsImg = req.files.careerWithUsImg
          ? req.files.careerWithUsImg[0].filename
          : "";
        req.careerWithUsUrl = careerWithUsImg;
        var careerBgImg = req.files.careerBgImg
          ? req.files.careerBgImg[0].filename
          : "";
        req.careerWithUsBgUrl = careerBgImg;

        var imageBlog = req.files.imageBlog
          ? req.files.imageBlog[0].filename
          : "";
        req.blogsUrl = imageBlog;
        var imageCkeditor = req.files.imageCkeditor
          ? req.files.imageCkeditor.filename
          : "";
        req.ckEditorUrl = imageCkeditor;
        var couponImage = req.files.couponImage
          ? req.files.couponImage[0].filename
          : "";
        req.couponImageUrl = couponImage;
        var notificationImage = req.files.notificationImage
          ? req.files.notificationImage[0].filename
          : "";
        req.notificationImageUrl = notificationImage;
        if (req.files.images && req.files.images.length) {
          const multipleImage = req.files.images.filter((fImage) => {
            return fImage.fieldname == "images";
          });
          if (multipleImage.length) {
            multipleImage.filter((filterImages) => {
              sliderImages.push(filterImages.filename);
            });
            req.sliderImages = sliderImages;
          }
        }

        if (req.files.imageCkeditor && req.files.imageCkeditor.length) {
          const multipleImage = req.files.imageCkeditor.filter((CkImage) => {
            return CkImage.fieldname == "imageCkeditor";
          });
          if (multipleImage.length) {
            multipleImage.filter((filterImages) => {
              CkEditorImages.push(filterImages.filename);
            });
            req.ckEditor = CkEditorImages;
          }
        }
        if (req.files.ReportIssueImages && req.files.ReportIssueImages.length) {
          const IssueImages = req.files.ReportIssueImages.filter((fImage) => {
            return fImage.fieldname == "ReportIssueImages";
          });

          if (IssueImages.length) {
            IssueImages.filter((filterImages) => {
              ReportIssueImages.push(filterImages.filename);
            });

            req.ReportIssueImages = ReportIssueImages;
          }
        }

        next();
      } else {
        next();
      }
    }
  });
}
