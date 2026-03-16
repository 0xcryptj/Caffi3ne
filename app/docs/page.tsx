import Link from "next/link";
import { BookOpen, Code2, Key, Layers, Zap } from "lucide-react";
import { CodeBlock } from "@/components/docs-code";
import { TryIt } from "@/components/docs-try-it";
import { ApiKeyForm } from "@/components/docs-key-form";

// ─── Static code examples ─────────────────────────────────────────────────────

const nearbyExamples = [
  {
    label: "curl",
    code: `curl "https://your-domain.com/api/shops/nearby?lat=32.7765&lng=-79.9311&radius=8000" \\
  -H "x-api-key: caff_demo_YOUR_KEY"`
  },
  {
    label: "JS",
    code: `const res = await fetch(
  "/api/shops/nearby?lat=32.7765&lng=-79.9311&radius=8000",
  { headers: { "x-api-key": "caff_demo_YOUR_KEY" } }
);
const { data } = await res.json();
// data is ShopWithInsight[]`
  },
  {
    label: "Python",
    code: `import requests

r = requests.get(
    "https://your-domain.com/api/shops/nearby",
    params={"lat": 32.7765, "lng": -79.9311, "radius": 8000},
    headers={"x-api-key": "caff_demo_YOUR_KEY"},
)
print(r.json())`
  }
];

const shopExamples = [
  {
    label: "curl",
    code: `curl "https://your-domain.com/api/shops/ChIJ_PLACE_ID" \\
  -H "x-api-key: caff_demo_YOUR_KEY"`
  },
  {
    label: "JS",
    code: `const res = await fetch("/api/shops/ChIJ_PLACE_ID", {
  headers: { "x-api-key": "caff_demo_YOUR_KEY" }
});
const shop = await res.json();`
  },
  {
    label: "Python",
    code: `r = requests.get(
    "https://your-domain.com/api/shops/ChIJ_PLACE_ID",
    headers={"x-api-key": "caff_demo_YOUR_KEY"},
)
print(r.json())`
  }
];

const insightsExamples = [
  {
    label: "curl",
    code: `curl "https://your-domain.com/api/shops/ChIJ_PLACE_ID/insights" \\
  -H "x-api-key: caff_demo_YOUR_KEY"`
  },
  {
    label: "JS",
    code: `const res = await fetch("/api/shops/ChIJ_PLACE_ID/insights", {
  headers: { "x-api-key": "caff_demo_YOUR_KEY" }
});
const { score, label, breakdown } = await res.json();`
  },
  {
    label: "Python",
    code: `r = requests.get(
    f"https://your-domain.com/api/shops/{place_id}/insights",
    headers={"x-api-key": "caff_demo_YOUR_KEY"},
)
insight = r.json()`
  }
];

const nearbyResponseExample = `{
  "data": [
    {
      "id": "ChIJxxxxxxxxxxxxxxx",
      "name": "Kudu Coffee & Craft Beer",
      "address": "4 Vanderhorst St, Charleston, SC",
      "lat": 32.776,
      "lng": -79.938,
      "rating": 4.6,
      "userRatingsTotal": 1204,
      "distanceMiles": 0.4,
      "insight": {
        "score": 73,
        "label": "Busier Than Usual",
        "updatedAt": "2026-03-14T15:30:00.000Z"
      }
    }
  ],
  "meta": { "lat": 32.7765, "lng": -79.9311, "radius": 8000, "mockMode": false }
}`;

