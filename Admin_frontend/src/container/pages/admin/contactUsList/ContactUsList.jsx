import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./ContactUsList.css";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";

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

const ContactUsList = () => {
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [contactUsList, setContactUsList] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");

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
  // Search on table
  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = contactUsList.filter(
      (data) =>
        `${data?.firstName?.toLowerCase()} ${data?.lastName?.toLowerCase()}`?.includes(
          searched?.toLowerCase()
        ) ||
        data?.email?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.mobileNumber?.toString()?.includes(searched?.toString()) ||
        (data &&
          data.createdAt &&
          PagesIndex.moment(data.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched.toLowerCase()))
    );

    setFilteredData(filteredData);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const getFranchiseApplication = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_CONTACT_US_LIST)
      .then((res) => {
        setContactUsList(res?.data?.data);
        setFilteredData(res?.data?.data);
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

  const handleOpen = (msg) => {
    setOpen(true);
    setMessage(msg);
  };
  const handleClose = () => {
    setOpen(false);
    setMessage("");
  };

  const generateExcel = async () => {
    const headers = ["User", "Email", "Phone Number", "Message", "Date"];
    const rows = filteredData.map((item) => ({
      name: item?.firstName ? `${item?.firstName} ${item?.lastName}` : "-",
      email: item?.email ? item?.email : "-",
      mobileNumber: item?.mobileNumber ? item?.mobileNumber : "-",
      message: item?.message,
      createdAt: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
    }));
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Contact us list"
    );

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `Contact_us_list_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };
  useEffect(() => {
    getFranchiseApplication();
  }, []);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("contactUs_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box className="barge-common-box">
            <Index.Box className="title-header">
              <Index.Box className="title-header-flex res-title-header-flex">
                <Index.Box className="title-main  common-export-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    Contact Us
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
            </Index.Box>

            <Index.Box className="page-table-main">
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
                      <Index.TableCell>Date</Index.TableCell>
                      <Index.TableCell align="right">Action</Index.TableCell>
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
                      {filteredData?.length ? (
                        filteredData
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          ?.map((item, index) => (
                            <Index.TableRow
                              className="inquiry-list"
                              key={item?._id}
                              onClick={() => handleOpen(item?.message)}
                            >
                              <Index.TableCell>
                                <Index.Tooltip
                                  title={`${item?.firstName} ${item?.lastName}`}
                                  placement="top"
                                  disableInteractive
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details">
                                    {item?.firstName
                                      ? `${item?.firstName} ${item?.lastName}`
                                      : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.email ? item?.email : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.mobileNumber ? item?.mobileNumber : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY hh:mm A"
                                    )
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
            </Index.Box>

            {filteredData?.length && !loading ? (
              <Index.Box className="pagination-design flex-end">
                <Index.Stack spacing={2}>
                  <Index.Box className="pagination-count">
                    <Index.TablePagination
                      component="div"
                      count={filteredData?.length}
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
                View Message
              </Index.Typography>
              <img
                src={PagesIndex.Svg.cancel}
                className="modal-close-icon"
                onClick={handleClose}
              />
            </Index.Box>
            <Index.Box className="modal-body">
              <Index.Typography className="modal-para">{message}</Index.Typography>
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
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default ContactUsList;
