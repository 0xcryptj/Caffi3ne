import { NextResponse } from "next/server";
import { addMockSubmission } from "@/lib/data/mock-shops";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MerchantSubmissionInput } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as MerchantSubmissionInput;

  if (!payload.submittedName || !payload.submittedAddress || !payload.contactEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (supabase) {
    // TODO: Persist to merchant_submissions in Supabase when auth and project config are live.
  }

  const record = addMockSubmission(payload);

  return NextResponse.json(
    {
      data: record,
      message: "Merchant submission queued"
    },
    { status: 201 }
  );
}