const insightSchemaExample = `{
  "score": 73,
  "label": "Busier Than Usual",
  "breakdown": {
    "weatherScore": 61,
    "trafficScore": 78,
    "timeScore": 82,
    "dayScore": 64,
    "eventScore": 0,
    "rawInputs": { "temperatureF": 68, "precipProbability": 0.05 }
  },
  "explanation": [
    "Traffic near this location is above average for the time of day.",
    "Current weather (partly cloudy, 68°F) slightly favours indoor café visits.",
    "Saturday afternoon is historically a peak period."
  ],
  "updatedAt": "2026-03-14T15:30:00.000Z"
}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: "API Docs" };

const navItems = [
  { id: "overview",        label: "Overview",        icon: BookOpen, indent: false },
  { id: "quickstart",      label: "Quick Start",     icon: Zap,      indent: false },
  { id: "authentication",  label: "Authentication",  icon: Key,      indent: false },
  { id: "endpoints",       label: "Endpoints",       icon: Layers,   indent: false },
  { id: "nearby",          label: "GET /nearby",     icon: null,     indent: true  },
  { id: "shop-detail",     label: "GET /shops/:id",  icon: null,     indent: true  },
  { id: "insights",        label: "GET /insights",   icon: null,     indent: true  },
  { id: "health",          label: "GET /health",     icon: null,     indent: true  },
  { id: "rate-limits",     label: "Rate Limits",     icon: Code2,    indent: false },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex gap-10 py-8 lg:py-12">

        {/* ── Sticky sidebar ─────────────────────────────────────────── */}
        <aside className="hidden w-48 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-espresso-400">Docs</p>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center gap-2 rounded-lg py-1.5 text-sm transition hover:bg-espresso-50 hover:text-espresso-900 ${
                    item.indent ? "pl-6 text-espresso-400 hover:text-espresso-700" : "px-3 font-medium text-espresso-700"
                  }`}
                >
                  {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0 text-espresso-300" />}
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-espresso-100 pt-4">
              <Link href="/nearby" className="block rounded-lg px-3 py-1.5 text-sm text-espresso-500 transition hover:bg-espresso-50 hover:text-espresso-800">
                ← Try the app
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 space-y-16">

          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-espresso-200 bg-crema px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-espresso-600">
              Developer Platform
            </div>
            <h1 className="font-display text-3xl text-espresso-900 sm:text-4xl lg:text-5xl">
              Coffee Intelligence API
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-espresso-600">
              A clean REST API for discovering nearby coffee shops, fetching rich shop metadata, and querying real-time crowd intelligence. Powered by Google Places and blended weather, traffic, and time-of-day signals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <InfoPill label="Base URL" value="https://your-domain.com" />
              <InfoPill label="Version"  value="v1 (stable)" />
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live · Charleston, SC
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section id="quickstart" className="scroll-mt-24">
            <SectionLabel step="01" title="Quick Start" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { n: "1", title: "Get a key",          body: "Request a free demo key in the Authentication section. No card needed." },
                { n: "2", title: "Send a request",     body: "Pass your key in the x-api-key header. All responses are JSON." },
                { n: "3", title: "Use the data",       body: "Each shop includes coordinates, rating, hours, and a live crowd score." }
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-espresso-900 text-xs font-bold text-crema">{s.n}</div>
                  <h3 className="text-sm font-semibold text-espresso-900">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-espresso-600">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <CodeBlock tabs={nearbyExamples} />
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-24">
            <SectionLabel step="02" title="Authentication & API Keys" />
            <p className="mt-3 max-w-xl text-sm leading-7 text-espresso-600">
              All requests require an <Mono>x-api-key</Mono> header. Demo keys are issued instantly. Full account auth — dashboards, usage graphs, key rotation — is in active development. Keys issued now carry forward.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoPill label="Header"      value="x-api-key" mono />
              <InfoPill label="Demo prefix" value="caff_demo_…" mono />
              <InfoPill label="Pro prefix"  value="caff_pro_…" mono />
            </div>

            <div className="mt-5"><ApiKeyForm /></div>

            <div className="mt-4 rounded-2xl border border-espresso-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-espresso-400">Auth roadmap</p>
              <ul className="space-y-2 text-sm text-espresso-600">
                <RoadmapItem status="green" text="Demo keys work today — rate-limit enforcement ships with account auth" />
                <RoadmapItem status="amber" text="Account sign-up, key dashboard &amp; usage graphs — coming next sprint" />
                <RoadmapItem status="gray"  text="Webhook support, Pro tier enforcement, billing — planned" />
              </ul>
            </div>
          </section>

          {/* Endpoints header */}
          <section id="endpoints" className="scroll-mt-24">
            <SectionLabel step="03" title="Endpoints" />
          </section>

          {/* GET /nearby */}
          <section id="nearby" className="scroll-mt-24 space-y-5">
            <EndpointHeader method="GET" path="/api/shops/nearby" summary="Search coffee shops near coordinates" />
            <p className="text-sm leading-7 text-espresso-600">
              Returns an array of shops within <Mono>radius</Mono> metres of the given coordinates, each enriched with a live crowd insight score.
            </p>
            <ParamsTable params={[
              { name: "lat",    type: "number", req: true,  desc: "Latitude of search origin" },
              { name: "lng",    type: "number", req: true,  desc: "Longitude of search origin" },
              { name: "radius", type: "number", req: false, desc: "Radius in metres. Default: 10000" }
            ]} />
            <TryIt endpoint="/api/shops/nearby" params={[
              { name: "lat",    label: "lat",    defaultValue: "32.7765",  description: "latitude" },
              { name: "lng",    label: "lng",    defaultValue: "-79.9311", description: "longitude" },
              { name: "radius", label: "radius", defaultValue: "5000",     description: "metres" }
            ]} />
            <CodeBlock tabs={nearbyExamples} />
            <CodeBlock title="Example response" code={nearbyResponseExample} />
          </section>

          {/* GET /shops/:id */}
          <section id="shop-detail" className="scroll-mt-24 space-y-5">
            <EndpointHeader method="GET" path="/api/shops/:id" summary="Full shop profile" />
            <p className="text-sm leading-7 text-espresso-600">
              Returns the complete Shop object for a Google Place ID — photos, hours, contact info, editorial summary, and price level.
            </p>
            <ParamsTable params={[
              { name: "id", type: "string", req: true, desc: "Google Place ID from the nearby endpoint (e.g. ChIJ…)" }
            ]} />
            <TryIt endpoint="/api/shops/ChIJl_lBhJYGoYgRe6mGgLdOBGQ" params={[]} />
            <CodeBlock tabs={shopExamples} />
          </section>

          {/* GET /insights */}
          <section id="insights" className="scroll-mt-24 space-y-5">
            <EndpointHeader method="GET" path="/api/shops/:id/insights" summary="Real-time crowd intelligence" />
            <p className="text-sm leading-7 text-espresso-600">
              Returns a busyness score (0–100), a label, and the full signal breakdown. Scores blend weather, traffic, time-of-day, and day-of-week. Refreshes every 60 s.
            </p>
            <ParamsTable params={[
              { name: "id", type: "string", req: true, desc: "Google Place ID" }
            ]} />
            <TryIt endpoint="/api/shops/ChIJl_lBhJYGoYgRe6mGgLdOBGQ/insights" params={[]} />
            <CodeBlock tabs={insightsExamples} />
            <CodeBlock title="Response schema" code={insightSchemaExample} />
          </section>

          {/* GET /health */}
          <section id="health" className="scroll-mt-24 space-y-5">
            <EndpointHeader method="GET" path="/api/health" summary="Service health check" />
            <p className="text-sm leading-7 text-espresso-600">
              Returns service status and timestamp. Useful for uptime monitoring and key validation.
            </p>
            <TryIt endpoint="/api/health" params={[]} />
            <CodeBlock title="curl" code={`curl "https://your-domain.com/api/health" \\\n  -H "x-api-key: caff_demo_YOUR_KEY"`} />
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="scroll-mt-24">
            <SectionLabel step="04" title="Rate Limits" />
            <p className="mt-3 max-w-xl text-sm leading-7 text-espresso-600">
              Rate-limit headers (<Mono>X-RateLimit-Remaining</Mono>, <Mono>X-RateLimit-Reset</Mono>) ship with full account auth.
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-espresso-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-espresso-100 bg-espresso-50">
                  <tr>
                    {["Tier", "Req / min", "Req / day", "Price"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-espresso-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tier: "Demo",       rpm: "20",     rpd: "500",     price: "Free" },
                    { tier: "Pro",        rpm: "200",    rpd: "50,000",  price: "$99 / mo" },
                    { tier: "Enterprise", rpm: "Custom", rpd: "Custom",  price: "Contact us" }
                  ].map((row, i) => (
                    <tr key={row.tier} className={i < 2 ? "border-b border-espresso-50" : ""}>
                      <td className="px-5 py-3.5 font-semibold text-espresso-900">{row.tier}</td>
                      <td className="px-5 py-3.5 tabular-nums text-espresso-600">{row.rpm}</td>
                      <td className="px-5 py-3.5 tabular-nums text-espresso-600">{row.rpd}</td>
                      <td className="px-5 py-3.5 text-espresso-600">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-lg bg-espresso-100 px-2.5 py-1 text-xs font-bold text-espresso-500">{step}</span>
      <h2 className="font-display text-2xl text-espresso-900 sm:text-3xl">{title}</h2>
    </div>
  );
}

function EndpointHeader({ method, path, summary }: { method: string; path: string; summary: string }) {
  const color =
    method === "GET"  ? "bg-emerald-100 text-emerald-700" :
    method === "POST" ? "bg-blue-100 text-blue-700" :
    "bg-espresso-100 text-espresso-700";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${color}`}>{method}</span>
        <code className="font-mono text-sm font-semibold text-espresso-900">{path}</code>
      </div>
      <p className="mt-1 text-sm text-espresso-500">{summary}</p>
    </div>
  );
}

function ParamsTable({ params }: { params: { name: string; type: string; req: boolean; desc: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-espresso-100">
      <table className="w-full text-xs">
        <thead className="border-b border-espresso-100 bg-espresso-50">
          <tr>
            {["Param", "Type", "Req", "Description"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-espresso-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={p.name} className={i < params.length - 1 ? "border-b border-espresso-50" : ""}>
              <td className="px-4 py-2.5"><code className="font-mono text-espresso-800">{p.name}</code></td>
              <td className="px-4 py-2.5 text-espresso-500">{p.type}</td>
              <td className="px-4 py-2.5">{p.req ? <span className="font-bold text-red-500">✱</span> : <span className="text-espresso-300">—</span>}</td>
              <td className="px-4 py-2.5 text-espresso-600">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoPill({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-espresso-100 bg-white px-4 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-espresso-400">{label}</p>
      {mono
        ? <code className="mt-0.5 block text-xs font-mono text-espresso-700">{value}</code>
        : <p className="mt-0.5 text-xs text-espresso-700">{value}</p>
      }
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-espresso-100 px-1.5 py-0.5 text-xs font-mono">{children}</code>;
}

function RoadmapItem({ status, text }: { status: "green" | "amber" | "gray"; text: string }) {
  const dot =
    status === "green" ? "bg-emerald-500" :
    status === "amber" ? "bg-amber-400" :
    "bg-espresso-200";
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span dangerouslySetInnerHTML={{ __html: text }} />
    </li>
  );
}
