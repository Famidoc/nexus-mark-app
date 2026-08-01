import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBy-YXQ2GU27pIgMlLBJ5IwqAN-oKKtJVM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexus-mark-f2d80.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexus-mark-f2d80",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexus-mark-f2d80.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "728071560930",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:728071560930:web:00c49e6673010adbd0c8bb"
};

let app, auth, db;
let isFirebaseAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseAvailable = true;
} catch (error) {
  console.warn("Firebase initialization skipped or running in offline mode:", error);
}

export { 
  app, 
  auth, 
  db, 
  isFirebaseAvailable,
  GoogleAuthProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
};
