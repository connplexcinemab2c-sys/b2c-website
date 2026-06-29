import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddBlogBackground from "./AddBlogBackground";

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

const BlogManagement = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [blogList, setBlogList] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectBlogBgData, setSelectBlogBgData] = useState({});
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [removeData, setRemoveData] = useState(false);
  const [isOpenBlogBg, setIsOpenBlogBg] = useState(false);
  const [isExistBlogBg, setIsExistBlogBg] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});

  const handleOpenBlogBgModal = () => {
    setIsOpenBlogBg(true);
  };
  const handleCloseBlogBgModal = () => {
    setIsOpenBlogBg(false);
    setSelectBlogBgData({});
    getBlogList();
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  useEffect(() => {
    if (blogList.length) {
      let filter = blogList.filter((item) => item.type == "blog_background");
      if (filter.length > 0) {
        setIsExistBlogBg(true);
      } else {
        setIsExistBlogBg(false);
      }
    }
  }, [blogList]);

  const handleClassRemove = () => {
    setIsLoading(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_BLOG, {
      id: id
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        getBlogList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const requestSearch = (searched) => {
    let filteredData = blogList?.filter(
      (data) =>
        data?.title?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.description?.toLowerCase().includes(searched?.toLowerCase())
    );
    setFilteredData(filteredData);
    setCurrentPage(0);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value?.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const handleStatus = (event, id) => {
    const data = {
      id: id,
      status: event.target.checked
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.UPDATE_BLOG, data)
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        getBlogList();
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      })
      .catch((err) => {
        PagesIndex.toast.error(err.response.data.message);
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
  };
  const getBlogList = () => {
    PagesIndex.DataService.post(PagesIndex.Api.GET_BLOGS)
      .then((res) => {
        setBlogList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((data) =>
            data?.title?.toLowerCase().includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
        }
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
  useEffect(() => {
    getBlogList();
  }, [removeData]);

  const removeImageTags = (html) => {
    return html?.replace(/<(table|figure|[^>]+)>/g, "");
  };
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("blog_view")
  ) {
    return (
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
                    Blog Management
                  </Index.Typography>

                  <Index.Box className="common-button blue-button res-blue-button mobile-blog-grp-btn  common-mobile-show-export">
                    {!isExistBlogBg && (
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => {
                          handleOpenBlogBgModal();
                        }}
                      >
                        Add background
                      </Index.Button>
                    )}
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        navigate("/admin/add-blog");
                      }}
                    >
                      Add Blog
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                  <Search className="search ">
                    <StyledInputBase
                      placeholder="Search"
                      inputProps={{ "aria-label": "search" }}
                      value={searchValue}
                      onChange={(e) => handleInputChange(e)}
                    />
                  </Search>

                  <Index.Box className="common-button blue-button res-blue-button blog-grp-btn desktop-export-details">
                    {!isExistBlogBg && (
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => {
                          handleOpenBlogBgModal();
                        }}
                      >
                        Add background
                      </Index.Button>
                    )}
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        navigate("/admin/add-blog");
                      }}
                    >
                      Add Blog
                    </Index.Button>
                  </Index.Box>
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="page-table-main blog-table-main">
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
                      <Index.TableCell width="5%">Blog Image</Index.TableCell>
                      <Index.TableCell width="3%">
                        Blog Sequence
                      </Index.TableCell>
                      <Index.TableCell width="15%">Blog Title</Index.TableCell>
                      <Index.TableCell width="15%">
                        Blog Description
                      </Index.TableCell>

                      <Index.TableCell align="center" width="5%">
                        Status
                      </Index.TableCell>
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
                          colSpan={6}
                          align="center"
                        >
                          <Index.Loader />
                        </Index.TableCell>
                      </Index.TableRow>
                    </Index.TableBody>
                  ) : (
                    <Index.TableBody>
                      {filteredData?.length > 0 ? (
                        filteredData
                          ?.slice(
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage + rowsPerPage
                          )
                          .map((row) => (
                            <Index.TableRow>
                              <Index.TableCell>
                                <Index.Box className="rectangle-img-box">
                                  <img
                                    // src={`https://backend.theconnplex.com/uploads/${row?.imageBlog}`}
                                    src={
                                      row?.imageBlog
                                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${row?.imageBlog}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    alt=""
                                    className="rectangle-img"
                                  />
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell>
                                {row?.itemSequence || "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {row?.title || "-"}
                              </Index.TableCell>

                              <Index.TableCell className="table-data-text">
                                {row?.description
                                  ? removeImageTags(row?.description)
                                  : "-"}
                              </Index.TableCell>

                              <Index.TableCell align="center">
                                <CustomToggleButton
                                  defaultChecked={row?.status}
                                  onChange={(e) => handleStatus(e, row?._id)}
                                  disabled={loadingState[row?._id] || false}
                                />
                              </Index.TableCell>
                              <Index.TableCell align="right">
                                <Index.Box className="flex-action-details">
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton
                                      onClick={(e) => {
                                        navigate("/admin/view-blog", {
                                          state: { data: row }
                                        });
                                      }}
                                    >
                                      <Index.Visibility />
                                    </Index.IconButton>
                                  </Index.Box>
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton>
                                      <Index.EditIcon
                                        onClick={(e) => {
                                          if (row?.type) {
                                            setSelectBlogBgData(row);
                                            handleOpenBlogBgModal();
                                          } else {
                                            navigate("/admin/add-blog", {
                                              state: { data: row }
                                            });
                                          }
                                        }}
                                      />
                                    </Index.IconButton>
                                  </Index.Box>
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton
                                      onClick={() => handleDeleteOpen(row?._id)}
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
                            colSpan={6}
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

        {/* delete modal */}
        <PagesIndex.DeleteModal
          deleteOpen={deleteOpen}
          handleDeleteClose={handleDeleteClose}
          handleDeleteRecord={!isLoading && handleClassRemove}
        />

        {/* blog background modal */}
        <AddBlogBackground
          editData={selectBlogBgData}
          open={isOpenBlogBg}
          handleOpen={handleOpenBlogBgModal}
          handleClose={handleCloseBlogBgModal}
        />
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default BlogManagement;
