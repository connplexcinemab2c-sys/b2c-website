import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./UserList.css";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useNavigate } from "react-router-dom";

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

const UserList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [filteredData, setFilteredData] = useState([]);
  const [userList, setUserList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const requestSearch = (searched) => {
    setCurrentPage(0);
    let filteredData = userList.filter(
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

  const getUserList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_USER_LIST + "?" + new Date().getTime()
    )
      .then((res) => {
        setUserList(res?.data?.data);
        setFilteredData(res?.data?.data);

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response?.data.message);

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  };
  const generateExcel = async () => {
    const headers = ["User", "Email", "Phone Number", "Date"];
    const rows = filteredData.map((item) => ({
      name: item?.firstName ? `${item?.firstName} ${item?.lastName}` : "-",
      email: item?.email ? item?.email : "-",
      mobileNumber: item?.mobileNumber ? item?.mobileNumber : "-",
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

    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    PagesIndex.XLSX.writeFile(
      workbook,
      `User_list_${PagesIndex.moment().format("DD-MM-YYYY_hh:mm:ss_A")}.xlsx`,
      { compression: true }
    );
  };
  useEffect(() => {
    getUserList();
  }, []);

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("user_view")
  ) {
    return (
      <>
        <Index.Box className="">
          <Index.Box className="barge-common-box">
            <Index.Box className="title-header">
              <Index.Box className="title-header-flex common-userlist-manage">
                <Index.Box className="title-main common-export-flex">
                  <Index.Typography
                    variant="p"
                    component="p"
                    className="page-title"
                  >
                    User list
                  </Index.Typography>
                  <Index.Box className="common-mobile-show-export blue-button">
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
                      <Index.TableCell width="15%">Profile</Index.TableCell>
                      <Index.TableCell width="20%">User Name</Index.TableCell>
                      <Index.TableCell width="20%">User Detail</Index.TableCell>
                      <Index.TableCell width="15%">
                        Created Date
                      </Index.TableCell>
                      <Index.TableCell width="10%" align="right">
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
                      {filteredData?.length ? (
                        filteredData
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          ?.map((item, index) => (
                            <Index.TableRow key={item?._id}>
                              <Index.TableCell>
                                <img
                                  src={
                                    item?.profile
                                      ? `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.profile}`
                                      : PagesIndex.Png.NoImageAvailable
                                  }
                                  alt="profile"
                                  className="user-profile"
                                />
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.firstName && item?.lastName ? (
                                  <Index.Tooltip
                                    title={`${item.firstName} ${item.lastName}`}
                                    placement="top"
                                    arrow
                                  >
                                    <Index.Typography
                                      component="p"
                                      variant="p"
                                      className=""
                                    >
                                      {`${item.firstName} ${item.lastName}`}
                                    </Index.Typography>
                                  </Index.Tooltip>
                                ) : (
                                  <Index.Typography
                                    component="p"
                                    variant="p"
                                    className="common-tooltip-details"
                                  >
                                    {item?.firstName
                                      ? `${item.firstName} ${item.lastName}`
                                      : "-"}
                                  </Index.Typography>
                                )}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.email && (
                                  <>
                                    <b>Email:</b>{" "}
                                    {item?.email ? item?.email : "-"} <br />
                                  </>
                                )}
                                {item?.mobileNumber && (
                                  <>
                                    <b>Phone Number:</b>{" "}
                                    {item?.mobileNumber
                                      ? item?.mobileNumber
                                      : "-"}
                                    <br />
                                  </>
                                )}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.createdAt
                                  ? PagesIndex.moment(item?.createdAt).format(
                                      "DD/MM/YYYY hh:mm A"
                                    )
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell align="right">
                                <Index.IconButton
                                  onClick={(e) => {
                                    navigate("/admin/user-view", {
                                      state: { row: item },
                                    });
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

export default UserList;
