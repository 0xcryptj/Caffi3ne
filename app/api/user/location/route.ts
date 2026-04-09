import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type Body = {
  latitude?: unknown;
  longitude?: unknown;
  source?: unknown;
  metadata?: unknown;
  client_recorded_at?: unknown;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Log a location for the signed-in user (e.g. ZIP/city search center).
 * Returns 204 with no body when anonymous — caller does not need to handle errors.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lat = typeof body.latitude === "number" ? body.latitude : Number(body.latitude);
  const lng = typeof body.longitude === "number" ? body.longitude : Number(body.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source : "general";
  if (source !== "general") {
    return NextResponse.json({ error: "Unsupported source" }, { status: 400 });
  }

  const metadata = isRecord(body.metadata) ? body.metadata : {};

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await supabase.from("user_locations").insert({
    user_id: user.id,
    latitude: lat,
    longitude: lng,
    source: "general",
    metadata
  });

  if (error) {
    console.error("user_locations insert:", error.message);
    return NextResponse.json({ error: "Could not save location" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
