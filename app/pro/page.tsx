"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../../components/topbar";
import { useAuth } from "../../lib/auth-context";
import { todayKeyTR } from "../../lib/date";
import { subscribeTodayMatches, type Match } from "../../lib/matches";

/** Firestore dokümanında ekstra alanlar (yüzdeler vs) */
type ProMatch = Match & {
  pct_8_5?: number | string | null;
  pct_9_5?: number | string | null;
  pct_10_5?: number | string | null;

  cornerAvg?: number | string | null;
  avgCorners?: number | string | null;

  time?: string | null;
  kickoff?: string | null;

  date?: string | null;
  dateKey?: string | null;
  tag?: string | null;
};

function clamp(n: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n));
}

function toScore100(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  // 0..1 gelirse 0..100'e çek
  if (n <= 1) return clamp(n * 100);
  return clamp(n);
}

/** ✅ date normalize: 1.2.2026 -> 01.02.2026 */
function normalizeTRDateKey(s: any) {
  const raw = String(s ?? "").trim();
  if (!raw) return "";
  const parts = raw.split(".");
  if (parts.length !== 3) return raw;
  const [d, m, y] = parts;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const yy = String(y);
  return `${dd}.${mm}.${yy}`;
}

function intensityLabel(score: number) {
  if (score >= 80) return "Very High";
  if (score >= 65) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Low";
  return "Very Low";
}

function intensityHint(score: number) {
  if (score >= 80) return "Strong intensity profile";
  if (score >= 65) return "Above-average intensity";
  if (score >= 50) return "Balanced intensity";
  if (score >= 35) return "Lower intensity profile";
  return "Very low intensity profile";
}

