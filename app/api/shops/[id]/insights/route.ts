import { NextResponse } from "next/server";
import { getCrowdInsightForShop } from "@/lib/services/insights";
import { getCoffeeShopById } from "@/lib/services/places";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const shop = await getCoffeeShopById(id);

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  const insight = await getCrowdInsightForShop(shop);
  return NextResponse.json({ data: insight });
}
