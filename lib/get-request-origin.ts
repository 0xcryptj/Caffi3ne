import type { NextRequest } from "next/server";

/**
 * Public site origin for redirects (OAuth / magic link callback).
 * Uses proxy headers on Vercel, Cloudflare, etc., so the URL matches what the browser used.
 */
export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = forwardedProto?.split(",")[0]?.trim() ?? "https";
    if (host) {
      return `${proto}://${host}`;
    }
  }
  return request.nextUrl.origin;
}
