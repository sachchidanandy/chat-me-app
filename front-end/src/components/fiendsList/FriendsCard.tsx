import { Link } from "react-router";
import { iFriendsDetail } from "../../contextProvider/FriendsProvider";

interface iFriendsCardProps {
  friend: iFriendsDetail,
  selected: boolean,
  lastChatMessage: string,
}
const FriendsCard = ({ friend, selected, lastChatMessage }: iFriendsCardProps) => {
  const { id, name, profilePicUrl } = friend;

  const bgClasses = selected ? ' bg-primary text-primary-content' : ' text-base-content';
  return (
    <Link to={`/chats/${id}`}>
      <div className={"card card-side h-16 px-1 max-w-sm hover:cursor-pointer" + bgClasses}>
        <figure>
          <img
            src={profilePicUrl}
            alt="Movie"
            className="size-14 rounded-[50%]"
          />
        </figure>
        <div className="card-body p-2 gap-1 max-w-[calc(100%-4rem)]">
          <span className="font-bold text-base">
            {name}
            <span className="font-normal text-xs float-right">Dec 20, 2024</span>
          </span>
          <p className="font-light text-sm truncate">{lastChatMessage}</p>
        </div>
      </div>
    </Link>
  );
}

export default FriendsCard;
