import { useCallback, useState } from "react";
import useFetch from "./useFetch"
import { encryptFile } from "../utils/fileEncryption";
import { useFriends } from "../contextProvider/FriendsProvider";
import socket from "../utils/socket";

export interface iUploadFileMetaData {
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  expiredAt: string;
  iv: string;
  thumbnailName: string;
};

/**
 * Remove all socket listeners for the given file id.
 * @param {string} fileId The file id to remove listeners for.
 */
const socketCleanUp = (fileId: string) => {
  // Cleanup existing listeners before adding new ones
  socket.off(`uploadProgress-${fileId}`);
  socket.off(`uploadComplete-${fileId}`);
  socket.off(`uploadError-${fileId}`);
};

/**
 * Returns an object with the current file upload loading state and a function
 * to upload a file to S3. The function takes a file and optional thumbnail
 * and thumbnail name as arguments. It returns a promise that resolves with
 * the file metadata and IV after the upload is complete. The promise is
 * rejected if there is an error.
 *
 * The function also sets the loading state to "Encrypting..." and "Uploading..."
 * while the encryption and upload are in progress, respectively. It resets
 * the loading state to an empty string after the upload is complete.
 *
 * The loading state is updated in real time as the upload progresses.
 *
 * @returns An object with the loading state and the uploadFile function.
 */
const useFileUpload = (): { loading: string, uploadFile: (file: File, thumbnail?: string, thumbnailName?: string) => Promise<iUploadFileMetaData | null> } => {
  const { selectedFriendEncKey } = useFriends();
  const { request: uploadImageToS3 } = useFetch('/message/upload-message-attachment');
  const { request: uploadThumbnail } = useFetch('/thumbnail');
  const [loading, setLoading] = useState('');

  const uploadFile = useCallback(
    async (file: File, thumbnail?: string, thumbnailName?: string): Promise<iUploadFileMetaData | null> => {
      if (selectedFriendEncKey && file) {
        setLoading('Encrypting...');
        try {
          // Encrypt file before uploading
          const { encryptedBlob, iv } = await encryptFile(file, selectedFriendEncKey!);
          setLoading('Uploading...');

          // Upload thumbnail
          if (thumbnail && thumbnailName) {
            const { error: thumbnailError } = await uploadThumbnail({
              method: "POST",
              data: {
                thumbnailUrl: thumbnail,
                fileName: thumbnailName
              },
            });

            if (thumbnailError) {
              throw thumbnailError;
            }
          }

          // Create FormData
          const formData = new FormData();
          formData.append("file", encryptedBlob, file.name); // Keep the original file name

          // Upload file
          const { error, data } = await uploadImageToS3({
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: formData,
            timeout: 0,
          });

          if (error || !data?.fileId) {
            throw error;
          }

          const fileId = data.fileId as string;

          return new Promise((resolve, reject) => {
            socketCleanUp(fileId);
            // Update upload progress
            socket.on(`uploadProgress-${fileId}`, (percent: number) => {
              setLoading(`${percent}%`);
            });

            // Upload success
            socket.once(`uploadComplete-${fileId}`, (uploadFileMetaData) => {
              setLoading('100%');

              // Cleanup listeners after completion
              socketCleanUp(fileId);
              setLoading('');
              resolve({ ...uploadFileMetaData, iv, thumbnailName }); // Return file metadata with IV
            });

            // Upload error
            socket.once(`uploadError-${fileId}`, (error: string) => {
              setLoading('');

              // Cleanup listeners after completion
              socketCleanUp(fileId);

              reject(error);
            });
          });
        } catch (err: unknown) {
          setLoading('');
          throw err instanceof Error ? err.message : String(err);
        }
      } else {
        throw "Missing selected friend ID or file data";
      }
    },
    [selectedFriendEncKey, uploadImageToS3, uploadThumbnail]
  );


  return { loading, uploadFile };
}

export default useFileUpload;
