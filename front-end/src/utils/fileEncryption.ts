type encryptedFileType = {
  encryptedBlob: Blob,
  iv: string
}

export const encryptFile = async (file: File, sharedSecret: string): Promise<encryptedFileType> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const worker = new Worker(
        new URL("../workers/encryptFileWorker.ts", import.meta.url),
        { type: "module" }
      );

      worker.postMessage({
        fileData: new Uint8Array(reader.result as ArrayBuffer),
        sharedSecret,
        fileType: file.type
      });

      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve({ encryptedBlob: event.data.encryptedBlob, iv: event.data.iv });
        }
        worker.terminate(); // Stop worker after use
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const decryptFile = async (
  encryptedFileBlob: Blob,
  ivBase64: string,
  sharedSecret: string,
  fileType: string
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const worker = new Worker(
          new URL("../workers/decryptFileWorker.ts", import.meta.url),
          { type: "module" }
        );
        const encryptedData = reader.result as string;

        worker.postMessage({ encryptedFile: encryptedData, iv: ivBase64, sharedSecret });

        worker.onmessage = (event) => {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            const decryptedFileBlob = new Blob(
              [event.data.decryptedFileData],
              { type: fileType }
            );
            resolve(decryptedFileBlob);
          }
          worker.terminate(); // Stop worker after use
        };

        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
        };
      } catch (error) { }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(encryptedFileBlob);
  });
};
