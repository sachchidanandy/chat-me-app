import { iFriendsDetail } from "../../contextProvider/FriendsProvider";
import { iResposseData } from "../../hooks/useFetch";
import { iSearchUser } from "../../types/common";
import FriendsCard from "../fiendsList/FriendsCard";
import Loader from "../Loader";
import UsersCard from "./UsersCard";

interface iUserSearchListProps {
  friends: iFriendsDetail[] | null;
  globalSearchData: iResposseData | null;
  globalSearchLoading: boolean;
  globalSearchError: string | null;
}
const UserSearchList = (props: iUserSearchListProps): JSX.Element => {
  const { friends, globalSearchData, globalSearchError, globalSearchLoading } = props;

  const searchUserList = globalSearchData?.users as iSearchUser[];

  return (
    <div className="flex flex-col w-full gap-1 overflow-scroll">
      <div className="max-h-[45%] mb-2 overflow-x-auto w-full">
        <h3 className="sticky top-0 z-50 p-2 capitalize bg-gray-700">Friends</h3>
        {friends?.map((friend: iFriendsDetail) => (
          <FriendsCard
            key={friend.id}
            friend={friend}
            selected={false}
          />
        ))}
        {
          friends?.length === 0 && (<p className="text-info py-4 text-center">No Friends Found</p>)
        }
      </div>
      <div className="overflow-x-scroll w-full">
        <h3 className="sticky top-0 z-50 p-2 capitalize bg-gray-700">Global Search</h3>
        {
          globalSearchLoading && (<Loader size="w-24" />)
        }
        {
          globalSearchError && (<p className="text-error py-4">{globalSearchError}</p>)
        }
        {
          searchUserList?.map((user: iSearchUser) => (
            <UsersCard
              key={user.id}
              user={user}
            />
          ))
        }
        {
          searchUserList?.length === 0 && (<p className="text-info py-4 text-center">No User Found</p>)
        }
      </div>
    </div>
  );
};

export default UserSearchList;

