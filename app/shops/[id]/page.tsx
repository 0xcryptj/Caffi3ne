import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Car, Clock, Clock3, DollarSign, ExternalLink, Globe, MapPin, Navigation, Phone, ShoppingBag, Sparkles, TrendingUp, UtensilsCrossed, Wind } from "lucide-react";
import { PhotoGrid } from "@/components/photo-grid";
import { ShopLogo } from "@/components/shop-logo";
import { PopularTimesChart } from "@/components/popular-times-chart";
import { getCoffeeShopById } from "@/lib/services/places";
import { getCrowdInsightForShop, getLocalHour } from "@/lib/services/insights";
import { getBestTimeCurrentDay } from "@/lib/services/besttime";
import { formatScore } from "@/lib/utils";
import type { BusynessLabel, PriceLevel, Shop } from "@/lib/types";


const crowdColors: Record<BusynessLabel, string> = {
  "Below Average":     "text-slate-600",
  "Average":           "text-emerald-700",
  "Busier Than Usual": "text-amber-700",
  "Packed":            "text-red-700",
};

function priceLabel(level?: PriceLevel) {
  const map: Record<PriceLevel, string> = {
    FREE: "Free", INEXPENSIVE: "$", MODERATE: "$$", EXPENSIVE: "$$$", VERY_EXPENSIVE: "$$$$"
  };
  return level ? map[level] : null;
}

// Well-known chain domains — these have store locators, not menus, on their homepage
const CHAIN_DOMAINS = new Set([
  "starbucks.com", "dunkin.com", "dunkindonuts.com", "peets.com",
  "cariboucoffee.com", "dutchbros.com", "biggby.com", "scooterscoffee.com",
  "philzcoffee.com", "bluebottlecoffee.com", "intelligentsia.com",
  "lacolombe.com", "gregoryscoffee.com", "timhortons.com", "coffeebean.com",
  "secondcup.com", "lavazza.com", "illy.com",
]);

function isChain(website?: string): boolean {
  if (!website) return false;
  const domain = website.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, "");
  return CHAIN_DOMAINS.has(domain);
}

function vibeLabel(shop: Shop): string {
  const types = shop.tags.map((t) => t.toLowerCase());
  const price = shop.priceLevel;
  if (types.some((t) => t.includes("bakery"))) return "Bakery Cafe";
  if (types.some((t) => t.includes("bar")))    return "Cafe & Bar";
  if (price === "EXPENSIVE" || price === "VERY_EXPENSIVE") return "Upscale Roastery";
  if (price === "INEXPENSIVE" || price === "FREE")         return "Casual Corner";
  if (shop.rating >= 4.5) return "Community Favorite";
  return "Neighborhood Cafe";
}

