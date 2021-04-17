import { useAuthState } from "react-firebase-hooks/auth";
import styled, { css } from "styled-components";
import { auth, db } from "../firebase";
import moment from "moment";
import VisibilitySensor from "react-visibility-sensor";
import { useState } from "react";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import Menu from "@material-ui/core/Menu";
import { IconButton } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { motion } from "framer-motion";

function Message({
  id,
  status,
  user,
  chatId,
  message,
  replyFuc,
  replyMessage,
}) {
  const [messageSeen, setMessageSeen] = useState(false);
  const [userLoggedIn] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageMenu, setMessageMenu] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [chatUsers, setChatUsers] = useState("");

  db.collection("chats")
    .doc(chatId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        setChatUsers(doc.data().names);
      }
    });

  const messageAuthorName = Object.values(chatUsers)?.filter(
    (singelUser) => singelUser.email === user
  );

  if (messageSeen === true && user !== userLoggedIn.email) {
    db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc(id)
      .update({ status: "read" });
  }

  const deleteMessage = () => {
    db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc(id)
      .update({ delete: "delete" });
  };

  const deletePermaMessage = () => {
    db.collection("chats").doc(chatId).collection("messages").doc(id).delete();
  };

  const undoDeleteMessage = () => {
    db.collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc(id)
      .update({ delete: "not-delete" });
  };

  const TypeOfMessage = user === userLoggedIn.email ? Sender : Reciever;

  const MesssageReturnFunction = (message) => {
    if (message.startsWith("https://")) {
      return (
        <span>
          <Link href={message} target="_blank">
            {message}
          </Link>
        </span>
      );
    }
    return <span>{message}</span>;
  };

  return (
    <motion.div
      initial={{ scale: 0.2 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <VisibilitySensor
        onChange={(isVissible) => {
          setMessageSeen(isVissible);
        }}
      >
        <TypeOfMessage
          onMouseEnter={() => {
            setMessageMenu(true);
          }}
          onMouseLeave={() => {
            setMessageMenu(false);
          }}
        >
          {replyMessage && (
            <ReviewReplyMessageContainer
              self={replyMessage?.author === userLoggedIn.displayName}
            >
              {replyMessage?.author === userLoggedIn.displayName
                ? "Me"
                : replyMessage?.author}
              <ReviewReplyMessageMessage>
                {replyMessage?.message}
              </ReviewReplyMessageMessage>
            </ReviewReplyMessageContainer>
          )}
          {messageMenu && (
            <>
              <IconButton onClick={handleClick}>
                <ExpandMoreIcon />
              </IconButton>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user === userLoggedIn.email ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose(),
                          replyFuc({
                            message: message.message,
                            author: messageAuthorName[0].name,
                          });
                      }}
                    >
                      Reply
                    </MenuItem>
                    <MenuItem onClick={handleClose}>Hand of Message</MenuItem>
                    <MenuItem onClick={handleClose}>Mark Message</MenuItem>
                    {message.delete === "delete" ? (
                      <>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            undoDeleteMessage();
                          }}
                        >
                          Undo Deleting Message
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            deletePermaMessage();
                          }}
                        >
                          Delete Permanently Message
                        </MenuItem>
                      </>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          deleteMessage();
                        }}
                      >
                        Delete Message
                      </MenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose(),
                          replyFuc({
                            message: message.message,
                            author: messageAuthorName[0].name,
                          });
                      }}
                    >
                      Reply
                    </MenuItem>
                    <MenuItem onClick={handleClose}>Hand of Message</MenuItem>
                    <MenuItem onClick={handleClose}>Mark Message</MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}
          <SelfMessage>
            {message.delete === "delete" ? (
              <MessageParagraph deleted>Message Deleted</MessageParagraph>
            ) : (
              <MessageParagraph>
                {MesssageReturnFunction(message.message)}
              </MessageParagraph>
            )}
            <Timestamp readed={status === "read"}>
              {user === userLoggedIn.email && message.delete !== "delete" && (
                <DoneAllIcon />
              )}
              {message.timestamp
                ? moment(message.timestamp).format("HH:mm")
                : "..."}
            </Timestamp>
          </SelfMessage>
        </TypeOfMessage>
      </VisibilitySensor>
    </motion.div>
  );
}

export default Message;

// const MessageContainer = styled.div`
//   transform: scale(0.8);
// `;

const MessageElement = styled.p`
  width: fit-content;
  border-radius: 8px;
  margin: 4px;
  max-width: 60%;
  word-wrap: break-word;
  text-align: left;
  padding: 4px;
  min-width: 60px;
  position: relative;

  > .MuiIconButton-root {
    position: absolute;
    top: 6px;
    right: 8px;
    height: 20px;
    width: 20px;
    cursor: pointer;
    font-size: 22px;
    color: ${(props) => props.theme.textColorSecondary};
  }
`;

const MessageParagraph = styled.span`
  color: ${(props) => props.theme.textColorPrimary};
  ${({ deleted }) =>
    deleted &&
    css`
      color: ${(props) => props.theme.textColorSecondary};
    `}

  ::after {
    content: "";
    padding: 0 20px;
  }
`;

const SelfMessage = styled.div`
  width: 100%;
  padding: 8px 0px 8px 10px;
  margin-right: 30px;
`;

const Sender = styled(MessageElement)`
  margin-left: auto;
  background-color: ${(props) => props.theme.messageSelf};
`;

const Reciever = styled(MessageElement)`
  background-color: ${(props) => props.theme.messageRecipient};
  text-align: left;
`;

const Timestamp = styled.span`
  display: flex;
  align-items: center;
  color: gray;
  padding: 10px;
  font-size: 9px;
  position: absolute;
  bottom: 0;
  text-align: right;
  right: 0;

  > .MuiSvgIcon-root {
    font-size: 14px;
    margin-right: 4px;

    ${({ readed }) =>
      readed &&
      css`
        color: ${(props) => props.theme.checkedReaded};
      `}
  }
`;

const ReviewReplyMessageContainer = styled.div`
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  border-left: solid ${(props) => props.theme.replyRecipient} 4px;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 8px;
  color: ${(props) => props.theme.replyRecipient};

  ${({ self }) =>
    self &&
    css`
      color: ${(props) => props.theme.replySelf};
      border-left: solid ${(props) => props.theme.replySelf} 4px;
    `}
`;

const ReviewReplyMessageMessage = styled.p`
  color: ${(props) => props.theme.textColorSecondary};
  margin: 0;
  padding: 0;
`;

const Link = styled.a`
  color: ${(props) => props.theme.textColorLink};

  :hover {
    text-decoration: underline;
  }
`;
