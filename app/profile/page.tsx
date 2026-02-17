"use client";

import PremiumStatusCard from "../../components/premium-status-card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "../../components/topbar";
import { useAuth } from "../../lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, isPremium, userDoc, signOut } = useAuth() as any;

  const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
  const SUPPORT_EMAIL = "support@domain.com"; // ✅ değiştir
  const APP_NAME = "Corner Plus";

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  const mailtoDeleteAccount = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `${APP_NAME} - Hesap Silme Talebi`
  )}&body=${encodeURIComponent(
    `Merhaba,\n\nHesabımın silinmesini talep ediyorum.\n\nHesap e-posta: ${user?.email ?? "-"}\n\nTeşekkürler.`
  )}`;

  const mailtoDeleteData = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `${APP_NAME} - Veri Silme Talebi`
  )}&body=${encodeURIComponent(
    `Merhaba,\n\nUygulama içindeki kişisel verilerimin silinmesini talep ediyorum.\n\nHesap e-posta: ${user?.email ?? "-"}\n\nTeşekkürler.`
  )}`;

  return (
    <>
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profil kartı */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Profil</h1>
              <div className="mt-4 text-sm text-white/70">
                <div>
                  <span className="text-white/50">Email:</span>{" "}
                  {user?.email ?? "-"}
                </div>
                <div className="mt-1">
                  <span className="text-white/50">Üyelik:</span>{" "}
                  {isPremium ? "Premium ✅" : "Standart"}
                </div>
                {isPremium && userDoc?.premiumUntil && (
                  <div className="mt-1 text-sm text-emerald-400">
                    Premium Bitiş:{" "}
                    {new Date(
                     userDoc.premiumUntil?.toDate
                      ? userDoc.premiumUntil.toDate()
                      : userDoc.premiumUntil
                   ).toLocaleDateString("tr-TR")}
                 </div>
                 )} 

              </div>
            </div>

            {/* Çıkış */}
            <button
              onClick={async () => {
                try {
                  if (typeof signOut === "function") await signOut();
                } finally {
                  router.replace("/login");
                }
              }}
              className="shrink-0 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-bold"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="mt-6 text-xs text-white/50">
            Premium kontrolü Firestore users koleksiyonundan geliyor.
          </div>

          {/* ✅ Sürüm */}
          <div className="mt-2 text-xs text-white/45">
            Uygulama sürümü: <span className="font-semibold text-white/70">v{APP_VERSION}</span>
          </div>

          {/* Hesap / veri silme */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={mailtoDeleteAccount}
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Hesabı Silme Talebi</div>
              <div className="text-xs text-white/55 mt-1">
                E-posta ile talep oluştur
              </div>
            </a>

            <a
              href={mailtoDeleteData}
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Veri Silme Talebi</div>
              <div className="text-xs text-white/55 mt-1">
                KVKK kapsamında talep
              </div>
            </a>
          </div>
        </div>

        {/* Destek */}
        <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="text-sm font-extrabold tracking-[0.12em] text-white/80">
            DESTEK
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/contact"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">İletişim / Destek</div>
              <div className="text-xs text-white/55 mt-1">
                Mail • Instagram • Twitter
              </div>
            </Link>

            <Link
              href="/kvkk"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">KVKK Aydınlatma Metni</div>
              <div className="text-xs text-white/55 mt-1">
                Veri işleme bilgilendirmesi
              </div>
            </Link>
          </div>
        </div>

        {/* Bilgilendirme */}
        <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="text-sm font-extrabold tracking-[0.12em] text-white/80">
            BİLGİLENDİRME
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/about"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Biz Kimiz</div>
              <div className="text-xs text-white/55 mt-1">
                Uygulama ve ekip hakkında
              </div>
            </Link>

            <Link
              href="/privacy"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Gizlilik Politikası</div>
              <div className="text-xs text-white/55 mt-1">
                Veri işleme ve saklama
              </div>
            </Link>

            <Link
              href="/cookies"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Çerez Politikası</div>
              <div className="text-xs text-white/55 mt-1">
                Çerezler ve yönetimi
              </div>
            </Link>

            <Link
              href="/terms"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Kullanım Şartları</div>
              <div className="text-xs text-white/55 mt-1">
                Hizmet koşulları
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
