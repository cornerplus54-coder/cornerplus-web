"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/profile" className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7 transition text-sm font-semibold">
            ← Profile
          </Link>
          <div className="text-xs text-white/50">Gizlilik Politikası</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">Gizlilik Politikası</h1>
          <p className="text-white/70 mt-3 text-sm leading-relaxed">
            Bu metin genel bir şablondur. Yayına almadan önce kendi ürünün ve veri akışına göre düzenlemen gerekir.
          </p>

          <div className="mt-6 space-y-4 text-white/75 text-sm leading-relaxed">
            <section>
              <h2 className="font-extrabold text-white/90">1) Toplanan veriler</h2>
              <p className="mt-1">
                Hesap oluşturma/giriş sırasında e-posta gibi kimlik doğrulama verileri; uygulama kullanımına dair temel teknik veriler.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">2) Kullanım amaçları</h2>
              <p className="mt-1">
                Hizmeti sunmak, güvenliği sağlamak, performansı iyileştirmek ve destek süreçlerini yürütmek.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">3) Saklama süresi</h2>
              <p className="mt-1">
                Veriler, hizmetin gerektirdiği süre boyunca ve yasal yükümlülüklere uygun olarak saklanır.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">4) İletişim</h2>
              <p className="mt-1">
                Talepler için: <span className="font-semibold">support@domain.com</span>
              </p>
            </section>
          </div>

          <p className="text-white/40 mt-6 text-xs">Son güncelleme: 14.02.2026</p>
        </div>
      </main>
    </>
  );
}
