"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../../components/topbar";
import { useAuth } from "../../lib/auth-context";
import { todayKeyTR } from "../../lib/date";
import { subscribeTodayMatches, type Match } from "../../lib/matches";

/** Firestore dokümanında ekstra alanlar (yüzdeler) */
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

function toPercent(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return Math.max(0, Math.min(100, n * 100));
  return Math.max(0, Math.min(100, n));
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

/** ✅ İnce dikey bar (premium): yüzde üstte, bar ortada, label altta
 *  ✅ Renk %0–100'e göre otomatik (HSL)
 *  ✅ Çok kırmızıya düşmesin diye hue aralığı: 10..120 (red->green)
 */
function ThinBar({ label, value }: { label: string; value: any }) {
  const p = toPercent(value);

  // 0..100 => hue 10..120 (daha premium: tam kırmızıya düşmez)
  const t = Math.max(0, Math.min(100, p)) / 100;
  const hue = Math.round(10 + t * (120 - 10));

  // premium: çok bağırmasın (opaklık yumuşak)
  const fillColor = `hsl(${hue} 85% 55% / 0.82)`;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-[18px] font-extrabold text-white tabular-nums">
        {Math.round(p)}%
      </div>

      <div className="mt-2 h-28 w-3 rounded-full bg-white/10 overflow-hidden relative">
        <div
          className="absolute left-0 right-0 bottom-0 rounded-full"
          style={{
            height: `${p}%`,
            background: fillColor,
          }}
        />
      </div>

      <div className="mt-2 text-xs font-bold tracking-wide text-white/75">
        {label}
      </div>
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
    // ✅ SADECE BUGÜN + SADECE NORMAL DIŞINDA TAG OLANLAR
    const today = normalizeTRDateKey(dateKey);

    const filtered = (rows ?? []).filter((m) => {
      // sadece bugünün maçları
      const mDate = normalizeTRDateKey(m.date ?? m.dateKey ?? "");
      if (mDate !== today) return false;

      // ✅ tag "normal" ise Pro'ya girmesin
      const tagRaw = (m as any).tag;
      const tag = String(tagRaw ?? "").trim();
      const low = tag.toLowerCase();

      // etiketsizlerin çoğu "normal" geliyor → bunu ele
      if (!tag) return false;
      if (low === "normal") return false;

      // ekstra güvenlik
      if (low === "undefined" || low === "null" || low === "-" || low === "0")
        return false;

      return true;
    });

    // sıralama saat
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
                PRO (Kilitli)
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
                Bugün: <b>{dateKey}</b> — Pro’da sadece <b>normal dışı tag</b>{" "}
                maçlar gösterilir
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs flex items-center gap-2">
              <span className="font-bold">PRO</span>
              <span className="text-emerald-300 font-bold">AKTİF ✅</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6">
          {cards.length === 0 ? (
            <div className="text-white/70">
              Bugün için <b>normal dışı tag</b> Pro maç yok.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map((m) => {
              const kickoff = String(m.time ?? m.kickoff ?? "").trim();
              const avg = Number((m.cornerAvg ?? m.avgCorners ?? 0) as any) || 0;

              const p85Raw = (m as any).pct_8_5;
              const p95Raw = (m as any).pct_9_5;
              const p105Raw = (m as any).pct_10_5;

              const p85 = toPercent(p85Raw);
              const p95 = toPercent(p95Raw);
              const p105 = toPercent(p105Raw);

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

              const tag = String((m as any).tag ?? "").trim();

              const hats = [
                { label: "8.5", pct: p85 },
                { label: "9.5", pct: p95 },
                { label: "10.5", pct: p105 },
              ].sort((a, b) => b.pct - a.pct);

              const best = hats[0];

              return (
                <button
                  key={(m as any).id}
                  onClick={() => 
                    router.push(
                      `/matches/match/${encodeURIComponent(String((m as any).id ?? ""))}`
                    )
                  }
                  className="text-left rounded-3xl bg-white/5 border border-white/10 hover:bg-white/7 hover:border-white/15 transition overflow-hidden"
                >
                  <div className="p-6">
                    {/* ✅ META satırı ayrı */}
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

                    {/* ✅ HERO satırı: items-center => dikey ortalı */}
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

                      {/* ✅ Metric panel */}
                      <div className="shrink-0 w-[170px] sm:w-[190px] rounded-2xl bg-white/6 border border-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/75">
                            PRO ANALİZ
                          </div>
                          <div className="text-[10px] font-bold text-emerald-200 bg-emerald-500/15 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                            PRO
                          </div>
                        </div>

                        <div className="mt-3 text-[11px] text-white/55">
                          Korner AVG
                        </div>
                        <div className="text-[20px] font-extrabold leading-none tabular-nums">
                          {avg.toFixed(2)}
                        </div>

                        {confLabel ? (
                          <div className="mt-2 text-[12px] text-white/65">
                            Güven:{" "}
                            <span className="font-bold text-white/85">
                              {confLabel}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 text-[12px] text-white/40">
                            Güven: —
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ Pro Özet */}
                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 px-4 py-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/70">
                        <span className="font-bold text-white/85">Pro Özet</span>
                        <span className="text-white/25">•</span>
                        <span>
                          En güçlü hat:{" "}
                          <b className="text-white/90">
                            {best.label} ({Math.round(best.pct)}%)
                          </b>
                        </span>

                        {riskLabel ? (
                          <>
                            <span className="text-white/25">•</span>
                            <span>
                              Risk: <b className="text-white/90">{riskLabel}</b>
                            </span>
                          </>
                        ) : null}

                        {tag ? (
                          <>
                            <span className="text-white/25">•</span>
                            <span>
                              Tag: <b className="text-white/90">{tag}</b>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* ✅ Stats panel */}
                    <div className="mt-4 rounded-2xl bg-black/15 border border-white/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-white/60">
                          Üst olasılıkları
                        </div>
                        <div className="text-[11px] text-white/35">Pro grafik</div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-6">
                        <ThinBar label="8.5" value={p85} />
                        <ThinBar label="9.5" value={p95} />
                        <ThinBar label="10.5" value={p105} />
                      </div>

                      <div className="mt-4 text-[11px] text-white/40 flex items-center gap-2">
                        <span>Detay için tıkla</span>
                        <span className="text-white/25">→</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
