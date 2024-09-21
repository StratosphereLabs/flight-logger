import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const FlightLoggerFirebaseApp = initializeApp({
  apiKey: 'AIzaSyA3aNvnvseoAlldeZHPAcM09Bt8d5OuhbM',
  authDomain: 'flight-logger-278103.firebaseapp.com',
  projectId: 'flight-logger-278103',
  storageBucket: 'flight-logger-278103.appspot.com',
  messagingSenderId: '560106896800',
  appId: '1:560106896800:web:d7a78ab62ea916e95978c5',
  measurementId: 'G-H5G99GVXN0',
});

const messaging = getMessaging(FlightLoggerFirebaseApp);

// Foreground Message Handler
messaging.onMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received foreground message: ',
    payload,
  );
  // ...
});

// Background Message Handler
messaging.onBackgroundMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message: ',
    payload,
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
