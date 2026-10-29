import {
    currentMockStamps,
    currentMockUser,
    mockEvents,
    mockItineraries,
    mockPromoPeriod,
    mockRewards,
    mockSites
} from "./mock-data";
import {
    Category,
    ClaimQR,
    Event,
    Itinerary,
    POINTS_PER_CATEGORY,
    PromoPeriod,
    Reward,
    RewardEligibility,
    Site,
    Stamp,
    User,
} from "./types";

// Utility to simulate network delay (300-800ms)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(300 + Math.random() * 500);

// ============================================================================
// Authentication
// ============================================================================

/**
 * Sign in a user with email and password
 * Mock: Always succeeds and returns the mock user
 */
export async function signIn(email: string, password: string): Promise<User> {
  await randomDelay();
  // Mock: always succeeds
  return currentMockUser;
}

/**
 * Verify a code sent to email
 * Used by sign up and forgot password flows
 * Mock: Code "123456" succeeds, all others fail
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  await randomDelay();
  
  if (code !== "123456") {
    throw new Error("Invalid verification code");
  }
  
  return true;
}

/**
 * Sign up a new user
 * Mock: Always succeeds after code verification
 */
export async function signUp(
  email: string,
  name: string,
  address: string,
  password: string,
): Promise<User> {
  await randomDelay();
  return { ...currentMockUser, email, name, address };
}

/**
 * Send verification code to email
 * Mock: Always succeeds
 */
export async function sendVerificationCode(email: string): Promise<void> {
  await randomDelay();
  // Mock: always succeeds
}

/**
 * Reset password with verification code
 * Mock: Always succeeds after code verification
 */
export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<void> {
  await randomDelay();
  // Mock: always succeeds after verifyCode was called
}

/**
 * Send SMS verification code to contact number
 * Mock: Always succeeds
 */
export async function sendContactCode(contactNumber: string): Promise<boolean> {
  await randomDelay();
  // Mock: always succeeds (simulates sending SMS code)
  return true;
}

/**
 * Verify SMS code for contact number
 * Mock: Code "123456" succeeds, all others fail
 * On success, updates currentMockUser with verified contact number
 */
export async function verifyContactCode(
  contactNumber: string,
  code: string,
): Promise<boolean> {
  await randomDelay();

  if (code !== "123456") {
    return false;
  }

  // Update mock user with verified contact number
  currentMockUser.contactNumber = contactNumber;
  currentMockUser.contactVerified = true;

  return true;
}

/**
 * Sign out the current user
 * Mock: Resets user to initial state (clears contact number and verification status)
 */
export async function signOut(): Promise<void> {
  await randomDelay();
  
  // Reset mock user to initial state (clear any session-specific modifications)
  currentMockUser.contactNumber = undefined;
  currentMockUser.contactVerified = false;
}

// ============================================================================
// User Data
// ============================================================================

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  await randomDelay();
  return currentMockUser;
}

/**
 * Update user profile information
 */
export async function updateUser(updates: Partial<User>): Promise<User> {
  await randomDelay();
  return { ...currentMockUser, ...updates };
}

// ============================================================================
// Sites
// ============================================================================

/**
 * Get all sites, optionally filtered by category
 */
export async function getSites(category?: Category): Promise<Site[]> {
  await randomDelay();

  if (category) {
    return mockSites.filter((site) => site.category === category);
  }

  return mockSites;
}

/**
 * Get a single site by ID
 */
export async function getSiteById(id: string): Promise<Site | null> {
  await randomDelay();
  return mockSites.find((site) => site.id === id) || null;
}

/**
 * Search sites by name, municipality, or address
 */
export async function searchSites(query: string): Promise<Site[]> {
  await randomDelay();

  const lowerQuery = query.toLowerCase();
  return mockSites.filter(
    (site) =>
      site.name.toLowerCase().includes(lowerQuery) ||
      site.municipality.toLowerCase().includes(lowerQuery) ||
      site.address.toLowerCase().includes(lowerQuery),
  );
}

