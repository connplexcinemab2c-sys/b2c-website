import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import DataService from "../../../../config/DataService";
import { Api } from "../../../../config/Api";
import PagesIndex from "../../../PagesIndex";

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

const Membership = () => {
  const navigate = Index.useNavigate();
  const [memberShipList, setMemberShipList] = useState([]);
  const [filterlist, setFilterList] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const getMemberShipList = async () => {
    await DataService.get(Api.GET_MEMBERSHIPLIST)
      .then((res) => {
        setMemberShipList(res.data.data);
        setFilterList(res.data.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      })
      .catch((error) => {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        console.log(error);
      });
  };

  const handleSearch = (event) => {
    setSearchVal(event.target.value);
    const filteredList = memberShipList.filter((item) => {
      let title = item?.title
        ?.toLowerCase()
        .includes(event?.target?.value?.toLowerCase());
      let description = item?.description
        ?.toLowerCase()
        .includes(event?.target?.value?.toLowerCase());

      return title || description;
    });
    setFilterList(filteredList);
    setCurrentPage(0);
  };

  useEffect(() => {
    getMemberShipList();
  }, []);

  const deleteMemberShip = async () => {
    let urlencoded = new URLSearchParams();
    urlencoded.append("id", id);
    await DataService.post(Api.DELETE_MEMBERSHIP, urlencoded)
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleDeleteClose();
        getMemberShipList();
      })
      .catch((error) => {
        console.log(error);
      });
    handleDeleteClose();
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };
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
                  Membership
                </Index.Typography>
                {memberShipList?.length < 1 && (
                  <Index.Box className="common-button blue-button res-blue-button mobile-blog-grp-btn  common-mobile-show-export">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        navigate("/admin/add-memberShip");
                      }}
                    >
                      Add Membership
                    </Index.Button>
                  </Index.Box>
                )}
              </Index.Box>
              <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search">
                <Search className="search ">
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                    value={searchVal}
                    onChange={(e) => handleSearch(e)}
                  />
                </Search>

                {memberShipList?.length < 1 && (
                  <Index.Box className="common-button blue-button res-blue-button blog-grp-btn desktop-export-details">
                    <Index.Button
                      variant="contained"
                      disableRipple
                      className="no-text-decoration"
                      onClick={() => {
                        navigate("/admin/add-memberShip");
                      }}
                    >
                      Add Membership
                    </Index.Button>
                  </Index.Box>
                )}
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
                    <Index.TableCell width="5%">Video</Index.TableCell>
                    <Index.TableCell width="15%">Title</Index.TableCell>
                    <Index.TableCell width="15%">Description</Index.TableCell>

                    {/* <Index.TableCell align="center" width="5%">
                    Status
                  </Index.TableCell> */}
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
                    {filterlist.length > 0 ? (
                      filterlist
                        ?.slice(
                          currentPage * rowsPerPage,
                          currentPage * rowsPerPage + rowsPerPage
                        )
                        .map((item, index) => (
                          <Index.TableRow key={index}>
                            <Index.TableCell>
                              <Index.Box className="membership-image-box">
                                {item?.file !== "" ? (
                                  <video
                                    className="membership-video"
                                    controls="false"
                                    autoPlay="true"
                                    muted
                                    loop
                                    data-wf-ignore="true"
                                    data-object-fit="cover"
                                  >
                                    <source
                                      src={
                                        item?.file
                                          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.file}`
                                          : PagesIndex.Png.NoImageAvailable
                                      }
                                      className="member-img"
                                      alt="Membership"
                                      type="video/mp4"
                                    />
                                  </video>
                                ) : (
                                  <img
                                    src={PagesIndex.Png.NoImageAvailable}
                                    className="membership-video"
                                    alt="Membership"
                                  />
                                )}
                              </Index.Box>
                            </Index.TableCell>
                            <Index.TableCell>
                              <Index.Tooltip
                                title={`${item?.title}`}
                                placement="top"
                                disableInteractive
                                arrow
                              >
                                <Index.Box className="common-tooltip-details">
                                  {item?.title
                                    ? `${`${item?.title}`.slice(0, 70)}...`
                                    : "-"}
                                </Index.Box>
                              </Index.Tooltip>
                            </Index.TableCell>
                            <Index.TableCell>
                              <Index.Tooltip
                                title={`${item?.description}`}
                                placement="top"
                                disableInteractive
                                arrow
                              >
                                <Index.Box className="common-tooltip-details">
                                  {item?.description
                                    ? `${`${item?.description}`.slice(
                                        0,
                                        70
                                      )}...`
                                    : "-"}
                                </Index.Box>
                              </Index.Tooltip>
                            </Index.TableCell>
                            <Index.TableCell align="center">
                              <Index.Box className="flex-action-details">
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton>
                                    <Index.EditIcon
                                      onClick={(e) =>
                                        navigate("/admin/add-memberShip", {
                                          state: { data: item },
                                        })
                                      }
                                    />
                                  </Index.IconButton>
                                </Index.Box>
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={() => handleDeleteOpen(item?._id)}
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
                          colSpan={4}
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

          {filterlist?.length && !loading ? (
            <Index.Box className="pagination-design flex-end">
              <Index.Stack spacing={2}>
                <Index.Box className="pagination-count">
                  <Index.TablePagination
                    component="div"
                    count={filterlist?.length}
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

      <PagesIndex.DeleteModal
        deleteOpen={deleteOpen}
        handleDeleteClose={handleDeleteClose}
        handleDeleteRecord={deleteMemberShip}
      />
    </>
  );
};

export default Membership;
