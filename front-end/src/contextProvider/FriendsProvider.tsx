import { createContext, useContext, useEffect, useReducer } from "react";
import useFetch from "../hooks/useFetch";
import { useAuth } from "./AuthProvider";
import Loader from "../components/Loader";
import { iActionType } from "../types/common";
import { getMessageEncryptionSecret, getPrivateKey } from "../utils/encryptionKeys";
import { decryptMessage } from "../utils/messagesEncryption";

export interface iFriendsDetail {
  id: string;
  name: string;
  pubKey: string;
  profilePicUrl: string;
};

export interface iChatListFriends extends iFriendsDetail {
  lastMessage: string;
  lastChatTime: string;
}

interface iChatListResponse extends iFriendsDetail {
  lastMessage: {
    cipherText: string;
    nonce: string;
    timestamp: string;
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
  friendsMessageEncKeyMap: Map<string, string> | null;
  fetchingFriendLoading: boolean;
  chatListLoading: boolean;
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
  type: 'SET_FRIENDS_PUB_KEYS';
}

type friendsAction = iSetChatList | iSetSelectedFriends | iSetFriendRequests | iSetFriendsPubKeys;
type stateType = {
  chatList: iChatListFriends[],
  selectedFriends: iChatListFriends,
  friendRequests: iFriendRequestResponse,
  friendsMessageEncKeyMap: Map<string, string> | null,
}

const friendsReducer = (state: stateType, action: friendsAction) => {
  switch (action.type) {
    case 'SET_CHAT_LIST':
      return { ...state, chatList: action.payload };
    case 'SET_SELECTED_FRIENDS':
      return { ...state, selectedFriends: action.payload };
    case 'SET_FRIEND_REQUESTS':
      return { ...state, friendRequests: action.payload };
    case 'SET_FRIENDS_PUB_KEYS':
      return { ...state, friendsMessageEncKeyMap: action.payload };
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
  });
  const { loading, request: fetchFriendsKeyMap } = useFetch('/friend/all');
  const { loading: fetchingFriendLoading, request: searchFriendDetails } = useFetch('/friend/details');
  const { loading: friendRequestLoading, request: getFriendRequest } = useFetch('/friend/request');
  const { loading: chatListLoading, request: getChatList } = useFetch('/message/fetch-chat-list');

  const handleSelectFriend = async (id: string) => {
    const selectedFriend = state.chatList.find((friend: iChatListFriends) => friend.id === id);
    if (selectedFriend) {
      dispatch({ type: 'SET_SELECTED_FRIENDS', payload: selectedFriend });
    } else {
      const { data, error } = await searchFriendDetails({
        params: {
          id
        },
        method: 'GET',
      });
      if (data && !error && data.friendDetail.length) {
        const friendsDetail = { ...data.friendDetail[0], lastMessage: '', lastChatTime: Date.now().toString() } as iChatListFriends;

        if (!state.friendsMessageEncKeyMap?.has(friendsDetail.id)) {
          const newFriendsMessageEncKeyMap = new Map(state.friendsMessageEncKeyMap);
          const usersPriKey = getPrivateKey();
          newFriendsMessageEncKeyMap.set(friendsDetail.id, getMessageEncryptionSecret(friendsDetail.pubKey, usersPriKey!));
          dispatch({ type: 'SET_FRIENDS_PUB_KEYS', payload: newFriendsMessageEncKeyMap });
        }
        dispatch({ type: 'SET_SELECTED_FRIENDS', payload: friendsDetail });
        dispatch({ type: 'SET_CHAT_LIST', payload: [friendsDetail, ...state.chatList] });
      }
      if (error) console.log(error);
    }
  };

  const fetchChatList = async () => {
    const { data, error } = await getChatList();
    if (data && data?.chatList?.length) {
      const decodedChatList = data.chatList.reduce((acc: iChatListFriends[], chat: iChatListResponse) => {
        const { lastMessage: { cipherText, nonce, timestamp }, ...rest } = chat;
        if (state?.friendsMessageEncKeyMap?.has(chat.id)) {
          acc.push({
            ...rest,
            lastMessage: decryptMessage(
              { cipherText, nonce }, state?.friendsMessageEncKeyMap?.get(chat.id)!
            ) as string,
            lastChatTime: timestamp,
          });
        }
        return acc;
      }, [] as iChatListFriends[]);

      dispatch({ type: 'SET_CHAT_LIST', payload: decodedChatList });
    }
    if (error) console.log(error);
  };

  const fetchFriendsKeys = async () => {
    const { data, error } = await fetchFriendsKeyMap();
    if (data) {
      const friendsKeyMap = new Map();
      const usersPriKey = getPrivateKey();
      for (const [id, pubKey] of data.friendsKeyMap) {
        friendsKeyMap.set(id, getMessageEncryptionSecret(pubKey, usersPriKey!));
      }
      dispatch({ type: 'SET_FRIENDS_PUB_KEYS', payload: friendsKeyMap });
    }
    if (error) console.log(error);
  };

  const fetchFriendRequest = async () => {
    const { data, error } = await getFriendRequest();
    if (data) dispatch({ type: 'SET_FRIEND_REQUESTS', payload: data as iFriendRequestResponse });
    if (error) console.log(error);
  };

  useEffect(() => {
    if (user) {
      fetchFriendsKeys();
      fetchFriendRequest();
    }
  }, [user]);

  useEffect(() => {
    if (user && state?.friendsMessageEncKeyMap?.size) {
      fetchChatList();
    }
  }, [state.friendsMessageEncKeyMap]);

  const { chatList, selectedFriends, friendRequests, friendsMessageEncKeyMap } = state;
  return (
    <FriendsContext.Provider value={{
      friendsMessageEncKeyMap,
      friends: chatList,
      selectedFriends,
      friendRequests,
      friendRequestLoading,
      fetchingFriendLoading,
      chatListLoading,
      setSelectedFriends: handleSelectFriend
    }}>
      {loading ? <Loader /> : children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => (useContext(FriendsContext));

export default FriendsProvider;
