#!/usr/bin/env node
/**
 * On Vercel **production**, require a public NEXT_PUBLIC_APP_URL so Supabase
 * signup confirmation / magic links use your real domain (not localhost).
 * Skips locally, on preview, and on non-Vercel hosts (e.g. Cloudflare CI).
 */

if (process.env.VERCEL !== "1") {
  process.exit(0);
}
if (process.env.VERCEL_ENV !== "production") {
  process.exit(0);
}

const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
if (!raw) {
  console.error(
    "\n[check-production-auth-env] Vercel Production: set NEXT_PUBLIC_APP_URL to your live site URL " +
      "(e.g. https://caffi3ne.cc). Signup confirmation emails use this for redirect_to.\n"
  );
  process.exit(1);
}

const lower = raw.toLowerCase();
if (lower.includes("localhost") || lower.includes("127.0.0.1")) {
  console.error(
    "\n[check-production-auth-env] NEXT_PUBLIC_APP_URL must not be localhost on Vercel Production.\n"
  );
  process.exit(1);
}

if (!lower.startsWith("https://")) {
  console.warn(
    "\n[check-production-auth-env] Warning: NEXT_PUBLIC_APP_URL should normally use https:// in production.\n"
  );
}

process.exit(0);
