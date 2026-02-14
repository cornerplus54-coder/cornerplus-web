"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../../components/topbar";
import { useAuth } from "../../lib/auth-context";
import { todayKeyTR } from "../../lib/date";
import { subscribeTodayMatches, type Match } from "../../lib/matches";

export default function MatchesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Match[]>([]);
  const [dateStr] = useState(() => todayKeyTR());

  // filters
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [leagueFilter, setLeagueFilter] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const unsub = subscribeTodayMatches(dateStr, setRows);
    return () => unsub();
  }, [dateStr]);

  // dropdown options
  const countries = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((m) => {
      if (m.country) set.add(m.country);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [rows]);

  const leagues = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((m) => {
      if (countryFilter && m.country !== countryFilter) return;
      if (m.league) set.add(m.league);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [rows, countryFilter]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((m) => {
      if (countryFilter && m.country !== countryFilter) return false;
      if (leagueFilter && m.league !== leagueFilter) return false;

      if (!s) return true;
      const hay = [
        m.country,
        m.league,
        m.homeTeam,
        m.awayTeam,
        m.time,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");
      return hay.includes(s);
    });
  }, [rows, q, countryFilter, leagueFilter]);

  // ✅ İstediğin düzen: "Ülke+Lig" başlık bloğu -> maçlar -> sonraki başlık bloğu...
  const blocks = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filtered) {
      const key = `${m.country}|||${m.league}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }

    const entries = Array.from(map.entries()).map(([key, matches]) => {
      // saat sıralaması
      matches.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
      const [country, league] = key.split("|||");
      return { country, league, matches };
    });

    // ülke sonra lig sırası
    entries.sort((a, b) => {
      const c = a.country.localeCompare(b.country, "tr");
      if (c !== 0) return c;
      return a.league.localeCompare(b.league, "tr");
    });

    return entries;
  }, [filtered]);

  function clearFilters() {
    setCountryFilter("");
    setLeagueFilter("");
    setQ("");
  }

  // ülke değişince lig filtresini resetle (uygulama gibi)
  useEffect(() => {
    setLeagueFilter("");
  }, [countryFilter]);

  return (
    <>
      <TopBar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ✅ ÜST BAR: Tarih + Filtreler (yan yana) */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5">
          <div className="flex flex-col gap-3">
            {/* Tarih bar */}
            <div className="flex items-center justify-between rounded-2xl bg-black/30 border border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-white/70">📅</span>
                <div className="font-semibold">Bugün</div>
                <div className="text-white/60 text-sm">{dateStr}</div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              >
                Yenile
              </button>
            </div>

            {/* Filtre bar (yan yana) */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Country */}
              <div className="flex-1 md:flex-none">
                <div className="flex items-center gap-2 rounded-2xl bg-black/30 border border-white/10 px-3 py-2">
                  <span className="text-white/70">🌍</span>
                  <select
                    className="bg-transparent outline-none text-sm w-full text-white"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                  >
                    <option value="">Ülke (Hepsi)</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* League */}
              <div className="flex-1 md:flex-none">
                <div className="flex items-center gap-2 rounded-2xl bg-black/30 border border-white/10 px-3 py-2">
                  <span className="text-white/70">🏆</span>
                  <select
                    className="bg-transparent outline-none text-sm w-full text-white"
                    value={leagueFilter}
                    onChange={(e) => setLeagueFilter(e.target.value)}
                    disabled={!countryFilter && leagues.length === 0}
                  >
                    <option value="">Lig (Hepsi)</option>
                    {leagues.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={clearFilters}
                className="md:flex-none px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-sm"
              >
                Temizle
              </button>

              {/* Search */}
              <div className="flex-1">
                <div className="flex items-center gap-2 rounded-2xl bg-black/30 border border-white/10 px-4 py-3">
                  <span className="text-white/60">🔎</span>
                  <input
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Maç ara..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ BLOK BLOK LİST */}
        <div className="mt-6 space-y-6">
          {blocks.length === 0 ? (
            <div className="text-white/70">
              Bugün için maç yok. Firestore’da <b>date</b> = <b>{dateStr}</b> olan maçları kontrol et.
            </div>
          ) : null}

          {blocks.map((b) => (
            <section
              key={`${b.country}|||${b.league}`}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
            >
              {/* ✅ Ülke + Lig başlık bar (ikonlu) */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">🌍</span>
                    <span className="font-bold">{b.country}</span>
                  </div>
                  <div className="text-white/30">|</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">🏆</span>
                    <span className="font-semibold">{b.league}</span>
                  </div>
                </div>

                <div className="text-xs text-white/60">{b.matches.length} maç</div>
              </div>

              {/* ✅ Maç satırları (tag yok, alt lig yazısı yok) */}
              <div className="divide-y divide-white/10">
                {b.matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => 
                      router.push(
                        `/matches/match/${encodeURIComponent(String((m as any).id ?? ""))}`
                      )
                    } 
                    className="w-full text-left px-5 py-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white/70 text-sm w-14">{m.time}</div>

                      <div className="flex-1">
                        <div className="font-semibold">
                          {m.homeTeam} <span className="text-white/60">vs</span> {m.awayTeam}
                        </div>
                      </div>

                      <div className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
                        AVG: <b>{Number(m.cornerAvg ?? 0).toFixed(2)}</b>
                      </div>

                      <div className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
                        Detay
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
