import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3, Globe, MapPin, Phone, Sparkles } from "lucide-react";
import { getMockShopById } from "@/lib/data/mock-shops";
import { getCrowdInsightForShop } from "@/lib/services/insights";
import { formatScore } from "@/lib/utils";

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = getMockShopById(id);

  if (!shop) {
    notFound();
  }

  const insight = await getCrowdInsightForShop(shop);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-espresso-100 bg-white p-8 shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Shop Detail</p>
            <h1 className="mt-3 font-display text-5xl text-espresso-900">{shop.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-espresso-600">{shop.address}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-crema p-5">
                <div className="flex items-center gap-2 text-sm text-espresso-500">
                  <Sparkles className="h-4 w-4" />
                  Estimated crowd score
                </div>
                <p className="mt-3 text-4xl font-semibold text-espresso-900">{formatScore(insight.score)}</p>
                <p className="mt-2 text-sm text-espresso-700">{insight.label}</p>
              </div>

              <div className="rounded-3xl bg-crema p-5">
                <p className="text-sm text-espresso-500">Rating</p>
                <p className="mt-3 text-4xl font-semibold text-espresso-900">{shop.rating}</p>
                <p className="mt-2 text-sm text-espresso-700">{shop.userRatingsTotal.toLocaleString()} reviews</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 text-sm text-espresso-700 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-espresso-100 p-4">
                <Clock3 className="h-4 w-4 text-espresso-500" />
                <span>{shop.hours.join(" • ")}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-espresso-100 p-4">
                <MapPin className="h-4 w-4 text-espresso-500" />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-espresso-100 p-4">
                <Globe className="h-4 w-4 text-espresso-500" />
                <span>{shop.website ?? "Website pending"}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-espresso-100 p-4">
                <Phone className="h-4 w-4 text-espresso-500" />
                <span>{shop.phone ?? "Phone pending"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-espresso-100 bg-white p-8 shadow-panel">
            <h2 className="font-display text-3xl text-espresso-900">How the crowd estimate works</h2>
            <p className="mt-4 text-espresso-600">
              This first-pass score is heuristic-based. It blends external traffic signals, local weather, time-of-day, and day-of-week behavior into a 0 to 100 busyness estimate.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-crema p-5">
                <p className="text-sm text-espresso-500">Traffic factor</p>
                <p className="mt-2 text-2xl font-semibold text-espresso-900">{insight.breakdown.trafficScore}</p>
              </div>
              <div className="rounded-3xl bg-crema p-5">
                <p className="text-sm text-espresso-500">Weather factor</p>
                <p className="mt-2 text-2xl font-semibold text-espresso-900">{insight.breakdown.weatherScore}</p>
              </div>
              <div className="rounded-3xl bg-crema p-5">
                <p className="text-sm text-espresso-500">Time factor</p>
                <p className="mt-2 text-2xl font-semibold text-espresso-900">{insight.breakdown.timeScore}</p>
              </div>
              <div className="rounded-3xl bg-crema p-5">
                <p className="text-sm text-espresso-500">Day factor</p>
                <p className="mt-2 text-2xl font-semibold text-espresso-900">{insight.breakdown.dayScore}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-espresso-100 bg-[#2b1b0e] p-8 text-crema shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-100/70">Merchant CTA</p>
            <h2 className="mt-3 font-display text-3xl">Own this shop?</h2>
            <p className="mt-4 text-sm leading-7 text-espresso-50/80">
              Claim the listing, submit updates, and unlock future merchant-side analytics and override controls.
            </p>
            <Link
              href="/merchant"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-crema px-5 py-3 text-sm font-semibold text-espresso-900"
            >
              Start claim flow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-espresso-100 bg-white p-8 shadow-panel">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Sources</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-espresso-600">
              {insight.explanation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
