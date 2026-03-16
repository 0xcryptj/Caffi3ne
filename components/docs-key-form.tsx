"use client";

import { useState } from "react";
import { Check, Copy, Key, Loader2 } from "lucide-react";

export function ApiKeyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, tier: "demo" })
      });
      const data = (await res.json()) as { key?: string; error?: string };
      if (!res.ok || !data.key) throw new Error(data.error ?? "Failed to issue key");
      setIssued(data.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!issued) return;
    navigator.clipboard.writeText(issued).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (issued) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-2 text-emerald-700">
          <Check className="h-4 w-4" />
          <span className="text-sm font-semibold">Your API key is ready</span>
        </div>
        <p className="mt-1 text-xs text-emerald-600">
          Copy and store it now — it won&apos;t be shown again.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-mono text-espresso-800">
            {issued}
          </code>
          <button
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-xs text-emerald-600">
          Pass it as a header: <code className="font-mono">x-api-key: {issued.slice(0, 18)}…</code>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-espresso-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-espresso-800">
        <Key className="h-4 w-4" />
        <span className="text-sm font-semibold">Get a demo API key</span>
      </div>
      <p className="mt-1 text-xs text-espresso-500">No credit card needed. Key enforcement ships with account auth.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-espresso-600">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            required
            className="w-full rounded-xl border border-espresso-200 bg-espresso-50 px-3 py-2 text-sm outline-none focus:border-espresso-400 focus:ring-2 focus:ring-espresso-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-espresso-600">Work email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            required
            className="w-full rounded-xl border border-espresso-200 bg-espresso-50 px-3 py-2 text-sm outline-none focus:border-espresso-400 focus:ring-2 focus:ring-espresso-100"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name || !email}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 px-5 py-2.5 text-sm font-semibold text-crema transition hover:bg-espresso-800 disabled:opacity-50 sm:w-auto"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
        {loading ? "Generating…" : "Generate Key"}
      </button>
    </form>
  );
}
