importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAH078GBR5TUTtBDLU4K91xM9GOjfvEC4w",
  authDomain: "medi-b2bfe.firebaseapp.com",
  projectId: "medi-b2bfe",
  storageBucket: "medi-b2bfe.firebasestorage.app",
  messagingSenderId: "77632590696",
  appId: "1:77632590696:web:7d760f40b6a118bd85fcdd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
