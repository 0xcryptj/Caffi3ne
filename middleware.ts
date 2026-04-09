import {
  isProtectedAppPath,
  safeInternalPath,
  safeInternalPathOrNull
} from "@/lib/auth-routes";
import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

/**
 * When REQUIRE_CLOUDFLARE_PROXY=true, JSON API routes only respond if the request
 * was proxied through Cloudflare (cf-ray header). Enable after your hostname is
 * orange-clouded; keep false for localhost and non-CF hosts (e.g. raw Vercel).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    if (process.env.REQUIRE_CLOUDFLARE_PROXY === "true") {
      if (!request.headers.get("cf-ray")) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.next();
  }

  const { user, response, onboardingCompleted } = await updateSession(request);

  const redirectWithCookies = (url: URL) =>
    NextResponse.redirect(url, { headers: response.headers });

  const protectedApp = isProtectedAppPath(pathname);

  if (!user && pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/onboarding");
    return redirectWithCookies(url);
  }

  if (!user && protectedApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const returnTo = pathname + request.nextUrl.search;
    url.searchParams.set("next", returnTo);
    return redirectWithCookies(url);
  }

  if (user && protectedApp && !onboardingCompleted) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return redirectWithCookies(url);
  }

  if (user && pathname.startsWith("/onboarding") && onboardingCompleted) {
    const url = request.nextUrl.clone();
    const target = safeInternalPath(request.nextUrl.searchParams.get("next"), "/nearby");
    url.pathname = target;
    url.search = "";
    return redirectWithCookies(url);
  }

  if (user && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    const url = request.nextUrl.clone();
    const nextFromAuth = safeInternalPathOrNull(request.nextUrl.searchParams.get("next"));
    if (onboardingCompleted) {
      url.pathname = nextFromAuth ?? "/dashboard";
      url.search = "";
    } else {
      url.pathname = "/onboarding";
      url.search = "";
      if (nextFromAuth) url.searchParams.set("next", nextFromAuth);
    }
    return redirectWithCookies(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
