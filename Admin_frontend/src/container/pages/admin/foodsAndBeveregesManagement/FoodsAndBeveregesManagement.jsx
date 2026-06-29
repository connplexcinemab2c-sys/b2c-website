import React, { memo, useEffect, useRef, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./FoodsAndBeveregesManagement.css";
import CustomToggleButton from "../../../../common/button/CustomToggleButton";
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

const FoodsAndBeveregesManagement = () => {
  const dispatch = useDispatch();
  const formRef = useRef();

  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );

  const [cinemaList, setCinemaList] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  const getCinemaList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_CINEMA + "?" + new Date().getTime()
    )
      .then((res) => {
        setCinemaList(res?.data?.data);
        setSelectedCinema(res?.data?.data[0]?._id);
      })
      .catch((err) => {
        console.log(err);
        // if (err?.response?.data?.message !== "jwt expired") {
        //   PagesIndex.toast.error(err?.response?.data?.message);
        // }
      });
  };

  useEffect(() => {
    getCinemaList();
  }, []);

  const [filteredData, setFilteredData] = useState([]);
  const [foodsAndBeveregesList, setFoodsAndBeveragesList] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [id, setId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [editData, setEditData] = useState({});
  const [loadingState, setLoadingState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [typeList, setTypeList] = useState([
    "Combo",
    "Beverage",
    "Popcorn",
    "Snacks",
  ]);

  const itemType = ["Combo", "Beverage", "Popcorn", "Snacks", "Other"];

  const initialValues = {
    itemDescription: editData?.itemDescription ? editData?.itemDescription : "",
    price: editData.itemPrice ? parseFloat(editData.itemPrice).toFixed(2) : "",
    type: editData?.type ? editData?.type : "",
    poster: editData?.poster ? editData?.poster : "",
    itemSequence: editData?.itemSequence ? editData?.itemSequence : "",
    foodSequences: sequence
      ? sequence
          ?.filter((item) => item?.type == editData?.type)
          .map((item) => {
            return {
              ...item,
              sequence: item?.sequence.filter(
                (val) => val !== editData?.itemSequence
              ),
            };
          })
      : [],
  };

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  // End Pagination

  // Start Searching

  const requestSearch = (searched, itemType) => {
    console.log(searched, itemType, 131);

    let MatchingTypeData = foodsAndBeveregesList.filter((row) =>
      itemType == "Other"
        ? !typeList?.includes(row?.type)
        : row?.type?.toLowerCase() == itemType?.toLowerCase()
    );

    // Filter the list based on the search query
    let filteredData = MatchingTypeData.filter((data) => {
      const itemDescriptionMatch = data?.itemDescription
        ?.toLowerCase()
        ?.includes(searched?.toLowerCase());
      const itemCode = data?.itemMasterItemCode
        ?.toLowerCase()
        ?.includes(searched?.toLowerCase());
      const oldItemName = data?.oldItemDescription
        ?.toLowerCase()
        ?.includes(searched?.toLowerCase());
      const itemTypeMatch = data?.type
        ?.toLowerCase()
        ?.includes(searched?.toLowerCase());
      const itemPriceMatch =
        data?.itemPrice &&
        parseFloat(data.itemPrice)
          .toFixed(2)
          .toString()
          .includes(searched?.toString());

      return (
        itemDescriptionMatch ||
        itemPriceMatch ||
        itemTypeMatch ||
        itemCode ||
        oldItemName
      );
    });

    // Add back the items that don't match the itemType
    let nonMatchingTypeData = foodsAndBeveregesList.filter(
      (row) => row?.type?.toLowerCase() !== itemType?.toLowerCase()
    );

    // Combine both filtered results
    const finalFilteredData = [...filteredData, ...nonMatchingTypeData];

    // Set the filtered data
    setFilteredData(finalFilteredData);

    setCurrentPage(0);
  };

  //End Searching

  //Start Open Close Function
  const handleOpen = (type) => {
    setOpen(true);
    setAddOrEdit(type);
  };
  const handleClose = () => {
    setId("");
    setOpen(false);
    setImageUrl("");
    formRef.current.resetForm();
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  // End Open Close Function

  const handleStatus = (event, id) => {
    const data = {
      id: id,
      isActive: event.target.checked,
    };
    setLoadingState((prevState) => ({ ...prevState, [id]: true }));
    PagesIndex.DataService.post(PagesIndex.Api.ACTIVE_DEACTIVE_FOOD_ITEM, data)
      .then((res) => {
        if (res?.data?.status === 200) {
          PagesIndex.toast.success(res?.data?.message);
          getFoodsAndBeveragesList();
          setTimeout(() => {
            setLoadingState((prevState) => ({ ...prevState, [id]: false }));
          }, 1000);
        }
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setTimeout(() => {
          setLoadingState((prevState) => ({ ...prevState, [id]: false }));
        }, 1000);
      });
  };
  const handleItemSubmit = (values) => {
    setIsLoading(true);
    const urlEncoded = new FormData();
    if (id) {
      urlEncoded.append("id", id);
    }
    if (typeof values?.poster === "object") {
      urlEncoded.append("poster", values?.poster);
    } else {
      urlEncoded.append("poster", "");
    }
    urlEncoded.append("itemName", values?.itemDescription);
    urlEncoded.append("type", values?.type);
    urlEncoded.append("itemSequence", values?.itemSequence);
    PagesIndex.DataService.post(PagesIndex.Api.EDIT_FOOD_ITEM, urlEncoded)
      .then((res) => {
        PagesIndex.toast.success(res?.data?.message);
        handleClose();
        getFoodsAndBeveragesList();
        setIsLoading(false);
      })
      .catch((err) => {
        PagesIndex.toast.error(err?.response?.data?.message);
        setIsLoading(false);
      });
    if (itemType !== values?.type) {
      setIsUpdate(!isUpdate);
    }
  };

  const getFoodsAndBeveragesList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_FOODS_AND_BAVERAGES +
        "/" +
        selectedCinema +
        "?" +
        new Date().getTime()
    )
      .then((res) => {
        // Object to store sequences grouped by type
        const sequenceByType = {};

        // Iterate through the items array
        res?.data?.data.forEach((item) => {
          // Check if the type already exists in the sequenceByType object
          if (sequenceByType.hasOwnProperty(item.type)) {
            // If it exists, push the item's sequence to the array of sequences for that type
            sequenceByType[item.type].push(item.itemSequence);
          } else {
            // If it doesn't exist, create a new array with the item's sequence and store it in the sequenceByType object
            sequenceByType[item.type] = [item.itemSequence];
          }
        });

        // Convert sequenceByType object to the desired output array format
        const outputArray = Object.keys(sequenceByType).map((type) => {
          return {
            type: type,
            sequence: sequenceByType[type],
          };
        });

        let modifyData = res?.data?.data?.map((item) => {
          return {
            ...item,
            itemPrice: item?.itemPrice,
            // itemPrice: Number(
            //   item?.itemPrice / 100 + ((item?.itemPrice / 100) * 5) / 100
            // ),
          };
        });
        setSequence(outputArray);
        setFoodsAndBeveragesList(modifyData);
        setFilteredData(modifyData);

        if (searchValue !== "" && !filteredData == []) {
          let filteredDataFilter = modifyData?.filter(
            (title) =>
              title?.itemMasterItemCode
                ?.toLowerCase()
                .includes(searchValue?.toLowerCase()) ||
              title?.oldItemDescription
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
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
        }
      });
  };

  useEffect(() => {
    if (selectedCinema) {
      getFoodsAndBeveragesList();
    }
  }, [selectedCinema]);

  const generateExcel = async () => {
    const headers = [
      "Image",
      "Item_Sequence",
      "Item_Code",
      "old_Item_Name",
      "Item_Name",
      "Item_Type",
      "Price",
      "Status",
    ];
    const rows = filteredData
      ?.filter((row) =>
        itemType == "Other"
          ? !typeList?.includes(row?.type)
          : row?.type?.toLowerCase() == itemType?.toLowerCase()
      )
      .sort((a, b) => a.itemSequence - b.itemSequence)
      ?.map((item) => ({
        image: item?.poster
          ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
          : "-",
        itemSequence: item?.itemSequence ? item?.itemSequence : "-",
        itemCode: item?.itemMasterItemCode ? item?.itemMasterItemCode : "-",
        itemoldName: item?.oldItemDescription ? item?.oldItemDescription : "-",
        itemName: item?.itemDescription ? item?.itemDescription : "-",
        itemType: item?.type ? item?.type : "-",
        price: item?.itemPrice ? item?.itemPrice : "-",
        status: item?.isActive ? "Active" : "Deactive",
      }));
    const workbook = PagesIndex.XLSX.utils.book_new();
    const worksheet = PagesIndex.XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = Object.keys(rows[0])?.map((item) => {
      return {
        width: 15,
      };
    });
    PagesIndex.XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Food and Beverages"
    );

    // customize header names
    PagesIndex.XLSX.utils.sheet_add_aoa(worksheet, [headers]);

    let fileName = `${itemType}_List_${PagesIndex.moment().format(
      "DD-MM-YYYY"
    )}.xlsx`;

    PagesIndex.XLSX.writeFile(workbook, fileName, { compression: true });
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Function to handle accordion expansion
  const handleChange = (index, isExpanded) => {
    setExpandedIndex(isExpanded ? index : null);
    setFilteredData(foodsAndBeveregesList);
    setSearchValue("");
  };

  const FoodsAndBeveregesAccordian = ({ itemType, index }) => {
    if (itemType == "Other") {
    }

    const searchInputRef = useRef(null);

    const handleAccordionChange = (event, isExpanded) => {
      handleChange(index, isExpanded);
      setCurrentPage(0);
    };

    const handleInputChange = (e, itemType) => {
      const newValue = e.target.value
        .replace(/^\s+/, "")
        .replace(/\s\s+/g, " ");
      setSearchValue(newValue);
      requestSearch(newValue, itemType);
      searchInputRef.current.focus();
    };

    useEffect(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, []);

    return (
      <>
        <Index.Accordion
          className="accordion-food"
          expanded={expandedIndex == index}
          onChange={handleAccordionChange}
        >
          <Index.AccordionSummary
            className="accordion-details-summary"
            expandIcon={
              <Index.ExpandMoreIcon className="accordion-icon-details" />
            }
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            {itemType} (
            {
              filteredData?.filter((row) =>
                itemType == "Other"
                  ? !typeList?.includes(row?.type)
                  : row?.type?.toLowerCase() == itemType?.toLowerCase()
              )?.length
            }
            )
          </Index.AccordionSummary>
          <Index.AccordionDetails className="accordion-details-content">
            <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search mt-seacrh-details search-box">
              <Search className="search ">
                <StyledInputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  // onChange={(e) => requestSearch(e.target.value)}
                  value={searchValue}
                  onChange={(e) => handleInputChange(e, itemType)}
                  inputRef={searchInputRef}
                />
              </Search>
              <Index.Box className="common-button blue-button res-blue-button">
                <Index.Button
                  variant="contained"
                  className="no-text-decoration"
                  disabled={
                    filteredData?.filter((row) =>
                      itemType == "Other"
                        ? !typeList?.includes(row?.type)
                        : row?.type?.toLowerCase() == itemType?.toLowerCase()
                    )?.length
                      ? false
                      : true
                  }
                  onClick={() => {
                    generateExcel(itemType);
                  }}
                >
                  Export
                </Index.Button>
              </Index.Box>
            </Index.Box>
            <Index.Box className="food-details-content page-table-main">
              <Index.TableContainer
                component={Index.Paper}
                className="table-container"
              >
                <Index.Table
                  aria-label="simple table"
                  className="table-design-main one-line-table region-manage-table food-baverage-table"
                >
                  <Index.TableHead>
                    <Index.TableRow>
                      <Index.TableCell>Image</Index.TableCell>
                      <Index.TableCell align="center">
                        Item Sequence
                      </Index.TableCell>
                      <Index.TableCell>Item Code</Index.TableCell>
                      <Index.TableCell>Old ItemName</Index.TableCell>
                      <Index.TableCell>Item Name</Index.TableCell>

                      <Index.TableCell>Item Type</Index.TableCell>

                      <Index.TableCell>Price</Index.TableCell>
                      {adminLoginData?.roleId?.permissions?.includes(
                        "food_beverages_edit"
                      ) && (
                        <Index.TableCell align="center">
                          In Vista Available
                        </Index.TableCell>
                      )}
                      {adminLoginData?.roleId?.permissions?.includes(
                        "food_beverages_edit"
                      ) && (
                        <Index.TableCell align="right">Action</Index.TableCell>
                      )}
                    </Index.TableRow>
                  </Index.TableHead>
                  <Index.TableBody>
                    {filteredData?.filter((row) =>
                      itemType == "Other"
                        ? !typeList?.includes(row?.type)
                        : row?.type?.toLowerCase() == itemType?.toLowerCase()
                    )?.length ? (
                      filteredData
                        ?.filter(
                          (row) =>
                            itemType == "Other"
                              ? !typeList?.includes(row?.type)
                              : row?.type?.toLowerCase() ==
                                itemType?.toLowerCase()
                          // itemType == "Other" ? !typeList.includes(row?.type) : typeList.includes(row?.type)
                        )
                        .sort((a, b) => a.itemSequence - b.itemSequence)
                        ?.slice(
                          currentPage * rowsPerPage,
                          currentPage * rowsPerPage + rowsPerPage
                        )
                        ?.map((item, index) => {
                          return (
                            <Index.TableRow
                              // className="inquiry-list"
                              key={item?._id}
                            >
                              <Index.TableCell>
                                <Index.Box className="class_img">
                                  <img
                                    src={
                                      item?.poster
                                        ? `${PagesIndex.IMAGES_API_ENDPOINT}/${item?.poster}`
                                        : PagesIndex.Png.NoImageAvailable
                                    }
                                    onClick={handleClose}
                                    alt=""
                                  />
                                </Index.Box>
                              </Index.TableCell>
                              <Index.TableCell align="center">
                                {item?.itemSequence ? item?.itemSequence : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.itemMasterItemCode
                                  ? item?.itemMasterItemCode
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.oldItemDescription
                                  ? item?.oldItemDescription
                                  : "-"}
                              </Index.TableCell>
                              <Index.TableCell>
                                {item?.itemDescription
                                  ? item?.itemDescription
                                  : "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item?.type ? item?.type?.toUpperCase() : "-"}
                              </Index.TableCell>

                              <Index.TableCell>
                                {item.itemPrice
                                  ? parseFloat(item.itemPrice).toFixed(2)
                                  : "-"}
                              </Index.TableCell>
                              {adminLoginData?.roleId?.permissions?.includes(
                                "food_beverages_edit"
                              ) && (
                                <Index.TableCell align="center">
                                  {item?.isActive ? "YES" : "NO"}

                                  {/* {itemType == "Other" ? (
                                    item?.isActive ? (
                                      "YES"
                                    ) : (
                                      "NO"
                                    )
                                  ) : (
                                    <CustomToggleButton
                                      defaultChecked={item?.isActive}
                                      onChange={(e) =>
                                        handleStatus(e, item?._id)
                                      }
                                      disabled={
                                        loadingState[item?._id] || false
                                      }
                                    />
                                  )} */}
                                </Index.TableCell>
                              )}
                              {adminLoginData?.roleId?.permissions?.includes(
                                "food_beverages_edit"
                              ) && (
                                <Index.TableCell align="right">
                                  <Index.IconButton
                                    onClick={(e) => {
                                      setId(item?._id);
                                      handleOpen("Edit");
                                      setEditData(item);
                                      if (item?.poster) {
                                        formRef?.current?.setFieldValue(
                                          "isPosterUploaded",
                                          true
                                        );
                                        setImageUrl(
                                          `${PagesIndex?.IMAGES_API_ENDPOINT}/${item?.poster}`
                                        );
                                      }
                                    }}
                                  >
                                    <Index.EditIcon />
                                  </Index.IconButton>
                                  {/* <Index.IconButton
                                onClick={() => handleDeleteOpen(item?._id)}
                              >
                                <Index.DeleteIcon />
                              </Index.IconButton> */}
                                </Index.TableCell>
                              )}
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
                          No data available
                        </Index.TableCell>
                      </Index.TableRow>
                    )}
                  </Index.TableBody>
                </Index.Table>
              </Index.TableContainer>

              {filteredData?.length ? (
                <Index.Box className="pagination-design flex-end">
                  <Index.Stack spacing={2}>
                    <Index.Box className="pagination-count">
                      <Index.TablePagination
                        component="div"
                        count={
                          filteredData?.filter((row) =>
                            itemType == "Other"
                              ? !typeList?.includes(row?.type)
                              : row?.type?.toLowerCase() ==
                                itemType?.toLowerCase()
                          )?.length
                        }
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
          </Index.AccordionDetails>
        </Index.Accordion>
      </>
    );
  };

  if (
    adminLoginData?.type == "Admin" ||
    adminLoginData?.roleId?.permissions?.includes("food_beverages_view")
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
                    Foods and Beverages
                  </Index.Typography>
                </Index.Box>
                <Index.Box className="d-flex align-items-center res-set-search cinema-drop-desk">
                  <Index.Box className="input-box ">
                    <Index.FormHelperText className="form-lable">
                      Cinema
                    </Index.FormHelperText>
                    <Index.Box className="form-group">
                      <Index.Select
                        fullWidth
                        id="fullWidth"
                        name="category"
                        className="form-control"
                        value={selectedCinema}
                        onChange={(e) => {
                          setSelectedCinema(e.target.value);
                        }}
                      >
                        {cinemaList.map((data) => {
                          return (
                            <Index.MenuItem value={data?._id}>
                              {data?.displayName}
                            </Index.MenuItem>
                          );
                        })}
                      </Index.Select>
                    </Index.Box>
                  </Index.Box>
                  {/* <Index.Box className="d-flex align-items-center res-set-search common-user-listing-search mt-seacrh-details">
                    <Search className="search ">
                      <StyledInputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        // onChange={(e) => requestSearch(e.target.value)}
                        value={searchValue}
                        onChange={handleInputChange}
                      />
                    </Search>
                  </Index.Box> */}
                </Index.Box>
              </Index.Box>
            </Index.Box>

            <Index.Box className="">
              {itemType?.map((item, index) => (
                <FoodsAndBeveregesAccordian itemType={item} index={index} />
              ))}
            </Index.Box>
          </Index.Box>
        </Index.Box>

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
            <PagesIndex.Formik
              enableReinitialize
              innerRef={formRef}
              onSubmit={handleItemSubmit}
              initialValues={initialValues}
              validationSchema={PagesIndex.fAndBSchema}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setTouched,
                handleSubmit,
                setFieldValue,
              }) => (
                <>
                  <Index.Box className="modal-header">
                    <Index.Typography
                      id="modal-modal-title"
                      className="modal-title"
                      variant="h6"
                      component="h2"
                    >
                      {addOrEdit} Item
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
                          Item Name
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            name="itemDescription"
                            className="form-control"
                            placeholder="Add item name"
                            // disabled
                            type="text"
                            value={values?.itemDescription}
                            inputProps={{ maxLength: 50 }}
                            onChange={handleChange}
                            error={
                              errors.itemDescription && touched.itemDescription
                                ? true
                                : false
                            }
                            helperText={
                              errors.itemDescription && touched.itemDescription
                                ? errors.itemDescription
                                : null
                            }
                          />
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Price
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            name="title"
                            className="form-control"
                            placeholder="Add item name"
                            disabled
                            value={values?.price}
                            onChange={handleChange}
                            error={errors.title && touched.title ? true : false}
                            helperText={
                              errors.title && touched.title
                                ? errors.title
                                : null
                            }
                          />
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Image (size 214x173 px)
                        </Index.FormHelperText>

                        <Index.Box className="file-upload-btn-main">
                          <Index.Button
                            variant="contained"
                            component="label"
                            className="file-upload-btn"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                className="upload-profile-img"
                              />
                            ) : (
                              <img
                                className="
                          upload-img"
                                src={PagesIndex.Svg.add}
                              />
                            )}
                            <input
                              hidden
                              accept="image/*"
                              multiple
                              name="poster"
                              type="file"
                              onChange={(e) => {
                                try {
                                  setFieldValue(
                                    "poster",
                                    e.currentTarget.files[0]
                                  );
                                  setImageUrl(
                                    URL.createObjectURL(
                                      e.currentTarget.files[0]
                                    )
                                  );
                                } catch (error) {
                                  console.error(error);
                                  e.currentTarget.value = null;
                                }
                              }}
                            />
                          </Index.Button>
                        </Index.Box>
                        <Index.FormHelperText error>
                          {errors.poster ? errors.poster : false}
                        </Index.FormHelperText>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Food Item Type
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.Select
                            fullWidth
                            id="fullWidth"
                            name="type"
                            className="form-control"
                            value={values?.type}
                            displayEmpty
                            renderValue={
                              values?.type
                                ? undefined
                                : () => "Select food item type"
                            }
                            onChange={(e) => {
                              handleChange(e);
                              setFieldValue(
                                "foodSequences",
                                sequence?.filter(
                                  (item) => item?.type == e.target.value
                                )
                              );
                            }}
                            error={errors.type && touched.type ? true : false}
                          >
                            <Index.MenuItem value={"Combo"}>
                              COMBO
                            </Index.MenuItem>
                            <Index.MenuItem value={"Popcorn"}>
                              POPCORN
                            </Index.MenuItem>
                            <Index.MenuItem value={"Beverage"}>
                              BEVERAGE{" "}
                            </Index.MenuItem>
                            <Index.MenuItem value={"Snacks"}>
                              SNACKS{" "}
                            </Index.MenuItem>
                            <Index.MenuItem value={"Other"}>
                              OTHERS{" "}
                            </Index.MenuItem>
                          </Index.Select>
                          <Index.FormHelperText error>
                            {errors.type && touched.type ? errors.type : null}
                          </Index.FormHelperText>
                        </Index.Box>
                      </Index.Box>
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Item Sequence
                        </Index.FormHelperText>
                        <Index.Box className="form-group">
                          <Index.TextField
                            fullWidth
                            id="fullWidth"
                            name="itemSequence"
                            type="number"
                            className="form-control"
                            onKeyDown={(e) =>
                              (e.keyCode === 69 ||
                                e.keyCode === 190 ||
                                e.keyCode === 110) &&
                              e.preventDefault()
                            }
                            placeholder="Add item Sequence"
                            onWheel={(e) => e.target.blur()}
                            value={values?.itemSequence}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              // Regex to check for decimal values and "e"
                              let check = /^[0-9]*$/.test(inputValue);
                              if (check) {
                                setFieldValue("itemSequence", inputValue);
                              }
                            }}
                            error={
                              errors.itemSequence && errors.itemSequence
                                ? true
                                : false
                            }
                            helperText={
                              errors.itemSequence && errors.itemSequence
                                ? errors.itemSequence
                                : null
                            }
                          />
                        </Index.Box>
                      </Index.Box>
                      {/* {imageUrl && <img src={imageUrl} className="slider-image" />} */}
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
                </>
              )}
            </PagesIndex.Formik>
          </Index.Box>
        </Index.Modal>
        <PagesIndex.DeleteModal
          deleteOpen={deleteOpen}
          handleDeleteClose={handleDeleteClose}
          // handleDeleteRecord={handleSliderRemove}
        />
      </>
    );
  } else {
    dispatch(adminLogout());
  }
};

export default FoodsAndBeveregesManagement;
