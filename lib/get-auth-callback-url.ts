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

/** Full callback URL for OAuth and magic links (must be listed in Supabase redirect URLs). */
export function buildAuthCallbackUrl(nextPath: string): string {
  const origin = getAuthRedirectOrigin();
  const params = new URLSearchParams();
  if (nextPath && nextPath !== "/dashboard") {
    params.set("next", nextPath);
  }
  const q = params.toString();
  return `${origin}/auth/callback${q ? `?${q}` : ""}`;
}
