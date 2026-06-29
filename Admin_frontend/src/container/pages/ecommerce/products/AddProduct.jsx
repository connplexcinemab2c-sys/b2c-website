import React, { useEffect, useState } from "react";
import {
  getAttributesByCategoryService,
  getCategoriesService,
  getSingleProductService,
  addEditProductService,
} from "../../../../redux-toolkit/slice/admin-slice/AdminServices";
import "../../admin/blogManagement/ckeditor.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import { Form, Formik } from "formik";
const { EcommerceService, toast, EcommerceApi } = PagesIndex;

const colorList = [
  "White",
  "Black",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Gray",
];

const sizeList = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function AddProduct() {
  const dispatch = PagesIndex.useDispatch();
  const navigate = PagesIndex.useNavigate();
  const param = PagesIndex.useParams();

  const [categoryList, setCategoryList] = React.useState([]);
  const [attributeList, setAttributeList] = React.useState([]);
  const [editData, setEditData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [openFileUpload, setOpenFileUpload] = React.useState(false);
  const [fileType, setFileType] = React.useState("image");
  const [attributeId, setAttributeId] = React.useState(null);
  const [age, setAge] = React.useState("");
  const [sellerList, setSellerList] = useState([]);
  const initialValues = {
    productName: editData?.productName ? editData?.productName : "",
    seller: editData?.seller?._id ? editData?.seller?._id : "",
    category: editData?.category ? editData?.category?._id : "",
    maximumPurchaseQty: editData?.maximumPurchaseQty
      ? editData?.maximumPurchaseQty
      : 1,
    description: editData?.description ? editData?.description : "",
    attributes: !!editData?.attributes?.length
      ? editData?.attributes
      : [
          {
            // color: "",
            // size: [],
            price: "",
            discountedPrice: "",
            stock: "",
            images: [],
          },
        ],
    removedImages: [],
    width: editData?.width ? editData?.width : 1,
    height: editData?.height ? editData?.height : 1,
    weight: editData?.weight ? editData?.weight : 1,
  };

  const handleChangedropdown = (event) => {
    setAge(event.target.value);
  };

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const handleOpenModal = (images, attributeId) => {
    setModelOpen(true);
    setModalImages(images);
    setOpenModal(true);
    setAttributeId(attributeId);
  };
  const handleCloseModal = () => {
    setModalImages([]);
    setModelOpen(false);
    setOpenModal(false);
    setAttributeId(null);
  };

  const handleOpenUploadFileModal = (attributeId) => {
    setOpenFileUpload(true);
    setAttributeId(attributeId);
  };
  const handleCloseUploadFileModal = () => {
    setOpenFileUpload(false);
    setFileType("image");
    setAttributeId(null);
  };

  const handleDiscard = () => {
    navigate("/admin/ecommerce/products");
  };

  const handleSubmit = (values) => {
    // return;

    setLoading(true);
    const formData = new FormData();
    if (param?.id) {
      formData.append("id", param?.id);
    }
    formData.append("productName", values?.productName);
    formData.append("description", values?.description);
    formData.append("category", values?.category);
    formData.append("seller", values?.seller);
    formData.append("maximumPurchaseQty", values?.maximumPurchaseQty || 0);
    formData.append("height", values?.height || 0);
    formData.append("width", values?.width || 0);
    formData.append("weight", values?.weight || 0);
    formData.append(
      "attributes",
      JSON.stringify(
        values.attributes.map((attr) => {
          const { images, _id, ...rest } = attr;
          return { ...rest, _id, discountedPrice: attr?.discountedPrice || 0 };
        })
      )
    );
    values.attributes.forEach((attr, index) => {
      attr.images?.forEach((image) =>
        formData.append(`images[${index}]`, image)
      );
    });

    if (param?.id) {
      values?.removedImages?.forEach((attr, index) => {
        formData.append(`removeImages[${index}][attribute]`, attr?.attribute);
        attr?.images?.forEach((image, i) => {
          formData.append(`removeImages[${index}][images][${i}]`, image);
        });
      });
    }

    dispatch(addEditProductService(formData)).then((response) => {
      if (response?.payload) {
        navigate("/admin/ecommerce/products");
      } else {
        setLoading(false);
      }
    });
  };

  const getCategories = () => {
    dispatch(getCategoriesService()).then((response) => {
      if (response?.payload) {
        setCategoryList(response?.payload);
      } else {
        setCategoryList([]);
      }
    });
  };

  const getAttributesByCategory = (id) => {
    dispatch(getAttributesByCategoryService(id)).then((response) => {
      if (response?.payload) {
        setAttributeList(response?.payload);
      } else {
        setAttributeList([]);
      }
    });
  };

  const getAllActiveSellerList = async () => {
    try {
      let response = await EcommerceService.get(
        EcommerceApi.GET_ALL_ACTIVE_SELLER
      );
      setSellerList(response?.data?.data);
    } catch (error) {
      console.log("getting error while fetching seller list");
      setSellerList([]);
    }
  };

  const getSingleProduct = () => {
    dispatch(getSingleProductService(param?.id)).then((response) => {
      if (response?.payload)
        console.log("response?.payload", response?.payload);
      {
        setEditData(response?.payload);
        getAttributesByCategory(response?.payload?.category?._id);
      }
    });
  };

  useEffect(() => {
    if (param?.id) {
      getSingleProduct();
    }
  }, [param]);

  useEffect(() => {
    getCategories();
    getAllActiveSellerList();
  }, []);
  return (
    <>
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
                {editData?._id ? "Edit Product" : "Add Product"}
              </Index.Typography>
            </Index.Box>
          </Index.Box>
        </Index.Box>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={Index.productValidationSchema}
        >
          {({
            values,
            handleChange,
            handleBlur,
            touched,
            errors,
            setFieldValue,
          }) => (
            <Form>
              {console.log("opopop", errors, values)}
              <Index.Box className="add-coupon-details">
                <Index.Box className="blog-add-box">
                  <Index.Grid container spacing={1}>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Product Name
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter product name"
                            value={values?.productName}
                            name="productName"
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <Index.FormHelperText error>
                            {errors?.productName && touched?.productName
                              ? errors?.productName
                              : false}
                          </Index.FormHelperText>
                          {/* <Index.FormHelperText error>
                            {!values?.productName
                              ? "Please enter product name"
                              : null}
                          </Index.FormHelperText> */}
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Category
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Box className="dropdown-box">
                            <Index.FormControl className="form-control">
                              <Index.Select
                                className="dropdown-select"
                                value={values?.category}
                                name="category"
                                // onChange={handleChange}
                                onChange={(e) => {
                                  const value = e?.target?.value;
                                  setFieldValue("category", value);
                                  getAttributesByCategory(value);
                                }}
                                onBlur={handleBlur}
                                displayEmpty
                                renderValue={
                                  values?.category
                                    ? undefined
                                    : () => (
                                        <span className="placeholder-text">
                                          Select product category
                                        </span>
                                      )
                                }
                                // inputprops={{ 'aria-label': 'Without label' }}
                              >
                                {categoryList?.map((category) => {
                                  return (
                                    <Index.MenuItem
                                      value={category?._id}
                                      className="drop-menuitem"
                                      key={category?._id}
                                    >
                                      {category?.name}
                                    </Index.MenuItem>
                                  );
                                })}
                              </Index.Select>

                              <Index.FormHelperText error>
                                {errors?.category && touched?.category
                                  ? errors?.category
                                  : false}
                              </Index.FormHelperText>
                              {/* <Index.FormHelperText error>
                                {!values?.category
                                  ? "Please select a category"
                                  : null}
                              </Index.FormHelperText> */}
                            </Index.FormControl>
                          </Index.Box>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Maximum Purchase Quantity
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter maximum purchase quantity"
                            value={values?.maximumPurchaseQty}
                            name="maximumPurchaseQty"
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d+$/;

                              if (value === "" || regex?.test(value)) {
                                setFieldValue("maximumPurchaseQty", value);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          {/* <Index.Typography className="indicator-text">
                            Customer will be able to purchase this maximum
                            quantity for this product. Default 0 for unlimited
                          </Index.Typography> */}
                          <Index.FormHelperText error>
                            {errors?.maximumPurchaseQty &&
                            touched?.maximumPurchaseQty
                              ? errors?.maximumPurchaseQty
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Height (cm)
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter height"
                            value={values?.height}
                            name="height"
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d+$/;

                              if (value === "" || regex?.test(value)) {
                                setFieldValue("height", value);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          <Index.FormHelperText error>
                            {touched?.height && errors?.height}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Width (cm)
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter width"
                            value={values?.width}
                            name="width"
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d+$/;

                              if (value === "" || regex?.test(value)) {
                                setFieldValue("width", value);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          <Index.FormHelperText error>
                            {touched?.width && errors?.width}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Weight (gm)
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter weight"
                            value={values?.weight}
                            name="weight"
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d+$/;

                              if (value === "" || regex?.test(value)) {
                                setFieldValue("weight", value);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          <Index.FormHelperText error>
                            {touched?.weight && errors?.weight}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                        <Index.Box className="input-box add-product-input">
                          <Index.FormHelperText className="form-lable">
                            Seller
                          </Index.FormHelperText>
                          <Index.Box className="form-group">
                            <Index.Select
                              fullWidth
                              id="fullWidth"
                              className="form-control"
                              value={values?.seller}
                              onChange={(e) => {
                                const value = e?.target?.value;
                                setFieldValue("seller", value);
                              }}
                              displayEmpty
                              renderValue={
                                values?.seller
                                  ? undefined
                                  : () => (
                                      <span className="placeholder-text">
                                        Select seller
                                      </span>
                                    )
                              }
                            >
                              {sellerList?.map((sellerItem) => (
                                <Index.MenuItem
                                  value={sellerItem?._id}
                                  key={sellerItem?._id}
                                >
                                  {sellerItem?.businessName}
                                </Index.MenuItem>
                              ))}
                            </Index.Select>
                            <Index.FormHelperText error>
                              {errors?.seller && touched?.seller
                                ? errors?.seller
                                : false}
                            </Index.FormHelperText>
                            {/* <Index.FormHelperText error>
                              {!values?.seller
                                ? "Please select a seller"
                                : null}
                            </Index.FormHelperText> */}
                          </Index.Box>
                        </Index.Box>
                      </Index.Grid>
                    </Index.Grid>

                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        {/* <Index.FormHelperText className="form-lable">
                          Maximum Purchase Quantity
                        </Index.FormHelperText> */}
                        {/* <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            className="form-control"
                            placeholder="Enter maximum purchase quantity"
                            value={values?.maximumPurchaseQty}
                            name="maximumPurchaseQty"
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^\d+$/;

                              if (value === "" || regex?.test(value)) {
                                setFieldValue("maximumPurchaseQty", value);
                              }
                            }}
                            onBlur={handleBlur}
                          />
                          <Index.FormHelperText error>
                            {errors?.maximumPurchaseQty &&
                            touched?.maximumPurchaseQty
                              ? errors?.maximumPurchaseQty
                              : false}
                          </Index.FormHelperText>
                        </Index.Box> */}
                      </Index.Box>
                    </Index.Grid>
                    <Index.Grid item lg={12} md={12} sm={12} xs={12}>
                      <Index.Box className="input-box add-product-input">
                        <Index.FormHelperText className="form-lable">
                          Description
                        </Index.FormHelperText>
                        <Index.Box className="form-group add-product-ck">
                          <Index.Box className="input-box modal-input-box add-blog-ck-hgt">
                            <Index.Box className="ck-custom-main">
                              <CKEditor
                                editor={ClassicEditor}
                                data={values?.description}
                                // name="description"
                                // contenteditable="true"
                                config={{
                                  licenseKey: "GPL",
                                  toolbar: [
                                    "heading",
                                    "|",
                                    "bold",
                                    "italic",
                                    "blockQuote",
                                    // "imageUpload",
                                    "link",
                                    "|",
                                    "undo",
                                    "redo",
                                  ],
                                  placeholder: "Enter product description...",
                                }}
                                onReady={(editor) => {
                                  // You can store the "editor" and use when it is needed.
                                }}
                                onChange={(event, editor) => {
                                  const data = editor.getData();

                                  setFieldValue("description", data);
                                }}
                                onFocus={(event, editor) => {}}
                              />
                            </Index.Box>
                          </Index.Box>
                          <Index.FormHelperText error>
                            {errors?.description && touched?.description
                              ? errors?.description
                              : false}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Grid>
                  </Index.Grid>
                </Index.Box>
              </Index.Box>
              {attributeList?.length > 0 && (
                <Index.Box className="common-card barge-common-box">
                  {/* <Index.Box className="grid-main add-more-row add-lable-row"> */}
                  <Index.Box className="grid-mains add-more-row add-lable-row">
                    <Index.Box
                      display="grid"
                      gridTemplateColumns="repeat(12, 1fr)"
                      gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                    >
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 2",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable">
                            Select Attribute
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 2",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable"></Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 3",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable">
                            Price
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 3",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable">
                            Discounted Price
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 2",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable">
                            Stock
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 2",
                          lg: "span 2",
                        }}
                        className="grid-column"
                      >
                        <Index.Box className="input-box add-more-product-input-box">
                          <Index.FormHelperText className="form-lable">
                            Upload Image/Video
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                  <Index.FieldArray
                    name="attributes"
                    render={(arrayHelpers) =>
                      values?.attributes?.map((item, index, arr) => (
                        <Index.Box
                          // className="grid-main add-more-row add-input-row"
                          className="grid-mains add-more-row add-input-row"
                          key={index}
                        >
                          <Index.Box
                            display="grid"
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                          >
                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              {attributeList?.map((attribute) => {
                                const selectedValues =
                                  values?.attributes?.reduce((acc, attr, i) => {
                                    if (
                                      i !== index &&
                                      attr?.[attribute?.name]
                                    ) {
                                      if (
                                        Array.isArray(attr?.[attribute?.name])
                                      ) {
                                        acc = [
                                          ...acc,
                                          ...attr[attribute?.name],
                                        ]; // If multiple values, add them all
                                      } else {
                                        acc.push(attr?.[attribute?.name]); // If single value, just add it
                                      }
                                    }
                                    return acc;
                                  }, []);
                                return (
                                  <Index.Box
                                    gridColumn={{
                                      xs: "span 12",
                                      sm: "span 6",
                                      md: "span 2",
                                      lg: "span 2",
                                    }}
                                    className="grid-column"
                                    key={attribute?._id}
                                  >
                                    <Index.Box className="input-box add-more-product-input-box">
                                      <Index.Box className="form-group">
                                        <Index.Box className="dropdown-box">
                                          <Index.FormControl className="form-control">
                                            <Index.Select
                                              className="dropdown-select"
                                              name={`attributes[${index}].[${attribute?.name}]`}
                                              value={
                                                attribute?.multiselect
                                                  ? item?.[attribute?.name] ||
                                                    []
                                                  : item?.[attribute?.name] ||
                                                    ""
                                              }
                                              onChange={(e) => {
                                                const value = e?.target?.value;
                                                setFieldValue(
                                                  `attributes[${index}].[${attribute?.name}]`,
                                                  value
                                                );
                                              }}
                                              onBlur={handleBlur}
                                              displayEmpty
                                              renderValue={(selected) => {
                                                if (attribute?.multiselect) {
                                                  return selected.length > 0 ? (
                                                    selected.join(", ")
                                                  ) : (
                                                    <span className="placeholder-text">
                                                      {`Select ${attribute?.name}`}
                                                    </span>
                                                  );
                                                } else {
                                                  return selected ? (
                                                    selected
                                                  ) : (
                                                    <span className="placeholder-text">
                                                      {`Select ${attribute?.name}`}
                                                    </span>
                                                  );
                                                }
                                              }}
                                              multiple={attribute?.multiselect}
                                            >
                                              {attribute?.variants?.map(
                                                (item) => (
                                                  <Index.MenuItem
                                                    key={`variant-${item?._id}`}
                                                    value={item?.name}
                                                    disabled={
                                                      attribute?.name?.toLowerCase() ===
                                                        "color" &&
                                                      selectedValues?.includes(
                                                        item.name
                                                      )
                                                    }
                                                  >
                                                    {item?.name}
                                                  </Index.MenuItem>
                                                )
                                              )}
                                            </Index.Select>
                                            <Index.FormHelperText
                                              error
                                              sx={{ fontSize: "0.8rem" }}
                                            >
                                              {errors?.attributes?.[index]?.[
                                                attribute?.name
                                              ] &&
                                                touched?.attributes?.[index]?.[
                                                  attribute?.name
                                                ] &&
                                                errors?.attributes[index]?.[
                                                  attribute?.name
                                                ]}
                                            </Index.FormHelperText>
                                          </Index.FormControl>
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                  </Index.Box>
                                );
                              })}

                              {/* <Index.Box className="input-box add-more-product-input-box">
                              <Index.Box className="form-group">
                                <Index.Box className="dropdown-box">
                                  <Index.FormControl className="form-control">
                                    <Index.Select
                                      className="dropdown-select"
                                      name={`attributes[${index}].color`}
                                      value={item?.color}
                                      onChange={(e) => {
                                        const value = e?.target?.value;
                                        setFieldValue(
                                          `attributes[${index}].color`,
                                          value
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      displayEmpty
                                      renderValue={
                                        item?.color
                                          ? undefined
                                          : () => (
                                              <span className="placeholder-text">
                                                Select color
                                              </span>
                                            )
                                      }
                                    >
                                      {colorList?.map((color) => (
                                        <Index.MenuItem
                                          key={`${color}-${index}`}
                                          value={color}
                                        >
                                          {color}
                                        </Index.MenuItem>
                                      ))}
                                    </Index.Select>
                                    <Index.FormHelperText
                                      error
                                      sx={{ fontSize: "0.8rem" }}
                                    >
                                      {errors?.attributes?.[index]?.color &&
                                        touched?.attributes?.[index]?.color &&
                                        errors?.attributes[index].color}
                                    </Index.FormHelperText>
                                  </Index.FormControl>
                                </Index.Box>
                              </Index.Box>
                            </Index.Box> */}
                            </Index.Box>

                            {/* <Index.Box
                            gridColumn={{
                              xs: "span 12",
                              sm: "span 6",
                              md: "span 2",
                              lg: "span 2",
                            }}
                            className="grid-column"
                          >
                            <Index.Box className="input-box add-more-product-input-box">
                              <Index.Box className="form-group">
                                <Index.Box className="dropdown-box">
                                  <Index.FormControl className="form-control">
                                    <Index.Select
                                      className="dropdown-select"
                                      name={`attributes[${index}].size`}
                                      value={item?.size}
                                      onChange={(e) => {
                                        const value = e?.target?.value;
                                        setFieldValue(
                                          `attributes[${index}].size`,
                                          value
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      displayEmpty
                                      renderValue={
                                        item?.size?.length > 0
                                          ? undefined
                                          : () => (
                                              <span className="placeholder-text">
                                                Select size
                                              </span>
                                            )
                                      }
                                      multiple
                                    >
                                      {sizeList?.map((size) => (
                                        <Index.MenuItem
                                          key={`${size}-${index}`}
                                          value={size}
                                        >
                                          {size}
                                        </Index.MenuItem>
                                      ))}
                                    </Index.Select>
                                    <Index.FormHelperText
                                      error
                                      sx={{ fontSize: "0.8rem" }}
                                    >
                                      {errors?.attributes?.[index]?.size &&
                                        touched?.attributes?.[index]?.size &&
                                        errors?.attributes[index].size}
                                    </Index.FormHelperText>
                                  </Index.FormControl>
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                          </Index.Box> */}

                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              <Index.Box className="input-box add-more-product-input-box">
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    className="form-control"
                                    placeholder="Enter Price"
                                    name={`attributes[${index}].price`}
                                    value={!!item?.price ? item?.price : null}
                                    // onChange={handleChange}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      const regex = /^(\d+(\.\d{0,2})?)?$/;
                                      if (
                                        regex.test(inputValue) &&
                                        inputValue !== "00" &&
                                        inputValue !== "."
                                      ) {
                                        handleChange(e);
                                      }
                                    }}
                                    onKeyPress={(e) => {
                                      const key = e.key;
                                      const currentValue = e.target.value;
                                      if (
                                        /[0-9]/.test(key) ||
                                        (key === "." &&
                                          !currentValue.includes("."))
                                      ) {
                                        return;
                                      } else {
                                        e.preventDefault();
                                      }
                                    }}
                                    onBlur={handleBlur}
                                  />
                                  <Index.FormHelperText
                                    error
                                    sx={{ fontSize: "0.8rem" }}
                                  >
                                    {errors?.attributes?.[index]?.price &&
                                      touched?.attributes?.[index]?.price &&
                                      errors?.attributes[index].price}
                                  </Index.FormHelperText>
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              <Index.Box className="input-box add-more-product-input-box">
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    className="form-control"
                                    placeholder="Enter Discounted Price"
                                    name={`attributes[${index}].discountedPrice`}
                                    value={
                                      !!item?.discountedPrice
                                        ? item?.discountedPrice
                                        : null
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                  <Index.FormHelperText
                                    error
                                    sx={{ fontSize: "0.8rem" }}
                                  >
                                    {errors?.attributes?.[index]
                                      ?.discountedPrice &&
                                      touched?.attributes?.[index]
                                        ?.discountedPrice &&
                                      errors?.attributes[index].discountedPrice}
                                  </Index.FormHelperText>
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              <Index.Box className="input-box add-more-product-input-box">
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    id="fullWidth"
                                    className="form-control"
                                    placeholder="Enter stock"
                                    name={`attributes[${index}].stock`}
                                    value={item?.stock}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                  <Index.FormHelperText
                                    error
                                    sx={{ fontSize: "0.8rem" }}
                                  >
                                    {errors?.attributes?.[index]?.stock &&
                                      touched?.attributes?.[index]?.stock &&
                                      errors?.attributes[index].stock}
                                  </Index.FormHelperText>
                                </Index.Box>
                              </Index.Box>
                            </Index.Box>
                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              <Index.Box className="add-product-img-flex">
                                <Index.Box className="file-upload-btn-main">
                                  <Index.Button
                                    variant="contained"
                                    component="label"
                                    className="file-upload-btn"
                                    onClick={() =>
                                      handleOpenUploadFileModal(index)
                                    }
                                  >
                                    <img
                                      src={PagesIndex.Svg.cloudUploadIcon}
                                      className="file-upload-icon"
                                      alt="upload img"
                                    />
                                  </Index.Button>
                                  <Index.FormHelperText
                                    error
                                    sx={{ fontSize: "0.8rem" }}
                                  >
                                    {(typeof errors?.attributes?.[index]
                                      ?.images === "string" &&
                                      touched?.attributes?.[index]?.images &&
                                      errors?.attributes[index].images) ||
                                      (errors?.attributes?.[index]?.images
                                        ?.length > 0 &&
                                        touched?.attributes?.[index]?.images &&
                                        "Invalid file format")}
                                  </Index.FormHelperText>
                                </Index.Box>
                                {!!item?.images?.length && (
                                  <Index.Tooltip
                                    title="View Product Images"
                                    arrow
                                    placement="bottom"
                                    className="admin-tooltip"
                                  >
                                    <Index.Button
                                      className="add-product-img-box"
                                      onClick={() =>
                                        handleOpenModal(item?.images, index)
                                      }
                                    >
                                      <img
                                        src={PagesIndex.Svg.viewIcon}
                                        alt="View"
                                        className="add-product-view-icon"
                                      />
                                    </Index.Button>
                                  </Index.Tooltip>
                                )}
                              </Index.Box>
                            </Index.Box>
                            {attributeId == index && (
                              <ProductFileModal
                                openModal={openModal}
                                setOpenModal={setOpenModal}
                                modelOpen={modelOpen}
                                setModelOpen={setModelOpen}
                                handleCloseModal={handleCloseModal}
                                openFileUpload={openFileUpload}
                                handleCloseUploadFileModal={
                                  handleCloseUploadFileModal
                                }
                                fileType={fileType}
                                setFileType={setFileType}
                                setFieldValue={setFieldValue}
                                attributeItem={values?.attributes?.[index]}
                                attrIndex={index}
                                errors={errors}
                                values={values}
                                setOpenFileUpload={setOpenFileUpload}
                              />
                            )}
                            <Index.Box
                              gridColumn={{
                                xs: "span 12",
                                sm: "span 6",
                                md: "span 2",
                                lg: "span 2",
                              }}
                              className="grid-column"
                            >
                              <Index.Box className="add-more-btn-main">
                                {index == values?.attributes?.length - 1 && (
                                  <Index.Button
                                    className="add-more-btn"
                                    variant="contained"
                                    onClick={() =>
                                      arrayHelpers.push({
                                        color: "",
                                        size: [],
                                        price: "",
                                        stock: "",
                                        images: [],
                                      })
                                    }
                                  >
                                    <img
                                      src={PagesIndex.Svg.addIcon}
                                      alt="add"
                                      className="add-minus-icon icon"
                                    />
                                  </Index.Button>
                                )}
                                {values?.attributes.length > 1 && (
                                  <Index.Button
                                    className="add-more-btn"
                                    variant="contained"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    <img
                                      src={PagesIndex.Svg.minusIcon}
                                      alt="add"
                                      className="add-minus-icon icon"
                                    />
                                  </Index.Button>
                                )}
                              </Index.Box>
                            </Index.Box>
                          </Index.Box>
                        </Index.Box>
                      ))
                    }
                  />
                </Index.Box>
              )}
              <Index.Box className="seller-btn-flex custom-seller-btn-flex">
                <Index.Box className="border-btn-main">
                  <button className="btn" onClick={handleDiscard}>
                    Discard
                  </button>
                </Index.Box>
                <Index.Box className="border-btn-main">
                  <button
                    className="btn"
                    type="submit"
                    disabled={loading || !attributeList?.length}
                  >
                    {param?.id ? "Update" : "Save"}
                  </button>
                </Index.Box>
              </Index.Box>
            </Form>
          )}
        </Formik>
      </Index.Box>
    </>
  );
}

const ProductFileModal = ({
  openModal,
  setOpenModal,
  handleCloseModal,
  setOpenFileUpload,
  openFileUpload,
  handleCloseUploadFileModal,
  fileType,
  setFileType,
  setFieldValue,
  attributeItem,
  attrIndex,
  errors,
  values,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const handleRemoveFiles = (
    name,
    index,
    imageName,
    images,
    setFieldValue,
    attributeId,
    values
  ) => {
    const files = [...images];
    const updatedFiles = files?.filter((_, i) => i !== index);

    if (!updatedFiles?.length) {
      setOpenModal(false);
    }
    if (updatedFiles?.length) {
      // setModelOpen(false);
    }

    setFieldValue(name, updatedFiles);

    if (typeof imageName === "string") {
      const findAttribute = values?.removedImages?.find(
        (attr) => attr?.attribute == attributeId
      );

      if (findAttribute) {
        const updatedRemoveItem = values?.removedImages?.map((attr) => {
          if (attr?.attribute == attributeId) {
            return { ...attr, images: [...attr?.images, imageName] };
          } else {
            return attr;
          }
        });
        setFieldValue("removedImages", updatedRemoveItem);
      } else {
        setFieldValue("removedImages", [
          ...values?.removedImages,
          { attribute: attributeId, images: [imageName] },
        ]);
      }
    }
  };

  return (
    <>
      <Index.Modal
        aria-labelledby="modal-modal-title"
        open={openModal}
        onClose={handleCloseModal}
        aria-describedby="modal-modal-description"
        className="seller-modal"
      >
        <Index.Box
          sx={PagesIndex.style}
          className="seller-modal-inner seller-add-product-modal-inner-main"
        >
          <Index.Box className="seller-modal-header">
            <Index.Typography className="seller-modal-title">
              View Product
            </Index.Typography>
            <Index.Button
              className="seller-modal-close-btn"
              onClick={handleCloseModal}
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
                  {attributeItem?.images?.map((image, index) => {
                    const isBlobInstance = image instanceof Blob;
                    const ext = isBlobInstance
                      ? image?.type?.split("/")?.[0]
                      : image?.split(".")?.at(-1);
                    const isImage =
                      ext && ["image", "png", "jpg", "jpeg"]?.includes(ext);
                    const isVideo =
                      ext && ["video", "mp4", "webm"]?.includes(ext);
                    const fileUrl = isBlobInstance
                      ? URL.createObjectURL(image)
                      : `${PagesIndex.ECOMMERCE_IMAGES_API_ENDPOINT}/${image}`;
                    return (
                      <Index.Box
                        gridColumn={{
                          xs: "span 12",
                          sm: "span 6",
                          md: "span 6",
                          lg: "span 6",
                        }}
                        // className="grid-column product-file-grid"
                        className=" product-file-grid"
                        key={index}
                      >
                        <Index.Button
                          className="seller-modal-close-btn remove-img1"
                          onClick={() => {
                            if (attributeItem?.images.length == 1) {
                              setOpenFileUpload(true);
                            }
                            handleRemoveFiles(
                              `attributes[${attrIndex}].images`,
                              index,
                              image,
                              attributeItem?.images,
                              setFieldValue,
                              attributeItem?._id,
                              values
                            );
                          }}
                        >
                          <img
                            src={PagesIndex.Svg.graycloseIcon}
                            className="seller-modal-close-icon"
                            alt="Close"
                          />
                        </Index.Button>
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
                        {Array.isArray(
                          errors?.attributes?.[attrIndex]?.images
                        ) && (
                          <Index.FormHelperText
                            error
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {errors?.attributes?.[attrIndex]?.images?.[index]}
                          </Index.FormHelperText>
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

      {/* Upload product files */}
      <Index.Modal
        aria-labelledby="modal-modal-title"
        open={openFileUpload}
        onClose={handleCloseUploadFileModal}
        aria-describedby="modal-modal-description"
        className="seller-modal"
      >
        <Index.Box
          sx={PagesIndex.style}
          className="seller-modal-inner seller-add-product-modal-inner-main"
        >
          <Index.Box className="seller-modal-header">
            <Index.Typography className="seller-modal-title">
              Upload Files
            </Index.Typography>
            <Index.Button
              className="seller-modal-close-btn"
              onClick={handleCloseUploadFileModal}
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
              <Index.Box sx={{ width: 1 }} className="">
                <Index.Box
                  display="flex"
                  // gridTemplateColumns="repeat(12, 1fr)"
                  gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                >
                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="input-box add-product-input">
                      <Index.Box className="form-group">
                        <Index.Box className="dropdown-box">
                          <Index.FormControl className="form-control">
                            <Index.Select
                              className="dropdown-select"
                              value={fileType}
                              name="category"
                              onChange={(e) => {
                                const value = e?.target?.value;
                                setFileType(value);
                              }}
                              displayEmpty
                              renderValue={
                                fileType
                                  ? undefined
                                  : () => (
                                      <span className="placeholder-text">
                                        Select file type
                                      </span>
                                    )
                              }
                            >
                              <Index.MenuItem
                                value="image"
                                className="drop-menuitem"
                              >
                                Image
                              </Index.MenuItem>
                              <Index.MenuItem
                                value="video"
                                className="drop-menuitem"
                              >
                                Video
                              </Index.MenuItem>
                            </Index.Select>
                          </Index.FormControl>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>

                  <Index.Box
                    gridColumn={{
                      xs: "span 12",
                      sm: "span 6",
                      md: "span 6",
                      lg: "span 6",
                    }}
                    className="grid-column"
                  >
                    <Index.Box className="add-product-img-flex">
                      <Index.Box className="file-upload-btn-main">
                        <Index.Button
                          variant="contained"
                          component="label"
                          className="file-upload-btn"
                        >
                          <img
                            src={PagesIndex.Svg.cloudUploadIcon}
                            className="file-upload-icon"
                            alt="upload img"
                          />
                          <input
                            hidden
                            accept={
                              fileType === "image"
                                ? "image/jpeg,image/png,image/jpg"
                                : "video/mp4,video/webm"
                            }
                            multiple={fileType === "image"}
                            type="file"
                            onChange={(e) => {
                              // handleCloseUploadFileModal();
                              const files = e.target.files;
                              if (files) {
                                let isValid = true;

                                if (fileType === "image") {
                                  const images = Array.from(files)
                                    .map((file) => file)
                                    ?.filter((file) => {
                                      const type = file?.type?.split("/")?.[0];
                                      return ["image", "video"]?.includes(type);
                                    });

                                  if (images.length > 0) {
                                    setFieldValue(
                                      `attributes[${attrIndex}].images`,
                                      [...attributeItem?.images, ...images]
                                    );
                                    setErrorMessage("");
                                  } else {
                                    isValid = false;
                                  }
                                } else {
                                  const video = files?.[0];
                                  const type = video?.type?.split("/")?.[0];

                                  if (type === "video") {
                                    setFieldValue(
                                      `attributes[${attrIndex}].images`,
                                      [...attributeItem?.images, video]
                                    );
                                    setErrorMessage("");
                                  } else {
                                    isValid = false;
                                  }
                                }

                                if (!isValid) {
                                  setErrorMessage(
                                    "Invalid file format. Please upload a valid image or video."
                                  );
                                }
                              }
                            }}
                          />
                        </Index.Button>
                        {errorMessage && (
                          <p
                            style={{
                              color: "red",
                              fontSize: "14px",
                              marginTop: "5px",
                            }}
                          >
                            {errorMessage}
                          </p>
                        )}
                      </Index.Box>
                    </Index.Box>
                  </Index.Box>
                </Index.Box>
                <Index.Box className="upload-file-custom">
                  <Index.Box
                    display="grid"
                    gridTemplateColumns="repeat(12, 1fr)"
                    gap={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                  >
                    {attributeItem?.images?.map((image, index) => {
                      const isBlobInstance = image instanceof Blob;
                      const ext = isBlobInstance
                        ? image?.type?.split("/")?.[0]
                        : image?.split(".")?.at(-1);
                      const isImage =
                        ext && ["image", "png", "jpg", "jpeg"]?.includes(ext);
                      const isVideo =
                        ext && ["video", "mp4", "webm"]?.includes(ext);
                      const fileUrl = isBlobInstance
                        ? URL.createObjectURL(image)
                        : `${PagesIndex.ECOMMERCE_IMAGES_API_ENDPOINT}/${image}`;
                      return (
                        <Index.Box
                          gridColumn={{
                            xs: "span 12",
                            sm: "span 6",
                            md: "span 6",
                            lg: "span 6",
                          }}
                          className="grid-column product-file-grid "
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                          key={index}
                        >
                          <Index.Button
                            className="seller-modal-close-btn remove-img"
                            onClick={() => {
                              if (attributeItem?.images.length == 1) {
                                setOpenFileUpload(true);
                              }
                              handleRemoveFiles(
                                `attributes[${attrIndex}].images`,
                                index,
                                image,
                                attributeItem?.images,
                                setFieldValue,
                                attributeItem?._id,
                                values
                              );
                            }}
                          >
                            <img
                              src={PagesIndex.Svg.graycloseIcon}
                              className="seller-modal-close-icon"
                              alt="Close"
                            />
                          </Index.Button>
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
                          {Array.isArray(
                            errors?.attributes?.[attrIndex]?.images
                          ) && (
                            <Index.FormHelperText
                              error
                              sx={{ fontSize: "0.8rem" }}
                            >
                              {errors?.attributes?.[attrIndex]?.images?.[index]}
                            </Index.FormHelperText>
                          )}
                        </Index.Box>
                      );
                    })}
                  </Index.Box>
                  {attributeItem?.images?.length > 0 && (
                    <>
                      <Index.Box className="seller-btn-flex custom-seller-btn-flex">
                        <Index.Box className="border-btn-main">
                          <button
                            className="btn"
                            onClick={() => {
                              if (attributeItem?.images?.length === 1) {
                                setOpenFileUpload(true);
                              }
                              setFieldValue(
                                `attributes[${attrIndex}].images`,
                                []
                              );
                            }}
                          >
                            Cancel
                          </button>
                        </Index.Box>
                        <Index.Box className="border-btn-main">
                          <button
                            className="btn"
                            type="submit"
                            onClick={() => {
                              if (!errorMessage) {
                                setOpenFileUpload(false);
                              }
                            }}
                          >
                            Save
                          </button>
                        </Index.Box>
                      </Index.Box>
                    </>
                  )}
                </Index.Box>
              </Index.Box>
            </Index.Box>
          </Index.Box>
        </Index.Box>
      </Index.Modal>
    </>
  );
};
