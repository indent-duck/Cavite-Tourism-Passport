import {
    CLAIM_QR_EXPIRY_MINUTES,
    DEV_SKIP_LOCATION_CHECK,
    GEOFENCE_DISTANCE_METERS,
    parseSiteQr
} from "@/lib/constants";
import { getDistanceMeters } from "@/lib/geo";
import { fromDateKey, isValidVisitDate } from "@/lib/stamp-requests";
import {
    currentMockStampRequests,
    currentMockStamps,
    currentMockUser,
    mockAboutCavite,
    mockActiveClaims,
    mockEvents,
    mockExpressways,
    mockItineraries,
    mockPromoPeriod,
    mockRewards,
    mockSettings,
    mockSites,
    updateMockSettings
} from "./mock-data";
import {
    AboutCaviteContent,
    ActiveClaim,
    Category,
    CollectStampResult,
    Event,
    Expressway,
    Itinerary,
    POINTS_PER_CATEGORY,
    PromoPeriod,
    Reward,
    RewardEligibility,
    Settings,
    Site,
    Stamp,
    StampRequest,
    SubmitStampRequestInput,
    SubmitStampRequestResult,
    User
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
  // A new array each time, so memoized consumers see stamps added in place
  return [...currentMockStamps];
}

/**
 * Collect a stamp at a site by scanning QR code
 * Mock: Validates QR payload format, checks if already scanned, verifies location (unless dev flag is on)
 * @param payload - QR code payload (format: "cvt:site:<siteId>")
 * @param coords - User's current location or null if location unavailable
 * @returns CollectStampResult with success/failure and reason
 */
export async function collectStamp(
  payload: string,
  coords: { latitude: number; longitude: number } | null
): Promise<CollectStampResult> {
  await randomDelay();

  // Parse QR payload
  const siteId = parseSiteQr(payload);
  if (!siteId) {
    return { success: false, reason: "invalid" };
  }

  // Find site in catalog
  const site = mockSites.find((s) => s.id === siteId);
  if (!site) {
    return { success: false, reason: "invalid" };
  }

  // Check if user already collected stamp from this site
  const existingStamp = currentMockStamps.find((s) => s.siteId === siteId);
  if (existingStamp) {
    return { success: false, reason: "alreadyScanned", existingStamp };
  }

  // Location verification (unless dev flag skips it)
  if (!DEV_SKIP_LOCATION_CHECK) {
    // If coords are null, location check failed (timeout or services disabled)
    if (!coords) {
      return { success: false, reason: "locationFailed" };
    }

    // Calculate distance between user and site
    const distance = getDistanceMeters(
      coords.latitude,
      coords.longitude,
      site.latitude,
      site.longitude
    );

    // Check if user is within geofence
    if (distance > GEOFENCE_DISTANCE_METERS) {
      return { success: false, reason: "locationFailed" };
    }
  }

  // Success: create new stamp
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

  // Add stamp to user's collection (in-memory update)
  currentMockStamps.push(newStamp);

  // Add points to user's balance (in-memory update)
  currentMockUser.points += newStamp.pointsEarned;

  return { success: true, stamp: newStamp };
}

// ============================================================================
// Stamp Requests (physical passport stamps sent for admin review)
// ============================================================================

/**
 * Get all stamp requests for the current user (any status)
 */
export async function getStampRequests(): Promise<StampRequest[]> {
  await randomDelay();
  // Copies, so React Query sees new objects when a request changes in place
  return currentMockStampRequests.map((request) => ({ ...request }));
}

/**
 * Submit a request to add a physical passport stamp to the digital passport
 * Rejected up front when the site is unknown, already stamped, already has a
 * pending request, or the visit date is outside the promo period / in the future
 */
