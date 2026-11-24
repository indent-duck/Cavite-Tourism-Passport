// Open decisions - values TBD by Tourism Office
// (The scan distance lives in Supabase: app_settings.geofence_radius_m, or a
// site's verify_radius_m. The database checks it.)

export const CLAIM_QR_EXPIRY_MINUTES = 15; // TBD

export const SITE_QR_FORMAT = 'cvt:site:<code>'; // <code> = the random code in Supabase qr_codes

export const CLAIM_QR_FORMAT = 'cvt:claim:<claimId>:<token>'; // TBD

// Also stored in Supabase (app_settings.redemption_location) for the promo
// reminder notifications: change both together
export const REDEMPTION_LOCATION = 'Provincial Tourism Office';

/**
 * Parse a stamp QR code payload (sites and festivals alike)
 * @param payload - QR code payload in format "cvt:site:<code>"
 * @returns the code (checked by the database), or null if malformed
 */
export function parseSiteQr(payload: string): string | null {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  const match = payload.trim().match(/^cvt:site:(.+)$/);
  if (!match || !match[1]) {
    return null;
  }

  return match[1];
}

// Fixed values
export const APP_VERSION = '1.0.0';

export const TAB_BAR_HEIGHT = 64;

export const HEADER_HEIGHT = 56;

// Limits
export const MAX_SEARCH_RESULTS = 50;

// Auth constants
export const VERIFICATION_CODE_LENGTH = 6;
export const RESEND_CODE_TIMEOUT = 60; // seconds
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REQUIRES_NUMBER = true;
export const PASSWORD_REQUIRES_UPPERCASE = true;
export const PASSWORD_REQUIRES_SPECIAL = true;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// All 23 local government units of Cavite (8 component cities, 15 municipalities),
// used for the residential address picker during sign-up
export const CAVITE_LGUS = [
  { name: 'Alfonso', type: 'Municipality' },
  { name: 'Amadeo', type: 'Municipality' },
  { name: 'Bacoor', type: 'City' },
  { name: 'Carmona', type: 'City' },
  { name: 'Cavite City', type: 'City' },
  { name: 'Dasmariñas', type: 'City' },
  { name: 'General Emilio Aguinaldo', type: 'Municipality' },
  { name: 'General Mariano Alvarez', type: 'Municipality' },
  { name: 'General Trias', type: 'City' },
  { name: 'Imus', type: 'City' },
  { name: 'Indang', type: 'Municipality' },
  { name: 'Kawit', type: 'Municipality' },
  { name: 'Magallanes', type: 'Municipality' },
  { name: 'Maragondon', type: 'Municipality' },
  { name: 'Mendez', type: 'Municipality' },
  { name: 'Naic', type: 'Municipality' },
  { name: 'Noveleta', type: 'Municipality' },
  { name: 'Rosario', type: 'Municipality' },
  { name: 'Silang', type: 'Municipality' },
  { name: 'Tagaytay', type: 'City' },
  { name: 'Tanza', type: 'Municipality' },
  { name: 'Ternate', type: 'Municipality' },
  { name: 'Trece Martires', type: 'City' },
] as const;

// Social Links (TBD - pending Tourism Office URLs)
export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok';

/**
 * Each office's social accounts, as listed on the physical passport's
 * "Follow us" page. Only the platforms an office has are listed; null means
 * the link hasn't been found yet (the button says "coming soon").
 */
export const SOCIAL_LINKS: Record<
  'BIYAHENG_SOUTH' | 'CAVITE_TOURISM' | 'DOT_4A' | 'DILG_4A',
  Partial<Record<SocialPlatform, string | null>>
> = {
  BIYAHENG_SOUTH: {
    facebook: 'https://www.facebook.com/biyahengsouth',
    instagram: 'https://www.instagram.com/biyahengsouthph/',
    tiktok: 'https://www.tiktok.com/@biyahengsouth',
  },
  CAVITE_TOURISM: {
    facebook: 'https://www.facebook.com/CaviteTourism',
    instagram: 'https://www.instagram.com/_cavitetourism/',
  },
  DOT_4A: {
    facebook: 'https://www.facebook.com/dotcalabarzon',
  },
  DILG_4A: {
    facebook: 'https://www.facebook.com/dilgr4a',
    instagram: 'https://www.instagram.com/dilgr4a/',
    tiktok: 'https://www.tiktok.com/@dilgr4a',
  },
};

export const HELPDESK_EMAIL = 'cavitetourism@gmail.com';

// Passport constants (TBD - pending Tourism Office confirmation)
export const PASSPORT_ISSUER_LINE = 'Province of Cavite'; // TBD
export const PASSPORT_SUBTITLE = 'Official Passport'; // TBD
export const PASSPORT_HEADER_LABEL = 'PASSPORT'; // TBD
export const PASSPORT_STAMPS_TITLE = 'Official Stamps'; // TBD
export const PASSPORT_STAMPS_HEADER = 'OFFICIAL STAMP REGISTER'; // TBD
export const PASSPORT_FOOTER = 'Cavite Tourism Passport'; // TBD
