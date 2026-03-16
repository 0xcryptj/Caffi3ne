import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Demo",
    price: "Free",
    sub: "forever",
    description: "For developers exploring the API, building prototypes, or running demos.",
    cta: "Get a demo key",
    ctaHref: "/docs#authentication",
    featured: false,
    features: [
      "20 requests / minute",
      "500 requests / day",
      "Nearby shop search",
      "Crowd intelligence scores",
      "Shop detail & hours",
      "Community support"
    ]
  },
  {
    name: "Pro",
    price: "$99",
    sub: "/ month",
    description: "For startups, operators, and production apps that need real volume.",
    cta: "Contact us",
    ctaHref: "mailto:hello@caffi3ne.com",
    featured: true,
    features: [
      "200 requests / minute",
      "50,000 requests / day",
      "Everything in Demo",
      "Merchant analytics access",
      "Usage dashboard & graphs",
      "Priority email support",
      "Custom radius & filters",
      "Usage-based overages"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "pricing",
    description: "For chains, platforms, and teams needing dedicated infrastructure.",
    cta: "Talk to us",
    ctaHref: "mailto:hello@caffi3ne.com",
    featured: false,
    features: [
      "Unlimited requests",
      "Dedicated infrastructure",
      "SLA guarantees",
      "Square POS data access",
      "White-label options",
      "Slack support channel",
      "Invoice billing"
    ]
  }
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-espresso-500">Pricing</p>
        <h1 className="mt-4 font-display text-3xl text-espresso-900 sm:text-4xl lg:text-5xl">Simple, honest pricing</h1>
        <p className="mt-4 text-base leading-8 text-espresso-600">
          Start free. Upgrade when you&apos;re ready. No surprise billing.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-[2rem] border p-7 shadow-panel ${
              tier.featured ? "border-espresso-800 bg-[#2b1b0e] text-crema" : "border-espresso-100 bg-white"
            }`}
          >
            {tier.featured && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-espresso-400 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow">
                  Most popular
                </span>
              </div>
            )}

            <p className={`text-xs font-bold uppercase tracking-[0.3em] ${tier.featured ? "text-espresso-100/60" : "text-espresso-400"}`}>
              {tier.name}
            </p>
            <div className="mt-4 flex items-end gap-1.5">
              <span className={`font-display text-4xl font-semibold ${tier.featured ? "text-crema" : "text-espresso-900"}`}>
                {tier.price}
              </span>
              <span className={`pb-1 text-sm ${tier.featured ? "text-espresso-100/60" : "text-espresso-400"}`}>{tier.sub}</span>
            </div>
            <p className={`mt-3 text-sm leading-6 ${tier.featured ? "text-espresso-50/70" : "text-espresso-600"}`}>
              {tier.description}
            </p>

            <ul className={`my-6 flex-1 space-y-2.5 text-sm ${tier.featured ? "text-espresso-100/80" : "text-espresso-600"}`}>
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.featured ? "text-espresso-300" : "text-emerald-500"}`} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref as never}
              className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                tier.featured ? "bg-crema text-espresso-900 hover:bg-white" : "bg-espresso-900 text-crema hover:bg-espresso-800"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-3">
        {[
          { q: "When does enforcement start?", a: "Rate-limit enforcement ships with account auth. Demo keys run on an honour system today." },
          { q: "Can I keep my demo key?",      a: "Yes — keys issued now carry forward and link to your account when sign-up launches." },
          { q: "Annual discount?",             a: "Annual billing with a 2-month discount is planned. Email us to get on the early list." }
        ].map((item) => (
          <div key={item.q} className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-espresso-900">{item.q}</p>
            <p className="mt-2 text-sm leading-6 text-espresso-600">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
