"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/matches" : "/login");
  }, [loading, user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-white">
      Yükleniyor...
    </main>
  );
}
