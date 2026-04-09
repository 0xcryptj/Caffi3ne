import type { Metadata, Viewport } from "next";
import type { Session } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import { appConfig } from "@/lib/config";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} | Coffee Intelligence`,
    template: `%s | ${appConfig.name}`
  },
  description: appConfig.description
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let initialSession: Session | null = null;
  try {
    initialSession = await readInitialSession();
  } catch {
    initialSession = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-body text-espresso-900 antialiased"
        suppressHydrationWarning
      >
        <Providers initialSession={initialSession}>
          <SiteHeader />
          <main className="min-w-0 max-w-full overflow-x-hidden">{children}</main>
          <SiteFooter />
        </Providers>
        <Analytics />
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
