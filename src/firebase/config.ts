import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  // In development, use fallback values
  if (import.meta.env.DEV) {
    console.warn('Using fallback Firebase configuration for development');
  }
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || (import.meta.env.DEV ? "dev-api-key" : ""),
  authDomain: requiredEnvVars.authDomain || (import.meta.env.DEV ? "dev-auth-domain" : ""),
  projectId: requiredEnvVars.projectId || (import.meta.env.DEV ? "dev-project-id" : ""),
  storageBucket: requiredEnvVars.storageBucket || (import.meta.env.DEV ? "dev-storage-bucket" : ""),
  messagingSenderId: requiredEnvVars.messagingSenderId || (import.meta.env.DEV ? "000000000000" : ""),
  appId: requiredEnvVars.appId || (import.meta.env.DEV ? "dev-app-id" : ""),
  measurementId: requiredEnvVars.measurementId || (import.meta.env.DEV ? "dev-measurement-id" : "")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
