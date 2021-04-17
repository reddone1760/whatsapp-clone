import { Avatar } from "@material-ui/core";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled, { css } from "styled-components";
import { auth, db } from "../firebase";
import getRecipientEmail from "../utils/getRecipientEmail";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import moment from "moment";
import { useDispatch } from "react-redux";
import { enterChat } from "../app/features/chatSlice";
import DoneAllIcon from "@material-ui/icons/DoneAll";

function Chat({ id, users, userNames }) {
  const dispatch = useDispatch();

  const router = useRouter();

  const [user] = useAuthState(auth);
  const [recipientSnapShot] = useCollection(
    db.collection("users").where("email", "==", getRecipientEmail(users, user))
  );

  const [newMessages] = useCollection(
    db
      .collection("chats")
      .doc(id)
      .collection("messages")
      .where("status", "==", "delivered")
  );

  const enterChatFuc = () => {
    dispatch(
      enterChat({
        chatId: id,
      })
    );
    router.push(`/chat/${id}`);
  };

  const recipient = recipientSnapShot?.docs?.[0]?.data();
  const recipientEmail = getRecipientEmail(users, user);
  const recipientInformations = userNames?.filter(
    ({ email }) => email === recipientEmail
  );

  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );

  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    setLastMessage(
      messagesSnapshot?.docs[messagesSnapshot?.docs?.length - 1]?.data()
    );
  }, [messagesSnapshot]);

  const lastMessageTime = () => {
    let d = new Date();

    let toDay = d.getDate();
    let time = lastMessage?.timestamp?.toDate().toString();

    let getDay = time?.split(" ")[2];
    if (toDay - getDay == 0) {
      return (
        <Timestamp>
          {moment(lastMessage?.timestamp?.toDate()).format("HH:mm")}
        </Timestamp>
      );
    } else if (toDay - getDay == 1) {
      return <Timestamp>Yesterday</Timestamp>;
    } else if (toDay - getDay >= 2 && toDay - getDay <= 7) {
      return (
        <Timestamp>
          {moment(lastMessage?.timestamp?.toDate()).format("dddd")}
        </Timestamp>
      );
    } else {
      return (
        <Timestamp>
          {moment(lastMessage?.timestamp?.toDate()).locale("de").format("l")}
        </Timestamp>
      );
    }
  };

  return (
    <Container onClick={enterChatFuc} active={router.query.id === id}>
      {recipient ? (
        <UserAvatar src={recipient?.photoUrl} />
      ) : (
        <UserAvatar>{recipientEmail[0].toUpperCase()}</UserAvatar>
      )}
      <InformationContainer>
        {lastMessageTime()}
        {lastMessage?.user !== user.email && newMessages?.docs?.length > 0 && (
          <NewMessagesContainer>
            {newMessages?.docs?.length}
          </NewMessagesContainer>
        )}
        <p className="chat__name">{recipientInformations[0]?.name}</p>
        <LastMessageContainer readed={lastMessage?.status === "read"}>
          {lastMessage?.user === user.email && <DoneAllIcon />}
          {lastMessage?.message}
        </LastMessageContainer>
      </InformationContainer>
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-word;
  border-bottom: 1px solid ${(props) => props.theme.borderColor};

  ${({ active }) =>
    active &&
    css`
      background-color: ${(props) => props.theme.bgColorActive};
    `}

  :hover {
    background-color: ${(props) => props.theme.hoverPrimary};
  }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;

const InformationContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;

  > p {
    margin: 0;
    padding: 0;
    color: ${(props) => props.theme.textColorSecondary};
  }

  > .chat__name {
    color: ${(props) => props.theme.textColorPrimary};
    font-size: 15px;
  }
`;

const Timestamp = styled.span`
  color: ${(props) => props.theme.textColorSecondary};
  font-size: 14px;
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;

  > .MuiSvgIcon-root {
    font-size: 16px;
    margin-right: 4px;

    ${({ readed }) =>
      readed &&
      css`
        color: ${(props) => props.theme.checkedReaded};
      `}
  }
`;

const LastMessageContainer = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  > .MuiSvgIcon-root {
    margin: 0;
    padding: 0;
    font-size: 14px;
    margin-right: 4px;

    ${({ readed }) =>
      readed &&
      css`
        color: ${(props) => props.theme.checkedReaded};
      `}
  }
`;

const NewMessagesContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #2ee618;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  padding: 0 6px;

  font-size: 14px;
  color: #ffffff;
`;
