import Link from "next/link";
import { ArrowRight, Database, MapPinned, Store, Waves } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    title: "Nearby discovery",
    description: "Search coffee shops around a user and present them in a clean dashboard with map plus list.",
    icon: MapPinned
  },
  {
    title: "Crowd intelligence",
    description: "Estimate busyness using weather, traffic, time-of-day, and day-of-week signals.",
    icon: Waves
  },
  {
    title: "Merchant workflows",
    description: "Let owners submit missing locations and claim listings without making POS integrations a blocker.",
    icon: Store
  },
  {
    title: "Developer API",
    description: "Expose normalized shop and insight data with documentation, example payloads, and pricing.",
    icon: Database
  }
];

export default function LandingPage() {
  return (
    <div>
      <section className="bg-hero-glow">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-espresso-200 bg-crema px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-espresso-600">
              Coffee Intelligence Platform
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-display text-3xl leading-tight text-espresso-900 sm:text-4xl md:text-5xl lg:text-6xl">
                Find the right coffee shop and understand what it is like right now.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-espresso-600 sm:text-base sm:leading-8">
                Caffi3ne helps consumers discover nearby cafes and gives merchants and developers a polished data layer around rating, hours, and crowd intelligence.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
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

          <div className="rounded-[2rem] border border-espresso-100 bg-white/80 p-5 shadow-panel backdrop-blur sm:p-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-3xl bg-crema p-5">
                <div>
                  <p className="text-sm text-espresso-500">Current market pulse</p>
                  <h3 className="mt-1 font-display text-lg text-espresso-900 sm:text-2xl">Williamsburg morning run</h3>
                </div>
                <div className="rounded-full bg-espresso-800 px-4 py-2 text-sm font-semibold text-crema">
                  Busier Than Usual
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-espresso-100 bg-white p-5">
                  <p className="text-sm text-espresso-500">Live inputs</p>
                  <p className="mt-3 text-3xl font-semibold text-espresso-900">4</p>
                  <p className="mt-2 text-sm text-espresso-600">Weather, traffic, time-of-day, day-of-week</p>
                </div>
                <div className="rounded-3xl border border-espresso-100 bg-white p-5">
                  <p className="text-sm text-espresso-500">Developer-ready</p>
                  <p className="mt-3 text-3xl font-semibold text-espresso-900">6</p>
                  <p className="mt-2 text-sm text-espresso-600">Initial API endpoints for listings and intelligence</p>
                </div>
              </div>

              <div className="rounded-3xl border border-espresso-100 bg-[#2b1b0e] p-6 text-crema">
                <p className="text-sm uppercase tracking-[0.28em] text-espresso-100/70">MVP position</p>
                <p className="mt-4 text-lg leading-8">
                  Designed to feel investor-ready on day one, while keeping the integration surface practical for a startup team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <SectionHeading
          eyebrow="Product"
          title="An MVP that can pitch, demo, and evolve"
          description="The product is shaped for three audiences at once: nearby coffee seekers, coffee shop operators, and developers who want intelligence as an API."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
              <feature.icon className="h-8 w-8 text-espresso-700" />
              <h3 className="mt-4 text-base font-semibold text-espresso-900 sm:text-xl">{feature.title}</h3>
              <p className="mt-2 text-xs leading-6 text-espresso-600 sm:text-sm sm:leading-7">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[2rem] border border-espresso-100 bg-white p-5 shadow-panel sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Merchant layer</p>
          <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Claim listings and submit missing shops</h3>
          <p className="mt-4 text-espresso-600">
            Capture merchant demand early, even before full operational integrations exist.
          </p>
          <Link href="/merchant" className="mt-6 inline-flex text-sm font-semibold text-espresso-800">
            Open merchant portal
          </Link>
        </div>

        <div className="rounded-[2rem] border border-espresso-100 bg-[#efe2cf] p-5 shadow-panel sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Pricing preview</p>
          <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Free for demo usage, Pro for heavier API access</h3>
          <p className="mt-4 text-espresso-700">
            Usage-based framing is included now, while billing remains intentionally mocked for the MVP.
          </p>
          <Link href="/pricing" className="mt-6 inline-flex text-sm font-semibold text-espresso-800">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
