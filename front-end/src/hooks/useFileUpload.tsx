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
 * Custom hook to handle file uploading process including encryption and progress tracking.
 * 
 * This hook provides the ability to upload a file to the server, with the file being encrypted
 * using the selected friend's encryption key. It also manages the state of the upload process,
 * including loading status and upload percentage.
 * 
 * @returns {Object} An object containing:
 *  - loading: A boolean indicating the loading state of the upload process.
 *  - uploadPer: A number representing the current upload progress percentage.
 *  - uploadFile: A function to initiate the upload process, which returns a promise that resolves
 *    with the file's upload metadata on success, or throws an error on failure.
 * 
 * @throws Will throw an error if the selected friend ID or file data is missing.
 */

const useFileUpload = () => {
  const { selectedFriends: { id }, friendsMessageEncKeyMap } = useFriends();
  const { request } = useFetch('/message/upload-message-attachment');
  const [uploadPer, setUploadPer] = useState(0);
  const [loading, setLoading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<iUploadFileMetaData | null> => {
      if (id && friendsMessageEncKeyMap?.has(id) && file) {
        setLoading(true);
        try {
          // Encrypt file before uploading
          const { encryptedBlob, iv } = await encryptFile(file, friendsMessageEncKeyMap.get(id)!);

          // Create FormData
          const formData = new FormData();
          formData.append("file", encryptedBlob, file.name); // Keep the original file name

          // Upload file
          const { error, data } = await request({
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
              setUploadPer(percent);
            });

            // Upload success
            socket.once(`uploadComplete-${fileId}`, (uploadFileMetaData) => {
              setUploadPer(100);
              setLoading(false);

              // Cleanup listeners after completion
              socketCleanUp(fileId);
              resolve({ ...uploadFileMetaData, iv }); // Return file metadata with IV
            });

            // Upload error
            socket.once(`uploadError-${fileId}`, (error: string) => {
              setUploadPer(0);
              setLoading(false);

              // Cleanup listeners after completion
              socketCleanUp(fileId);

              reject(error);
            });
          });
        } catch (err: unknown) {
          setLoading(false);
          setUploadPer(0);
          throw err instanceof Error ? err.message : String(err);
        }
      } else {
        throw "Missing selected friend ID or file data";
      }
    },
    [id, friendsMessageEncKeyMap, request]
  );


  return { loading, uploadPer, uploadFile };
}

export default useFileUpload;
