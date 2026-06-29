import {
  Box,
  FormHelperText,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Link,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextareaAutosize,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  Switch,
  styled,
  alpha,
  Modal,
  Menu,
  Collapse,
  Stack,
  Pagination,
  SwipeableDrawer,
  InputBase,
  Tooltip,
  TablePagination,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Input,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel"; // Correct import

import Visibility from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InputLabel from "@mui/material/InputLabel";
import MailIcon from "@mui/icons-material/Mail";
import {
  useNavigate,
  useParams,
  useLocation,
  Link as routeLink,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productValidationSchema } from "../validation/EcommerceValidation";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Autocomplete from "@mui/material/Autocomplete";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/MoreVert";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Check } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import PlaceIcon from "@mui/icons-material/Place";
import SwipeIcon from "@mui/icons-material/Swipe";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import MovieIcon from "@mui/icons-material/Movie";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import DvrIcon from "@mui/icons-material/Dvr";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoIcon from "@mui/icons-material/Info";
import PolicyIcon from "@mui/icons-material/Policy";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import CollectionsIcon from "@mui/icons-material/Collections";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ListItemText from "@mui/material/ListItemText";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import SyncIcon from "@mui/icons-material/Sync";
import ReviewsIcon from "@mui/icons-material/Reviews";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import WorkIcon from "@mui/icons-material/Work";
import HandshakeIcon from "@mui/icons-material/Handshake";
import ArticleIcon from "@mui/icons-material/Article";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import Loader from "../common/Loader";
import Drawer from "@mui/material/Drawer";
import PercentIcon from "@mui/icons-material/Percent";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import StarsIcon from "@mui/icons-material/Stars";
import SellIcon from "@mui/icons-material/Sell";
import DoneIcon from "@mui/icons-material/Done";
import { LoadingButton } from "@mui/lab";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import { FieldArray } from "formik";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import UpcomingIcon from "@mui/icons-material/Upcoming";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const Index = {
  DoneIcon,

  PercentIcon,
  AttachMoneyIcon,
  Drawer,
  Loader,
  TablePagination,
  Check,
  Grid,
  InputLabel,
  Box,
  FormHelperText,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  VisibilityOff,
  Visibility,
  Link,
  List,
  ListItem,
  MailIcon,
  // Svg,
  // Png,
  // Sidebar,
  // Header,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  // PaidLable,
  // FailedLable,
  // PendingLable,
  TextareaAutosize,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  Switch,
  styled,
  alpha,
  Modal,
  Menu,
  ExpandLess,
  ExpandMore,
  Collapse,
  Stack,
  Pagination,
  SwipeableDrawer,
  InputBase,
  // PrimaryButton,
  SearchIcon,
  AccessTimeIcon,
  DeleteIcon,
  ManageAccountsIcon,
  EditIcon,
  // DeleteModal,
  // ParticularModel,
  useDispatch,
  useSelector,
  // moment,
  // dayjs,
  Dialog,
  DialogContent,
  LocalizationProvider,
  AdapterDayjs,
  DatePicker,
  VisibilitySharpIcon,
  useNavigate,
  useParams,
  useLocation,
  routeLink,
  DemoContainer,
  DemoItem,
  AddCircleIcon,
  Autocomplete,
  ClearIcon,
  MenuIcon,
  // DeleteSheetModal,
  DashboardIcon,
  DomainAddIcon,
  ContactPageIcon,
  PlaceIcon,
  SwipeIcon,
  LocationCityIcon,
  MovieIcon,
  RecentActorsIcon,
  DvrIcon,
  GavelIcon,
  InfoIcon,
  PolicyIcon,
  CurrencyExchangeIcon,
  LockPersonIcon,
  CollectionsIcon,
  FastfoodIcon,
  LocalActivityIcon,
  ViewCarouselIcon,
  ListItemText,
  PeopleIcon,
  ReceiptLongIcon,
  SubscriptionsIcon,
  LiveHelpIcon,
  SyncIcon,
  ReviewsIcon,
  RateReviewIcon,
  AdsClickIcon,
  WorkIcon,
  Tooltip,
  TablePagination,
  HandshakeIcon,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  ExpandMoreIcon,
  ArticleIcon,
  LocalOfferIcon,
  ReportProblemIcon,
  GroupAddIcon,
  PointOfSaleIcon,
  StarsIcon,
  SellIcon,
  LoadingButton,
  CircularProgress,
  DownloadIcon,
  Input,
  CancelIcon,
  FieldArray,
  productValidationSchema,
  CheckCircleRoundedIcon,
  TimePicker,
  CardGiftcardIcon,
  PlayCircleFilledIcon,
  UpcomingIcon,
  CalendarMonthIcon,
  CalendarTodayIcon,
};

export default Index;
