import { createSlice } from "@reduxjs/toolkit";
import storage from "local-storage-fallback";

const savedTheme = storage.getItem("theme");
const getInitialTheme = savedTheme ? JSON.parse(savedTheme) : "light";

export const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: getInitialTheme,
  },
  reducers: {
    changeTheme: (state, action) => {
      state.theme = action.payload.theme;
    },
  },
});

export const { changeTheme } = themeSlice.actions;

export const selectTheme = (state) => state.theme.theme;

export default themeSlice.reducer;
