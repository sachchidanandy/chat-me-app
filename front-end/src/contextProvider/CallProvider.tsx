import { useEffect, useRef, useState, createContext, useContext } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthProvider";
import VoiceCallBar from "../components/VoiceCallBar";
import IncomingCallDialog from "../components/IncomingCallDialog";
import { eToastType } from "../components/toast/Toast";
import Svg from "../components/Svg";

// Configuration for ICE servers (STUN in this case)
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }, // Google STUN server
  ],
};

export type CallerDetails = {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
};

export type CallStatus = "idle" | "connecting" | "ringing" | "in-call";
export type CallType = "audio" | "video";

interface iCallContext {
  startCall: (targetUserId: string, targetCallerDetails: CallerDetails, cType: CallType) => void;
  isAlreadyInCall: boolean;
}

const CallContext = createContext({} as iCallContext);

const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, handleToastToogle } = useAuth();
  const [isAlreadyInCall, setIsAlreadyInCall] = useState(false); // Track ongoing call state
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null); // Store peer socket ID
  const [incomingCall, setIncomingCall] = useState<null | {
    from: string;
    offer: RTCSessionDescriptionInit;
    callerDetails: CallerDetails;
  }>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callerDetail, setCallerDetail] = useState<null | CallerDetails>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState('00:00');
  const [callType, setCallType] = useState<CallType | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null); // Local audio stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null); // Local video stream
  const peerConnection = useRef<RTCPeerConnection | null>(null); // RTCPeerConnection instance
  const remoteAudioRef = useRef<HTMLAudioElement>(new Audio()); // Remote audio element
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null); // Remote video stream
  const startTimeRef = useRef<number | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const callTimeoutRef = useRef<number | null>(null);

  // Function to create and configure a peer connection
  const createPeerConnection = (peerId: string, cType: CallType = "audio") => {
    const pc = new RTCPeerConnection(iceServers);

    // Send ICE candidate to the other peer via signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", { targetSocketId: peerId, candidate: event.candidate });
      }
    };

    // Handle incoming remote stream and attach to audio and video element
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (cType === "video" && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else if (cType === "audio" && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play();
      }
    };

    // Add local tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    return pc;
  };

  // Start a call by creating offer and sending it to the target user
  const startCall = async (targetUserId: string, targetCallerDetails: CallerDetails, cType: CallType = "audio") => {
    if (!isAlreadyInCall) {
      try {
        // Fetch users scket id
        socket.emit("fetch_user_socket_id", { targetUserId }, async (targetSocketId: string) => {
          if (!targetSocketId) {
            console.log("User is offline");
            handleToastToogle("Can't connect, user is offline", eToastType.warning);
            return;
          }
          setCallStatus('connecting');
          setCallType(cType);

          // Starting timmer to end call after 30 sec if call not answered
          callTimeoutRef.current = setTimeout(() => {
            if (!isAlreadyInCall) {
              socket.emit("end_call", { targetSocketId });
              endCall();
              handleToastToogle("Call not answered", eToastType.warning);
            }
          }, 30000); // 30 seconds

          // Get local audio stream
          const constraints = cType === "video" ? { video: true, audio: true } : { video: false, audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          localStreamRef.current = stream;

          if (cType === "video" && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Create peer connection and offer
          peerConnection.current = createPeerConnection(targetSocketId, cType);
          setRemoteSocketId(targetSocketId);

          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);

          // Send offer to remote user
          socket.emit("call_user", {
            targetSocketId,
            offer,
            callerDetails: {
              userId: user?.userId || '',
              username: user?.username || '',
              fullName: user?.fullName || '',
              profilePicUrl: user?.profilePicUrl || '',
            },
            cType,
          });
          setIsAlreadyInCall(true);
          setCallerDetail(targetCallerDetails);
        });
      } catch (error) {
        console.log("Error starting call:", error);
        handleToastToogle("Error while calling", eToastType.error);
      }
    }
  };

  // End the call and clean up resources
  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    setIsAlreadyInCall(false);
    setCallerDetail(null);
    if (remoteSocketId) {
      socket.emit("end_call", { targetSocketId: remoteSocketId });
    }
    setCallStatus('idle');
    setCallDuration('00:00');
    setRemoteSocketId(null);
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
    setCallType(null);
    // check if dialog is in opened state
    if ((document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.open) {
      (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.close();
    }
  };

  // ✅ Accept an incoming call
  const handleAcceptCall = async () => {
    const { from, offer, callerDetails } = incomingCall!;
    const constraints = callType === "video" ? { video: true, audio: true } : { video: false, audio: true };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;

    if (callType === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    peerConnection.current = createPeerConnection(from, callType || 'audio');
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer_call", {
      targetSocketId: from,
      answer,
    });

    setIsAlreadyInCall(true);
    setCallerDetail(callerDetails);
    setRemoteSocketId(from);
    setIncomingCall(null);
    setCallStatus('in-call');

    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }

    (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.close();
  };

  // ❌ Reject the incoming call
  const handleRejectCall = () => {
    socket.emit("reject_call", { targetSocketId: incomingCall?.from });
    setIncomingCall(null);
    setCallStatus('idle');
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
    (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.close();
  };

  //Toggle mute state of the local audio track.
  const toggleMute = () => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // Toogle camera
  const toggleCamera = () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }

  // Handle incoming socket events
  useEffect(() => {
    // When a call is received
    socket.on("incoming_call", async ({ from, offer, callerDetails, cType }) => {
      if (isAlreadyInCall) {
        console.log("Already in call");
        handleToastToogle(`${callerDetails?.fullName} is calling you...`, eToastType.warning);
        return;
      }
      const isTabInBackground = document.hidden;
      if (isTabInBackground && Notification.permission === "granted") {
        const notification = new Notification("📞 Incoming Call", {
          body: `Call from ${callerDetails?.fullName}`, // optional
        });

        notification.onclick = () => {
          window.focus();
        };
      }
      setCallStatus('ringing');
      ringtoneRef.current = new Audio('/audio/incoming-call-ringtone.mp3');
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch((err) => console.log("Auto-play blocked:", err));
      setIncomingCall({ from, offer, callerDetails });
      setCallType(cType);
      (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.showModal();
    });

    // When the remote user answers the call
    socket.on("call_answered", async ({ from, answer }) => {
      setCallStatus('in-call');
      console.log("Call is answered to Socket ID: ", from);
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // When an ICE candidate is received from the other peer
    socket.on("ice_candidate", ({ from, candidate }) => {
      console.log("ice_candidate to Socket ID: ", from);
      peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // When the call is ended by the remote user
    socket.on("call_ended", () => {
      endCall();
    });

    // When the remote user rejects the call
    socket.on("call_rejected", () => {
      handleToastToogle('Call was rejected.', eToastType.warning);
      endCall();
    });

    // When the remote user's device is ringing
    socket.on('call_ringing', () => {
      setCallStatus('ringing');
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("incoming_call");
      socket.off("call_answered");
      socket.off("ice_candidate");
      socket.off("call_ended");
      socket.off("call_rejected");
      socket.off("call_ringing");
    }
  }, []);

  useEffect(() => {
    // When the remote user went offline in mid call
    socket.on('user_status_update_for_call', (message) => {
      const { userId, status } = message;

      if (status === 'offline' && userId === callerDetail?.userId && isAlreadyInCall) {
        endCall();
        handleToastToogle('Call disconnected, user is offline', eToastType.warning);
      }
    });

    // clean up
    return () => {
      socket.off("user_status_update_for_call");
    }
  }, [callerDetail, isAlreadyInCall]);

  // Handle call duration
  useEffect(() => {
    let intervalId: number | undefined;
    if (callStatus === 'in-call') {
      startTimeRef.current = Date.now();
      intervalId = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - (startTimeRef.current || now)) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        const remainingMin = diff % 3600;
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(remainingMin % 60).padStart(2, '0');
        let totalTime = ''
        if (hours !== '00') {
          totalTime += `${hours}: `;
        }
        totalTime += `${minutes}: ${seconds}`;
        setCallDuration(totalTime);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  }, [callStatus]);

  return (
    <>
      {/* Audio tag for remote stream playback */}
      <audio ref={remoteAudioRef} autoPlay controls hidden />
      {(callType === 'video') && (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden touch-none">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-24 right-4 w-36 h-24 sm:w-40 sm:h-28 rounded-lg border-2 border-white object-cover shadow-md"
          />
          <div className="absolute top-4 left-4 text-xs sm:text-sm bg-black/50 px-3 py-2 rounded-lg">
            <div className="font-semibold truncate max-w-[100px] sm:max-w-none capitalize">{callerDetail?.fullName}</div>
            <div>{['connecting', 'ringing'].includes(callStatus) ? `${callStatus}...` : callDuration}</div>
          </div>

          <div className="absolute bottom-20 w-full flex justify-center gap-6 ">
            <button onClick={toggleMute} className="btn btn-circle btn-ghost border-gray-800 focus:outline-none bg-white">
              {isMuted ? <Svg svgName="muteMicroPhone" className="fill-none stroke-current text-gray-800 h-8 w-8" /> : <Svg svgName="microPhone" className="fill-none stroke-current text-gray-800 h-8 w-8" />}
            </button>
            <button onClick={toggleCamera} className="btn btn-circle btn-ghost border-gray-800 focus:outline-none bg-white">
              {isCameraOff ? <Svg svgName="offVideoCall" className="fill-none stroke-current text-gray-800 h-8 w-8" /> : <Svg svgName="videoCall" className="fill-none stroke-current text-gray-800 h-8 w-8" />}
            </button>
            <button className="btn btn-circle btn-ghost border-gray-800 bg-red-800" onClick={endCall}>
              <Svg
                className="fill-none stroke-current text-white h-8 w-8"
                viewBox="0 0 24 24"
                svgName="endNormalCall" />
            </button>
          </div>
        </div>
      )}
      <IncomingCallDialog
        callerDetails={incomingCall?.callerDetails || { userId: '', username: '', fullName: '', profilePicUrl: '' }}
        handleAcceptCall={handleAcceptCall}
        handleRejectCall={handleRejectCall}
        type={callType || 'audio'}
      />
      {
        (isAlreadyInCall && callerDetail && callType === 'audio') && (
          <VoiceCallBar
            endCall={endCall}
            toggleMute={toggleMute}
            isMuted={isMuted}
            callerDetail={callerDetail}
            callStatus={callStatus}
            callDuration={callDuration}
          />
        )
      }
      <CallContext.Provider value={{ startCall, isAlreadyInCall }}>
        {children}
      </CallContext.Provider>
    </>
  );
};

export const useCall = () => useContext(CallContext);

export default CallProvider;
