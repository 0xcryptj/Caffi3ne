import { NextResponse } from "next/server";
import { getCoffeeShopById } from "@/lib/services/places";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const shop = await getCoffeeShopById(id);

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json({ data: shop });
}
