import { combineReducers } from "redux";
import UserReducer from "./user/reducer";
const rootReducer = combineReducers({
  UserReducer: UserReducer,
});

export default rootReducer;
