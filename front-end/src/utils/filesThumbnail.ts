// Function to generate and compress a video thumbnail
type FileType = File;

/**
 * Generate a compressed thumbnail of a video file.
 *
 * @param {FileType} file - The video file to generate a thumbnail for.
 * @return {Promise<string>} - A promise that resolves with a base64 encoded string of the thumbnail.
 *
 * This function generates a thumbnail by capturing the first frame of a video and resizing it to
 * 80x80. The thumbnail is then compressed to 50% quality and returned as a base64 encoded string.
 */
const generateCompressedVideoThumbnail = (file: FileType): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.currentTime = 0.1; // Capture first frame

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = 80; // Resize thumbnail
      const height = 80;
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.6)); // Compress to 50% quality
      }
    };
  });
};


/**
 * Generate a compressed thumbnail of an image file.
 *
 * @param {FileType} file - The image file to generate a thumbnail for.
 * @return {Promise<string>} - A promise that resolves with a base64 encoded string of the thumbnail.
 *
 * This function generates a thumbnail by resizing the image to 80x80 and compressing it to 50% quality.
 * The thumbnail is then returned as a base64 encoded string.
 */
const generateCompressedImageThumbnail = (file: FileType): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const width = 80;
        const height = (img.height / img.width) * width;
        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6)); // Compress to 50% quality
        }
      };
    };
  });
};


/**
 * Generate a compressed thumbnail for a document file.
 *
 * @return {Promise<string>} - A promise that resolves with a base64 encoded string of the thumbnail.
 *
 * This function generates a thumbnail by creating a simple document icon with text on a canvas
 * and then compressing it to 50% quality and returning it as a base64 encoded string in PNG format.
 */
const generateCompressedDocumentThumbnail = (): Promise<string> => {
  return new Promise((resolve) => {
    // Placeholder: Generate a simple document icon with text
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 80;
    const height = 80;
    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.fillStyle = "#f3f3f3";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.fillText("DOC", 20, 40);
      resolve(canvas.toDataURL("image/png", 0.6)); // Compress and return as PNG
    }
  });
};

// Function to generate a thumbnail based on file type
export const generateCompressedThumbnail = async (file: FileType): Promise<string> => {
  if (file.type.startsWith("video/")) {
    return await generateCompressedVideoThumbnail(file);
  } else if (file.type.startsWith("image/")) {
    return await generateCompressedImageThumbnail(file);
  } else {
    return await generateCompressedDocumentThumbnail();
  }
};
