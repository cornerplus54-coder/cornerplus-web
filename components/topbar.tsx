"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../lib/auth-context";

const shopierUrl = process.env.NEXT_PUBLIC_SHOPIER_URL || "#";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isPremium } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // route değişince menü kapansın
    setMenuOpen(false);
  }, [pathname]);

  async function doLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);

    return (
      <Link
        href={href}
        className={cx(
          "relative h-10 min-w-[104px] inline-flex items-center justify-center px-4",
          "rounded-xl text-sm border whitespace-nowrap",
          "transition-all duration-200",
          "hover:-translate-y-[1px] active:translate-y-0",
          active
            ? "bg-white/10 border-white/20 shadow-[0_10px_30px_rgba(56,189,248,0.12)]"
            : "bg-transparent border-white/10 hover:bg-white/6 hover:border-white/15"
        )}
      >
        <span className={cx("font-semibold", active ? "text-white" : "text-white/85")}>
          {label}
        </span>

        {/* active underline + glow */}
        {active ? (
          <span className="pointer-events-none absolute left-3 right-3 -bottom-[6px] h-[2px] rounded-full bg-sky-400/80 shadow-[0_0_18px_rgba(56,189,248,0.35)]" />
        ) : null}
      </Link>
    );
  };

  const MobileItem = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={() => setMenuOpen(false)}
        className={cx(
          "w-full h-11 px-4 rounded-2xl border text-sm font-semibold",
          "inline-flex items-center justify-between",
          "transition-all duration-200",
          active
            ? "bg-white/10 border-white/20 shadow-[0_10px_30px_rgba(56,189,248,0.10)]"
            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15"
        )}
      >
        <span className={cx(active ? "text-white" : "text-white/85")}>{label}</span>

        {href === "/pro" ? (
          !isPremium ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/10 text-white/70">
              Kilitli
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 border border-sky-400/20 text-sky-200">
              ACTIVE
            </span>
          )
        ) : null}
      </Link>
    );
  };

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b border-white/10",
        "bg-black/35 backdrop-blur"
      )}
      style={{
        // iPhone çentik safe area
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="py-2 sm:py-3 flex items-center gap-3">
          {/* SOL: Logo + isim */}
          <Link href="/matches" className="flex items-center gap-3 shrink-0">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.30)]">
              <Image
                src="/logo-mark.png"
                alt="Corner Plus"
                fill
                className="object-contain p-1"
                priority
              />
              {/* subtle highlight */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent" />
            </div>

            <div className="leading-tight">
              <div className="text-base sm:text-lg font-extrabold">Corner+</div>
              <div className="hidden sm:block text-white/60 text-xs">
                analytics dashboard
              </div>
            </div>
          </Link>

          {/* DESKTOP MENÜ */}
          <div className="ml-auto hidden sm:flex items-center gap-2 h-14">
            {user ? (
              <>
                <Tab href="/matches" label="Maçlar" />

                <div className="relative">
                  <Tab href="/pro" label="Analytics" />
                  {!isPremium ? (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/10 text-white/70">
                      Kilitli
                    </span>
                  ) : (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 border border-sky-400/20 text-sky-200">
                      ACTIVE
                    </span>
                  )}
                </div>

                <Tab href="/profile" label="Profil" />

                <a
                  href={shopierUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(
                    "h-10 min-w-[150px] inline-flex items-center justify-center px-4 rounded-xl text-sm",
                    "bg-emerald-500/90 hover:bg-emerald-500 font-semibold whitespace-nowrap",
                    "transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
                  )}
                >
                  Paket Satın Al
                </a>

                <button
                  onClick={doLogout}
                  className={cx(
                    "h-10 min-w-[92px] inline-flex items-center justify-center px-4 rounded-xl text-sm",
                    "bg-white/10 hover:bg-white/15 whitespace-nowrap",
                    "border border-white/10 hover:border-white/15",
                    "transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
                  )}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                className={cx(
                  "h-10 min-w-[104px] inline-flex items-center justify-center px-4 rounded-xl text-sm",
                  "bg-white/10 hover:bg-white/15 whitespace-nowrap border border-white/10 hover:border-white/15",
                  "transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
                )}
                href="/login"
              >
                Giriş
              </Link>
            )}
          </div>

          {/* MOBİL: Premium + Menü */}
          <div className="ml-auto flex sm:hidden items-center gap-2">
            {user ? (
              <>
                <a
                  href={shopierUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(
                    "h-10 px-3 rounded-xl text-xs font-semibold whitespace-nowrap",
                    "bg-emerald-500/90 hover:bg-emerald-500",
                    "transition-all duration-200"
                  )}
                >
                  Premium
                </a>

                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={cx(
                    "h-10 w-10 inline-flex items-center justify-center rounded-xl",
                    "bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/15",
                    "transition-all duration-200"
                  )}
                  aria-label="Menü"
                >
                  ☰
                </button>
              </>
            ) : (
              <Link
                className={cx(
                  "h-10 px-4 rounded-xl text-sm whitespace-nowrap inline-flex items-center justify-center",
                  "bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/15",
                  "transition-all duration-200"
                )}
                href="/login"
              >
                Giriş
              </Link>
            )}
          </div>
        </div>

        {/* MOBİL DROPDOWN */}
        {user && menuOpen && (
          <div className="sm:hidden pb-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="grid gap-2">
                <MobileItem href="/matches" label="Maçlar" />
                <MobileItem href="/pro" label="Analytics" />
                <MobileItem href="/profile" label="Profil" />

                <button
                  onClick={doLogout}
                  className={cx(
                    "w-full h-11 px-4 rounded-2xl text-sm font-semibold inline-flex items-center justify-center",
                    "bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/15",
                    "transition-all duration-200"
                  )}
                >
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
