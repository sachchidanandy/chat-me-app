import { Link } from "react-router";

import { iChatListFriends } from "../../contextProvider/FriendsProvider";
import animationStyle from '../../utils/animation.module.css';
import { getNamesInitials, getRedableTimeStamp } from "../../utils/helpers";

interface iFriendsCardProps {
  friend: Partial<iChatListFriends>,
  selected: boolean,
}

const FriendsCard = ({ friend, selected }: iFriendsCardProps) => {
  const { id, name, profilePicUrl, lastChatTime, lastMessage, unSeenMessageCount } = friend;

  const bgClasses = selected ? ' bg-primary text-primary-content' : ' text-base-content btn-ghost';

  return (
    <Link to={`/${id}`} className={animationStyle.fadeIn}>
      <div className={"card card-side h-16 px-1 md:max-w-sm max-w-screen-sm hover:cursor-pointer" + bgClasses}>
        {profilePicUrl ? <figure>
          <img
            src={profilePicUrl}
            alt={`${name}-pic`}
            className="size-14 rounded-full"
          />
        </figure> : <div
          className="size-14 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-2xl self-center">
          {getNamesInitials(name) || ''}
        </div>}
        <div className="card-body p-2 gap-1 max-w-[calc(100%-4rem)] pb-0">
          <span className="font-bold text-base capitalize">
            {name}
            {lastChatTime && <span className="font-normal text-xs float-right">{getRedableTimeStamp(lastChatTime)}</span>}
          </span>
          <p className="font-light text-sm truncate">
            {lastMessage}
            {unSeenMessageCount ? <span className="font-bold text-black text-center text-sm float-right rounded-full bg-primary px-3">{unSeenMessageCount}</span> : null}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default FriendsCard;
