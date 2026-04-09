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

  it("adds popup=1 for windowed Google OAuth", async () => {
    const { buildAuthCallbackUrl } = await import("@/lib/get-auth-callback-url");
    expect(buildAuthCallbackUrl({ popup: true })).toBe("https://app.example.com/auth/callback?popup=1");
  });
});

describe("getAuthRedirectOrigin (browser)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("prefers NEXT_PUBLIC_APP_URL when the tab is on a public host", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://caffi3ne.cc");
    vi.stubGlobal("window", { location: { origin: "https://www.caffi3ne.cc" } });
    const { getAuthRedirectOrigin } = await import("@/lib/get-auth-callback-url");
    expect(getAuthRedirectOrigin()).toBe("https://caffi3ne.cc");
  });

  it("uses the tab origin on localhost even if env is production", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://caffi3ne.cc");
    vi.stubGlobal("window", { location: { origin: "http://localhost:3000" } });
    const { getAuthRedirectOrigin } = await import("@/lib/get-auth-callback-url");
    expect(getAuthRedirectOrigin()).toBe("http://localhost:3000");
  });

  it("uses the tab origin when env mistakenly stays localhost but the site is public", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubGlobal("window", { location: { origin: "https://caffi3ne.cc" } });
    const { getAuthRedirectOrigin } = await import("@/lib/get-auth-callback-url");
    expect(getAuthRedirectOrigin()).toBe("https://caffi3ne.cc");
  });
});

/**
 * Manual QA (requires Supabase + Google OAuth + email provider):
 * - Google: Authentication → Google enabled; Google Cloud OAuth redirect = Supabase callback URL only.
 * - Redirect URLs: include `https://<your-domain>/auth/callback**` (or `?popup=1` for popup OAuth) and localhost.
 * - Magic link / email confirm: same callback URL; app stores post-login path in `caffi3ne_auth_next` cookie.
 */
