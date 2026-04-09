import Link from "next/link";
import { MerchantForm } from "@/components/merchant-form";
import { SectionHeading } from "@/components/section-heading";

export default function MerchantPage() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="pointer-events-none grid select-none gap-8 opacity-40 grayscale lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Merchant Portal"
            title="Submit a missing shop or claim an existing listing"
            description="Tell us about a shop we are missing or prove you operate an existing listing. We review every submission and follow up by email."
          />
          <div className="rounded-[2rem] border border-espresso-100 bg-[#2b1b0e] p-5 text-crema shadow-panel sm:p-8">
            <p className="text-sm leading-8 text-espresso-50/80">
              Verification and approvals are handled by our team. Submissions will be stored in Supabase when this flow opens publicly.
            </p>
          </div>
        </div>
        <MerchantForm />
      </div>

      <div className="pointer-events-auto absolute inset-0 z-30 flex items-start justify-center bg-canvas/50 px-4 pt-12 backdrop-blur-sm sm:pt-20">
        <div className="max-w-md rounded-2xl border border-espresso-200 bg-white p-8 text-center shadow-panel">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-espresso-400">Merchant submissions</p>
          <h2 className="mt-3 font-display text-2xl text-espresso-900 sm:text-3xl">Coming soon</h2>
          <p className="mt-3 text-sm leading-7 text-espresso-600">
            Listing submissions and claims are not open yet. The backend route is ready for when we enable it; you will use the same form here.
          </p>
          <Link
            href="/nearby"
            className="mt-6 inline-flex rounded-full bg-espresso-800 px-5 py-2.5 text-sm font-semibold text-crema transition hover:bg-espresso-900"
          >
            Explore nearby shops
          </Link>
        </div>
      </div>
    </section>
  );
}
