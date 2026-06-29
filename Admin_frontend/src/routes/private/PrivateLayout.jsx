import React, { useEffect } from "react";

import { Outlet } from "react-router-dom";
import PagesIndex from "../../container/PagesIndex";
import { getRoleAdmin } from "../../redux-toolkit/slice/admin-slice/AdminServices";
import { useDispatch } from "react-redux";
import { updateRolePermission } from "../../redux-toolkit/slice/admin-slice/AdminSlice";

const PrivateLayout = ({ children }) => {
  const location = PagesIndex.useLocation();
  const dispatch = useDispatch();
  const token = PagesIndex.useSelector((state) => state.admin.AdminSlice.token);
  const adminLoginData = PagesIndex.useSelector(
    (state) => state.admin.AdminSlice.adminLoginData
  );

  const isAdminLoggedIn = (token) => {
    if (!token) return false;
    PagesIndex.DataService.defaults.headers.common.auth = token;
    PagesIndex.EcommerceService.defaults.headers.common.auth = token;
    return true;
  };

  // const getInterestedList = () => {
  //   PagesIndex.DataService.get(PagesIndex.Api.GET_ROLE_PERMISSION)
  //     .then((res) => {
  //       console.log(res?.data?.data, 9333);
  //     })
  //     .catch((err) => {
  //     });
  // };
  // useEffect(() => {
  //   getInterestedList();
  // }, [location?.pathname]);

  const getPermissionData = () => {
    dispatch(getRoleAdmin()).then((res) => {
      if (res?.payload?.status == 200) {
        let data = res?.payload?.data?.permissions;

        dispatch(updateRolePermission(data));
      }
    });
  };
  useEffect(() => {
    if (adminLoginData?.type?.toLowerCase() != "admin") {
      getPermissionData();
    }
  }, [location?.pathname]);

  return isAdminLoggedIn(token) ? (
    <Outlet />
  ) : (
    <PagesIndex.Navigate to="/" state={{ from: location }} replace={true} />
  );
};

export default PrivateLayout;