// ============================================================================
// Stamps
// ============================================================================

/**
 * Get all stamps for the current user
 */
export async function getStamps(): Promise<Stamp[]> {
  await randomDelay();
  return currentMockStamps;
}

/**
 * Collect a stamp at a site
 * Mock: Always succeeds, generates new stamp with appropriate points
 */
export async function collectStamp(siteId: string): Promise<Stamp> {
  await randomDelay();

  const site = mockSites.find((s) => s.id === siteId);
  if (!site) {
    throw new Error("Site not found");
  }

  const newStamp: Stamp = {
    id: `stamp-${Date.now()}`,
    userId: currentMockUser.id,
    siteId: site.id,
    siteName: site.name,
    siteCategory: site.category,
    municipality: site.municipality,
    pointsEarned: POINTS_PER_CATEGORY[site.category],
    collectedAt: new Date(),
  };

  return newStamp;
}

// ============================================================================
// Itineraries
// ============================================================================

/**
 * Get all itineraries
 */
export async function getItineraries(): Promise<Itinerary[]> {
  await randomDelay();
  return mockItineraries;
}

/**
 * Get a single itinerary by ID
 */
export async function getItineraryById(id: string): Promise<Itinerary | null> {
  await randomDelay();
  return mockItineraries.find((itin) => itin.id === id) || null;
}

// ============================================================================
// Events
// ============================================================================

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  await randomDelay();
  return mockEvents;
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  await randomDelay();
  return mockEvents.find((event) => event.id === id) || null;
}

// ============================================================================
// Rewards
// ============================================================================

/**
 * Get all rewards
 */
export async function getRewards(): Promise<Reward[]> {
  await randomDelay();
  return mockRewards;
}

/**
 * Get a single reward by ID
 */
export async function getRewardById(id: string): Promise<Reward | null> {
  await randomDelay();
  return mockRewards.find((reward) => reward.id === id) || null;
}

/**
 * Check if user is eligible for a specific reward
 * Eligibility requires:
 * 1. At least 700 points (or reward's point cost if higher)
 * 2. At least one stamp from each of: Dining, Staycation, Adventure, Heritage
 * Note: Festival stamps are bonus only and not required
 */
export async function checkRewardEligibility(
  rewardId: string,
): Promise<RewardEligibility> {
  await randomDelay();

  const reward = mockRewards.find((r) => r.id === rewardId);
  if (!reward) {
    throw new Error("Reward not found");
  }

  // Check if user has stamps from all 4 main categories
  const stampCategories = new Set(
    currentMockStamps
      .filter((s) => s.siteCategory !== "Festival")
      .map((s) => s.siteCategory),
  );

  const requiredCategories: Category[] = [
    "Dining",
    "Staycation",
    "Adventure",
    "Heritage",
  ];
  const missingCategories = requiredCategories.filter(
    (cat) => !stampCategories.has(cat),
  );

  const hasAllCategories = missingCategories.length === 0;
  const hasEnoughPoints = currentMockUser.points >= reward.pointsCost;

  return {
    eligible: hasAllCategories && hasEnoughPoints,
    hasEnoughPoints,
    currentPoints: currentMockUser.points,
    pointsNeeded: Math.max(0, reward.pointsCost - currentMockUser.points),
    hasAllCategories,
    missingCategories,
  };
}

/**
 * Generate a claim QR code for a reward
 * Mock: Generates a QR code that expires in 15 minutes
 */
export async function generateClaimQR(rewardId: string): Promise<ClaimQR> {
  await randomDelay();

  // Mock: generates a claim QR that expires in 15 minutes
  const expiryMinutes = 15;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    rewardId,
    userId: currentMockUser.id,
    qrCode: `CLAIM-${rewardId}-${currentMockUser.id}-${Date.now()}`,
    expiresAt,
    used: false,
  };
}

// ============================================================================
// Promo Period
// ============================================================================

/**
 * Get the current promo period
 */
export async function getPromoPeriod(): Promise<PromoPeriod> {
  await randomDelay();
  return mockPromoPeriod;
}
