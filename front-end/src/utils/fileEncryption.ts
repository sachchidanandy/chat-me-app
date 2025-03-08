import CryptoJS from "crypto-js";

type encryptedFileType = {
  encryptedBlob: Blob,
  iv: string,
}

export const encryptFile = async (file: File, sharedSecret: string): Promise<encryptedFileType> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const worker = new Worker(new URL("../workers/encryptFileWorker.ts", import.meta.url), {
        type: "module",
      });

      worker.postMessage({
        fileData: new Uint8Array(reader.result as ArrayBuffer),
        sharedSecret,
        fileType: file.type
      });

      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve({
            encryptedBlob: event.data.encryptedBlob,
            iv: event.data.iv,
          });
        }
        worker.terminate(); // Stop worker after use
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
    };

    reader.onerror = (error) => reject(error);
  });
};

export const decryptFile = async (encryptedFile: string, iv: string, sharedSecret: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/decryptFileWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.postMessage({
      encryptedFile,
      iv,
      sharedSecret,
    });

    worker.onmessage = (event) => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data.decryptedFileBlob);
      }
      worker.terminate(); // Stop worker after use
    };

    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
  });
};

export const convertBlobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};
