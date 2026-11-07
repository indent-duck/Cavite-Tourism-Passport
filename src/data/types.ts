// Domain types for Cavite Tourism Passport

// User and authentication
export interface User {
  id: string;
  email: string;
  name: string;
  address: string;
  contactNumber?: string; // Added later in Account settings
  contactVerified?: boolean;
  passportId: string; // Format: CVT-YYYY-NNNNNN
  points: number;
  createdAt: Date;
  hasClaimedThisPeriod?: boolean; // User has claimed a reward this promo period
  claimedRewardId?: string; // ID of the reward claimed (if hasClaimedThisPeriod is true)
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
  startDate: string; // ISO format
  endDate?: string; // ISO format, for multi-day events
  time: string; // e.g., "8:00 AM – 9:00 PM PST"
  venue: string; // Venue name (short)
  municipality: string;
  address: string; // Full address
  latitude: number;
  longitude: number;
  description: string;
  category: 'Festival' | 'Cultural';
  festivalStamp?: {
    // Only for festivals offering stamps
    pointsBonus: number;
    available: boolean;
  };
}

// Expressway info
export interface Expressway {
  id: string;
  name: string;
  locationSpan: string; // e.g., "placeholder, to be confirmed"
  description: string;
}

// About Cavite content
export interface AboutCaviteSection {
  heading: string;
  content: string;
}

export interface AboutCaviteContent {
  sections: AboutCaviteSection[];
}

// Map pin (stub for future map implementation)
export interface MapPin {
  id: string;
  category: 'partner' | 'heritage' | 'signature-food';
  latitude: number;
  longitude: number;
  label: string;
}

// Reward
export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl: string;
  imageSource?: any; // Local placeholder image for expo-image
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

// Active claim for QR generation and display
export interface ActiveClaim {
  claimId: string;
  qrPayload: string; // Full QR payload in format "cvt:claim:<claimId>:<token>"
  rewardId: string;
  createdAt: Date;
  expiresAt: Date;
}

// Promo period
export interface PromoPeriod {
  startDate: Date;
  endDate: Date;
  active: boolean;
}

// Settings
export interface Settings {
  pushNotificationsEnabled: boolean;
}

// FAQ
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  icon?: string; // Optional Ionicons icon name
}

// Stamp collection result (discriminated union)
export type CollectStampResult =
  | { success: true; stamp: Stamp }
  | { success: false; reason: "invalid" }
  | { success: false; reason: "alreadyScanned"; existingStamp: Stamp }
  | { success: false; reason: "locationFailed" }
  | { success: false; reason: "offline" };

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
