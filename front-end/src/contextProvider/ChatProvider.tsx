import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { iChatListFriends, useFriends } from "./FriendsProvider";
import { useAuth } from "./AuthProvider";
import { decryptMessage, encryptMessage } from "../utils/messagesEncryption";
import socket from "../utils/socket";
import useFetch from "../hooks/useFetch";
import { iUploadFileMetaData } from "../hooks/useFileUpload";
import { getMessageEncryptionSecret, getPrivateKey } from "../utils/encryptionKeys";

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
  triggerUserTypingEvent: () => void;
  triggerUserStopTypingEvent: () => void;
};

const ChatContext = createContext({} as iChatContext);

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedFriends: { id }, selectedFriendEncKey, getEncryptionKey, triggerUpdateChatList, getOnlineStatus } = useFriends();
  const { user } = useAuth();
  const pageMap = useRef<Map<string, number>>(new Map());
  const [hasMore, setHasMore] = useState(false);
  const messagesMap = useRef<Map<string, iMessage[]>>(new Map());
  const [messages, setMessages] = useState<iMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const { loading: loadingMessages, request: getMessages } = useFetch(`/message/${id}`);
  const { request: fetchSpecificFriendDetail } = useFetch('/friend/details');

  const fetchFriendDetailFromServer = async (friendId: string, encryptionKeys: string): Promise<{ friendsDetail: iChatListFriends, sharedEncryptionKey: string } | null> => {
    const { data, error } = await fetchSpecificFriendDetail({ params: { id: friendId } });
    if (data && !error && Object.keys(data.friendDetail).length) {
      const friendsDetail = { ...data.friendDetail, lastMessage: '', lastChatTime: Date.now().toString() } as iChatListFriends;
      const sharedEncryptionKey = encryptionKeys || getMessageEncryptionSecret(friendsDetail.pubKey, getPrivateKey()!);
      return {
        friendsDetail,
        sharedEncryptionKey
      }
    }

    return null;
  }

  const sendMessage = (messages: string, fileMetaData: iUploadFileMetaData | null, file: File | null = null) => {
    // Encrypt message
    const { cipherText, nonce } = messages ? encryptMessage(
      messages, selectedFriendEncKey || ''
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
    triggerUpdateChatList(
      { id, lastMessage: messages || fileMetaData?.fileName || '', lastChatTime: Date.now().toString() } as iChatListFriends,
      ''
    );
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleRecieveMessages = useCallback(async (messagePayload: iMessagePayload) => {
    const { cipherText, nonce, ...rest } = messagePayload;
    let encryptionKeys = rest.senderId === id ? selectedFriendEncKey : getEncryptionKey(rest.senderId);
    // Check if chatlist have user or not
    let chatListHaveUser = getOnlineStatus(rest.senderId) ? { id: rest.senderId } as iChatListFriends : null;

    // Check if encryptin key and friend details exists else fetch from server
    if (!encryptionKeys || !chatListHaveUser) {
      const friendsDetailWithKey = await fetchFriendDetailFromServer(rest.senderId, encryptionKeys || '');
      if (!friendsDetailWithKey) return;
      const { friendsDetail, sharedEncryptionKey } = friendsDetailWithKey;
      chatListHaveUser = friendsDetail;
      encryptionKeys = sharedEncryptionKey;
    }

    // Decrypt cipherText
    const message: iMessage = {
      ...rest,
      msg: cipherText ? decryptMessage({ cipherText, nonce }, encryptionKeys || '')! : '',
    };

    messagesMap.current.set(rest.senderId, [...messagesMap.current.get(rest.senderId) || [], message]);
    chatListHaveUser.lastMessage = message.msg || message?.attachment?.fileName || '';
    triggerUpdateChatList(chatListHaveUser, encryptionKeys, !(rest.senderId === id));
    rest.senderId === id && setMessages((prevMessages) => [...prevMessages, message]);
  }, [id, user?.userId, selectedFriendEncKey, triggerUpdateChatList]);

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
          const msg = cipherText ? decryptMessage({ cipherText, nonce }, selectedFriendEncKey || '') : '';
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

  const triggerUserTypingEvent = () => {
    socket.emit('typing', { senderId: user?.userId || '', recipientId: id });
  };

  const triggerUserStopTypingEvent = () => {
    socket.emit('stop_typing', { senderId: user?.userId || '', recipientId: id });
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
      value={{ messages, sendMessage, typing, loadingMessages, fetchMessages, hasMore, triggerUserTypingEvent, triggerUserStopTypingEvent }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => (useContext(ChatContext));
export default ChatProvider;
