// Open decisions - values TBD by Tourism Office
// (The scan distance lives in Supabase: app_settings.geofence_radius_m, or a
// site's verify_radius_m. The database checks it.)

export const CLAIM_QR_EXPIRY_MINUTES = 15; // TBD

export const SITE_QR_FORMAT = 'cvt:site:<code>'; // <code> = the random code in Supabase qr_codes

export const CLAIM_QR_FORMAT = 'cvt:claim:<claimId>:<token>'; // TBD

export const REDEMPTION_LOCATION = 'Provincial Tourism Center, Trece Martires'; // TBD

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
export const SOCIAL_LINKS = {
  BIYAHENG_SOUTH: 'https://example.com/biyaheng-south', // TBD
  CAVITE_TOURISM: 'https://example.com/cavite-tourism', // TBD
  DOT_4A: 'https://example.com/dot-region4a', // TBD
  DILG_4A: 'https://example.com/dilg-region4a', // TBD
};

export const HELPDESK_EMAIL = 'helpdesk@example.com'; // TBD

// Passport constants (TBD - pending Tourism Office confirmation)
export const PASSPORT_ISSUER_LINE = 'Province of Cavite'; // TBD
export const PASSPORT_SUBTITLE = 'Official Passport'; // TBD
export const PASSPORT_HEADER_LABEL = 'PASSPORT'; // TBD
export const PASSPORT_STAMPS_TITLE = 'Official Stamps'; // TBD
export const PASSPORT_STAMPS_HEADER = 'OFFICIAL STAMP REGISTER'; // TBD
export const PASSPORT_FOOTER = 'Cavite Tourism Passport'; // TBD
