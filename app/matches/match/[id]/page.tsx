"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TopBar from "../../../../components/topbar";
import { useAuth } from "../../../../lib/auth-context";
import { todayKeyTR } from "../../../../lib/date";
import { subscribeTodayMatches, type Match } from "../../../../lib/matches";

type ProMatch = Match & {
  pct_8_5?: number | string | null;
  pct_9_5?: number | string | null;
  pct_10_5?: number | string | null;
  cornerAvg?: number | string | null;
  avgCorners?: number | string | null;
  time?: string | null;
  kickoff?: string | null;
  tag?: string | null;
  date?: string | null;
  dateKey?: string | null;
};

function toPercent(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return Math.max(0, Math.min(100, n * 100));
  return Math.max(0, Math.min(100, n));
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Basic yatay bar (premium değil): sakin, düz */
function BasicRow({ label, value }: { label: string; value: any }) {
  const p = toPercent(value);
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-sm font-bold text-white/80">{label}</div>

      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full bg-white/35"
          style={{ width: `${p}%` }}
        />
      </div>

      <div className="w-12 text-right text-sm font-bold text-white tabular-nums">
        {Math.round(p)}%
      </div>
    </div>
  );
}

/** Pro bölümünde kullanılacak ince dikey bar (premium) */
function ThinBar({ label, value }: { label: string; value: any }) {
  const p = toPercent(value);
  const t = Math.max(0, Math.min(100, p)) / 100;
  const hue = Math.round(10 + t * (120 - 10)); // 10..120
  const fillColor = `hsl(${hue} 85% 55% / 0.82)`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-[18px] font-extrabold text-white tabular-nums">
        {Math.round(p)}%
      </div>

      <div className="mt-2 h-28 w-3 rounded-full bg-white/10 overflow-hidden relative">
        <div
          className="absolute left-0 right-0 bottom-0 rounded-full"
          style={{ height: `${p}%`, background: fillColor }}
        />
      </div>

      <div className="mt-2 text-xs font-bold tracking-wide text-white/75">
        {label}
      </div>
    </div>
  );
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
    const tag = String((m as any)?.tag ?? "").trim();

    const p85 = toPercent((m as any)?.pct_8_5);
    const p95 = toPercent((m as any)?.pct_9_5);
    const p105 = toPercent((m as any)?.pct_10_5);

    const confScore = (p85 + p95 + p105) / 3;
    const confLabel =
      confScore >= 70
        ? "Yüksek"
        : confScore >= 55
        ? "Orta"
        : confScore > 0
        ? "Düşük"
        : "";

    const riskLabel =
      confLabel === "Yüksek"
        ? "Düşük"
        : confLabel === "Orta"
        ? "Orta"
        : confLabel === "Düşük"
        ? "Yüksek"
        : "";

    const hats = [
      { label: "8.5", pct: p85 },
      { label: "9.5", pct: p95 },
      { label: "10.5", pct: p105 },
    ].sort((a, b) => b.pct - a.pct);

    return {
      kickoff,
      avg,
      tag,
      p85,
      p95,
      p105,
      best: hats[0],
      confLabel,
      riskLabel,
    };
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
                  onClick={() => 
                    router.push(
                      `/matches/match/${encodeURIComponent(String((match as any)?.id ?? ""))}`
                    )
                   }
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
                >
                  Pro Analize Dön
                </button>
                <button
                  onClick={() => router.push("/matches")}
                  className="px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold"
                >
                  Maçlara Git
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

                {/* BASIC HERO */}
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

                {/* BASIC INFO */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs text-white/55">Bilgiler</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Tag</span>
                        <span className="font-bold text-white/85">
                          {vm.tag || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Ortalama Korner</span>
                        <span className="font-bold text-white/85 tabular-nums">
                          {vm.avg ? vm.avg.toFixed(2) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs text-white/55">
                      Olasılıklar (Basic)
                    </div>
                    <div className="mt-3 space-y-3">
                      <BasicRow label="8.5" value={vm.p85} />
                      <BasicRow label="9.5" value={vm.p95} />
                      <BasicRow label="10.5" value={vm.p105} />
                    </div>
                  </div>
                </div>

                {/* PRO SECTION */}
                <div className="mt-5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
                    <div className="text-sm font-extrabold tracking-[0.12em] text-white/80">
                      PRO ANALİZ
                    </div>
                    {!isPremium ? (
                      <div className="text-[11px] font-bold text-white/55">
                        Kilitli
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-200">
                        Aktif
                      </div>
                    )}
                  </div>

                  {!isPremium ? (
                    <div className="p-4 bg-black/10">
                      <div className="text-sm font-bold">
                        Pro içerik Premium ile açılır
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        Pro özet + dikey grafik + model değerlendirmesi burada görünür.
                      </div>
                      <button
                        onClick={() => router.push("/buy")}
                        className="mt-3 px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold"
                      >
                        Paket Satın Al
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-black/10">
                      <div className="text-[12px] text-white/70">
                        Pro Özet • En güçlü hat:{" "}
                        <b className="text-white/90">
                          {vm.best.label} ({Math.round(vm.best.pct)}%)
                        </b>{" "}
                        • Risk:{" "}
                        <b className="text-white/90">{vm.riskLabel || "—"}</b>{" "}
                        • Güven:{" "}
                        <b className="text-white/90">{vm.confLabel || "—"}</b>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-white/60">
                            Üst olasılıkları
                          </div>
                          <div className="text-[11px] text-white/35">Pro grafik</div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-6">
                          <ThinBar label="8.5" value={vm.p85} />
                          <ThinBar label="9.5" value={vm.p95} />
                          <ThinBar label="10.5" value={vm.p105} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
