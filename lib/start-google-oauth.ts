import type { SupabaseClient } from "@supabase/supabase-js";
import { setAuthReturnPathClient } from "@/lib/auth-return-path";
import { fetchGoogleOAuthEnabled } from "@/lib/auth-provider-settings";
import { formatAuthError } from "@/lib/format-auth-error";
import { buildAuthCallbackUrl } from "@/lib/get-auth-callback-url";

const POPUP_POLL_MS = 400;
const POPUP_TIMEOUT_MS = 180_000;

export type GoogleOAuthOutcome = "success" | "cancelled" | { error: string };

/** Prevents double pop-ups (e.g. React Strict Mode) and overlapping OAuth flows. */
let oauthFlowInProgress = false;

/**
 * Google OAuth in a centered popup so the main tab stays on your site.
 * If the pop-up is blocked, we do not navigate the main tab (avoids two windows/tabs).
 */
export async function startGoogleOAuth(
  supabase: SupabaseClient,
  nextPath: string,
  nextFallback: string = "/dashboard"
): Promise<GoogleOAuthOutcome> {
  if (oauthFlowInProgress) {
    return "cancelled";
  }
  oauthFlowInProgress = true;

  try {
    const enabled = await fetchGoogleOAuthEnabled();
    if (!enabled) {
      return {
        error: formatAuthError({
          message: JSON.stringify({
            error_code: "validation_failed",
            msg: "Unsupported provider: provider is not enabled"
          })
        })
      };
    }

    if (typeof window === "undefined") {
      return { error: "Google sign-in must run in the browser." };
    }

    setAuthReturnPathClient(nextPath, nextFallback);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildAuthCallbackUrl({ popup: true }),
        scopes: "openid email profile",
        queryParams: {
          access_type: "offline",
          prompt: "select_account"
        },
        skipBrowserRedirect: true
      }
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    if (!data?.url) {
      return { error: "Could not start Google sign-in. Try again or use email." };
    }

    const w = 520;
    const h = 720;
    const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(
      data.url,
      "caffi3ne-google-oauth",
      `popup=yes,width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      return {
        error:
          "Pop-up was blocked. Allow pop-ups for this site and try again — the main window will stay here."
      };
    }

    const origin = window.location.origin;

    return await new Promise<GoogleOAuthOutcome>((resolve) => {
      let finished = false;
      let closedTicks = 0;

      const finish = (outcome: GoogleOAuthOutcome) => {
        if (finished) return;
        finished = true;
        window.clearInterval(poll);
        window.clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        if (outcome === "success" || typeof outcome === "object") {
          try {
            if (!popup.closed) popup.close();
          } catch {
            /* ignore */
          }
        }
        resolve(outcome);
      };

      const onMessage = (ev: MessageEvent) => {
        if (ev.origin !== origin) return;
        const d = ev.data as {
          source?: string;
          type?: string;
          ok?: boolean;
          error?: string;
        };
        if (!d || d.source !== "caffi3ne-auth" || d.type !== "oauth-complete") return;
        if (!d.ok) {
          finish({
            error: typeof d.error === "string" && d.error.trim() ? d.error : "Google sign-in failed"
          });
          return;
        }
        void supabase.auth.getSession().then(({ data: { session } }) => {
          finish(session ? "success" : { error: "Session was not created. Try again." });
        });
      };
      window.addEventListener("message", onMessage);

      const poll = window.setInterval(() => {
        void (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            finish("success");
            return;
          }
          if (popup.closed) {
            closedTicks += 1;
            if (closedTicks >= 5) {
              finish("cancelled");
            }
          } else {
            closedTicks = 0;
          }
        })();
      }, POPUP_POLL_MS);

      const timer = window.setTimeout(() => {
        try {
          if (!popup.closed) popup.close();
        } catch {
          /* ignore */
        }
        finish({ error: "Sign-in timed out. Try again." });
      }, POPUP_TIMEOUT_MS);
    });
  } finally {
    oauthFlowInProgress = false;
  }
}
