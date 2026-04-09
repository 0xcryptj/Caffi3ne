import Link from "next/link";
import { ArrowRight, Database, MapPinned, Store, Waves } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { BeanCluster } from "@/components/bean-cluster";
import { DitherBg } from "@/components/dither-bg-client";
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
    description: "Programmatic access to shop and intelligence data — launching soon. The consumer app already runs on the same live pipelines.",
    icon: Database,
    delay: 300,
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] overflow-hidden bg-hero-glow">

        {/* Aurora — warm espresso flow */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-35">
          <Aurora
            colorStops={["#c47637", "#8f562d", "#d4a96a"]}
            amplitude={1.1}
            blend={0.45}
            speed={0.35}
          />
        </div>

        {/* Dither steam — WebGL Perlin noise, cream bg + brown pixels */}
        {/* bg-crema is the cream fallback shown instantly before WebGL canvas loads */}
        <div className="pointer-events-none absolute inset-0 -z-10 min-h-full min-w-full bg-crema">
          <DitherBg />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-28">

          {/* Left: bean cluster — hidden on mobile */}
          <div className="hidden items-center justify-center sm:flex">
            <BeanCluster />
          </div>

          {/* Right: text */}
          <div className="space-y-7">

            <div
              className="animate-fade-up inline-flex rounded-full border border-espresso-200 bg-crema/80 px-4 py-2 text-xs font-semibold uppercase tracking-normal sm:tracking-[0.32em] text-espresso-600 backdrop-blur-sm"
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
                  transition={{ type: "spring", damping: 20, stiffness: 180 }}
                  rotationInterval={5000}
                  staggerDuration={0.065}
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
                delay={130}
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
              <span
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-espresso-200 bg-espresso-50/80 px-6 py-3 text-sm font-semibold text-espresso-400 backdrop-blur-sm"
                title="Developer API — coming soon"
              >
                API docs — soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <ScrollFade>
        <section className="border-y border-espresso-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
              { label: "Live signals", value: "4+", sub: "demand, context, rhythm, venue history" },
              { label: "Fusion", value: "Multi", sub: "one score from many signal layers" },
              { label: "Crowd labels", value: "4", sub: "Below · Avg · Busy · Packed" },
              { label: "Updates", value: "Live", sub: "refreshed when you load a view" },
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
            title="Built for coffee seekers, owners, and builders"
            description="Caffi3ne combines live maps, ratings, hours, and crowd intelligence so you always know what to expect before you go."
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
            <p className="mt-4 text-espresso-600">Submit new locations or claim a listing. Our team reviews every submission.</p>
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
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">For teams</p>
            <h3 className="mt-3 font-display text-xl text-espresso-900 sm:text-2xl lg:text-3xl">API access and volume pricing</h3>
            <p className="mt-4 text-espresso-700">Developer plans and public API keys are coming soon. The consumer experience is live today with real data.</p>
            <span className="mt-6 inline-flex cursor-not-allowed text-sm font-semibold text-espresso-400" title="Coming soon">
              Pricing — soon
            </span>
          </SpotlightCard>
        </ScrollFade>
      </section>
    </div>
  );
}
