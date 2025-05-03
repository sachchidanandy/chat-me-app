export const EMAIL_ALREADY_REGISTERED = 'Email Id already registerd.';
export const USER_NOT_FOUND = 'User not found.';
export const EMAIL_NOT_REGISTERED = 'Email Id not registerd.';
export const INVALID_CREDENTIALS = 'Invalid credentials.';
export const INT_SER_ERROR = 'Sorry something went wrong.';
export const INVALID_TOKEN = 'Invalid auth token.';
export const AUTH_TOKEN_REQ = 'Auth token missing.';
export const SEARCH_QUERY_REQ = 'Search Query is required';
export const ALREADY_A_FRIEND = 'Given users are already friends';
export const NO_REQUEST_FOUND = 'No friend request found';
export const NO_FRIEND_FOUND = 'No friends found';
export const NO_FILE_FOUND = 'No file found';
export const INVALID_THUMBNAIL = 'Thumbnail URL and file name are required';
export const INVALID_REST_PASSWORD_TOKEN = 'Invalid reset password token.';
export const EXPIRED_REST_PASSWORD_TOKEN = 'Reset password token has been expired.';
export const PASSWORD_MISMATCH = 'Confirm Password and Password mismatch.';
export const ALREADY_SENT_REQUEST = (fullName: string, date: Date) => `You have already send request to ${fullName} on ${new Date(date).toDateString()}`
export const URL_DO_NOT_EXIST = (method: string, path: string) => `Method: [${method}], Path: [${path}] Don't exist, please check it.`;
