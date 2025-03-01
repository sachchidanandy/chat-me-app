import { iChatListFriends } from "../../contextProvider/FriendsProvider";
import FriendsCard from "./FriendsCard";

interface iFriendsListProps {
  friends: iChatListFriends[];
  selectedFriendId?: string;
  handleViewChat: (e: React.MouseEvent<HTMLDivElement>) => void
}
const FriedsList = (props: iFriendsListProps): JSX.Element => {
  const { friends, selectedFriendId, handleViewChat } = props;

  return (
    <div className="flex flex-col w-full gap-1 overflow-scroll" onClick={handleViewChat}>
      {friends.map((friend: iChatListFriends) => (
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
