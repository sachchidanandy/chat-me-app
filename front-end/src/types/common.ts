export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  cipherText: string;
  nonce: string;
}

export interface MessagePayload {
  senderId: string;
  recipientId: string;
  encryptedMessage: EncryptedMessage;
}
