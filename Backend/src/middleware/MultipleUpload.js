import multer from "multer"
import { StatusCodes } from "http-status-codes";
import ResponseMessage from "../utils/ResponseMessage.js";

var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function (request, file, callback) {
    var ext = file.originalname.split(".");
    // callback(null, Date.now() + "." + ext[ext.length - 1]);
    callback(null, Date.now() + file.originalname);
  },
});
var upload = multer({ storage }).any();
async function Multiple(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: ResponseMessage.SOMETHING_WENT_WRONG,
        data: err.message,
      });
    }
    if (req.files) {
      let sliderImages = []
      const singelImage = req.files.filter((fImage) => {
        return fImage.fieldname == 'image'
      })
      const multipleImage = req.files.filter((fImage) => {
        return fImage.filename

      })

      if (singelImage.length) {
        req.fileurl = singelImage[0].filename
      } if (singelImage) {       
        multipleImage.filter((filterImages) => {

          sliderImages.push(filterImages.filename)
        })
        req.sliderImages = sliderImages
      }
    } 
    next();
  });
};
export default Multiple;