import { CSSProperties, memo } from "react";
import { useAuth } from "../../contextProvider/AuthProvider"
import { iMessage } from "../../contextProvider/ChatProvider";
import AnimationStyles from '../../utils/animation.module.css'

type MessagePropsType = {
  message: iMessage;
  style: CSSProperties
}
const Message = memo(({ style, message }: MessagePropsType) => {
  const { msg, timestamp, senderId } = message;
  const { user } = useAuth();
  const userId = user?.userId;

  // get time in hh:mm pm/am formate
  const time = timestamp.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const { chatContainerClass, messageClass } = senderId === userId ? {
    chatContainerClass: `chat chat-end ${AnimationStyles.slideInRight}`,
    messageClass: 'chat-bubble chat-bubble-secondary'
  } : {
    chatContainerClass: `chat chat-start ${AnimationStyles.slideInLeft}`,
    messageClass: 'chat-bubble chat-bubble-primary'
  };

  return (
    <div className={chatContainerClass} style={style}>
      <div className={messageClass}>
        {msg}
        <span className="ml-3 text-xs relative top-3">{time}</span>
      </div>
    </div>
  )
});

export default Message;
