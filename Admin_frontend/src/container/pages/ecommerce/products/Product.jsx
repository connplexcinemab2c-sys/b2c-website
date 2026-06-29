import React, { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Search, StyledInputBase } from "../../../../common/Search/Search";
import { useNavigate } from "react-router-dom";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { useLocation, useParams } from "react-router-dom";
const Product = () => {
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
  const [removeData, setRemoveData] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusChange, setIsStatusChange] = useState("");

  const navigate = useNavigate();

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

  const handleViewProduct = (productId) => {
    navigate(`/admin/ecommerce/products/view/${productId}`);
  };

  const getProductList = () => {
    PagesIndex.EcommerceService.get(PagesIndex.EcommerceApi.GET_ALL_PRODUCTS)
      .then((res) => {
        setProductList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setLoading(false);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((title) =>
            title?.productName
              ?.toLowerCase()
              .includes(searchValue?.toLowerCase())
          );
          setFilteredData(filteredDataFilter);
        } else {
          setFilteredData(res?.data?.data);
          setSearchValue("");
          setRemoveData(false);
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
  }, [removeData]);

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const handleRemoveProduct = () => {
    setIsLoading(true);
    PagesIndex.EcommerceService.post(PagesIndex.EcommerceApi.DELETE_PRODUCT, {
      id: id,
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getProductList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const handleActiveDeactiveProduct = (productId, status) => {
    setIsStatusChange(productId);
    let payload = {
      id: productId,
      status,
    };
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ACTIVE_DEACTIVE_PRODUCT,
      payload
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        getProductList();
        setIsStatusChange("");
      })
      .catch((err) => {
        setIsStatusChange("");
        PagesIndex.toast.error(err?.response?.data?.message);
      });
  };

  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/ecommerce/add-product/${productId}`);
  };

  const getProductStatus = (status) => {
    switch (status) {
      case "Pending":
        return "Pending";
      case "Approve":
        return "Approved";
      case "Reject":
        return "Rejected";
      default:
        return "-";
    }
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
                Product Management
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

              <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                  onClick={() => navigate("/admin/ecommerce/add-product")}
                >
                  Add Product
                </Index.Button>
              </Index.Box>
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
                  <Index.TableCell width="10%">Product Number</Index.TableCell>
                  <Index.TableCell width="10%">Total Variant</Index.TableCell>
                  <Index.TableCell width="10%">Approval Status</Index.TableCell>
                  <Index.TableCell width="10%">Status</Index.TableCell>

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
                      ?.map((item, index) => (
                        <Index.TableRow key={item?._id}>
                          {/* <Index.TableCell>
                            {item?.productName ? item?.productName : "-"}
                          </Index.TableCell> */}
                          <Index.TableCell>
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

                          {/* <Index.TableCell>
                            {item?.category?.name ? item?.category?.name : "-"}
                          </Index.TableCell> */}
                          <Index.TableCell>
                            {item?.category?.name
                              ? item.category.name.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                )
                              : "-"}
                          </Index.TableCell>

                          <Index.TableCell>
                            {item?.productCode ? item?.productCode : "-"}
                          </Index.TableCell>
                          <Index.TableCell>
                            {item?.attributes?.length}
                          </Index.TableCell>
                          <Index.TableCell>
                            {getProductStatus(item?.productStatus)}
                          </Index.TableCell>
                          <Index.TableCell>
                            <CustomToggleButton
                              defaultChecked={item?.isActive}
                              checked={item?.isActive}
                              onChange={(e) =>
                                handleActiveDeactiveProduct(
                                  item?._id,
                                  e?.target?.checked
                                )
                              }
                              disabled={isStatusChange === item?._id}
                            />
                          </Index.TableCell>

                          <Index.TableCell align="right">
                            <Index.Box className="flex-action-details">
                              <Index.Box className="icon-width-action">
                                <Index.IconButton
                                  onClick={() => handleEditProduct(item?._id)}
                                >
                                  <Index.EditIcon />
                                </Index.IconButton>
                              </Index.Box>
                              <Index.Box className="icon-width-action">
                                <Index.IconButton
                                  onClick={() => handleDeleteOpen(item?._id)}
                                >
                                  <Index.DeleteIcon />
                                </Index.IconButton>
                              </Index.Box>
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
                        No Product Available
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
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handleRemoveProduct}
            />
          </Index.Box>
        ) : (
          <></>
        )}
      </Index.Box>
    </Index.Box>
  );
};

export default Product;