export async function submitStampRequest(
  input: SubmitStampRequestInput,
): Promise<SubmitStampRequestResult> {
  await randomDelay();

  const site = mockSites.find((s) => s.id === input.siteId);
  if (!site) {
    return { success: false, reason: "siteNotFound" };
  }

  if (currentMockStamps.some((s) => s.siteId === site.id)) {
    return { success: false, reason: "alreadyStamped" };
  }

  if (currentMockStampRequests.some((r) => r.siteId === site.id && r.status === "pending")) {
    return { success: false, reason: "alreadyPending" };
  }

  if (!isValidVisitDate(input.visitedOn, mockPromoPeriod)) {
    return { success: false, reason: "invalidDate" };
  }

  const request: StampRequest = {
    id: `stamp-request-${Date.now()}`,
    userId: currentMockUser.id,
    siteId: site.id,
    siteName: site.name,
    siteCategory: site.category,
    municipality: site.municipality,
    visitedOn: input.visitedOn,
    photoUri: input.photoUri,
    note: input.note?.trim() || undefined,
    status: "pending",
    createdAt: new Date(),
  };

  currentMockStampRequests.push(request);
  return { success: true, request: { ...request } };
}

/**
 * Record that the user has seen the result (approval/rejection) of these requests
 */
export async function markStampRequestResultsSeen(ids: string[]): Promise<void> {
  await randomDelay();

  const seenAt = new Date();
  for (const request of currentMockStampRequests) {
    if (ids.includes(request.id) && !request.resultSeenAt) {
      request.resultSeenAt = seenAt;
    }
  }
}

/**
 * Simulate an admin reviewing a stamp request (dev-only)
 * Approving creates the stamp (dated on the visit day) and awards its points.
 * If the site was stamped in the meantime (e.g. via QR), the request is
 * rejected instead, as the database's unique stamp constraint would.
 */
