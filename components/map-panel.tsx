import type { ShopWithInsight } from "@/lib/types";

interface MapPanelProps {
  shops: ShopWithInsight[];
}

export function MapPanel({ shops }: MapPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-espresso-100 bg-[#efe5d5] p-6 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(112,66,33,0.12),transparent_25%),radial-gradient(circle_at_85%_55%,rgba(150,162,139,0.2),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.4),transparent)]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-espresso-500">Map View</p>
            <h3 className="font-display text-2xl text-espresso-900">Coffee density snapshot</h3>
          </div>
          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-espresso-700">
            Google Maps-ready mock panel
          </div>
        </div>

        <div className="grid min-h-[420px] place-items-center rounded-[1.5rem] border border-white/80 bg-white/35">
          <div className="relative h-[320px] w-full max-w-xl">
            {shops.map((shop, index) => (
              <div
                key={shop.id}
                className="absolute"
                style={{
                  left: `${18 + index * 24}%`,
                  top: `${20 + (index % 2) * 26}%`
                }}
              >
                <div className="rounded-full bg-espresso-700 px-3 py-2 text-xs font-semibold text-crema shadow-lg">
                  {shop.name}
                </div>
                <div className="mx-auto h-4 w-1 rounded-full bg-espresso-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
