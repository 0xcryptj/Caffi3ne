export const appConfig = {
  name: "Caffi3ne",
  description: "Coffee intelligence for consumers, merchants, and developers.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  useMockData: process.env.USE_MOCK_DATA !== "false",
  mockBillingEnabled: process.env.MOCK_BILLING_ENABLED !== "false"
};
