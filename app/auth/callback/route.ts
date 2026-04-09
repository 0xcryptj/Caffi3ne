import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeInternalPath } from "@/lib/auth-routes";
import { getRequestOrigin } from "@/lib/get-request-origin";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/utils/supabase/env";

export const dynamic = "force-dynamic";

/**
 * OAuth (Google) and magic-link return URL. Session cookies must be set on the same
 * NextResponse as the redirect — using cookies() alone can drop Set-Cookie on redirect.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next");
  const next = safeInternalPath(nextRaw, "/dashboard");
  const origin = getRequestOrigin(request);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  const redirectTarget = `${origin}${next}`;
  const redirectResponse = NextResponse.redirect(redirectTarget);

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
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  return redirectResponse;
}