function generateBrief(shop: Shop): string {
  if (shop.editorialSummary) return shop.editorialSummary;
  const price = priceLabel(shop.priceLevel);
  const vibe = vibeLabel(shop);
  const ratingLine =
    shop.rating >= 4.5
      ? `Highly regarded with a ${shop.rating}-star rating across ${shop.userRatingsTotal.toLocaleString()} reviews`
      : shop.rating >= 4.0
      ? `Well-reviewed with ${shop.rating} stars from ${shop.userRatingsTotal.toLocaleString()} guests`
      : `Rated ${shop.rating} stars by ${shop.userRatingsTotal.toLocaleString()} visitors`;
  const priceNote = price ? ` Price range: ${price}.` : "";
  return `${shop.name} is a ${vibe.toLowerCase()} in ${shop.address.split(",").slice(-2).join(",").trim()}.${priceNote} ${ratingLine}, it draws a mix of locals and regulars throughout the day. Crowd intelligence updates in real time based on weather, local traffic, and time patterns.`;
}

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shop = await getCoffeeShopById(id);
  if (!shop) notFound();

  const insight = await getCrowdInsightForShop(shop, { withPopularTimes: true });
  const brief = generateBrief(shop);
  const vibe = vibeLabel(shop);
  const price = priceLabel(shop.priceLevel);
  const photos = shop.photos ?? [];
  const chain = isChain(shop.website);

  // For the Popular Times chart: compute the current local hour + BestTime day
  const currentLocalHour = getLocalHour(shop.utcOffsetMinutes);
  const currentBtDay     = getBestTimeCurrentDay(shop.utcOffsetMinutes);

  // Ordering helpers
  const ordering = shop.ordering;
  const hasAnyOrdering = ordering && (
    ordering.delivery || ordering.takeout || ordering.dineIn || ordering.curbsidePickup || ordering.ordersUri
  );
  const googleMapsOrderUrl =
    ordering?.ordersUri ??
    `https://www.google.com/maps/place/?q=place_id:${shop.googlePlaceId}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

      {/* Back link */}
      <Link
        href="/nearby"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-espresso-500 transition hover:text-espresso-800"
      >
        ← Back to nearby
      </Link>

      {/* Photo grid */}
      <PhotoGrid photos={photos} shopName={shop.name} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">

        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="space-y-5 sm:space-y-6">

          {/* Main shop info */}
          <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Shop Detail</p>

            {/* Name + logo row */}
            <div className="mt-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="break-words font-display text-2xl leading-tight text-espresso-900 sm:text-3xl lg:text-4xl xl:text-5xl">
                  {shop.name}
                </h1>
                <p className="mt-2 break-words text-sm leading-relaxed text-espresso-600 sm:text-base">{shop.address}</p>
              </div>
              <ShopLogo website={shop.website} name={shop.name} size="lg" />
            </div>

            {/* Vibe + price badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-espresso-50 px-3 py-1 text-xs text-espresso-700 sm:text-sm">
                <Wind className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {vibe}
              </span>
              {price && (
                <span className="flex items-center gap-1.5 rounded-full bg-espresso-50 px-3 py-1 text-xs text-espresso-700 sm:text-sm">
                  <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {price}
                </span>
              )}
              {shop.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-espresso-50 px-3 py-1 text-xs text-espresso-600 sm:text-sm">
                  {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            {/* Score + wait + foot traffic + rating */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-crema p-4 sm:rounded-3xl sm:p-5">
                <div className="flex items-center gap-1.5 text-xs text-espresso-500 sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Crowd score
                </div>
                <p className={`mt-2 text-3xl font-semibold sm:text-4xl ${crowdColors[insight.label]}`}>
                  {formatScore(insight.score)}
                </p>
                <p className="mt-1 text-xs text-espresso-700 sm:text-sm">{insight.label}</p>
              </div>

              <div className="rounded-2xl bg-crema p-4 sm:rounded-3xl sm:p-5">
                <div className="flex items-center gap-1.5 text-xs text-espresso-500 sm:text-sm">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Est. wait
                </div>
                {insight.waitMinutes ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold text-espresso-900 sm:text-4xl">
                      {insight.waitMinutes.label}
                    </p>
                    <p className="mt-1 text-xs text-espresso-500 sm:text-sm">based on current crowd</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-3xl font-semibold text-espresso-400 sm:text-4xl">—</p>
                    <p className="mt-1 text-xs text-espresso-400 sm:text-sm">Shop is closed</p>
                  </>
                )}
              </div>

              {/* Foot traffic — shows BestTime percentile when available, crowd score otherwise */}
              <div className="rounded-2xl bg-crema p-4 sm:rounded-3xl sm:p-5">
                <div className="flex items-center gap-1.5 text-xs text-espresso-500 sm:text-sm">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  Foot traffic
                </div>
                {shop.isOpenNow !== false ? (
                  <>
                    <p className="mt-2 text-3xl font-semibold text-espresso-900 sm:text-4xl">
                      {insight.breakdown.timeScore}
                      <span className="text-lg text-espresso-400">%</span>
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-espresso-200">
                      <div
                        className="h-full rounded-full bg-espresso-700 transition-all"
                        style={{ width: `${insight.breakdown.timeScore}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-espresso-500 sm:text-sm">
                      {(insight.breakdown.rawInputs.bestTimeUsed as boolean | undefined)
                        ? "Historical · BestTime"
                        : "Typical for this hour"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-3xl font-semibold text-espresso-400 sm:text-4xl">—</p>
                    <p className="mt-1 text-xs text-espresso-400 sm:text-sm">Closed</p>
                  </>
                )}
              </div>

              <div className="rounded-2xl bg-crema p-4 sm:rounded-3xl sm:p-5">
                <p className="text-xs text-espresso-500 sm:text-sm">Google Rating</p>
                <p className="mt-2 text-3xl font-semibold text-espresso-900 sm:text-4xl">{shop.rating}</p>
                <p className="mt-1 text-xs text-espresso-700 sm:text-sm">{shop.userRatingsTotal.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Hours */}
            {shop.hours.length > 1 && (
              <div className="mt-5 rounded-xl border border-espresso-100 p-4 sm:rounded-2xl sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-espresso-500 sm:text-sm">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium uppercase tracking-wider">Hours</span>
                </div>
                <ul className="space-y-1.5 text-xs text-espresso-700 sm:text-sm">
                  {shop.hours.map((h, i) => {
                    const isToday = i === ((new Date().getDay() + 6) % 7);
                    return (
                      <li key={i} className={`flex justify-between gap-3 ${isToday ? "font-semibold text-espresso-900" : ""}`}>
                        <span className="shrink-0">{h.split(":")[0]}</span>
                        <span className="text-right">{h.split(": ").slice(1).join(": ") || "Closed"}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Contact details */}
            <div className="mt-4 grid gap-3 text-xs text-espresso-700 sm:grid-cols-2 sm:text-sm">
              {shop.hours.length <= 1 && (
                <div className="flex items-start gap-2.5 rounded-xl border border-espresso-100 p-3.5 sm:rounded-2xl sm:p-4">
                  <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-espresso-500" />
                  <span className="leading-relaxed">{shop.hours[0] ?? "Hours unavailable"}</span>
                </div>
              )}
              <div className="flex items-start gap-2.5 rounded-xl border border-espresso-100 p-3.5 sm:rounded-2xl sm:p-4">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-espresso-500" />
                <span className="break-words leading-relaxed">{shop.address}</span>
              </div>
              {shop.website && (
                <div className="flex items-center gap-2.5 rounded-xl border border-espresso-100 p-3.5 sm:rounded-2xl sm:p-4">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-espresso-500" />
                  <a href={shop.website} target="_blank" rel="noopener noreferrer"
                    className="min-w-0 truncate hover:underline">
                    {shop.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {shop.phone && (
                <div className="flex items-center gap-2.5 rounded-xl border border-espresso-100 p-3.5 sm:rounded-2xl sm:p-4">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-espresso-500" />
                  <span>{shop.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Online ───────────────────────────────────────────────── */}
          {hasAnyOrdering && (() => {
            const deliveryProviders = [
              {
                name: "DoorDash",
                fee: "Service fee 15%",
                deliveryFee: "Delivery fee $2.99+",
                time: "25–40 min",
                href: `https://www.doordash.com/search/store/${encodeURIComponent(shop.name)}`,
                dot: "#FF3008",
              },
              {
                name: "Uber Eats",
                fee: "Service fee 5–15%",
                deliveryFee: "Delivery fee $0.49+",
                time: "20–35 min",
                href: `https://www.ubereats.com/search?q=${encodeURIComponent(shop.name)}`,
                dot: "#000000",
              },
              {
                name: "Grubhub",
                fee: "Service fee 5–15%",
                deliveryFee: "Delivery fee $1+",
                time: "30–50 min",
                href: `https://www.grubhub.com/delivery?q=${encodeURIComponent(shop.name)}`,
                dot: "#F6471D",
              },
            ];
            return (
              <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-espresso-400 sm:h-5 sm:w-5" />
                  <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">Order Online</h2>
                </div>
                <p className="mt-1 text-xs text-espresso-400">Place order with a delivery service</p>

                {/* ── Delivery providers list ────────────────────────────── */}
                {ordering!.delivery && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-espresso-400">Delivery</p>
                    <div className="overflow-hidden rounded-2xl border border-espresso-100 divide-y divide-espresso-100">
                      {deliveryProviders.map((p) => (
                        <a
                          key={p.name}
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 bg-white px-4 py-3.5 transition hover:bg-espresso-50"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: p.dot }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-espresso-900">{p.name}</p>
                            <p className="mt-0.5 text-xs text-espresso-400">{p.fee} · {p.deliveryFee}</p>
                            <p className="text-xs text-espresso-500">Typically {p.time}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-espresso-300 transition group-hover:text-espresso-700" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Pickup options ─────────────────────────────────────── */}
                {(ordering!.takeout || ordering!.curbsidePickup || ordering!.dineIn) && (
                  <div className="mt-4">
                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-espresso-400">Pickup</p>
                    <div className="rounded-2xl border border-espresso-100 bg-espresso-50 p-4">
                      <div className="flex flex-wrap gap-2">
                        {ordering!.takeout && (
                          <span className="flex items-center gap-1.5 rounded-full border border-espresso-200 bg-white px-3 py-1.5 text-xs font-medium text-espresso-700">
                            <ShoppingBag className="h-3 w-3" />
                            In-store pickup
                          </span>
                        )}
                        {ordering!.curbsidePickup && (
                          <span className="flex items-center gap-1.5 rounded-full border border-espresso-200 bg-white px-3 py-1.5 text-xs font-medium text-espresso-700">
                            <Car className="h-3 w-3" />
                            Curbside
                          </span>
                        )}
                        {ordering!.dineIn && (
                          <span className="flex items-center gap-1.5 rounded-full border border-espresso-200 bg-white px-3 py-1.5 text-xs font-medium text-espresso-700">
                            <UtensilsCrossed className="h-3 w-3" />
                            Dine-in
                          </span>
                        )}
                      </div>
                      {/* Order-ahead link (direct platform or ordersUri) */}
                      {(ordering!.ordersUri ?? (ordering!.detectedPlatform && shop.website)) && (
                        <a
                          href={ordering!.ordersUri ?? shop.website!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-espresso-800 hover:underline"
                        >
                          Order ahead for pickup{ordering!.detectedPlatform ? ` via ${ordering!.detectedPlatform}` : ""}
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback: ordersUri only (no delivery/pickup flags) */}
                {!ordering!.delivery && !ordering!.takeout && !ordering!.curbsidePickup && ordering!.ordersUri && (
                  <a
                    href={ordering!.ordersUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-espresso-200 bg-espresso-50 px-5 py-3.5 text-sm font-semibold text-espresso-800 transition hover:bg-crema"
                  >
                    Order online
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                )}

                <p className="mt-4 text-[10px] text-espresso-300">
                  Fees are typical estimates — actual fees and times vary by location and provider.
                </p>
              </div>
            );
          })()}

          {/* Caffi3ne Brief */}
          <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-espresso-400 sm:h-5 sm:w-5" />
              <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">Caffi3ne Brief</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-espresso-600 sm:mt-4 sm:text-base sm:leading-8">{brief}</p>
          </div>

          {/* ── Popular Times ─────────────────────────────────────────────── */}
          {insight.popularTimes && (
            <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-espresso-400 sm:h-5 sm:w-5" />
                <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">Popular times</h2>
              </div>
              <p className="mt-1 text-xs text-espresso-400">
                Typical visit patterns from real historical foot traffic data
              </p>
              <div className="mt-5">
                <PopularTimesChart
                  popularTimes={insight.popularTimes}
                  currentHour={currentLocalHour}
                  currentBtDay={currentBtDay}
                />
              </div>
            </div>
          )}

          {/* Visit Website / Store Locator */}
          {shop.website && (
            <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 shrink-0 text-espresso-400 sm:h-5 sm:w-5" />
                    <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">
                      {chain ? "Store Locator" : "Visit Website"}
                    </h2>
                  </div>
                  <p className="mt-1 truncate text-xs text-espresso-500 sm:text-sm">
                    {shop.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </p>
                </div>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 px-5 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-800 sm:w-auto"
                >
                  {chain ? "Find a Store" : "Visit Website"}
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          )}

          {/* Directions */}
          <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-espresso-400 sm:h-5 sm:w-5" />
              <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">Get Directions</h2>
            </div>
            <p className="mt-2 text-xs text-espresso-500 sm:text-sm">{shop.address}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={`https://maps.apple.com/?daddr=${shop.lat},${shop.lng}&dirflg=d`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#007AFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0066d6] sm:w-auto"
              >
                <Image src="/applemaps.png" alt="Apple Maps" width={20} height={20} className="rounded-sm" />
                Apple Maps
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}&destination_place_id=${shop.googlePlaceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#EA4335] bg-white px-5 py-3 text-sm font-semibold text-[#EA4335] transition hover:bg-red-50 sm:w-auto"
              >
                <Image src="/googlemaps.png" alt="Google Maps" width={20} height={20} className="rounded-sm" />
                Google Maps
              </a>
            </div>
          </div>

          {/* Crowd breakdown */}
          <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
            <h2 className="font-display text-xl text-espresso-900 sm:text-2xl">How the crowd estimate works</h2>
            <p className="mt-3 text-sm text-espresso-600 sm:mt-4 sm:text-base">
              Score blends weather, traffic, time-of-day, and day-of-week signals into a 0–100 busyness estimate.
              {(insight.breakdown.rawInputs.bestTimeUsed as boolean | undefined) && (
                <> Time signal is sourced from <span className="font-semibold text-espresso-800">real historical foot traffic data</span> (BestTime.app) for this specific hour and day.</>
              )}
              {insight.waitMinutes && (
                <> The <span className="font-semibold text-espresso-800">{insight.waitMinutes.label}</span> wait estimate is derived from that score plus the current time-of-day — rush hours extend the range.</>
              )}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Traffic factor",  value: insight.breakdown.trafficScore },
                { label: "Weather factor",  value: insight.breakdown.weatherScore },
                {
                  label: insight.breakdown.rawInputs.bestTimeUsed ? "Popular times" : "Time factor",
                  value: insight.breakdown.timeScore
                },
                { label: "Day factor",      value: insight.breakdown.dayScore }
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-crema p-4 sm:rounded-3xl sm:p-5">
                  <p className="text-xs text-espresso-500 sm:text-sm">{label}</p>
                  <p className="mt-1.5 text-2xl font-semibold text-espresso-900 sm:mt-2 sm:text-2xl">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className="space-y-5 sm:space-y-6">
          <div className="rounded-2xl border border-espresso-100 bg-[#2b1b0e] p-5 text-crema shadow-panel sm:rounded-[2rem] sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-100/70">Merchant CTA</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl">Own this shop?</h2>
            <p className="mt-3 text-sm leading-7 text-espresso-50/80">
              Claim the listing, submit updates, and unlock future merchant-side analytics and override controls.
            </p>
            <Link
              href="/merchant"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-crema px-5 py-3 text-sm font-semibold text-espresso-900 transition hover:bg-white"
            >
              Start claim flow
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>

          <div className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-panel sm:rounded-[2rem] sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Score sources</p>
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
