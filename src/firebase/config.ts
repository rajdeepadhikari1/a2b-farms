import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Hardcoded fallback values for Vercel deployment
// These will only be used if environment variables are missing
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDm__qnJbHdCQzhvmYhP3WeqWhBc6_PPw8",
  authDomain: "a2b-farms-c934b.firebaseapp.com",
  projectId: "a2b-farms-c934b",
  storageBucket: "a2b-farms-c934b.firebasestorage.app",
  messagingSenderId: "246783254449",
  appId: "1:246783254449:web:e9e01aa035ad9a8afba790",
  measurementId: "G-T3PM5SLBL7"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FALLBACK_CONFIG.measurementId
};

// Check which source is being used
const usingEnv = !!import.meta.env.VITE_FIREBASE_API_KEY;
console.log(usingEnv ? "📦 Using environment variables for Firebase" : "⚠️ Using fallback config for Firebase");

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe Analytics initialization
export const analytics =
  typeof window !== 'undefined'
    ? isSupported()
        .then(yes => (yes ? getAnalytics(app) : null))
        .catch(() => null)
    : null;

export default app;

/**
 * Custom error handler for Firestore operations
 */
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || ''
    }))
  } : {
    userId: 'anonymous',
    email: '',
    emailVerified: false,
    isAnonymous: true,
    providerInfo: []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType,
    path,
    authInfo
  };

  console.error(`Firestore Error [${operationType}]:`, errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}

// Cloudinary configuration with fallback
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dxbbz0b8m",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "a2b_farms_preset"
};

// Helper function to get Cloudinary config
export const getCloudinaryConfig = () => {
  return cloudinaryConfig;
};

console.log("✅ Firebase initialized successfully");
console.log("✅ Cloudinary configured:", cloudinaryConfig.cloudName);