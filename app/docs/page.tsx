import { SectionHeading } from "@/components/section-heading";

const endpoints = [
  "GET /api/shops/nearby?lat=...&lng=...&radius=...",
  "GET /api/shops/:id",
  "GET /api/shops/:id/insights",
  "POST /api/merchant-submissions",
  "GET /api/docs/example-response",
  "GET /api/health"
];

const exampleResponse = `{
  "data": [
    {
      "id": "brooklyn-roast-lab",
      "name": "Brooklyn Roast Lab",
      "address": "214 Wythe Ave, Brooklyn, NY",
      "rating": 4.7,
      "insight": {
        "score": 71,
        "label": "Busier Than Usual"
      }
    }
  ],
  "meta": {
    "generatedAt": "2026-03-12T14:30:00.000Z",
    "mockMode": true
  }
}`;

const curlExample = `curl "${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/shops/nearby?lat=40.73061&lng=-73.935242&radius=2500" \\
  -H "x-api-key: demo_key"`;

const jsExample = `const response = await fetch("/api/shops/nearby?lat=40.73061&lng=-73.935242&radius=2500", {
  headers: { "x-api-key": "demo_key" }
});

const payload = await response.json();`;

const pythonExample = `import requests

response = requests.get(
    "http://localhost:3000/api/shops/nearby",
    params={"lat": 40.73061, "lng": -73.935242, "radius": 2500},
    headers={"x-api-key": "demo_key"},
)

print(response.json())`;

export default function DocsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Developer Docs"
        title="Coffee intelligence API"
        description="The MVP API is designed as a clean, demo-friendly developer product. Authentication and billing are placeholders today, but the contracts are already visible."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-espresso-900">Overview</h2>
            <p className="mt-3 text-sm leading-7 text-espresso-600">
              Caffi3ne exposes shop metadata and crowd intelligence for nearby discovery, detail views, and merchant workflows.
            </p>
          </div>

          <div className="rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-espresso-900">Authentication</h2>
            <p className="mt-3 text-sm leading-7 text-espresso-600">
              Placeholder for API key authentication via `x-api-key`. Real billing and enforcement can be added later using `api_keys` and `usage_events`.
            </p>
          </div>

          <div className="rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-espresso-900">Rate limits</h2>
            <p className="mt-3 text-sm leading-7 text-espresso-600">
              Placeholder tiering: Free tier for light experimentation, Pro tier for production and higher request volume.
            </p>
          </div>

          <div className="rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
            <h2 className="text-xl font-semibold text-espresso-900">Endpoints</h2>
            <ul className="mt-4 space-y-3 text-sm text-espresso-700">
              {endpoints.map((endpoint) => (
                <li key={endpoint} className="rounded-2xl bg-crema px-4 py-3">
                  {endpoint}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <CodeBlock title="Example JSON response" code={exampleResponse} />
          <CodeBlock title="curl" code={curlExample} />
          <CodeBlock title="JavaScript fetch" code={jsExample} />
          <CodeBlock title="Python requests" code={pythonExample} />
        </div>
      </div>
    </section>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-[2rem] border border-espresso-100 bg-[#1f140b] p-6 shadow-panel">
      <p className="text-sm font-semibold text-crema">{title}</p>
      <pre className="mt-4 overflow-x-auto text-sm leading-7 text-amber-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
