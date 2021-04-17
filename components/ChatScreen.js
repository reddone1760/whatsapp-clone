import { useAuthState } from "react-firebase-hooks/auth";
import styled, { css } from "styled-components";
import { auth, db } from "../firebase";
import { useRouter } from "next/router";
import { Avatar, IconButton } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import { useCollection } from "react-firebase-hooks/firestore";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import { useRef, useState } from "react";
import firebase from "firebase";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import Message from "./Message";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import VisibilitySensor from "react-visibility-sensor";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import { useEffect } from "react";
import ChatInfo from "./ChatInfo";

function ChatScreen({ chat, messages }) {
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const [scrollToBottomState, setScrollToBottomState] = useState(true);
  const endOfMessageRef = useRef(null);
  const router = useRouter();
  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );

  const [recipientSnapShot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat.users, user))
  );

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          id={message.id}
          user={message.data().user}
          status={message.data().status}
          chatId={chat.id}
          message={{
            ...message.data(),
            timestamp: message.data()?.timestamp?.toDate().getTime(),
          }}
          replyFuc={(message) => {
            setReplyMessage(message);
          }}
          replyMessage={message.data().replyMessage}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message
          key={message.id}
          id={message.id}
          chatId={chat.id}
          user={message.user}
          message={message}
          replyFuc={(message) => {
            setReplyMessage(message);
          }}
          replyMessage={message?.replyMessage}
        />
      ));
    }
  };

  const scrollToButton = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();

    db.collection("users").doc(user.uid).set(
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (replyMessage === null) {
      db.collection("chats").doc(router.query.id).collection("messages").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        message: input,
        user: user.email,
        photoURL: user.photoURL,
        status: "delivered",
        replyMessage: null,
      });
    } else {
      db.collection("chats").doc(router.query.id).collection("messages").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        message: input,
        user: user.email,
        photoURL: user.photoURL,
        status: "delivered",
        replyMessage: replyMessage,
      });
    }

    setInput("");
    scrollToButton();
    setReplyMessage(null);
  };

  const recipient = recipientSnapShot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(chat.users, user);

  useEffect(() => {
    scrollToButton();
  }, [router.query.id, JSON.parse(messages).length]);
  return (
    <>
      {showChatInfo ? (
        <ChatInfo
          goBack={() => {
            setShowChatInfo(false);
          }}
        />
      ) : (
        <Container>
          <Header>
            <HeaderLeft
              onClick={() => {
                setShowChatInfo(true);
              }}
            >
              {recipient ? (
                <Avatar src={recipient?.photoURL} />
              ) : (
                <Avatar>{recipientEmail[0]}</Avatar>
              )}
              <HeaderInfo>
                <h3>{recipientEmail}</h3>
                {recipientSnapShot ? (
                  <p>
                    Last active:{" "}
                    {recipient?.lastSeen?.toDate() ? (
                      <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                    ) : (
                      "Unavailable"
                    )}
                  </p>
                ) : (
                  <p>Loading Last active...</p>
                )}
              </HeaderInfo>
            </HeaderLeft>
            <HeaderRight>
              <HeaderIcons>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </HeaderIcons>
            </HeaderRight>
          </Header>

          <MessageContainer>
            {showMessages()}
            <VisibilitySensor
              onChange={(isVissible) => {
                setScrollToBottomState(isVissible);
              }}
            >
              <EndOfMessage ref={endOfMessageRef} />
            </VisibilitySensor>
            {!scrollToBottomState && (
              <ScrollToBottomBtn onClick={scrollToButton}>
                <ExpandMoreIcon />
              </ScrollToBottomBtn>
            )}
          </MessageContainer>

          <MessageInputContainer>
            {replyMessage && (
              <ReplayContainer>
                <ReplayMessageContainer
                  selfReply={replyMessage?.author === user.displayName}
                >
                  {replyMessage?.author === user.displayName
                    ? "Me"
                    : replyMessage?.author}
                  <ReplayMessage>{replyMessage?.message}</ReplayMessage>
                </ReplayMessageContainer>
                <CloseReplyButton>
                  <IconButton
                    onClick={() => {
                      setReplyMessage(null);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </CloseReplyButton>
              </ReplayContainer>
            )}

            <InputContainer>
              <IconButton>
                <InsertEmoticonIcon />
              </IconButton>
              <IconButton>
                <AttachFileIcon style={{ transform: "rotate(40deg)" }} />
              </IconButton>
              <Input
                autoFocus
                placeholder="Write a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                hidden
                type="submit"
                disabled={!input}
                onClick={sendMessage}
              >
                Send Message
              </button>

              {input !== "" ? (
                <IconButton>
                  <SendIcon type="submit" onClick={sendMessage} />
                </IconButton>
              ) : (
                <IconButton>
                  <MicIcon />
                </IconButton>
              )}
            </InputContainer>
          </MessageInputContainer>
        </Container>
      )}
    </>
  );
}

export default ChatScreen;

const Container = styled.div``;

const MessageInputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  position: sticky;
  bottom: 0;
  background-color: ${(props) => props.theme.bgColorSecondary};
  z-index: 100;

  .MuiSvgIcon-root {
    color: ${(props) => props.theme.iconColor};
  }
`;

const InputContainer = styled.form`
  display: flex;
  align-items: flex-end;
  padding: 10px;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  outline: 0;
  border: none;
  padding: 16px;
  border-radius: 40px;
  background-color: ${(props) => props.theme.bgColorPrimary};
  color: ${(props) => props.theme.textColorPrimary};
  margin-left: 15px;
  margin-right: 15px;
  font-size: 18px;

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

const Header = styled.div`
  position: sticky;
  background-color: ${(props) => props.theme.bgColorPrimary};
  z-index: 100;
  top: 0;
  display: flex;
  padding: 11px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
`;

const HeaderInfo = styled.div`
  margin-left: 15px;
  flex: 1;

  > h3 {
    margin-bottom: -12px;
    color: ${(props) => props.theme.textColorPrimary};
  }

  > p {
    font-size: 14px;
    color: ${(props) => props.theme.textColorSecondary};
  }
`;

const HeaderIcons = styled.div`
  .MuiSvgIcon-root {
    color: ${(props) => props.theme.iconColor};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  cursor: pointer;
`;

const HeaderRight = styled.div`
  display: flex;
`;

const MessageContainer = styled.div`
  padding: 30px;
  position: relative;
  background-color: ${(props) => props.theme.bgChat};
  min-height: calc(90vh - 50px);
`;

const EndOfMessage = styled.div`
  height: 50px;
  width: 100%;
`;

const ScrollToBottomBtn = styled.div`
  position: fixed;
  bottom: 100px;
  right: 16px;
  background-color: ${(props) => props.theme.bgColorPrimary};
  border-radius: 80px;
  height: 40px;
  width: 40px;

  display: flex;
  align-items: center;
  padding-top: 4px;
  justify-content: center;

  > .MuiSvgIcon-root {
    font-size: 34px;
    color: ${(props) => props.theme.iconColor};
  }
`;

const ReplayContainer = styled.div`
  position: sticky;
  right: 0;
  background-color: ${(props) => props.theme.bgColorSecondary};
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const CloseReplyButton = styled.div`
  height: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
`;

const ReplayMessageContainer = styled.div`
  width: 80%;
  background-color: ${(props) => props.theme.bgColorPrimary};
  padding: 16px;
  border-radius: 6px;
  border-left: ${(props) => props.theme.replyRecipient} solid 6px;
  color: ${(props) => props.theme.replyRecipient};

  ${({ selfReply }) =>
    selfReply &&
    css`
      border-left: ${(props) => props.theme.replySelf} solid 6px;
      color: ${(props) => props.theme.replySelf};
    `}
`;

const ReplayMessage = styled.div`
  word-wrap: break-word;
  color: ${(props) => props.theme.textColorPrimary};
`;
