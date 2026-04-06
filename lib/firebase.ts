/**
 * lib/firebase.ts
 * Firebase configuration and service initialization for BiZY Edo Translator
 *
 * SETUP: Copy this file to src/lib/firebase.ts in your Expo project.
 * Replace the firebaseConfig values with your actual Firebase project config.
 * Find your config at: Firebase Console → Project Settings → General → Your apps
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================================
// FIREBASE CONFIGURATION
// Replace with your actual Firebase project settings
// Firebase Console → Project Settings → Your apps → Firebase SDK snippet
// ============================================================
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'edo-translator-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'edo-translator-app',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'edo-translator-app.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase app (avoid re-initializing if already done)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ============================================================
// AUTH - Use AsyncStorage for persistence on native
// ============================================================
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // Native: use AsyncStorage for session persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Already initialized
    auth = getAuth(app);
  }
}

// ============================================================
// FIRESTORE
// ============================================================
const db = getFirestore(app);

// ============================================================
// CLOUD FUNCTIONS
// Region: us-central1 (default)
// ============================================================
const functions = getFunctions(app, 'us-central1');

// ============================================================
// STORAGE
// ============================================================
const storage = getStorage(app);

// ============================================================
// AUTH PROVIDERS
// ============================================================
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ============================================================
// EMULATOR SUPPORT (development only)
// Uncomment to use local Firebase emulators:
// ============================================================
// if (__DEV__) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export { app, auth, db, functions, storage, googleProvider };
