import React, { useState } from "react";
import Index from "../../../../../Index";
import { styled } from "@mui/material/styles";

import "./MenageUser.css";

const ManageUser = () => {
  const [searchText, setSearchText] = useState("");
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };
  const StyledTableCell = styled(Index.TableCell)(({ theme }) => ({
    "&.MuiTableCell-head": {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    "&.MuiTableCell-body": {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(Index.TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
    createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
    createData("Eclair", 262, 16.0, 24, 6.0),
    createData("Cupcake", 305, 3.7, 67, 4.3),
    createData("Gingerbread", 356, 16.0, 49, 3.9),
  ];
  const PER_PAGE = 2;

  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const indexOfLastRow = currentPage * PER_PAGE;
  const indexOfFirstRow = indexOfLastRow - PER_PAGE;
  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
  return (
    <>
      <Index.Box className="container">
        <Index.Box>
          <Index.Box sx={{ flexGrow: 1 }}>
            <Index.Grid container spacing={2}>
              <Index.Grid item xs={8} className="user-heading">
                User Manager
              </Index.Grid>
              <Index.Grid item xs={3} className="user-heading">
                <Index.TextField
                  value={searchText}
                  onChange={handleSearchChange}
                  label="search"
                ></Index.TextField>
              </Index.Grid>
              {/* <Index.Grid xs={1} className="user-heading"></Index.Grid> */}
              {/* <Index.Grid xs={}>sdfsdfdf</Index.Grid> */}
            </Index.Grid>
          </Index.Box>
        </Index.Box>
        <Index.Box>
          {/* DATA FROM Index */}
          <Index.TableContainer component={Index.Paper} className="pagination">
            <Index.Table
              style={{ minWidth: 700 }}
              aria-label="customized table"
            >
              <Index.TableHead>
                <Index.TableRow>
                  <StyledTableCell>Dessert (100g serving)</StyledTableCell>
                  <StyledTableCell align="left">Calories</StyledTableCell>
                  <StyledTableCell align="left">Fat&nbsp;(g)</StyledTableCell>
                  <StyledTableCell align="left">Carbs&nbsp;(g)</StyledTableCell>
                  <StyledTableCell align="left">
                    Protein&nbsp;(g)
                  </StyledTableCell>
                </Index.TableRow>
              </Index.TableHead>
              <Index.TableBody>
                {currentRows.map((row) => (
                  <StyledTableRow key={row.name}>
                    <StyledTableCell component="th" scope="row">
                      {row.name}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {row.calories}
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.fat}</StyledTableCell>
                    <StyledTableCell align="left">{row.carbs}</StyledTableCell>
                    <StyledTableCell align="left">
                      {row.protein}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </Index.TableBody>
            </Index.Table>
            <Index.Pagination
              count={Math.ceil(rows.length / PER_PAGE)}
              page={currentPage}
              onChange={handlePageChange}
              shape="rounded"
              className="pagination"
            />
          </Index.TableContainer>
          {/* DATA FORM Index */}
        </Index.Box>
      </Index.Box>
    </>
  );
};

export default ManageUser;
