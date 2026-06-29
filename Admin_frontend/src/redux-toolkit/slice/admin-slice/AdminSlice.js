import { createSlice } from "@reduxjs/toolkit";
import { adminEditProfile, verifyLoginOTP, getRoleAdmin } from "./AdminServices";

const initialState = {
  token: "",
  adminLoginData: [],
  isAdminLoggedIn: false,
  loading: false,
  adminProfile: {},
  adminRoleData: {},
};

export const AdminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogout: (state) => {
      localStorage.removeItem("token");
      state.isAdminLoggedIn = false;
      state.adminLoginData = [];
      state.token = "";
    },
    updateRolePermission: (state, action) => {
      state.adminLoginData = {
        ...state.adminLoginData,
        roleId: {
          ...state?.adminLoginData?.roleId,
          permissions: action.payload,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyLoginOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        state.adminLoginData = action?.payload?.data;
        state.token = action?.payload?.data?.token;
        state.isAdminLoggedIn = true;
        state.loading = false;
      })
      .addCase(verifyLoginOTP.rejected, (state) => {
        state.loading = false;
      })

      .addCase(adminEditProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminEditProfile.fulfilled, (state, action) => {
        state.adminLoginData = {
          ...state.adminLoginData,
          email: action?.payload?.data?.email,
          name: action?.payload?.data?.name,
          mobileNumber: action?.payload?.data?.mobileNumber,
          image: action?.payload?.data?.image,
        };
        state.loading = false;
      })
      .addCase(adminEditProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRoleAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminRoleData = action.payload?.data;
      });
  },
});

export const { adminLogout, updateRolePermission } = AdminSlice.actions;

export default AdminSlice.reducer;
