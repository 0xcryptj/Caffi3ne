import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: appConfig.name,
    mockMode: appConfig.useMockData,
    timestamp: new Date().toISOString()
  });
}
