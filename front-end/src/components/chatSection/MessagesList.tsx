import { useEffect, useRef, useState } from "react";

import Message from "./Message";
import { iMessage, useChat } from "../../contextProvider/ChatProvider";
import useDebounceCall from "../../hooks/useDebounceCall";
import Svg from "../Svg";
import Loader from "../Loader";

const MessagesList = () => {
  const { messages, fetchMessages, loadingMessages, hasMore } = useChat();
  const [trigger, setTrigger] = useDebounceCall(fetchMessages, 300);
  const listRef = useRef<HTMLDivElement>(null);
  const [moveToBottom, setMoveToBottom] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const scrollContainer = listRef.current;

    if (!scrollContainer) return;

    const scrollOffset = scrollContainer.scrollTop;

    if (scrollOffset < 20 && !loadingMessages && hasMore) {
      !trigger && hasMore && setTrigger(true);
    }

    if (scrollContainer.scrollHeight - scrollContainer.scrollTop > 2500) {
      !moveToBottom && setMoveToBottom(true);
    } else {
      moveToBottom && setMoveToBottom(false);
    }
  };

  const handleScrollToBottom = (e: React.MouseEvent<SVGSVGElement>) => {
    console.log("scroll to bottom");
    e.stopPropagation();
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    setMoveToBottom(false);
  };

  useEffect(() => {
    if (!moveToBottom) {
      listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <div
      className="w-full overflow-scroll flex justify-center scroll-smooth h-[var(--chat-height)] relative"
      onScroll={handleScroll}
      ref={listRef}>
      {
        moveToBottom && <Svg
          svgName="down-arrow"
          className="fill-slate-500 absolute bottom-16 animate-bounce size-14 z-50 cursor-pointer"
          onClick={handleScrollToBottom}
        />
      }
      <div className="max-w-5xl w-full">
        {loadingMessages && <div className="w-full flex justify-center"><Loader size="w-14" /></div>}
        {
          messages?.map((message: iMessage) => (<Message key={message.id} message={message} />))
        }
      </div>
    </div>
  )
}

export default MessagesList;
