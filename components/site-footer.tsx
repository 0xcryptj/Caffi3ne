import Link from "next/link";

const links = [
  { group: "Product",    items: [{ href: "/nearby", label: "Nearby Shops" }, { href: "/pricing", label: "Pricing" }] },
  { group: "Developers", items: [{ href: "/docs", label: "API Docs" }, { href: "/docs#authentication", label: "Get API Key" }] },
  { group: "Merchants",  items: [{ href: "/merchant", label: "Claim a Listing" }, { href: "/merchant", label: "Submit a Shop" }] }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-espresso-100 bg-[#1a0f07] text-espresso-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-display text-lg text-crema">Caffi3ne</p>
            <p className="mt-2 text-xs leading-6 text-espresso-400">
              Coffee intelligence for consumers, merchants, and developers.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-espresso-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live · Charleston, SC
            </div>
          </div>

          {/* Nav groups */}
          {links.map((group) => (
            <div key={group.group}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-espresso-500">{group.group}</p>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href as never} className="text-sm text-espresso-400 transition hover:text-crema">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-espresso-800 pt-6 text-xs text-espresso-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Caffi3ne. MVP — billing and auth in active development.</p>
          <p>Built on Google Places · Tomorrow.io · TomTom · Square</p>
        </div>
      </div>
    </footer>
  );
}
