import CryptoJS from "crypto-js";

self.onmessage = async (event: MessageEvent) => {
  const { encryptedFile, iv, sharedSecret } = event.data;
  try {
    // Convert IV back to WordArray from Base64
    const ivWordArray = CryptoJS
      .enc
      .Base64
      .parse(iv);

    // Decrypt file using AES-GCM with the shared secret & IV
    const decryptedFileData = CryptoJS
      .AES
      .decrypt(encryptedFile, CryptoJS.enc.Utf8.parse(sharedSecret), {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

    // Convert decrypted data back to Uint8Array
    const decryptedBytes = new Uint8Array(decryptedFileData.sigBytes);
    for (let i = 0; i < decryptedFileData.sigBytes; i++) {
      decryptedBytes[i] = decryptedFileData.words[i >>> 2] >>> (24 - (i % 4) * 8);
    }

    // Send encrypted data back to main thread
    self.postMessage({ decryptedFileData: decryptedBytes });
  } catch (error: unknown) {
    self.postMessage({ error: String(error) });
  }
};
