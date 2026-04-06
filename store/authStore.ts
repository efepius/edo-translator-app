/**
 * store/authStore.ts
 * Zustand auth store — manages Firebase Auth state for BiZY
 */

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  subscriptionId?: string;
  subscriptionEnd?: Date;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: (idToken: string, accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  loadProfile: (uid: string) => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  /**
   * Sign in with email/password
   */
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await get().loadProfile(cred.user.uid);
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      set({ error: getFriendlyAuthError(e.code), loading: false });
      throw err;
    }
  },

  /**
   * Create a new account
   */
  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name
      await updateProfile(cred.user, { displayName });
      // Create Firestore profile
      const profileData: Omit<UserProfile, 'uid'> = {
        email: cred.user.email!,
        displayName,
        isPremium: false,
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), {
        ...profileData,
        createdAt: serverTimestamp(),
      });
      set({
        profile: { uid: cred.user.uid, ...profileData },
        loading: false,
      });
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      set({ error: getFriendlyAuthError(e.code), loading: false });
      throw err;
    }
  },

  /**
   * Sign in with Google (uses credential from expo-auth-session)
   */
  signInWithGoogle: async (idToken, accessToken) => {
    set({ loading: true, error: null });
    try {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const cred = await signInWithCredential(auth, credential);
      await get().loadProfile(cred.user.uid);
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      set({ error: getFriendlyAuthError(e.code), loading: false });
      throw err;
    }
  },

  /**
   * Sign out current user
   */
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, profile: null, loading: false });
    } catch (err: unknown) {
      const e = err as Error;
      set({ error: e.message, loading: false });
      throw err;
    }
  },

  /**
   * Send a password reset email
   */
  resetPassword: async (email) => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const e = err as Error & { code?: string };
      set({ error: getFriendlyAuthError(e.code) });
      throw err;
    }
  },

  /**
   * Update display name
   */
  updateDisplayName: async (name) => {
    const { user } = get();
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), { displayName: name }, { merge: true });
    set((state) => ({
      profile: state.profile ? { ...state.profile, displayName: name } : null,
    }));
  },

  /**
   * Load user profile from Firestore
   */
  loadProfile: async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        set({
          profile: {
            uid,
            email: data.email || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL,
            isPremium: data.isPremium || false,
            subscriptionId: data.subscriptionId,
            subscriptionEnd: data.subscriptionEnd?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
          },
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  /**
   * Initialize Firebase Auth listener. Call once at app startup.
   * Returns unsubscribe function.
   */
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user });
        await get().loadProfile(user.uid);
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));

// ============================================================
// HELPERS
// ============================================================

function getFriendlyAuthError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}
