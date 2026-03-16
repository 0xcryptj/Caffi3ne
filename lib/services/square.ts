const isSandbox = process.env.SQUARE_ENV === "sandbox";
const BASE_URL = isSandbox
  ? "https://connect.squareupsandbox.com/v2"
  : "https://connect.squareup.com/v2";

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2024-11-20"
  };
}

export interface SquareLocation {
  id: string;
  name: string;
  address?: {
    address_line_1?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
  };
  coordinates?: { latitude: number; longitude: number };
  status?: string;
  business_hours?: {
    periods?: { day_of_week: string; start_local_time: string; end_local_time: string }[];
  };
  merchant_id?: string;
}

export interface SquareOrderSummary {
  locationId: string;
  totalOrders: number;
  recentOrderCount: number; // last 2 hours
}

export async function getSquareLocations(): Promise<SquareLocation[]> {
  const res = await fetch(`${BASE_URL}/locations`, {
    headers: getHeaders(),
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    console.error(`Square locations failed: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as { locations?: SquareLocation[] };
  return data.locations ?? [];
}

export async function getSquareOrderVolume(locationId: string): Promise<SquareOrderSummary> {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const body = {
    location_ids: [locationId],
    query: {
      filter: {
        date_time_filter: {
          created_at: {
            start_at: startOfDay.toISOString(),
            end_at: now.toISOString()
          }
        },
        state_filter: { states: ["COMPLETED"] }
      }
    },
    limit: 500,
    return_entries: false
  };

  const res = await fetch(`${BASE_URL}/orders/search`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    return { locationId, totalOrders: 0, recentOrderCount: 0 };
  }

  const data = (await res.json()) as { orders?: { created_at?: string }[] };
  const orders = data.orders ?? [];

  const recentOrders = orders.filter((o) => {
    if (!o.created_at) return false;
    return new Date(o.created_at) >= twoHoursAgo;
  });

  return {
    locationId,
    totalOrders: orders.length,
    recentOrderCount: recentOrders.length
  };
}

/** Convert Square order volume to a 0–100 crowd score component */
export function orderVolumeToScore(summary: SquareOrderSummary): number {
  // Heuristic: 20+ recent orders = packed (100), 0 = quiet (10)
  const score = Math.min(100, 10 + summary.recentOrderCount * 4.5);
  return Math.round(score);
}
