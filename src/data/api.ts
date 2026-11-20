import {
    CLAIM_QR_EXPIRY_MINUTES,
    DEV_SKIP_LOCATION_CHECK,
    GEOFENCE_DISTANCE_METERS,
    parseSiteQr
} from "@/lib/constants";
import { FieldError, NETWORK_ERROR_MESSAGE } from "@/lib/errors";
import { getDistanceMeters } from "@/lib/geo";
import { fromDateKey, isValidVisitDate, toDateKey } from "@/lib/stamp-requests";
import { supabase } from "@/lib/supabase";
import {
    isAuthRetryableFetchError,
    type AuthError,
    type PostgrestError
} from "@supabase/supabase-js";
import {
    currentMockStampRequests,
    currentMockStamps,
    currentMockUser,
    mockAboutCavite,
    mockActiveClaims,
    mockSites
} from "./mock-data";
import {
    AboutCaviteContent,
    AccountDeletionSummary,
    ActiveClaim,
    Category,
    CollectStampResult,
    Event,
    Expressway,
    Itinerary,
    PasswordChangeProof,
    POINTS_PER_CATEGORY,
    ProfileUpdate,
    PromoPeriod,
    Reward,
    RewardEligibility,
    Settings,
    Site,
    Stamp,
    StampRequest,
    SubmitStampRequestInput,
    SubmitStampRequestResult,
    User,
    VerificationPurpose
} from "./types";

// Utility to simulate network delay (300-800ms)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(300 + Math.random() * 500);

// ============================================================================
// Supabase helpers
// ============================================================================
// Functions below that use `supabase` read the real database
// (schema/supabase-schema.sql). The rest still use mock data until their
// group is wired up.

/**
 * Return a query's data, or throw its error so React Query shows the error state.
 * Row types are declared with overrideTypes<Row[] | Row, { merge: false }>(),
 * since there are no generated database types yet.
 */
function unwrap<T>(result: { data: T; error: null } | { data: null; error: PostgrestError }): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
}

/** Database IDs are numbers; anything else (e.g. an old mock ID) can't match */
function isDbId(id: string): boolean {
  return /^\d+$/.test(id);
}

const CATEGORY_BY_CODE: Record<string, Category> = {
  dining: "Dining",
  staycation: "Staycation",
  adventure: "Adventure",
  heritage: "Heritage",
  festival: "Festival",
};

const CODE_BY_CATEGORY: Record<Category, string> = {
  Dining: "dining",
  Staycation: "staycation",
  Adventure: "adventure",
  Heritage: "heritage",
  Festival: "festival",
};

/** Public URL of a photo in the "content" Storage bucket */
function contentImageUrl(path: string | null | undefined): string | undefined {
  return path ? supabase.storage.from("content").getPublicUrl(path).data.publicUrl : undefined;
}

/** The cover photo: the image with the lowest sort_order */
function coverImageUrl(images: ImageRow[] | null): string | undefined {
  if (!images || images.length === 0) return undefined;
  const cover = images.reduce((first, image) => (image.sort_order < first.sort_order ? image : first));
  return contentImageUrl(cover.storage_path);
}

interface ImageRow {
  storage_path: string;
  sort_order: number;
}

// Supabase Auth error codes -> what the user should read
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password",
  otp_expired: "Invalid or expired code. Please try again or request a new one.",
  over_email_send_rate_limit: "Too many emails sent. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  email_address_invalid: "Please enter a valid email address",
  email_not_confirmed: "Please verify your email address first.",
  same_password: "Your new password must be different from your current one.",
  user_banned: "This account has been suspended.",
};

/** Turn a Supabase Auth error into an Error with a message for the user */
function authError(error: AuthError): Error {
  if (isAuthRetryableFetchError(error)) {
    return new Error(NETWORK_ERROR_MESSAGE);
  }
  // "For security purposes, you can only request this after 42 seconds." is clearer as-is
  if (/after \d+ seconds?/.test(error.message)) {
    return new Error(error.message);
  }
  return new Error(AUTH_ERROR_MESSAGES[error.code ?? ""] ?? error.message);
}

