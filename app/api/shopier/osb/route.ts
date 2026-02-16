export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

function getAdmin() {
  if (admin.apps.length) return admin;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin envs");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return admin;
}

function getParamsFromBodyText(bodyText: string) {
  const p = new URLSearchParams(bodyText);
  const entries = [...p.entries()];
  const map = Object.fromEntries(entries);
  const values = entries.map(([, v]) => v);
  return { map, values };
}

function extractEmailDeep(obj: any): string | null {
  // 1) string içinde email ara
  const asText = JSON.stringify(obj ?? {});
  const m = asText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0]?.toLowerCase() ?? null;
}

export async function POST(req: Request) {
  const OSB_USER = process.env.SHOPIER_OSB_USERNAME;
  const OSB_PASS = process.env.SHOPIER_OSB_PASSWORD;

  if (!OSB_USER || !OSB_PASS) {
    return new NextResponse("missing_osb_env", { status: 500 });
  }

  // Shopier form-data / urlencoded gönderebilir
  let payloadB64 = "";
  let signature = "";

  try {
    const fd = await req.formData();
    const all = [...fd.entries()];

    const map = Object.fromEntries(all.map(([k, v]) => [k, String(v)]));
    const values = all.map(([, v]) => String(v));

    payloadB64 =
      map.data || map.payload || map.shopier_data || values[0] || "";
    signature =
      map.signature || map.hash || map.shopier_signature || values[1] || "";
  } catch {
    const text = await req.text();
    const { map, values } = getParamsFromBodyText(text);
    payloadB64 = map.data || map.payload || values[0] || "";
    signature = map.signature || map.hash || values[1] || "";
  }

  if (!payloadB64 || !signature) {
    return new NextResponse("missing_parameter", { status: 401 });
  }

  // OSB imza doğrulama
  const hash = crypto
    .createHmac("sha256", OSB_PASS)
    .update(payloadB64 + OSB_USER)
    .digest("hex");

  if (hash !== signature) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  // Payload decode
  let payload: any = null;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
  } catch {
    // bazen json olmayabilir, yine de email arayalım
    payload = Buffer.from(payloadB64, "base64").toString("utf8");
  }

  const email = extractEmailDeep(payload);
  if (!email) {
    return new NextResponse("no_email_found", { status: 400 });
  }

  // Premium: 30 gün
  const now = Date.now();
  const premiumUntil = new Date(now + 30 * 24 * 60 * 60 * 1000);

  try {
    const a = getAdmin();
    const db = a.firestore();

    // users koleksiyonunda email eşle
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) {
      // kullanıcı daha giriş yapmadıysa kaybetmeyelim → pending yaz
      await db.collection("premium_pending").add({
        email,
        payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Shopier tekrar tekrar denemesin diye success dönüyoruz
      return new NextResponse("success", { status: 200 });
    }

    const docRef = snap.docs[0].ref;

    await docRef.set(
      {
        isPremium: true,
        premiumUntil: admin.firestore.Timestamp.fromDate(premiumUntil),
        premiumUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        premiumSource: "shopier",
      },
      { merge: true }
    );

    // Shopier'in beklediği cevap
    return new NextResponse("success", { status: 200 });
  } catch (e) {
    // Hata olursa 500 → (Shopier retry ederse tekrar deneyebilir)
    return new NextResponse("server_error", { status: 500 });
  }
}
