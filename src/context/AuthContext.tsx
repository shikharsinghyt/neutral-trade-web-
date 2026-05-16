/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, User, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Sync user profile and check admin status
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setIsAdmin(userSnap.data()?.isAdmin || false);
        } else {
          // Create initial profile if it doesn't exist
          // First user who signs up with a specific email can be admin if we wanted, 
          // or we can hardcode for the developer email.
          const isUserEmailAdmin = user.email === 'rajnibhadoriya324@gmail.com';
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            email: user.email,
            isAdmin: isUserEmailAdmin,
            createdAt: new Date().toISOString()
          });
          setIsAdmin(isUserEmailAdmin);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
