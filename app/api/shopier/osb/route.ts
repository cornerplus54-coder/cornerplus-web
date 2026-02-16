export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";

function pickValuesFromUrlEncoded(bodyText: string) {
  const params = new URLSearchParams(bodyText);
  const vals: string[] = [];
  for (const [, v] of params) vals.push(v);
  return vals;
}

export async function POST(req: Request) {
  const OSB_USER = process.env.SHOPIER_OSB_USERNAME;
  const OSB_PASS = process.env.SHOPIER_OSB_PASSWORD;

  if (!OSB_USER || !OSB_PASS) {
    return new NextResponse("missing_env", { status: 500 });
  }

  // Shopier genelde form-data / x-www-form-urlencoded gönderir
  let values: string[] = [];
  try {
    const fd = await req.formData();
    values = [...fd.values()].map((v) => String(v));
  } catch {
    const text = await req.text();
    values = pickValuesFromUrlEncoded(text);
  }

  const payloadB64 = values[0];
  const signature = values[1];

  if (!payloadB64 || !signature) {
    return new NextResponse("missing_parameter", { status: 401 });
  }

  // İmza kontrolü (Shopier OSB standardı)
  const hash = crypto
    .createHmac("sha256", OSB_PASS)
    .update(payloadB64 + OSB_USER)
    .digest("hex");

  if (hash !== signature) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  // (İstersen buradan payload decode edip premium açacağız)
  // const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));

  // Shopier OSB'nin başarılı sayması için düz yazı: success
  return new NextResponse("success", { status: 200 });
}
