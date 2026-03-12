import Link from "next/link";
import { Clock3, MapPin, Star, Users } from "lucide-react";
import type { ShopWithInsight } from "@/lib/types";
import { formatDistance, formatScore } from "@/lib/utils";

interface ShopCardProps {
  shop: ShopWithInsight;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="block rounded-3xl border border-espresso-100 bg-white p-5 shadow-panel transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-espresso-900">{shop.name}</h3>
          <p className="mt-1 text-sm text-espresso-500">{shop.address}</p>
        </div>
        <span className="rounded-full bg-espresso-50 px-3 py-1 text-xs font-medium text-espresso-700">
          {formatDistance(shop.distanceMiles)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-espresso-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <span>
            {shop.rating} rating ({shop.userRatingsTotal.toLocaleString()} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-espresso-500" />
          <span>{shop.hours[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-espresso-500" />
          <span>
            {shop.insight.label} ({formatScore(shop.insight.score)}/100)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-espresso-500" />
          <span>{shop.tags.join(" • ")}</span>
        </div>
      </div>
    </Link>
  );
}
