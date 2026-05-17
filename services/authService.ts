import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  User,
} from 'firebase/auth';

import { auth } from '@/config/firebase';

// Initialize Google Sign-In with Web Client ID from environment variables
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (webClientId) {
  GoogleSignin.configure({
    webClientId,
  });
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
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // If the current user is anonymous, LINK the Google credential to preserve
    // the existing UID and all Firestore data (tasks, habits, completions).
    const currentUser = auth.currentUser;
    if (currentUser?.isAnonymous) {
      try {
        const linked = await linkWithCredential(currentUser, googleCredential);
        console.log('[Google Auth] Successfully linked Google to anonymous account. UID preserved:', linked.user.uid);
        return linked.user;
      } catch (linkError: any) {
        // credential-already-in-use means this Google account is already
        // associated with a different Firebase user. Fall back to sign-in
        // which will switch to that existing Google account.
        if (linkError?.code === 'auth/credential-already-in-use') {
          console.warn('[Google Auth] Google account already linked to another user. Signing in directly.');
          const result = await signInWithCredential(auth, googleCredential);
          return result.user;
        }
        throw linkError;
      }
    }

    // Not anonymous (or no user) — just sign in directly.
    const result = await signInWithCredential(auth, googleCredential);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}