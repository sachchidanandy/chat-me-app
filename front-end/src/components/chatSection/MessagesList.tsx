import { useRef } from "react";

import Message from "./Message";
import { iMessage, useChat } from "../../contextProvider/ChatProvider";
import useDebounceCall from "../../hooks/useDebounceCall";

const MessagesList = () => {
  const { messages, fetchMessages, loadingMessages } = useChat();
  const [trigger, setTrigger] = useDebounceCall(fetchMessages, 300);
  const listRef = useRef(null);

  const handleScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    const scrollOffset = e.currentTarget.scrollTop;
    console.log(scrollOffset);
    if (scrollOffset < 50 && !loadingMessages) {
      !trigger && setTrigger(true);
    }
  };

  return (
    <div className="w-full overflow-scroll mx-auto h-[80%] flex justify-center" onScroll={handleScroll} ref={listRef}>
      <div className="max-w-5xl w-full">
        {
          messages?.map((message: iMessage) => (<Message key={message.id} message={message} />))
        }
      </div>
    </div>
  )
}

export default MessagesList;