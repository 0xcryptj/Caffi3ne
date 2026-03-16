import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");

  if (!name || !name.startsWith("places/")) {
    return new Response("Invalid photo name", { status: 400 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return new Response("Not configured", { status: 503 });

  const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=800&maxWidthPx=1200&key=${apiKey}&skipHttpRedirect=true`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return new Response("Photo not found", { status: 404 });

    const data = (await res.json()) as { photoUri?: string };
    if (!data.photoUri) return new Response("No URI", { status: 404 });

    return Response.redirect(data.photoUri, 302);
  } catch {
    return new Response("Fetch failed", { status: 502 });
  }
}
