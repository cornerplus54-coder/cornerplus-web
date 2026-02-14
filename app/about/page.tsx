"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/profile"
            className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7 transition text-sm font-semibold"
          >
            ← Profile
          </Link>
          <div className="text-xs text-white/50">Biz Kimiz</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">Biz Kimiz</h1>
          <p className="text-white/70 mt-3 leading-relaxed">
            Corner Plus, futbol maçları için korner odaklı analiz ve istatistikleri tek ekranda sunar.
            Amacımız; veriyi daha anlaşılır hale getirip kullanıcıya hızlı karar desteği sağlamaktır.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
              <div className="text-xs text-white/55">Ne yapıyoruz?</div>
              <div className="mt-2 text-white/80 text-sm">
                • Günlük maç listesi<br />
                • Pro analiz kartları<br />
                • Detay ekranı (basic + premium)
              </div>
            </div>

            <div className="rounded-2xl bg-black/10 border border-white/10 p-4">
              <div className="text-xs text-white/55">İletişim</div>
              <div className="mt-2 text-white/80 text-sm">
                E-posta: <span className="font-semibold">support@domain.com</span><br />
                (Burayı kendi mailinle değiştir)
              </div>
            </div>
          </div>

          <p className="text-white/40 mt-6 text-xs">
            Son güncelleme: 14.02.2026
          </p>
        </div>
      </main>
    </>
  );
}
