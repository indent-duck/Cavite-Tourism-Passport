import { CAVITE_LGUS, OUTSIDE_CAVITE } from '@/lib/constants';

/**
 * Addresses are stored as one string, built from the sign-up form:
 * - Cavite residents: "<barangay and street>, <city or municipality>, Cavite, Philippines"
 *   (the barangay/street part is optional)
 * - Non-residents (picked "Outside Cavite"): the place they typed, as is,
 *   e.g. "Quezon City, Metro Manila" or "Tokyo, Japan"
 * These helpers build and split that format so the profile editor can prefill
 * the same fields sign-up has.
 */

const LGU_NAMES: readonly string[] = CAVITE_LGUS.map((lgu) => lgu.name);
const PROVINCE_PARTS = new Set(['cavite', 'philippines']);

function splitParts(address: string): string[] {
  return address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function mentionsCavite(parts: string[]): boolean {
  return parts.some((part) => part.toLowerCase() === 'cavite');
}

/**
 * `line` is the barangay/street for a Cavite LGU, or the whole place for
 * OUTSIDE_CAVITE.
 */
export function formatAddress(line: string, municipality: string): string {
  if (municipality === OUTSIDE_CAVITE) return line.trim();
  return [line.trim(), municipality, 'Cavite', 'Philippines'].filter(Boolean).join(', ');
}

/** Error for the place typed after picking "Outside Cavite", or '' when it's fine */
export function getOutsidePlaceError(place: string): string {
  if (!place.trim()) return 'Enter your city and province, or country';
  // Saved as is, it would read back as a Cavite address
  if (mentionsCavite(splitParts(place))) {
    return 'For an address in Cavite, pick its city or municipality from the list';
  }
  return '';
}

/**
 * `line` mirrors formatAddress: the barangay/street for a Cavite address, or the
 * whole place for OUTSIDE_CAVITE. `municipality` is null only for an older
 * free-form Cavite address with no recognizable city or municipality.
 */
export function parseAddress(address: string): { line: string; municipality: string | null } {
  const parts = splitParts(address);

  // Every Cavite address names the province; anything else was typed by a non-resident
  if (!mentionsCavite(parts)) {
    return { line: parts.join(', '), municipality: parts.length ? OUTSIDE_CAVITE : null };
  }

  const index = parts.findIndex((part) => LGU_NAMES.includes(part));
  if (index === -1) {
    // Free-form address: keep everything but the province/country as the street line
    return {
      line: parts.filter((part) => !PROVINCE_PARTS.has(part.toLowerCase())).join(', '),
      municipality: null,
    };
  }
  return { line: parts.slice(0, index).join(', '), municipality: parts[index] };
}

/** Short place for summaries: the city or municipality, or the place typed outside Cavite */
export function getAddressPlace(address: string): string {
  const { line, municipality } = parseAddress(address);
  if (municipality === OUTSIDE_CAVITE) return line;
  return municipality ?? address;
}
