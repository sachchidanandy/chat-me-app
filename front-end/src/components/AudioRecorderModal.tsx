/**
 * Audio Recorder with Waveform Visualization and Timer
 * 
 * Features:
 * - Press button to start recording
 * - Displays waveform while recording
 * - Shows elapsed recording time
 * - Provides delete and send buttons
 * - Stops recording after 1 minute max
 * - Allows playback before sending
 */

import { useState, useRef, useEffect } from "react";
import Svg from "./Svg";
import Loader, { eLoaderTypes } from "./Loader";

type AudioRecorderModalProps = {
  onCaptureAudio: (blob: Blob | null) => void;
  sendRecordedAudio: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onPopupClose: () => void;
  fileUploadLoading: string
};

/**
 * @function AudioRecorderModal
 *
 * @description
 * A modal component that provides a simple audio recorder with waveform visualization and timer.
 * It allows the user to record audio, view the waveform, and send the recording once it's complete.
 * The recording is limited to 1 minute.
 *
 * @prop {function} onCaptureAudio - A callback function that takes a blob as an argument and is called when the recording is complete.
 * @prop {function} onPopupClose - A callback function that is called when the modal is closed.
 */
export default function AudioRecorderModal({ onCaptureAudio, onPopupClose, sendRecordedAudio, fileUploadLoading }: AudioRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const fileUploadInProgress = fileUploadLoading?.length > 0;

  // Start recording
  const startRecording = async () => {
    setIsRecording(true);
    setRecordTime(0);
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Attach onstop handler immediately
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        onCaptureAudio(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        // Cleanup event listener after stopping
        (mediaRecorderRef.current!).onstop = null;
      };

      // Web Audio API setup
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      intervalRef.current = window.setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (error) {
      setError("Error accessing microphone, permission denied.");
      isRecording && stopRecording();
      setIsRecording(false);
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Clear waveform when recording stops
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Delete recorded audio
  const deleteRecording = () => {
    setAudioBlob(null);
    onCaptureAudio(null);
    setAudioUrl(null);
    setRecordTime(0);
  };

  // Send recorded audio
  const sendRecording = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (audioBlob) {
      sendRecordedAudio(e);
      handleClosePopup();
    }
  };

  // Draw smoother waveform using real audio frequencies
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    /**
     * Draws the waveform on the canvas by getting the frequency data from the analyser
     * and scaling it to the canvas height. The color of the waveform is determined by
     * the intensity of the sound, with blue being low volume, green being medium,
     * yellow being high, and red being very high. The waveform is animated by calling
     * itself recursively using requestAnimationFrame.
     */
    const draw = () => {
      analyserRef?.current?.getByteFrequencyData(dataArray);

      // Clear canvas for new frame
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5; // Bar spacing
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height || 2; // Scale bar height

        // Define color based on intensity
        let color = "blue"; // Default low volume
        if (barHeight > height * 0.2) color = "green"; // Medium
        if (barHeight > height * 0.5) color = "yellow"; // High
        if (barHeight > height * 0.7) color = "red"; // Very high

        ctx.fillStyle = color;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight); // Draw bar

        x += barWidth + 2; // Move to next bar position
      }

      // Keep animating if recording
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  // Cleanup and reset state
  const handleClosePopup = () => {
    if (mediaRecorderRef.current) {

      // Cleanup event listener after stopping
      (mediaRecorderRef.current!).onstop = null;
      mediaRecorderRef.current.stop();

      // Stop all audio tracks
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Clear waveform when recording stops
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    audioChunksRef.current = [];

    intervalRef.current && clearInterval(intervalRef.current);
    error && setError(null);
    isRecording && setIsRecording(false);
    recordTime && setRecordTime(0);
    audioBlob && setAudioBlob(null);
    audioUrl && setAudioUrl(null);
    onPopupClose && onPopupClose();
  };

  useEffect(() => {
    if (recordTime >= 60 && isRecording) {
      stopRecording();
    }
  }, [recordTime]);

  return (
    <dialog id="audio-recording-modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button id="close-camera-button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleClosePopup}>✕</button>
        </form>
        <div className="flex flex-col items-center p-4 rounded-lg w-full max-w-md">
          {fileUploadInProgress && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-white text-center">
                <Loader type={eLoaderTypes.BARS} size="size-12" message={fileUploadLoading} />
              </div>
            </div>
          )}
          {audioBlob && audioUrl ? (
            <div className="flex flex-col items-center mt-3 w-full">
              <audio controls className="max-w-full">
                <source src={audioUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
              <div className="flex gap-4 mt-3 w-full justify-evenly">
                <div className="tooltip tooltip-bottom" data-tip="Delete Recording">
                  <button disabled={fileUploadInProgress} onClick={deleteRecording} className="bg-red-500 text-white btn-circle btn">
                    <Svg svgName="delete" className="m-auto" />
                  </button>
                </div>
                <div className="tooltip tooltip-bottom" data-tip="Send Recording">
                  <button disabled={fileUploadInProgress} onClick={sendRecording} className="bg-green-500 text-white btn-circle btn">
                    <Svg svgName="send-message" className="m-auto ml-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 mt-3 w-full flex-col items-center">
              <canvas ref={canvasRef} width={300} height={50} className="w-full bg-gray-950 rounded-md pb-4" />
              <div className="text-white mt-2">{recordTime} sec</div>
              {isRecording ? (
                <div className="tooltip tooltip-bottom" data-tip="Stop Recording">
                  <button disabled={fileUploadInProgress} onClick={stopRecording} className="btn bg-secondary text-white btn-circle">
                    <Svg svgName="stop-audio-recording" className="m-auto" />
                  </button>
                </div>
              ) : (
                <div className="tooltip tooltip-bottom" data-tip={error ? 'Retry Recording' : 'Start Recording'}>
                  {error && <div className="text-red-500 mb-1">{error}</div>}
                  <button disabled={fileUploadInProgress} onClick={startRecording} className="btn bg-primary text-white btn-circle">
                    <Svg svgName="microPhone" className="m-auto" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
