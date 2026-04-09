import { googleAdSenseAdsTxtLine } from "@/lib/adsense-config";

/**
 * AdSense / ads.txt crawler expects plain text at /ads.txt.
 * https://support.google.com/adsense/answer/7532445
 */
export function GET() {
  const body = `${googleAdSenseAdsTxtLine}\n`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