function TrendPill({ label }: { label: string }) {
  const color =
    label === "Rising"
      ? "text-emerald-200 bg-emerald-500/15 border-emerald-400/20"
      : label === "Falling"
      ? "text-amber-200 bg-amber-500/15 border-amber-400/20"
      : "text-white/80 bg-white/10 border-white/10";

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

function MetricChip({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
      <div className="text-[11px] text-white/55">{k}</div>
      <div className="text-[12px] font-extrabold text-white/85 tabular-nums">{v}</div>
    </div>
  );
}

function GradientBar({ value }: { value: number }) {
  const p = clamp(Math.round(value));
  return (
    <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 via-teal-400 to-amber-400"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function MiniProgress({ value }: { value: number }) {
  const p = clamp(Math.round(value));
  return (
    <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-white/60" style={{ width: `${p}%` }} />
    </div>
  );
}

export default function ProPage() {
  const router = useRouter();
  const { user, loading, isPremium } = useAuth();

  const [rows, setRows] = useState<ProMatch[]>([]);
  const [dateKey] = useState(() => todayKeyTR());

  // auth gate
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  // data
  useEffect(() => {
    const unsub = subscribeTodayMatches(dateKey, (list: Match[]) => {
      setRows(list as ProMatch[]);
    });
    return () => unsub();
  }, [dateKey]);

  const cards = useMemo(() => {
    const today = normalizeTRDateKey(dateKey);

    const filtered = (rows ?? []).filter((m) => {
      // sadece bugünün maçları (güvenlik)
      const mDate = normalizeTRDateKey(m.date ?? m.dateKey ?? "");
      if (mDate && mDate !== today) return false;

      // ✅ sadece tag === "high"
      const tag = String((m as any).tag ?? "").trim().toLowerCase();
      if (tag !== "high") return false;

      return true;
    });

    const copy = [...filtered];
    copy.sort((a, b) => {
      const ta = String(a.time ?? a.kickoff ?? "");
      const tb = String(b.time ?? b.kickoff ?? "");
      return ta.localeCompare(tb);
    });

    return copy;
  }, [rows, dateKey]);

  // premium değilse kilit ekranı
  if (!loading && user && !isPremium) {
    return (
      <>
        <TopBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Pro Analiz</h1>
                <p className="text-white/60 mt-2">
                  Bu sayfa sadece <b>Premium</b> üyelerde açılır.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs">
                ADVANCED (Kilitli)
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/buy")}
                className="px-5 py-3 rounded-2xl bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold"
              >
                Paket Satın Al
              </button>
              <button
                onClick={() => router.push("/matches")}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold"
              >
                Maçlara Dön
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black">Pro Analiz</h1>
              <p className="text-white/60 mt-2 text-sm">
                Bugün: <b>{dateKey}</b> — sadece <b>tag: high</b> maçlar listelenir.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs flex items-center gap-2">
              <span className="font-bold">ADVANCED</span>
              <span className="text-emerald-300 font-bold">AKTİF ✅</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6">
          {cards.length === 0 ? (
            <div className="text-white/70">
              Bugün için <b>tag: high</b> Pro maç yok.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map((m) => {
              const kickoff = String(m.time ?? m.kickoff ?? "").trim();
              const avg = Number((m.cornerAvg ?? m.avgCorners ?? 0) as any) || 0;

              // ✅ CII: hızlı çözüm (mevcut alanlardan türet) — UI’da asla line/üst-alt göstermiyoruz
              const s85 = toScore100((m as any).pct_8_5);
              const s95 = toScore100((m as any).pct_9_5);
              const s105 = toScore100((m as any).pct_10_5);

              // ana skor (CII)
              const cii = Math.round(
                s85 || s95 || s105 ? (s85 || s95 || s105) : 0
              );

              const level = intensityLabel(cii);

              // Basit “trend” sezgisi (tarihsel değil, skor dağılımına göre)
              const spread = Math.abs(s105 - s85);
              const trend =
                cii >= 70 && spread <= 12 ? "Rising" : cii > 0 ? "Stable" : "—";

              // Breakdown (tamamen analiz dili)
              const tempoScore = clamp(cii);
              const pressureIndex = clamp(avg * 10); // avgCorners ~ 0..12 -> 0..120
              const openness = clamp((s95 + s105) / 2 || cii);
              const production = clamp((s85 + s95 + s105) / 3 || cii);

              return (
                <button
                  key={(m as any).id}
                  onClick={() =>
                    router.push(
                      `/matches/match/${encodeURIComponent(
                        String((m as any).id ?? "")
                      )}`
                    )
                  }
                  className="text-left rounded-3xl bg-white/5 border border-white/10 hover:bg-white/7 hover:border-white/15 transition overflow-hidden"
                >
                  <div className="p-6">
                    {/* META */}
                    <div className="text-[12px] text-white/70 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-white/80">
                        {(m as any).country}
                      </span>
                      <span className="text-white/25">•</span>
                      <span className="font-semibold text-white/80">
                        {(m as any).league}
                      </span>
                      {kickoff ? (
                        <>
                          <span className="text-white/25">•</span>
                          <span className="font-semibold text-white/80 tabular-nums">
                            {kickoff}
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* TEAMS + SIDE PANEL */}
                    <div className="mt-4 flex items-center justify-between gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="max-w-[520px] mx-auto">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                            <div className="min-w-0">
                              <div className="text-[22px] sm:text-[24px] font-black leading-tight truncate">
                                {(m as any).homeTeam}
                              </div>
                              <div className="mt-1 text-[10px] tracking-[0.22em] text-white/35">
                                HOME
                              </div>
                            </div>

                            <div className="text-[11px] font-bold tracking-[0.30em] text-white/35">
                              VS
                            </div>

                            <div className="min-w-0 text-right">
                              <div className="text-[22px] sm:text-[24px] font-black leading-tight truncate">
                                {(m as any).awayTeam}
                              </div>
                              <div className="mt-1 text-[10px] tracking-[0.22em] text-white/35">
                                AWAY
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DASHBOARD MINI PANEL */}
                      <div className="shrink-0 w-[190px] rounded-2xl bg-white/6 border border-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/75">
                            ANALYTICS
                          </div>
                          <div className="text-[10px] font-bold text-white/85 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                            HIGH
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-white/55">
                          Avg Corners
                        </div>
                        <div className="text-[20px] font-extrabold leading-none tabular-nums">
                          {avg ? avg.toFixed(2) : "—"}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[11px] text-white/55">Trend</div>
                          {trend === "—" ? (
                            <span className="text-[11px] text-white/35">—</span>
                          ) : (
                            <TrendPill label={trend} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* HERO: CII */}
                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[12px] text-white/60">
                            Corner Intensity Index (CII)
                          </div>
                          <div className="mt-1 flex items-baseline gap-2">
                            <div className="text-[28px] font-black tabular-nums">
                              {cii || 0}
                            </div>
                            <div className="text-[12px] text-white/45 font-semibold">
                              /100
                            </div>
                            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
                              {level}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-white/45">
                            {intensityHint(cii)}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[11px] text-white/55">Tempo Level</div>
                          <div className="text-[13px] font-extrabold text-white/85">
                            {level === "Very High" ? "High" : level}
                          </div>
                        </div>
                      </div>

                      <GradientBar value={cii} />
                    </div>

                    {/* BREAKDOWN GRID */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                        <div className="text-[11px] text-white/55">Tempo Score</div>
                        <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                          {Math.round(tempoScore)}/100
                        </div>
                        <MiniProgress value={tempoScore} />
                        <div className="mt-2 text-[11px] text-white/40">
                          Measures pace intensity
                        </div>
                      </div>

                      <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                        <div className="text-[11px] text-white/55">Pressure Index</div>
                        <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                          {Math.round(pressureIndex)}/100
                        </div>
                        <MiniProgress value={pressureIndex} />
                        <div className="mt-2 text-[11px] text-white/40">
                          Attacking pressure frequency
                        </div>
                      </div>

                      <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                        <div className="text-[11px] text-white/55">Production Score</div>
                        <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                          {Math.round(production)}/100
                        </div>
                        <MiniProgress value={production} />
                        <div className="mt-2 text-[11px] text-white/40">
                          Overall production profile
                        </div>
                      </div>

                      <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                        <div className="text-[11px] text-white/55">Match Openness</div>
                        <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                          {Math.round(openness)}/100
                        </div>
                        <MiniProgress value={openness} />
                        <div className="mt-2 text-[11px] text-white/40">
                          Space & transitions indicator
                        </div>
                      </div>
                    </div>

                    {/* quick chips */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <MetricChip k="CII Level" v={level} />
                      <MetricChip k="Trend" v={trend === "—" ? "—" : trend} />
                      <MetricChip k="Avg Corners" v={avg ? avg.toFixed(2) : "—"} />
                    </div>

                    <div className="mt-4 text-[11px] text-white/40 flex items-center gap-2">
                      <span>Detay için tıkla</span>
                      <span className="text-white/25">→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="text-[12px] text-white/55 leading-relaxed">
              <b className="text-white/75">Not:</b> CII ve ilgili metrikler,
              geçmiş maç verileri ve tempo göstergelerinden türetilen{" "}
              <b>istatistiksel analiz göstergeleridir</b>. Finansal yönlendirme
              amacı taşımaz.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
