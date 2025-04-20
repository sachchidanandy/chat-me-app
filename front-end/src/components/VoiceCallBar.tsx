import { useEffect, useRef, useState } from "react";
import { getNamesInitials } from "../utils/helpers";
import Svg from "./Svg";
import { CallerDetails, CallStatus } from "../contextProvider/CallProvider";

interface iVoiceCallBarProps {
  endCall: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  callerDetail: CallerDetails;
  callStatus: CallStatus;
  callDuration: string;
}
const VoiceCallBar = (props: iVoiceCallBarProps) => {
  const { endCall, toggleMute, isMuted, callerDetail, callStatus, callDuration } = props;
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const currentPosRef = positionRef.current;
      setPosition({ x: e.clientX - currentPosRef.x, y: e.clientY - currentPosRef.y });
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [dragging]);

  return (
    <div
      className='flex items-center fixed bg-primary max-w-sm w-full p-1 gap-2 rounded'
      style={{ left: position.x, top: position.y, zIndex: 1000 }}
      onMouseDown={(e) => {
        setDragging(true);
        positionRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {callerDetail.profilePicUrl ? <figure>
        <img
          src={callerDetail.profilePicUrl}
          alt={`${callerDetail.username}-pic`}
          className="size-14 rounded-full"
        />
      </figure> : <div
        className="size-14 rounded-full bg-blue-600 text-white flex justify-center items-center font-bold text-2xl self-center">
        <span>{getNamesInitials(callerDetail.fullName) || ''}</span>
      </div>}
      <div className="flex flex-col">
        <span className="font-bold text-white">{callerDetail.fullName.toUpperCase()}</span>
        <span className="text-pretty text-white">{['Connecting', 'Ringing'].includes(callStatus) ? `${callStatus}...` : callDuration}</span>
      </div>
      <div className="flex items-center gap-2 float-right ml-auto">
        <button className="btn btn-circle btn-ghost border-white bg-red-800" onClick={endCall}>
          <Svg
            className="fill-none stroke-current text-white h-8 w-8"
            viewBox="0 0 24 24"
            svgName="endNormalCall" />
        </button>
        <button className={`btn btn-circle btn-ghost ${isMuted ? 'bg-gray' : 'bg-white'} border-white`} onClick={toggleMute}>
          <Svg
            className={`fill-none stroke-current ${isMuted ? 'text-white' : 'text-gray-600'} h-8 w-8`}
            viewBox="0 0 24 24"
            svgName="muteMicroPhone" />
        </button>
      </div>
    </div>
  )
};

export default VoiceCallBar;
