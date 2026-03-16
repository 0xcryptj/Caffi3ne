import { NextResponse } from "next/server";
import { getSquareLocations } from "@/lib/services/square";

export async function GET() {
  const locations = await getSquareLocations();
  return NextResponse.json({ locations });
}
