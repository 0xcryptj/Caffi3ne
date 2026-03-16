import { MerchantForm } from "@/components/merchant-form";
import { SectionHeading } from "@/components/section-heading";

export default function MerchantPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Merchant Portal"
            title="Submit a missing shop or claim an existing listing"
            description="Capture operator demand early. This workflow is designed for a business-school demo while staying structurally ready for real review operations."
          />
          <div className="rounded-[2rem] border border-espresso-100 bg-[#2b1b0e] p-5 text-crema shadow-panel sm:p-8">
            <p className="text-sm leading-8 text-espresso-50/80">
              Claim verification, approval queues, and merchant analytics are simplified for MVP use. The submission schema and API contract are already in place for Supabase-backed persistence.
            </p>
          </div>
        </div>
        <MerchantForm />
      </div>
    </section>
  );
}
