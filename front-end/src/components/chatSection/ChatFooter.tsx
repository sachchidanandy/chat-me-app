import { useState } from "react";
import data from '@emoji-mart/data'
import EmojiPicker from '@emoji-mart/react'

import Svg from "../Svg";

const ChatFooter = () => {
  const [message, setMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emoji: any) => {
    setMessage(prevMessage => prevMessage + emoji.native);
  }
  return (
    <div className="flex items-center gap-2 px-4 py-2 justify-center relative">
      <label className="input input-bordered flex items-center gap-2 max-w-4xl w-full bg-primary-content text-white h-14">
        <button className="btn btn-circle btn-ghost" onClick={() => setShowPicker(prev => !prev)}><Svg svgName="emoji" /></button>
        <input type="text" className="grow w-full text-lg" placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="btn btn-circle btn-ghost"><Svg svgName="attachment-button" /></button>
      </label>

      {showPicker && (
        <div style={{
          position: 'absolute',
          bottom: '4rem',
          left: '1.25rem'
        }}>
          <EmojiPicker
            onEmojiSelect={handleEmojiClick}
            data={data}
          />
        </div>
      )}

      {message ? (
        <button className="btn btn-circle btn-primary">
          <Svg svgName="send-message" className="ml-2" />
        </button>
      ) : (
        <button className="btn btn-circle btn-ghost">
          <Svg svgName="send-voice-message" />
        </button>
      )}
    </div>
  );
};

export default ChatFooter;