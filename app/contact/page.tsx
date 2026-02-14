"use client";

import TopBar from "../../components/topbar";
import Link from "next/link";

export default function ContactPage() {
  const SUPPORT_EMAIL = "support@domain.com"; // ✅ değiştir
  const INSTAGRAM_URL = "https://instagram.com/yourpage"; // ✅ değiştir
  const TWITTER_URL = "https://x.com/yourpage"; // ✅ değiştir (Twitter/X)

  const mailtoSupport = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Corner Plus - Destek"
  )}&body=${encodeURIComponent(
    "Merhaba,\n\nKonu:\nDetay:\n\nTeşekkürler."
  )}`;

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
          <div className="text-xs text-white/50">İletişim / Destek</div>
        </div>

        <div className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-6">
          <h1 className="text-2xl font-black">İletişim</h1>
          <p className="text-white/70 mt-3 text-sm leading-relaxed">
            Destek, öneri ve hata bildirimleri için bize ulaşabilirsin.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={mailtoSupport}
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">E-posta</div>
              <div className="text-xs text-white/55 mt-1">{SUPPORT_EMAIL}</div>
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Instagram</div>
              <div className="text-xs text-white/55 mt-1">DM ile ulaş</div>
            </a>

            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="text-sm font-bold">Twitter / X</div>
              <div className="text-xs text-white/55 mt-1">Mention / DM</div>
            </a>

            <div className="rounded-2xl bg-black/10 border border-white/10 px-4 py-3">
              <div className="text-sm font-bold">Hata Bildirimi</div>
              <div className="text-xs text-white/55 mt-1">
                E-postaya ekran görüntüsü ekleyebilirsin.
              </div>
            </div>
          </div>

          <p className="text-white/40 mt-6 text-xs">Son güncelleme: 14.02.2026</p>
        </div>
      </main>
    </>
  );
}
