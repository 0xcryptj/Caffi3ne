import Link from "next/link";
import { Coffee } from "lucide-react";

const links = [
  { href: "/nearby", label: "Nearby Shops" },
  { href: "/docs", label: "API Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/merchant", label: "Merchants" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-espresso-100/70 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-espresso-800">
          <div className="rounded-full border border-espresso-200 bg-crema p-2">
            <Coffee className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-lg tracking-wide">Caffi3ne</div>
            <div className="text-xs uppercase tracking-[0.28em] text-espresso-400">
              Coffee Intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-espresso-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-espresso-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
