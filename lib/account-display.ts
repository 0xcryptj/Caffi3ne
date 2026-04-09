import type { User } from "@supabase/supabase-js";

/** Compact navbar label: first name, or truncated email local-part, or "Account". */
export function accountShortLabel(user: User): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (full) {
    const first = full.split(/\s+/)[0] ?? "";
    if (!first) return "Account";
    return first.length > 12 ? `${first.slice(0, 11)}…` : first;
  }
  const email = user.email ?? "";
  const local = email.split("@")[0] ?? "";
  if (!local) return "Account";
  return local.length > 10 ? `${local.slice(0, 9)}…` : local;
}

/** Wider screens: prefer email (truncated in UI), else name. */
export function accountPrimaryLabel(user: User): string {
  return user.email ?? accountShortLabel(user);
}
