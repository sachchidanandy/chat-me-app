import { useFriends } from "../../contextProvider/FriendsProvider";
import NoChats from "../NoChats";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import AnimationStyle from "../../utils/animation.module.css";

export interface iChatSectionProps {
  isMobile: boolean;
  showMessageSection?: boolean;
  setShowMessageSection: React.Dispatch<React.SetStateAction<boolean>>;
}
const ChatSection = ({ isMobile, setShowMessageSection, showMessageSection }: iChatSectionProps) => {
  const { selectedFriends } = useFriends();

  return (
    <div className={`w-full flex flex-col ${showMessageSection && AnimationStyle.slideInRightMessage}`} style={{ height: 'var(--app-height)' }}>
      {!selectedFriends.id && <NoChats message="Select a friend to start a conversation" />}
      {selectedFriends.id && (
        <>
          <ChatHeader isMobile={isMobile} setShowMessageSection={setShowMessageSection} />
          <div className="flex flex-col justify-between grow bg-cover bg-blend-overlay bg-no-repeat bg-neutral-900 bg-[url(/images/background-image.png)]">
            <MessagesList />
            <ChatFooter />
          </div>
        </>
      )}
    </div>
  )
};

export default ChatSection;