const SIGNED_OUT_MESSAGE = "You're signed out. Please log in again.";

/** The signed-in user's ID, from the session saved on the device */
async function requireUserId(message = SIGNED_OUT_MESSAGE): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw new Error(message);
  }
  return data.session.user.id;
}

// ============================================================================
// Authentication (Supabase Auth)
// ============================================================================

/**
 * Whether a login session is saved on this device (checked at app start)
 */
export async function hasSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw authError(error);
  return getCurrentUser();
}

/**
 * Email a 6-digit code
 * - signup: verifies the address and creates the login if it's new. New
 *   addresses get the "Confirm signup" email, existing ones "Magic Link".
 * - reset: starts a password reset ("Reset Password" email). Supabase
 *   doesn't reveal whether the address has an account.
 */
export async function sendVerificationCode(email: string, purpose: VerificationPurpose): Promise<void> {
  const { error } =
    purpose === "signup"
      ? await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
      : await supabase.auth.resetPasswordForEmail(email);
  if (error) throw authError(error);
}

/**
 * Check an emailed code. Success signs the user in, which sign-up step 3 and
 * the new-password screen rely on.
 *
 * Sign-up: an address that already has a finished account also gets a code,
 * so that user is signed out again here instead of letting step 3 overwrite
 * their name and password.
 */
export async function verifyCode(
  email: string,
  code: string,
  purpose: VerificationPurpose,
): Promise<boolean> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: purpose === "signup" ? "email" : "recovery",
  });
  if (error) throw authError(error);

  if (purpose === "signup" && data.user) {
    const account = unwrap(
      await supabase
        .from("accounts")
        .select("first_name")
        .eq("id", data.user.id)
        .maybeSingle()
        .overrideTypes<{ first_name: string | null }, { merge: false }>(),
    );
    if (account?.first_name) {
      await supabase.auth.signOut({ scope: "local" });
      throw new Error("This email already has an account. Log in with your password instead.");
    }
  }
  return true;
}

/**
 * Finish sign-up (step 3): set the name, address and password. The user was
 * signed in by verifyCode() in step 2.
 *
 * Safe to retry after a failure: the profile is saved first, and a password
 * that an earlier attempt already set ("same_password") is not an error.
 */
export async function signUp(
  email: string,
  firstName: string,
  lastName: string,
  address: string,
  password: string,
): Promise<User> {
  const userId = await requireUserId("Your verification has expired. Please start again.");

  const updated = unwrap(
    await supabase
      .from("accounts")
      .update({ first_name: firstName, last_name: lastName, address })
      .eq("id", userId)
      .select("id"),
  );
  if (updated.length === 0) {
    // The accounts row is created by a database trigger when the login is
    // created; logins made before the schema was installed don't have one
    throw new Error("Your account record is missing. Please contact the Tourism Office helpdesk.");
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error && error.code !== "same_password") throw authError(error);

  return getCurrentUser();
}

/**
 * Set a new password after the reset code was verified, then sign out
 * everywhere: the user logs in again with the new password, and anyone who
 * knew the old one loses their session
 */
