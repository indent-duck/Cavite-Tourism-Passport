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
  latitude: number;
  longitude: number;
  operatingHours?: string;
  imageUrl?: string; // Cover photo; cards fall back to a placeholder when absent
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
  description?: string;
  duration?: string; // e.g., "8 hours", "2 days"
  siteIds: string[]; // Ordered list of site IDs
  imageUrl?: string; // Cover photo; cards fall back to a placeholder when absent
}

// Event/festival
export type EventCategory = 'Festival' | 'Cultural';

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
  category: EventCategory;
  imageUrl?: string; // Cover photo; cards fall back to a placeholder when absent
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
  locationSpan: string; // Endpoints, e.g., "Parañaque – Kawit"
  length?: string; // e.g., "45 km"
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

// Stamp request: a physical passport stamp sent for admin review so it can be
// added to the digital passport (for sites without a QR station on-site, or
// when it was unavailable)
export type StampRequestStatus = "pending" | "approved" | "rejected";

export interface StampRequest {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  siteCategory: Category;
  municipality: string;
  visitedOn: string; // 'YYYY-MM-DD' (date only, so the cache deserializer keeps it a string)
  photoUri: string; // Photo of the physical stamp (local URI in mock; storage URL later)
  note?: string;
  status: StampRequestStatus;
  rejectionReason?: string;
  stampId?: string; // Stamp created on approval
  createdAt: Date;
  reviewedAt?: Date;
  resultSeenAt?: Date; // When the user saw the approval/rejection (drives the reveal, banner and tab dot)
}

export interface SubmitStampRequestInput {
  siteId: string;
  visitedOn: string;
  photoUri: string;
  note?: string;
}

export type SubmitStampRequestResult =
  | { success: true; request: StampRequest }
  | {
      success: false;
      reason: "alreadyStamped" | "alreadyPending" | "invalidDate" | "siteNotFound";
    };

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
