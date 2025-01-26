
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { EncryptedMessage } from '../types/common';

export const encryptMessage = (message: string, sharedSecret: string): EncryptedMessage => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = naclUtil.decodeUTF8(message);
  const sharedSecretUint8 = naclUtil.decodeBase64(sharedSecret);

  const encrypted = nacl.box.after(messageUint8, nonce, sharedSecretUint8);
  return {
    cipherText: naclUtil.encodeBase64(encrypted),
    nonce: naclUtil.encodeBase64(nonce),
  };
};

export const decryptMessage = (encrypted: EncryptedMessage, sharedSecret: string): string | null => {
  const cipherTextUint8 = naclUtil.decodeBase64(encrypted.cipherText);
  const nonceUint8 = naclUtil.decodeBase64(encrypted.nonce);
  const sharedSecretUint8 = naclUtil.decodeBase64(sharedSecret);

  const decrypted = nacl.box.open.after(cipherTextUint8, nonceUint8, sharedSecretUint8);
  return decrypted ? naclUtil.encodeUTF8(decrypted) : null;
};
