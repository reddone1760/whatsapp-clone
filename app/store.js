import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./features/chatSlice";
import themeReducer from "./features/themeSlice";

export default configureStore({
  reducer: {
    chat: chatReducer,
    theme: themeReducer,
  },
});
