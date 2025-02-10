import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import CryptoJS from 'crypto-js';
import { iKeyPair } from '../types/common';

export const generateEncryptionKeys = (): iKeyPair => {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
};

export const storePrivateKey = (privateKey: string): void => {
  localStorage.setItem('privateKey', privateKey);
};

export const getPrivateKey = (): string | null => {
  return localStorage.getItem('privateKey');
};

export const removePrivateKey = (): void => {
  localStorage.removeItem('privateKey');
}

export const encryptPrivateKey = (privateKey: string, passphrase: string): string => {
  // Hash the passphrase into a 32-byte key using SHA-256
  const passphraseBytes = naclUtil.decodeBase64(
    CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(passphrase))
  );
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const privateKeyBytes = naclUtil.decodeBase64(privateKey);

  const encrypted = nacl.secretbox(privateKeyBytes, nonce, passphraseBytes);
  return JSON.stringify({
    cipherText: naclUtil.encodeBase64(encrypted),
    nonce: naclUtil.encodeBase64(nonce),
  });
};

export const decryptPrivateKey = (encryptedData: string, passphrase: string): string | null => {
  const { cipherText, nonce } = JSON.parse(encryptedData);
  // Decode the cipherText and nonce from Base64
  const cipherTextBytes = naclUtil.decodeBase64(cipherText);
  const nonceBytes = naclUtil.decodeBase64(nonce);

  // Hash the passphrase into a 32-byte key using SHA-256
  const passphraseBytes = naclUtil.decodeBase64(
    CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(passphrase))
  );

  const decrypted = nacl.secretbox.open(cipherTextBytes, nonceBytes, passphraseBytes);
  return decrypted ? naclUtil.encodeBase64(decrypted) : null;
};

export const getMessageEncryptionSecret = (recipientPublicKey: string, senderPrivateKey: string): string => {
  const recipientKeyUint8 = naclUtil.decodeBase64(recipientPublicKey);
  const senderKeyUint8 = naclUtil.decodeBase64(senderPrivateKey);
  const sharedSecret = nacl.box.before(recipientKeyUint8, senderKeyUint8);
  return naclUtil.encodeBase64(sharedSecret);
};
