import Header from "../components/user/defaultLayout/Header";
import Footer from "../components/user/defaultLayout/Footer";
import Jpg from "../assets/Jpg";
import Png from "../assets/Png";
import Svg from "../assets/Svg";
import Gif from "../assets/Gif";
import Pdf from "../assets/Pdf";
import MovieCard from "../components/common/MovieCard";
import TrailerModal from "../components/common/TrailerModal";
import ReviewModal from "../components/common/ReviewModal";
import ProductCard from "../components/common/ProductCard";
import BannerImage from "../components/common/BannerImage";
import Button from "../components/common/Button";
import SeatIcon from "../components/icons/SeatIcon";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InfoIcon from "@mui/icons-material/Info";
import Loader from "../components/common/Loader";
import Membership from "../components/common/Membership";
import { Api } from "../config/Api";
import {
  IMAGES_API_ENDPOINT,
  apiGetHandler,
  apiPostHandler,
  apiPostHandlerXml,
} from "../config/DataService";
import { useDispatch, useSelector } from "react-redux";
import {
  contactUsSchema,
  userDetailsSchema,
  accountDetailsPhoneSchema,
  accountDetailsEmailSchema,
  otpSchema,
  applyTwentyMinFranchiseScheme,
  adWithUsSchema,
  careersWithUsSchema,
  feedbackSchema,
  redeemWelcomeGiftSchema,
} from "../validation/FormikValidation";
import { toast } from "react-toastify";
import { Formik, useFormikContext } from "formik";
import moment from "moment/moment";
import momentTimezone from "moment-timezone";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  getOtpTimer,
  getUserData,
  hideLoader,
  showLoader,
  upcomingMoviesList,
  getCinemaData,
  updateMovieFilter
} from "../redux/user/action";
import PropTypes from "prop-types";
import Login from "./auth/login/Login";
import QRCode from "qrcode.react";
import OTPInput from "react-otp-input";
import { FormHelperText, List, ListItem, Tooltip } from "@mui/material";
import Datetime from "react-datetime";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, FreeMode } from "swiper/modules";
import ReportIssueModal from "../components/common/ReportIssueModal";
import InvestorSection from "./pages/user/investorSection/InvestorSection";



const PagesIndex = {
  getCinemaData,
  Tooltip,
  Header,
  Footer,
  Jpg,
  Png,
  Svg,
  Gif,
  Pdf,
  MovieCard,
  ProductCard,
  BannerImage,
  Button,
  SeatIcon,
  Loader,
  Membership,
  Api,
  apiGetHandler,
  apiPostHandler,
  useDispatch,
  useSelector,
  IMAGES_API_ENDPOINT,
  contactUsSchema,
  toast,
  Formik,
  userDetailsSchema,
  useFormikContext,
  moment,
  momentTimezone,
  TrailerModal,
  useParams,
  hideLoader,
  showLoader,
  upcomingMoviesList,
  PropTypes,
  useLocation,
  createSearchParams,
  useNavigate,
  Login,
  QRCode,
  apiPostHandlerXml,
  OTPInput,
  accountDetailsPhoneSchema,
  accountDetailsEmailSchema,
  FormHelperText,
  otpSchema,
  getUserData,
  Datetime,
  Swiper,
  SwiperSlide,
  Autoplay,
  EffectFade,
  Navigation,
  getOtpTimer,
  applyTwentyMinFranchiseScheme,
  ReviewModal,
  CalendarMonthIcon,
  InfoIcon,
  adWithUsSchema,
  careersWithUsSchema,
  ReportIssueModal,
  List,
  ListItem,
  updateMovieFilter,
  InvestorSection,
  redeemWelcomeGiftSchema
};
export default PagesIndex;
