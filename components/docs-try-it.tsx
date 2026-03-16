"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";

export interface TryItParam {
  name: string;
  label: string;
  defaultValue: string;
  description?: string;
  type?: "text" | "number";
}

interface TryItProps {
  method?: "GET" | "POST";
  endpoint: string;
  params?: TryItParam[];
  body?: Record<string, unknown>;
}

export function TryIt({ method = "GET", endpoint, params = [], body }: TryItProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(params.map((p) => [p.name, p.defaultValue]))
  );
  const [result, setResult] = useState<unknown>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus(null);
    try {
      let url = endpoint;
      if (method === "GET" && params.length > 0) {
        const qs = new URLSearchParams();
        params.forEach((p) => { if (values[p.name]) qs.set(p.name, values[p.name]); });
        url = `${endpoint}?${qs.toString()}`;
      }
      const fetchOpts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", "x-api-key": "demo" }
      };
      if (method === "POST") fetchOpts.body = JSON.stringify(body ?? values);

      const res = await fetch(url, fetchOpts);
      setStatus(res.status);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const statusColor =
    !status ? "" :
    status < 300 ? "text-emerald-600 bg-emerald-50" :
    status < 500 ? "text-amber-700 bg-amber-50" :
    "text-red-700 bg-red-50";

  return (
    <div className="rounded-2xl border border-espresso-100 bg-espresso-50/50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-espresso-800 px-2 py-0.5 text-[10px] font-bold tracking-wider text-crema">
          {method}
        </span>
        <code className="text-xs text-espresso-700">{endpoint}</code>
      </div>

      {params.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {params.map((p) => (
            <div key={p.name}>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                {p.label}
                {p.description && (
                  <span className="ml-1 font-normal text-espresso-400">— {p.description}</span>
                )}
              </label>
              <input
                type={p.type ?? "text"}
                value={values[p.name]}
                onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                placeholder={p.defaultValue}
                className="w-full rounded-xl border border-espresso-200 bg-white px-3 py-2 text-sm text-espresso-900 placeholder-espresso-300 outline-none focus:border-espresso-400 focus:ring-2 focus:ring-espresso-100"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-4 py-2 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {loading ? "Running…" : "Send Request"}
      </button>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {result !== null && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-espresso-500">Response</span>
            {status && (
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${statusColor}`}>
                {status}
              </span>
            )}
          </div>
          <pre className="max-h-72 overflow-auto rounded-xl bg-[#160e06] p-4 text-xs leading-5 text-amber-50">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
