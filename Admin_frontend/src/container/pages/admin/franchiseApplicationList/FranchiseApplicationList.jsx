import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./FranchiseApplicationList.css";
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

const FranchiseApplicationList = () => {
  const dispatch = useDispatch();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [contactUsList, setContactUsList] = useState([]);
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
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = contactUsList?.filter(
      (data) =>
        `${data?.firstName?.toLowerCase()} ${data?.lastName?.toLowerCase()}`?.includes(
          searched?.toLowerCase()
        ) ||
        data?.email?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.mobileNumber?.toString()?.includes(searched?.toString()) ||
        data?.city?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.jobTitle?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        data?.company?.toLowerCase()?.includes(searched?.toLowerCase()) ||
        (data?.createdAt &&
          PagesIndex.moment(data?.createdAt)
            .format("DD/MM/YYYY hh:mm A")
            ?.toString()
            ?.toLowerCase()
            .includes(searched.toLowerCase()))
    );
    setFilteredData(filteredData);
  };

  const getFranchiseApplication = () => {
    PagesIndex.DataService.get(PagesIndex.Api.GET_FRANCHISE_APPLICATION_LIST)
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

  const generateExcel = async () => {
    const headers = [
      "User",
      "Email",
      "Phone Number",
      "Job Title",
      "Company",
      "City",
      "Date",
    ];
    const rows = filteredData?.map((item) => ({
      name: item?.firstName ? `${item?.firstName} ${item?.lastName}` : "-",
      email: item?.email ? item?.email : "-",
      mobileNumber: item?.mobileNumber ? item?.mobileNumber : "-",
      jobTitle: item?.jobTitle ? item?.jobTitle : "-",
      company: item?.company ? item?.company : "-",
      city: item?.city ? item?.city : "-",
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
      `Franchise_list_${PagesIndex.moment().format(
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
    adminLoginData?.roleId?.permissions?.includes("applyForFranchise_view")
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
                    Franchise
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
                  className="table-design-main one-line-table region-manage-table"
                >
                  <Index.TableHead>
                    <Index.TableRow>
                      <Index.TableCell>User</Index.TableCell>
                      <Index.TableCell>Email</Index.TableCell>
                      <Index.TableCell>Phone Number</Index.TableCell>
                      <Index.TableCell>Job Title</Index.TableCell>
                      <Index.TableCell>Company</Index.TableCell>
                      <Index.TableCell>City</Index.TableCell>
                      <Index.TableCell>Date</Index.TableCell>
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
                            <Index.TableRow key={item?._id}>
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
                                <Index.Tooltip
                                  title={item?.jobTitle}
                                  placement="top"
                                  disableInteractive
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details job-tooltips">
                                    {item?.jobTitle ? item?.jobTitle : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                <Index.Tooltip
                                  title={item?.company}
                                  placement="top"
                                  disableInteractive
                                  arrow
                                >
                                  <Index.Box className="common-tooltip-details job-tooltips">
                                    {item?.company ? item?.company : "-"}
                                  </Index.Box>
                                </Index.Tooltip>
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.city ? item?.city : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY hh:mm A"
                                    )
                                  : "-"}
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
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default FranchiseApplicationList;
