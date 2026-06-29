importScripts(
  "https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAWnTEyeQ49CpeYfobweZ3iTPAa4WYg3a8",
  authDomain: "nuvi-wallet.firebaseapp.com",
  projectId: "nuvi-wallet",
  storageBucket: "nuvi-wallet.firebasestorage.app",
  messagingSenderId: "782252332261",
  appId: "1:782252332261:web:e7d671d1371f69555eb00c",
  measurementId: "G-YQY67TFCBC",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );
  const notificationTitle = payload.notification.title;

  const notificationOptions = {
    body: payload.notification.body,
    // icon: payload.notification.image,
    icon: payload.notification?.icon,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
