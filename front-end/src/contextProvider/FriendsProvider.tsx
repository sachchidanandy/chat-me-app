import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import useFetch from "../hooks/useFetch";
import { useAuth } from "./AuthProvider";
import Loader from "../components/Loader";
import { iActionType } from "../types/common";
import { getMessageEncryptionSecret, getPrivateKey } from "../utils/encryptionKeys";
import { decryptMessage } from "../utils/messagesEncryption";
import socket from "../utils/socket";
import { iUploadFileMetaData } from "../hooks/useFileUpload";

export interface iFriendsDetail {
  id: string;
  name: string;
  pubKey: string;
  profilePicUrl: string;
  lastSeen: string;
  isOnline: boolean;
  valueToShow: string;
};

export interface iChatListFriends extends iFriendsDetail {
  lastMessage: string;
  lastChatTime: string;
  unSeenMessageCount: number;
}

interface iChatListResponse extends iFriendsDetail {
  lastMessage: {
    cipherText: string;
    nonce: string;
    timestamp: string;
    attachment: iUploadFileMetaData;
    status: string;
  }
}

export interface iPendingRequestType {
  requestId: string;
  senderName: string;
  senderProfilePic: string;
  senderUsername: string;
  sentAt: string;
};

export interface iFriendRequestResponse {
  pendingRequests: iPendingRequestType[];
  message: string;
};

export interface iFriendsContext {
  friends: iChatListFriends[];
  selectedFriends: iChatListFriends;
  friendRequests: iFriendRequestResponse;
  friendRequestLoading: boolean;
  setSelectedFriends: (id: string) => void;
  fetchingFriendLoading: boolean;
  chatListLoading: boolean;
  selectedFriendEncKey: string | null;
  selectedFriendOnlineStatus: string | null;
  getEncryptionKey: (id: string) => string | null;
  getOnlineStatus: (id: string) => string | null;
  triggerUpdateChatList: (updatedChatMessage: iChatListFriends, encryptionKeys: string, incrementUnreadMessages?: boolean) => void;
};

const FriendsContext = createContext<iFriendsContext>({} as iFriendsContext);

interface iSetChatList extends iActionType<iChatListFriends[]> {
  type: 'SET_CHAT_LIST';
}
interface iSetSelectedFriends extends iActionType<iChatListFriends> {
  type: 'SET_SELECTED_FRIENDS';
}
interface iSetFriendRequests extends iActionType<iFriendRequestResponse> {
  type: 'SET_FRIEND_REQUESTS';
}
interface iSetFriendsPubKeys extends iActionType<Map<string, string>> {
  type: 'SET_FRIENDS_SHARED_KEYS';
}

interface iSetFriendsOnlineStatus extends iActionType<Map<string, string>> {
  type: 'SET_FRIENDS_ONLINE_STATUS';
}

type friendsAction = iSetChatList | iSetSelectedFriends | iSetFriendRequests | iSetFriendsPubKeys | iSetFriendsOnlineStatus;
type stateType = {
  chatList: iChatListFriends[],
  selectedFriends: iChatListFriends,
  friendRequests: iFriendRequestResponse,
  friendsMessageEncKeyMap: Map<string, string> | null,
  friendsOnlineStatus: Map<string, string> | null,
}

const friendsReducer = (state: stateType, action: friendsAction) => {
  switch (action.type) {
    case 'SET_CHAT_LIST':
      return { ...state, chatList: action.payload };
    case 'SET_SELECTED_FRIENDS':
      return { ...state, selectedFriends: action.payload };
    case 'SET_FRIEND_REQUESTS':
      return { ...state, friendRequests: action.payload };
    case 'SET_FRIENDS_SHARED_KEYS':
      return { ...state, friendsMessageEncKeyMap: action.payload };
    case 'SET_FRIENDS_ONLINE_STATUS':
      return { ...state, friendsOnlineStatus: action.payload };
    default:
      return state;
  }
}

interface iFriendsProvider {
  children: React.ReactNode;
}

