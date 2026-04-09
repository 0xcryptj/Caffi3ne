import { NextResponse } from "next/server";
import { getMockShopsWithInsights } from "@/lib/data/mock-shops";
import type { ApiExampleResponse } from "@/lib/types";

export async function GET() {
  const response: ApiExampleResponse = {
    data: getMockShopsWithInsights(),
    meta: {
      generatedAt: new Date().toISOString(),
      isDemoSample: true
    }
  };

  return NextResponse.json(response);
}
