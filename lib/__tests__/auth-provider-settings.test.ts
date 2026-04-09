import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchGoogleOAuthEnabled", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testproj.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              external: { google: true, email: true }
            })
        } as Response)
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
    }
  });

  it("returns true when external.google is true", async () => {
    const { fetchGoogleOAuthEnabled } = await import("@/lib/auth-provider-settings");
    await expect(fetchGoogleOAuthEnabled()).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://testproj.supabase.co/auth/v1/settings",
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: "sb_publishable_test"
        }) as Record<string, string>,
        cache: "no-store"
      })
    );
  });

  it("returns false when external.google is false", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ external: { google: false } })
    } as Response);
    const { fetchGoogleOAuthEnabled } = await import("@/lib/auth-provider-settings");
    await expect(fetchGoogleOAuthEnabled()).resolves.toBe(false);
  });

  it("returns false when env is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { fetchGoogleOAuthEnabled } = await import("@/lib/auth-provider-settings");
    await expect(fetchGoogleOAuthEnabled()).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
