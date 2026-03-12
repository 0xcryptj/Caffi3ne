export type BusynessLabel =
  | "Below Average"
  | "Average"
  | "Busier Than Usual"
  | "Packed";

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
  distanceMiles?: number;
  tags: string[];
  source?: "mock" | "google";
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

export interface CrowdInsight {
  score: number;
  label: BusynessLabel;
  breakdown: ExternalSignals;
  explanation: string[];
  updatedAt: string;
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
    mockMode: boolean;
  };
}
