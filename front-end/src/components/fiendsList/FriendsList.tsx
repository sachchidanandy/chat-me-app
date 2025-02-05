import { iFriendsDetail } from "../../contextProvider/FriendsProvider";
import FriendsCard from "./FriendsCard";

interface iFriendsListProps {
  friends: iFriendsDetail[],
}
const FriedsList = (props: iFriendsListProps): JSX.Element => {
  const { friends } = props;
  return (
    <div className="flex flex-col w-full gap-1 overflow-scroll">
      {friends.map((friend: iFriendsDetail) => (
        <FriendsCard friend={friend} selected={friend.id === '11'} lastChatMessage={'Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello'} />
      ))}
    </div>
  );
};

export default FriedsList;
