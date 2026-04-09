export const appConfig = {
  name: "Caffi3ne",
  description: "Coffee intelligence for consumers, merchants, and developers.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /** Only true if explicitly enabled (emergency local dev). Production uses live data. */
  useMockData: process.env.USE_MOCK_DATA === "true",
  mockBillingEnabled: process.env.MOCK_BILLING_ENABLED === "true"
};
