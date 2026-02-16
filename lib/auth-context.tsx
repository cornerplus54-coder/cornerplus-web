"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

type UserDoc = {
  email?: string;
  isPremium?: boolean;
  premiumUntil?: any; // Firestore Timestamp olabilir
  premiumSource?: string;
  premiumUpdatedAt?: any;
  createdAt?: any;
  updatedAt?: any;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;

  // ✅ alias (register sayfası bunu istiyor)
  authLoading: boolean;

  userDoc: UserDoc | null;
  isPremium: boolean;
};


const Ctx = createContext<AuthCtx | null>(null);

function toMillis(v: any): number | null {
  if (!v) return null;

  // Firestore Timestamp -> toDate()
  if (typeof v?.toDate === "function") {
    const d: Date = v.toDate();
    const ms = d?.getTime?.();
    return Number.isFinite(ms) ? ms : null;
  }

  // Date obj
  if (v instanceof Date) {
    const ms = v.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  // string/number
  const n = typeof v === "number" ? v : Date.parse(String(v));
  return Number.isFinite(n) ? n : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      // eski listener'ı kapat
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      setUser(u);
      setLoading(false);

      if (!u) {
        setUserDoc(null);
        return;
      }

      const ref = doc(db, "users", u.uid);

      // ✅ Doküman var mı kontrol et
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // ✅ ilk kez giriş -> oluştur (isPremium false default)
        await setDoc(
          ref,
          {
            email: u.email ?? "",
            isPremium: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // ✅ doküman var -> SADECE email/updatedAt güncelle (isPremium'a dokunma)
        await setDoc(
          ref,
          {
            email: u.email ?? "",
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // ✅ canlı dinle
      unsubUserDoc = onSnapshot(ref, (s) => {
        setUserDoc((s.data() as UserDoc) ?? null);
      });
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubAuth();
    };
  }, []);

  const value = useMemo<AuthCtx>(() => {
  return {
    user,
    loading,
    authLoading: loading, // ✅ alias
    userDoc,
    isPremium: !!userDoc?.isPremium,
  };
}, [user, loading, userDoc]);


  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
