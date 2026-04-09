import type { Metadata, Viewport } from "next";
import type { Session } from "@supabase/supabase-js";
import Script from "next/script";
import { cookies } from "next/headers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import { googleAdSenseLoaderSrcExact } from "@/lib/adsense-config";
import { appConfig } from "@/lib/config";
import type { Profile } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} | Coffee Intelligence`,
    template: `%s | ${appConfig.name}`
  },
  description: appConfig.description,
  other: {
    "google-adsense-account": "ca-pub-7335312097731274"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let initialSession: Session | null = null;
  let initialProfile: Profile | null = null;
  try {
    initialSession = await readInitialSession();
    initialProfile = await readInitialProfile(initialSession);
  } catch {
    initialSession = null;
    initialProfile = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-body text-espresso-900 antialiased"
        suppressHydrationWarning
      >
        <Providers initialSession={initialSession} initialProfile={initialProfile}>
          <SiteHeader />
          <main className="min-w-0 max-w-full overflow-x-hidden">{children}</main>
          <SiteFooter />
        </Providers>
        <Analytics />
        <SpeedInsights />
        <Script
          async
          src={googleAdSenseLoaderSrcExact}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

async function readInitialSession() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

async function readInitialProfile(session: Session | null): Promise<Profile | null> {
  if (!session?.user) return null;
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    if (error || !data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}
