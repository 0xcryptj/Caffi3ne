import { NextRequest, NextResponse } from "next/server";
import { issueApiKey } from "@/lib/services/api-keys";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; name?: string; tier?: string };

    if (!body.email || !body.name) {
      return NextResponse.json({ error: "email and name are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const tier = body.tier === "pro" ? "pro" : "demo";
    const issued = await issueApiKey(body.email, body.name, tier);

    return NextResponse.json({
      key: issued.key,
      email: issued.email,
      name: issued.name,
      tier: issued.tier,
      createdAt: issued.createdAt,
      note: "Store this key — it will only be shown once."
    });
  } catch {
    return NextResponse.json({ error: "Failed to issue key" }, { status: 500 });
  }
}
