import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./AdvertisementRequestFormList.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Index.Box className="children-tab-main">{children}</Index.Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

const Search = Index.styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: Index.alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: Index.alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto"
  }
}));
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24
};
const StyledInputBase = Index.styled(Index.InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch"
    }
  }
}));

const AdvertisementRequestFormList = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState({
    adRequestData: [],
    adImageData: []
  });
  const [adList, setAdList] = useState({
    adRequestData: [],
    adImageData: []
  });
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [value, setValue] = React.useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const requestSearch = (searched, type) => {
    setCurrentPage(0);
    let filteredData = adList[type].filter(
      (data) =>
        (data?.name &&
          data?.name.toLowerCase().includes(searched?.toLowerCase())) ||
        (data?.email &&
          data?.email.toLowerCase().includes(searched?.toLowerCase())) ||
        (data?.mobileNumber &&
          data?.mobileNumber.toString().includes(searched?.toString())) ||
        (data?.brandName &&
          data?.brandName.toLowerCase().includes(searched?.toLowerCase())) ||
        (data?.designation &&
          data?.designation.toLowerCase().includes(searched?.toLowerCase())) ||
        (data?.title &&
          data?.title.toLowerCase().includes(searched?.toLowerCase())) ||
        (data?.description &&
          data?.description.toLowerCase().includes(searched?.toLowerCase())) ||
        (data &&
          data?.createdAt &&
          PagesIndex.moment(data?.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched.toLowerCase()))
    );

    if (type === "adRequestData") {
      setFilteredData((prevState) => ({
        ...prevState,
        adRequestData: filteredData
      }));
    } else if (type === "adImageData") {
      setFilteredData((prevState) => ({
        ...prevState,
        adImageData: filteredData
      }));
    }
  };
  const handleInputChange = (e, type) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue, type);
  };

  const getAdvertisementRequests = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_AD_REQUESTS_LIST)
      .then((res) => {
        let filter = res?.data?.data.filter((item) => !item.title);
        let filterImg = res?.data?.data.filter((item) => item.title);

        setAdList({
          adRequestData: filter,
          adImageData: filterImg
        });
        setFilteredData({
          adRequestData: filter,
          adImageData: filterImg
        });
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleOpen = (details) => {
    setOpen(true);
    setDetails(details);
  };
  const handleClose = () => {
    setOpen(false);
    setDetails("");
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const handleClassRemove = () => {
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_AD_BG, {
      id: id
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        getAdvertisementRequests();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSearchValue("");
    setFilteredData(adList);
    setCurrentPage(0);
    setRowsPerPage(10);
  };

  const generateExcel = async () => {
    const headers = [
      "User",
      "Email",
      "Phone Number",
      "Brand Name",
      "Designation",
      "Message",
      "Date"
    ];
    const rows = filteredData?.adRequestData?.map((item) => ({
      name: item?.name ? item?.name : "-",
      email: item?.email ? item?.email : "-",
      mobileNumber: item?.mobileNumber ? item?.mobileNumber : "-",
      brandName: item?.brandName ? item?.brandName : "-",
      designation: item?.designation ? item?.designation : "-",
      message: item?.message,
      createdAt: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-"
    }));
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Ad Requests");

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `Advertisement_Requests_list_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };
  useEffect(() => {
    getAdvertisementRequests();
  }, []);

  useEffect(() => {
    const returnToADTab = localStorage.getItem("returnToADTab");
    if (returnToADTab) {
      setValue(parseInt(returnToADTab, 10));

      localStorage.removeItem("returnToADTab");
    }
  }, []);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("ad_request_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box className="barge-common-box">
            {/* <Index.Box className="title-header">
              <Index.Box className="title-header-flex res-title-header-flex">
                <Index.Box className="title-main  ">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Advertisement
                  </Index.Typography>
                </Index.Box>
              </Index.Box>
            </Index.Box> */}

            <Index.Box className="user-tab-listing">
              <Index.Box className="w-100-tabs-user">
                <Index.Box className="tab-user-contain">
                  <Index.Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                    className="tabs-user-list"
                  >
                    <Index.Tab
                      className="tab-label-details"
                      label="Advertisement Request"
                      {...a11yProps(0)}
                    />
                    <Index.Tab
                      className="tab-label-details"
                      label="Advertisement Banner"
                      {...a11yProps(1)}
                    />
                  </Index.Tabs>
                </Index.Box>
                <CustomTabPanel
                  value={value}
                  index={0}
                  className="tab-custom-panel-users "
                >
                  <Index.Box className="common-mobile-show-export blue-button flex-mobile justify-content-end mb-res-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        generateExcel();
                      }}
                      disabled={
                        filteredData?.adRequestData?.length ? false : true
                      }
                    >
                      <img
                        src={PagesIndex.Svg.office}
                        className="mobile-export-icon"
                        alt="export"
                      ></img>
                    </Index.Button>
                  </Index.Box>
                  <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                    <Search className="search ">
                      <StyledInputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        value={searchValue}
                        onChange={(e) => handleInputChange(e, "adRequestData")}
                      />
                    </Search>

                    <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => {
                          generateExcel();
                        }}
                        disabled={
                          filteredData?.adRequestData?.length ? false : true
                        }
                      >
                        Export excel
                      </Index.Button>
                    </Index.Box>
                  </Index.Box>
                  <Index.Box className="transaction-table-container page-table-main">
                    <Index.TableContainer
                      component={Index.Paper}
                      className="table-container"
                    >
                      <Index.Table
                        aria-label="simple table"
                        className="table-design-main one-line-table"
                      >
                        <Index.TableHead>
                          <Index.TableRow>
                            <Index.TableCell>User</Index.TableCell>
                            <Index.TableCell>Email</Index.TableCell>
                            <Index.TableCell>Phone Number</Index.TableCell>
                            <Index.TableCell>Brand Name</Index.TableCell>
                            <Index.TableCell>Designation</Index.TableCell>
                            <Index.TableCell>Date</Index.TableCell>
                            <Index.TableCell align="right">
                              Action
                            </Index.TableCell>
                          </Index.TableRow>
                        </Index.TableHead>
                        {loading ? (
                          <Index.TableBody>
                            <Index.TableRow>
                              <Index.TableCell
                                component="td"
                                variant="td"
                                scope="row"
                                className="no-data-in-list"
                                colSpan={15}
                                align="center"
                              >
                                <Index.Loader />
                              </Index.TableCell>
                            </Index.TableRow>
                          </Index.TableBody>
                        ) : (
                          <Index.TableBody>
                            {filteredData?.adRequestData?.length ? (
                              filteredData?.adRequestData
                                ?.slice(
                                  currentPage * rowsPerPage,
                                  currentPage * rowsPerPage + rowsPerPage
                                )
                                ?.map((item, index) => (
                                  <Index.TableRow
                                    className="inquiry-list"
                                    key={item?._id}
                                    onClick={() => handleOpen(item)}
                                  >
                                    <Index.TableCell>
                                      <Index.Tooltip
                                        title={item?.name}
                                        placement="top"
                                        disableInteractive
                                        arrow
                                      >
                                        <Index.Box className="common-tooltip-details">
                                          {item?.name ? item?.name : "-"}
                                        </Index.Box>
                                      </Index.Tooltip>
                                    </Index.TableCell>
                                    <Index.TableCell>
                                      {item?.email ? item?.email : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell>
                                      {item?.mobileNumber
                                        ? item?.mobileNumber
                                        : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell>
                                      {item?.brandName ? item?.brandName : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell>
                                      {item?.designation
                                        ? item?.designation
                                        : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell>
                                      {item?.createdAt
                                        ? PagesIndex.moment(
                                            item?.createdAt
                                          ).format("DD/MM/YYYY hh:mm A")
                                        : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell align="right">
                                      <Index.IconButton onClick={handleOpen}>
                                        <Index.Visibility />
                                      </Index.IconButton>
                                    </Index.TableCell>
                                  </Index.TableRow>
                                ))
                            ) : (
                              <Index.TableRow>
                                <Index.TableCell
                                  component="td"
                                  variant="td"
                                  scope="row"
                                  className="no-data-in-list"
                                  colSpan={15}
                                  align="center"
                                >
                                  No data available
                                </Index.TableCell>
                              </Index.TableRow>
                            )}
                          </Index.TableBody>
                        )}
                      </Index.Table>
                    </Index.TableContainer>

                    {filteredData?.adRequestData?.length && !loading ? (
                      <Index.Box className="pagination-design flex-end">
                        <Index.Stack spacing={2}>
                          <Index.Box className="pagination-count">
                            <Index.TablePagination
                              component="div"
                              count={filteredData?.adRequestData?.length}
                              page={currentPage}
                              onPageChange={handleChangePage}
                              rowsPerPage={rowsPerPage}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                          </Index.Box>
                        </Index.Stack>
                      </Index.Box>
                    ) : (
                      <></>
                    )}
                  </Index.Box>
                </CustomTabPanel>

                <CustomTabPanel
                  value={value}
                  index={1}
                  className="tab-custom-panel-users"
                >
                  <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                    <Search className="search ">
                      <StyledInputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        value={searchValue}
                        onChange={(e) => handleInputChange(e, "adImageData")}
                      />
                    </Search>

                    {adList?.adImageData?.length == 0 ? (
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => navigate("/admin/add-advertise-image")}
                        >
                          Add Advertisement Banner
                        </Index.Button>
                      </Index.Box>
                    ) : (
                      <></>
                    )}
                  </Index.Box>
                  <Index.Box className="couponlist-table-container page-table-main">
                    <Index.TableContainer
                      component={Index.Paper}
                      className="table-container"
                    >
                      <Index.Table
                        aria-label="simple table"
                        className="table-design-main one-line-table"
                      >
                        <Index.TableHead>
                          <Index.TableRow>
                            <Index.TableCell width="15%">
                              Background Image
                            </Index.TableCell>
                            <Index.TableCell width="20%">Image</Index.TableCell>
                            <Index.TableCell width="20%">Title</Index.TableCell>
                            <Index.TableCell width="15%">
                              Description
                            </Index.TableCell>
                            <Index.TableCell width="15%" align="right">
                              Action
                            </Index.TableCell>
                          </Index.TableRow>
                        </Index.TableHead>
                        <Index.TableBody>
                          {filteredData?.adImageData.length ? (
                            filteredData?.adImageData
                              ?.slice(
                                currentPage * rowsPerPage,
                                currentPage * rowsPerPage + rowsPerPage
                              )
                              .map((item) => (
                                <Index.TableRow>
                                  <Index.TableCell>
                                    <Index.Box className="slider_img remove-radius">
                                      <img
                                        src={
                                          item?.filebg
                                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.filebg}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        alt=""
                                        className="remove-radius-image"
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    <Index.Box className="slider_img remove-radius">
                                      <img
                                        src={
                                          item?.file
                                            ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.file}`
                                            : PagesIndex.Png.NoImageAvailable
                                        }
                                        alt=""
                                        className="remove-radius-image"
                                      />
                                    </Index.Box>
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {item?.title}
                                  </Index.TableCell>
                                  <Index.Tooltip
                                    arrow
                                    title={item?.description}
                                  >
                                    <Index.TableCell className="table-data-text">
                                      {item?.description}
                                    </Index.TableCell>
                                  </Index.Tooltip>
                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details">
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton>
                                          <Index.EditIcon
                                            onClick={(e) =>
                                              navigate(
                                                "/admin/add-advertise-image",
                                                {
                                                  state: { data: item }
                                                }
                                              )
                                            }
                                          />
                                        </Index.IconButton>
                                      </Index.Box>
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.TableCell>
                                </Index.TableRow>
                              ))
                          ) : (
                            <Index.TableRow>
                              <Index.TableCell
                                component="td"
                                variant="td"
                                scope="row"
                                className="no-data-in-list"
                                colSpan={15}
                                align="center"
                              >
                                No data available
                              </Index.TableCell>
                            </Index.TableRow>
                          )}
                        </Index.TableBody>
                      </Index.Table>
                    </Index.TableContainer>
                    {filteredData?.adImageData?.length && !loading ? (
                      <Index.Box className="pagination-design flex-end">
                        <Index.Stack spacing={2}>
                          <Index.Box className="pagination-count">
                            <Index.TablePagination
                              component="div"
                              count={filteredData?.adImageData?.length}
                              page={currentPage}
                              onPageChange={handleChangePage}
                              rowsPerPage={rowsPerPage}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                          </Index.Box>
                        </Index.Stack>
                      </Index.Box>
                    ) : (
                      <></>
                    )}
                  </Index.Box>
                </CustomTabPanel>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Index.Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal"
        >
          <Index.Box
            sx={style}
            className="modal-inner-main add-role-modal modal-inner"
          >
            <Index.Box className="modal-header">
              <Index.Typography
                id="modal-modal-title"
                className="modal-title"
                variant="h6"
                component="h2"
              >
                View Details
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleClose}
              />
            </Index.Box>
            <Index.Box className="modal-body">
              <Index.Box>Name: {details?.name}</Index.Box>
              <Index.Box>Email: {details?.email}</Index.Box>
              <Index.Box>Phone Number: {details?.mobileNumber}</Index.Box>
              <Index.Box>Brand Name: {details?.brandName}</Index.Box>
              <Index.Box>Designation: {details?.designation}</Index.Box>
              <Index.Box>
                Website:{" "}
                <Link to={`${details?.websiteName}`} target="_blank">
                  {details?.websiteName}
                </Link>
              </Index.Box>
              <Index.Box>Message: {details?.message}</Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Modal>
        <PagesIndex.DeleteModal
          deleteOpen={deleteOpen}
          handleDeleteClose={handleDeleteClose}
          handleDeleteRecord={handleClassRemove}
        />
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default AdvertisementRequestFormList;
