import Link from "next/link";
import { Activity, Clock } from "lucide-react";
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

/** Convert a 0–100 crowd score to a compact foot-traffic label */
function trafficLabel(score: number): string {
  if (score < 30) return "Low";
  if (score < 55) return "Moderate";
  if (score < 78) return "High";
  return "Very high";
}

/** Bar fill colour per traffic level */
function trafficColor(score: number): string {
  if (score < 30) return "bg-slate-300";
  if (score < 55) return "bg-emerald-400";
  if (score < 78) return "bg-amber-400";
  return "bg-red-400";
}

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  const { pill } = crowdStyles[shop.insight.label];
  const hours = shop.hours[0]?.replace(/^[A-Za-z]+:\s*/, "") ?? "";
  const score = shop.insight.score;

  return (
    <Link
      href={`/shops/${shop.id}`}
      className={`group flex w-full min-w-0 items-start gap-3 rounded-2xl border border-espresso-100 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-espresso-200 hover:shadow-[0_8px_30px_rgba(38,25,14,0.10)] animate-fade-up sm:p-4 ${shop.isOpenNow === false ? "opacity-60" : ""}`}
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: "both" }}
    >
      <ShopLogo website={shop.website} name={shop.name} />

      <div className="min-w-0 flex-1">
        {/* Name + distance */}
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-espresso-900 transition-colors group-hover:text-espresso-700">
            {shop.name}
          </h3>
          {shop.distanceMiles !== undefined && (
            <span className="shrink-0 text-xs font-medium tabular-nums text-espresso-400">
              {formatDistance(shop.distanceMiles)}
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-espresso-400">{shop.address}</p>

        {/* Status row */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {shop.isOpenNow === false && (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold tracking-wide text-red-600">
              CLOSED
            </span>
          )}
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pill}`}>
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

          {shop.insight.waitMinutes && (
            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs tabular-nums text-espresso-500">
              <Clock className="h-3 w-3 shrink-0" />
              {shop.insight.waitMinutes.label}
            </span>
          )}

          {!shop.insight.waitMinutes && hours && (
            <span className="ml-auto hidden truncate text-xs text-espresso-400 sm:inline">{hours}</span>
          )}
        </div>

        {/* ── Foot traffic bar ─────────────────────────────────────────── */}
        {shop.isOpenNow !== false && (
          <div className="mt-2.5 flex items-center gap-2">
            <Activity className="h-3 w-3 shrink-0 text-espresso-400" />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-espresso-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${trafficColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="w-[54px] shrink-0 text-right text-[10px] font-medium text-espresso-500">
              {trafficLabel(score)} · {score}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
