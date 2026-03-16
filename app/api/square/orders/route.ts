import { NextRequest, NextResponse } from "next/server";
import { getSquareOrderVolume } from "@/lib/services/square";

export async function GET(request: NextRequest) {
  const locationId = request.nextUrl.searchParams.get("locationId");
  if (!locationId) {
    return NextResponse.json({ error: "locationId required" }, { status: 400 });
  }

  const summary = await getSquareOrderVolume(locationId);
  return NextResponse.json(summary);
}
