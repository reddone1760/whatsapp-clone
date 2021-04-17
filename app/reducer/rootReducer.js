import authReducer from "./authReducer";
import profileReducer from "./profilesReducer";
import { combineReducers } from "redux";

const rootReducer = combineReducers({
  auth: authReducer,
  plifile: profileReducer,
});

export default rootReducer;
