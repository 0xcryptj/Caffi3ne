#!/usr/bin/env node
/**
 * Enables Google OAuth on a hosted Supabase project via the Management API.
 * Fixes: { "error_code": "validation_failed", "msg": "Unsupported provider: provider is not enabled" }
 *
 * Loads `.env.local` then `.env` from the project root (same keys as Next.js) so you can run:
 *   npm run enable-google-auth
 *
 * Prereqs:
 * 1) Google Cloud: OAuth 2.0 Web client with redirect URI
 *    https://<project-ref>.supabase.co/auth/v1/callback
 * 2) Supabase: Account → Access tokens → token with auth config write scope.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadDotEnvFile(name) {
  const p = resolve(root, name);
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = val;
    }
  }
}

loadDotEnvFile(".env.local");
loadDotEnvFile(".env");

function projectRefFromUrl(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const m = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

const ref =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

if (!ref || !token || !clientId || !secret) {
  console.error(`
Missing environment variables. Need all of:

  SUPABASE_ACCESS_TOKEN       (Supabase dashboard → Account → Access tokens; scope: auth:write)
  GOOGLE_OAUTH_CLIENT_ID      (Google Cloud Console → OAuth 2.0 Client ID)
  GOOGLE_OAUTH_CLIENT_SECRET
  SUPABASE_PROJECT_REF        OR set NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co

Then run: node scripts/enable-supabase-google-auth.mjs
`);
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${ref}/config/auth`;

const body = {
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: secret
};

const res = await fetch(endpoint, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status} from Management API:\n${text}`);
  console.error(`
If you see 401/403: create a new access token with permissions to update Auth config.
If Google still fails in the app: confirm redirect URI in Google Cloud is exactly:
  https://${ref}.supabase.co/auth/v1/callback
`);
  process.exit(1);
}

console.log(`OK — Google provider enabled for project ref "${ref}".`);
console.log(`Response snippet: ${text.slice(0, 500)}${text.length > 500 ? "…" : ""}`);
console.log(`
Next: In Supabase → Authentication → URL configuration, add your app callback URLs, e.g.:
  http://localhost:3000/auth/callback
  https://your-production-domain/auth/callback
`);
