import { randomBytes } from "crypto";

export type KeyTier = "demo" | "pro";

export interface IssuedKey {
  key: string;
  email: string;
  name: string;
  tier: KeyTier;
  createdAt: string;
}

export function generateApiKey(tier: KeyTier = "demo"): string {
  const prefix = tier === "demo" ? "caff_demo" : "caff_pro";
  const random = randomBytes(18).toString("hex");
  return `${prefix}_${random}`;
}

export async function issueApiKey(email: string, name: string, tier: KeyTier = "demo"): Promise<IssuedKey> {
  const key = generateApiKey(tier);
  const issued: IssuedKey = { key, email, name, tier, createdAt: new Date().toISOString() };

  // Persist to Supabase when table is ready (see supabase/api-keys-schema.sql)
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey);
      await supabase.from("api_keys").insert({
        key,
        email,
        name,
        tier,
        created_at: issued.createdAt,
        request_count: 0
      });
    }
  } catch {
    // Supabase table may not exist yet — key is still returned to caller
  }

  return issued;
}
