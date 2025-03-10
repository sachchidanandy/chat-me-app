import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFriends } from "./FriendsProvider";
import { useAuth } from "./AuthProvider";
import { decryptMessage, encryptMessage } from "../utils/messagesEncryption";
import socket from "../utils/socket";
import useFetch from "../hooks/useFetch";
import { iUploadFileMetaData } from "../hooks/useFileUpload";

export interface iMessage {
  id: string;
  msg: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  status: string;
  file?: File | null;
  attachment: iUploadFileMetaData | null
};

export interface iMessagePayload extends Omit<iMessage, 'msg' | 'file'> {
  cipherText: string;
  nonce: string;
}

export interface iChatContext {
  typing: boolean;
  loadingMessages: boolean;
  hasMore: boolean;
  messages: iMessage[];
  fetchMessages: (limit?: number) => void;
  sendMessage: (messages: string, fileMetaData: iUploadFileMetaData | null, file: File | null) => void;
};

const ChatContext = createContext({} as iChatContext);

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedFriends: { id }, friendsMessageEncKeyMap } = useFriends();
  const { user } = useAuth();
  const pageMap = useRef<Map<string, number>>(new Map());
  const [hasMore, setHasMore] = useState(false);
  const messagesMap = useRef<Map<string, iMessage[]>>(new Map());
  const [messages, setMessages] = useState<iMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const { loading: loadingMessages, request: getMessages } = useFetch(`/message/${id}`);

  const sendMessage = (messages: string, fileMetaData: iUploadFileMetaData | null, file: File | null = null) => {
    // Encrypt message
    const { cipherText, nonce } = messages ? encryptMessage(
      messages, friendsMessageEncKeyMap?.get(id) || ''
    ) : { cipherText: '', nonce: '' };

    const message: iMessage = {
      id: Date.now().toString(),
      msg: messages,
      senderId: user?.userId || '',
      recipientId: id,
      timestamp: new Date().toString(),
      file,
      status: 'sent',
      attachment: fileMetaData
    };

    // Create payload
    const messagePayload: iMessagePayload = (({ msg, file, ...rest }) => ({
      ...rest,
      cipherText,
      nonce,
    }))(message);

    socket.emit('send_message', messagePayload);
    messagesMap.current.set(id, [...messagesMap.current.get(id) || [], message]);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleRecieveMessages = useCallback((messagePayload: iMessagePayload) => {
    const { cipherText, nonce, ...rest } = messagePayload;

    // Decrypt cipherText
    const message: iMessage = {
      ...rest,
      msg: cipherText ? decryptMessage({ cipherText, nonce }, friendsMessageEncKeyMap?.get(id) || '')! : '',
    };

    socket.emit('mark_as_read', { senderId: user?.userId || '', recipientId: id });
    messagesMap.current.set(id, [...messagesMap.current.get(id) || [], message]);
    setMessages((prevMessages) => [...prevMessages, message]);
  }, [id, user?.userId, friendsMessageEncKeyMap]);

  const fetchMessages = async (limit: number = 50) => {
    const page = pageMap.current.get(id) || 1;
    const { data, error } = await getMessages({
      params: {
        page: page,
        limit
      }
    });
    if (data) {
      const { messages: fetchedMessages } = data;
      if (fetchedMessages) {
        const reverseMessages = fetchedMessages.slice().reverse();
        const decodedMessages = reverseMessages.map((message: iMessagePayload) => {
          const { cipherText, nonce, ...rest } = message;
          const msg = cipherText ? decryptMessage({ cipherText, nonce }, friendsMessageEncKeyMap?.get(id) || '') : '';
          return { msg, ...rest } as iMessage;
        });

        messagesMap.current.set(id, [...decodedMessages, ...(messagesMap.current.get(id) || [])]);
      }

      setMessages(messagesMap.current.get(id) || []);
      pageMap.current.set(id, page + 1);
      if (page === 1) {
        setTimeout(() => setHasMore(fetchedMessages.length === limit), 500);
      } else {
        setHasMore(fetchedMessages.length === limit);
      }
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
        pageMap.current.set(id, 1);
        fetchMessages();
      }
    }
  }, [id, user]);

  useEffect(() => {
    socket.on('new_message', handleRecieveMessages);
    socket.on('user_typing', () => setTyping(true));
    socket.on('user_stop_typing', () => setTyping(false));
    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    }
  }, [handleRecieveMessages]);

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, typing, loadingMessages, fetchMessages, hasMore }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => (useContext(ChatContext));
export default ChatProvider;
