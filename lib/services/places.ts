import { getMockShopById, getMockShops } from "@/lib/data/mock-shops";
import { externalServicesConfig, hasGoogleApiKey } from "@/lib/services/config";
import type { NearbySearchParams, PriceLevel, Shop } from "@/lib/types";

const PLACES_NEW_BASE = "https://places.googleapis.com/v1/places";

interface PlacesProvider {
  getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]>;
  getCoffeeShopById(id: string): Promise<Shop | undefined>;
}

interface PlacesNewPlace {
  name?: string; // resource name: "places/ChIJ..."
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  types?: string[];
  businessStatus?: string;
  priceLevel?: string;
  photos?: { name?: string }[];
  editorialSummary?: { text?: string };
}

function milesFromCoordinates(originLat: number, originLng: number, lat: number, lng: number) {
  return Math.hypot(originLat - lat, originLng - lng) * 48;
}

function normalizePriceLevel(raw?: string): PriceLevel | undefined {
  const map: Record<string, PriceLevel> = {
    PRICE_LEVEL_FREE: "FREE",
    PRICE_LEVEL_INEXPENSIVE: "INEXPENSIVE",
    PRICE_LEVEL_MODERATE: "MODERATE",
    PRICE_LEVEL_EXPENSIVE: "EXPENSIVE",
    PRICE_LEVEL_VERY_EXPENSIVE: "VERY_EXPENSIVE"
  };
  return raw ? map[raw] : undefined;
}

function normalizePlacesNewResult(place: PlacesNewPlace, origin?: NearbySearchParams): Shop | null {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const id = place.id;
  const name = place.displayName?.text;

  if (lat === undefined || lng === undefined || !id || !name) {
    return null;
  }

  return {
    id,
    googlePlaceId: id,
    name,
    address: place.formattedAddress ?? "Address unavailable",
    lat,
    lng,
    rating: place.rating ?? 0,
    userRatingsTotal: place.userRatingCount ?? 0,
    website: place.websiteUri,
    phone: place.nationalPhoneNumber,
    // Prefer currentOpeningHours (reflects holidays/special days) over regularOpeningHours
    hours: (place.currentOpeningHours?.weekdayDescriptions ?? place.regularOpeningHours?.weekdayDescriptions) ?? (place.regularOpeningHours?.openNow ? ["Open now"] : ["Hours unavailable"]),
    distanceMiles: origin ? milesFromCoordinates(origin.lat, origin.lng, lat, lng) : undefined,
    tags: (place.types ?? []).slice(0, 3),
    priceLevel: normalizePriceLevel(place.priceLevel),
    photos: (place.photos ?? []).map((p) => p.name).filter((n): n is string => Boolean(n)).slice(0, 5),
    editorialSummary: place.editorialSummary?.text,
    source: "google"
  };
}

class MockPlacesProvider implements PlacesProvider {
  async getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]> {
    return getMockShops().map((shop) => ({
      ...shop,
      distanceMiles: milesFromCoordinates(params.lat, params.lng, shop.lat, shop.lng),
      source: "mock"
    }));
  }

  async getCoffeeShopById(id: string): Promise<Shop | undefined> {
    const shop = getMockShopById(id);
    return shop ? { ...shop, source: "mock" } : undefined;
  }
}

class GooglePlacesProvider implements PlacesProvider {
  private get apiKey() {
    return externalServicesConfig.googleApiKey ?? "";
  }

