import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase's web config is safe to ship in source — it's not a secret.
// Firebase security is enforced by Security Rules on the server side, not
// by hiding this config. Hardcoding it here sidesteps Vercel's dashboard
// flagging NEXT_PUBLIC_-prefixed env vars as "sensitive", which was blocking
// saving them there.
const firebaseConfig = {
  apiKey: "AIzaSyC7udBIEbvkvFLE7yfMVbwaqqzbZhvrK60",
  authDomain: "hitcal-c336b.firebaseapp.com",
  projectId: "hitcal-c336b",
  storageBucket: "hitcal-c336b.firebasestorage.app",
  messagingSenderId: "935978424230",
  appId: "1:935978424230:web:dabe73939565b91bd4e167",
};

// Next.js re-runs this module on every hot-reload in dev; getApps() guards
// against "Firebase App already initialized" errors.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
