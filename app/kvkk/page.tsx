"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function KvkkPage() {
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
          <div className="text-xs text-white/50">KVKK</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">KVKK Aydınlatma Metni</h1>
          <p className="text-white/70 mt-3 text-sm leading-relaxed">
            Bu metin genel bir şablondur. Yayına almadan önce ürününüzün gerçek
            veri akışına göre düzenleyin.
          </p>

          <div className="mt-6 space-y-4 text-white/75 text-sm leading-relaxed">
            <section>
              <h2 className="font-extrabold text-white/90">1) Veri Sorumlusu</h2>
              <p className="mt-1">
                Corner Plus (“Uygulama”) kapsamında işlenen kişisel verileriniz
                için veri sorumlusu: <b>Şirket/İsim</b> (burayı doldur).
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">
                2) İşlenen veri kategorileri
              </h2>
              <p className="mt-1">
                Kimlik doğrulama verileri (e-posta), uygulama kullanımına ilişkin
                teknik veriler (cihaz/oturum), destek talepleri içerikleri.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">3) Amaç ve hukuki sebep</h2>
              <p className="mt-1">
                Hizmeti sunmak, güvenliği sağlamak, yasal yükümlülükleri yerine
                getirmek ve destek süreçlerini yürütmek.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">4) Saklama süresi</h2>
              <p className="mt-1">
                Veriler, hizmetin gerektirdiği süre boyunca ve ilgili mevzuata
                uygun olarak saklanır.
              </p>
            </section>

            <section>
              <h2 className="font-extrabold text-white/90">5) Başvuru</h2>
              <p className="mt-1">
                KVKK kapsamındaki taleplerinizi destek e-postası üzerinden
                iletebilirsiniz.
              </p>
            </section>
          </div>

          <p className="text-white/40 mt-6 text-xs">Son güncelleme: 14.02.2026</p>
        </div>
      </main>
    </>
  );
}