  private readonly fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.regularOpeningHours",
    "places.types",
    "places.businessStatus",
    "places.priceLevel",
    "places.photos",
    "places.websiteUri",
    "places.nationalPhoneNumber"
  ].join(",");

  /** Single Places API call for one circle. Returns up to 20 results. */
  private async searchCircle(
    lat: number,
    lng: number,
    radius: number,
    origin: NearbySearchParams
  ): Promise<Shop[]> {
    const body = {
      includedTypes: ["cafe", "coffee_shop"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: Math.min(radius, 50000)
        }
      },
      rankPreference: "DISTANCE"
    };

    try {
      const response = await fetch(`${PLACES_NEW_BASE}:searchNearby`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.apiKey,
          "X-Goog-FieldMask": this.fieldMask
        },
        body: JSON.stringify(body),
        next: { revalidate: 300 }
      });
      if (!response.ok) return [];
      const payload = (await response.json()) as { places?: PlacesNewPlace[] };
      return (payload.places ?? [])
        .map((p) => normalizePlacesNewResult(p, origin))
        .filter((shop): shop is Shop => shop !== null);
    } catch {
      return [];
    }
  }

  async getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]> {
    // Places API (New) caps at 20 results per call.
    // For large radii we tile with 5 overlapping circles (center + 4 cardinal offsets)
    // so we can surface up to ~60-80 unique shops.
    const SUB_RADIUS = 3000; // 3 km — keeps multi-search active for city-scale radii

    let centers: [number, number][];

    if (params.radius <= SUB_RADIUS) {
      centers = [[params.lat, params.lng]];
    } else {
      // 3×3 grid (9 circles): center + 8 compass positions
      // Offset ≈ 45% of requested radius, converted to degrees
      const mPerDegLat = 111_000;
      const mPerDegLng = 111_000 * Math.cos((params.lat * Math.PI) / 180);
      const offsetLat = (params.radius * 0.45) / mPerDegLat;
      const offsetLng = (params.radius * 0.45) / mPerDegLng;

      centers = [
        [params.lat,             params.lng            ], // center
        [params.lat + offsetLat, params.lng            ], // N
        [params.lat - offsetLat, params.lng            ], // S
        [params.lat,             params.lng + offsetLng], // E
        [params.lat,             params.lng - offsetLng], // W
        [params.lat + offsetLat, params.lng + offsetLng], // NE
        [params.lat + offsetLat, params.lng - offsetLng], // NW
        [params.lat - offsetLat, params.lng + offsetLng], // SE
        [params.lat - offsetLat, params.lng - offsetLng], // SW
      ];
    }

    const subRadius = params.radius <= SUB_RADIUS
      ? params.radius
      : Math.min(params.radius * 0.6, 50_000);

    const batches = await Promise.all(
      centers.map(([lat, lng]) => this.searchCircle(lat, lng, subRadius, params))
    );

    // Deduplicate by place ID and filter to the true requested radius
    const seen = new Set<string>();
    const results: Shop[] = [];
    const mPerDegLat = 111_000;
    const mPerDegLng = 111_000 * Math.cos((params.lat * Math.PI) / 180);

    for (const batch of batches) {
      for (const shop of batch) {
        if (seen.has(shop.id)) continue;
        seen.add(shop.id);

        // Distance check — keep only shops inside the original requested circle
        const distM = Math.hypot(
          (shop.lat - params.lat) * mPerDegLat,
          (shop.lng - params.lng) * mPerDegLng
        );
        if (distM <= params.radius) results.push(shop);
      }
    }

    // Sort by distance ascending
    return results.sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
  }

  async getCoffeeShopById(id: string): Promise<Shop | undefined> {
    const fieldMask = [
      "id",
      "displayName",
      "formattedAddress",
      "location",
      "rating",
      "userRatingCount",
      "websiteUri",
      "nationalPhoneNumber",
      "regularOpeningHours",
      "currentOpeningHours",
      "types",
      "priceLevel",
      "photos",
      "editorialSummary"
    ].join(",");

    const response = await fetch(`${PLACES_NEW_BASE}/${id}`, {
      headers: {
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": fieldMask
      },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      return undefined;
    }

    const place = (await response.json()) as PlacesNewPlace;
    return normalizePlacesNewResult(place) ?? undefined;
  }
}

function getPlacesProvider(): PlacesProvider {
  if (externalServicesConfig.useMockData || !hasGoogleApiKey()) {
    return new MockPlacesProvider();
  }
  return new GooglePlacesProvider();
}

export async function getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]> {
  return getPlacesProvider().getNearbyCoffeeShops(params);
}

export async function getCoffeeShopById(id: string): Promise<Shop | undefined> {
  return getPlacesProvider().getCoffeeShopById(id);
}
