import React, { memo, useEffect, useState } from "react";
import Svg from "./Svg";
import Loader, { eLoaderTypes } from "./Loader";

interface iFilePreviewProps {
  file: File | Blob | null;
  onClose: () => void;
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void;
  fileUploadLoading: boolean;
  uploadPer: number;
}
const FilePreviewContainer = memo(({ file }: { file: File | Blob }) => {
  const fileType = file && file.type;
  const [fileURL, setFileUrl] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);

    return () => {
      URL.revokeObjectURL(`${url}`);
    }
  }, [file]);

  return file && fileURL ? (fileType?.startsWith("image") ? (
    <img src={fileURL} alt="Preview" className="max-w-80 sm:max-w-96 h-auto mt-2" />
  ) : fileType?.startsWith("video") ? (
    <video controls className="max-w-80 sm:max-w-96 h-auto mt-2">
      <source src={fileURL} type={fileType} />
      Your browser does not support the video tag.
    </video>
  ) : fileType === "application/pdf" ? (
    <div className="size-80 mt-2 sm:size-96 flex justify-center flex-col">
      <iframe src={fileURL} className="w-full h-full pt-2" title="PDF Preview"></iframe>
      <p className="mt-4 text-sm">{file instanceof File ? file.name : "Unsupported file type"}</p>
    </div>
  ) : (
    <div className="size-80 mt-2 sm:size-96 flex justify-center flex-col">
      <Svg svgName="file" className="size-80" />
      <p className="mt-4 text-sm">{file instanceof File ? file.name : "Unsupported file type"}</p>
    </div>
  )) : null
});

const FilePreview: React.FC<iFilePreviewProps> = (props) => {
  const { file, onClose, handleSendMessage, message, setMessage, fileUploadLoading, uploadPer } = props;

  return (
    <dialog id="file-preview-modal" className="modal modal-bottom md:modal-middle justify-center">
      <div
        className="p-4 border rounded-lg text-center text-white relative bg-slate-700 modal-box"
        style={{ width: "auto", height: 'auto' }}>
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>X</button>
        </form>
        <h3 className="font-semibold">File Preview</h3>

        {fileUploadLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-center">
              <Loader type={eLoaderTypes.BARS} size="size-12" />
              <p className="mt-2">{uploadPer}%</p>
            </div>
          </div>
        )}

        {file ? <FilePreviewContainer file={file} /> : null}
        {file && <form className="w-full mt-4" onSubmit={handleSendMessage}>
          <input type="text" disabled={fileUploadLoading} className="grow w-full text-lg input-md" placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="btn btn-circle btn-primary mt-2" type="submit" disabled={fileUploadLoading}>
            <Svg svgName="send-message" className="ml-2" />
          </button>
        </form>}
      </div>
    </dialog>
  );
};

export default FilePreview;
