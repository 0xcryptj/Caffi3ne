export const externalServicesConfig = {
  googleApiKey: process.env.GOOGLE_API_KEY,
  tomorrowApiKey: process.env.TOMORROW_IO_API_KEY,
  tomtomApiKey: process.env.TOMTOM_API_KEY,
  useMockData: process.env.USE_MOCK_DATA !== "false",
  google: {
    mapsJavaScriptApiUrl: "https://maps.googleapis.com/maps/api/js"
  }
} as const;

export function hasGoogleApiKey() {
  return Boolean(externalServicesConfig.googleApiKey);
}
