import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("buildAuthCallbackUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns canonical /auth/callback on origin (no query — return path uses cookie)", async () => {
    const { buildAuthCallbackUrl } = await import("@/lib/get-auth-callback-url");
    expect(buildAuthCallbackUrl()).toBe("https://app.example.com/auth/callback");
  });
});

/**
 * Manual QA (requires Supabase + Google OAuth + email provider):
 * - Google: Authentication → Google enabled; Google Cloud OAuth redirect = Supabase callback URL only.
 * - Redirect URLs: include https://<your-domain>/auth/callback and http://localhost:3000/auth/callback.
 * - Magic link / email confirm: same callback URL; app stores post-login path in `caffi3ne_auth_next` cookie.
 */
