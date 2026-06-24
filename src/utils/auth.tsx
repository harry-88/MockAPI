import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  onIdTokenChanged,
  GoogleAuthProvider,
  type User as FbUser,
} from 'firebase/auth';
import { auth } from './firebase';

export interface User {
  id: string;
  email: string;
  name?: string;
}

function toUser(u: FbUser): User {
  return { id: u.uid, email: u.email!, name: u.displayName || undefined };
}

async function session(u: FbUser) {
  return { user: toUser(u), accessToken: await u.getIdToken() };
}

export async function signUp(email: string, password: string, name: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  return session(user);
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return session(user);
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
  return session(user);
}

export async function signOut() {
  await fbSignOut(auth);
}

// Resolve the current session once auth state is known.
export function getSession(): Promise<{ user: User; accessToken: string } | null> {
  return new Promise((resolve) => {
    const unsub = onIdTokenChanged(auth, async (u) => {
      unsub();
      resolve(u ? await session(u) : null);
    });
  });
}

export function onAuthStateChange(
  callback: (user: User | null, accessToken: string | null) => void,
) {
  // onIdTokenChanged (not onAuthStateChanged) also fires on the SDK's hourly
  // token refresh, so the stored access token never goes stale mid-session.
  const unsubscribe = onIdTokenChanged(auth, async (u) => {
    if (u) callback(toUser(u), await u.getIdToken());
    else callback(null, null);
  });
  // Shape mirrors the previous Supabase return so AuthContext is unchanged.
  return { data: { subscription: { unsubscribe } } };
}
