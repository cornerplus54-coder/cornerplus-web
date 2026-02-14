"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace("/matches");
  }, [user, authLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
      router.replace("/matches");
    } catch (ex: any) {
      setErr(ex?.message ?? "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-slate-950 font-black">
            +
          </div>
          <div>
            <div className="text-lg font-black">Corner+</div>
            <div className="text-xs text-slate-400">Kayıt</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-emerald-500/50"
              placeholder="mail@domain.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Şifre</label>
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-emerald-500/50"
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          {err ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {err}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          Zaten hesabın var mı?{" "}
          <Link className="text-emerald-300 hover:text-emerald-200" href="/login">
            Giriş Yap
          </Link>
        </div>
      </div>
    </main>
  );
}
