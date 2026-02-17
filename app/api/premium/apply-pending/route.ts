export const runtime = "nodejs";

import { NextResponse } from "next/server";
import admin from "firebase-admin";

function getAdmin() {
  if (admin.apps.length) return admin;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error("Missing Firebase Admin env vars");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return admin;
}

function tsToMs(v: any): number | null {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate().getTime(); // Firestore Timestamp
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_token" }, { status: 401 });
    }

    const a = getAdmin();
    const db = a.firestore();

    const decoded = await a.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email;

    if (!uid || !email) {
      return NextResponse.json({ ok: false, error: "missing_uid_or_email" }, { status: 400 });
    }

    const pendSnap = await db
      .collection("premium_pending")
      .where("email", "==", email)
      .get();

    if (pendSnap.empty) {
      return NextResponse.json({ ok: true, applied: 0 });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const existingMs = tsToMs(userSnap.data()?.premiumUntil);
    const baseMs = existingMs && existingMs > now ? existingMs : now;

    // kaç pending varsa o kadar 30 gün ekle (istersen sonra “pakete göre gün” yaparız)
    const addMs = pendSnap.size * THIRTY_DAYS_MS;
    const premiumUntil = new Date(baseMs + addMs);

    const batch = db.batch();

    batch.set(
      userRef,
      {
        email,
        isPremium: true,
        premiumUntil: admin.firestore.Timestamp.fromDate(premiumUntil),
        premiumUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        premiumSource: "shopier",
      },
      { merge: true }
    );

    // pending kayıtlarını temizle
    pendSnap.docs.forEach((d) => batch.delete(d.ref));

    await batch.commit();

    return NextResponse.json({
      ok: true,
      applied: pendSnap.size,
      premiumUntil: premiumUntil.toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
