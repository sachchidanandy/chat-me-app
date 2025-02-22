import { createContext, useContext, useEffect, useReducer } from "react";
import useFetch from "../hooks/useFetch";
import { useAuth } from "./AuthProvider";
import { mockFriendsList } from "./mock";
import Loader from "../components/Loader";
import { iActionType } from "../types/common";

export interface iFriendsDetail {
  id: string;
  name: string;
  pubKey: string;
  profilePicUrl: string;
  lastMessage?: string;
  lastChatTime?: string;
};

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
  friends: iFriendsDetail[];
  selectedFriends: iFriendsDetail;
  friendRequests: iFriendRequestResponse;
  friendRequestLoading: boolean;
  setSelectedFriends: (id: string) => void;
  friendsPubKeyMap: Map<string, string> | null;
};

const FriendsContext = createContext<iFriendsContext>({} as iFriendsContext);

interface iSetChatList extends iActionType<iFriendsDetail[]> {
  type: 'SET_CHAT_LIST';
}
interface iSetSelectedFriends extends iActionType<iFriendsDetail> {
  type: 'SET_SELECTED_FRIENDS';
}
interface iSetFriendRequests extends iActionType<iFriendRequestResponse> {
  type: 'SET_FRIEND_REQUESTS';
}
interface iSetFriendsPubKeys extends iActionType<[string, string][]> {
  type: 'SET_FRIENDS_PUB_KEYS';
}

type friendsAction = iSetChatList | iSetSelectedFriends | iSetFriendRequests | iSetFriendsPubKeys;
type stateType = {
  chatList: iFriendsDetail[],
  selectedFriends: iFriendsDetail,
  friendRequests: iFriendRequestResponse,
  friendsPubKeyMap: Map<string, string> | null,
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
      const friendsPubKeyMap = new Map<string, string>(action.payload);
      return { ...state, friendsPubKeyMap };
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
    chatList: mockFriendsList,
    selectedFriends: { id: '', name: '', pubKey: '', profilePicUrl: '' },
    friendRequests: {} as iFriendRequestResponse,
    friendsPubKeyMap: null,
  });
  const { loading, request: fetchFriendsKeyMap } = useFetch('/friend/all');
  const { loading: friendRequestLoading, request: getFriendRequest } = useFetch('/friend/request');

  const handleSelectFriend = (id: string) => {
    const selectedFriend = state.chatList.find((friend: iFriendsDetail) => friend.id === id);
    if (selectedFriend) {
      dispatch({ type: 'SET_SELECTED_FRIENDS', payload: selectedFriend });
    }
  };

  const fetchFriendsKeys = async () => {
    const { data, error } = await fetchFriendsKeyMap();
    if (data) dispatch({ type: 'SET_FRIENDS_PUB_KEYS', payload: data.friendsKeyMap });
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
      fetchFriendRequest()
    }
  }, [user]);

  const { chatList, selectedFriends, friendRequests, friendsPubKeyMap } = state;
  return (
    <FriendsContext.Provider value={{
      friendsPubKeyMap,
      friends: chatList,
      selectedFriends,
      friendRequests,
      friendRequestLoading,
      setSelectedFriends: handleSelectFriend
    }}>
      {loading ? <Loader /> : children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => (useContext(FriendsContext));

export default FriendsProvider;