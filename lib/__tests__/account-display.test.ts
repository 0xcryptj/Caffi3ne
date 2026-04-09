import { describe, expect, it } from "vitest";
import { accountAvatarUrl, oauthAvatarUrlFromUser } from "@/lib/account-display";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

function userWithMeta(meta: Record<string, string>): User {
  return { user_metadata: meta } as User;
}

describe("oauthAvatarUrlFromUser", () => {
  it("reads Google-style picture from user_metadata", () => {
    const u = userWithMeta({
      picture: "https://lh3.googleusercontent.com/a/abc"
    });
    expect(oauthAvatarUrlFromUser(u)).toBe("https://lh3.googleusercontent.com/a/abc");
  });

  it("prefers avatar_url when both exist", () => {
    const u = userWithMeta({
      avatar_url: "https://lh3.googleusercontent.com/a/first",
      picture: "https://lh3.googleusercontent.com/a/second"
    });
    expect(oauthAvatarUrlFromUser(u)).toBe("https://lh3.googleusercontent.com/a/first");
  });

  it("rejects non-https", () => {
    expect(oauthAvatarUrlFromUser(userWithMeta({ picture: "http://insecure/x" }))).toBeNull();
  });
});

describe("accountAvatarUrl", () => {
  it("uses profile.avatar_url when set", () => {
    const profile = { avatar_url: "https://lh3.googleusercontent.com/a/db" } as Profile;
    const user = userWithMeta({ picture: "https://lh3.googleusercontent.com/a/meta" });
    expect(accountAvatarUrl(profile, user)).toBe("https://lh3.googleusercontent.com/a/db");
  });

  it("falls back to metadata when profile has no avatar", () => {
    const profile = { avatar_url: null } as unknown as Profile;
    const user = userWithMeta({ picture: "https://lh3.googleusercontent.com/a/x" });
    expect(accountAvatarUrl(profile, user)).toBe("https://lh3.googleusercontent.com/a/x");
  });
});
