import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatId: null,
  },
  reducers: {
    enterChat: (state, action) => {
      state.chatId = action.payload.chatId;
    },
  },
});

export const { enterChat } = chatSlice.actions;

export const selectChatId = (state) => state.chat.chatId;

export default chatSlice.reducer;
