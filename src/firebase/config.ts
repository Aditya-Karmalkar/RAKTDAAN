import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4864GApkwUBmb1MwgLvA7cyx34woIHUA",
  authDomain: "raktdaan-75745.firebaseapp.com",
  projectId: "raktdaan-75745",
  storageBucket: "raktdaan-75745.firebasestorage.app",
  messagingSenderId: "567538108092",
  appId: "1:567538108092:web:a7ff7cfc9ef436165772b9",
  measurementId: "G-JMMQGXK1Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
