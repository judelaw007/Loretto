"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./config";
import type { User, UserClaims } from "@loretto/shared-types";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  claims: UserClaims | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setFirebaseUser(null);
        setUser(null);
        setClaims(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setFirebaseUser(fbUser);

        // Fetch custom claims from ID token
        const tokenResult = await fbUser.getIdTokenResult();
        const tokenClaims: UserClaims = {
          role: (tokenResult.claims.role as UserClaims["role"]) ?? "parent",
          adminSubRole: tokenResult.claims.adminSubRole as UserClaims["adminSubRole"],
          schoolIds: (tokenResult.claims.schoolIds as string[]) ?? [],
        };
        setClaims(tokenClaims);

        // Fetch Firestore user profile
        const db = getFirebaseDb();
        if (db) {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User);
          } else {
            setUser(null);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, claims, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
