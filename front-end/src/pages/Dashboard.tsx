import { useEffect, useState } from "react";

import useFriends from "../hooks/useFriends";
import useDebounce from "../hooks/useDebounce";
import Svg from "../components/Svg";
import FriendsList from "../components/fiendsList/FriendsList";
import ChatSection from "../components/chatSection/ChatSection";


const mockFriendsList = [{ id: '11', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }, { id: '1', name: 'John Doe', pubKey: '1234567890', profilePicUrl: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp' }]
const Dashboard = () => {
  const { friends, selectedFriends } = useFriends();
  const [friendsList, setFriendsList] = useState(mockFriendsList);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    const filteredFriends = friendsList.filter(friend => friend.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()));
    setFriendsList(filteredFriends);
  }, [debouncedSearchValue]);

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col md:max-w-sm max-w-screen-sm w-full h-full border-r pr-1">
        <div className="px-2 py-2 flex justify-between items-center gap-4">
          {searchValue && <Svg svgName="backArrow" className="text-primary" />}
          <label className="input input-primary flex items-center gap-2 grow">
            <input type="text" className="grow" placeholder="Search" onChange={(e) => setSearchValue(e.target.value)} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-6 w-6 opacity-70">
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd" />
            </svg>
          </label>
        </div>
        <FriendsList friends={friendsList} />
      </div>
      {
        (selectedFriends || true) && <ChatSection />
      }
    </div>
  );
};

export default Dashboard;