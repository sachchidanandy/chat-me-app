import { useState, useRef, useEffect } from "react";

interface iCameraModalProps {
  openCamera: boolean;
  onClose?: () => void;
  onFileSelect: (file: Blob) => void;

}

const CameraModal = ({ onClose, onFileSelect, openCamera }: iCameraModalProps) => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) onFileSelect(blob);
        }, "image/png");
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
    document.getElementById("close-camera-button")?.click();
    onClose && onClose();
  }

  useEffect(() => {
    if (!openCamera) return;
    startCamera();
  }, [openCamera]);

  return (
    <dialog id="camera-modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button id="close-camera-button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={stopCamera}>✕</button>
        </form>

        {isCameraOpen && (
          <div className="flex flex-col items-center mt-4">
            <video ref={videoRef} autoPlay className="w-full max-w-md" />
            <canvas ref={canvasRef} className="hidden" width={640} height={480} />
            <div className="flex gap-2 mt-4">
              <button onClick={capturePhoto} className="btn btn-primary">Capture</button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default CameraModal;
