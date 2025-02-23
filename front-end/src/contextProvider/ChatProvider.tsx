import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useFriends } from "./FriendsProvider";
import { useAuth } from "./AuthProvider";
import { decryptMessage, encryptMessage } from "../utils/messages";
import socket from "../utils/socket";
import useFetch from "../hooks/useFetch";

export interface iMessage {
  id: string;
  msg: string;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  status: string;
};

export interface iMessagePayload extends Omit<iMessage, 'msg'> {
  cipherText: string;
  nonce: string;
}

export interface iChatContext {
  messages: iMessage[];
  sendMessage: (messages: string) => void;
  typing: boolean;
  loadingMessages: boolean;
  fetchMessages: (limit?: number) => void;
};

const ChatContext = createContext({} as iChatContext);

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedFriends: { id }, friendsMessageEncKeyMap } = useFriends();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const messagesMap = useRef<Map<string, iMessage[]>>(new Map());
  const [messages, setMessages] = useState<iMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const { loading: loadingMessages, request: getMessages } = useFetch(`/message/${id}`);

  const sendMessage = (messages: string) => {
    // Encrypt message
    const { cipherText, nonce } = encryptMessage(messages, friendsMessageEncKeyMap?.get(id) || '');
    const message: iMessage = {
      id: Date.now().toString(),
      msg: messages,
      senderId: user?.userId || '',
      recipientId: id,
      timestamp: new Date(),
      status: 'sent',
    };

    // Create payload
    const messagePayload: iMessagePayload = (({ msg, ...rest }) => ({
      ...rest,
      cipherText,
      nonce,
    }))(message);

    socket.emit('send_message', messagePayload);
    messagesMap.current.set(id, [...messagesMap.current.get(id) || [], message]);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleRecieveMessages = (messagePayload: iMessagePayload) => {
    const { senderId, recipientId, timestamp, status, cipherText, nonce } = messagePayload;
    // Decrypt cipherText
    const message: iMessage = {
      id: Date.now().toString(),
      senderId,
      recipientId,
      timestamp: new Date(timestamp),
      status,
      msg: decryptMessage({ cipherText, nonce }, friendsMessageEncKeyMap?.get(id) || '')!,
    };

    socket.emit('mark_as_read', { senderId: user?.userId || '', recipientId: id });
    messagesMap.current.set(id, [...messagesMap.current.get(id) || [], message]);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const fetchMessages = async (limit: number = 50) => {
    const { data, error } = await getMessages({
      params: {
        page,
        limit
      }
    });
    if (data) {
      const { messages: fetchedMessages } = data;
      if (fetchedMessages.length) {
        const decodedMessages = fetchedMessages.map((message: iMessagePayload) => {
          const { id, senderId, recipientId, timestamp, status, cipherText, nonce } = message;
          const msg = decryptMessage({ cipherText, nonce }, friendsMessageEncKeyMap?.get(id) || '')!;
          return { id, senderId, recipientId, timestamp, status, msg } as iMessage;
        });
        messagesMap.current.set(id, [...decodedMessages]);
      } else {
        messagesMap.current.set(id, []);
      }
      setMessages(messagesMap.current.get(id) || []);
      setPage(page + 1);
    }
    if (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id && user?.userId) {
      if (messagesMap.current.has(id)) {
        setMessages(messagesMap.current.get(id) || []);
      } else {
        fetchMessages();
      }
      setPage(1);
    }
  }, [id, user]);

  useEffect(() => {
    socket.on('new_message', handleRecieveMessages);
    socket.on('user_typing', () => setTyping(true));
    socket.on('user_stop_typing', () => setTyping(false));
    () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, typing, loadingMessages, fetchMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => (useContext(ChatContext));
export default ChatProvider;
