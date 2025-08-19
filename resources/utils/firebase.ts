import { initializeApp } from 'firebase/app';
import { type Messaging, getMessaging } from 'firebase/messaging';

export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FCM_API_KEY as string,
  authDomain: 'flight-logger-278103.firebaseapp.com',
  projectId: 'flight-logger-278103',
  storageBucket: 'flight-logger-278103.appspot.com',
  messagingSenderId: '560106896800',
  appId: '1:560106896800:web:d7a78ab62ea916e95978c5',
  measurementId: 'G-H5G99GVXN0',
});

export let messaging: Messaging | undefined;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(firebaseApp);
  } catch (e) {
    console.warn('Firebase messaging not supported in this environment');
  }
}
