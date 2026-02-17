"use client";

import { useEffect, useMemo, useState } from "react";
import TopBar from "../../components/topbar";
import { useAuth } from "../../lib/auth-context";
import { todayKeyTR } from "../../lib/date";
import { subscribeTodayMatches, type Match } from "../../lib/matches";

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

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function clamp(n: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n));
}

function toScore100(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return clamp(n * 100);
  return clamp(n);
}

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
    <div className="mt-2 h-3 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 via-teal-400 to-amber-400 shadow-[0_0_18px_rgba(56,189,248,0.25)]"
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

function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </div>

      <div className="p-6">
        <div className="h-3 w-56 rounded bg-white/10" />
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
          <div className="h-3 w-8 rounded bg-white/10" />
          <div className="space-y-2 text-right">
            <div className="h-5 w-40 rounded bg-white/10 ml-auto" />
            <div className="h-3 w-16 rounded bg-white/10 ml-auto" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
          <div className="h-3 w-44 rounded bg-white/10" />
          <div className="mt-2 h-8 w-28 rounded bg-white/10" />
          <div className="mt-3 h-3 w-full rounded bg-white/10" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-black/15 border border-white/10 p-4">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="mt-2 h-5 w-20 rounded bg-white/10" />
              <div className="mt-3 h-2 w-full rounded bg-white/10" />
              <div className="mt-3 h-3 w-36 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProPage() {
  const { user, loading, isPremium } = useAuth();

  const [rows, setRows] = useState<ProMatch[]>([]);
  const [dateKey] = useState(() => todayKeyTR());
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeTodayMatches(dateKey, (list: Match[]) => {
      setRows(list as ProMatch[]);
      setHasLoaded(true);
    });
    return () => unsub();
  }, [dateKey]);

  const cards = useMemo(() => {
    const today = normalizeTRDateKey(dateKey);

    const filtered = (rows ?? []).filter((m) => {
      const mDate = normalizeTRDateKey(m.date ?? m.dateKey ?? "");
      if (mDate && mDate !== today) return false;

      const tag = String((m as any).tag ?? "").trim().toLowerCase();
      return tag === "high";
    });

    const copy = [...filtered];
    copy.sort((a, b) => {
      const ta = String(a.time ?? a.kickoff ?? "");
      const tb = String(b.time ?? b.kickoff ?? "");
      return ta.localeCompare(tb);
    });

    return copy;
  }, [rows, dateKey]);

  if (!loading && user && !isPremium) {
    return (
      <>
        <TopBar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Analytics</h1>
                <p className="text-white/60 mt-2">
                  Bu sayfa sadece <b>Premium</b> üyelerde açılır.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs">
                Kilitli
              </div>
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
        <div className="rounded-3xl bg-white/5 border border-white/10 p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black">Analytics</h1>
              <p className="text-white/60 mt-2 text-sm">
                Bugün: <b>{dateKey}</b> — yalnızca <b>tag: high</b> maçlar listelenir.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs flex items-center gap-2">
              <span className="font-bold">ACTIVE</span>
              <span className="text-sky-200 font-bold">●</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {!hasLoaded ? (
            <div className="grid grid-cols-1 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <div className="text-2xl font-black">Bugün Analytics maçı yok</div>
              <div className="mt-2 text-white/60 text-sm">
                Tag’i <b>high</b> olan maçlar burada görünür.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {cards.map((m) => {
                const kickoff = String(m.time ?? m.kickoff ?? "").trim();
                const avg = Number((m.cornerAvg ?? m.avgCorners ?? 0) as any) || 0;

                const s85 = toScore100((m as any).pct_8_5);
                const s95 = toScore100((m as any).pct_9_5);
                const s105 = toScore100((m as any).pct_10_5);

                const cii = Math.round(s85 || s95 || s105 || 0);
                const level = intensityLabel(cii);

                const spread = Math.abs(s105 - s85);
                const trend =
                  cii >= 70 && spread <= 12 ? "Rising" : cii > 0 ? "Stable" : "—";

                const tempoScore = clamp(cii);
                const pressureIndex = clamp(avg * 10);
                const openness = clamp((s95 + s105) / 2 || cii);
                const production = clamp((s85 + s95 + s105) / 3 || cii);

                return (
                  <div
                    key={(m as any).id}
                    className={cx(
                      "relative rounded-3xl overflow-hidden",
                      "bg-white/5 border border-white/10 backdrop-blur",
                      "transition-all duration-200",
                      "hover:bg-white/7 hover:border-white/20"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/7 via-transparent to-transparent" />
                    <div className="relative p-6">
                      <div className="text-[12px] text-white/70 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-white/80">{(m as any).country}</span>
                        <span className="text-white/25">•</span>
                        <span className="font-semibold text-white/80">{(m as any).league}</span>
                        {kickoff ? (
                          <>
                            <span className="text-white/25">•</span>
                            <span className="font-semibold text-white/80 tabular-nums">{kickoff}</span>
                          </>
                        ) : null}
                      </div>

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

                        <div className="shrink-0 w-[190px] rounded-2xl bg-white/6 border border-white/10 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/75">
                              ANALYTICS
                            </div>
                            <div className="text-[10px] font-bold text-sky-200 bg-sky-500/15 border border-sky-400/20 px-2 py-0.5 rounded-full">
                              HIGH
                            </div>
                          </div>

                          <div className="mt-3 text-[11px] text-white/55">Avg Corners</div>
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

                      <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-[12px] text-white/60">Corner Intensity Index (CII)</div>
                            <div className="mt-1 flex items-baseline gap-2">
                              <div className="text-[28px] font-black tabular-nums">{cii || 0}</div>
                              <div className="text-[12px] text-white/45 font-semibold">/100</div>
                              <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/80">
                                {level}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-white/45">{intensityHint(cii)}</div>
                          </div>
                        </div>

                        <GradientBar value={cii} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                          <div className="text-[11px] text-white/55">Tempo Score</div>
                          <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                            {Math.round(tempoScore)}/100
                          </div>
                          <MiniProgress value={tempoScore} />
                        </div>

                        <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                          <div className="text-[11px] text-white/55">Pressure Index</div>
                          <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                            {Math.round(pressureIndex)}/100
                          </div>
                          <MiniProgress value={pressureIndex} />
                        </div>

                        <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                          <div className="text-[11px] text-white/55">Production Score</div>
                          <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                            {Math.round(production)}/100
                          </div>
                          <MiniProgress value={production} />
                        </div>

                        <div className="rounded-2xl bg-black/15 border border-white/10 p-4">
                          <div className="text-[11px] text-white/55">Match Openness</div>
                          <div className="mt-1 text-[18px] font-extrabold tabular-nums">
                            {Math.round(openness)}/100
                          </div>
                          <MiniProgress value={openness} />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <MetricChip k="CII Level" v={level} />
                        <MetricChip k="Trend" v={trend === "—" ? "—" : trend} />
                        <MetricChip k="Avg Corners" v={avg ? avg.toFixed(2) : "—"} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6">
            <div className="text-[12px] text-white/55 leading-relaxed">
              <b className="text-white/75">Not:</b> CII ve ilgili metrikler istatistiksel analiz göstergeleridir. Finansal yönlendirme amacı taşımaz.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
