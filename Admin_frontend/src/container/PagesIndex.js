import Svg from "../assests/Svg";
import Png from "../assests/Png";
import Jpg from "../assests/Jpg";
import { Formik, FieldArray } from "formik";

import {
  Link,
  useNavigate,
  Navigate,
  useLocation,
  useParams,
  createSearchParams,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import {
  rolePermissionSchema,
  regionSchema,
  subAdminAddScema,
  cinemaSchema,
  movieSchema,
  actorManagementSchema,
  actorManagementEditSchema,
  sliderSchema,
  bannerSchema,
  subAdminEditScema,
  movieEditSchema,
  cinemaEditSchema,
  regionEditSchema,
  sliderEditSchema,
  bannerEditSchema,
  generalSettingSchema,
  gallerySchema,
  galleryEditSchema,
  galleryImageSchema,
  fAndBSchema,
  FAQSchema,
  aboutUsCmsSchema,
  cmsSchema,
  partnerSchema,
  partnerEditSchema,
  galleryImageEditSchema,
  bookingSchema,
  ecommerceBannerEditSchema,
  feeSchema
} from "../validation/FormikValidation";

import {
  addEditCategorySchema,
  productValidationSchema,
  attributeValidationSchema,
  sellerValidationSchema,
} from "../validation/EcommerceValidation";

import { Api } from "../config/Api";
import { EcommerceApi } from "../config/EcommerceApi";
import DataService, { IMAGES_API_ENDPOINT } from "../config/DataService";
import EcommerceService, {
  ECOMMERCE_IMAGES_API_ENDPOINT,
} from "../config/EcommerceService";
import DeleteModal from "../common/DeleteModal";
import dayjs from "dayjs";
import moment from "moment/moment";
import CustomToggleButton from "../common/button/CustomToggleButton";
import * as XLSX from "xlsx";
import ChartTopLocations from "../common/charts/ChartTopLocations";
import ChartAppDownloads from "../common/charts/ChartAppDownloads";
export const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};
const PagesIndex = {
  bookingSchema,
  fAndBSchema,
  sliderEditSchema,
  bannerEditSchema,
  regionEditSchema,
  cinemaEditSchema,
  movieEditSchema,
  subAdminEditScema,
  useParams,
  sliderSchema,
  bannerSchema,
  IMAGES_API_ENDPOINT,
  DeleteModal,
  Svg,
  Png,
  Jpg,
  dayjs,
  Formik,
  FieldArray,
  Link,
  useSelector,
  useDispatch,
  useLocation,
  useNavigate,
  Navigate,
  toast,
  ToastContainer,
  regionSchema,
  rolePermissionSchema,
  subAdminAddScema,
  cinemaSchema,
  movieSchema,
  actorManagementSchema,
  Api,
  DataService,
  moment,
  generalSettingSchema,
  gallerySchema,
  galleryEditSchema,
  createSearchParams,
  galleryImageSchema,
  FAQSchema,
  actorManagementEditSchema,
  CustomToggleButton,
  XLSX,
  aboutUsCmsSchema,
  cmsSchema,
  partnerSchema,
  partnerEditSchema,
  galleryImageEditSchema,
  EcommerceService,
  ECOMMERCE_IMAGES_API_ENDPOINT,
  EcommerceApi,
  addEditCategorySchema,
  productValidationSchema,
  attributeValidationSchema,
  sellerValidationSchema,
  ecommerceBannerEditSchema,
  feeSchema,
  style,
  ChartTopLocations,
  ChartAppDownloads
};

export default PagesIndex;
