import CryptoJS from 'crypto-js';
self.onmessage = async (event: MessageEvent) => {
  const { fileData, sharedSecret, fileType } = event.data;
  try {
    const iv = CryptoJS
      .lib
      .WordArray
      .random(16);
    const wordArray = CryptoJS
      .lib
      .WordArray
      .create(fileData);

    const encryptedFile = CryptoJS
      .AES
      .encrypt(wordArray, CryptoJS.enc.Utf8.parse(sharedSecret), {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      .toString();

    // Convert encrypted string into a Blob
    const encryptedBlob = new Blob([encryptedFile], { type: fileType }); // Keep the original type

    // Send encrypted data back to main thread
    self.postMessage({
      encryptedBlob, iv: CryptoJS
        .enc
        .Base64
        .stringify(iv)
    });
  } catch (error: unknown) {
    self.postMessage({ error: String(error) });
  }
};
