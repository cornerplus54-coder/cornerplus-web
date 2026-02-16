import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  console.log("SHOPIER_OSB:", body);

  return NextResponse.json({ ok: true });
}
