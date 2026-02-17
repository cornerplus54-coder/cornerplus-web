"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TopBar from "../../../../components/topbar";
import { useAuth } from "../../../../lib/auth-context";
import { todayKeyTR } from "../../../../lib/date";
import { subscribeTodayMatches, type Match } from "../../../../lib/matches";

type ProMatch = Match & {
  cornerAvg?: number | string | null;
  avgCorners?: number | string | null;
  time?: string | null;
  kickoff?: string | null;

  tag?: string | null;
  date?: string | null;
  dateKey?: string | null;

  // eski alanlar durabilir ama UI’da kullanmıyoruz
  pct_8_5?: number | string | null;
  pct_9_5?: number | string | null;
  pct_10_5?: number | string | null;
};

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export default function MatchDetailPage() {
  const router = useRouter();
  const params = useParams();

  const idRaw = String((params as any)?.id ?? "").trim();
  const id = safeDecode(idRaw);

  const { user, loading, isPremium } = useAuth();

  const [match, setMatch] = useState<ProMatch | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);

  // auth gate
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  // Bugünün maçlarından id ile bul
  useEffect(() => {
    if (!id) return;

    const dateKey = todayKeyTR();
    const unsub = subscribeTodayMatches(dateKey, (list: Match[]) => {
      const found = (list as any[]).find((x) => {
        const xid = String(x?.id ?? "");
        return xid === id || safeDecode(xid) === id;
      });

      setMatch((found ?? null) as ProMatch | null);
      setIsLoadingMatch(false);
    });

    return () => unsub();
  }, [id]);

  const vm = useMemo(() => {
    const m = match;
    const kickoff = String(m?.time ?? m?.kickoff ?? "").trim();
    const avg = Number((m?.cornerAvg ?? m?.avgCorners ?? 0) as any) || 0;

    const tag = String((m as any)?.tag ?? "").trim().toLowerCase();
    const isHigh = tag === "high";

    return { kickoff, avg, tag, isHigh };
  }, [match]);

  return (
    <>
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Üst: geri + title */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/7 transition text-sm font-semibold"
          >
            ← Geri
          </button>
          <div className="text-xs text-white/45">Maç Detayı</div>
        </div>

        <div className="mt-4">
          {isLoadingMatch ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-white/70">
              Yükleniyor…
            </div>
          ) : null}

          {!isLoadingMatch && !match ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <div className="text-xl font-black">Maç bulunamadı</div>
              <div className="text-white/60 mt-2 text-sm">
                Bu maç bugünün listesinde yoksa detay sayfası bulunamayabilir.
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/matches")}
                  className="px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold"
                >
                  Maçlara Git
                </button>
                <button
                  onClick={() => router.push("/pro")}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
                >
                  Pro Analiz
                </button>
              </div>
            </div>
          ) : null}

          {!isLoadingMatch && match ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="p-6">
                {/* BASIC META */}
                <div className="text-[12px] text-white/70 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-white/80">
                    {(match as any).country}
                  </span>
                  <span className="text-white/25">•</span>
                  <span className="font-semibold text-white/80">
                    {(match as any).league}
                  </span>
                  {vm.kickoff ? (
                    <>
                      <span className="text-white/25">•</span>
                      <span className="font-semibold text-white/80 tabular-nums">
                        {vm.kickoff}
                      </span>
                    </>
                  ) : null}
                </div>

                {/* HERO TEAMS */}
                <div className="mt-4">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="min-w-0">
                      <div className="text-[24px] sm:text-[28px] font-black leading-tight truncate">
                        {(match as any).homeTeam}
                      </div>
                      <div className="mt-1 text-[10px] tracking-[0.22em] text-white/35">
                        HOME
                      </div>
                    </div>

                    <div className="text-[11px] font-bold tracking-[0.30em] text-white/35">
                      VS
                    </div>

                    <div className="min-w-0 text-right">
                      <div className="text-[24px] sm:text-[28px] font-black leading-tight truncate">
                        {(match as any).awayTeam}
                      </div>
                      <div className="mt-1 text-[10px] tracking-[0.22em] text-white/35">
                        AWAY
                      </div>
                    </div>
                  </div>
                </div>

                {/* BASIC INFO (bahis çağrışımı yok) */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs text-white/55">Özet</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Avg Corners</span>
                        <span className="font-bold text-white/85 tabular-nums">
                          {vm.avg ? vm.avg.toFixed(2) : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Category</span>
                        <span className="font-bold text-white/85">
                          {vm.isHigh ? "Advanced" : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs text-white/55">Analytics</div>
                    <div className="mt-3 text-sm text-white/60 leading-relaxed">
                      Gelişmiş metrikler ve model ekranı{" "}
                      <b className="text-white/80">Pro Analiz</b> bölümünde
                      sunulur.
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => router.push("/pro")}
                        className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
                      >
                        Analytics’e Git
                      </button>

                      {!isPremium ? (
                        <button
                          onClick={() => router.push("/buy")}
                          className="px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold"
                        >
                          Premium Aç
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push("/matches")}
                          className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
                        >
                          Maçlara Dön
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Eğer maç high ise, burada ekstra bir "bahis" hissi vermeden bilgilendir */}
                {vm.isHigh ? (
                  <div className="mt-5 rounded-2xl bg-black/15 border border-white/10 p-4">
                    <div className="text-sm font-bold text-white/85">
                      Advanced match profile
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      Bu maçın gelişmiş analiz kartı ve metrikleri yalnızca{" "}
                      <b className="text-white/75">Pro Analiz</b> ekranında
                      görüntülenir.
                    </div>
                  </div>
                ) : null}

                {/* Disclaimer */}
                <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-[12px] text-white/55 leading-relaxed">
                    <b className="text-white/75">Not:</b> Bu sayfa temel maç
                    bilgilerini gösterir. Gelişmiş analiz ekranları istatistiksel
                    göstergelerdir ve finansal yönlendirme amacı taşımaz.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
