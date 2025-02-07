import { iFriendsDetail } from "../../contextProvider/FriendsProvider";
import FriendsCard from "./FriendsCard";

interface iFriendsListProps {
  friends: iFriendsDetail[],
  selectedFriendId?: string
}
const FriedsList = (props: iFriendsListProps): JSX.Element => {
  const { friends, selectedFriendId } = props;
  return (
    <div className="flex flex-col w-full gap-1 overflow-scroll">
      {friends.map((friend: iFriendsDetail) => (
        <FriendsCard
          key={friend.id}
          friend={friend}
          selected={friend.id === selectedFriendId}
        />
      ))}
    </div>
  );
};

export default FriedsList;
