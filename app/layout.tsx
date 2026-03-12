import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { appConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name} | Coffee Intelligence`,
    template: `%s | ${appConfig.name}`
  },
  description: appConfig.description
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body text-espresso-900 antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
