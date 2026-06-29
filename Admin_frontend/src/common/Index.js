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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
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

import {
  useNavigate,
  useParams,
  useLocation,
  Link as routeLink,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Autocomplete from "@mui/material/Autocomplete";
import ClearIcon from "@mui/icons-material/Clear";
import MenuIcon from "@mui/icons-material/MoreVert";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { Check } from "@mui/icons-material";

const Index = {
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
};

export default Index;
