import { createAsyncThunk } from "@reduxjs/toolkit";
import DataService from "../../../config/DataService";
import EcommerceService from "../../../config/EcommerceService";
import { toast } from "react-toastify";
import { Api } from "../../../config/Api";

const showToast = (message, type, options) => {
  toast[type === "success" ? "success" : "error"](message, options);
};

export const adminLogin = createAsyncThunk("admin/adminLogin", async (data) => {
  try {
    const response = await DataService.post(Api.ADMIN_LOGIN, data);
    // toast.success(response?.data?.message);
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message);
  }
});

export const verifyLoginOTP = createAsyncThunk(
  "admin/verifyLoginOTP",
  async (data) => {
    try {
      const response = await DataService.post(Api.VERIFY_OTP, data);
      toast.success(response?.data?.message);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
);

export const adminProfile = createAsyncThunk(
  "admin/adminEditProfile",
  async (data) => {
    try {
      const response = await DataService.get(Api.PROFILE_INFO, data);
      return response.data;
    } catch (error) {
      return error?.response?.data;
    }
  }
);

export const adminEditProfile = createAsyncThunk(
  "admin/adminEditProfile",
  async (data) => {
    try {
      const response = await DataService.post(Api.PROFILE_UPDATE, data);
      toast.success(response?.data?.message);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
);

// export const adminProfile = createAsyncThunk(
//   "admin/adminEditProfile",
//   async (data) => {
//     try {
//       const response = await DataService.get(Api.PROFILE_INFO, data);
//       return response.data;
//     } catch (error) {
//       return error?.response?.data;
//     }
//   }
// );
export const getRoleAdmin = createAsyncThunk(
  "admin/getRoleAdmin",
  async (data) => {
    try {
      const response = await DataService.get(Api.GET_ROLE_PERMISSION, data);
      return response.data;
    } catch (error) {
      // return error?.response?.data;
    }
  }
);

export const resendOtpAction = createAsyncThunk(
  "admin/resendOtpAction",
  async (data) => {
    try {
      const response = await DataService.post(Api.RESEND_OTP, data);
      toast.success(response?.data?.message);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  }
);

export const getCategoriesService = createAsyncThunk(
  "seller/getCategoriesService",
  async () => {
    try {
      const response = await EcommerceService.get(Api.GET_ALL_CATEGORIES);
      if (response?.data?.status === 200) {
        return response?.data?.data;
      }
    } catch (error) {}
  }
);

export const getSingleProductService = createAsyncThunk(
  "seller/getSingleProductService",
  async (id) => {
    try {
      const response = await EcommerceService.get(Api.GET_PRODUCT, {
        params: { id },
      });
      if (response?.data?.status === 200) {
        return response?.data?.data;
      }
    } catch (error) {
      window.location.href = "/admin/dashboard";
    }
  }
);

export const getAttributesByCategoryService = createAsyncThunk(
  "seller/getAttributesByCategoryService",
  async (id) => {
    try {
      const response = await EcommerceService.get(
        `${Api.GET_ALL_ATTRIBUTES_BY_CATEGORY}${id}`
      );
      if (response?.data?.status === 200) {
        return response?.data?.data;
      }
    } catch (error) {}
  }
);

export const addEditProductService = createAsyncThunk(
  "seller/addEditProductService",
  async (formData) => {
    try {
      const response = await EcommerceService.post(
        Api.ADD_EDIT_PRODUCT,
        formData
      );

      if (response?.data?.status === 200 || response?.data?.status === 201) {
        showToast(response?.data?.message, "success");

        return response?.data;
      }
    } catch (error) {
      const err = customError(error);
      showToast(
        err?.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  }
);
