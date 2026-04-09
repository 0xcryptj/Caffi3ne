/**
 * Routes that require a signed-in user who has finished onboarding.
 * Marketing/legal pages stay public; core product is gated.
 */
export const PROTECTED_APP_PREFIXES = ["/nearby", "/shops", "/dashboard"] as const;

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Valid same-origin path only; invalid or external-looking values return null. */
export function safeInternalPathOrNull(next: string | null | undefined): string | null {
  if (!next || typeof next !== "string") return null;
  const path = next.split("?")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (!/^\/[-a-zA-Z0-9/_]*$/.test(path)) return null;
  return path;
}

/** Prevent open redirects — only same-origin path, no protocol or //. */
export function safeInternalPath(next: string | null | undefined, fallback: string): string {
  return safeInternalPathOrNull(next) ?? fallback;
}
