import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import { useFriends } from "../contextProvider/FriendsProvider";
import useDebounceValue from "../hooks/useDebounceValue";
import Svg from "../components/Svg";
import FriendsList from "../components/fiendsList/FriendsList";
import ChatSection from "../components/chatSection/ChatSection";
import { iFriendsDetail } from "../contextProvider/FriendsProvider";
import AnimationStyle from '../utils/animation.module.css';
import { useSearchDebounce } from "../hooks/useFetch";
import UserSearchList from "../components/searchUsersList/UserSearchList";
import { iSearchUser } from "../types/common";
import FriendRequestModal from "../components/FriendRequestModal";
import SkeletonFriendListLoader from "../components/SkeletonFriendListLoader";

const Dashboard = () => {
  const { friendId } = useParams();
  const { friends, selectedFriends, chatListLoading, setSelectedFriends } = useFriends();
  const [filterData, setFilterData] = useState<iFriendsDetail[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const {
    data: globalSearchData,
    loading: globalSearchLoading,
    error: globalSearchError
  } = useSearchDebounce('/users/search', searchQuery);
  const [globalSearchUsers, setGlobalSearchUsers] = useState<iSearchUser[] | null>(null);
  const debouncedSearchValue = useDebounceValue(searchQuery, 200);
  const [showMessageSection, setShowMessageSection] = useState(false);

  const handleBackButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSearchQuery('');
  };

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
    if (friendId && !chatListLoading) {
      setSelectedFriends(friendId);
      setSearchQuery('');
    }
  }, [friendId, chatListLoading]);

  useEffect(() => {
    if (globalSearchData?.users) {
      setGlobalSearchUsers(globalSearchData.users as iSearchUser[]);
    }
  }, [globalSearchData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // If the user is on a mobile device, then show message section only if there is a selected friend
    setShowMessageSection(!isMobile || (isMobile && Boolean(selectedFriends?.id)));
  }, [isMobile, selectedFriends]);

  const shoulShowSearchSection = useMemo(() => {
    if (isMobile) {
      return !showMessageSection;
    } else {
      return true;
    }
  }, [isMobile, showMessageSection]);

  const handleViewChat = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isMobile && !showMessageSection && (e.target as Element).closest('a')) {
      setShowMessageSection(true);
    }
  };

  return (
    <div className="flex w-full h-full">
      {
        shoulShowSearchSection && (
          <div className={`flex flex-col md:max-w-sm max-w-screen-sm w-full h-full ${!isMobile && ' border-r'} pr-1 ${shoulShowSearchSection && AnimationStyle.slideInRightMessage}`}>
            <div className="px-2 py-2 flex justify-between items-center gap-4">
              {filterData && (
                <button onClick={handleBackButton} className={`btn btn-circle btn-ghost ${AnimationStyle.fadeIn}`}>
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
            {chatListLoading ? <SkeletonFriendListLoader /> : (
              debouncedSearchValue ? <UserSearchList
                friends={filterData}
                handleSendFriendRequest={handleSendFriendRequest}
                searchUserList={globalSearchUsers}
                globalSearchLoading={globalSearchLoading}
                globalSearchError={globalSearchError}
              /> : <FriendsList
                friends={friends}
                selectedFriendId={selectedFriends?.id}
                handleViewChat={handleViewChat}
              />)
            }
          </div>
        )
      }
      {showMessageSection && <ChatSection isMobile={isMobile} showMessageSection={showMessageSection} setShowMessageSection={setShowMessageSection} />}
      <FriendRequestModal />
    </div>
  );
};

export default Dashboard;
