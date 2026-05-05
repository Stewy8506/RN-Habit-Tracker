import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

import { auth } from '@/config/firebase';

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
