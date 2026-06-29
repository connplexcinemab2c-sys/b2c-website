import { combineReducers } from "@reduxjs/toolkit";
import AdminSliceReducer from "./slice/admin-slice/admin-slice/AdminSlice";
// import authReducers from "./slice/auth/authSlice";

const combinedReducer = combineReducers({
  AdminSlice: AdminSliceReducer,
});

export const rootReducer = (state, action) => {
  if (action.type === "auth/Logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};
