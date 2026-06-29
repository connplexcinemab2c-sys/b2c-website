import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PagesIndex from '../../../PagesIndex';
import Index from "../../../Index";
import { useDispatch } from 'react-redux';

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
const LoginActivityDetails = () => {
    const { adminId, adminName } = useLocation()?.state;
    const dispatch = useDispatch();
    const { adminLoginData } = PagesIndex.useSelector(
        (state) => state.admin.AdminSlice
    );
    const [loading, setLoading] = useState(true);
    const [acitivityData, setActivityData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const getAcitivityList = async () => {
        try {
            setLoading(true)
            const response = await PagesIndex.DataService.post(PagesIndex.Api.LOGIN_ACTIVITY_DETAILS, { adminId });
            const { data, status } = response?.data
            if (status === 200) {
                setActivityData(data)
                setFilteredData(data)
            }
        } catch (error) {
            setActivityData([])
            setFilteredData([])
        }
        finally {
            setLoading(false)
        }
    }

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ");
        setSearchValue(newValue);
        requestSearch(newValue);
    };

    // Search on table
    const requestSearch = (searched) => {
        let filteredData = acitivityData?.filter(
            (data) =>
                data?.ipAddress?.toLowerCase().includes(searched?.toLowerCase()) ||
                data?.loginStatus?.toLowerCase().includes(searched?.toLowerCase()) ||
                PagesIndex.moment(data?.sliderType).format("DD-MM-YYYY hh:mm A").includes(searched?.toLowerCase())
        );
        setCurrentPage(0);
        setFilteredData(filteredData);
    };

    useEffect(() => {
        getAcitivityList();
    }, []);

    if (
        adminLoginData?.type === "Admin"
    ) {
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
                                    Activity details - {adminName}
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
                                        <Index.TableCell width="30%">
                                            Ip Address
                                        </Index.TableCell>
                                        <Index.TableCell width="30%">
                                            Login Status
                                        </Index.TableCell>
                                        <Index.TableCell width="40%">
                                            Date
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
                                                            {item?.ipAddress ? item?.ipAddress : "-"}
                                                        </Index.TableCell>
                                                        <Index.TableCell>
                                                            {item?.loginStatus ? item?.loginStatus : "-"}
                                                        </Index.TableCell>
                                                        <Index.TableCell>
                                                            {item?.ipAddress ? PagesIndex.moment(item.createdAt).format("DD-MM-YYYY hh:mm A") : "-"}
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
        );
    } else {
        dispatch(adminLogout());
    }
}

export default LoginActivityDetails