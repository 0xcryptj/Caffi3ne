import Link from "next/link";
import { AdSenseDisplay } from "@/components/adsense-display";

const groups = [
  {
    group: "Product",
    items: [{ href: "/nearby", label: "Nearby Shops", soon: false }]
  },
  {
    group: "Developers",
    items: [
      { href: "/docs", label: "API Docs", soon: true },
      { href: "/docs#authentication", label: "Get API Key", soon: true }
    ]
  },
  {
    group: "Merchants",
    items: [
      { href: "/merchant", label: "Claim a Listing", soon: true },
      { href: "/merchant", label: "Submit a Shop", soon: true }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-espresso-100 bg-[#1a0f07] pb-[env(safe-area-inset-bottom,0px)] text-espresso-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg text-crema">Caffi3ne</p>
            <p className="mt-2 text-xs leading-6 text-espresso-400">
              Live coffee shop discovery and crowd intelligence for everyone who cares where they drink coffee.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-espresso-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live crowd estimates · refreshed as you browse
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-espresso-500">Feedback</p>
              <p className="mt-1.5 text-xs leading-5 text-espresso-400">
                Report a bug or share a suggestion — call or text our support line.
              </p>
              <a
                href="tel:+14706706763"
                className="mt-2 inline-block text-sm font-medium text-crema transition hover:text-crema/90 hover:underline"
              >
                (470) 670-6763
              </a>
            </div>
          </div>

          {groups.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-espresso-500">{group}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.soon ? (
                      <span className="text-sm text-espresso-500" title="Coming soon">
                        {item.label}{" "}
                        <span className="text-[9px] font-bold uppercase tracking-wider text-espresso-600">Soon</span>
                      </span>
                    ) : (
                      <Link href={item.href as never} className="text-sm text-espresso-400 transition hover:text-crema">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <AdSenseDisplay />

        <div className="mt-12 flex flex-col gap-3 border-t border-espresso-800 pt-6 text-xs text-espresso-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Caffi3ne. All rights reserved.</p>
          <p className="text-espresso-500">Estimates are proprietary; not for redistribution or automated harvesting.</p>
        </div>
      </div>
    </footer>
  );
}
