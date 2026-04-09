import { describe, expect, it } from "vitest";
import { formatAuthError } from "@/lib/format-auth-error";

describe("formatAuthError", () => {
  it("maps validation_failed provider-not-enabled JSON to setup hint", () => {
    const raw = JSON.stringify({
      code: 400,
      error_code: "validation_failed",
      msg: "Unsupported provider: provider is not enabled"
    });
    const out = formatAuthError({ message: raw });
    expect(out).toContain("Supabase Dashboard");
    expect(out).toContain("Authentication");
    expect(out).toContain("Google");
    expect(out).toContain("supabase.co/auth/v1/callback");
  });

  it("maps plain-text unsupported provider message", () => {
    expect(
      formatAuthError({ message: "Unsupported provider: provider is not enabled" })
    ).toContain("Supabase Dashboard");
  });
});
