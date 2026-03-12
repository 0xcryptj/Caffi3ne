const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For demos, prototypes, and light experimentation.",
    features: ["Mock billing", "Basic nearby shop access", "Light rate limits", "Community support"]
  },
  {
    name: "Pro",
    price: "$99",
    description: "For startups and operators who need higher volume and better controls.",
    features: ["Higher request volume", "Priority support", "Merchant analytics foundation", "Usage-based overages"]
  }
];

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-espresso-500">Pricing</p>
        <h1 className="mt-4 font-display text-5xl text-espresso-900">Simple usage framing for the MVP</h1>
        <p className="mt-4 text-lg leading-8 text-espresso-600">
          Billing is intentionally mocked, but the packaging communicates how Caffi3ne becomes a paid platform.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {tiers.map((tier) => (
          <div key={tier.name} className="rounded-[2rem] border border-espresso-100 bg-white p-8 shadow-panel">
            <p className="text-sm uppercase tracking-[0.3em] text-espresso-500">{tier.name}</p>
            <div className="mt-4 flex items-end gap-2">
              <h2 className="font-display text-5xl text-espresso-900">{tier.price}</h2>
              <span className="pb-2 text-sm text-espresso-500">/ month</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-espresso-600">{tier.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-espresso-700">
              {tier.features.map((feature) => (
                <li key={feature} className="rounded-2xl bg-crema px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
