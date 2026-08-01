import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseAvailable, 
  GoogleAuthProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseAvailable || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
      } else {
        setCurrentUser(null);
        setIsGuest(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!isFirebaseAvailable || !auth) {
      throw new Error("Firebase 未連接，目前運作於訪客本機模式。");
    }
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseAvailable || !auth) {
      throw new Error("Firebase 未連接，目前運作於訪客本機模式。");
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (email, password) => {
    if (!isFirebaseAvailable || !auth) {
      throw new Error("Firebase 未連接，目前運作於訪客本機模式。");
    }
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isFirebaseAvailable && auth && currentUser) {
      await firebaseSignOut(auth);
    }
    setIsGuest(true);
    setCurrentUser(null);
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isGuest,
      loading,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      enableGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
