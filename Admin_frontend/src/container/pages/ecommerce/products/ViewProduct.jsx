import React, { useEffect, useState } from "react";
import { getSingleProductService } from "../../../../redux-toolkit/slice/admin-slice/AdminServices";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";

const skipFields = [
  "_id",
  "stock",
  "price",
  "images",
  "discountedPrice",
  "colorCode",
];
export default function ViewProduct() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const params = PagesIndex.useParams();

  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewAttributeFilesOpen, setViewAttributeFilesOpen] = useState(false);
  const [attributeFiles, setAttributeFiles] = useState([]);

  const handleAttributeFileModalOpen = (files) => {
    setAttributeFiles(files);
    setViewAttributeFilesOpen(true);
  };

  const handleAttributeFileModalClose = (files) => {
    setAttributeFiles([]);
    setViewAttributeFilesOpen(false);
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

  const getSingleProduct = () => {
    dispatch(getSingleProductService(params?.id)).then((response) => {
      if (response?.payload) {
        setViewData(response?.payload);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } else {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    getSingleProduct();
  }, []);
  return (
    <>
      {loading ? (
        <Index.Loader />
      ) : (
        <Index.Box
          className="barge-common-box cms-box"
          sx={{ marginBottom: "15px" }}
        >
          <Index.Box className="title-header">
            <Index.Box className="res-title-header-flex add-coupon-flex">
              <Index.Box className="title-main">
                <Index.Typography
                  variant="p"
                  component="p"
                  className="page-title"
                >
                  View Product
                </Index.Typography>
              </Index.Box>
              <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                <Index.Button
                  variant="contained"
                  disableRipple
                  className="no-text-decoration"
                  onClick={() => navigate("/admin/ecommerce/products")}
                >
                  Back
                </Index.Button>
              </Index.Box>
            </Index.Box>
          </Index.Box>
          <Index.Box className="add-coupon-details">
            <Index.Box className="blog-add-box">
              <Index.Grid container spacing={1}>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Product Name
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {/* {viewData?.productName || "-"} */}
                        {viewData?.productName ? (
                          <>
                            <div>
                              {viewData.productName.charAt(0).toUpperCase() +
                                viewData.productName.slice(1, 50)}
                            </div>
                            {viewData.productName.length > 50 && (
                              <div>{viewData.productName.slice(50)}</div>
                            )}
                          </>
                        ) : (
                          "-"
                        )}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Category Name
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {viewData?.category?.name || "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Maximum Purchase Quantity
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {viewData?.maximumPurchaseQty || "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Seller Name
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {viewData?.seller?.businessName || "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Height * Width (cm)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {`${viewData?.height || "-"} * ${
                          viewData?.width || "-"
                        }`}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      weight (gm)
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {viewData?.weight || "-"}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Total Stock
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {viewData?.totalStock || 0}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Approval Status
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {getProductStatus(viewData?.productStatus)}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={6} md={4} lg={4}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Created At
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography className="view-product-value">
                        {PagesIndex.moment(viewData?.createdAt).format(
                          "MMM D, YYYY"
                        )}
                      </Index.Typography>
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                <Index.Grid item xs={12} sm={12} md={12} lg={12}>
                  <Index.Box className="input-box add-product-input">
                    <Index.FormHelperText className="form-lable">
                      Description
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Typography
                        className="view-product-value"
                        dangerouslySetInnerHTML={{
                          __html: viewData?.description || "-",
                        }}
                      />
                    </Index.Box>
                  </Index.Box>
                </Index.Grid>
                {viewData?.productStatus === "Reject" &&
                  viewData?.rejectionRemark && (
                    <Index.Grid item xs={12} sm={10}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Rejection Remark
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Typography className="view-product-value">
                            {viewData?.rejectionRemark}
                          </Index.Typography>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                  )}
                <Index.Grid item xs={12} sm={12} md={12} lg={12}>
                  <Index.Box className="input-box add-product-input view-product-attribute-box">
                    <Index.FormHelperText className="form-lable">
                      Product Varients
                    </Index.FormHelperText>
                    {viewData?.attributes?.map((attribute, index) => {
                      return (
                        <Index.Box
                          className="attribute-flex-main"
                          key={attribute?._id}
                        >
                          <Index.Box className="input-box add-product-input">
                            <Index.FormHelperText className="form-lable">
                              Varient-{index + 1}
                            </Index.FormHelperText>
                          </Index.Box>
                          <Index.Grid container spacing={1}>
                            {Object.entries(attribute).map(([key, value]) => {
                              console.log(key, value, "key, value");
                              if (skipFields.includes(key)) return null;
                              return (
                                <Index.Grid item xs={6} sm={3} md={2} lg={2}>
                                  <Index.Box className="input-box add-product-input">
                                    <Index.FormHelperText className="form-lable">
                                      {key}
                                    </Index.FormHelperText>
                                    <Index.Box className="form-group">
                                      <Index.Typography className="view-product-value">
                                        {value
                                          ? Array.isArray(value)
                                            ? value?.join(", ")
                                            : value
                                          : "-"}
                                      </Index.Typography>
                                    </Index.Box>
                                  </Index.Box>
                                </Index.Grid>
                              );
                            })}
                            <Index.Grid item xs={6} sm={3} md={2} lg={2}>
                              <Index.Box className="input-box add-product-input">
                                <Index.FormHelperText className="form-lable">
                                  Price
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.Typography className="view-product-value">
                                    {attribute?.price || "-"}
                                  </Index.Typography>
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item xs={6} sm={3} md={2} lg={2}>
                              <Index.Box className="input-box add-product-input">
                                <Index.FormHelperText className="form-lable">
                                  Discounted Price
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.Typography className="view-product-value">
                                    {attribute?.discountedPrice || "-"}
                                  </Index.Typography>
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item xs={6} sm={3} md={2} lg={2}>
                              <Index.Box className="input-box add-product-input">
                                <Index.FormHelperText className="form-lable">
                                  Stock
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.Typography className="view-product-value">
                                    {attribute?.stock || "-"}
                                  </Index.Typography>
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                            <Index.Grid item xs={6} sm={3} md={2} lg={2}>
                              <Index.Box className="input-box add-product-input">
                                <Index.FormHelperText className="form-lable">
                                  Product Images
                                </Index.FormHelperText>
                                <Index.Box className="form-group">
                                  <Index.Box className="icon-width-action view-product-eye-box">
                                    <Index.IconButton
                                      onClick={() =>
                                        handleAttributeFileModalOpen(
                                          attribute?.images
                                        )
                                      }
                                    >
                                      <Index.Visibility />
                                    </Index.IconButton>
                                  </Index.Box>
                                </Index.Box>
                              </Index.Box>
                            </Index.Grid>
                          </Index.Grid>
                        </Index.Box>
                      );
                    })}
                  </Index.Box>
                </Index.Grid>
              </Index.Grid>
            </Index.Box>
          </Index.Box>
          {viewAttributeFilesOpen && (
            <ViewAttributeFilesModal
              open={viewAttributeFilesOpen}
              handleClose={handleAttributeFileModalClose}
              attributeFiles={attributeFiles}
            />
          )}
        </Index.Box>
      )}
    </>
  );
}

const ViewAttributeFilesModal = ({ open, handleClose, attributeFiles }) => {
  return (
    <>
      <Index.Modal
        aria-labelledby="modal-modal-title"
        open={open}
        onClose={handleClose}
        aria-describedby="modal-modal-description"
        className="seller-modal"
      >
        <Index.Box
          sx={PagesIndex.style}
          className="seller-modal-inner seller-add-product-modal-inner-main custom-add-product-modal"
        >
          <Index.Box className="seller-modal-header">
            <Index.Typography className="seller-modal-title">
              View Varient Gallary
            </Index.Typography>
            <Index.Button
              className="seller-modal-close-btn"
              onClick={handleClose}
              disabledRipple
            >
              <img
                src={PagesIndex.Svg.graycloseIcon}
                className="seller-modal-close-icon"
                alt="Close"
              />
            </Index.Button>
          </Index.Box>
          <Index.Box className="seller-modal-body">
            <Index.Box className="seller-modal-hgt-scroll cus-scrollbar">
              <Index.Box sx={{ width: 1 }} className="grid-mains">
                <Index.Box
                  display="grid"
                  gridTemplateColumns="repeat(12, 1fr)"
                  gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                >
                  {attributeFiles?.map((image, index) => {
                    const isBlobInstance = image instanceof Blob;
                    const ext = isBlobInstance
                      ? image?.type?.split("/")?.[0]
                      : image?.split(".")?.at(-1);
                    const isImage =
                      ext && ["image", "png", "jpg", "jpeg"]?.includes(ext);
                    const isVideo =
                      ext && ["video", "mp4", "webm"]?.includes(ext);
                    const fileUrl = `${PagesIndex.ECOMMERCE_IMAGES_API_ENDPOINT}/${image}`;
                    return (
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 6",
                          lg: "span 6",
                        }}
                        className="grid-column product-file-grid"
                        key={index}
                      >
                        {isImage && (
                          <img
                            src={fileUrl}
                            className="add-product-img"
                            alt="product img"
                          />
                        )}
                        {isVideo && (
                          <video
                            className="add-product-img"
                            src={fileUrl}
                            controls
                          />
                        )}
                      </Index.Box>
                    );
                  })}
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
};
