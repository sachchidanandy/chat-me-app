import { createContext, useEffect, useReducer } from "react";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";

export interface iFriendsDetail {
  id: string,
  name: string,
  pubKey: string,
  profilePicUrl: string,
};

export interface iFriendsContext {
  friends: iFriendsDetail[],
  selectedFriends: iFriendsDetail,
  setSelectedFriends: (id: string) => void,
};

export const FriendsContext = createContext<iFriendsContext>({} as iFriendsContext);

type actionType = {
  type: string,
  payload: any
}

type stateType = {
  friends: iFriendsDetail[],
  selectedFriends: iFriendsDetail
}

const friendsReducer = (state: stateType, action: actionType) => {
  switch (action.type) {
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'SET_SELECTED_FRIENDS':
      return { ...state, selectedFriends: action.payload };
    default:
      return state;
  }
}

const FriendsProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(friendsReducer, {
    friends: [], selectedFriends: { id: '', name: '', pubKey: '', profilePicUrl: '' }
  });
  const { loading, request } = useFetch('/friends');

  const handleSelectFriend = (id: string) => {
    const selectedFriend = state.friends.find((friend: iFriendsDetail) => friend.id === id);
    if (selectedFriend) {
      dispatch({ type: 'SET_SELECTED_FRIENDS', payload: selectedFriend });
    }
  };

  const fetchFriends = async () => {
    const { data, error } = await request();
    if (data) dispatch({ type: 'SET_FRIENDS', payload: data.firends as iFriendsDetail[] });
    if (error) console.log(error);
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const { friends, selectedFriends } = state;
  return (
    <FriendsContext.Provider value={{ friends, selectedFriends, setSelectedFriends: handleSelectFriend }}>
      {loading ? <div>Loading...</div> : children}
    </FriendsContext.Provider>
  );
};

export default FriendsProvider;