import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAWnTEyeQ49CpeYfobweZ3iTPAa4WYg3a8",
  authDomain: "nuvi-wallet.firebaseapp.com",
  projectId: "nuvi-wallet",
  storageBucket: "nuvi-wallet.firebasestorage.app",
  messagingSenderId: "782252332261",
  appId: "1:782252332261:web:e7d671d1371f69555eb00c",
  measurementId: "G-YQY67TFCBC",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
