import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./CareerFormList.css";
import { Link, useNavigate } from "react-router-dom";
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
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Search = Index.styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: Index.alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: Index.alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
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
      width: "20ch",
    },
  },
}));

const CareerFormList = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const dispatch = useDispatch();
  const [filteredData, setFilteredData] = useState({
    requestData: [],
    imageData: [],
  });
  const [careerList, setCareerList] = useState({
    requestData: [],
    imageData: [],
  });
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [value, setValue] = React.useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const requestSearch = (searched, type) => {
    setCurrentPage(0);
    let filteredData = careerList[type]?.filter(
      (data) =>
        `${data?.firstName?.toLowerCase()} ${data?.lastName?.toLowerCase()}`?.includes(
          searched?.toLowerCase()
        ) ||
        data?.email?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.mobileNumber?.toString()?.includes(searched?.toString()) ||
        data?.city?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.position?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.title?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.description?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        (data &&
          data?.createdAt &&
          PagesIndex.moment(data?.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched?.toLowerCase()))
    );
    if (type === "requestData") {
      setFilteredData((prevState) => ({
        ...prevState,
        requestData: filteredData,
      }));
    } else if (type === "imageData") {
      setFilteredData((prevState) => ({
        ...prevState,
        imageData: filteredData,
      }));
    }
  };

  const handleInputChange = (e, type) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue, type);
  };

  const getAdvertisementRequests = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_CAREER_REQUESTS_LIST)
      .then((res) => {
        let filter = res?.data?.data.filter((item) => !item.title);
        let filterImg = res?.data?.data.filter((item) => item.title);
        setCareerList({
          requestData: filter,
          imageData: filterImg,
        });

        setFilteredData({
          requestData: filter,
          imageData: filterImg,
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSearchValue("");
    setFilteredData(careerList);
    setCurrentPage(0);
    setRowsPerPage(10);
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const generateExcel = async () => {
    const headers = [
      "User",
      "Email",
      "Phone Number",
      "City",
      "Position",
      "Message",
      "Date",
    ];
    const rows = filteredData?.requestData.map((item) => ({
      name: item?.firstName ? `${item?.firstName} ${item?.lastName}` : "-",
      email: item?.email ? item?.email : "-",
      mobileNumber: item?.mobileNumber ? item?.mobileNumber : "-",
      city: item?.city ? item?.city : "-",
      position: item?.position ? item?.position : "-",
      message: item?.message,
      createdAt: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
    }));
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Ad Requests");

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `Career_Requests_list_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };

  const handleClassRemove = () => {
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_CAREER_BG, {
      id: id,
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
  useEffect(() => {
    getAdvertisementRequests();
  }, []);

  useEffect(() => {
    const returnToTab = localStorage.getItem("returnToTab");
    if (returnToTab) {
      setValue(parseInt(returnToTab, 10));
      localStorage.removeItem("returnToTab");
    }
  }, []);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("career_request_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box className="barge-common-box">
            {/* <Index.Box className="title-header">
              <Index.Box className="title-header-flex res-title-header-flex">
                <Index.Box className="title-main  common-export-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Career Request
                  </Index.Typography>
                  <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        generateExcel();
                      }}
                    >
                      <img
                        src={PagesIndex.Svg.office}
                        className="mobile-export-icon"
                        alt="export"
                      ></img>
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                  <Search className="search ">
                    <StyledInputBase
                      placeholder="Search"
                      inputProps={{ "aria-label": "search" }}
                      value={searchValue}
                      onChange={handleInputChange}
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
                    >
                      Export excel
                    </Index.Button>
                  </Index.Box>
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
                      label="Career Request"
                      {...a11yProps(0)}
                    />
                    <Index.Tab
                      className="tab-label-details"
                      label="Career Banner"
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
                      disabled={filteredData?.requestData?.length ? false : true}
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
                        onChange={(e) => handleInputChange(e, "requestData")}
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
                        disabled={filteredData?.requestData?.length ? false : true}
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
                            <Index.TableCell width="10%">User</Index.TableCell>
                            <Index.TableCell width="20%">Email</Index.TableCell>
                            <Index.TableCell width="15%">
                              Phone Number
                            </Index.TableCell>
                            <Index.TableCell width="12%">City</Index.TableCell>
                            <Index.TableCell width="8%">
                              Position
                            </Index.TableCell>
                            <Index.TableCell width="15%">
                              Message
                            </Index.TableCell>
                            <Index.TableCell width="5%">Date</Index.TableCell>
                            <Index.TableCell align="right" width="5%">
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
                            {filteredData?.requestData?.length ? (
                              filteredData?.requestData
                                ?.slice(
                                  currentPage * rowsPerPage,
                                  currentPage * rowsPerPage + rowsPerPage
                                )
                                ?.map((item, index) => (
                                  <Index.TableRow
                                    className="inquiry-list"
                                    key={item?._id}
                                  >
                                    <Index.TableCell width="10%">
                                      <Index.Tooltip
                                        title={`${item?.firstName} ${item?.lastName}`}
                                        placement="top"
                                        disableInteractive
                                        arrow
                                      >
                                        <Index.Box className="common-tooltip-details">
                                          {item?.firstName
                                            ? `${`${item?.firstName} ${item?.lastName}`.slice(
                                                0,
                                                20
                                              )}...`
                                            : "-"}
                                        </Index.Box>
                                      </Index.Tooltip>
                                    </Index.TableCell>
                                    <Index.TableCell width="20%">
                                      {item?.email ? item?.email : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell width="15%">
                                      {item?.mobileNumber
                                        ? item?.mobileNumber
                                        : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell width="12%">
                                      {item?.city ? item?.city : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell width="8%">
                                      <Index.Tooltip
                                        title={item?.position}
                                        placement="top"
                                        disableInteractive
                                        arrow
                                      >
                                        <Index.Box className="common-tooltip-details">
                                          {item?.position
                                            ? item?.position
                                            : "-"}
                                        </Index.Box>
                                      </Index.Tooltip>
                                    </Index.TableCell>
                                    <Index.TableCell width="20%">
                                      <Index.Tooltip
                                        title={item?.message}
                                        placement="top"
                                        disableInteractive
                                        arrow
                                      >
                                        <Index.Box className="common-tooltip-details">
                                          {item?.message ? item?.message : "-"}
                                        </Index.Box>
                                      </Index.Tooltip>
                                    </Index.TableCell>
                                    <Index.TableCell width="10%">
                                      {item?.createdAt
                                        ? PagesIndex.moment(
                                            item?.createdAt
                                          ).format("DD/MM/YYYY hh:mm A")
                                        : "-"}
                                    </Index.TableCell>
                                    <Index.TableCell align="right" width="5%">
                                      <Index.IconButton
                                        onClick={() => {
                                          window.open(
                                            `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.resume}`,
                                            "_blank"
                                          );
                                        }}
                                      >
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

                    {filteredData?.requestData?.length && !loading ? (
                      <Index.Box className="pagination-design flex-end">
                        <Index.Stack spacing={2}>
                          <Index.Box className="pagination-count">
                            <Index.TablePagination
                              component="div"
                              count={filteredData?.requestData?.length}
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
                  <Index.Box className="title-main common-export-flex">
                  {adminLoginData?.roleId?.permissions?.includes(
                    "slider_add"
                  ) && (
                    <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export mb-res-export end-btn-title">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => navigate("/admin/add-career-image")}
                        >
                          Add Career Banner
                      </Index.Button>
                    </Index.Box>
                  )}
                  </Index.Box>
                  <Index.Box className="d-flex align-items-center justify-content-end res-set-search common-user-listing-search">
                    <Search className="search ">
                      <StyledInputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        value={searchValue}
                        onChange={(e) => handleInputChange(e, "imageData")}
                      />
                    </Search>

                    {careerList?.imageData?.length == 0 ? (
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => navigate("/admin/add-career-image")}
                        >
                          Add Career Banner
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
                          {filteredData?.imageData.length ? (
                            filteredData?.imageData
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
                                                "/admin/add-career-image",
                                                {
                                                  state: { data: item },
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
                    {filteredData?.imageData?.length && !loading ? (
                      <Index.Box className="pagination-design flex-end">
                        <Index.Stack spacing={2}>
                          <Index.Box className="pagination-count">
                            <Index.TablePagination
                              component="div"
                              count={filteredData?.imageData?.length}
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
        {/* )}
        </PagesIndex.Formik> */}
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
              <Index.Box>City: {details?.city}</Index.Box>
              <Index.Box>Position: {details?.position}</Index.Box>
              <Index.Box>
                Website:{" "}
                <Link to={`${details?.websiteName}`} target="_blank">
                  {details?.websiteName}
                </Link>
              </Index.Box>
              <Index.Box>Message: {details?.message}</Index.Box>
              {/* <Index.Box className="modal-user-btn-flex">
              <Index.Box className="discard-btn-main btn-main-primary">
                <Index.Box className="common-button blue-button res-blue-button">
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
                    onClick={handleClose}
                  >
                    Close
                  </Index.Button>
                </Index.Box>
              </Index.Box>
            </Index.Box> */}
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

export default CareerFormList;
