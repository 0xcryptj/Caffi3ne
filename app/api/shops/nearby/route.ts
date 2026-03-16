import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { getCrowdInsightForShop } from "@/lib/services/insights";
import { getNearbyCoffeeShops } from "@/lib/services/places";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required" },
      { status: 400 }
    );
  }

  const lat = Number(latStr);
  const lng = Number(lngStr);
  const radius = Number(radiusStr ?? "1000");

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: "Invalid coordinates" },
      { status: 400 }
    );
  }

  if (isNaN(radius) || radius <= 0 || radius > 50000) {
    return NextResponse.json(
      { error: "radius must be between 1 and 50000 metres" },
      { status: 400 }
    );
  }

  const shops = await getNearbyCoffeeShops({ lat, lng, radius });
  const data = await Promise.all(
    shops.map(async (shop) => ({
      ...shop,
      insight: await getCrowdInsightForShop(shop)
    }))
  );

  return NextResponse.json({
    data,
    meta: {
      lat,
      lng,
      radius,
      mockMode: appConfig.useMockData
    }
  });
}
