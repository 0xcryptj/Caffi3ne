import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MerchantSubmissionInput } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json()) as MerchantSubmissionInput;

  if (!payload.submittedName || !payload.submittedAddress || !payload.contactEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Submissions are unavailable: configure SUPABASE_SERVICE_ROLE_KEY on the server (never expose it to the client)."
      },
      { status: 503 }
    );
  }

  const typeTag = `[${payload.submissionType}]`;
  const notes = [typeTag, payload.existingShopId ? `shop:${payload.existingShopId}` : "", payload.notes ?? ""]
    .filter(Boolean)
    .join(" ")
    .trim();

  const { data, error } = await supabase
    .from("merchant_submissions")
    .insert({
      submitted_name: payload.submittedName,
      submitted_address: payload.submittedAddress,
      lat: payload.lat ?? null,
      lng: payload.lng ?? null,
      website: payload.website ?? null,
      contact_email: payload.contactEmail,
      notes: notes || null,
      status: "pending"
    })
    .select("id, submitted_name, submitted_address, contact_email, status, created_at")
    .single();

  if (error) {
    console.error("merchant_submissions insert:", error);
    return NextResponse.json(
      { error: "Could not save your submission. Check the database schema and service role access." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      data,
      message: "Submission received. We will follow up by email."
    },
    { status: 201 }
  );
}
