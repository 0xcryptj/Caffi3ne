import { type NextRequest, NextResponse } from "next/server";

export interface IpLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  source: "vercel-ip";
}

/**
 * Returns the user's approximate location derived from their IP address.
 * Vercel injects x-vercel-ip-latitude / x-vercel-ip-longitude on every
 * edge request — these reflect the IP, so a VPN will return the VPN
 * endpoint's location rather than the user's ISP location.
 *
 * Returns 404 when headers are absent (local dev without the Vercel proxy).
 */
export async function GET(request: NextRequest) {
  const latHeader = request.headers.get("x-vercel-ip-latitude");
  const lngHeader = request.headers.get("x-vercel-ip-longitude");

  if (!latHeader || !lngHeader) {
    return NextResponse.json(
      { error: "IP geolocation unavailable (are you running locally?)" },
      { status: 404 }
    );
  }

  const lat = parseFloat(latHeader);
  const lng = parseFloat(lngHeader);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Malformed IP location headers" }, { status: 500 });
  }

  const body: IpLocation = {
    lat,
    lng,
    city: request.headers.get("x-vercel-ip-city") ?? undefined,
    country: request.headers.get("x-vercel-ip-country") ?? undefined,
    source: "vercel-ip",
  };

  return NextResponse.json(body);
}
