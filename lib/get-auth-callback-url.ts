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

/**
 * OAuth / magic-link / email-confirm redirect URL only — no query string.
 * Add this exact URL in Supabase → Authentication → URL configuration → Redirect URLs
 * (plus `http://localhost:3000/auth/callback` for local dev).
 *
 * Intended destination after login is stored in the `caffi3ne_auth_next` cookie (see `auth-return-path.ts`).
 */
export function buildAuthCallbackUrl(): string {
  const origin = getAuthRedirectOrigin();
  return `${origin}/auth/callback`;
}
