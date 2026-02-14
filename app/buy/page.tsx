"use client";

import Link from "next/link";

export default function BuyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-slate-950 font-black">
          +
        </div>

        <div className="mt-4 text-2xl font-black">Premium Yakında</div>
        <div className="mt-2 text-sm text-slate-300">
          Shopier bağlantısı yakında aktif olacak.
        </div>

        <div className="mt-6 space-y-2 text-sm text-slate-300">
          <div>• Premium ile Pro Analiz açılır</div>
          <div>• Bağlantı açılınca bu sayfada görünecek</div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/matches"
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
          >
            Maçlar’a dön
          </Link>
          <Link
            href="/profile"
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
          >
            Profil’e git
          </Link>
        </div>
      </div>
    </div>
  );
}
