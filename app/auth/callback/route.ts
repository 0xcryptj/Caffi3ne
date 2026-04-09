import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { AUTH_RETURN_PATH_COOKIE } from "@/lib/auth-return-path";
import { safeInternalPath } from "@/lib/auth-routes";
import { getRequestOrigin } from "@/lib/get-request-origin";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/utils/supabase/env";

export const dynamic = "force-dynamic";

function clearReturnPathCookie(res: NextResponse) {
  res.cookies.set(AUTH_RETURN_PATH_COOKIE, "", { path: "/", maxAge: 0, sameSite: "lax" });
}

function popupNotifyHtml(origin: string, payload: { ok: true } | { ok: false; error: string }) {
  const message = { source: "caffi3ne-auth", type: "oauth-complete", ...payload };
  const scriptPayload = JSON.stringify(message);
  const scriptOrigin = JSON.stringify(origin);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Caffi3ne — Signed in</title>
</head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#faf7f2;color:#26190e;text-align:center;padding:2rem 1.25rem">
  <p style="font-size:1rem;font-weight:600;margin:0 0 0.5rem">${payload.ok ? "You're signed in" : "Couldn't sign in"}</p>
  <p style="font-size:0.875rem;opacity:0.75;margin:0">${payload.ok ? "This window will close automatically." : "You can close this window and try again."}</p>
  <script>
    (function () {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(${scriptPayload}, ${scriptOrigin});
        }
      } catch (e) {}
      setTimeout(function () { window.close(); }, ${payload.ok ? 400 : 1200});
    })();
  </script>
</body>
</html>`;
}

function popupResponse(origin: string, payload: { ok: true } | { ok: false; error: string }) {
  const res = new NextResponse(popupNotifyHtml(origin, payload), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
  clearReturnPathCookie(res);
  return res;
}

/**
 * OAuth (Google) and magic-link return URL. Session cookies must be set on the same
 * NextResponse as the redirect — using cookies() alone can drop Set-Cookie on redirect.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = getRequestOrigin(request);
  const isPopup = url.searchParams.get("popup") === "1";
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");

  if (oauthError) {
    const hintText = (oauthDesc?.trim() || oauthError).slice(0, 400);
    if (isPopup) {
      return popupResponse(origin, { ok: false, error: hintText });
    }
    const login = new URL(`${origin}/login`);
    login.searchParams.set("error", "oauth");
    login.searchParams.set("hint", encodeURIComponent(hintText.slice(0, 280)));
    const res = NextResponse.redirect(login);
    clearReturnPathCookie(res);
    return res;
  }

  if (!code) {
    if (isPopup) {
      return popupResponse(origin, { ok: false, error: "Missing sign-in code. Check redirect URLs in Supabase." });
    }
    const res = NextResponse.redirect(`${origin}/login?error=callback`);
    clearReturnPathCookie(res);
    return res;
  }

  const nextFromQuery = url.searchParams.get("next");
  const cookieRaw = request.cookies.get(AUTH_RETURN_PATH_COOKIE)?.value;
  let nextFromCookie: string | null = null;
  if (cookieRaw) {
    try {
      nextFromCookie = decodeURIComponent(cookieRaw);
    } catch {
      nextFromCookie = null;
    }
  }
  const next = safeInternalPath(nextFromQuery ?? nextFromCookie, "/");

  const redirectTarget = `${origin}${next}`;
  const successResponse = isPopup
    ? new NextResponse(popupNotifyHtml(origin, { ok: true }), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
      })
    : NextResponse.redirect(redirectTarget);
  clearReturnPathCookie(successResponse);

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          successResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("auth callback exchangeCodeForSession:", error.message);
    if (isPopup) {
      return popupResponse(origin, { ok: false, error: error.message.slice(0, 400) });
    }
    const login = new URL(`${origin}/login`);
    login.searchParams.set("error", "session");
    login.searchParams.set("hint", encodeURIComponent(error.message.slice(0, 200)));
    const res = NextResponse.redirect(login);
    clearReturnPathCookie(res);
    return res;
  }

  return successResponse;
}
