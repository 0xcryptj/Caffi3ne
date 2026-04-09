/** Google AdSense publisher client id (public, safe in HTML). */
export const googleAdSenseClientId =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID?.trim() || "ca-pub-7335312097731274";

/** Exact loader URL (matches Google's site snippet). */
export const googleAdSenseLoaderSrcExact =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7335312097731274";

/** Single ads.txt record line for this publisher. */
export const googleAdSenseAdsTxtLine =
  "google.com, pub-7335312097731274, DIRECT, f08c47fec0942fa0";
