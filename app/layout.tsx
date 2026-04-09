import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} | Coffee Intelligence`,
    template: `%s | ${appConfig.name}`
  },
  description: appConfig.description
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body text-espresso-900 antialiased">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
