import { useEffect, useState } from "react";
import Index from "../../../Index";
import PagesIndex from "../../../PagesIndex";
import "./RolePermissionManagement.css";
import { object } from "yup";

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
const RolePermissionManagement = () => {
  const { adminLoginData } = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice
  );
  const [loading, setLoading] = useState(true);
  let initialValues = {
    roleName: "",
  };
  const modules = [
    {
      tag: "dashboard",
      title: "Dashboard",
      disable: ["add", "edit", "delete"],
    },
    { tag: "user", title: "User", disable: ["add", "edit", "delete"] },
    {
      tag: "movie_review",
      title: "Movie Reviews",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "blog",
      title: "Blog",
    },
    {
      tag: "coupon",
      title: "Coupon",
    },
    {
      tag: "applyForFranchise",
      title: "Franchise",
      disable: ["add", "edit", "delete"],
    },
    { tag: "bookings", title: "Bookings", disable: ["add", "edit", "delete"] },
    {
      tag: "transaction",
      title: "Transaction History",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "contactUs",
      title: "Contact us",
      disable: ["add", "edit", "delete"],
    },
    { tag: "feedback", title: "Feedbacks", disable: ["add", "edit", "delete"] },
    {
      tag: "ad_request",
      title: "Advertisement Requests",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "career_request",
      title: "Career Requests",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "trial_subs",
      title: "Newsletter",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "report_issue",
      title: "Report Issue",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "membership_plan",
      title: "Membership Plan",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "reward_coin",
      title: "Reward / Coin",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "global_notification",
      title: "Global Notification",
      disable: ["delete"],
    },
    {
      tag: "movie_interested",
      title: "Movie Interested",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "food_beverages",
      title: "Foods And Beverages",
      disable: ["add", "delete"],
    },
    { tag: "region", title: "Region" },
    { tag: "slider", title: "Slider" },
    { tag: "cinema", title: "Cinema" },
    { tag: "movie", title: "Movie" },
    { tag: "actor", title: "Actors" },
    { tag: "partners", title: "Partners" },
    { tag: "gallery", title: "Gallery" },
    { tag: "faq", title: "FAQ" },
    { tag: "sub_admin", title: "Sub Admin" },
    { tag: "cms", title: "CMS" },
    {
      tag: "welcome_gift",
      title: "Welcome Gift",

      disable: ["add", "edit", "delete"],
    },
    {
      tag: "subscription",
      title: "Subscription",
    },
    {
      tag: "subscription_request",
      title: "Subscription Request",
      disable: ["add", "delete"],
    },
    {
      tag: "ecommerce",
      title: "Ecommerce",
    },
    {
      tag: "total_revenue_dashboard_card",
      title: "Revenue Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "ecommerce_revenue_dashboard_card",
      title: "Ecommerce Revenue Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "ticket_revenue_dashboard_card",
      title: "Ticket Revenue Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "ticket_transactions_dashboard_card_view",
      title: "Ticket Transactions Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "membership_transactions_dashboard_card_view",
      title: "Membership Transactions Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "top_locations_dashboard_card",
      title: "Top Locations Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "movie_dashboard_card",
      title: "Movie Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "app_downloads_dashboard_card",
      title: "App Downloads Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "top_selling_products_dashboard_card",
      title: "Top Selling Products Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    //  {
    //   tag:"admin_count_dashboard_card",
    //   title:"Admin Count Dashboard Card",
    //   disable: ["add", "edit", "delete"],
    //  },
    {
      tag: "admit_count_dashboard_card",
      title: "Admit Count Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "user_count_dashboard_card",
      title: "User Count Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "membership_dashboard_card",
      title: "Membership Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "brand_influencer_dashboard_card",
      title: "Brand Influencer Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "group_booking_dashboard_card",
      title: "Group Booking Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "franchise_dashboard_card",
      title: "Franchise Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "twentymin_franchise_dashboard_card",
      title: "20min Franchise Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "food_beverages_dashboard_card",
      title: "Food Beverages Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
    {
      tag: "ecommerce_orders_dashboard_card",
      title: "Ecommerce Orders Dashboard Card",
      disable: ["add", "edit", "delete"],
    },
  ];

  
  const [currentPage, setCurrentPage] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [id, setId] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [addOrEdit, setAddOrEdit] = useState("Add");
  const [permissions, setPermissions] = useState([]);
  const [permissionError, setPermissionError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [removeData, setRemoveData] = useState(false);
  const [checkAll, setCheckAll] = useState({
    view: false,
    add: false,
    edit: false,
    delete: false,
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpen = (mode) => {
    setAddOrEdit(mode);
    setOpenAdd(true);
  };
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };
  const handleClose = (e) => {
    setId("");
    setPermissions([]);
    setOpenAdd(false);
    setCheckAll({});
  };
  const handleDeleteOpen = (id) => {
    setId(id);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setId("");
  };

  // const checkUncheckAllType = (action, type) => {
  //   if (action === "add") {
  //     let updatedData = modules.map((ele) => ele.tag + type);
  //     setPermissions((prev) => [...new Set([...prev, ...updatedData])]);
  //     setCheckAll({...checkAll,[type]:true})
  //   } else {
  //     const data = modules.map((ele) => ele.tag + type);
  //     const removedArray = permissions.filter((el) => !data.includes(el));
  //     setPermissions(removedArray);
  //   }
  // };

  const checkUncheckAllType = (action, type) => {
    let modifyType = type.split("_")[1];
    if (action === "add") {
      const updatedData = modules
        ?.filter((item) => !item?.disable?.includes(modifyType))
        ?.map((ele) => ele.tag + type);
      const viewPermissionData = modules?.map((ele) => ele.tag + "_view");
      let permissionArr = [...new Set([...updatedData, ...viewPermissionData])];
      setPermissions((prev) => [...new Set([...prev, ...permissionArr])]);
      // Set the specified type to true and all others to false
      setCheckAll((prevCheckAll) => ({
        ...prevCheckAll,
        [modifyType]: true,
      }));
    } else {
      const data = modules?.map((ele) => ele?.tag + type);
      const viewPermissionData = modules?.map((ele) => ele?.tag + "_view");
      let permissionArr = [...new Set([...data, ...viewPermissionData])];
      const removedArray = permissions?.filter((el) =>
        checkAll.add || checkAll.edit || checkAll.delete
          ? !data.includes(el)
          : !permissionArr.includes(el)
      );
      setPermissions(removedArray);

      // Update checkAll to reflect removal
      setCheckAll((prevCheckAll) => {
        const updatedCheckAll = {
          ...prevCheckAll,
          [modifyType]: false,
        };

        // If all of add, edit, and delete are false, set view to false
        if (
          !updatedCheckAll.add &&
          !updatedCheckAll.edit &&
          !updatedCheckAll.delete
        ) {
          updatedCheckAll.view = false;
        }

        return updatedCheckAll;
      });
    }
  };
  const onChangeCheckBox = (value, checked, tagName) => {
    let newData;
    const isViewSelected = (tag) => permissions?.includes(`${tag}_view`);
    let PermissionType = value?.split("_")[1];
    let checkPermission =
      permissions?.filter((data) => data?.includes(`_${PermissionType}`))
        .length === modules.length;

    if (checked && permissions?.length === modules.length) {
      setCheckAll((prevCheckAll) => ({
        ...prevCheckAll,
        [tagName]: true,
      }));
    } else {
      setCheckAll((prevCheckAll) => ({
        ...prevCheckAll,
        [tagName]: false,
      }));
      // setCheckAll((prevCheckAll) => {
      //   const updatedCheckAll = {
      //     ...prevCheckAll,
      //     [PermissionType]: false,
      //   };
      //   // If all of add, edit, and delete are false, set view to false
      //   if (
      //     !updatedCheckAll.add &&
      //     !updatedCheckAll.edit &&
      //     !updatedCheckAll.delete
      //   ) {
      //     updatedCheckAll.view = false;
      //   }
      //   return updatedCheckAll;
      // });
    }

    const togglePermission = (permission) => {
      if (permissions?.includes(permission)) {
        newData = permissions?.filter((item) => item !== permission);
      } else {
        newData = [...permissions, permission];
      }
    };

    let lastUnderscoreIndex = value?.lastIndexOf("_");
    let tag = value?.substring(0, lastUnderscoreIndex);
    if (value?.endsWith("_view")) {
      togglePermission(value);
    } else {
      togglePermission(value);

      const viewPermission = `${tag}_view`;
      if (!isViewSelected(tag)) {
        newData?.push(viewPermission);
      }
    }

    setPermissions(newData);
  };

  // Search on table
  const requestSearch = (searched) => {
    let filteredData = roleList?.filter((data) =>
      data?.role?.toLowerCase().includes(searched?.toLowerCase())
    );
    setCurrentPage(0);
    setFilteredData(filteredData);
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
    setSearchValue(newValue); // Store the modified search value
    requestSearch(newValue);
  };
  const getRolePermissionList = () => {
    PagesIndex.DataService.get(
      PagesIndex.Api.GET_ROLEPERMISSION + "?" + new Date().getTime()
    )
      .then((res) => {
        setRoleList(res.data.data);
        setFilteredData(res.data.data);
        setTimeout(() => {
          setLoading(false);
        }, 1500);
        if (searchValue !== "" && !removeData && !filteredData == []) {
          let filteredDataFilter = res?.data?.data?.filter((title) =>
            title?.role?.toLowerCase().includes(searchValue?.toLowerCase())
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
  const handleSubmit = (values) => {
    setIsSubmit(true);
    let obj = {
      id,
      role: values?.roleName,
      permissions,
    };
    if (id && id !== "" && obj?.permissions?.length > 0) {
      PagesIndex.DataService.post(PagesIndex.Api.EDIT_ROLEPERMISSION, obj)
        .then((res) => {
          PagesIndex.toast.success(res.data.message);
          handleClose();
          getRolePermissionList();
          setIsSubmit(false);
          setPermissionError("");
        })
        .catch((err) => {
          PagesIndex.toast.error(err.response.data.message);
          setIsSubmit(false);
        });
    }

    if (!id && id === "" && obj?.permissions?.length > 0) {
      delete obj.id;
      PagesIndex.DataService.post(PagesIndex.Api.ADD_ROLEPERMISSION, obj)
        .then((res) => {
          PagesIndex.toast.success(res.data.message);
          handleClose();
          getRolePermissionList();
          setIsSubmit(false);
          setPermissionError("");
        })
        .catch((err) => {
          PagesIndex.toast.error(err.response.data.message);
          setIsSubmit(false);
        });
    } else if (obj?.permissions?.length <= 0) {
      setPermissionError("Please select atleast one permission");
      setIsSubmit(false);
    }
  };
  const handleRemove = () => {
    setIsSubmit(true);
    PagesIndex.DataService.get(PagesIndex.Api.DELETE_ROLEPERMISSION + `/${id}`)
      .then((res) => {
        PagesIndex.toast.success(res.data.message);
        handleDeleteClose();
        setRemoveData(true);
        getRolePermissionList();
        setIsSubmit(false);
      })
      .catch((err) => {
        if (err?.response?.data?.message !== "jwt expired") {
          PagesIndex.toast.error(err?.response?.data?.message);
          setIsSubmit(false);
        }
      });
  };

  useEffect(() => {
    getRolePermissionList();
  }, [removeData]);

  return (
    <PagesIndex.Formik
      enableReinitialize
      onSubmit={handleSubmit}
      initialValues={initialValues}
      validationSchema={PagesIndex.rolePermissionSchema}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
  
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
                      Role Permission Management
                    </Index.Typography>
                    <Index.Box className="common-button blue-button res-blue-button common-mobile-show-export">
                      <Index.Button
                        variant="contained"
                        disableRipple
                        className="no-text-decoration"
                        onClick={() => {
                          resetForm();
                          handleOpen("Add");
                        }}
                      >
                        Add Role
                      </Index.Button>
                    </Index.Box>
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
                      "role_add"
                    ) && (
                      <Index.Box className="common-button blue-button res-blue-button desktop-export-details">
                        <Index.Button
                          variant="contained"
                          disableRipple
                          className="no-text-decoration"
                          onClick={() => {
                            resetForm();
                            handleOpen("Add");
                          }}
                        >
                          Add Role
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
                        <Index.TableCell width="50%">Role</Index.TableCell>
                        {(adminLoginData?.roleId?.permissions?.includes(
                          "role_edit"
                        ) ||
                          adminLoginData?.roleId?.permissions?.includes(
                            "role_delete"
                          )) && (
                          <Index.TableCell width="50%" align="right">
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
                              <Index.TableRow
                                // className="inquiry-list"
                                key={item?._id}
                              >
                                <Index.TableCell>
                                  {item?.role ? item?.role : "-"}
                                </Index.TableCell>
                                {(adminLoginData?.roleId?.permissions?.includes(
                                  "role_edit"
                                ) ||
                                  adminLoginData?.roleId?.permissions?.includes(
                                    "role_delete"
                                  )) && (
                                  <Index.TableCell align="right">
                                    <Index.Box className="flex-action-details">
                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() => {
                                            setId(item?._id);
                                            setPermissions(item?.permissions);
                                            setFieldValue(
                                              "roleName",
                                              item?.role
                                            );
                                            handleOpen("Edit");
                                          }}
                                        >
                                          {adminLoginData?.roleId?.permissions?.includes(
                                            "role_edit"
                                          ) && <Index.EditIcon />}
                                        </Index.IconButton>
                                      </Index.Box>

                                      <Index.Box className="icon-width-action">
                                        <Index.IconButton
                                          onClick={() =>
                                            handleDeleteOpen(item?._id)
                                          }
                                        >
                                          {item?._id !==
                                            "6566d38b416a6b80a037fcf8" &&
                                            adminLoginData?.roleId?.permissions?.includes(
                                              "role_delete"
                                            ) && <Index.DeleteIcon />}
                                        </Index.IconButton>
                                      </Index.Box>
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
            <Index.Modal
              open={openAdd}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="modal"
            >
              <Index.Box
                sx={style}
                className="modal-inner-main add-role-modal modal-inner"
              >
                <Index.Box className="modal-header">
                  <Index.Typography
                    id="modal-modal-title"
                    className="modal-title"
                    variant="h6"
                    component="h2"
                  >
                    {addOrEdit} Role
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
                        Role
                      </Index.FormHelperText>
                      <Index.Box className="form-group">
                        <Index.TextField
                          fullWidth
                          id="fullWidth"
                          className="form-control"
                          name="roleName"
                          placeholder="Enter role"
                          value={values?.roleName}
                          inputProps={{ maxLength: 50 }}
                          // onChange={(e) => {
                          //   handleChange(e);
                          // }}
                          onChange={(e) => {
                            // Filter out space characters
                            const newValue = e.target.value
                              .replace(/^\s+/, "")
                              .replace(/\s\s+/g, " ");
                            if (newValue.length <= 31) {
                              handleChange({
                                target: {
                                  name: "roleName",
                                  value: newValue,
                                },
                              });
                            }
                          }}
                          error={errors.roleName && touched.roleName}
                          helperText={
                            errors.roleName && touched.roleName
                              ? errors.roleName
                              : null
                          }
                        />
                      </Index.Box>
                    </Index.Box>
                    <Index.Box className="perimission-table-scroll">
                      <Index.Box className="input-box modal-input-box">
                        <Index.FormHelperText className="form-lable">
                          Permissions
                        </Index.FormHelperText>
                        <Index.Table
                          aria-label="simple table"
                          className="table"
                        >
                          <Index.TableHead className="table-head">
                            <Index.TableRow className="table-row">
                              <Index.TableCell
                                component="th"
                                variant="th"
                                className="table-th"
                              ></Index.TableCell>
                              <Index.TableCell
                                component="th"
                                variant="th"
                                className="table-th"
                                align="center"
                              >
                                <>
                                  <p>View</p>
                                  <Index.Checkbox
                                    checked={
                                      checkAll?.view ||
                                      permissions?.filter((data) =>
                                        data?.match("_view")
                                      )?.length === modules?.length
                                    }
                                    onChange={(e) => {
                                      if (e?.target?.checked) {
                                        checkUncheckAllType("add", "_view");
                                      } else {
                                        checkUncheckAllType("remove", "_view");
                                      }
                                    }}
                                  />
                                </>
                              </Index.TableCell>
                              <Index.TableCell
                                component="th"
                                variant="th"
                                className="table-th"
                                align="center"
                              >
                                <>
                                  <p>Add</p>
                                  <Index.Checkbox
                                    checked={
                                      checkAll?.add ||
                                      permissions?.filter((data) =>
                                        data?.includes("_add")
                                      ).length ===
                                        modules.length - 13
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        checkUncheckAllType("add", "_add");
                                      } else {
                                        checkUncheckAllType("remove", "_add");
                                      }
                                    }}
                                  />
                                </>
                              </Index.TableCell>
                              <Index.TableCell
                                component="th"
                                variant="th"
                                className="table-th"
                                align="center"
                              >
                                <>
                                  <p>Edit</p>
                                  <Index.Checkbox
                                    checked={
                                      checkAll?.edit ||
                                      permissions?.filter((data) =>
                                        data?.includes("_edit")
                                      ).length ===
                                        modules?.length - 12
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        checkUncheckAllType("add", "_edit");
                                      } else {
                                        checkUncheckAllType("remove", "_edit");
                                      }
                                    }}
                                  />
                                </>
                              </Index.TableCell>
                              <Index.TableCell
                                component="th"
                                variant="th"
                                className="table-th"
                                align="center"
                              >
                                <>
                                  <p>Delete</p>
                                  <Index.Checkbox
                                    checked={
                                      checkAll?.delete ||
                                      permissions?.filter((data) =>
                                        data.includes("_delete")
                                      ).length ===
                                        modules?.length - 13
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        checkUncheckAllType("add", "_delete");
                                      } else {
                                        checkUncheckAllType(
                                          "remove",
                                          "_delete"
                                        );
                                      }
                                    }}
                                  />
                                </>
                              </Index.TableCell>
                            </Index.TableRow>
                          </Index.TableHead>
                          <Index.TableBody className="table-body">
                            {modules?.length ? (
                              modules?.map((row, index) => (
                                <Index.TableRow
                                  key={index}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <Index.TableCell
                                    component="td"
                                    variant="td"
                                    scope="row"
                                    className="table-td"
                                  >
                                    {row?.title}
                                  </Index.TableCell>
                                  <Index.TableCell
                                    component="td"
                                    variant="td"
                                    scope="row"
                                    className="table-td"
                                    align="center"
                                  >
                                    <Index.Checkbox
                                      checked={
                                        permissions?.includes(
                                          `${row?.tag}_view`
                                        ) ||
                                        permissions?.includes(
                                          `${row?.tag}_add`
                                        ) ||
                                        permissions?.includes(
                                          `${row?.tag}_edit`
                                        ) ||
                                        permissions?.includes(
                                          `${row?.tag}_delete`
                                        )
                                      }
                                      disabled={
                                        row?.disable?.length > 0
                                          ? row?.disable?.includes("view")
                                          : permissions?.includes(
                                              `${row?.tag}_add`
                                            ) ||
                                            permissions?.includes(
                                              `${row?.tag}_edit`
                                            ) ||
                                            permissions?.includes(
                                              `${row?.tag}_delete`
                                            )
                                          ? true
                                          : false
                                      }
                                      onChange={(e) => {
                                        onChangeCheckBox(
                                          `${row?.tag}_view`,
                                          e.target.checked,
                                          "view"
                                        );
                                        setPermissionError("");
                                      }}
                                    />
                                  </Index.TableCell>
                                  <Index.TableCell
                                    component="td"
                                    variant="td"
                                    scope="row"
                                    className="table-td"
                                    align="center"
                                  >
                                    <Index.Checkbox
                                      checked={
                                        row?.disable?.includes("add")
                                          ? false
                                          : permissions?.includes(
                                              `${row?.tag}_add`
                                            )
                                          ? true
                                          : false
                                      }
                                      disabled={
                                        row?.disable?.length > 0
                                          ? row?.disable?.includes("add")
                                          : false
                                      }
                                      onChange={(e) => {
                                        onChangeCheckBox(
                                          `${row?.tag}_add`,
                                          e.target.checked,
                                          "add"
                                        );
                                        setPermissionError("");
                                      }}
                                    />
                                  </Index.TableCell>
                                  <Index.TableCell
                                    component="td"
                                    variant="td"
                                    scope="row"
                                    className="table-td"
                                    align="center"
                                  >
                                    <Index.Checkbox
                                      checked={
                                        row?.disable?.includes("edit")
                                          ? false
                                          : permissions?.includes(
                                              `${row?.tag}_edit`
                                            )
                                          ? true
                                          : false
                                      }
                                      disabled={
                                        row?.disable?.length > 0
                                          ? row?.disable?.includes("edit")
                                          : false
                                      }
                                      onChange={(e) => {
                                        onChangeCheckBox(
                                          `${row?.tag}_edit`,
                                          e.target.checked,
                                          "edit"
                                        );
                                        setPermissionError("");
                                      }}
                                    />
                                  </Index.TableCell>
                                  <Index.TableCell
                                    component="td"
                                    variant="td"
                                    scope="row"
                                    className="table-td"
                                    align="center"
                                  >
                                    <Index.Checkbox
                                      checked={
                                        row?.disable?.includes("delete")
                                          ? false
                                          : permissions?.includes(
                                              `${row?.tag}_delete`
                                            )
                                          ? true
                                          : false
                                      }
                                      disabled={
                                        row?.disable?.length > 0
                                          ? row?.disable?.includes("delete")
                                          : false
                                      }
                                      onChange={(e) => {
                                        onChangeCheckBox(
                                          `${row?.tag}_delete`,
                                          e.target.checked,
                                          "delete"
                                        );
                                        setPermissionError("");
                                      }}
                                    />
                                  </Index.TableCell>
                                </Index.TableRow>
                              ))
                            ) : (
                              <Index.Typography
                                align="center"
                                className="no_data_found"
                              >
                                No Data Found
                              </Index.Typography>
                            )}
                          </Index.TableBody>
                        </Index.Table>
                        {/* </Index.TableContainer> */}
                        <p className="permission-error">{permissionError}</p>
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
                            disabled={isSubmit === true}
                            variant="contained"
                            disableRipple
                            className="no-text-decoration"
                          >
                            <img
                              src={PagesIndex.Svg.save}
                              className="user-save-icon"
                            ></img>
                            Save
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
              handleDeleteRecord={handleRemove}
              isDisable={isSubmit}
            />
          </Index.Box>
      
      )}
    </PagesIndex.Formik>
  );
};
export default RolePermissionManagement;
