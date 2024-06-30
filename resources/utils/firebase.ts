import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FCM_API_KEY as string,
  authDomain: 'flight-logger-278103.firebaseapp.com',
  projectId: 'flight-logger-278103',
  storageBucket: 'flight-logger-278103.appspot.com',
  messagingSenderId: '560106896800',
  appId: '1:560106896800:web:d7a78ab62ea916e95978c5',
  measurementId: 'G-H5G99GVXN0',
});

export const messaging = getMessaging(firebaseApp);
