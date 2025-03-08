import CryptoJS from 'crypto-js';
self.onmessage = async (event: MessageEvent) => {
  const { fileData, sharedSecret, fileType } = event.data;
  try {
    const iv = CryptoJS.lib.WordArray.random(16);

    const encryptedFile = CryptoJS.AES.encrypt(
      CryptoJS.lib.WordArray.create(fileData),
      sharedSecret,
      { iv }
    ).toString();

    // Convert encrypted string into a Blob
    const encryptedBlob = new Blob([encryptedFile], { type: fileType }); // Keep the original type

    // Send encrypted data back to main thread
    self.postMessage({
      encryptedBlob,
      iv: CryptoJS.enc.Base64.stringify(iv),
    });
  } catch (error: unknown) {
    self.postMessage({ error: String(error) });
  }
};
