import React, { useEffect, useState } from "react";
import Header from "../../../../../components/admin/defaultLayout/Header";
import Sidebar from "../../../../../components/admin/defaultLayout/Sidebar";
import Index from "../../../../Index";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleClick2 = (event) => {
    setAnchorEl(event.currentTarget);
    document.body.classList["add"]("menu-set-main");
  };
  const handleClose2 = () => {
    setAnchorEl(null);
    document.body.classList["remove"]("menu-set-main");
  };
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList[open ? "add" : "remove"]("body-no-class");
  }, [open]);

  useEffect(() => {
    if (location?.pathname.includes("/dashboard")) {
      setSidebarKey((prevKey) => prevKey + 1);
    }
  }, [location.pathname]);
  return (
    <div className="main-dashboard">
      <Sidebar setOpen={setOpen} open={open} key={sidebarKey}/>
      <Index.Box className="right-dashboard-content">
        <Header
          setOpen={setOpen}
          open={open}
          anchorEl={anchorEl}
          open2={open2}
          handleClose2={handleClose2}
          handleClick2={handleClick2}
        />

        <Index.Box className={`admin-panel-content ${!open ? "" : "pl-none"}`}>
          <Outlet />
        </Index.Box>
      </Index.Box>
    </div>
  );
};

export default DashboardLayout;
