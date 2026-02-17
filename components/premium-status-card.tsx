"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";

function formatTR(d: Date) {
  return d.toLocaleString("tr-TR");
}

export default function PremiumStatusCard() {
  const { user, loading, userDoc, isPremium } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-lg font-black">Premium</div>
        <div className="mt-2 text-sm text-slate-300">Durum: Pasif</div>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
        >
          Giriş yap
        </Link>
      </div>
    );
  }

  const raw: any = userDoc?.premiumUntil ?? null;
  const premiumUntil: Date | null =
    raw && typeof raw?.toDate === "function"
      ? raw.toDate()
      : raw instanceof Date
      ? raw
      : typeof raw === "number"
      ? new Date(raw)
      : null;

  const untilText = premiumUntil ? formatTR(premiumUntil) : "-";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black">Premium</div>
        <span
          className={
            "rounded-full px-3 py-1 text-xs font-semibold " +
            (isPremium
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-white/10 text-slate-200")
          }
        >
          {isPremium ? "AKTİF" : "PASİF"}
        </span>
      </div>

      <div className="mt-2 text-sm text-slate-300">
        Bitiş tarihi: <span className="text-slate-100">{isPremium ? untilText : "-"}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/buy"
          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
        >
          {isPremium ? "Süre uzat" : "Premium satın al"}
        </Link>

        <Link
          href="/matches"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
        >
          Maçlar
        </Link>
      </div>
    </div>
  );
}
