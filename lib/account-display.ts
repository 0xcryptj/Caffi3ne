import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

const MAX_NAV_LEN = 14;

/** Google / Apple / OIDC often use `picture`; Supabase may also set `avatar_url`. */
export function oauthAvatarUrlFromUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  let raw =
    (typeof meta.avatar_url === "string" && meta.avatar_url.trim()) ||
    (typeof meta.picture === "string" && meta.picture.trim()) ||
    "";
  if (!raw && Array.isArray(user.identities)) {
    for (const id of user.identities) {
      const data = id.identity_data as Record<string, unknown> | undefined;
      if (!data) continue;
      const pic =
        (typeof data.avatar_url === "string" && data.avatar_url.trim()) ||
        (typeof data.picture === "string" && data.picture.trim()) ||
        "";
      if (pic) {
        raw = pic;
        break;
      }
    }
  }
  if (!raw.startsWith("https://")) return null;
  return raw;
}

/** Avatar for UI: stored profile first, then OAuth metadata. */
export function accountAvatarUrl(profile: Profile | null, user: User): string | null {
  const fromDb = profile?.avatar_url?.trim();
  if (fromDb?.startsWith("https://")) return fromDb;
  return oauthAvatarUrlFromUser(user);
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * First / given name from OAuth metadata only (never uses email).
 */
function givenNameFromMetadata(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (!full) return null;
  const first = full.split(/\s+/)[0] ?? "";
  return first || null;
}

/**
 * Navbar + account chip: never show full email.
 * Priority: profile display_name → profile username → OAuth given name → email local-part → "Account"
 */
export function navbarAccountLabel(profile: Profile | null, user: User): string {
  if (profile?.display_name?.trim()) {
    return truncate(profile.display_name.trim(), MAX_NAV_LEN);
  }
  if (profile?.username?.trim()) {
    return truncate(profile.username.trim(), MAX_NAV_LEN);
  }
  const given = givenNameFromMetadata(user);
  if (given) {
    return truncate(given, MAX_NAV_LEN);
  }
  const email = user.email ?? "";
  const local = email.split("@")[0] ?? "";
  if (local) {
    return truncate(local, 10);
  }
  return "Account";
}

/** Initial letter for avatar fallback. */
export function navbarAccountInitial(profile: Profile | null, user: User): string {
  const label = navbarAccountLabel(profile, user);
  return label.slice(0, 1).toUpperCase() || "?";
}

/** Shown only inside account menu / settings — full email when available. */
export function accountEmailForMenu(user: User): string | null {
  return user.email ?? null;
}
