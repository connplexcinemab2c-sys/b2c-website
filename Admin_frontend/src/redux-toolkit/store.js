import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";
// import { rootReducer } from "./RootReducer";
import { combineReducers } from "@reduxjs/toolkit";
import AdminSliceReducer from "./slice/admin-slice/AdminSlice";

const persistConfig = {
  key: "root",
  storage,
};

const combinedReducer = combineReducers({
  AdminSlice: AdminSliceReducer,
});

const persistedReducer = persistReducer(persistConfig, combinedReducer);

export const store = configureStore({
  reducer: {
    admin: persistedReducer,
    middleware: [thunk],
  },
});

export const persistor = persistStore(store);
