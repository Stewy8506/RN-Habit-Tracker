import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, type Dependencies } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'replace-with-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'replace-with-auth-domain',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'replace-with-project-id',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'replace-with-storage-bucket',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'replace-with-messaging-sender-id',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'replace-with-app-id',
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

const appStorage = createAsyncStorage('productivity-app-auth');

function createAuth() {
  const getReactNativePersistence = (
    FirebaseAuth as typeof FirebaseAuth & {
      getReactNativePersistence: (storage: typeof appStorage) => Dependencies['persistence'];
    }
  ).getReactNativePersistence;

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(appStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const auth = createAuth();
