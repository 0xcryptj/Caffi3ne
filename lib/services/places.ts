import { getMockShopById, getMockShops } from "@/lib/data/mock-shops";
import { externalServicesConfig, hasGoogleApiKey } from "@/lib/services/config";
import type { NearbySearchParams, Shop } from "@/lib/types";

interface PlacesProvider {
  getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]>;
  getCoffeeShopById(id: string): Promise<Shop | undefined>;
}

interface GooglePlacesNearbyResult {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
  opening_hours?: {
    open_now?: boolean;
  };
  business_status?: string;
  types?: string[];
}

interface GooglePlacesNearbyResponse {
  results?: GooglePlacesNearbyResult[];
  status: string;
  error_message?: string;
}

interface GooglePlaceDetailsResponse {
  result?: {
    place_id: string;
    name: string;
    formatted_address?: string;
    rating?: number;
    user_ratings_total?: number;
    website?: string;
    formatted_phone_number?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
    opening_hours?: {
      weekday_text?: string[];
      open_now?: boolean;
    };
    types?: string[];
  };
  status: string;
  error_message?: string;
}

function milesFromCoordinates(originLat: number, originLng: number, lat: number, lng: number) {
  return Math.hypot(originLat - lat, originLng - lng) * 48;
}

function normalizeGoogleShop(result: GooglePlacesNearbyResult, origin?: NearbySearchParams): Shop | null {
  const lat = result.geometry?.location?.lat;
  const lng = result.geometry?.location?.lng;

  if (lat === undefined || lng === undefined) {
    return null;
  }

  return {
    id: result.place_id,
    googlePlaceId: result.place_id,
    name: result.name,
    address: result.vicinity ?? result.formatted_address ?? "Address unavailable",
    lat,
    lng,
    rating: result.rating ?? 0,
    userRatingsTotal: result.user_ratings_total ?? 0,
    website: undefined,
    phone: undefined,
    hours: result.opening_hours?.open_now ? ["Open now", "Hours via Google Places details"] : ["Hours unavailable"],
    distanceMiles: origin ? milesFromCoordinates(origin.lat, origin.lng, lat, lng) : undefined,
    tags: (result.types ?? []).slice(0, 3),
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
  async getNearbyCoffeeShops(params: NearbySearchParams): Promise<Shop[]> {
    const query = new URLSearchParams({
      location: `${params.lat},${params.lng}`,
      radius: String(params.radius),
      type: "cafe",
      keyword: "coffee",
      key: externalServicesConfig.googleApiKey ?? ""
    });

    const response = await fetch(
      `${externalServicesConfig.google.placesBaseUrl}/nearbysearch/json?${query.toString()}`,
      {
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places nearby search failed with ${response.status}`);
    }

    const payload = (await response.json()) as GooglePlacesNearbyResponse;

    if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
      throw new Error(payload.error_message ?? `Google Places nearby search returned ${payload.status}`);
    }

    return (payload.results ?? [])
      .map((result) => normalizeGoogleShop(result, params))
      .filter((shop): shop is Shop => shop !== null);
  }

  async getCoffeeShopById(id: string): Promise<Shop | undefined> {
    const query = new URLSearchParams({
      place_id: id,
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "rating",
        "user_ratings_total",
        "website",
        "formatted_phone_number",
        "opening_hours",
        "types"
      ].join(","),
      key: externalServicesConfig.googleApiKey ?? ""
    });

    const response = await fetch(
      `${externalServicesConfig.google.placesBaseUrl}/details/json?${query.toString()}`,
      {
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places details failed with ${response.status}`);
    }

    const payload = (await response.json()) as GooglePlaceDetailsResponse;

    if (payload.status !== "OK") {
      return undefined;
    }

    const result = payload.result;
    const lat = result?.geometry?.location?.lat;
    const lng = result?.geometry?.location?.lng;

    if (!result || lat === undefined || lng === undefined) {
      return undefined;
    }

    return {
      id: result.place_id,
      googlePlaceId: result.place_id,
      name: result.name,
      address: result.formatted_address ?? "Address unavailable",
      lat,
      lng,
      rating: result.rating ?? 0,
      userRatingsTotal: result.user_ratings_total ?? 0,
      website: result.website,
      phone: result.formatted_phone_number,
      hours: result.opening_hours?.weekday_text ?? ["Hours unavailable"],
      distanceMiles: undefined,
      tags: (result.types ?? []).slice(0, 3),
      source: "google"
    };
  }
}

function getPlacesProvider(): PlacesProvider {
  // Provider selection stays isolated here so Yelp or Foursquare can be dropped in later.
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
