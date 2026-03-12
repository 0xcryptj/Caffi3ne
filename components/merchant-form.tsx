"use client";

import { type FormEvent, useState } from "react";

const initialState = {
  submittedName: "",
  submittedAddress: "",
  website: "",
  contactEmail: "",
  notes: "",
  submissionType: "missing_shop"
};

export function MerchantForm() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/merchant-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setForm(initialState);
      setMessage("Submission received. The review queue is mocked for MVP, but the payload is valid.");
    } catch {
      setMessage("Submission failed. Check the API route or keep mock mode enabled.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-espresso-100 bg-white p-6 shadow-panel">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-espresso-700">
          <span>Submission type</span>
          <select
            value={form.submissionType}
            onChange={(event) => setForm((current) => ({ ...current, submissionType: event.target.value }))}
            className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
          >
            <option value="missing_shop">Submit missing coffee shop</option>
            <option value="claim_shop">Claim existing coffee shop</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-espresso-700">
          <span>Contact email</span>
          <input
            required
            type="email"
            value={form.contactEmail}
            onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
            className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
            placeholder="owner@shop.com"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-espresso-700">
          <span>Shop name</span>
          <input
            required
            value={form.submittedName}
            onChange={(event) => setForm((current) => ({ ...current, submittedName: event.target.value }))}
            className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
            placeholder="Cedar Street Coffee"
          />
        </label>

        <label className="space-y-2 text-sm text-espresso-700">
          <span>Website</span>
          <input
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
            className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-espresso-700">
        <span>Address</span>
        <input
          required
          value={form.submittedAddress}
          onChange={(event) => setForm((current) => ({ ...current, submittedAddress: event.target.value }))}
          className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
          placeholder="123 Main St, Brooklyn, NY"
        />
      </label>

      <label className="space-y-2 text-sm text-espresso-700">
        <span>Notes</span>
        <textarea
          rows={5}
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          className="w-full rounded-2xl border border-espresso-200 bg-crema px-4 py-3 outline-none"
          placeholder="Tell us about your shop, operations, or why this listing should be claimed."
        />
      </label>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-espresso-500">Claims, approvals, and billing are intentionally mocked for MVP demos.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-espresso-800 px-5 py-3 text-sm font-semibold text-crema transition hover:bg-espresso-900 disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      {message ? <p className="text-sm text-espresso-700">{message}</p> : null}
    </form>
  );
}
