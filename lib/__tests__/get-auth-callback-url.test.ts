import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("buildAuthCallbackUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds /auth/callback with next when not default dashboard", async () => {
    const { buildAuthCallbackUrl } = await import("@/lib/get-auth-callback-url");
    expect(buildAuthCallbackUrl("/nearby")).toBe(
      "https://app.example.com/auth/callback?next=%2Fnearby"
    );
  });

  it("omits next query for /dashboard (Supabase redirect stays canonical)", async () => {
    const { buildAuthCallbackUrl } = await import("@/lib/get-auth-callback-url");
    expect(buildAuthCallbackUrl("/dashboard")).toBe("https://app.example.com/auth/callback");
  });

  it("includes next for /onboarding so middleware can resume flow", async () => {
    const { buildAuthCallbackUrl } = await import("@/lib/get-auth-callback-url");
    expect(buildAuthCallbackUrl("/onboarding")).toBe(
      "https://app.example.com/auth/callback?next=%2Fonboarding"
    );
  });
});

/**
 * Manual QA (requires Supabase + Google OAuth + email provider):
 * - Google: Authentication → Google enabled; Google Cloud OAuth redirect = Supabase callback URL only.
 * - Redirect URLs: include https://<your-domain>/auth/callback and http://localhost:3000/auth/callback.
 * - Magic link: signInWithOtp emailRedirectTo must match one of those origins.
 */
