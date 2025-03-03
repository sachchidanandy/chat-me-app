import { useCallback, useState } from "react";
import useFetch from "./useFetch"
import { encryptFile } from "../utils/fileEncryption";
import { useFriends } from "../contextProvider/FriendsProvider";

export interface iUploadFileMetaData {
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  expiredAt: string;
  iv: string;
};

type uploadFileReturnType = {
  data: iUploadFileMetaData | null,
  error: string | null
}

const useFileUpload = () => {
  const { selectedFriends: { id }, friendsMessageEncKeyMap } = useFriends();
  const { loading, request } = useFetch('/message/upload-file');
  const [uploadPer, setUploadPer] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<uploadFileReturnType> => {
    if (id && friendsMessageEncKeyMap?.has(id) && file) {
      try {
        // encrypt file
        const { encryptedFile, iv } = await encryptFile(file, friendsMessageEncKeyMap.get(id)!);

        // Create form data
        const formData = new FormData();
        formData.append('file', encryptedFile);

        // upload file
        const { error, data } = await request({
          method: 'POST',
          data: formData,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent?.total ?? 0));
            setUploadPer(percent);
          }
        });

        if (error) {
          throw error;
        }

        // return file meta data
        return { data: { ...data, iv } as iUploadFileMetaData, error: null };
      } catch (err: unknown) {
        console.log(err);
        if (err instanceof Error) {
          return { data: null, error: err.message };
        } else {
          // Handle cases where error is not an instance of Error
          return { data: null, error: String(err) };
        }
      }
    } else {
      return { data: null, error: 'missing selected friend id or file data' };
    }
  }, [id, friendsMessageEncKeyMap, request]);

  return { loading, uploadPer, uploadFile };
}

export default useFileUpload;
