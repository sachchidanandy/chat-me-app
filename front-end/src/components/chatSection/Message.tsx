import { CSSProperties, memo } from "react";
import { useAuth } from "../../contextProvider/AuthProvider"
import { iMessage } from "../../contextProvider/ChatProvider";
import AnimationStyles from '../../utils/animation.module.css'
import { getRedableTimeStamp } from "../../utils/helpers";

type MessagePropsType = {
  message: iMessage;
  style?: CSSProperties
}
const Message = memo(({ style, message }: MessagePropsType) => {
  const { msg, timestamp, senderId } = message;
  const { user } = useAuth();
  const userId = user?.userId;

  const { chatContainerClass, messageClass } = senderId === userId ? {
    chatContainerClass: `chat chat-end ${AnimationStyles.slideInRightMessage}`,
    messageClass: 'chat-bubble chat-bubble-secondary'
  } : {
    chatContainerClass: `chat chat-start ${AnimationStyles.slideInLeftMessage}`,
    messageClass: 'chat-bubble chat-bubble-primary'
  };

  return (
    <div className={chatContainerClass} style={style}>
      <div className={messageClass}>
        {msg}
        <span className="ml-3 text-xs relative top-3">{getRedableTimeStamp(timestamp)}</span>
      </div>
    </div>
  )
});

export default Message;
