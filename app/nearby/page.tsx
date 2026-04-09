import { NearbyDashboard } from "@/components/nearby-dashboard";

export default function NearbyPage() {
  return (
    <section className="mx-auto min-w-0 max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <NearbyDashboard initialShops={[]} />
    </section>
  );
}
