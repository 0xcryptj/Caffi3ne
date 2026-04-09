import { appConfig } from "@/lib/config";

function trimOrigin(url: string | undefined | null): string | null {
  const t = url?.trim().replace(/\/$/, "");
  return t && t.length > 0 ? t : null;
}

function looksLikeLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  } catch {
    return origin.includes("localhost") || origin.includes("127.0.0.1");
  }
}

/**
 * Canonical origin for OAuth, magic links, and signup confirmation emails.
 *
 * - **Production:** Prefer `NEXT_PUBLIC_APP_URL` so confirmation links always use your real domain
 *   (e.g. https://caffi3ne.cc), not localhost — set this on Vercel to your public URL.
 * - **Local dev:** Uses the current tab origin so `.env.local` can still point at localhost.
 * - **Misconfigured env:** If env is localhost but the user is on a public host, the tab wins so
 *   emails are not forced to localhost.
 */
export function getAuthRedirectOrigin(): string {
  const envCanonical = trimOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const envIsLocal = envCanonical ? looksLikeLocalOrigin(envCanonical) : false;

  if (typeof window !== "undefined") {
    const win = window.location.origin;
    const winIsLocal = looksLikeLocalOrigin(win);

    if (winIsLocal || envIsLocal) {
      return win;
    }

    if (envCanonical) {
      return envCanonical;
    }

    return win;
  }

  return envCanonical ?? appConfig.appUrl.replace(/\/$/, "");
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
