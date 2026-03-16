import { NextRequest, NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/services/weather";

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const weather = await getCurrentWeather(lat, lng);
  return NextResponse.json(weather);
}
