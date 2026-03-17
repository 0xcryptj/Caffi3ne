import Link from "next/link";
import { ArrowRight, Database, MapPinned, Store, Waves } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { DitherBean } from "@/components/dither-bean";
import { DitherSteam } from "@/components/dither-steam";
import { RotatingText } from "@/components/rotating-text";
import { BlurText } from "@/components/blur-text";
import { SpotlightCard } from "@/components/spotlight-card";
import { Aurora } from "@/components/aurora";
import { ScrollFade } from "@/components/scroll-fade";

const features = [
  {
    title: "Nearby discovery",
    description: "Search coffee shops around a user and present them in a clean dashboard with map plus list.",
    icon: MapPinned,
    delay: 0,
  },
  {
    title: "Crowd intelligence",
    description: "Estimate busyness using weather, traffic, time-of-day, and day-of-week signals.",
    icon: Waves,
    delay: 100,
  },
  {
    title: "Merchant workflows",
    description: "Let owners submit missing locations and claim listings without making POS integrations a blocker.",
    icon: Store,
    delay: 200,
  },
  {
    title: "Developer API",
    description: "Expose normalized shop and insight data with documentation, example payloads, and pricing.",
    icon: Database,
    delay: 300,
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-glow">

        {/* Aurora — warm espresso flow */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-35">
          <Aurora
            colorStops={["#c47637", "#8f562d", "#d4a96a"]}
            amplitude={1.1}
            blend={0.45}
            speed={0.35}
          />
        </div>

        {/* Dither steam — rises from bottom of hero */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full opacity-20">
          <DitherSteam color={[90, 48, 18]} alpha={130} />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-28">

          {/* Left: two dithered coffee beans */}
          <div className="relative flex items-center justify-center lg:min-h-[480px]">
            <DitherBean displaySize={340} rotate={-10} className="relative z-10" />
            <div className="absolute -bottom-2 right-0 z-20 sm:-bottom-4 sm:right-4 lg:-bottom-6 lg:right-0">
              <DitherBean displaySize={200} rotate={28} />
            </div>
          </div>

          {/* Right: text */}
          <div className="space-y-7">

            <div
              className="animate-fade-up inline-flex rounded-full border border-espresso-200 bg-crema/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-espresso-600 backdrop-blur-sm"
              style={{ animationDelay: "0ms", animationFillMode: "both" }}
            >
              Coffee Intelligence Platform
            </div>

            {/*
              RotatingText fix:
              - inline-block (not inline-flex) so the container keeps its height
                even when children are transitioning between animation states
              - minHeight: 1.3em prevents collapse during AnimatePresence swaps
              - overflow: hidden clips the y:"100%" enter / y:"-120%" exit travel
              - The negative marginBottom + paddingBottom cancels out so the
                surrounding text baseline is not shifted
            */}
            <h1
              className="animate-fade-up font-display text-3xl leading-snug text-espresso-900 sm:text-4xl md:text-5xl lg:text-6xl"
              style={{ animationDelay: "80ms", animationFillMode: "both" }}
            >
              Discover the perfect{" "}
              <span
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  verticalAlign: "bottom",
                  minHeight: "1.25em",
                  paddingBottom: "0.15em",
                  marginBottom: "-0.15em",
                }}
              >
                <RotatingText
                  texts={["coffee shop", "café", "roastery", "espresso bar"]}
                  mainClassName="text-espresso-500 italic font-display"
                  rotationInterval={3800}
                  staggerDuration={0.045}
                />
              </span>
              {" "}near you, right now.
            </h1>

            <div
              className="animate-fade-up"
              style={{ animationDelay: "180ms", animationFillMode: "both" }}
            >
              <BlurText
                text="Caffi3ne gives you live crowd intelligence, ratings, and hours for every cafe around you — so you always know where to go."
                delay={100}
                animateBy="words"
                direction="bottom"
                className="max-w-xl text-sm leading-7 text-espresso-600 sm:text-base sm:leading-8"
              />
            </div>

            <div
              className="animate-fade-up flex flex-wrap gap-4"
              style={{ animationDelay: "280ms", animationFillMode: "both" }}
            >
              <Link
                href="/nearby"
                className="inline-flex items-center gap-2 rounded-full bg-espresso-800 px-6 py-3 text-sm font-semibold text-crema shadow-[0_4px_20px_rgba(50,28,15,0.35)] transition hover:bg-espresso-900 hover:shadow-[0_6px_28px_rgba(50,28,15,0.45)]"
              >
                Explore nearby shops
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-espresso-200 bg-white/80 px-6 py-3 text-sm font-semibold text-espresso-800 backdrop-blur-sm transition hover:bg-crema"
              >
                View API docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <ScrollFade>
        <section className="border-y border-espresso-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { label: "Live signals",  value: "4",   sub: "per shop, per request" },
              { label: "API endpoints", value: "6",   sub: "ready on day one" },
              { label: "Crowd labels",  value: "4",   sub: "Below · Avg · Busy · Packed" },
              { label: "Deploy time",   value: "<1s", sub: "Vercel edge network" },
            ].map((stat, i) => (
              <ScrollFade key={stat.label} delay={i * 80}>
                <div className="border-r border-espresso-100 px-6 py-8 last:border-r-0 odd:border-b md:odd:border-b-0">
                  <p className="font-display text-3xl text-espresso-900 sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-espresso-500">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-espresso-400">{stat.sub}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </section>
      </ScrollFade>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <ScrollFade>
          <SectionHeading
            eyebrow="Product"
            title="An MVP that can pitch, demo, and evolve"
            description="Shaped for three audiences at once: nearby coffee seekers, shop operators, and developers who want crowd intelligence as an API."
          />
        </ScrollFade>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <ScrollFade key={feature.title} delay={feature.delay}>
              <SpotlightCard
                className="h-full rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-espresso-200 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)]"
                spotlightColor="rgba(180,125,77,0.20)"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-espresso-50 p-3">
                  <feature.icon className="h-6 w-6 text-espresso-700" />
                </div>
                <h3 className="text-base font-semibold text-espresso-900 sm:text-xl">{feature.title}</h3>
                <p className="mt-2 text-xs leading-6 text-espresso-600 sm:text-sm sm:leading-7">{feature.description}</p>
              </SpotlightCard>
            </ScrollFade>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA cards ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 sm:pb-20 lg:grid-cols-2 lg:px-8">
        <ScrollFade delay={0}>
          <SpotlightCard
            className="h-full rounded-[2rem] border border-espresso-100 bg-white p-5 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)] sm:p-8"
            spotlightColor="rgba(180,125,77,0.15)"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Merchant layer</p>
            <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Claim listings and submit missing shops</h3>
            <p className="mt-4 text-espresso-600">Capture merchant demand early, even before full operational integrations exist.</p>
            <Link href="/merchant" className="mt-6 inline-flex text-sm font-semibold text-espresso-800 underline-offset-4 hover:underline">
              Open merchant portal
            </Link>
          </SpotlightCard>
        </ScrollFade>

        <ScrollFade delay={120}>
          <SpotlightCard
            className="h-full rounded-[2rem] border border-espresso-100 bg-[#efe2cf] p-5 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(38,25,14,0.14)] sm:p-8"
            spotlightColor="rgba(143,86,45,0.18)"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Pricing preview</p>
            <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">Free for demo usage, Pro for heavier API access</h3>
            <p className="mt-4 text-espresso-700">Usage-based framing is included now, while billing remains intentionally mocked for the MVP.</p>
            <Link href="/pricing" className="mt-6 inline-flex text-sm font-semibold text-espresso-800 underline-offset-4 hover:underline">
              See pricing
            </Link>
          </SpotlightCard>
        </ScrollFade>
      </section>
    </div>
  );
}
