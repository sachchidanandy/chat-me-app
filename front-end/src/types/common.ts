export interface iKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface iEncryptedMessage {
  cipherText: string;
  nonce: string;
}

export interface iMessagePayload {
  senderId: string;
  recipientId: string;
  encryptedMessage: iEncryptedMessage;
}
export interface iSearchUser {
  id: string;
  fullName: string;
  profilePicUrl: string;
  username: string;
  isRequestSent: boolean;
}