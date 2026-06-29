// encryptor.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = CryptoJS.enc.Utf8.parse("h7f49c2f1c56c1ea0d7fd3c2c1c38a5n"); // must be 32 bytes
const IV = CryptoJS.enc.Utf8.parse("0000000000000000"); // 16 bytes
const SIGNING_SECRET = "957c64b5aabf78df346f6db57c2c104f";

export function encryptAndSignData(payload) {
  const stringified = JSON.stringify(payload);

  const encrypted = CryptoJS.AES.encrypt(stringified, ENCRYPTION_KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(); // This is base64 by default

  const signature = CryptoJS.HmacSHA256(encrypted, SIGNING_SECRET).toString();

  return {
    data: encrypted,
    signature,
  };
}
