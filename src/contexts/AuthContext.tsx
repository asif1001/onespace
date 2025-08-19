import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role || 'driver',
              name: userData.name || '',
              phoneNumber: userData.phoneNumber,
              isActive: userData.isActive ?? true,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            // Create user document if it doesn't exist
            const newUser: Omit<User, 'uid'> = {
              email: firebaseUser.email || '',
              role: 'driver', // Default role
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser({ uid: firebaseUser.uid, ...newUser });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserRole = async (uid: string, role: 'driver' | 'admin'): Promise<void> => {
    try {
      await setDoc(
        doc(db, 'users', uid),
        { role, updatedAt: new Date() },
        { merge: true }
      );
      
      // Update local user state if it's the current user
      if (user && user.uid === uid) {
        setUser({ ...user, role, updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};