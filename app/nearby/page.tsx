import { NearbyDashboard } from "@/components/nearby-dashboard";
import { getMockShopsWithInsights } from "@/lib/data/mock-shops";

export default function NearbyPage() {
  const shops = getMockShopsWithInsights();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <NearbyDashboard initialShops={shops} />
    </section>
  );
}
