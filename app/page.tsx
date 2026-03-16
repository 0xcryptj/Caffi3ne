import Link from "next/link";
import { ArrowRight, Database, MapPinned, Store, Waves } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { DitherBean } from "@/components/dither-bean";

const features = [
  {
    title: "Nearby discovery",
    description: "Search coffee shops around a user and present them in a clean dashboard with map plus list.",
    icon: MapPinned,
    delay: "0ms"
  },
  {
    title: "Crowd intelligence",
    description: "Estimate busyness using weather, traffic, time-of-day, and day-of-week signals.",
    icon: Waves,
    delay: "80ms"
  },
  {
    title: "Merchant workflows",
    description: "Let owners submit missing locations and claim listings without making POS integrations a blocker.",
    icon: Store,
    delay: "160ms"
  },
  {
    title: "Developer API",
    description: "Expose normalized shop and insight data with documentation, example payloads, and pricing.",
    icon: Database,
    delay: "240ms"
  }
];

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-hero-glow overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">

          {/* Left: text */}
          <div className="space-y-8">
            {/* Badge with shimmer */}
            <div
              className="animate-fade-up inline-flex rounded-full border border-espresso-200 bg-crema px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-espresso-600"
              style={{ animationDelay: "0ms", animationFillMode: "both" }}
            >
              Coffee Intelligence Platform
            </div>

            <div className="space-y-5">
              <h1
                className="animate-fade-up max-w-4xl font-display text-3xl leading-tight text-espresso-900 sm:text-4xl md:text-5xl lg:text-6xl"
                style={{ animationDelay: "80ms", animationFillMode: "both" }}
              >
                Find the right coffee shop and understand what it is like right now.
              </h1>
              <p
                className="animate-fade-up max-w-2xl text-sm leading-7 text-espresso-600 sm:text-base sm:leading-8"
                style={{ animationDelay: "160ms", animationFillMode: "both" }}
              >
                Caffi3ne helps consumers discover nearby cafes and gives merchants and developers a polished data layer around rating, hours, and crowd intelligence.
              </p>
            </div>

            <div
              className="animate-fade-up flex flex-wrap gap-4"
              style={{ animationDelay: "240ms", animationFillMode: "both" }}
            >
              <Link
                href="/nearby"
                className="inline-flex items-center gap-2 rounded-full bg-espresso-800 px-6 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-900"
              >
                Explore nearby shops
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-espresso-200 bg-white px-6 py-3 text-sm font-semibold text-espresso-800 transition hover:bg-crema"
              >
                View API docs
              </Link>
            </div>
          </div>

          {/* Right: dithered coffee bean */}
          <div
            className="animate-slide-in-right flex items-center justify-center"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            <div className="animate-float">
              <DitherBean displaySize={380} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-espresso-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { label: "Live inputs",       value: "4",    sub: "signals per shop" },
            { label: "API endpoints",     value: "6",    sub: "ready on day one" },
            { label: "Crowd labels",      value: "4",    sub: "Below · Avg · Busy · Packed" },
            { label: "Deploy time",       value: "<1s",  sub: "Vercel edge network" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="animate-fade-up border-r border-espresso-100 px-6 py-8 last:border-r-0 odd:border-b md:odd:border-b-0"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: "both" }}
            >
              <p className="font-display text-3xl text-espresso-900 sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-espresso-500">{stat.label}</p>
              <p className="mt-0.5 text-xs text-espresso-400">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          eyebrow="Product"
          title="An MVP that can pitch, demo, and evolve"
          description="The product is shaped for three audiences at once: nearby coffee seekers, coffee shop operators, and developers who want intelligence as an API."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="animate-fade-up group rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-espresso-200 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)]"
              style={{ animationDelay: feature.delay, animationFillMode: "both" }}
            >
              <div className="mb-4 inline-flex rounded-2xl bg-espresso-50 p-3 transition-colors group-hover:bg-espresso-100">
                <feature.icon className="h-6 w-6 text-espresso-700" />
              </div>
              <h3 className="text-base font-semibold text-espresso-900 sm:text-xl">{feature.title}</h3>
              <p className="mt-2 text-xs leading-6 text-espresso-600 sm:text-sm sm:leading-7">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA cards ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:px-8">
        <div className="animate-fade-up rounded-[2rem] border border-espresso-100 bg-white p-5 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)] sm:p-8"
          style={{ animationDelay: "0ms", animationFillMode: "both" }}>
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Merchant layer</p>
          <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Claim listings and submit missing shops</h3>
          <p className="mt-4 text-espresso-600">
            Capture merchant demand early, even before full operational integrations exist.
          </p>
          <Link href="/merchant" className="mt-6 inline-flex text-sm font-semibold text-espresso-800 underline-offset-4 hover:underline">
            Open merchant portal
          </Link>
        </div>

        <div className="animate-fade-up rounded-[2rem] border border-espresso-100 bg-[#efe2cf] p-5 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)] sm:p-8"
          style={{ animationDelay: "80ms", animationFillMode: "both" }}>
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Pricing preview</p>
          <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Free for demo usage, Pro for heavier API access</h3>
          <p className="mt-4 text-espresso-700">
            Usage-based framing is included now, while billing remains intentionally mocked for the MVP.
          </p>
          <Link href="/pricing" className="mt-6 inline-flex text-sm font-semibold text-espresso-800 underline-offset-4 hover:underline">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
