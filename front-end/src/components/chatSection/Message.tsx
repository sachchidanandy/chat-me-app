import { CSSProperties, memo, useEffect, useState } from "react";
import { useAuth } from "../../contextProvider/AuthProvider"
import { iMessage } from "../../contextProvider/ChatProvider";
import AnimationStyles from '../../utils/animation.module.css'
import { convertBlobToFile, getRedableTimeStamp } from "../../utils/helpers";
import { FilePreviewContainer } from "../FilePreview";
import { axiosInstance } from "../../hooks/useFetch";
import { decryptFile } from "../../utils/fileEncryption";
import { useFriends } from "../../contextProvider/FriendsProvider";
import Loader, { eLoaderTypes } from "../Loader";
import axios from "axios";
import Svg from "../Svg";

type MessagePropsType = {
  message: iMessage;
  style?: CSSProperties
}
const Message = memo(({ style, message }: MessagePropsType) => {
  const { msg, timestamp, senderId, file, attachment } = message;
  const [thumbnail, setThumbnail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadedFile, setDownloadedFile] = useState<File | Blob | null | undefined>(file);
  const { user } = useAuth();
  const { selectedFriendEncKey } = useFriends();
  const userId = user?.userId;

  const { chatContainerClass, messageClass } = senderId === userId ? {
    chatContainerClass: `chat chat-end ${AnimationStyles.slideInRightMessage}`,
    messageClass: 'chat-bubble chat-bubble-secondary'
  } : {
    chatContainerClass: `chat chat-start ${AnimationStyles.slideInLeftMessage}`,
    messageClass: 'chat-bubble chat-bubble-primary'
  };

  const handleDownload = async () => {
    if (attachment && attachment.fileUrl && selectedFriendEncKey) {
      try {
        setLoading(true);
        const fileUrl = attachment.fileUrl;
        // download file string from s3
        const encryptedFile: Blob = (await axios.get(fileUrl, { responseType: "blob" })).data;
        // decrypt file
        const decryptedBlob = await decryptFile(encryptedFile, attachment.iv, selectedFriendEncKey as string, attachment.fileType);
        // convert blob to file
        const decryptedFile = convertBlobToFile(decryptedBlob, attachment.fileName, attachment.fileType);
        setDownloadedFile(decryptedFile);
        setLoading(false);
      } catch (error) {
        console.log('Error while downloading file: ', error);
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (attachment && attachment?.thumbnailName && !thumbnail && !downloadedFile) {
      (async () => {
        const { data } = (await axiosInstance.get(`/thumbnail/${attachment?.thumbnailName}`)).data;
        data?.thumbnailUrl && setThumbnail(data.thumbnailUrl);
      })();
    }
  }, [attachment]);

  return (
    <div className={chatContainerClass} style={style}>
      <div className={messageClass}>
        {downloadedFile && <FilePreviewContainer file={downloadedFile} />}
        {attachment && !downloadedFile && thumbnail ? (
          <div className="flex items-center relative w-20 mb-2">
            <img src={thumbnail} alt="Blurred Video Preview" width={80} className="blur-xs" />
            {
              loading ? <Loader
                type={eLoaderTypes.SPINNER}
                size="size-8"
                clsName="absolute right-[26px] text-gray-700"
              /> : <Svg
                svgName="download-icon"
                className="size-8 absolute right-[26px] text-gray-700 cursor-pointer btn-circle btn-ghost"
                onClick={handleDownload}
              />
            }
          </div>
        ) : null}
        {msg}
        <p className="float-right text-xs mt-7">{getRedableTimeStamp(timestamp)}</p>
      </div>
    </div>
  )
});

export default Message;
