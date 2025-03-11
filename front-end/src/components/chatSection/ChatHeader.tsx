import { useChat } from "../../contextProvider/ChatProvider";
import { useFriends } from "../../contextProvider/FriendsProvider";
import Svg from "../Svg";
import AnimationStyle from "../../utils/animation.module.css";
import { iChatSectionProps } from "./ChatSection";
import { getRedableTimeStamp } from "../../utils/helpers";

const ChatHeader = ({ isMobile, setShowMessageSection }: iChatSectionProps) => {
  const { typing } = useChat();
  const {
    selectedFriends: {
      name,
      profilePicUrl
    },
    selectedFriendOnlineStatus
  } = useFriends();
  const namesInitials = () => name
    .split(' ')
    .map((name) => name.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className="px-2 py-1 flex justify-between items-center text-base-content border-b">
      <div className="flex items-center gap-2">
        {
          isMobile && <button
            onClick={() => setShowMessageSection(false)}
            className={`btn btn-circle btn-ghost ${AnimationStyle.fadeIn}`}>
            <Svg svgName="backArrow" className="text-primary" />
          </button>
        }
        {
          profilePicUrl
            ? <img
              className="size-14 rounded-full"
              src={profilePicUrl}
              alt={`${name}-profile-pic`} />
            : <div
              className="size-14 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-2xl self-center">
              {namesInitials() || ''}
            </div>
        }
        <div className="flex flex-col">
          <span className="text-lg font-semibold capitalize">
            {name}
          </span>
          {typing ? <span className="text-sm font-light animate-bounce">
            Typing...
          </span> : <span className="text-sm font-light">
            {selectedFriendOnlineStatus === 'online' ?
              selectedFriendOnlineStatus : `last seen at ${getRedableTimeStamp(selectedFriendOnlineStatus || '')}`}
          </span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-circle" id="phone-call-button">
          <Svg
            className="fill-none stroke-current"
            viewBox="0 0 24 24"
            svgName="normalCall" />
        </button>
        <button className="btn btn-ghost btn-circle" id="video-call-button">
          <Svg
            className="fill-none stroke-current"
            viewBox="0 0 24 24"
            svgName="videoCall" />
        </button>
        <button className="btn btn-ghost btn-circle" id="search-message-button">
          <Svg svgName="search" className="size-6" />
        </button>

      </div>
    </div>
  )
}

export default ChatHeader;
