import { parseSiteQr } from "@/lib/constants";
import { FieldError, NETWORK_ERROR_MESSAGE } from "@/lib/errors";
import { fromDateKey, toDateKey } from "@/lib/stamp-requests";
import { supabase } from "@/lib/supabase";
import {
    FunctionsHttpError,
    isAuthRetryableFetchError,
    type AuthError,
    type PostgrestError
} from "@supabase/supabase-js";
import { currentMockUser, mockAboutCavite } from "./mock-data";
import {
    AboutCaviteContent,
    AccountDeletionSummary,
    ActiveClaim,
    Category,
    CollectStampResult,
    Event,
    Expressway,
    GenerateClaimResult,
    Itinerary,
    LivePass,
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
    StampRequestStatus,
    StampTarget,
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
  const userId = await requireUserId();
  // Both counts filter by account: staff can read everyone's rows
  const [user, stamps, pending, livePasses] = await Promise.all([
    getCurrentUser(),
    getStamps(),
    supabase
      .from("stamp_requests")
      .select("id", { count: "exact", head: true })
      .eq("account_id", userId)
      .eq("status", "pending"),
    supabase
      .from("reward_claims")
      .select("id", { count: "exact", head: true })
      .eq("account_id", userId)
      .eq("status", "generated")
      .gt("expires_at", new Date().toISOString()),
  ]);
  if (pending.error) {
    throw new Error(pending.error.message);
  }
  if (livePasses.error) {
    throw new Error(livePasses.error.message);
  }

  return {
    passportId: user.passportId,
    stampCount: stamps.length,
    points: user.points,
    pendingStampRequests: pending.count ?? 0,
    hasActiveVoucher: (livePasses.count ?? 0) > 0,
  };
}

/**
 * Permanently delete the signed-in user's account
 *
 * Supabase: the `delete-account` Edge Function (supabase/functions), since
 * deleting an auth user needs the secret key. It checks the caller's token
 * and password, refuses officer/admin accounts, removes
 * `stamp-requests/{account_id}/*` from Storage, then deletes the auth user.
 * The database cascades to accounts, stamps, stamp_requests and
 * reward_claims. Afterwards the saved session is removed from this device.
 */
export async function deleteAccount(password: string): Promise<void> {
  await requireUserId();

  const { error } = await supabase.functions.invoke("delete-account", {
    body: { password },
  });
  if (error) {
    throw await deleteAccountError(error);
  }

  await supabase.auth.signOut({ scope: "local" });
}