const FriendsProvider = ({ children }: iFriendsProvider) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(friendsReducer, {
    chatList: [] as iChatListFriends[],
    selectedFriends: {} as iChatListFriends,
    friendRequests: {} as iFriendRequestResponse,
    friendsMessageEncKeyMap: null,
    friendsOnlineStatus: null,
  });
  const { chatList, selectedFriends, friendRequests, friendsMessageEncKeyMap, friendsOnlineStatus } = state;
  console.log("=== OUT SIDE ====", chatList)
  const { loading, request: fetchFriendsKeyMap } = useFetch('/friend/all');
  const { loading: fetchingFriendLoading, request: searchFriendDetails } = useFetch('/friend/details');
  const { loading: friendRequestLoading, request: getFriendRequest } = useFetch('/friend/request');
  const { loading: chatListLoading, request: getChatList } = useFetch('/message/fetch-chat-list');

  const handleSelectFriend = async (id: string) => {
    const selectedFriend = chatList.find((friend: iChatListFriends) => friend.id === id);
    if (selectedFriend) {
      selectedFriend.unSeenMessageCount = 0;
      dispatch({ type: 'SET_SELECTED_FRIENDS', payload: { ...selectedFriend, valueToShow: friendsOnlineStatus?.get(id)! } });
      dispatch({ type: 'SET_CHAT_LIST', payload: [selectedFriend, ...chatList.filter((friend: iChatListFriends) => friend.id !== id)] });
    } else {
      const { data, error } = await searchFriendDetails({
        params: {
          id
        },
        method: 'GET',
      });

      if (data && !error && Object.keys(data.friendDetail).length) {
        const friendsDetail = { ...data.friendDetail, lastMessage: '', lastChatTime: Date.now().toString(), unSeenMessageCount: 0 } as iChatListFriends;

        if (!friendsMessageEncKeyMap?.has(friendsDetail.id)) {
          const newFriendsMessageEncKeyMap = new Map(friendsMessageEncKeyMap);
          const usersPriKey = getPrivateKey();
          newFriendsMessageEncKeyMap.set(friendsDetail.id, getMessageEncryptionSecret(friendsDetail.pubKey, usersPriKey!));

          dispatch({ type: 'SET_FRIENDS_SHARED_KEYS', payload: newFriendsMessageEncKeyMap });
        }

        const newFriendsOnlineStatus = new Map(friendsOnlineStatus);
        newFriendsOnlineStatus.set(friendsDetail.id, friendsDetail?.isOnline ? 'online' : friendsDetail?.lastSeen);
        dispatch({ type: 'SET_FRIENDS_ONLINE_STATUS', payload: newFriendsOnlineStatus });
        dispatch({ type: 'SET_SELECTED_FRIENDS', payload: friendsDetail });
        dispatch({ type: 'SET_CHAT_LIST', payload: [friendsDetail, ...chatList] });
      }
      if (error) console.log(error);
    }
  };

  const triggerUpdateChatList = useCallback((updatedChatMessage: iChatListFriends, encryptionKeys: string, incrementUnreadMessages: boolean = false) => {
    let newMessage = null;

    const newChatList = chatList.filter((friend: iChatListFriends) => {
      if (friend.id === updatedChatMessage.id) {
        newMessage = {
          ...friend,
          ...updatedChatMessage,
          ...(incrementUnreadMessages ? { unSeenMessageCount: friend.unSeenMessageCount + 1 } : {})
        };
        return false;
      }
      return true;
    });

    dispatch({ type: 'SET_CHAT_LIST', payload: [newMessage ? newMessage : { ...updatedChatMessage, unSeenMessageCount: 1 }, ...newChatList] });
    if (!friendsMessageEncKeyMap?.has(updatedChatMessage.id) && encryptionKeys) {
      const newFriendsMessageEncKeyMap = new Map(friendsMessageEncKeyMap);
      newFriendsMessageEncKeyMap.set(updatedChatMessage.id, encryptionKeys);

      dispatch({ type: 'SET_FRIENDS_SHARED_KEYS', payload: newFriendsMessageEncKeyMap });
    }
    if (!friendsOnlineStatus?.has(updatedChatMessage.id)) {
      const newFriendsOnlineStatus = new Map(friendsOnlineStatus);
      newFriendsOnlineStatus.set(updatedChatMessage.id, updatedChatMessage?.isOnline ? 'online' : updatedChatMessage?.lastSeen);
      dispatch({ type: 'SET_FRIENDS_ONLINE_STATUS', payload: newFriendsOnlineStatus });
    }
  }, [chatList, friendsMessageEncKeyMap, friendsOnlineStatus]);

  const fetchChatList = async () => {
    const { data, error } = await getChatList();
    const friendsOnlineStatusMap = new Map<string, string>();
    if (data && data?.chatList?.length) {

      const decodedChatList = data.chatList.reduce((acc: iChatListFriends[], chat: iChatListResponse) => {
        const { lastMessage: { cipherText, nonce, timestamp, attachment, status }, ...rest } = chat;
        if (friendsMessageEncKeyMap?.has(chat.id)) {
          const valueToShow = chat.isOnline ? 'online' : chat.lastSeen;
          acc.push({
            ...rest,
            lastMessage: cipherText && nonce ? decryptMessage(
              { cipherText, nonce }, friendsMessageEncKeyMap?.get(chat.id)!
            ) as string : attachment?.fileName || '',
            lastChatTime: timestamp,
            valueToShow,
            unSeenMessageCount: status === 'sent' ? 1 : 0,
          });
          friendsOnlineStatusMap.set(chat.id, valueToShow);
        }
        return acc;
      }, [] as iChatListFriends[]);
      dispatch({ type: 'SET_FRIENDS_ONLINE_STATUS', payload: friendsOnlineStatusMap });
      dispatch({ type: 'SET_CHAT_LIST', payload: decodedChatList });
    }
    if (error) console.log(error);
  };

  const fetchFriendsKeys = async () => {
    const { data, error } = await fetchFriendsKeyMap();
    if (data) {
      const friendsKeyMap = new Map<string, string>();
      const usersPriKey = getPrivateKey();
      for (const [id, pubKey] of data.friendsKeyMap) {
        friendsKeyMap.set(id, getMessageEncryptionSecret(pubKey, usersPriKey!));
      }
      dispatch({ type: 'SET_FRIENDS_SHARED_KEYS', payload: friendsKeyMap });
    }
    if (error) console.log(error);
  };

  const fetchFriendRequest = async () => {
    const { data, error } = await getFriendRequest();
    if (data) dispatch({ type: 'SET_FRIEND_REQUESTS', payload: data as iFriendRequestResponse });
    if (error) console.log(error);
  };

  const selectedFriendEncKey = useMemo(() => {
    if (friendsMessageEncKeyMap?.has(selectedFriends.id)) {
      return friendsMessageEncKeyMap?.get(selectedFriends.id) as string;
    }
    return null;
  }, [friendsMessageEncKeyMap, selectedFriends]);

  const selectedFriendOnlineStatus = useMemo(() => {
    if (friendsOnlineStatus?.has(selectedFriends.id)) {
      return friendsOnlineStatus?.get(selectedFriends.id) as string;
    }
    return null;
  }, [friendsOnlineStatus, selectedFriends]);

  useEffect(() => {
    if (user) {
      fetchFriendsKeys();
      fetchFriendRequest();
    }
  }, [user]);

  useEffect(() => {
    if (user && friendsMessageEncKeyMap?.size) {
      fetchChatList();
    }
  }, [friendsMessageEncKeyMap]);

  useEffect(() => {
    socket.on('user_status_update', (message) => {
      const { userId, status } = message;
      if (friendsOnlineStatus?.has(userId) && status !== friendsOnlineStatus.get(userId)) {
        const newFriendsOnlineStatus = new Map(friendsOnlineStatus);
        newFriendsOnlineStatus.set(userId, status === 'online' ? 'online' : new Date().toString());
        dispatch({ type: 'SET_FRIENDS_ONLINE_STATUS', payload: newFriendsOnlineStatus });
      }
    });
    return () => {
      socket.off('user_status_update');
    };
  }, [friendsOnlineStatus]);

  const getEncryptionKey = useCallback((id: string) => friendsMessageEncKeyMap?.get(id) || null, [friendsMessageEncKeyMap]);
  const getOnlineStatus = useCallback((id: string) => friendsOnlineStatus?.get(id) || null, [friendsOnlineStatus]);

  return (
    <FriendsContext.Provider value={{
      selectedFriends,
      friendRequests,
      friendRequestLoading,
      fetchingFriendLoading,
      chatListLoading,
      selectedFriendEncKey,
      selectedFriendOnlineStatus,
      getEncryptionKey,
      getOnlineStatus,
      triggerUpdateChatList,
      friends: chatList,
      setSelectedFriends: handleSelectFriend,
    }}>
      {loading ? <Loader /> : children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => (useContext(FriendsContext));

export default FriendsProvider;
