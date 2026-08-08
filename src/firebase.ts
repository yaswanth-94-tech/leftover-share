import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import config from "../firebase-applet-config.json";

// Combined configuration prioritized with provisioned Firebase project
const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyCl-gID209t0Ikzyrz2IpEyRuHzN1KpXVg",
  authDomain: config.authDomain || "testing-website-578d5.firebaseapp.com",
  projectId: config.projectId || "testing-website-578d5",
  storageBucket: config.storageBucket || "testing-website-578d5.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "379455551279",
  appId: config.appId || "1:379455551279:web:f569565605d25508fcd3da",
  measurementId: config.measurementId || "G-9T4FB6VFX1"
};

// Initialize Firebase app safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use provisioned databaseId if available
export const db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// Safe Analytics Initialization
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Analytics not supported in this environment:", err);
    });
}

