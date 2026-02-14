export type Match = {
  id: string;
  dateISO: string;   // YYYY-MM-DD
  time: string;      // HH:mm
  country: string;
  league: string;
  home: string;
  away: string;
  avgCorners: number;
  tag?: "high" | "trap" | "normal";
};

export function todayISO_TR(): string {
  // Europe/Istanbul (saf TR saatine yakın olsun diye local date kullanıyoruz)
  // Not: Server tarafı değil, client tarafı kullanıyoruz sayfalarda.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTRDate(iso: string) {
  // iso: YYYY-MM-DD -> DD.MM.YYYY
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export const SAMPLE_MATCHES: Match[] = [
  {
    id: "m1",
    dateISO: "2026-02-13",
    time: "20:45",
    country: "İngiltere",
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    avgCorners: 10.4,
    tag: "high",
  },
  {
    id: "m2",
    dateISO: "2026-02-13",
    time: "22:00",
    country: "İspanya",
    league: "LaLiga",
    home: "Real Sociedad",
    away: "Villarreal",
    avgCorners: 9.6,
    tag: "high",
  },
  {
    id: "m3",
    dateISO: "2026-02-13",
    time: "19:30",
    country: "Hollanda",
    league: "Eredivisie",
    home: "PSV",
    away: "AZ",
    avgCorners: 8.9,
    tag: "normal",
  },
  {
    id: "m4",
    dateISO: "2026-02-13",
    time: "18:00",
    country: "Türkiye",
    league: "Süper Lig",
    home: "Galatasaray",
    away: "Trabzonspor",
    avgCorners: 11.1,
    tag: "high",
  },
];
