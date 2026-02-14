"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/auth-context";

const shopierUrl = process.env.NEXT_PUBLIC_SHOPIER_URL || "#";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPremium } = useAuth();

  async function doLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          // ✅ Boyut kilidi (yana/aşağı kayma bitti)
          "h-10 min-w-[104px] inline-flex items-center justify-center px-4",
          "rounded-xl text-sm border whitespace-nowrap",
          active
            ? "bg-white/10 border-white/20"
            : "bg-transparent border-white/10 hover:bg-white/5",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* SOL: ikon + küçük yazı */}
        <Link href="/matches" className="flex items-center gap-3 shrink-0">
          <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <Image
              src="/logo-mark.png"
              alt="Corner Plus"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-base font-extrabold">Corner+</div>
            <div className="text-white/60 text-xs">web dashboard</div>
          </div>
        </Link>

        {/* SAĞ: menü (yükseklik kilitli) */}
        <div className="ml-auto shrink-0 flex items-center gap-2 h-14">
          {user ? (
            <>
              <Tab href="/matches" label="Maçlar" />

              {/* ✅ Pro label sabit -> kayma yok */}
              <div className="relative">
                <Tab href="/pro" label="Pro Analiz" />
                {!isPremium ? (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/10 text-white/70">
                    Kilitli
                  </span>
                ) : (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-400/20 text-emerald-200">
                    PRO
                  </span>
                )}
              </div>

              <Tab href="/profile" label="Profil" />

              {/* ✅ Buy butonu da sabit genişlik */}
              <a
                href={shopierUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 min-w-[150px] inline-flex items-center justify-center px-4 rounded-xl text-sm bg-emerald-500/90 hover:bg-emerald-500 font-semibold whitespace-nowrap"
              >
                Paket Satın Al
              </a>

              {/* ✅ Çıkış da sabit */}
              <button
                onClick={doLogout}
                className="h-10 min-w-[92px] inline-flex items-center justify-center px-4 rounded-xl text-sm bg-white/10 hover:bg-white/15 whitespace-nowrap"
              >
                Çıkış
              </button>
            </>
          ) : (
            <Link
              className="h-10 min-w-[104px] inline-flex items-center justify-center px-4 rounded-xl text-sm bg-white/10 hover:bg-white/15 whitespace-nowrap"
              href="/login"
            >
              Giriş
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
