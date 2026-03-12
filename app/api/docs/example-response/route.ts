import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { getMockShopsWithInsights } from "@/lib/data/mock-shops";
import type { ApiExampleResponse } from "@/lib/types";

export async function GET() {
  const response: ApiExampleResponse = {
    data: getMockShopsWithInsights(),
    meta: {
      generatedAt: new Date().toISOString(),
      mockMode: appConfig.useMockData
    }
  };

  return NextResponse.json(response);
}
