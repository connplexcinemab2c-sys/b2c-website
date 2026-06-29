import React from "react";
import { useEffect, useState, useRef } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
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
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));
let initialValues = {
  bannerType: "",
  title: "",
  poster: "",
  bannerLink: "",
  bannerShowSection: [],
};
// const [loadingState, setLoadingState] = useState({});
// const [buttonLoading, setButtonLoading] = useState(false);

const handleBannerSubmit = (values) => {
  setButtonLoading(true);
  const urlEncoded = new FormData();
  if (id) {
    urlEncoded.append("id", id);
  }
  urlEncoded.append("bannerType", values?.bannerType);
  urlEncoded.append("title", values?.title);
  urlEncoded.append("banner", values?.poster);
  urlEncoded.append("bannerLink", values?.bannerLink);
  urlEncoded.append(
    "bannerShowSection",
    JSON.stringify(values?.bannerShowSection)
  );
  PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_BANNER, urlEncoded)
    .then((res) => {
      PagesIndex.toast.success(res?.data?.message);
      getBannerList();
    })
    .catch((err) => {
      PagesIndex.toast.error(err?.response?.data?.message);
    })
    .finally(() => setButtonLoading(false));
};

const GlobalNotification = () => {
  const navigate = useNavigate();
  const [rewardList, setRewardList] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  console.log("totalPages", totalPages);

  const formik = useRef();
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state?.admin?.AdminSlice
  );

  const handleStatusChange = async (id, status) => {
    setStatusLoading(true);
    try {
      const payload = {
        id,
        status,
      };
      const response = await PagesIndex.DataService.post(
        `${PagesIndex.Api.CHANGE_GLOBAL_NOTIFICATION_STATUS}`,
        payload
      );

      PagesIndex.toast.success(response?.data?.message);

      getGlobalNotification();
    } catch (error) {
      PagesIndex.toast.error(error?.response?.data?.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const getGlobalNotification = () => {
    PagesIndex.DataService.get(`${PagesIndex.Api.GET_ALL_GLOBAL_NOTIFICATION}`)
      .then((res) => {
        if (res?.status === 200) {
          setRewardList(res?.data?.data);
          setFilteredData(res?.data?.data);
          console.log("resss", res.data.pagination.total);

          setTotalPages(res.data.pagination.total);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const removeImageTags = (html) => {
    return html?.replace(/<(table|figure|[^>]+)>/g, "");
  };

  useEffect(() => {
    getGlobalNotification();
  }, []);

  const handleOpen = (mode) => {
    setAddOpen(true);
    setAddOrEdit(mode);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const requestSearch = (searched) => {
    const searchTerm = searched.toLowerCase();

    const filtered = rewardList.filter((data) => {
      return (
        data?.transactionId?.movieId?.name
          ?.toLowerCase()
          ?.includes(searchTerm) ||
        data?.userId?.email?.toLowerCase()?.includes(searchTerm) ||
        data?.userId?.mobileNumber
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTerm) ||
        data?.coins?.toString()?.toLowerCase()?.includes(searchTerm) ||
        data?.transactionId?.initTransId
          ?.toString()
          .toLowerCase()
          ?.includes(searchTerm) ||
        data?.transactionId?.paymentResponse?.amount
          ?.toString()
          ?.includes(searchTerm) ||
        (data?.createdAt &&
          moment(data?.createdAt).format("DD/MM/YYYY").includes(searchTerm))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  return (
    <PagesIndex.Formik
      enableReinitialize
      onSubmit={handleBannerSubmit}
      initialValues={initialValues}
      validationSchema={
        addOrEdit == "Add"
          ? PagesIndex.bannerSchema
          : PagesIndex.bannerEditSchema
      }
      innerRef={formik}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        setFieldValue,
      }) => (
        <>
          <Index.Box className="">
            <Index.Box className="barge-common-box">
              <Index.Box className="title-header">
                <Index.Box className="title-header-flex res-title-header-flex">
                  <Index.Box className="title-main common-export-flex">
                    <Index.Typography
                      variant="p"
                      component="p"
                      className="page-title"
                    >
                      Global Notification
                    </Index.Typography>
                    {adminLoginData?.roleId?.permissions?.includes(
                      "slider_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => handleOpen("Add")}
                        >
                          Add Global Notification
                        </Index.Button>
                      </Index.Box>
                    )}
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
                    {/* {adminLoginData?.roleId?.permissions?.includes(
                      "slider_add"
                    ) && ( */}
                    <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => {
                          navigate("/admin/global-notification/add");
                        }}
                      >
                        Add Notification
                      </Index.Button>
                    </Index.Box>
                    {/* )} */}
                  </Index.Box>
                </Index.Box>
              </Index.Box>

              <Index.Box className="page-table-main banner-table-main">
                <Index.TableContainer
                  component={Index.Paper}
                  className="table-container"
                >
                  <Index.Table
                    aria-label="simple table"
                    className="table-design-main"
                  >
                    <Index.TableHead>
                      <Index.TableRow>
                        <Index.TableCell width="5%">Sr. No</Index.TableCell>
                        <Index.TableCell width="10%">Title</Index.TableCell>
                        <Index.TableCell width="10%">
                          Description
                        </Index.TableCell>
                        <Index.TableCell width="10%">Status</Index.TableCell>
                        <Index.TableCell width="10%">image</Index.TableCell>
                        <Index.TableCell width="10%">Date</Index.TableCell>
                        <Index.TableCell width="5%">Time</Index.TableCell>
                        <Index.TableCell width="5%" align="right">
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
                            colSpan={8}
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
                                  <Index.Box className="rectangle-img-box">
                                    {currentPage * rowsPerPage + index + 1}
                                  </Index.Box>
                                </Index.TableCell>
                                <Index.TableCell>
                                  {item?.title ? item?.title : "-"}
                                </Index.TableCell>
                                <Index.TableCell>
                                  <div
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: "200px",
                                    }}
                                  >
                                    {item?.description
                                      ? removeImageTags(item.description)
                                      : "-"}
                                  </div>
                                </Index.TableCell>
                                <Index.TableCell>
                                  {item?.isSend ? "Send" : "Pending"}
                                </Index.TableCell>
                                <Index.TableCell>
                                  <img
                                    src={
                                      item?.image
                                        ? `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.image}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    alt=""
                                    className="rectangle-img"
                                  />
                                </Index.TableCell>
                                <Index.TableCell>
                                  {item?.date
                                    ? moment(item.date).format("DD-MM-YYYY")
                                    : "-"}
                                </Index.TableCell>
                                <Index.TableCell>
                                  {item?.time ? item?.time : "-"}
                                </Index.TableCell>
                                {adminLoginData?.roleId?.permissions?.includes(
                                  "slider_edit"
                                ) && (
                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details global-notification-action-flex">
                                      <CustomToggleButton
                                        checked={item?.isActive}
                                        onChange={(e) =>
                                          handleStatusChange(
                                            item?._id,
                                            e.target.checked
                                          )
                                        }
                                        disabled={
                                          item.isSend ||
                                          statusLoading ||
                                          moment().isAfter(
                                            moment(
                                              `${item?.date} ${item?.time}`,
                                              "YYYY-MM-DD hh:mm A"
                                            )
                                          )
                                        }
                                      />
                                      {/* <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          disabled={
                                            item.isSend ||
                                            statusLoading ||
                                            moment().isAfter(
                                              moment(
                                                `${item?.date} ${item?.time}`,
                                                "YYYY-MM-DD hh:mm A"
                                              )
                                            )
                                          }
                                        >
                                          <Index.EditIcon
                                            onClick={() =>
                                              navigate(
                                                `/admin/global-notification/edit/${item?._id}`
                                              )
                                            }
                                          />
                                        </Index.IconButton>
                                      </Index.Box> */}
                                    </Index.Box>
                                  </Index.TableCell>
                                )}
                              </Index.TableRow>
                            ))
                        ) : (
                          <Index.TableRow>
                            <Index.TableCell
                              component="td"
                              variant="td"
                              scope="row"
                              className="no-data-in-list"
                              colSpan={8}
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
      )}
    </PagesIndex.Formik>
  );
};

export default GlobalNotification;
