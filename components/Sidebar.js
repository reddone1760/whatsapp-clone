import { Avatar, IconButton, Button } from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import styled from "styled-components";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useState } from "react";
import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse/index";
import match from "autosuggest-highlight/match/index";
import { selectTheme, changeTheme } from "../app/features/themeSlice";
import { useSelector, useDispatch } from "react-redux";

function Sidebar({ chat, messages }) {
  const dispatch = useDispatch();
  const globalTheme = useSelector(selectTheme);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userChatRef = db
    .collection("chats")
    .where("users", "array-contains", user.email);
  const [chatSnapshot] = useCollection(userChatRef);

  const createChat = () => {
    const input = prompt("Plese enter Users Email");

    if (!input) return null;

    if (EmailValidator.validate(input) && input !== user.email) {
      if (!chatAlreadyExists(input)) {
        db.collection("chats")
          .add({
            users: [user.email, input],
            names: [
              { email: user.email, name: user.displayName },
              { email: input, name: input },
            ],
          })
          .then((chat) => {
            router.push(`/chat/${chat.id}`);
          });
      } else {
        router.push(`/chat/${chatSnapshot?.docs[0]?.id}`);
      }
    }
  };

  const chatAlreadyExists = (recipientEmail) =>
    !!chatSnapshot?.docs.find((chat) =>
      chat.data().users.find((user) => user === recipientEmail)
    );

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const chatsSearch = [];

  chatSnapshot?.docs.map((chat) => {
    const inputs = { chatId: chat?.id };
    chat?.data().names.filter((chatUser) => {
      chatUser.email !== user.email &&
        ((inputs.name = chatUser.name), (inputs.email = chatUser.email));
    });
    chatsSearch.push(inputs);
  });

  return (
    <Container>
      <Header>
        <UserAvatar src={user.photoURL} />

        <IconsContainer>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem className="menuItem" onClick={handleClose}>
              New Groupe
            </MenuItem>
            <MenuItem className="menuItem" onClick={handleClose}>
              Profile
            </MenuItem>
            <MenuItem className="menuItem" onClick={handleClose}>
              Archived
            </MenuItem>
            <MenuItem className="menuItem" onClick={handleClose}>
              Marked
            </MenuItem>
            <MenuItem
              className="menuItem"
              onClick={() => {
                globalTheme === "light"
                  ? dispatch(changeTheme({ theme: "dark" }))
                  : dispatch(changeTheme({ theme: "light" }));
                handleClose();
              }}
            >
              Change Theme
            </MenuItem>
            <MenuItem className="menuItem" onClick={handleClose}>
              Settings
            </MenuItem>
            <MenuItem
              className="menuItem"
              onClick={() => {
                auth.signOut();
                handleClose();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </IconsContainer>
      </Header>

      <SearchContainer>
        <Autocomplete
          id="highlights-demo"
          style={{ width: 300 }}
          options={chatsSearch}
          getOptionLabel={(option) =>
            option.name ? option.name : option.email
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search in Chats"
              variant="outlined"
              margin="normal"
            />
          )}
          renderOption={(option, { inputValue }) => {
            const matches = match(
              option.name ? option.name : option.email,
              inputValue
            );
            const parts = parse(
              option.name ? option.name : option.email,
              matches
            );
            const chatRoute = option?.chatId;

            return (
              <AutocompleteContainer>
                {parts.map((part, index) => (
                  <AutocompleteSpan
                    key={index}
                    style={{ fontWeight: part.highlight ? 700 : 400 }}
                    onClick={() => {
                      router.push(`/chat/${chatRoute}`);
                    }}
                  >
                    {part.text}
                  </AutocompleteSpan>
                ))}
              </AutocompleteContainer>
            );
          }}
        />
      </SearchContainer>

      <SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

      <AllChats>
        {chatSnapshot?.docs.map((chat) => {
          return (
            <Chat
              key={chat.id}
              id={chat.id}
              userNames={chat.data().names}
              users={chat.data().users}
              chat={chat}
              messages={messages}
            />
          );
        })}
      </AllChats>
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  flex: 0.45;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${(props) => props.theme.borderColor};
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  background-color: ${(props) => props.theme.bgColorSecondary};
  color: ${(props) => props.theme.textColorPrimary};

  .MuiSvgIcon-root {
    color: ${(props) => props.theme.iconColor};
  }
`;

const SearchContainer = styled.div`
  background-color: ${(props) => props.theme.bgColorSecondary};
  color: ${(props) => props.theme.textColorPrimary};
  padding: 8px 20px;
  display: flex;
  align-items: center;

  > .MuiAutocomplete-root {
    color: ${(props) => props.theme.textColorPrimary};
    border-color: ${(props) => props.theme.borderColor};
  }
`;

const SidebarButton = styled.button`
  width: 100%;
  border: none;
  border-top: 1px ${(props) => props.theme.borderColor} solid;
  border-bottom: 1px ${(props) => props.theme.borderColor} solid;
  cursor: pointer;
  padding: 10px;
  font-size: 18px;
  color: ${(props) => props.theme.textColorSecondary};
  background-color: ${(props) => props.theme.bgColorSecondary};
  transition: all 100ms ease-in;

  :hover {
    color: ${(props) => props.theme.textColorPrimary};
    background-color: ${(props) => props.theme.bgColorPrimary};
  }
`;

const Header = styled.div`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  background-color: ${(props) => props.theme.bgColorPrimary};
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;

const AllChats = styled.div`
  flex: 1;
  overflow-y: auto;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-button {
    width: 0px;
    height: 0px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ababab;
    border: 0px none #ffffff;
    border-radius: 0px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #ababab;
  }
  ::-webkit-scrollbar-thumb:active {
    background: #ababab;
  }
  ::-webkit-scrollbar-track {
    background: #ffffff;
    border: 0px none #ffffff;
    border-radius: 0px;
  }
  ::-webkit-scrollbar-track:hover {
    background: #ffffff;
  }
  ::-webkit-scrollbar-track:active {
    background: #ffffff;
  }
  ::-webkit-scrollbar-corner {
    background: transparent;
  }
  scrollbar-width: 8px;
`;

const AutocompleteContainer = styled.div`
  color: ${(props) => props.theme.textColorPrimary};
  background-color: ${(props) => props.theme.bgColorPrimary};
`;

const AutocompleteSpan = styled.span`
  color: ${(props) => props.theme.textColorPrimary};
`;
