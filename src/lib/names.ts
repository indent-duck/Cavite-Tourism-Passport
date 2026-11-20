import type { User } from '@/data/types';

/** Max characters for a first or last name field */
export const MAX_NAME_LENGTH = 50;

/** "Juan" + "Dela Cruz" -> "Juan Dela Cruz" (for display) */
export function getFullName({ firstName, lastName }: Pick<User, 'firstName' | 'lastName'>): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/** Trim and collapse inner whitespace, as a name is saved */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Validation message for a first or last name field ('' when valid).
 * Shared by sign up and Personal details.
 *
 * @param label Field label used in the message, e.g. "First name"
 */
export function getNameError(value: string, label: string): string {
  const name = normalizeName(value);
  if (!name) return `${label} is required`;
  if (/\d/.test(name)) return `${label} can’t contain numbers`;
  return '';
}