/** Turn a failed `delete-account` call into a message for the delete screen */
async function deleteAccountError(error: Error): Promise<Error> {
  // Network failures (FunctionsFetchError, FunctionsRelayError) have no body
  if (!(error instanceof FunctionsHttpError)) {
    return new Error(NETWORK_ERROR_MESSAGE);
  }
  const body: { error?: string } | null = await error.context.json().catch(() => null);
  switch (body?.error) {
    case "wrong_password":
      return new FieldError("password", "Incorrect password.");
    case "rate_limited":
      return new FieldError("password", AUTH_ERROR_MESSAGES.over_request_rate_limit);
    case "staff_account":
      // Not a field the user can fix, but the message must show in release builds too
      return new FieldError(
        "account",
        "Staff accounts can't be deleted in the app. Please ask an admin.",
      );
    case "not_signed_in":
      return new Error(SIGNED_OUT_MESSAGE);
    default:
      return new Error(`Couldn't delete your account (${body?.error ?? error.message}).`);
  }
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

// A row of the my_stamps view; collect_stamp returns stamps in the same shape
interface StampRow {
  id: number;
  site_id: number | null;
  event_id: number | null; // set for festival stamps
  name: string; // site name or festival title
  municipality: string | null;
  category: string;
  points: number;
  earned_at: string;
}

function toStamp(row: StampRow, userId: string): Stamp {
  return {
    id: String(row.id),
    userId,
    siteId: row.site_id !== null ? String(row.site_id) : `event:${row.event_id}`,
    siteName: row.name,
    siteCategory: CATEGORY_BY_CODE[row.category],
    municipality: row.municipality ?? "",
    pointsEarned: row.points,
    collectedAt: new Date(row.earned_at),
  };
}

/**
 * Get the current user's stamps in the active promo period, newest first
 */
export async function getStamps(): Promise<Stamp[]> {
  const userId = await requireUserId();

  const rows = unwrap(
    await supabase
      .from("my_stamps")
      .select("id, site_id, event_id, name, municipality, category, points, earned_at")
      .order("earned_at", { ascending: false })
      .overrideTypes<StampRow[], { merge: false }>(),
  );
  return rows.map((row) => toStamp(row, userId));
}

// What the collect_stamp database function returns
interface CollectStampRow {
  success: boolean;
  reason?: "invalid" | "alreadyScanned" | "locationFailed" | "noActivePeriod" | "eventNotActive";
  stamp?: StampRow;
  target?: StampTarget | null;
  starts_on?: string;
  ends_on?: string | null;
}

/**
 * Collect a stamp by scanning a site's (or festival's) QR code
 *
 * The database checks everything: the code, the promo period, the festival's
 * dates, one stamp per site per period, and the GPS distance.
 * @param payload - QR code payload: "cvt:site:<code>", where <code> is the
 *   random code in qr_codes (not the site ID)
 * @param coords - User's current location, or null if unavailable
 */
export async function collectStamp(
  payload: string,
  coords: { latitude: number; longitude: number } | null
): Promise<CollectStampResult> {
  const code = parseSiteQr(payload);
  if (!code) {
    return { success: false, reason: "invalid" };
  }
  const userId = await requireUserId();

  const { data, error } = await supabase.rpc("collect_stamp", {
    p_code: code,
    p_latitude: coords?.latitude ?? null,
    p_longitude: coords?.longitude ?? null,
  });
  if (error) {
    throw new Error(error.message);
  }
  // collect_stamp returns one jsonb value, which arrives as a plain object.
  // Without generated types, supabase-js assumes functions return a list.
  const row = data as unknown as CollectStampRow;

  if (row.success && row.stamp) {
    return { success: true, stamp: toStamp(row.stamp, userId) };
  }
  switch (row.reason) {
    case "alreadyScanned":
      return row.stamp
        ? { success: false, reason: "alreadyScanned", existingStamp: toStamp(row.stamp, userId) }
        : { success: false, reason: "invalid" };
    case "locationFailed":
      return { success: false, reason: "locationFailed", target: row.target ?? undefined };
    case "noActivePeriod":
      return { success: false, reason: "noActivePeriod" };
    case "eventNotActive":
      return {
        success: false,
        reason: "eventNotActive",
        target: row.target ?? undefined,
        startDate: row.starts_on ?? "",
        endDate: row.ends_on ?? undefined,
      };
    default:
      return { success: false, reason: "invalid" };
  }
}

// ============================================================================
// Stamp Requests (physical passport stamps sent for admin review)
// ============================================================================

// Private bucket: {user id}/{random}.{ext}. Users upload into and read their
// own folder; admins read all to review.
const STAMP_PHOTO_BUCKET = "stamp-requests";

// How long a photo's signed URL works. The list refetches long before this,
// and the card caches the image by its path, so a fresh URL doesn't
// download it again.
const STAMP_PHOTO_URL_SECONDS = 60 * 60;

const STAMP_REQUEST_COLUMNS =
  "id, site_id, visited_on, photo_path, note, status, rejection_reason, stamp_id, " +
  "created_at, reviewed_at, result_seen_at, sites(name, category, municipalities(name))";

interface StampRequestRow {
  id: number;
  site_id: number;
  visited_on: string; // 'YYYY-MM-DD'
  photo_path: string;
  note: string | null;
  status: StampRequestStatus;
  rejection_reason: string | null;
  stamp_id: number | null; // set on approval
  created_at: string;
  reviewed_at: string | null;
  result_seen_at: string | null;
  sites: { name: string; category: string; municipalities: { name: string } | null };
}

/**
 * Get all stamp requests for the current user (any status), newest first
 */
export async function getStampRequests(): Promise<StampRequest[]> {
  const userId = await requireUserId();

  const rows = unwrap(
    await supabase
      .from("stamp_requests")
      .select(STAMP_REQUEST_COLUMNS)
      // Admins can read everyone's requests, so filter to the user's own
      .eq("account_id", userId)
      .order("created_at", { ascending: false })
      .overrideTypes<StampRequestRow[], { merge: false }>(),
  );

  // One call signs every photo. A failure only costs the thumbnails.
  const photoUrls = new Map<string, string>();
  if (rows.length > 0) {
    const { data } = await supabase.storage
      .from(STAMP_PHOTO_BUCKET)
      .createSignedUrls(
        rows.map((row) => row.photo_path),
        STAMP_PHOTO_URL_SECONDS,
      );
    for (const signed of data ?? []) {
      if (signed.path && signed.signedUrl) photoUrls.set(signed.path, signed.signedUrl);
    }
  }

  return rows.map((row) => ({
    id: String(row.id),
    userId,
    siteId: String(row.site_id),
    siteName: row.sites.name,
    siteCategory: CATEGORY_BY_CODE[row.sites.category],
    municipality: row.sites.municipalities?.name ?? "",
    visitedOn: row.visited_on,
    photoUri: photoUrls.get(row.photo_path),
    photoPath: row.photo_path,
    note: row.note ?? undefined,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    stampId: row.stamp_id !== null ? String(row.stamp_id) : undefined,
    createdAt: new Date(row.created_at),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    resultSeenAt: row.result_seen_at ? new Date(row.result_seen_at) : undefined,
  }));
}

// File types the stamp-requests bucket accepts, by the picker's file extension
const STAMP_PHOTO_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const UNSUPPORTED_PHOTO_MESSAGE = "This photo's format isn't supported. Please use a JPEG or PNG photo.";

/** Turn a failed photo upload into a message under the photo field where the user can fix it */
function photoUploadError(error: { message: string; status?: number; statusCode?: string }): Error {
  const code = String(error.status ?? "");
  const statusCode = error.statusCode ?? "";
  if (code === "413" || statusCode === "413" || /too large|maximum allowed size/i.test(error.message)) {
    return new FieldError(
      "photo",
      "This photo is too large (over 5 MB). Please take a new one or choose a smaller photo.",
    );
  }
  if (code === "415" || statusCode === "415" || /mime/i.test(error.message)) {
    return new FieldError("photo", UNSUPPORTED_PHOTO_MESSAGE);
  }
  return new Error(error.message);
}

// What the submit_stamp_request database function returns
interface SubmitStampRequestRow {
  success: boolean;
  reason?: "siteNotFound" | "alreadyStamped" | "alreadyPending" | "invalidDate";
  request_id?: number;
}

/**
 * Submit a request to add a physical passport stamp to the digital passport
 *
 * Uploads the photo to the private stamp-requests bucket, then
 * submit_stamp_request checks the rules on the server: the site exists, it
 * isn't stamped or pending already, and the visit date is in the promo period
 * and not in the future (Philippine time). If the request doesn't go through,
 * the uploaded photo is deleted again.
 * Throws a FieldError for "photo" when the photo itself is the problem.
 */
export async function submitStampRequest(
  input: SubmitStampRequestInput,
): Promise<SubmitStampRequestResult> {
  const userId = await requireUserId();
  if (!isDbId(input.siteId)) {
    return { success: false, reason: "siteNotFound" };
  }

  const extension = input.photoUri.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? "";
  const contentType = STAMP_PHOTO_TYPES[extension];
  if (!contentType) {
    throw new FieldError("photo", UNSUPPORTED_PHOTO_MESSAGE);
  }

  let body: ArrayBuffer;
  try {
    body = await (await fetch(input.photoUri)).arrayBuffer();
  } catch {
    throw new FieldError("photo", "Couldn't read this photo. Please take or choose it again.");
  }

  const bucket = supabase.storage.from(STAMP_PHOTO_BUCKET);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const { error: uploadError } = await bucket.upload(path, body, { contentType, upsert: false });
  if (uploadError) {
    throw photoUploadError(uploadError);
  }

  const { data, error } = await supabase.rpc("submit_stamp_request", {
    p_site_id: Number(input.siteId),
    p_visited_on: input.visitedOn,
    p_photo_path: path,
    p_note: input.note?.trim() || null,
  });
  // submit_stamp_request returns one jsonb value (see collectStamp)
  const row = data as unknown as SubmitStampRequestRow | null;

  if (error || !row?.success || row.request_id === undefined) {
    // Best effort: an unsent photo would otherwise sit in Storage for nothing
    await bucket.remove([path]);
    if (error) {
      throw new Error(error.message);
    }
    return { success: false, reason: row?.reason ?? "siteNotFound" };
  }
  return { success: true, requestId: String(row.request_id) };
}

/**
 * Record that the user has seen the result (approval/rejection) of these requests
 */
export async function markStampRequestResultsSeen(ids: string[]): Promise<void> {
  const requestIds = ids.filter(isDbId);
  if (requestIds.length === 0) return;

  // The only column users may update, and only on reviewed requests (RLS)
  unwrap(
    await supabase
      .from("stamp_requests")
      .update({ result_seen_at: new Date().toISOString() })
      .in("id", requestIds)
      .is("result_seen_at", null),
  );
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

// claimedByUser / claimedAt stay unset: which reward the user claimed this
// period comes from my_account (User.claimedRewardId), and getRewardStatus()
// in src/lib/rewards.ts checks that first
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

// Minimum balance before any reward (app_settings.reward_min_points). The
// database checks it again when a claim QR is generated or redeemed.
const MIN_REWARD_POINTS = 700;

/**
 * Whether a user can claim a reward. Requires ALL of:
 * 1. At least 700 points
 * 2. At least the reward's point cost
 * 3. At least one stamp from each of: Dining, Staycation, Adventure, Heritage
 * 4. User has not claimed a reward this promo period (hasClaimedThisPeriod)
 * 5. Reward is available (not sold out)
 * Note: Festival stamps are bonus only and not required
 */
function getEligibility(reward: Reward, user: User, stamps: Stamp[]): RewardEligibility {
  // Condition 1 & 2: Check points (at least 700 AND at least reward cost)
  const hasEnoughPoints = user.points >= MIN_REWARD_POINTS && user.points >= reward.pointsCost;

  // Condition 3: Check if user has stamps from all 4 main categories
  const stampCategories = new Set(
    stamps
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
  const hasNotClaimedThisPeriod = !user.hasClaimedThisPeriod;

  // Condition 5: Reward is available (not sold out)
  const isAvailable = reward.available && (!reward.limited || ((reward.remainingClaims ?? 0) > 0));

  const eligible = hasEnoughPoints && hasAllCategories && hasNotClaimedThisPeriod && isAvailable;

  return {
    eligible: eligible,
    hasEnoughPoints,
    currentPoints: user.points,
    pointsNeeded: Math.max(0, Math.max(MIN_REWARD_POINTS, reward.pointsCost) - user.points),
    hasAllCategories,
    missingCategories,
  };
}

/**
 * Check if the current user is eligible for a specific reward
 */
export async function checkRewardEligibility(
  rewardId: string,
): Promise<RewardEligibility> {
  const [reward, user, stamps] = await Promise.all([
    getRewardById(rewardId),
    getCurrentUser(),
    getStamps(),
  ]);
  if (!reward) {
    throw new Error("Reward not found");
  }
  return getEligibility(reward, user, stamps);
}

/**
 * All visible rewards with the current user's eligibility for each, from one
 * read of the user and their stamps (for the rewards list)
 */
export async function getRewardsWithEligibility(): Promise<
  { reward: Reward; eligibility: RewardEligibility }[]
> {
  const [rewards, user, stamps] = await Promise.all([getRewards(), getCurrentUser(), getStamps()]);
  return rewards.map((reward) => ({ reward, eligibility: getEligibility(reward, user, stamps) }));
}

// ============================================================================
// Active Claims
// ============================================================================

// What generate_reward_claim returns
interface GenerateClaimRow {
  success: boolean;
  reason?: Extract<GenerateClaimResult, { success: false }>["reason"];
  claim_id?: number;
  reward_id?: number;
  qr_payload?: string;
  created_at?: string;
  expires_at?: string;
}

const CLAIM_COLUMNS = "id, reward_id, token, generated_at, expires_at";

interface RewardClaimRow {
  id: number;
  reward_id: number;
  token: string;
  generated_at: string;
  expires_at: string;
}

function toActiveClaim(row: RewardClaimRow): ActiveClaim {
  return {
    claimId: String(row.id),
    // Same format generate_reward_claim returns
    qrPayload: `cvt:claim:${row.id}:${row.token}`,
    rewardId: String(row.reward_id),
    createdAt: new Date(row.generated_at),
    expiresAt: new Date(row.expires_at),
  };
}

/**
 * The signed-in user's live passes: not redeemed, cancelled or expired.
 * Filtered by account because staff can read everyone's claims. There is
 * at most one (generate_reward_claim cancels the previous pass).
 */
function livePassesQuery(userId: string, columns: string) {
  return supabase
    .from("reward_claims")
    .select(columns)
    .eq("account_id", userId)
    .eq("status", "generated")
    .gt("expires_at", new Date().toISOString());
}

/**
 * The user's live claim pass for a reward, or null if there is none or it
 * has expired. A pass stops being live once an officer redeems it, or when
 * the user generates another one (for any reward).
 */
export async function getActiveClaim(rewardId: string): Promise<ActiveClaim | null> {
  if (!isDbId(rewardId)) return null;
  const userId = await requireUserId();

  const row = unwrap(
    await livePassesQuery(userId, CLAIM_COLUMNS)
      .eq("reward_id", rewardId)
      .maybeSingle()
      .overrideTypes<RewardClaimRow, { merge: false }>(),
  );
  return row ? toActiveClaim(row) : null;
}

/**
 * The user's live claim pass for any reward, or null. For the Rewards hub
 * banner and the "this replaces your pass" warning.
 */
export async function getLivePass(): Promise<LivePass | null> {
  const userId = await requireUserId();

  const row = unwrap(
    await livePassesQuery(userId, `${CLAIM_COLUMNS}, rewards(name)`)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .overrideTypes<RewardClaimRow & { rewards: { name: string } }, { merge: false }>(),
  );
  return row ? { ...toActiveClaim(row), rewardTitle: row.rewards.name } : null;
}

/**
 * Generate a claim pass (single-use QR) for a reward
 *
 * generate_reward_claim checks every rule again (promo period, one reward per
 * period, stock, categories, points) and cancels the user's previous live
 * pass. Points are deducted only when an officer redeems the pass.
 */
export async function generateClaimQR(rewardId: string): Promise<GenerateClaimResult> {
  if (!isDbId(rewardId)) {
    return { success: false, reason: "rewardNotFound" };
  }
  await requireUserId();

  const { data, error } = await supabase.rpc("generate_reward_claim", {
    p_reward_id: Number(rewardId),
  });
  if (error) {
    throw new Error(error.message);
  }
  // generate_reward_claim returns one jsonb value (see collectStamp)
  const row = data as unknown as GenerateClaimRow;

  if (
    !row.success ||
    row.claim_id === undefined ||
    !row.qr_payload ||
    !row.created_at ||
    !row.expires_at
  ) {
    return { success: false, reason: row.reason ?? "rewardNotFound" };
  }
  return {
    success: true,
    claim: {
      claimId: String(row.claim_id),
      qrPayload: row.qr_payload,
      rewardId: String(row.reward_id ?? rewardId),
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
    },
  };
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
