import CryptoJS from "crypto-js";

type encryptedFileType = {
  encryptedFile: string,
  iv: string,
}

export const encryptFile = async (file: File, sharedSecret: string): Promise<encryptedFileType> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const fileData = new Uint8Array(reader.result as ArrayBuffer);

      // Generate a random IV (16 bytes for AES-GCM)
      const iv = CryptoJS.lib.WordArray.random(16);

      // Encrypt file using AES-GCM with the shared secret & IV
      const encryptedFile = CryptoJS.AES.encrypt(
        CryptoJS.lib.WordArray.create(fileData),
        sharedSecret,
        { iv }
      ).toString();

      resolve({ encryptedFile, iv: CryptoJS.enc.Base64.stringify(iv) });
    };

    reader.onerror = (error) => reject(error);
  });
};

export const decryptFile = async (encryptedFile: string, iv: string, sharedSecret: string): Promise<Blob> => {
  // Convert IV back to WordArray
  const ivWordArray = CryptoJS.enc.Base64.parse(iv);

  // Decrypt file using AES-GCM with the shared secret & IV
  const decryptedFileData = CryptoJS.AES.decrypt(encryptedFile, sharedSecret, { iv: ivWordArray }).toString(CryptoJS.enc.Utf8);

  return new Blob([decryptedFileData], { type: "application/octet-stream" });
};

export const convertBlobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};