export async function resetPassword(email: string, newPassword: string): Promise<void> {
  await requireUserId("Your reset code has expired. Please request a new one.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw authError(error);

  await supabase.auth.signOut({ scope: "global" });
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
 * Sign out on this device. The saved session is removed even when offline.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut({ scope: "local" });
}

// ============================================================================
// User Data
// ============================================================================

const MY_ACCOUNT_COLUMNS =
  "id, email, passport_id, first_name, last_name, address, contact_number, " +
  "contact_verified_at, created_at, points, claimed_reward_id";

// The my_account view: the signed-in user's account plus their points and
// claimed reward in the active promo period
interface MyAccountRow {
  id: string;
  email: string | null;
  passport_id: string;
  first_name: string | null; // null until sign-up step 3
  last_name: string | null;
  address: string | null;
  contact_number: string | null;
  contact_verified_at: string | null;
  created_at: string;
  points: number;
  claimed_reward_id: number | null;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  // Signed-out requests can't read my_account at all ("permission denied")
  await requireUserId();

  const row = unwrap(
    await supabase
      .from("my_account")
      .select(MY_ACCOUNT_COLUMNS)
      .maybeSingle()
      .overrideTypes<MyAccountRow, { merge: false }>(),
  );
  if (!row) {
    throw new Error(SIGNED_OUT_MESSAGE);
  }

  return {
    id: row.id,
    email: row.email ?? "",
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    address: row.address ?? "",
    contactNumber: row.contact_number ?? undefined,
    contactVerified: row.contact_verified_at !== null,
    passportId: row.passport_id,
    points: row.points,
    createdAt: new Date(row.created_at),
    hasClaimedThisPeriod: row.claimed_reward_id !== null,
    claimedRewardId: row.claimed_reward_id !== null ? String(row.claimed_reward_id) : undefined,
  };
}

// ============================================================================
// Account Management (Settings → Account)
// ============================================================================

/**
 * Update the user's first name, last name and address. These (and
 * notifications_enabled) are the only account columns users may write: see
 * the column grants in schema/supabase-schema.sql.
 */
export async function updateProfile(updates: ProfileUpdate): Promise<User> {
  const userId = await requireUserId();

  unwrap(
    await supabase
      .from("accounts")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        address: updates.address,
      })
      .eq("id", userId)
      .select("id")
      .single(),
  );
  return getCurrentUser();
}

/**
 * Email a one-time code ("Reauthentication" email) so the user can change
 * their password without knowing the current one
 */
export async function sendReauthenticationCode(): Promise<void> {
  const { error } = await supabase.auth.reauthenticate();
  if (error) throw authError(error);
}

/**
 * Change the signed-in user's password, proven by the current password or by
 * the code from sendReauthenticationCode()
 */
export async function changePassword(
  newPassword: string,
  proof: PasswordChangeProof,
): Promise<void> {
  if ("currentPassword" in proof) {
    const { data } = await supabase.auth.getSession();
    const email = data.session?.user.email;
    if (!email) throw new Error(SIGNED_OUT_MESSAGE);

    // Signing in again checks the password and gives a fresh session, which
    // Supabase wants before a password change
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: proof.currentPassword,
    });
    if (error) {
      if (error.code === "invalid_credentials") {
        throw new FieldError("currentPassword", "Your current password is incorrect.");
      }
      throw authError(error);
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    nonce: "code" in proof ? proof.code : undefined,
  });
  if (error) {
    if (error.code === "reauthentication_not_valid") {
      throw new FieldError("code", "Invalid verification code. Please try again.");
    }
    if (error.code === "same_password" || error.code === "weak_password") {
      throw new FieldError("newPassword", authError(error).message);
    }
    throw authError(error);
  }
}

/**
 * Summarize what deleting the account would remove
 */
export async function getAccountDeletionSummary(): Promise<AccountDeletionSummary> {
  const user = await getCurrentUser();

  // Stamps, stamp requests and vouchers are still mock until their groups are wired
  const now = Date.now();
  return {
    passportId: user.passportId,
    stampCount: currentMockStamps.length,
    points: user.points,
    pendingStampRequests: currentMockStampRequests.filter(
      (request) => request.status === 'pending',
    ).length,
    hasActiveVoucher: Array.from(mockActiveClaims.values()).some(
      (claim) => claim.expiresAt.getTime() > now,
    ),
  };
}

