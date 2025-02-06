import useFriends from "../../hooks/useFriends";
import Svg from "../Svg";

const ChatHeader = () => {
  const { selectedFriends: { name, profilePicUrl } } = useFriends();
  return (
    <div className="px-2 py-1 flex justify-between items-center text-base-content border-b">
      <div className="flex items-center gap-2">
        <img className="size-14 rounded-full" src={profilePicUrl} alt={`${name}-profile-pic`} />
        <span className="text-lg font-semibold">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-circle" id="phone-call-button">
          <Svg className="fill-none stroke-current" viewBox="0 0 24 24" svgName="normalCall" />
        </button>
        <button className="btn btn-ghost btn-circle" id="video-call-button">
          <Svg className="fill-none stroke-current" viewBox="0 0 24 24" svgName="videoCall" />
        </button>
        <button className="btn btn-ghost btn-circle" id="search-message-button">
          <Svg viewBox="0 0 24 24" svgName="search" />
        </button>

      </div>
    </div>
  )
}

export default ChatHeader;
