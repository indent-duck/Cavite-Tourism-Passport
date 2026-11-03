// Open decisions - values TBD by Tourism Office
export const GEOFENCE_DISTANCE_METERS = 150; // TBD

export const CLAIM_QR_EXPIRY_MINUTES = 15; // TBD

export const SITE_QR_FORMAT = 'CAVITE-SITE-{siteId}'; // TBD, placeholder format

export const CLAIM_QR_FORMAT = 'cvt:claim:<claimId>:<token>'; // TBD

export const REDEMPTION_LOCATION = 'Provincial Tourism Center, Trece Martires'; // TBD

// Scanner constants
// Only true in __DEV__
export const DEV_SKIP_LOCATION_CHECK = true;

/**
 * Parse site QR code payload and extract siteId
 * @param payload - QR code payload in format "cvt:site:<siteId>"
 * @returns siteId if valid, null if malformed
 * @note SITE_QR_FORMAT is an open decision - this implementation matches "cvt:site:<siteId>" format
 */
export function parseSiteQr(payload: string): string | null {
  if (!payload || typeof payload !== 'string') {
    return null;
  }

  const match = payload.match(/^cvt:site:(.+)$/);
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

// Social Links (TBD - pending Tourism Office URLs)
export const SOCIAL_LINKS = {
  BIYAHENG_SOUTH: 'https://example.com/biyaheng-south', // TBD
  CAVITE_TOURISM: 'https://example.com/cavite-tourism', // TBD
  DOT_4A: 'https://example.com/dot-region4a', // TBD
  DILG_4A: 'https://example.com/dilg-region4a', // TBD
};

// Passport constants (TBD - pending Tourism Office confirmation)
export const PASSPORT_ISSUER_LINE = 'Province of Cavite'; // TBD
export const PASSPORT_SUBTITLE = 'Official Passport'; // TBD
export const PASSPORT_HEADER_LABEL = 'PASSPORT'; // TBD
export const PASSPORT_STAMPS_TITLE = 'Official Stamps'; // TBD
export const PASSPORT_STAMPS_HEADER = 'OFFICIAL STAMP REGISTER'; // TBD
export const PASSPORT_FOOTER = 'Cavite Tourism Passport'; // TBD
