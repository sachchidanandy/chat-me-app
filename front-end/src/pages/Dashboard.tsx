import { useEffect, useState } from "react";
import { useParams } from "react-router";

import useFriends from "../hooks/useFriends";
import useDebounce from "../hooks/useDebounce";
import Svg from "../components/Svg";
import FriendsList from "../components/fiendsList/FriendsList";
import ChatSection from "../components/chatSection/ChatSection";
import { iFriendsDetail } from "../contextProvider/FriendsProvider";
import animationStyle from '../utils/animation.module.css';

const Dashboard = () => {
  const { friendId } = useParams();
  const { friends, selectedFriends, setSelectedFriends } = useFriends();
  const [filterData, setFilterData] = useState<iFriendsDetail[] | null>(null)
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 200);

  const handleBackButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSearchValue('');
  }

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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Svg svgName="search" />
          </label>
        </div>
        <FriendsList friends={filterData ? filterData : friends} selectedFriendId={selectedFriends?.id} />
      </div>
      {
        (selectedFriends || true) && <ChatSection />
      }
    </div>
  );
};

export default Dashboard;