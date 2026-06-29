import Jpg from "../assets/Jpg";
import Png from "../assets/Png";
import Svg from "../assets/Svg";
import Gif from "../assets/Gif";
import Button from "./common/Button";
import Loader from "./common/Loader";
import TrailerModal from "./common/TrailerModal";
import SearchModal from "./common/SearchModal";
import FranchiseModal from "./common/FranchiseModal";
import ReviewModal from "./common/ReviewModal";
import FeedbackModal from "./common/FeedbackModal";
import Login from "../container/auth/login/Login";
import {
  Outlet,
  createSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Formik, FieldArray } from "formik";
import {
  loginValidationSchema,
  otpSchema,
  applyFranchiseScheme,
  accountDetailsEmailSchema,
  applyTwentyMinFranchiseScheme,
  rateAndReview,
  contactUsSchema,
  membershipSchema,
  feedbackSchema,
  applyBrandInfluencerScheme,
  applyGroupBookingScheme,
  reportAnIssueScheme,
} from "../validation/FormikValidation";
import {
  IMAGES_API_ENDPOINT,
  apiGetHandler,
  apiPostHandler,
  apiGetHandlerWithQuery,
} from "../config/DataService";
import { Api } from "../config/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getUserData,
  hideLoader,
  showLoader,
  changeRegion,
  userLogOut,
  getUserToken,
  getOtpTimer,
} from "../redux/user/action";
import OTPInput from "react-otp-input";
import BrandInfluencersModal from "./common/BrandInfluencersModal";
import GroupBookingModal from "./common/GroupBookingModal";
import ReportIssueModal from "./common/ReportIssueModal";
import UnderMaintenance from "./common/UnderMaintenance";

const PagesIndex = {
  reportAnIssueScheme,
  Jpg,
  Png,
  Svg,
  Gif,
  Button,
  Loader,
  Login,
  useNavigate,
  Formik,
  FieldArray,
  loginValidationSchema,
  otpSchema,
  apiGetHandler,
  apiPostHandler,
  Api,
  useDispatch,
  IMAGES_API_ENDPOINT,
  applyFranchiseScheme,
  applyBrandInfluencerScheme,
  applyGroupBookingScheme,
  toast,
  useSelector,
  TrailerModal,
  SearchModal,
  FranchiseModal,
  BrandInfluencersModal,
  GroupBookingModal,
  ReviewModal,
  FeedbackModal,
  showLoader,
  hideLoader,
  OTPInput,
  getUserData,
  changeRegion,
  userLogOut,
  createSearchParams,
  getUserToken,
  Outlet,
  getOtpTimer,
  apiGetHandlerWithQuery,
  accountDetailsEmailSchema,
  applyTwentyMinFranchiseScheme,
  useLocation,
  rateAndReview,
  contactUsSchema,
  membershipSchema,
  feedbackSchema,
  ReportIssueModal,
  UnderMaintenance,
};

export default PagesIndex;
