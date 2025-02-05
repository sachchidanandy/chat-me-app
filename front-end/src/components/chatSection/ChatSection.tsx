import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import Messages from "./Messages";

const ChatSection = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <ChatHeader />
      <div className="flex flex-col grow h-full bg-cover bg-[url(/images/background-image-two.jpg)]">
        <Messages />
        <ChatFooter />
      </div>
    </div>
  )
};

export default ChatSection;
