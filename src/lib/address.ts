import { CAVITE_LGUS } from '@/lib/constants';

/**
 * Addresses are stored as one string, built from the sign-up form:
 * "<barangay and street>, <city or municipality>, Cavite, Philippines"
 * (the barangay/street part is optional). These helpers build and split that
 * format so the profile editor can prefill the same fields sign-up has.
 */

const LGU_NAMES: readonly string[] = CAVITE_LGUS.map((lgu) => lgu.name);
const PROVINCE_PARTS = new Set(['cavite', 'philippines']);

export function formatAddress(street: string, municipality: string): string {
  return [street.trim(), municipality, 'Cavite', 'Philippines'].filter(Boolean).join(', ');
}

export function parseAddress(address: string): { street: string; municipality: string | null } {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const index = parts.findIndex((part) => LGU_NAMES.includes(part));

  if (index === -1) {
    // Free-form address: keep everything but the province/country as the street line
    return {
      street: parts.filter((part) => !PROVINCE_PARTS.has(part.toLowerCase())).join(', '),
      municipality: null,
    };
  }
  return { street: parts.slice(0, index).join(', '), municipality: parts[index] };
}
