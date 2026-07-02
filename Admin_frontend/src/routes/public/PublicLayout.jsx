import React from "react";

import { Outlet } from "react-router-dom";
import PagesIndex from "../../container/PagesIndex";

const PublicLayout = ({ children }) => {
  const location = PagesIndex.useLocation();
  const isAdminLoggedIn = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice.token
  );

  return <Outlet />;
};

export default PublicLayout;
