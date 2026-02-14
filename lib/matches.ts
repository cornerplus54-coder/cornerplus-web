import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type Match = {
  id: string;

  // Firestore alanların
  date: string;      // "13.02.2026"
  time: string;      // "20:30"
  country: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  cornerAvg: number;

  pct_10_5?: number;
  pct_9_5?: number;
  pct_8_5?: number;

  tag: "high" | "trap" | "normal";
};

function normalizeTag(tag: any): Match["tag"] {
  const t = String(tag ?? "").toLowerCase().trim();
  if (t === "high") return "high";
  if (t === "trap") return "trap";
  return "normal";
}

export function subscribeTodayMatches(dateStr: string, cb: (rows: Match[]) => void): Unsubscribe {
  // ✅ Sende field adı "date"
  const q = query(collection(db, "matches"), where("date", "==", dateStr));

  return onSnapshot(
    q,
    (snap) => {
      const rows: Match[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          date: String(data.date ?? ""),
          time: String(data.time ?? ""),
          country: String(data.country ?? ""),
          league: String(data.league ?? ""),
          homeTeam: String(data.homeTeam ?? ""),
          awayTeam: String(data.awayTeam ?? ""),
          cornerAvg: Number(data.cornerAvg ?? 0),
          pct_10_5: data.pct_10_5 != null ? Number(data.pct_10_5) : undefined,
          pct_9_5: data.pct_9_5 != null ? Number(data.pct_9_5) : undefined,
          pct_8_5: data.pct_8_5 != null ? Number(data.pct_8_5) : undefined,
          tag: normalizeTag(data.tag),
        };
      });

      // ✅ Sıralama client tarafında (index istemez)
      rows.sort((a, b) => {
        const c = a.country.localeCompare(b.country, "tr");
        if (c !== 0) return c;
        const l = a.league.localeCompare(b.league, "tr");
        if (l !== 0) return l;
        return (a.time || "99:99").localeCompare(b.time || "99:99");
      });

      cb(rows);
    },
    (err) => {
      console.error("Firestore subscribe error:", err);
      cb([]);
    }
  );
}

export async function getMatchById(id: string): Promise<Match | null> {
  const ref = doc(db, "matches", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  return {
    id: snap.id,
    date: String(data.date ?? ""),
    time: String(data.time ?? ""),
    country: String(data.country ?? ""),
    league: String(data.league ?? ""),
    homeTeam: String(data.homeTeam ?? ""),
    awayTeam: String(data.awayTeam ?? ""),
    cornerAvg: Number(data.cornerAvg ?? 0),
    pct_10_5: data.pct_10_5 != null ? Number(data.pct_10_5) : undefined,
    pct_9_5: data.pct_9_5 != null ? Number(data.pct_9_5) : undefined,
    pct_8_5: data.pct_8_5 != null ? Number(data.pct_8_5) : undefined,
    tag: normalizeTag(data.tag),
  };
}
