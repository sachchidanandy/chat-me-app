import React, { useEffect, useState } from "react";
import data from '@emoji-mart/data'
import EmojiPicker from '@emoji-mart/react'

import Svg from "../Svg";
import { useChat } from "../../contextProvider/ChatProvider";
import CameraModal from "../CameraModal";
import FilePreview from "../FilePreview";
import { convertBlobToFile } from "../../utils/fileEncryption";
import useFileUpload, { iUploadFileMetaData } from "../../hooks/useFileUpload";
import { useAuth } from "../../contextProvider/AuthProvider";
import { eToastType } from "../toast/Toast";

const ChatFooter = () => {
  const { sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const { handleToastToogle } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | Blob | null>(null);
  const { loading: fileUploadLoading, uploadPer, uploadFile } = useFileUpload();

  const handleEmojiClick = (emoji: any) => {
    setMessage(prevMessage => prevMessage + emoji.native);
  };

  const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (message.trim() !== '' || mediaFile) {
      try {
        let file = mediaFile;
        // Check if a mediaFile is a Blob not File
        if (mediaFile instanceof Blob && !(mediaFile instanceof File)) {
          // Convert Blob to File
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2); // generate a random string
          file = convertBlobToFile(mediaFile, `file-${timestamp}-${randomStr}.jpg`) as File;
        }

        let fileMetaData: null | iUploadFileMetaData = null;
        if (file) {
          fileMetaData = await uploadFile(file as File);
        }
        // sendMessage(message.trim(), fileMetaData);
      } catch (err) {
        console.log(err);
        handleToastToogle('Unable to send message', eToastType.error);
      }
    }
    setMessage('');
    setMediaFile(null);
  };

  const handleMediaCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setMediaFile(file);
      setShowFilePicker(false);
    }
  };

  useEffect(() => {
    if (mediaFile) {
      (document.getElementById('file-preview-modal') as HTMLDialogElement).showModal();
    } else {
      (document.getElementById('file-preview-modal') as HTMLDialogElement).close();
    }
  }, [mediaFile]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 justify-center relative">
      <button className="btn btn-circle btn-ghost text-white" onClick={() => setShowPicker(prev => !prev)}>
        <Svg svgName="emoji" />
      </button>
      <label className="input input-bordered flex items-center gap-2 max-w-4xl w-full bg-primary-content text-white h-14">
        <form className="w-full" onSubmit={handleSendMessage}>
          <input type="text" className="grow w-full text-lg" placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} />
        </form>
        <button className="btn btn-circle btn-ghost text-white relative" onClick={() => setShowFilePicker(prev => !prev)}>
          <Svg svgName="attachment-button" />
        </button>
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
        <button className="btn btn-circle btn-primary" onClick={handleSendMessage}>
          <Svg svgName="send-message" className="ml-2" />
        </button>
      ) : (
        <button className="btn btn-circle btn-ghost text-white">
          <Svg svgName="send-voice-message" />
        </button>
      )}

      {showFilePicker && (
        <ul className="list bg-base-100 rounded-box shadow-md w-44 absolute bottom-14 mb-3 py-2 right-20">
          <li onClick={() => {
            !isCameraOpen && (document.getElementById('camera-modal') as HTMLDialogElement)?.showModal();
            setIsCameraOpen(!isCameraOpen);
            setShowFilePicker(false);
          }}
            className="list-row flex items-center gap-2 mb-1 btn-ghost cursor-pointer rounded-sm px-1">
            <Svg svgName="camera" className="size-8" /> Camera
          </li>
          <li className="list-row mb-1 btn-ghost cursor-pointer rounded-sm px-1">
            <label className="flex items-center gap-2">
              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaCapture} />
              <Svg svgName="image-upload" className="size-8" /> Photo & Video
            </label>
          </li>
          <li className="list-row btn-ghost cursor-pointer rounded-sm px-1">
            <label className="flex items-center gap-2">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.ppt,.xls,.xlsx" onChange={handleMediaCapture} />
              <Svg svgName="document-upload" className="size-8" /> Document
            </label>
          </li>
        </ul>
      )}

      <CameraModal
        onFileSelect={(file: Blob) => setMediaFile(file)}
        onClose={() => { setMediaFile(null); setIsCameraOpen(false); }}
        openCamera={isCameraOpen}
      />

      <FilePreview
        file={mediaFile}
        onClose={() => setMediaFile(null)}
        setMessage={setMessage}
        message={message}
        handleSendMessage={handleSendMessage}
        fileUploadLoading={fileUploadLoading}
        uploadPer={uploadPer}
      />
    </div>
  );
};

export default ChatFooter;
