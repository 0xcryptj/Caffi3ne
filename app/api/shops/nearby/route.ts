import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { getCrowdInsightForShop } from "@/lib/services/insights";
import { getNearbyCoffeeShops } from "@/lib/services/places";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get("lat") ?? "40.73061");
  const lng = Number(searchParams.get("lng") ?? "-73.935242");
  const radius = Number(searchParams.get("radius") ?? "2500");

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
