// Domain types for Cavite Tourism Passport

// User and authentication
export interface User {
  id: string;
  email: string;
  name: string;
  address: string;
  contactNumber?: string; // Added later in Account settings
  passportId: string; // Format: CVT-YYYY-NNNNNN
  points: number;
  createdAt: Date;
}

// Category taxonomy
export type Category =
  | "Dining"
  | "Staycation"
  | "Adventure"
  | "Heritage"
  | "Festival";

// Points per category (for reference in UI)
export const POINTS_PER_CATEGORY: Record<Category, number> = {
  Dining: 150,
  Staycation: 200,
  Adventure: 100,
  Heritage: 50,
  Festival: 50,
};

// Site/destination
export interface Site {
  id: string;
  name: string;
  category: Category;
  municipality: string;
  address: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  operatingHours?: string;
}

// Collected stamp
export interface Stamp {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  siteCategory: Category;
  municipality: string;
  pointsEarned: number;
  collectedAt: Date; // Date + time of scan
}

// Itinerary/tour
export interface Itinerary {
  id: string;
  title: string;
  type: "Day Tour" | "Overnight Tour";
  description: string;
  duration: string; // e.g., "8 hours", "2 days"
  imageUrl: string;
  siteIds: string[]; // Ordered list of site IDs
  stops: number; // Derived from siteIds.length
}

// Event/festival
export interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date; // For multi-day festivals
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  status: "upcoming" | "happening" | "past";
  festivalStamp?: {
    // Only for festivals offering stamps
    pointsBonus: number;
    available: boolean;
  };
}

// Reward
export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  available: boolean; // Overall availability
  limited: boolean; // Has participant limit
  remainingClaims?: number; // Only if limited
  claimedByUser?: boolean; // User has already claimed this reward
  claimedAt?: Date; // When the user claimed it
}

// Reward eligibility status
export interface RewardEligibility {
  eligible: boolean;
  hasEnoughPoints: boolean;
  currentPoints: number;
  pointsNeeded: number;
  hasAllCategories: boolean;
  missingCategories: Category[];
}

// Claim QR code
export interface ClaimQR {
  rewardId: string;
  userId: string;
  qrCode: string; // Generated QR code data
  expiresAt: Date;
  used: boolean;
}

// Promo period
export interface PromoPeriod {
  startDate: Date;
  endDate: Date;
  active: boolean;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
