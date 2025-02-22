import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useFriends } from "../contextProvider/FriendsProvider";
import useDebounce from "../hooks/useDebounce";
import Svg from "../components/Svg";
import FriendsList from "../components/fiendsList/FriendsList";
import ChatSection from "../components/chatSection/ChatSection";
import { iFriendsDetail } from "../contextProvider/FriendsProvider";
import animationStyle from '../utils/animation.module.css';
import { useSearchDebounce } from "../hooks/useFetch";
import UserSearchList from "../components/searchUsersList/UserSearchList";
import { iSearchUser } from "../types/common";
import FriendRequestModal from "../components/FriendRequestModal";
import NoChats from "../components/NoChats";

const Dashboard = () => {
  const { friendId } = useParams();
  const { friends, selectedFriends, setSelectedFriends } = useFriends();
  const [filterData, setFilterData] = useState<iFriendsDetail[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: globalSearchData,
    loading: globalSearchLoading,
    error: globalSearchError
  } = useSearchDebounce('/users/search', searchQuery);
  const [globalSearchUsers, setGlobalSearchUsers] = useState<iSearchUser[] | null>(null);
  const debouncedSearchValue = useDebounce(searchQuery, 200);

  const handleBackButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSearchQuery('');
  }

  const handleSendFriendRequest = (userId: string) => {
    setGlobalSearchUsers(users => {
      return users?.length ? users?.map(user => {
        const { id } = user;
        if (id === userId) {
          return { ...user, isRequestSent: true }
        }
        return user
      }) : null
    });
  };

  useEffect(() => {
    const filteredFriends = debouncedSearchValue ? friends.filter(
      friend => friend.name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
    ) : null;
    setFilterData(filteredFriends);
  }, [debouncedSearchValue]);

  useEffect(() => {
    if (friendId) {
      setSelectedFriends(friendId);
    }
  }, [friendId]);

  useEffect(() => {
    if (globalSearchData?.users) {
      setGlobalSearchUsers(globalSearchData.users as iSearchUser[]);
    }
  }, [globalSearchData]);

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col md:max-w-sm max-w-screen-sm w-full h-full border-r pr-1">
        <div className="px-2 py-2 flex justify-between items-center gap-4">
          {filterData && (
            <button onClick={handleBackButton} className={`btn btn-circle btn-ghost ${animationStyle.fadeIn}`}>
              <Svg svgName="backArrow" className="text-primary" />
            </button>
          )}
          <label className="input input-primary flex items-center gap-2 grow">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Svg svgName="search" />
          </label>
        </div>
        {debouncedSearchValue ? <UserSearchList
          friends={filterData}
          handleSendFriendRequest={handleSendFriendRequest}
          searchUserList={globalSearchUsers}
          globalSearchLoading={globalSearchLoading}
          globalSearchError={globalSearchError}
        /> : <FriendsList
          friends={friends}
          selectedFriendId={selectedFriends?.id}
        />
        }
      </div>
      {
        (selectedFriends && selectedFriends.id) ? <ChatSection /> : <NoChats message="Please select a friend" />
      }
      <FriendRequestModal />
    </div>
  );
};

export default Dashboard;