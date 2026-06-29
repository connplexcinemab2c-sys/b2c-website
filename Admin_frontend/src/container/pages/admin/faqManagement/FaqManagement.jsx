import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./FaqManagement.css";
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

const FaqManagement = () => {
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [faqList, setFaqList] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [editData, setEditData] = useState("Add");
  const [id, setId] = useState("");
  // modal
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [removeData, setRemoveData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let initialValues;

  if (addOrEdit == "Edit") {
    initialValues = {
      question: editData?.question,
      answer: editData?.answer,
    };
  } else {
    initialValues = {
      question: "",
      answer: "",
    };
  }

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setAddOpen(true);
  };

  const handleClose = () => {
    setId("");
    setAddOpen(false);
    formik.current?.resetForm();
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

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
    let filteredData = faqList?.filter((data) =>
      data?.question?.toLowerCase().includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getFaqList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_FAQ_LIST + "?" + new Date().getTime()
    )
      .then((res) => {
        setFaqList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue != "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((item) =>
            item?.question?.toLowerCase().includes(searchValue?.toLowerCase())
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

  const handleFaqSubmit = (values) => {
    setIsLoading(true);
    const urlEncoded = new URLSearchParams();
    if (id) {
      urlEncoded.append("id", id);
    }
    urlEncoded.append("question", values?.question);
    urlEncoded.append("answer", values?.answer);
    PagesIndex.DataService.post(PagesIndex.Api.ADD_EDIT_FAQ, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getFaqList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const handleFaqRemove = () => {
    setIsLoading(true);
    PagesIndex.DataService.post(PagesIndex.Api.DELETE_FAQ, { id: id })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getFaqList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    getFaqList();
  }, [removeData]);
  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("faq_view")
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleFaqSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.FAQSchema}
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
                    <Index.Box className="title-main  common-export-flex">
                      <Index.Typography
                        variant="p"
                        component="p"
                        className="page-title"
                      >
                        FAQ Management
                      </Index.Typography>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "faq_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add FAQ
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
                      {adminLoginData?.roleId?.permissions?.includes(
                        "faq_add"
                      ) && (
                        <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={() => handleOpen("Add")}
                          >
                            Add FAQ
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
                      className="table-design-main one-line-table region-manage-table cus-one-line-table"
                    >
                      <Index.TableHead>
                        <Index.TableRow>
                          <Index.TableCell>Question</Index.TableCell>
                          {(adminLoginData?.roleId?.permissions?.includes(
                            "faq_edit"
                          ) ||
                            adminLoginData?.roleId?.permissions?.includes(
                              "faq_delete"
                            )) && (
                            <Index.TableCell align="right">
                              Action
                            </Index.TableCell>
                          )}
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
                                      title={item?.question}
                                      placement="top"
                                      disableInteractive
                                      arrow
                                    >
                                      <Index.Box className="common-tooltip-details max-unset-details">
                                        {item?.question ? item?.question : "-"}
                                      </Index.Box>
                                    </Index.Tooltip>
                                  </Index.TableCell>
                                  {(adminLoginData?.roleId?.permissions?.includes(
                                    "faq_edit"
                                  ) ||
                                    adminLoginData?.roleId?.permissions?.includes(
                                      "faq_delete"
                                    )) && (
                                    <Index.TableCell align="right">
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "faq_edit"
                                      ) && (
                                        <Index.IconButton
                                          onClick={(e) => {
                                            setId(item?._id);
                                            handleOpen("Edit");
                                            setEditData(item);
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      )}
                                      {adminLoginData?.roleId?.permissions?.includes(
                                        "faq_delete"
                                      ) && (
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                        >
                                          <Index.DeleteIcon />
                                        </Index.IconButton>
                                      )}
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
              open={addOpen}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="modal"
            >
              <Index.Box
                sx={style}
                className="modal-inner-main add-region-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} FAQ
                  </Index.Typography>
                  <img
                    src={PagesIndex.Svg.cancel}
                    className="modal-close-icon"
                    onClick={handleClose}
                  />
                </Index.Box>

                <Index.Box className="modal-body">
                  <Index.Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Question
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="question"
                          className="form-control"
                          placeholder="Enter question"
                          value={values?.question}
                          inputProps={{ maxLength: 1000 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 1000) {
                              setFieldValue("question", newValue);
                            }
                          }}
                          error={
                            errors.question && touched.question ? true : false
                          }
                          helperText={
                            errors.question && touched.question
                              ? errors.question
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.FormHelperText className="form-lable">
                        Answer
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="answer"
                          className="form-control"
                          placeholder="Enter answer"
                          value={values?.answer}
                          inputProps={{ maxLength: 1000 }}
                          onChange={(e) => {
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 1000) {
                              setFieldValue("answer", newValue);
                            }
                          }}
                          error={errors.answer && touched.answer ? true : false}
                          helperText={
                            errors.answer && touched.answer
                              ? errors.answer
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="modal-user-btn-flex">
                      <Index.Box className="discard-btn-main btn-main-primary">
                        <Index.Box className="common-button blue-button res-blue-button">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={handleClose}
                          >
                            Discard
                          </Index.Button>
                          <Index.Button
                            type="submit"
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            disabled={isLoading}
                          >
                            <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                            ></img>

                            {addOrEdit == "Add" ? "Save" : "Update"}
                          </Index.Button>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handleFaqRemove}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default FaqManagement;