export async function reviewStampRequest(
  requestId: string,
  decision: "approve" | "reject",
  reason?: string,
): Promise<StampRequest> {
  await randomDelay();

  const request = currentMockStampRequests.find((r) => r.id === requestId);
  if (!request) {
    throw new Error("Stamp request not found");
  }
  if (request.status !== "pending") {
    throw new Error("Stamp request was already reviewed");
  }

  request.reviewedAt = new Date();

  const alreadyStamped = currentMockStamps.some((s) => s.siteId === request.siteId);
  if (decision === "reject" || alreadyStamped) {
    request.status = "rejected";
    request.rejectionReason = alreadyStamped
      ? "This stamp is already in your digital passport."
      : reason;
    return { ...request };
  }

  const stamp: Stamp = {
    id: `stamp-${Date.now()}`,
    userId: currentMockUser.id,
    siteId: request.siteId,
    siteName: request.siteName,
    siteCategory: request.siteCategory,
    municipality: request.municipality,
    pointsEarned: POINTS_PER_CATEGORY[request.siteCategory],
    collectedAt: fromDateKey(request.visitedOn),
  };

  currentMockStamps.push(stamp);
  currentMockUser.points += stamp.pointsEarned;

  request.status = "approved";
  request.stampId = stamp.id;
  return { ...request };
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
 * Throws if event is not found
 */
export async function getEventById(id: string): Promise<Event> {
  await randomDelay();
  const event = mockEvents.find((e) => e.id === id);
  if (!event) {
    throw new Error(`Event not found: ${id}`);
  }
  return event;
}

/**
 * Get all expressways
 */
export async function getExpressways(): Promise<Expressway[]> {
  await randomDelay();
  return mockExpressways;
}

/**
 * Get About Cavite content
 */
export async function getAboutCavite(): Promise<AboutCaviteContent> {
  await randomDelay();
  return mockAboutCavite;
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
 * Eligibility requires ALL 6 conditions:
 * 1. At least 700 points
 * 2. At least reward's point cost
 * 3. At least one stamp from each of: Dining, Staycation, Adventure, Heritage
 * 4. User has not claimed a reward this promo period (hasClaimedThisPeriod)
 * 5. Reward is available (not sold out)
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

  // Condition 1 & 2: Check points (at least 700 AND at least reward cost)
  const hasEnoughPoints = currentMockUser.points >= 700 && currentMockUser.points >= reward.pointsCost;

  // Condition 3: Check if user has stamps from all 4 main categories
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

  // Condition 4: User has not claimed a reward this promo period
  const hasNotClaimedThisPeriod = !currentMockUser.hasClaimedThisPeriod;

  // Condition 5: Reward is available (not sold out)
  const isAvailable = reward.available && (!reward.limited || ((reward.remainingClaims ?? 0) > 0));

  // All 6 conditions must be met
  const eligible = hasEnoughPoints && hasAllCategories && hasNotClaimedThisPeriod && isAvailable;

  return {
    eligible: eligible,
    hasEnoughPoints,
    currentPoints: currentMockUser.points,
    pointsNeeded: Math.max(0, Math.max(700, reward.pointsCost) - currentMockUser.points),
    hasAllCategories,
    missingCategories,
  };
}

// ============================================================================
// Active Claims
// ============================================================================

/**
 * Get active claim for a reward
 * Returns active claim from mockActiveClaims Map, or null if none exists or expired
 */
export async function getActiveClaim(rewardId: string): Promise<ActiveClaim | null> {
  await randomDelay();

  const activeClaim = mockActiveClaims.get(rewardId);
  
  if (!activeClaim) {
    return null;
  }

  // Check if claim is expired
  if (activeClaim.expiresAt.getTime() <= Date.now()) {
    // Remove expired claim
    mockActiveClaims.delete(rewardId);
    return null;
  }

  return activeClaim;
}

/**
 * Generate claim QR for a reward
 * Creates new ActiveClaim with claimId, qrPayload, rewardId, createdAt, expiresAt
 * Stores in mockActiveClaims Map (overwrites any existing claim for this reward)
 */
export async function generateClaimQR(rewardId: string): Promise<ActiveClaim> {
  await randomDelay();

  // Generate unique claim ID
  const claimId = `${rewardId}-${currentMockUser.id}-${Date.now()}`;
  
  // Generate random token
  const token = Math.random().toString(36).substring(2, 15);
  
  // Create QR payload in format: cvt:claim:<claimId>:<token>
  const qrPayload = `cvt:claim:${claimId}:${token}`;
  
  // Calculate expiry time
  const createdAt = new Date();
  const expiresAt = new Date(Date.now() + CLAIM_QR_EXPIRY_MINUTES * 60 * 1000);

  const activeClaim: ActiveClaim = {
    claimId,
    qrPayload,
    rewardId,
    createdAt,
    expiresAt,
  };

  // Store in mockActiveClaims Map (overwrites any existing claim for this reward)
  mockActiveClaims.set(rewardId, activeClaim);

  return activeClaim;
}

/**
 * Simulate officer scanning and claiming a reward (dev-only)
 * Deducts points, sets hasClaimedThisPeriod flag, decrements remainingClaims if limited
 */
export async function simulateClaim(claimId: string, rewardId: string): Promise<void> {
  await randomDelay();

  // Find reward by rewardId
  const reward = mockRewards.find((r) => r.id === rewardId);
  if (!reward) {
    throw new Error("Reward not found");
  }

  // Deduct reward.pointsCost from currentMockUser.points
  currentMockUser.points -= reward.pointsCost;

  // Set hasClaimedThisPeriod = true and claimedRewardId
  currentMockUser.hasClaimedThisPeriod = true;
  currentMockUser.claimedRewardId = rewardId;

  // If reward.limited, decrement reward.remainingClaims
  if (reward.limited && reward.remainingClaims !== undefined) {
    reward.remainingClaims = Math.max(0, reward.remainingClaims - 1);
    
    // If remainingClaims reaches 0, mark as unavailable
    if (reward.remainingClaims === 0) {
      reward.available = false;
    }
  }

  // Remove claim from mockActiveClaims Map
  mockActiveClaims.delete(rewardId);
}

/**
 * Set mock scenario for dev testing
 * Updates currentMockUser and currentMockStamps based on scenario
 */
export function setMockScenario(scenario: 'default' | 'eligible' | 'claimed'): void {
  // Import mock data to get access to original stamps
  const { mockStamps, mockUser } = require('./mock-data');

  switch (scenario) {
    case 'default':
      // 450 pts, stamps from Dining, Staycation, 2 Heritage, missing Adventure
      currentMockUser.points = 450;
      currentMockUser.hasClaimedThisPeriod = false;
      currentMockUser.claimedRewardId = undefined;
      
      // Reset stamps to original default (Dining, Staycation, 2 Heritage)
      currentMockStamps.length = 0;
      currentMockStamps.push(
        {
          id: "stamp-001",
          userId: "user-001",
          siteId: "site-dining-001",
          siteName: "Café Amadeo",
          siteCategory: "Dining",
          municipality: "Amadeo",
          pointsEarned: 150,
          collectedAt: new Date("2027-02-10T14:30:00"),
        },
        {
          id: "stamp-002",
          userId: "user-001",
          siteId: "site-staycation-001",
          siteName: "Tagaytay Highlands Resort",
          siteCategory: "Staycation",
          municipality: "Tagaytay",
          pointsEarned: 200,
          collectedAt: new Date("2027-02-15T10:00:00"),
        },
        {
          id: "stamp-003",
          userId: "user-001",
          siteId: "site-heritage-001",
          siteName: "Aguinaldo Shrine",
          siteCategory: "Heritage",
          municipality: "Kawit",
          pointsEarned: 50,
          collectedAt: new Date("2027-02-20T11:15:00"),
        },
        {
          id: "stamp-004",
          userId: "user-001",
          siteId: "site-heritage-002",
          siteName: "Fort San Felipe",
          siteCategory: "Heritage",
          municipality: "Cavite City",
          pointsEarned: 50,
          collectedAt: new Date("2027-02-25T15:45:00"),
        }
      );
      break;

    case 'eligible':
      // 900 pts, stamps from all four categories
      currentMockUser.points = 900;
      currentMockUser.hasClaimedThisPeriod = false;
      currentMockUser.claimedRewardId = undefined;
      
      // Add stamps from all 4 categories
      currentMockStamps.length = 0;
      currentMockStamps.push(
        {
          id: "stamp-001",
          userId: "user-001",
          siteId: "site-dining-001",
          siteName: "Café Amadeo",
          siteCategory: "Dining",
          municipality: "Amadeo",
          pointsEarned: 150,
          collectedAt: new Date("2027-02-10T14:30:00"),
        },
        {
          id: "stamp-002",
          userId: "user-001",
          siteId: "site-staycation-001",
          siteName: "Tagaytay Highlands Resort",
          siteCategory: "Staycation",
          municipality: "Tagaytay",
          pointsEarned: 200,
          collectedAt: new Date("2027-02-15T10:00:00"),
        },
        {
          id: "stamp-003",
          userId: "user-001",
          siteId: "site-heritage-001",
          siteName: "Aguinaldo Shrine",
          siteCategory: "Heritage",
          municipality: "Kawit",
          pointsEarned: 50,
          collectedAt: new Date("2027-02-20T11:15:00"),
        },
        {
          id: "stamp-005",
          userId: "user-001",
          siteId: "site-adventure-001",
          siteName: "Mount Palay-Palay National Park",
          siteCategory: "Adventure",
          municipality: "Maragondon",
          pointsEarned: 100,
          collectedAt: new Date("2027-03-05T09:00:00"),
        }
      );
      break;

    case 'claimed':
      // hasClaimedThisPeriod = true, claimedRewardId = 'reward-001'
      currentMockUser.hasClaimedThisPeriod = true;
      currentMockUser.claimedRewardId = 'reward-001';
      break;
  }
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

// ============================================================================
// Settings
// ============================================================================

/**
 * Get user settings
 */
export async function getSettings(): Promise<Settings> {
  await randomDelay();
  return mockSettings;
}

/**
 * Update user settings
 * Updates settings in-memory for the UI-first phase
 */
export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  await randomDelay();
  
  // Update mock settings using spread syntax (via helper function)
  return updateMockSettings(settings);
}
