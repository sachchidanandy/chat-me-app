import { useEffect, useRef, useState, createContext, useContext } from "react";
import socket from "../utils/socket";
import { useAuth } from "./AuthProvider";
import VoiceCallBar from "../components/VoiceCallBar";
import IncomingCallDialog from "../components/IncomingCallDialog";

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

export type CallStatus = "idle" | "Connecting" | "Ringing" | "in-call";

interface iAudioCallContext {
  startCall: (targetUserId: string, targetCallerDetails: CallerDetails) => void;
  isAlreadyInCall: boolean;
}

const AudioCallContext = createContext({} as iAudioCallContext);

const AudioCallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
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

  const localStreamRef = useRef<MediaStream | null>(null); // Local audio stream
  const peerConnection = useRef<RTCPeerConnection | null>(null); // RTCPeerConnection instance
  const remoteStreamRef = useRef<HTMLAudioElement>(new Audio()); // Remote audio element
  const startTimeRef = useRef<number | null>(null);

  // Function to create and configure a peer connection
  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection(iceServers);

    // Send ICE candidate to the other peer via signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { targetSocketId: peerId, candidate: event.candidate });
      }
    };

    // Handle incoming remote stream and attach to audio element
    pc.ontrack = (event) => {
      remoteStreamRef.current.srcObject = event.streams[0];
    };

    // Add local audio tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    return pc;
  };

  // Start a call by creating offer and sending it to the target user
  const startCall = async (targetUserId: string, targetCallerDetails: CallerDetails) => {
    if (!isAlreadyInCall) {
      try {
        // Fetch users scket id
        socket.emit("fetch-user-socket-id", { targetUserId }, async (targetSocketId: string) => {
          if (!targetSocketId) {
            console.log("User is offline");
            return;
          }
          setCallStatus('Connecting');
          // Get local audio stream
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;

          // Create peer connection and offer
          peerConnection.current = createPeerConnection(targetSocketId);
          setRemoteSocketId(targetSocketId);

          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);

          // Send offer to remote user
          socket.emit("call-user", {
            targetSocketId,
            offer,
            callerDetails: {
              userId: user?.userId || '',
              username: user?.username || '',
              fullName: user?.fullName || '',
              profilePicUrl: user?.profilePicUrl || '',
            }
          });
          setIsAlreadyInCall(true);
          setCallerDetail(targetCallerDetails);
        });
      } catch (error) {
        console.log("Error starting call:", error);
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
      socket.emit("end-call", { targetSocketId: remoteSocketId });
    }
    setCallStatus('idle');
    setRemoteSocketId(null);
    // check if dialog is in opened state
    if ((document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.open) {
      (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.close();
    }
  };

  // ✅ Accept an incoming call
  const handleAcceptCall = async () => {
    const { from, offer, callerDetails } = incomingCall!;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    peerConnection.current = createPeerConnection(from);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      targetSocketId: from,
      answer,
    });

    setIsAlreadyInCall(true);
    setCallerDetail(callerDetails);
    setRemoteSocketId(from);
    setIncomingCall(null);
    setCallStatus('in-call');

    (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.close();
  };

  // ❌ Reject the incoming call
  const handleRejectCall = () => {
    socket.emit("reject-call", { targetSocketId: incomingCall?.from });
    setIncomingCall(null);
    setCallStatus('idle');
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

  // Handle incoming socket events
  useEffect(() => {
    // When a call is received
    socket.on("incoming-call", async ({ from, offer, callerDetails }) => {
      if (isAlreadyInCall) {
        console.log("Already in call");
        return;
      }
      setCallStatus('Ringing');
      setIncomingCall({ from, offer, callerDetails });
      (document.getElementById('incoming-call-modal') as HTMLDialogElement | null)?.showModal();
    });

    // When the remote user answers the call
    socket.on("call-answered", async ({ from, answer }) => {
      setCallStatus('in-call');
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // When an ICE candidate is received from the other peer
    socket.on("ice-candidate", ({ from, candidate }) => {
      peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // When the call is ended by the remote user
    socket.on("call-ended", () => {
      endCall();
    });

    // When the remote user rejects the call
    socket.on("call-rejected", () => {
      alert("Call was rejected.");
      endCall();
    });

    // When the remote user's device is ringing
    socket.on('call-ringing', () => {
      setCallStatus('Ringing');
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-rejected");
      socket.off("call-ringing");
    }
  }, []);

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
      <audio ref={remoteStreamRef} autoPlay controls style={{ display: "none" }} />
      <IncomingCallDialog
        callerDetails={incomingCall?.callerDetails || { userId: '', username: '', fullName: '', profilePicUrl: '' }}
        handleAcceptCall={handleAcceptCall}
        handleRejectCall={handleRejectCall}
      />
      {
        (isAlreadyInCall && callerDetail) ? (
          <VoiceCallBar
            endCall={endCall}
            toggleMute={toggleMute}
            isMuted={isMuted}
            callerDetail={callerDetail}
            callStatus={callStatus}
            callDuration={callDuration}
          />
        ) : null
      }
      <AudioCallContext.Provider value={{ startCall, isAlreadyInCall }}>
        {children}
      </AudioCallContext.Provider>
    </>
  );
};

export const useAudioCall = () => useContext(AudioCallContext);

export default AudioCallProvider;
