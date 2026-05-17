import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  User,
} from 'firebase/auth';

import { auth } from '@/config/firebase';

// Initialize Google Sign-In with Web Client ID from environment variables
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
console.log('[Google Auth Config] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is:', webClientId);
if (webClientId) {
  GoogleSignin.configure({
    webClientId,
  });
} else {
  console.warn('[Google Auth Config] WARNING: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is undefined!');
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function ensureAnonymousAuth() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function getCurrentUserId() {
  return auth.currentUser?.uid ?? null;
}

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    const idToken = (response as any).idToken ?? (response as any).data?.idToken;
    if (!idToken) {
      throw new Error('No ID Token received from Google Sign-In.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}