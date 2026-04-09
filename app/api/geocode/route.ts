import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";
  const placeId = searchParams.get("placeId")?.trim() ?? "";
  const language = searchParams.get("lang")?.trim();

  if (!placeId && !address.trim()) {
    return NextResponse.json({ error: "address or placeId is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Geocoding not configured" }, { status: 503 });
  }

  try {
    let url: string;
    if (placeId) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${encodeURIComponent(apiKey)}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${encodeURIComponent(apiKey)}`;
    }
    if (language) url += `&language=${encodeURIComponent(language)}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as {
      status: string;
      results: Array<{
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    if (data.status !== "OK" || !data.results[0]) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const { lat, lng } = data.results[0].geometry.location;
    return NextResponse.json({
      lat,
      lng,
      formattedAddress: data.results[0].formatted_address,
    });
  } catch {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
