import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { IMAGES_API_ENDPOINT } from "../../../../config/DataService";

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

const ReportIssue = () => {
  const navigate = useNavigate();
  const [reportList, setReportList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cinemaList, setCinemaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };
  const requestSearch = (searched) => {
    setCurrentPage(0);
    const searchTerm = searched?.toLowerCase() || "";

    let filteredData = reportList?.filter((data) => {
      const nameMatch = data?.name?.toLowerCase()?.includes(searchTerm);
      const emailMatch = data?.email?.toLowerCase()?.includes(searchTerm);
      const cinemaNameMatch =
        data?.cinemaObjectId &&
        getCinemaName(data?.cinemaObjectId)
          ?.toLowerCase()
          ?.includes(searchTerm);
      const descriptionMatch = data?.description
        ?.toLowerCase()
        ?.includes(searchTerm);
      const transactionTypeMatch = data?.transaction_type
        ?.toLowerCase()
        ?.includes(searchTerm);
      const dateMatch =
        data?.date &&
        PagesIndex.moment(data?.date)
          .format("DD/MM/YYYY hh:mm A")
          .toLowerCase()
          .includes(searchTerm);

      return (
        nameMatch ||
        emailMatch ||
        cinemaNameMatch ||
        descriptionMatch ||
        transactionTypeMatch ||
        dateMatch
      );
    });

    setFilteredData(filteredData);
  };

  const getCinemaName = (id) => {
    const data = cinemaList?.find((data) => data._id == id);
    return data ? data?.cinemaName : "";
  };

  const generateExcel = async () => {
    const headers = [
      "Email",
      "Name",
      "Cinema Name",
      "Transaction Type",
      "Description",
      "Date",
      "Created At",
    ];
    const rows = filteredData?.map((item) => ({
      Email: item?.email && item?.email,
      Name: item?.name && item?.name,
      Cinema_Name: getCinemaName(item?.cinemaObjectId)
        ? getCinemaName(item?.cinemaObjectId)
        : "-",
      Transaction_Type: item?.transaction_type ? item?.transaction_type : "-",
      Description: item?.description ? item?.description : "-",
      Date: item?.date
        ? PagesIndex.moment(item?.date).format("DD/MM/YYYY")
        : "-",
      Created_At: item?.createdAt
        ? PagesIndex.moment(item?.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    PagesIndex.XLSX.utils.book_append_sheet(workbook, worksheet, "Issue");

    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `Issue_history_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh:mm:ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };

  const getReportList = () => {
    PagesIndex.DataService.get(`${PagesIndex.Api.GET_REPORT_ISSUE}`)
      .then((res) => {
        if (res?.status == 200) {
          setReportList(res?.data?.data);
          setFilteredData(res?.data?.data);
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        } else {
          setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      })
      .catch((err) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    getReportList();
    getCinemaList();
  }, []);

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
                  Report Issue
                </Index.Typography>
                <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                  <Index.Button
                    variant="contained"
                    disableRipple
                    className="no-text-decoration"
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
                    onClick={generateExcel}
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
                    <Index.TableCell>Images</Index.TableCell>
                    <Index.TableCell>Name</Index.TableCell>
                    <Index.TableCell>Email</Index.TableCell>
                    <Index.TableCell>Cinema Name</Index.TableCell>
                    <Index.TableCell>Payment Type</Index.TableCell>
                    <Index.TableCell>Description</Index.TableCell>
                    <Index.TableCell>Date</Index.TableCell>
                    <Index.TableCell>Created At</Index.TableCell>
                    <Index.TableCell>Action</Index.TableCell>
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
                        .map((data) => (
                          <Index.TableRow>
                            <Index.TableCell>
                              <Index.Box className="class_img">
                                <img
                                  src={
                                    data.attachImage.length
                                      ? `${IMAGES_API_ENDPOINT}/${data.attachImage[0]}`
                                      : PagesIndex.Png.NoImageAvailable
                                  }
                                  alt="report-issue"
                                  className="report-icon-issue"
                                />
                              </Index.Box>
                            </Index.TableCell>
                            <Index.TableCell>
                              {data?.name?.trim() ? data.name : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {data?.email || "-"}
                            </Index.TableCell>

                            <Index.TableCell>
                              {getCinemaName(data?.cinemaObjectId)}
                            </Index.TableCell>
                            <Index.TableCell>
                              {data?.transaction_type || "-"}
                            </Index.TableCell>
                            <Index.TableCell className="table-data-text">
                              {data?.description}
                            </Index.TableCell>
                            <Index.TableCell>
                              {moment(data?.date).format("DD/MM/YYYY") || "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {moment(data?.createdAt).format("DD/MM/YYYY") || "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              <Index.Box
                                className="flex-action-details"
                                sx={{ justifyContent: "center" }}
                              >
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={() => {
                                      navigate("/admin/view-report", {
                                        state: { row: data },
                                      });
                                    }}
                                  >
                                    <Index.Visibility />
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
};

export default ReportIssue;
