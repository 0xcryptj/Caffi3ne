import { appConfig } from "@/lib/config";

/**
 * Canonical site origin for auth redirects. In the browser we always use the
 * current origin so local dev and Cloudflare previews work. For any server-only
 * usage, set NEXT_PUBLIC_APP_URL to your deployed URL (e.g. https://caffi3ne.pages.dev).
 */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return appConfig.appUrl.replace(/\/$/, "");
}

export type AuthCallbackOptions = {
  /**
   * Google popup OAuth uses `?popup=1` so the callback returns a small page that closes the window
   * instead of loading the app inside the popup. Add to Supabase Redirect URLs, e.g.
   * `https://caffi3ne.cc/auth/callback**` or the exact URL with `?popup=1`.
   */
  popup?: boolean;
};

/**
 * OAuth / magic-link / email-confirm redirect URL.
 * Add allowed URLs in Supabase → Authentication → URL configuration → Redirect URLs
 * (e.g. `https://your-domain/auth/callback**` and `http://localhost:3000/auth/callback**`).
 *
 * Intended destination after login is stored in the `caffi3ne_auth_next` cookie (see `auth-return-path.ts`).
 */
export function buildAuthCallbackUrl(opts?: AuthCallbackOptions): string {
  const origin = getAuthRedirectOrigin();
  const base = `${origin}/auth/callback`;
  if (opts?.popup) return `${base}?popup=1`;
  return base;
}
