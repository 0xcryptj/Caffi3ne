import Link from "next/link";

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
    <footer className="border-t border-espresso-100 bg-[#1a0f07] text-espresso-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg text-crema">Caffi3ne</p>
            <p className="mt-2 text-xs leading-6 text-espresso-400">
              Live coffee shop discovery and crowd intelligence for everyone who cares where they drink coffee.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-espresso-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live data · Google Places · Tomorrow.io · TomTom · BestTime
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

        <div className="mt-12 flex flex-col gap-3 border-t border-espresso-800 pt-6 text-xs text-espresso-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Caffi3ne. All rights reserved.</p>
          <p>Data partners: Google · Tomorrow.io · TomTom · BestTime.app</p>
        </div>
      </div>
    </footer>
  );
}
