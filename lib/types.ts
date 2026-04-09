/** Row in `public.profiles` (see supabase/profiles-schema.sql). */
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  onboarding_completed: boolean;
  home_city: string | null;
  preferred_radius: number | null;
  role: string;
};

export type BusynessLabel =
  | "Below Average"
  | "Average"
  | "Busier Than Usual"
  | "Packed";

export type PriceLevel = "FREE" | "INEXPENSIVE" | "MODERATE" | "EXPENSIVE" | "VERY_EXPENSIVE";

export interface Shop {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingsTotal: number;
  website?: string;
  phone?: string;
  hours: string[];
  /** true = open now, false = closed now, undefined = unknown */
  isOpenNow?: boolean;
  /** UTC offset in minutes for the shop's local timezone when known */
  utcOffsetMinutes?: number;
  distanceMiles?: number;
  tags: string[];
  priceLevel?: PriceLevel;
  photos?: string[]; // resource names: "places/{id}/photos/{ref}"
  editorialSummary?: string;
  source?: "google";
  /** Order / service options when available from listing metadata */
  ordering?: OrderingInfo;
}

export interface OrderingInfo {
  delivery: boolean;
  takeout: boolean;
  dineIn: boolean;
  curbsidePickup: boolean;
  reservable?: boolean;
  /** Deep link to the venue’s ordering / reservation flow when available */
  ordersUri?: string;
  /** Ordering platform detected from the shop's website URL */
  detectedPlatform?: string;
}

export interface PopularTimesHour {
  hour: number;       // 0–23
  perc: number;       // 0–100 busyness percentile
  intensity: string;  // e.g. "Below average" | "Average" | "High" | "Very high"
  closed: boolean;
}

export interface PopularTimesDay {
  dayInt: number;   // 0=Mon … 6=Sun
  dayText: string;
  hours: PopularTimesHour[];
}

export interface PopularTimes {
  days: PopularTimesDay[];  // 7 days Mon–Sun
  fetchedAt: string;
}

export interface ExternalSignals {
  weatherScore: number;
  trafficScore: number;
  timeScore: number;
  dayScore: number;
  eventScore: number;
  merchantOverrideScore?: number;
  rawInputs: Record<string, unknown>;
}

export interface WaitEstimate {
  low: number;   // minutes, lower bound
  high: number;  // minutes, upper bound
  label: string; // display string e.g. "5–10 min"
}

export interface CrowdInsight {
  score: number;
  label: BusynessLabel;
  waitMinutes: WaitEstimate | null; // null when shop is closed
  breakdown: ExternalSignals;
  explanation: string[];
  updatedAt: string;
  /** Historical visit intensity by hour — powers the Popular Times chart when present */
  popularTimes?: PopularTimes;
}

export interface ShopWithInsight extends Shop {
  insight: CrowdInsight;
}

export interface MerchantSubmissionInput {
  submittedName: string;
  submittedAddress: string;
  lat?: number;
  lng?: number;
  website?: string;
  contactEmail: string;
  notes?: string;
  submissionType: "missing_shop" | "claim_shop";
  existingShopId?: string;
}

export interface MerchantSubmissionRecord extends MerchantSubmissionInput {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius: number;
}

export interface ApiExampleResponse {
  data: ShopWithInsight[];
  meta: {
    generatedAt: string;
    /** Static sample payload for documentation only */
    isDemoSample: boolean;
  };
}