/**
 * Permanently delete the signed-in user's account
 *
 * Supabase: a `delete-account` Edge Function, since deleting an auth user
 * needs the service role key. It checks the caller's JWT and password,
 * refuses officer/admin accounts (`reward_claims.claimed_by` points at them
 * with no cascade), deletes `stamp-requests/{account_id}/*` from Storage, then
 * calls `auth.admin.deleteUser()`. The database cascades to accounts, stamps,
 * reward_claims and stamp_requests.
 * Not wired yet. Mock: password "wrong" fails. Otherwise it clears this
 * session's mock vouchers and stamp requests and signs out, but the real
 * account is NOT deleted.
 */
export async function deleteAccount(password: string): Promise<void> {
  await randomDelay();

  if (password === 'wrong') {
    throw new FieldError('password', 'Incorrect password.');
  }

  mockActiveClaims.clear();
  currentMockStampRequests.length = 0;
  await supabase.auth.signOut({ scope: "local" });
}

// ============================================================================
// Sites
// ============================================================================

const SITE_COLUMNS =
  "id, name, category, address, description, latitude, longitude, operating_hours, " +
  "municipalities(name), site_images(storage_path, sort_order)";

interface SiteRow {
  id: number;
  name: string;
  category: string;
  address: string;
  description: string | null;
  latitude: number;
  longitude: number;
  operating_hours: string | null;
  municipalities: { name: string } | null;
  site_images: ImageRow[] | null;
}

function toSite(row: SiteRow): Site {
  return {
    id: String(row.id),
    name: row.name,
    category: CATEGORY_BY_CODE[row.category],
    municipality: row.municipalities?.name ?? "",
    address: row.address,
    description: row.description ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    operatingHours: row.operating_hours ?? undefined,
    imageUrl: coverImageUrl(row.site_images),
  };
}

/**
 * Get all visible sites, optionally filtered by category
 */
export async function getSites(category?: Category): Promise<Site[]> {
  let query = supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("is_visible", true)
    .order("name");
  if (category) {
    query = query.eq("category", CODE_BY_CATEGORY[category]);
  }

  const rows = unwrap(await query.overrideTypes<SiteRow[], { merge: false }>());
  return rows.map(toSite);
}

/**
 * Get a single site by ID (hidden sites too, so older stamps still open)
 */
export async function getSiteById(id: string): Promise<Site | null> {
  if (!isDbId(id)) return null;

  const row = unwrap(
    await supabase
      .from("sites")
      .select(SITE_COLUMNS)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<SiteRow, { merge: false }>(),
  );
  return row ? toSite(row) : null;
}

/**
 * Search sites by name, municipality, or address
 */
