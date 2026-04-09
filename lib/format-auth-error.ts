import type { AuthError } from "@supabase/supabase-js";

const GOOGLE_NOT_ENABLED_HINT =
  "Google sign-in is turned off in your Supabase project. Open the Supabase Dashboard → Authentication → Providers → Google, enable it, and add the OAuth Client ID and Client Secret from Google Cloud Console. In Google Cloud, under your OAuth 2.0 client, set Authorized redirect URI to: https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback (use your real project ref from Supabase → Settings → API). Until then, use email and password or a magic link.";

/**
 * Supabase sometimes returns JSON in `message` or nested `msg` / `error_code`.
 */
export function formatAuthError(err: AuthError | { message?: string } | null | undefined): string {
  if (!err?.message?.trim()) {
    return "Something went wrong. Please try again.";
  }

  let text = err.message.trim();
  let errorCode: string | undefined;
  let innerMsg: string | undefined;

  try {
    const parsed = JSON.parse(text) as {
      msg?: string;
      error_code?: string;
      code?: string;
    };
    if (typeof parsed.msg === "string") innerMsg = parsed.msg;
    errorCode = parsed.error_code ?? parsed.code;
    if (innerMsg) text = innerMsg;
  } catch {
    /* message is plain text */
  }

  const lower = `${text} ${errorCode ?? ""}`.toLowerCase();
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider") ||
    (errorCode === "validation_failed" && lower.includes("provider"))
  ) {
    return GOOGLE_NOT_ENABLED_HINT;
  }

  return text;
}
