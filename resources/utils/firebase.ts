import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  TwitterAuthProvider,
  type UserCredential,
} from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDC_uQT5AUbabxWqGAFgGHc03rZB2de24E',
  authDomain: 'flight-logger.stratospherelabs.io',
  projectId: 'flight-logger-278103',
  storageBucket: 'flight-logger-278103.appspot.com',
  messagingSenderId: '560106896800',
  appId: '1:560106896800:web:d7a78ab62ea916e95978c5',
  measurementId: 'G-H5G99GVXN0',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);

const auth = getAuth(app);
connectAuthEmulator(auth, 'http://localhost:9099');

// Define provider instances for Google, GitHub, and Twitter
const providers = {
  google: new GoogleAuthProvider(),
  github: new GithubAuthProvider(),
  twitter: new TwitterAuthProvider(),
};

export const signInWithProvider = async (
  provider: 'google' | 'github' | 'twitter',
): Promise<void> => {
  const authProvider = providers[provider];
  await signInWithRedirect(auth, authProvider);
};

export const getRedirectResultFromProvider =
  async (): Promise<UserCredential | null> => {
    const result = await getRedirectResult(auth);
    return result;
  };

export const handleProviderSignIn = async (
  provider: 'google' | 'github' | 'twitter',
): Promise<void> => {
  try {
    await signInWithProvider(provider);
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
  }
};

export { auth };
