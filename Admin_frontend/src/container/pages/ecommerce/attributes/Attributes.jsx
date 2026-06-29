import React, { useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
import { adminLogout } from "../../../../redux-toolkit/slice/admin-slice/AdminSlice";
import { useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import {
  Search,
  StyledInputBase,
  style,
} from "../../../../common/Search/Search";
import { FieldArray } from "formik";

const Attribute = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const formik = useRef();
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [filteredData, setFilteredData] = useState([]);
  const [attributeList, setAttributeList] = useState([]);
  console.log("attributeList", attributeList);

  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // State for searching and set data
  const [searchValue, setSearchValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  // for change status
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState({});
  const [buttonLoading, setButtonLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [isColorChecked, setIsColorChecked] = useState(false);
  const [takeImportFile, setTakeImportFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  // const [eerrors, seteErrors] = useState("");
  const [fileError, setFileError] = useState("");
  const [skippedRows, setSkippedRows] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);

  let initialValues = {
    category: "",
    name: "",
    multiselect: false,
    // variants: [""],
    isColor: false,
    variants: [
      {
        colorCode: "",
        name: "",
      },
    ],
  };
  // handle open close
  const handleOpen = (mode) => {
    setAddOpen(true);
    setAddOrEdit(mode);
  };

  const handleClose = () => {
    setId("");
    setAddOpen(false);
    formik.current?.resetForm();
  };

  // handle delete
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  const handleOpenImportFile = () => setTakeImportFile(true);
  const handleCloseImportFile = () => {
    setFileError("");
    setSelectedFile("");
    setTakeImportFile(false);
    setSkippedRows("");
  };

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleStatus = (event, id) => {
    const data = {
      id: id,
      status: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ACTIVE_DEACTIVE_ATTRIBUTE,
      data
    )
      .then((res) => {
        if (res?.data?.status === 200 || 201) {
          PagesIndex.toast.success(res?.data?.message);
          getAttributeList();
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setLoadingState((prevState) => ({ ...prevState, [id]: false }));
      });
  };
  // Search on table
  const requestSearch = (searched) => {
    let filteredData = attributeList?.filter(
      (data) =>
        data?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        data?.category?.name?.toLowerCase().includes(searched?.toLowerCase()) ||
        (data?.isActive ? "Active" : "DeActive")
          ?.toLowerCase()
          .includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };

  const getAttributeList = () => {
    PagesIndex.EcommerceService.get(PagesIndex.EcommerceApi.GET_ALL_ATTRIBUTES)
      .then((res) => {
        setAttributeList(res?.data?.data);
        setFilteredData(res?.data?.data);
        setLoading(false);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter(
            (title) =>
              title?.name?.toLowerCase().includes(searchValue?.toLowerCase()) ||
              (data?.isActive ? "Active" : "DeActive")
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
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  const handleAttributeSubmit = (values) => {
    setButtonLoading(true);
    const urlencoded = new URLSearchParams();
    if (id) {
      urlencoded.append("id", id);
    }
    urlencoded.append("name", values?.name?.trim());
    urlencoded.append("category", values?.category);
    urlencoded.append("multiselect", values?.multiselect);
    urlencoded.append("isColor", values?.isColor);

    // values?.variants?.length > 1 &&
    //   values?.variants.forEach((v, i) =>
    //     urlencoded.append(`variants[${i}]`, v?.trim())
    //   );
    if (values?.variants?.length > 0) {
      values?.variants.forEach((variant, index) => {
        if (variant?.name) {
          urlencoded.append(`variants[${index}].name`, variant.name.trim());
        }
        if (variant?.colorCode) {
          urlencoded.append(
            `variants[${index}].colorCode`,
            variant.colorCode.trim()
          );
        }
      });
    }
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.ADD_EDIT_ATTRIBUTE,
      urlencoded
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getAttributeList();
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
      })
      .finally(() => setButtonLoading(false));
  };

  const handleAttributeRemove = () => {
    setIsLoading(true);
    PagesIndex.EcommerceService.post(PagesIndex.EcommerceApi.DELETE_ATTRIBUTE, {
      id: id,
    })
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleDeleteClose();
        setRemoveData(true);
        getAttributeList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue);
    requestSearch(newValue);
  };

  const getAllCategoryList = async () => {
    try {
      let response = await PagesIndex.EcommerceService.get(
        PagesIndex.EcommerceApi.GET_ALL_ACTIVE_CATEGORIES
      );
      setCategoryList(response?.data?.data);
    } catch (error) {
      console.log("getting error while fetching category list");
      setCategoryList([]);
    }
  };

  // const generateExcel = async () => {
  //   const headers = ["S. No.", "Category", "Name", "Variants", "Date"];

  //   const rows = attributeList.map((item, index) => ({
  //     "S. No.": index + 1,
  //     Category: item?.category?.name || "-",
  //     Name: item?.name || "-",
  //     Variants:
  //       Array.isArray(item?.variants) && item.variants.length > 0
  //         ? item.variants
  //             .map((v) => v?.value || v?.name || JSON.stringify(v))
  //             .join(", ")
  //         : "-",
  //     Date: item?.createdAt
  //       ? PagesIndex.moment(item.createdAt).format("DD/MM/YYYY hh:mm A")
  //       : "-",
  //   }));

  //   const workbook = PagesIndex.XLSX.utils.book_new();
  //   const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows, {
  //     header: headers,
  //   });

  //   PagesIndex.XLSX.utils.book_append_sheet(
  //     workbook,
  //     worksheet,
  //     "Contact us list"
  //   );

  //   PagesIndex.XLSX.writeFile(
  //     workbook,
  //     `Attribute_list_${PagesIndex.moment().format(
  //       "DD-MM-YYYY_hh-mm-ss_A"
  //     )}.xlsx`,
  //     { compression: true }
  //   );
  // };

  const generateExcel = async () => {
    const headers = [
      "S. No.",
      "Category",
      "Name",
      "Variants",
      "Color Codes",
      "Is Color",
      "Date",
    ];

    const rows = attributeList.map((item, index) => ({
      "S. No.": index + 1,
      Category: item?.category?.name || "-",
      Name: item?.name || "-",
      Variants:
        Array.isArray(item?.variants) && item.variants.length > 0
          ? item.variants
              .map((v) => v?.value || v?.name || JSON.stringify(v))
              .join(", ")
          : "-",
      "Color Codes":
        item?.isColor && Array.isArray(item?.variants)
          ? item.variants.map((v) => v?.colorCode || "-").join(", ")
          : "-",
      "Is Color": item?.isColor ? "true" : "false",
      Date: item?.createdAt
        ? PagesIndex.moment(item.createdAt).format("DD/MM/YYYY hh:mm A")
        : "-",
    }));

    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows, {
      header: headers,
    });

    PagesIndex.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attribute List"
    );

    PagesIndex.XLSX.writeFile(
      workbook,
      `Attribute_list_${PagesIndex.moment().format(
        "DD-MM-YYYY_hh-mm-ss_A"
      )}.xlsx`,
      { compression: true }
    );
  };

  // const handleFileChange = () => {
  //   console.log("selectedFile", selectedFile);
  //   setIsLoading(true);
  //   PagesIndex.EcommerceService.post(
  //     PagesIndex.EcommerceApi.BULK_IMPORT_ATTRIBUTE,
  //     {
  //       id: id,
  //     }
  //   )
  //     .then((res) => {
  //       PagesIndex.toast.success(res?.data?.message);
  //       handleDeleteClose();
  //       setRemoveData(true);
  //       getAttributeList();
  //       setIsLoading(false);
  //     })
  //     .catch((err) => {
  //       PagesIndex.toast.error(err?.response?.data?.message);
  //       setIsLoading(false);
  //     });
  // };

  const handleFileChange = () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      // PagesIndex.toast.error("Please select a file first.");
      return;
    }
    if (fileError) {
      return;
    }
    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    PagesIndex.EcommerceService.post(
      PagesIndex.EcommerceApi.BULK_IMPORT_ATTRIBUTE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        setFileError("");
        setSelectedFile("");
        setTakeImportFile(false);
        getAttributeList();
      })
      .catch((err) => {
        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status === 400 && err?.response?.data?.skippedRows) {
          PagesIndex.toast.error(
            message || "Import failed due to invalid rows."
          );
          setSkippedRows(err.response.data.skippedRows); // Store the invalid rows
        } else {
          PagesIndex.toast.error(message || "Something went wrong.");
        }

        setFileLoading(false);

        // PagesIndex.toast.error(err?.response?.data?.message);
        // setIsLoading(false);
      })
      .finally(() => {
        setFileLoading(false);
      });
  };

  useEffect(() => {
    getAttributeList();
  }, [removeData]);

  useEffect(() => {
    if (addOpen) {
      getAllCategoryList();
    }
  }, [addOpen]);

  const handleDownloadExcel = () => {
    const data = [
      {
        Category: "Tester king",
        Name: "Color",
        Variants: "Red, Blue,Green",
        IsColor: "TRUE",
        colorCode: "#FF0000,#0000FF,#00FF00",
        multiselect: "FALSE",
      },
      {
        Category: "Tester king",
        Name: "size",
        Variants: "s,x,l,m,xl",
        IsColor: "FALSE",
        colorCode: "",
        multiselect: "TRUE",
      },
      {
        Category: "Fashion Wear",
        Name: "Material",
        Variants: "Cotton,Polyester,Silk",
        IsColor: "FALSE",
        colorCode: "",
        multiselect: "TRUE",
      },
      {
        Category: "Fashion Wear",
        Name: "Pattern",
        Variants: "Striped,Plain,Checked",
        IsColor: "FALSE",
        colorCode: "",
        multiselect: "FALSE",
      },
      {
        Category: "Accessories",
        Name: "Color",
        Variants: "Black,White,Gray",
        IsColor: "TRUE",
        colorCode: "#000000,#FFFFFF,#808080",
        multiselect: "FALSE",
      },
      {
        Category: "Accessories",
        Name: "Length",
        Variants: "Short,Medium,Long",
        IsColor: "FALSE",
        colorCode: "",
        multiselect: "TRUE",
      },
      {
        Category: "Footwear",
        Name: "Size",
        Variants: "s,x,l,m,xl",
        IsColor: "FALSE",
        colorCode: "",
        multiselect: "FALSE",
      },
      {
        Category: "Footwear",
        Name: "Color",
        Variants: "Brown,Beige,Black",
        IsColor: "TRUE",
        colorCode: "#A52A2A,#F5F5DC,#000000",
        multiselect: "FALSE",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "SimpleFile.xlsx");
  };

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("ecommerce") ||
    true
  ) {
    return (
      <PagesIndex.Formik
        enableReinitialize
        onSubmit={handleAttributeSubmit}
        initialValues={initialValues}
        validationSchema={PagesIndex.attributeValidationSchema(isColorChecked)}
        innerRef={formik}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          setFieldValue,
          handleBlur,
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
                        Attribute Management
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
                          onClick={() => {
                            handleOpen("Add");
                            setIsColorChecked(false);
                          }}
                        >
                          Add Attribute
                        </Index.Button>
                      </Index.Box>
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={handleDownloadExcel}
                        >
                          Sample Excel
                        </Index.Button>
                      </Index.Box>
                      {/* <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => {
                            generateExcel();
                          }}
                        >
                          Import excel
                        </Index.Button>
                      </Index.Box> */}

                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={generateExcel} // <-- Open modal
                        >
                          Export Excel
                        </Index.Button>
                      </Index.Box>
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={handleOpenImportFile} // <-- Open modal
                        >
                          Import Excel
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
                          <Index.TableCell width="10%">
                            Attribute Name
                          </Index.TableCell>
                          <Index.TableCell width="10%">
                            Category Name
                          </Index.TableCell>
                          <Index.TableCell width="10%">
                            Variants
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
                                    {item?.name ? item?.name : "-"}
                                  </Index.TableCell>

                                  <Index.TableCell>
                                    {item?.category?.name
                                      ? item?.category?.name
                                      : "-"}
                                  </Index.TableCell>

                                  {/* <Index.TableCell>
                                    {item?.variants
                                      ? item?.variants?.join(", ")
                                      : "-"}
                                  </Index.TableCell> */}
                                  <Index.TableCell>
                                    {item?.variants
                                      ? item?.variants
                                          ?.map((variant) => variant?.name)
                                          .join(", ")
                                      : "-"}
                                  </Index.TableCell>
                                  <Index.TableCell align="center">
                                    <CustomToggleButton
                                      defaultChecked={item?.isActive}
                                      onChange={(e) =>
                                        handleStatus(e, item?._id)
                                      }
                                      disabled={
                                        loadingState[item?._id] || false
                                      }
                                    />
                                  </Index.TableCell>

                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details">
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={(e) => {
                                            for (let key in item) {
                                              setFieldValue(key, item[key]);
                                              if (key === "category") {
                                                setFieldValue(
                                                  "category",
                                                  item?.category?._id
                                                );
                                              }

                                              if (key === "variants") {
                                                setIsColorChecked(
                                                  item?.isColor
                                                );
                                                setFieldValue(
                                                  key,
                                                  item[key].map((val) => {
                                                    if (val == null) {
                                                      return "";
                                                    }
                                                    return val || "";
                                                  })
                                                );
                                              }
                                            }
                                            setId(item?._id);
                                            handleOpen("Edit");
                                          }}
                                        >
                                          <Index.EditIcon />
                                        </Index.IconButton>
                                      </Index.Box>
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
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
                                colSpan={15}
                                align="center"
                              >
                                No Attribute Available
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

            {/* add and edit model */}
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
                    {addOrEdit} Attribute
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
                        Category
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.Select
                          fullWidth
                          id="fullWidth"
                          className="form-control"
                          value={values?.category}
                          onBlur={handleBlur}
                          name="category"
                          onChange={handleChange}
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
                          error={
                            errors?.category && touched?.category ? true : false
                          }
                          helperText={
                            errors?.category && touched?.category
                              ? errors?.category
                              : null
                          }
                        >
                          {categoryList?.map((category) => (
                            <Index.MenuItem value={category?._id}>
                              {category?.name}
                            </Index.MenuItem>
                          ))}
                        </Index.Select>
                        <Index.FormHelperText error>
                          {errors?.category && touched?.category
                            ? errors?.category
                            : false}
                        </Index.FormHelperText>
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="input-box modal-input-box">
                      <Index.Box sx={{ display: "flex", columnGap: 2 }}>
                        <Index.FormHelperText className="form-lable">
                          Attribute Name
                        </Index.FormHelperText>
                        {/* <Index.Box sx={{ display: "flex", columnGap: 1 }}>
                          <Index.Checkbox
                            checked={values?.multiselect}
                            onChange={(e) => {
                              setFieldValue("multiselect", e?.target?.checked);
                            }}
                          />
                          <p>Multi select</p>
                        </Index.Box> */}
                        {!values?.isColor && (
                          <Index.Box sx={{ display: "flex", columnGap: 1 }}>
                            <Index.Checkbox
                              checked={values?.multiselect}
                              onChange={(e) => {
                                setFieldValue(
                                  "multiselect",
                                  e?.target?.checked
                                );
                              }}
                            />
                            <p>Multi select</p>
                          </Index.Box>
                        )}

                        {/* <Index.Box sx={{ display: "flex", columnGap: 1 }}>
                          <Index.Checkbox
                            checked={values?.isColor}
                            onChange={(e) => {
                              const isColorChecked = e?.target?.checked;

                              setFieldValue("isColor", isColorChecked);
                              setIsColorChecked(isColorChecked);
                              if (!isColorChecked) {
                                setFieldValue("variants", [
                                  {
                                    colorCode: "",
                                    name: "",
                                  },
                                ]);
                              }
                            }}
                          />
                          <p>Is Color</p>
                        </Index.Box> */}
                        {!values?.multiselect && (
                          <Index.Box sx={{ display: "flex", columnGap: 1 }}>
                            <Index.Checkbox
                              checked={values?.isColor}
                              onChange={(e) => {
                                const isColorChecked = e?.target?.checked;

                                setFieldValue("isColor", isColorChecked);
                                setIsColorChecked(isColorChecked);
                                if (!isColorChecked) {
                                  setFieldValue("variants", [
                                    {
                                      colorCode: "",
                                      name: "",
                                    },
                                  ]);
                                }
                              }}
                            />
                            <p>Is Color</p>
                          </Index.Box>
                        )}
                      </Index.Box>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          name="name"
                          className="form-control"
                          placeholder="Enter Attribute name"
                          value={values?.name}
                          onChange={handleChange}
                          error={errors.name && touched.name ? true : false}
                          helperText={
                            errors.name && touched.name ? errors.name : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>

                    {/* <Index.Box className="input-box modal-input-box">
                      <FieldArray
                        name="variants"
                        render={(arrayHelpers) => (
                          <>
                            {values?.variants?.map((color, index) => (
                              <Index.Box
                                key={index}
                                className="attribute-variant"
                              >
                                <Index.Box className="form-group">
                                  <Index.TextField
                                    fullWidth
                                    name={`variants[${index}]`}
                                    value={values.variants[index]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder={`Enter ${values?.name} Name`}
                                    className="form-control"
                                  />
                                  <Index.FormHelperText error>
                                    {errors.variants?.[index] &&
                                    touched.variants?.[index]
                                      ? errors.variants[index]
                                      : null}
                                  </Index.FormHelperText>
                                </Index.Box>

                                <Index.Button
                                  className="color-add-btn"
                                  onClick={() => {
                                    if (index === 0) {
                                      arrayHelpers.push("");
                                    } else {
                                      arrayHelpers.remove(index);
                                    }
                                  }}
                                >
                                  <img
                                    className="add-minus-icon icon"
                                    src={
                                      index === 0
                                        ? PagesIndex.Svg.plus
                                        : PagesIndex.Svg.minus
                                    }
                                  ></img>
                                </Index.Button>

                                <Index.Grid container spacing={2}>
                                  <Index.Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={5}
                                    lg={5}
                                  >
                                    <Index.Box className="form-group">
                                      <Index.FormHelperText className="form-lable">
                                        Variant
                                      </Index.FormHelperText>
                                      <Index.TextField
                                        fullWidth
                                        name={`variants[${index}]`}
                                        value={values.variants[index]}
                                        type="color"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder={`Enter ${values?.name} Name`}
                                        className="form-control"
                                      />
                                      <Index.FormHelperText error>
                                        {errors.variants?.[index] &&
                                        touched.variants?.[index]
                                          ? errors.variants[index]
                                          : null}
                                      </Index.FormHelperText>
                                    </Index.Box>
                                  </Index.Grid>
                                  <Index.Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={5}
                                    lg={5}
                                  >
                                    <Index.Box className="form-group">
                                      <Index.FormHelperText claspsName="form-lable">
                                        Color
                                      </Index.FormHelperText>
                                      <Index.TextField
                                        fullWidth
                                        name={`variants[${index}]`}
                                        value={values.variants[index]}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder={`Enter ${values?.name} Name`}
                                        className="form-control"
                                      />
                                      <Index.FormHelperText error>
                                        {errors.variants?.[index] &&
                                        touched.variants?.[index]
                                          ? errors.variants[index]
                                          : null}
                                      </Index.FormHelperText>
                                    </Index.Box>
                                  </Index.Grid>
                                  <Index.Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={2}
                                    lg={2}
                                  >
                                    <Index.Box className="attribute-btn-box">
                                      <Index.Button
                                        className="color-add-btn"
                                        onClick={() => {
                                          if (index === 0) {
                                            arrayHelpers.push("");
                                          } else {
                                            arrayHelpers.remove(index);
                                          }
                                        }}
                                      >
                                        <img
                                          className="add-minus-icon icon"
                                          src={
                                            index === 0
                                              ? PagesIndex.Svg.plus
                                              : PagesIndex.Svg.minus
                                          }
                                        ></img>
                                      </Index.Button>
                                    </Index.Box>
                                  </Index.Grid>
                                </Index.Grid>
                              </Index.Box>
                            ))}
                          </>
                        )}
                      />
                    </Index.Box> */}

                    <Index.Box className="input-box modal-input-box">
                      <FieldArray
                        name="variants"
                        render={(arrayHelpers) => (
                          <>
                            {values?.variants?.map((variant, index) => (
                              <Index.Box
                                key={index}
                                className="attribute-variant"
                              >
                                <Index.Grid container spacing={2}>
                                  {/* Color Field */}
                                  {values?.isColor && (
                                    <Index.Grid
                                      item
                                      xs={12}
                                      sm={12}
                                      md={5}
                                      lg={5}
                                    >
                                      <Index.Box className="form-group">
                                        <Index.FormHelperText className="form-label">
                                          Variant Color
                                        </Index.FormHelperText>
                                        <Index.TextField
                                          fullWidth
                                          name={`variants[${index}].colorCode`} // Updated name to handle color code
                                          value={variant.colorCode}
                                          type="color"
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          placeholder={`Choose color for ${values?.name}`}
                                          className="form-control"
                                        />
                                        <Index.FormHelperText error>
                                          {errors.variants?.[index]
                                            ?.colorCode &&
                                          touched.variants?.[index]?.colorCode
                                            ? errors.variants[index].colorCode
                                            : null}
                                        </Index.FormHelperText>
                                      </Index.Box>
                                    </Index.Grid>
                                  )}

                                  {/* Name Field */}
                                  <Index.Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={7}
                                    lg={7}
                                  >
                                    <Index.Box className="form-group">
                                      <Index.FormHelperText className="form-label">
                                        Variant Name
                                      </Index.FormHelperText>
                                      <Index.Box className="flex-add-input">
                                        <Index.TextField
                                          fullWidth
                                          name={`variants[${index}].name`} // Updated name to handle the name input
                                          value={variant.name}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          placeholder={`Enter name for ${values?.name}`}
                                          className="form-control"
                                        />
                                        <Index.Box className="attribute-btn-box attribute-plus-minus-box attribute-flex-icon">
                                          {/* Plus Button (Only for last index) */}
                                          {index ===
                                            values?.variants?.length - 1 && (
                                            <Index.Button
                                              className="color-add-btn"
                                              onClick={() => {
                                                arrayHelpers.push({
                                                  colorCode: "",
                                                  name: "",
                                                });
                                              }}
                                            >
                                              <img
                                                className="add-minus-icon icon minus-icon"
                                                src={PagesIndex.Svg.plus}
                                              />
                                            </Index.Button>
                                          )}

                                          {values?.variants?.length > 1 && (
                                            <Index.Button
                                              className="color-add-btn"
                                              onClick={() => {
                                                arrayHelpers.remove(index);
                                              }}
                                            >
                                              <img
                                                className="add-minus-icon icon minus-icon"
                                                src={PagesIndex.Svg.minus}
                                              />
                                            </Index.Button>
                                          )}
                                        </Index.Box>
                                      </Index.Box>
                                    </Index.Box>
                                    <Index.FormHelperText error>
                                      {errors.variants?.[index]?.name &&
                                      touched.variants?.[index]?.name
                                        ? errors.variants[index].name
                                        : null}
                                    </Index.FormHelperText>
                                  </Index.Grid>

                                  {/* Add/Remove Button */}
                                  {/* <Index.Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={2}
                                    lg={2}
                                  >
                                    <Index.Box className="attribute-btn-box">
                                      <Index.Button
                                        className="color-add-btn"
                                        onClick={() => {
                                          if (index === 0) {
                                            // Add a new variant if it's the first one
                                            arrayHelpers.push({
                                              colorCode: "",
                                              name: "",
                                            });
                                          } else {
                                            // Remove the current variant
                                            arrayHelpers.remove(index);
                                          }
                                        }}
                                      >
                                        <img
                                          className="add-minus-icon icon"
                                          src={
                                            index === 0
                                              ? PagesIndex.Svg.plus
                                              : PagesIndex.Svg.minus
                                          }
                                        />
                                      </Index.Button>
                                    </Index.Box>
                                  </Index.Grid> */}
                                </Index.Grid>
                              </Index.Box>
                            ))}
                          </>
                        )}
                      />
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

                          <Index.LoadingButton
                            type="submit"
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            loading={buttonLoading}
                            loadingPosition="center"
                            startIcon={
                              !buttonLoading && (
                                <img
                                  src={PagesIndex.Svg.save}
                                  className="user-save-icon"
                                  alt="save"
                                />
                              )
                            }
                          >
                            {!buttonLoading && addOrEdit === "Add"
                              ? "Save"
                              : "Update"}
                          </Index.LoadingButton>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>

            {/* latest code */}
            <Index.Modal
              open={takeImportFile}
              onClose={handleCloseImportFile}
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
                    Import File
                  </Index.Typography>
                </Index.Box>

                <Index.Box className="modal-body">
                  <Index.Stack
                    component="form"
                    spacing={2}
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    {/* File input for Excel files only */}
                    <Index.Box className="form-group">
                      <Index.FormHelperText className="form-label">
                        Upload Excel File
                      </Index.FormHelperText>
                      <Index.TextField
                        type="file"
                        inputProps={{ accept: ".xls,.xlsx" }}
                        name="excelFile"
                        // value={selectedFile}
                        onChange={(e) => {
                          const file = e.currentTarget.files[0];
                          const allowedTypes = [
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          ];

                          if (file) {
                            if (!allowedTypes.includes(file.type)) {
                              setFileError(
                                "Only .xls or .xlsx files are allowed"
                              );
                              setSelectedFile(file);
                              // setSelectedFile(null);
                            } else {
                              setFileError("");
                              setSelectedFile(file);
                            }
                          }
                        }}
                        className="form-control"
                      />

                      {/* <Index.FormHelperText>
                        {fileError ? fileError : null}
                      </Index.FormHelperText> */}
                      <Index.FormHelperText
                        style={{
                          color: "#d32f2f",
                          fontSize: "0.75rem",
                          marginTop: "3px",
                        }}
                      >
                        {fileError ? fileError : null}
                      </Index.FormHelperText>
                    </Index.Box>

                    <Index.Box className="modal-user-btn-flex">
                      <Index.Box className="discard-btn-main btn-main-primary">
                        <Index.Box className="common-button blue-button res-blue-button">
                          <Index.Button
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            onClick={handleCloseImportFile}
                          >
                            Discard
                          </Index.Button>

                          <Index.LoadingButton
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                            // loading={fileLoading}
                            disabled={fileLoading}
                            loadingPosition="center"
                            onClick={handleFileChange}
                            startIcon={
                              <img
                                src={PagesIndex.Svg.save}
                                className="user-save-icon"
                                alt="save"
                              />
                            }
                          >
                            Save
                          </Index.LoadingButton>
                        </Index.Box>
                      </Index.Box>
                    </Index.Box>

                    {/* {skippedRows.length > 0 && (
                      <Index.Box className="mt-4">
                        <h6 style={{ color: "#d32f2f", fontWeight: 600 }}>
                          Skipped Rows (Invalid Categories):
                        </h6>
                        <Index.Box
                          className="table-responsive mt-2"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          <table className="table table-bordered table-striped table-sm">
                            <thead className="thead-dark">
                              <tr
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  fontWeight: 600,
                                }}
                              >
                                <th style={{ minWidth: 50 }}>#</th>
                                <th style={{ minWidth: 150 }}>Category</th>
                                <th style={{ minWidth: 150 }}>Name Variants</th>
                                <th style={{ minWidth: 250, color: "#d32f2f" }}>
                                  Reason
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {skippedRows.map((row, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{row.Category || "-"}</td>
                                  <td>{row.Name || row.Variants || "-"}</td>
                                  <td style={{ color: "#b71c1c" }}>
                                    {row.reason || "Invalid Category"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Index.Box>
                      </Index.Box>
                    )} */}

                    {skippedRows.length > 0 && (
                      <Index.Box sx={{ mt: 0 }}>
                        <Index.Typography
                          sx={{ color: "#d32f2f", fontWeight: 100 }}
                        >
                          Skipped Rows (Invalid Categories):
                        </Index.Typography>

                        <Index.TableContainer
                          component={Index.Paper}
                          sx={{ mt: 2, maxHeight: 300, overflowY: "auto" }}
                        >
                          <Index.Table size="small" stickyHeader>
                            <Index.TableHead>
                              <Index.TableRow
                                sx={{ backgroundColor: "#f8f9fa" }}
                              >
                                <Index.TableCell
                                  sx={{ minWidth: 50, fontWeight: 600 }}
                                >
                                  #
                                </Index.TableCell>
                                <Index.TableCell
                                  sx={{ minWidth: 150, fontWeight: 600 }}
                                >
                                  Category
                                </Index.TableCell>
                                <Index.TableCell
                                  sx={{ minWidth: 150, fontWeight: 600 }}
                                >
                                  Name / Variants
                                </Index.TableCell>
                                <Index.TableCell
                                  sx={{
                                    minWidth: 250,
                                    fontWeight: 600,
                                    color: "#d32f2f", // Hardcoded red
                                  }}
                                >
                                  Reason
                                </Index.TableCell>
                              </Index.TableRow>
                            </Index.TableHead>
                            <Index.TableBody>
                              {skippedRows.map((row, index) => (
                                <Index.TableRow key={index}>
                                  <Index.TableCell>{index + 1}</Index.TableCell>
                                  <Index.TableCell>
                                    {row.Category || "-"}
                                  </Index.TableCell>
                                  <Index.TableCell>
                                    {row.Name || row.Variants || "-"}
                                  </Index.TableCell>
                                  <Index.TableCell sx={{ color: "#b71c1c" }}>
                                    {row.reason || "Invalid Category"}
                                  </Index.TableCell>
                                </Index.TableRow>
                              ))}
                            </Index.TableBody>
                          </Index.Table>
                        </Index.TableContainer>
                      </Index.Box>
                    )}
                  </Index.Stack>
                </Index.Box>
              </Index.Box>
            </Index.Modal>

            {/* delete modal */}
            <PagesIndex.DeleteModal
              deleteOpen={deleteOpen}
              handleDeleteClose={handleDeleteClose}
              handleDeleteRecord={!isLoading && handleAttributeRemove}
            />
          </>
        )}
      </PagesIndex.Formik>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default Attribute;