export async function searchSites(query: string): Promise<Site[]> {
  const sites = await getSites();

  const lowerQuery = query.toLowerCase();
  return sites.filter(
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

  // Sites and the promo period come from the database; the request itself is still mock
  const site = await getSiteById(input.siteId);
  if (!site) {
    return { success: false, reason: "siteNotFound" };
  }

  if (currentMockStamps.some((s) => s.siteId === site.id)) {
    return { success: false, reason: "alreadyStamped" };
  }

  if (currentMockStampRequests.some((r) => r.siteId === site.id && r.status === "pending")) {
    return { success: false, reason: "alreadyPending" };
  }

  if (!isValidVisitDate(input.visitedOn, await getPromoPeriod())) {
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

const ITINERARY_COLUMNS =
  "id, name, type, description, duration_label, image_path, itinerary_stops(site_id, stop_order)";

interface ItineraryRow {
  id: number;
  name: string;
  type: "day" | "overnight";
  description: string | null;
  duration_label: string | null;
  image_path: string | null;
  itinerary_stops: { site_id: number; stop_order: number }[] | null;
}

function toItinerary(row: ItineraryRow): Itinerary {
  const stops = [...(row.itinerary_stops ?? [])].sort((a, b) => a.stop_order - b.stop_order);
  return {
    id: String(row.id),
    title: row.name,
    type: row.type === "day" ? "Day Tour" : "Overnight Tour",
    description: row.description ?? undefined,
    duration: row.duration_label ?? undefined,
    siteIds: stops.map((stop) => String(stop.site_id)),
    imageUrl: contentImageUrl(row.image_path),
  };
}

/**
 * Get all visible itineraries
 */
export async function getItineraries(): Promise<Itinerary[]> {
  const rows = unwrap(
    await supabase
      .from("itineraries")
      .select(ITINERARY_COLUMNS)
      .eq("is_visible", true)
      .order("sort_order")
      .overrideTypes<ItineraryRow[], { merge: false }>(),
  );
  return rows.map(toItinerary);
}

/**
 * Get a single itinerary by ID
 */
export async function getItineraryById(id: string): Promise<Itinerary | null> {
  if (!isDbId(id)) return null;

  const row = unwrap(
    await supabase
      .from("itineraries")
      .select(ITINERARY_COLUMNS)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<ItineraryRow, { merge: false }>(),
  );
  return row ? toItinerary(row) : null;
}

// ============================================================================
// Events
// ============================================================================

const EVENT_COLUMNS =
  "id, title, category, description, venue, address, latitude, longitude, starts_on, ends_on, " +
  "time_label, offers_stamp, municipalities(name), event_images(storage_path, sort_order)";

interface EventRow {
  id: number;
  title: string;
  category: "festival" | "cultural";
  description: string | null;
  venue: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  starts_on: string; // 'YYYY-MM-DD'
  ends_on: string | null;
  time_label: string | null;
  offers_stamp: boolean;
  municipalities: { name: string } | null;
  event_images: ImageRow[] | null;
}

function toEvent(row: EventRow): Event {
  return {
    id: String(row.id),
    title: row.title,
    // Date-only strings: new Date('YYYY-MM-DD') is UTC midnight, which is
    // still the same calendar day in the Philippines (UTC+8)
    startDate: row.starts_on,
    endDate: row.ends_on ?? undefined,
    time: row.time_label ?? "",
    venue: row.venue ?? "",
    municipality: row.municipalities?.name ?? "",
    address: row.address ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description ?? "",
    category: row.category === "festival" ? "Festival" : "Cultural",
    imageUrl: coverImageUrl(row.event_images),
    festivalStamp: row.offers_stamp
      ? { pointsBonus: POINTS_PER_CATEGORY.Festival, available: true }
      : undefined,
  };
}

/**
 * Get all visible events, earliest first
 */
export async function getEvents(): Promise<Event[]> {
  const rows = unwrap(
    await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("is_visible", true)
      .order("starts_on")
      .overrideTypes<EventRow[], { merge: false }>(),
  );
  return rows.map(toEvent);
}

/**
 * Get a single event by ID
 * Throws if event is not found
 */
export async function getEventById(id: string): Promise<Event> {
  const row = isDbId(id)
    ? unwrap(
        await supabase
          .from("events")
          .select(EVENT_COLUMNS)
          .eq("id", id)
          .maybeSingle()
          .overrideTypes<EventRow, { merge: false }>(),
      )
    : null;
  if (!row) {
    throw new Error(`Event not found: ${id}`);
  }
  return toEvent(row);
}

interface ExpresswayRow {
  id: number;
  name: string;
  location_span: string | null;
  length_km: number | null;
  description: string | null;
}

/**
 * Get all expressways
 */
export async function getExpressways(): Promise<Expressway[]> {
  const rows = unwrap(
    await supabase
      .from("expressways")
      .select("id, name, location_span, length_km, description")
      .order("sort_order")
      .overrideTypes<ExpresswayRow[], { merge: false }>(),
  );
  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    locationSpan: row.location_span ?? "",
    length: row.length_km !== null ? `${Number(row.length_km)} km` : undefined,
    description: row.description ?? "",
  }));
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

const REWARD_COLUMNS = "id, name, description, points_cost, image_path, quantity_remaining, is_available";

interface RewardRow {
  id: number;
  name: string;
  description: string | null;
  points_cost: number;
  image_path: string | null;
  quantity_remaining: number | null; // null = unlimited
  is_available: boolean;
}

// claimedByUser / claimedAt come from the user's own reward claims, which are
// wired up with the rest of the rewards flow
function toReward(row: RewardRow): Reward {
  return {
    id: String(row.id),
    title: row.name,
    description: row.description ?? "",
    pointsCost: row.points_cost,
    imageUrl: contentImageUrl(row.image_path),
    available: row.is_available,
    limited: row.quantity_remaining !== null,
    remainingClaims: row.quantity_remaining ?? undefined,
  };
}

/**
 * Get all visible rewards
 */
export async function getRewards(): Promise<Reward[]> {
  const rows = unwrap(
    await supabase
      .from("rewards")
      .select(REWARD_COLUMNS)
      .eq("is_visible", true)
      .order("sort_order")
      .overrideTypes<RewardRow[], { merge: false }>(),
  );
  return rows.map(toReward);
}

/**
 * Get a single reward by ID
 */
export async function getRewardById(id: string): Promise<Reward | null> {
  if (!isDbId(id)) return null;

  const row = unwrap(
    await supabase
      .from("rewards")
      .select(REWARD_COLUMNS)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<RewardRow, { merge: false }>(),
  );
  return row ? toReward(row) : null;
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
  // The reward comes from the database; points and stamps are still mock
  const reward = await getRewardById(rewardId);
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
 * Deducts points and sets hasClaimedThisPeriod on the mock user. Stock in the
 * database is untouched (only redeem_reward_claim changes it).
 */
export async function simulateClaim(claimId: string, rewardId: string): Promise<void> {
  const reward = await getRewardById(rewardId);
  if (!reward) {
    throw new Error("Reward not found");
  }

  // Deduct reward.pointsCost from currentMockUser.points
  currentMockUser.points -= reward.pointsCost;

  // Set hasClaimedThisPeriod = true and claimedRewardId
  currentMockUser.hasClaimedThisPeriod = true;
  currentMockUser.claimedRewardId = rewardId;

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

interface PromoPeriodRow {
  starts_on: string; // 'YYYY-MM-DD'
  ends_on: string;
  is_active: boolean;
}

/**
 * Get the current promo period: the active one, or the most recent one if
 * none is active (then `active` is false)
 *
 * `active` also requires today to be within its dates, since stamps can't be
 * collected before it starts or after it ends.
 */
export async function getPromoPeriod(): Promise<PromoPeriod> {
  const row = unwrap(
    await supabase
      .from("promo_periods")
      .select("starts_on, ends_on, is_active")
      .order("is_active", { ascending: false })
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle()
      .overrideTypes<PromoPeriodRow, { merge: false }>(),
  );
  if (!row) {
    throw new Error("No promo period has been set up yet");
  }

  const today = toDateKey(new Date());
  return {
    startDate: fromDateKey(row.starts_on),
    endDate: fromDateKey(row.ends_on),
    active: row.is_active && today >= row.starts_on && today <= row.ends_on,
  };
}

// ============================================================================
// Settings
// ============================================================================

interface SettingsRow {
  notifications_enabled: boolean;
}

/**
 * Get user settings (stored on the user's account)
 */
export async function getSettings(): Promise<Settings> {
  const userId = await requireUserId();

  const row = unwrap(
    await supabase
      .from("accounts")
      .select("notifications_enabled")
      .eq("id", userId)
      .single()
      .overrideTypes<SettingsRow, { merge: false }>(),
  );
  return { pushNotificationsEnabled: row.notifications_enabled };
}

/**
 * Update user settings
 */
export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  if (settings.pushNotificationsEnabled === undefined) {
    return getSettings();
  }
  const userId = await requireUserId();

  const row = unwrap(
    await supabase
      .from("accounts")
      .update({ notifications_enabled: settings.pushNotificationsEnabled })
      .eq("id", userId)
      .select("notifications_enabled")
      .single()
      .overrideTypes<SettingsRow, { merge: false }>(),
  );
  return { pushNotificationsEnabled: row.notifications_enabled };
}
