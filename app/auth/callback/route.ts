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

/**
 * OAuth (Google) and magic-link return URL. Session cookies must be set on the same
 * NextResponse as the redirect — using cookies() alone can drop Set-Cookie on redirect.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = getRequestOrigin(request);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");

  if (oauthError) {
    const login = new URL(`${origin}/login`);
    login.searchParams.set("error", "oauth");
    if (oauthDesc?.trim()) {
      login.searchParams.set("hint", oauthDesc.trim().slice(0, 280));
    } else {
      login.searchParams.set("hint", oauthError);
    }
    const res = NextResponse.redirect(login);
    clearReturnPathCookie(res);
    return res;
  }

  if (!code) {
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
  const next = safeInternalPath(nextFromQuery ?? nextFromCookie, "/dashboard");

  const redirectTarget = `${origin}${next}`;
  const redirectResponse = NextResponse.redirect(redirectTarget);
  clearReturnPathCookie(redirectResponse);

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("auth callback exchangeCodeForSession:", error.message);
    const login = new URL(`${origin}/login`);
    login.searchParams.set("error", "session");
    login.searchParams.set("hint", encodeURIComponent(error.message.slice(0, 200)));
    const res = NextResponse.redirect(login);
    clearReturnPathCookie(res);
    return res;
  }

  return redirectResponse;
}
