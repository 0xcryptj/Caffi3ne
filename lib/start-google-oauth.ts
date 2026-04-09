import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";

/**
 * Starts Google OAuth via Supabase. Assigns window.location on success.
 * @returns null on success (navigation), or an error message string.
 */
export async function startGoogleOAuth(
  supabase: SupabaseClient,
  nextPath: string
): Promise<string | null> {
  const enabled = await fetchGoogleOAuthEnabled();
  if (!enabled) {
    return formatAuthError({
      message: JSON.stringify({
        error_code: "validation_failed",
        msg: "Unsupported provider: provider is not enabled"
      })
    });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackUrl(nextPath),
      scopes: "openid email profile",
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });

  if (error) {
    return formatAuthError(error);
  }

  if (data?.url) {
    window.location.assign(data.url);
    return null;
  }

  return "Could not start Google sign-in. Try again or use email.";
}
