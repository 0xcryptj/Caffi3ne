import Link from "next/link";
import type { BusynessLabel, ShopWithInsight } from "@/lib/types";
import { formatDistance, formatScore } from "@/lib/utils";
import { ShopLogo } from "@/components/shop-logo";
import { CrowdBar } from "@/components/crowd-bar";

const crowdStyles: Record<BusynessLabel, { pill: string }> = {
  "Below Average":     { pill: "bg-slate-100 text-slate-600" },
  "Average":           { pill: "bg-emerald-50 text-emerald-700" },
  "Busier Than Usual": { pill: "bg-amber-50 text-amber-700" },
  "Packed":            { pill: "bg-red-50 text-red-700" }
};

interface ShopCardProps {
  shop: ShopWithInsight;
  index?: number;
}

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  const { pill } = crowdStyles[shop.insight.label];
  const hours = shop.hours[0]?.replace(/^[A-Za-z]+:\s*/, "") ?? "";

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group flex items-start gap-3 rounded-2xl border border-espresso-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-200 hover:shadow-[0_8px_30px_rgba(38,25,14,0.10)] animate-fade-up sm:p-5"
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: "both" }}
    >
      <ShopLogo website={shop.website} name={shop.name} />

      <div className="min-w-0 flex-1">
        {/* Name + distance */}
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-espresso-900 transition-colors group-hover:text-espresso-700 sm:text-base">
            {shop.name}
          </h3>
          {shop.distanceMiles !== undefined && (
            <span className="shrink-0 text-xs font-medium tabular-nums text-espresso-400 sm:text-sm">
              {formatDistance(shop.distanceMiles)}
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-espresso-400 sm:text-sm">{shop.address}</p>

        {/* Status row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 ${pill}`}>
            <CrowdBar label={shop.insight.label} score={shop.insight.score} />
            {shop.insight.label}
          </span>

          <span className="text-xs tabular-nums text-espresso-700">
            <span className="font-semibold">{formatScore(shop.insight.score)}</span>
            <span className="text-espresso-400">/100</span>
          </span>

          {shop.rating > 0 && (
            <span className="text-xs text-espresso-600">
              {shop.rating}
              <span className="ml-1 text-espresso-400">· {shop.userRatingsTotal.toLocaleString()}</span>
            </span>
          )}

          {hours && (
            <span className="ml-auto hidden truncate text-xs text-espresso-400 sm:inline">{hours}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
