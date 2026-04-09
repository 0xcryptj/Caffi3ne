import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getRequestOrigin } from "@/lib/get-request-origin";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/utils/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Password-reset email links land here with ?code= (PKCE). Exchanges the code for a
 * recovery session and sets cookies on the redirect response — same pattern as /auth/callback.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = getRequestOrigin(request);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error");
  const oauthDesc = url.searchParams.get("error_description");

  const toLogin = (errorKey: string, hint?: string) => {
    const login = new URL(`${origin}/login`);
    login.searchParams.set("error", errorKey);
    if (hint) login.searchParams.set("hint", encodeURIComponent(hint.slice(0, 280)));
    return NextResponse.redirect(login);
  };

  if (oauthError) {
    const hintText = (oauthDesc?.trim() || oauthError).slice(0, 400);
    return toLogin("recovery", hintText);
  }

  if (!code) {
    return toLogin("recovery", "Missing reset code. Request a new reset link.");
  }

  const redirectTarget = `${origin}/auth/update-password`;
  const successResponse = NextResponse.redirect(redirectTarget);

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
    console.error("confirm-recovery exchangeCodeForSession:", error.message);
    return toLogin("recovery", error.message.slice(0, 200));
  }

  return successResponse;
}
