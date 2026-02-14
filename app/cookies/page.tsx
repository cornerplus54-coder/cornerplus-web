"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function CookiesPage() {
  return (
    <>
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7 transition text-sm font-semibold">
            ← Profile
          </Link>
          <div className="text-xs text-white/50">Çerez Politikası</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">Çerez Politikası</h1>

          <div className="mt-4 text-white/75 text-sm leading-relaxed space-y-4">
            <p>
              Çerezler; sitenin düzgün çalışması ve kullanıcı deneyiminin iyileştirilmesi için kullanılabilir.
            </p>

            <section>
              <h2 className="font-extrabold text-white/90">Kullanılan çerez türleri</h2>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><b>Zorunlu:</b> Oturum, güvenlik, temel işlevler</li>
                <li><b>Analitik (opsiyonel):</b> Kullanım istatistikleri</li>
                <li><b>Pazarlama (opsiyonel):</b> Reklam/hedefleme (kullanıyorsan)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">Çerez yönetimi</h2>
              <p className="mt-1">
                Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsin. Bazı özellikler çalışmayabilir.
              </p>
            </section>
          </div>

          <p className="text-white/40 mt-6 text-xs">Son güncelleme: 14.02.2026</p>
        </div>
      </main>
    </>
  );
}
