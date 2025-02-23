import { useCallback, useRef } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

import Message from "./Message";
import { useChat } from "../../contextProvider/ChatProvider";
import useDebounceCall from "../../hooks/useDebounceCall";

const MessagesList = () => {
  const { messages, fetchMessages, loadingMessages } = useChat();
  const [trigger, setTrigger] = useDebounceCall(fetchMessages, 300);
  const listRef = useRef(null);

  const Row = ({ index, style }: ListChildComponentProps) => {
    const message = messages[index];

    return (
      <Message style={style} message={message} />
    );
  };

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    if (scrollOffset < 50 && !loadingMessages) {
      !trigger && setTrigger(true);
    }
  }, []);

  return (
    <div className="w-full overflow-scroll mx-auto h-[80%] flex justify-center">
      <div className="max-w-5xl w-full">
        <List
          ref={listRef}
          height={500} // Set viewport height
          itemCount={messages.length}
          itemSize={50} // Approximate message height
          width="100%"
          onScroll={handleScroll}
        >
          {Row}
        </List>
      </div>
    </div>
  )
}

export default MessagesList;