import Svg from "../assests/Svg";
import Png from "../assests/Png";
import { Formik } from "formik";

import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  rolePermissionSchema,
  regionSchema,
  subAdminAddScema,
  cinemaSchema,
  movieSchema
} from "../validation/FormikValidation";
import {Api} from "../config/Api"
import DataService from "../config/DataService";

const PagesIndex = {
  Svg,
  Png,
  Formik,
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
  Api,
  DataService,
  
};

export default PagesIndex;
