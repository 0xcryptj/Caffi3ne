import { NextResponse } from "next/server";

const MIN_QUERY_LEN = 2;

/**
 * Global place autocomplete (cities, postal codes, addresses). No country restriction.
 * Requires Google Cloud: Places API (Place Autocomplete) enabled on GOOGLE_API_KEY.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const lang = searchParams.get("lang")?.trim();

  if (q.length < MIN_QUERY_LEN) {
    return NextResponse.json({ predictions: [] as AutocompleteItem[] });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Places not configured" }, { status: 503 });
  }

  try {
    let url =
      "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
      `input=${encodeURIComponent(q)}&types=geocode&key=${encodeURIComponent(apiKey)}`;
    if (lang) url += `&language=${encodeURIComponent(lang)}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as {
      status: string;
      predictions?: Array<{
        description: string;
        place_id: string;
        structured_formatting?: {
          main_text: string;
          secondary_text?: string;
        };
      }>;
      error_message?: string;
    };

    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] });
    }

    if (data.status !== "OK") {
      console.error("places autocomplete:", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message ?? data.status },
        { status: data.status === "REQUEST_DENIED" ? 403 : 502 }
      );
    }

    const predictions: AutocompleteItem[] = (data.predictions ?? []).map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? ""
    }));

    return NextResponse.json({ predictions });
  } catch (e) {
    console.error("places autocomplete fetch:", e);
    return NextResponse.json({ error: "Autocomplete failed" }, { status: 500 });
  }
}

export type AutocompleteItem = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};
