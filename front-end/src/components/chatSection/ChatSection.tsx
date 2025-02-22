import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import Messages from "./Messages";

const ChatSection = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <ChatHeader />
      <div className="flex flex-col grow h-full bg-cover bg-blend-overlay bg-no-repeat bg-neutral-900 bg-[url(/images/background-image.png)]">
        <Messages />
        <ChatFooter />
      </div>
    </div>
  )
};

export default ChatSection;
