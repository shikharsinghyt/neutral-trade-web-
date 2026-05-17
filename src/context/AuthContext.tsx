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
          const isUserEmailAdmin = user.email?.toLowerCase() === 'rajnibhadoriya324@gmail.com';
          const dbIsAdmin = userSnap.data()?.isAdmin || false;
          
          if (isUserEmailAdmin && !dbIsAdmin) {
            // Force update admin status for the specific email
            await setDoc(userRef, { isAdmin: true }, { merge: true });
            setIsAdmin(true);
          } else {
            setIsAdmin(dbIsAdmin);
          }
        } else {
          // Create initial profile if it doesn't exist
          const isUserEmailAdmin = user.email?.toLowerCase() === 'rajnibhadoriya324@gmail.com';
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
