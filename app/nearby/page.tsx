import { NearbyDashboard } from "@/components/nearby-dashboard";

export default function NearbyPage() {
  return (
    <section className="mx-auto min-w-0 max-w-7xl overflow-x-hidden py-6 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <NearbyDashboard initialShops={[]} />
    </section>
  );
}
