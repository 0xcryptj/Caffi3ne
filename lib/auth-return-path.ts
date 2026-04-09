import { safeInternalPath } from "@/lib/auth-routes";

/** Readable by `/auth/callback` route; stores post-login path so `redirectTo` stays a single allowlisted URL. */
export const AUTH_RETURN_PATH_COOKIE = "caffi3ne_auth_next";

const MAX_AGE_SEC = 60 * 15;

/**
 * Call from the browser immediately before OAuth, magic link, or signup-with-confirm so the callback
 * can redirect without putting `?next=` on the URL (stricter Supabase redirect allowlists).
 */
export function setAuthReturnPathClient(nextRaw: string | undefined, fallback: string): void {
  if (typeof document === "undefined") return;
  const path = safeInternalPath(nextRaw ?? "", fallback);
  const value = encodeURIComponent(path);
  const secure = window.location.protocol === "https:";
  let cookie = `${AUTH_RETURN_PATH_COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax`;
  if (secure) cookie += "; Secure";
  document.cookie = cookie;
}
