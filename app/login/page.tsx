"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? "Giriş Yap" : "Kayıt Ol"), [mode]);

  if (!loading && user) {
    router.replace("/matches");
  }

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), pass);
      }
      router.replace("/matches");
    } catch (e: any) {
      setErr(e?.message ?? "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black">Corner+</div>
            <div className="text-white/60 text-sm">web dashboard</div>
          </div>
          <button
            className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/15"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </div>

        <h1 className="mt-6 text-xl font-bold">{title}</h1>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none"
            placeholder="Şifre"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {err ? <div className="text-red-300 text-sm">{err}</div> : null}

          <button
            className="w-full rounded-xl px-4 py-3 font-semibold bg-emerald-500/90 hover:bg-emerald-500"
            disabled={busy}
            onClick={submit}
          >
            {busy ? "Bekle..." : title}
          </button>
        </div>

        <div className="mt-4 text-xs text-white/50">
          Giriş yaptıktan sonra Maçlar sayfasına yönlendirileceksin.
        </div>
      </div>
    </main>
  );
}
