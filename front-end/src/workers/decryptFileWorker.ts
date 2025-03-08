import CryptoJS from "crypto-js";

self.onmessage = async (event: MessageEvent) => {
  const { encryptedFile, iv, sharedSecret } = event.data;
  try {
    // Convert IV back to WordArray
    const ivWordArray = CryptoJS.enc.Base64.parse(iv);

    // Decrypt file using AES-GCM with the shared secret & IV
    const decryptedFileData = CryptoJS.AES.decrypt(encryptedFile, sharedSecret, { iv: ivWordArray }).toString(CryptoJS.enc.Utf8);

    const decryptedFileBlob = new Blob([decryptedFileData], { type: "application/octet-stream" });

    // Send encrypted data back to main thread
    self.postMessage({
      decryptedFileBlob,
    });
  } catch (error: unknown) {
    self.postMessage({ error: String(error) });
  }
};
