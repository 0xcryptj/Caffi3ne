import { NearbyDashboard } from "@/components/nearby-dashboard";

export default function NearbyPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <NearbyDashboard initialShops={[]} />
    </section>
  );
}
