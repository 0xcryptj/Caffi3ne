import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

const MAX_NAV_LEN = 14;

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
