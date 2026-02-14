"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7 transition text-sm font-semibold">
            ← Profile
          </Link>
          <div className="text-xs text-white/50">Kullanım Şartları</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">Kullanım Şartları</h1>

          <div className="mt-4 text-white/75 text-sm leading-relaxed space-y-4">
            <section>
              <h2 className="font-extrabold text-white/90">1) Hizmetin kapsamı</h2>
              <p className="mt-1">
                Sunulan analiz ve istatistikler bilgilendirme amaçlıdır.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">2) Sorumluluk</h2>
              <p className="mt-1">
                Kullanıcı; içerikleri kendi kararları için değerlendirdiğini kabul eder.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">3) Hesap</h2>
              <p className="mt-1">
                Hesap güvenliğinden kullanıcı sorumludur. Şüpheli durumlarda destek ile iletişime geçiniz.
              </p>
            </section>
          </div>

          <p className="text-white/40 mt-6 text-xs">Son güncelleme: 14.02.2026</p>
        </div>
      </main>
    </>
  );
}
