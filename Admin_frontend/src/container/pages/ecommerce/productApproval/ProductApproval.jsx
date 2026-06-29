import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import {
  Search,
  style,
  StyledInputBase,
} from "../../../../common/Search/Search";
import { useNavigate } from "react-router-dom";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { useLocation, useParams } from "react-router-dom";
import { set } from "lodash";
import * as Yup from "yup";

const ProductApproval = () => {
  // const location = useLocation();

  // const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [productList, setProductList] = useState([]);
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [id, setId] = useState("");
  const [isApproveReject, setIsApproveReject] = useState(null);
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);

  const navigate = useNavigate();

  // handle remark modal open
  const handleRemarkModalOpen = (productId) => {
    setId(productId);
    setRemarkModalOpen(true);
  };

  // handle remark modal close
  const handleRemarkModalClose = () => {
    setRemarkModalOpen(false);
    setId("");
  };

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  // Search on table
  const requestSearch = (searched) => {
    let filteredData = productList?.filter((data) =>
      data?.productName?.toLowerCase().includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getProductList = () => {
    PagesIndex.EcommerceService.get(PagesIndex.EcommerceApi.GET_ALL_PRODUCTS)
      .then((res) => {
        setProductList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setLoading(false);
        if (searchValue !== "" && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((title) =>
            title?.productName
              ?.toLowerCase()
              .includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  useEffect(() => {
    getProductList();
  }, []);

  const handleApproveRejectProduct = (values, action) => {
    setIsApproveReject(values?.id);
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.APPROVE_REJECT_PRODUCT,
      values
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        getProductList();
        setIsApproveReject(null);
        handleRemarkModalClose();
        action?.resetForm && action?.resetForm();
        action?.setSubmitting && action?.setSubmitting(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsApproveReject(null);
        handleRemarkModalClose();
        action?.setSubmitting && action?.setSubmitting(false);
      });
  };

  const handleViewProduct = (productId) => {
    navigate(`/admin/ecommerce/products-approval/view/${productId}`);
  };

  return (
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
                Product Approval
              </Index.Typography>
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
                  <Index.TableCell width="10%">Product Name</Index.TableCell>
                  <Index.TableCell width="10%">
                    Product Category
                  </Index.TableCell>
                  <Index.TableCell width="10%">Total Variant</Index.TableCell>
                  <Index.TableCell width="10%">Approval Status</Index.TableCell>
                  <Index.TableCell width="10%">Created At</Index.TableCell>
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
                  {filteredData?.length ? (
                    filteredData
                      ?.slice(
                        currentPage * rowsPerPage,
                        currentPage * rowsPerPage + rowsPerPage
                      )
                      ?.map((item, index) => {
                        const isApproved = item?.productStatus === "Approve";
                        const isRejected = item?.productStatus === "Reject";
                        const productStatus = item?.productStatus
                          ? `${item?.productStatus}${
                              isApproved ? "d" : isRejected ? "ed" : ""
                            }`
                          : "-";
                        const isApproveDisabled =
                          isApproveReject == item?._id ||
                          item?.productStatus === "Approve" ||
                          item?.productStatus === "Reject";
                        const isRejectDisabled =
                          isApproveReject == item?._id ||
                          item?.productStatus === "Reject";
                        return (
                          <Index.TableRow key={item?._id}>
                            <Index.TableCell>
                              {/* {item?.productName ? item?.productName : "-"} */}
                              {item?.productName
                                ? item.productName
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(" ")
                                    .slice(0, 50) +
                                  (item.productName.length > 50 ? "..." : "")
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {item?.category?.name
                                ? item?.category?.name
                                : "-"}
                            </Index.TableCell>
                            <Index.TableCell>
                              {item?.attributes?.length}
                            </Index.TableCell>
                            <Index.TableCell>{productStatus}</Index.TableCell>
                            <Index.TableCell>
                              {PagesIndex.moment(item?.createdAt).format(
                                "MMM D, YYYY, h:mm A"
                              )}
                            </Index.TableCell>

                            <Index.TableCell align="right">
                              <Index.Box className="flex-action-details">
                                <Index.Tooltip
                                  title="Approve"
                                  arrow
                                  placement="top"
                                >
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton
                                      onClick={() =>
                                        handleApproveRejectProduct({
                                          id: item?._id,
                                          status: "Approve",
                                        })
                                      }
                                      disabled={isApproveDisabled}
                                    >
                                      <Index.CheckCircleRoundedIcon
                                        sx={{
                                          color: isApproveDisabled
                                            ? "#77c978"
                                            : "#3fd441",
                                        }}
                                      />
                                    </Index.IconButton>
                                  </Index.Box>
                                </Index.Tooltip>
                                <Index.Tooltip
                                  title="Reject"
                                  arrow
                                  placement="top"
                                >
                                  <Index.Box className="icon-width-action">
                                    <Index.IconButton
                                      onClick={() =>
                                        handleRemarkModalOpen(item?._id)
                                      }
                                      disabled={isRejectDisabled}
                                    >
                                      <Index.CancelIcon
                                        sx={{
                                          color: isRejectDisabled
                                            ? "#c24f54"
                                            : "#c6131b",
                                        }}
                                      />
                                    </Index.IconButton>
                                  </Index.Box>
                                </Index.Tooltip>
                                <Index.Box className="icon-width-action">
                                  <Index.IconButton
                                    onClick={() => handleViewProduct(item?._id)}
                                  >
                                    <Index.Visibility />
                                  </Index.IconButton>
                                </Index.Box>
                              </Index.Box>
                            </Index.TableCell>
                          </Index.TableRow>
                        );
                      })
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
                        No product approval available
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
            {remarkModalOpen && (
              <RejectionRemarkModal
                open={remarkModalOpen}
                handleClose={handleRemarkModalClose}
                rowId={id}
                handleApproveRejectProduct={handleApproveRejectProduct}
              />
            )}
          </Index.Box>
        ) : (
          <></>
        )}
      </Index.Box>
    </Index.Box>
  );
};

const RejectionRemarkModal = ({
  open,
  handleClose,
  rowId,
  handleApproveRejectProduct,
}) => {
  const initialValues = {
    id: rowId,
    remark: "",
    status: "Reject",
  };

  const rejectionRemarkSchema = Yup.object().shape({
    remark: Yup.string().required("Please enter remark"),
  });

  return (
    <Index.Modal
      open={open}
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
            Add Rejection Remark
          </Index.Typography>
          <img
            src={PagesIndex.Svg.cancel}
            className="modal-close-icon"
            onClick={handleClose}
          />
        </Index.Box>

        <Index.Box className="modal-body add-remark-modal-body">
          <PagesIndex.Formik
            enableReinitialize
            onSubmit={handleApproveRejectProduct}
            initialValues={initialValues}
            validationSchema={rejectionRemarkSchema}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <Index.Stack
                component="form"
                spacing={2}
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
              >
                <Index.Box className="input-box modal-input-box">
                  <Index.FormHelperText className="form-lable">
                    Remark :
                  </Index.FormHelperText>
                  <Index.Box className="form-group d-flex-textarea">
                    <Index.TextareaAutosize
                      fullWidth
                      className="form-control form-text-area"
                      minRows={6}
                      maxRows={6}
                      name="remark"
                      placeholder="Enter remark"
                      value={values?.remark}
                      onChange={handleChange}
                    />
                  </Index.Box>
                  <Index.FormHelperText error>
                    {errors?.remark && touched?.remark ? errors?.remark : null}
                  </Index.FormHelperText>
                </Index.Box>

                <Index.Box className="modal-user-btn-flex">
                  <Index.Box className="discard-btn-main btn-main-primary">
                    <Index.Box className="common-button blue-button res-blue-button">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Discard
                      </Index.Button>

                      <Index.LoadingButton
                        type="submit"
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        loading={isSubmitting}
                        loadingPosition="center"
                      >
                        Submit
                      </Index.LoadingButton>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
              </Index.Stack>
            )}
          </PagesIndex.Formik>
        </Index.Box>
      </Index.Box>
    </Index.Modal>
  );
};

export default ProductApproval;
