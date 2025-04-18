const onlyTime = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};
const withDateTime = {
  ...onlyTime,
  month: "short",
  day: "numeric",
};

/**
 * Convert a given ISO string date to a human-readable string.
 * @param {string} chatTime - The ISO string date to be converted.
 * @returns {string} A human-readable string of the given date.
 * If the given date is today, the string will be in the format of 'hh:mm a'.
 * If the given date is not today, the string will be in the format of 'MMM d, hh:mm a'.
 */
export const getRedableTimeStamp = (chatTime: string) => {
  if (!chatTime) return '';
  const timeStamp = new Date(chatTime);
  if (!timeStamp || isNaN(timeStamp.getTime())) return '';

  return timeStamp.toLocaleDateString() === new Date().toLocaleDateString()
    ? timeStamp.toLocaleString('en-US', onlyTime as Intl.DateTimeFormatOptions)
    : timeStamp.toLocaleString('en-US', withDateTime as Intl.DateTimeFormatOptions);
};

/**
 * Generates a unique 6-character string using a random number converted to a string of base 36.
 * @returns {string} A unique 6-character string.
 */
export const generateUniqueString = (): string => {
  return Math.random().toString(36).substring(2, 8); // 6-char random string
}

/**
 * Generates a unique file name based on the current timestamp and a 6-character random string.
 * If a file name is provided, its extension will be used. Otherwise, 'jpg' is used as the default extension.
 * @param {string} [originalName] - The original file name. If not provided, a default name is generated.
 * @returns {string} A unique file name.
 */
export const generateUniqueFileName = (originalName: string = ''): string => {
  const timestamp = Date.now();
  const randomString = generateUniqueString();
  const extension = originalName?.split(".").pop() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
};


/**
 * Converts a Blob object into a File object with a specified or generated file name.
 *
 * @param {Blob} blob - The Blob object to be converted to a File.
 * @param {string} [fileName=generateUniqueFileName()] - The desired file name for the new File object.
 * Defaults to a unique file name if not provided.
 * @returns {File} A new File object created from the Blob, with the specified or default file name
 * and the same MIME type as the Blob.
 */

export const convertBlobToFile = (
  blob: Blob,
  fileName: string = generateUniqueFileName(),
  fileType: string = blob.type
): File => {
  const file = new File([blob], fileName, { type: fileType });
  return file;
};

export const getNamesInitials = (fullName = '') => fullName
  .split(' ')
  .map((name) => name.charAt(0).toUpperCase())
  .join('');
