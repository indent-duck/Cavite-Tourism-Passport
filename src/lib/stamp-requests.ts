import type { PromoPeriod, Stamp, StampRequest } from '@/data/types';

/**
 * Helpers for physical-stamp requests (a stamp in the physical passport sent
 * for admin review so it can be added to the digital passport).
 */

/** Where a site stands for the current user: collected, under review, or requestable */
export type SiteStampState = 'stamped' | 'pending' | 'available';

export function getSiteStampState(
  siteId: string,
  stamps: Stamp[],
  requests: StampRequest[],
): SiteStampState {
  if (stamps.some((stamp) => stamp.siteId === siteId)) return 'stamped';
  if (requests.some((request) => request.siteId === siteId && request.status === 'pending')) {
    return 'pending';
  }
  return 'available';
}

/** Reviewed requests whose result the user hasn't seen yet */
export function getUnseenResults(requests: StampRequest[]): StampRequest[] {
  return requests.filter((request) => request.status !== 'pending' && !request.resultSeenAt);
}

/** Pending request for a site, if any */
export function getPendingRequest(siteId: string, requests: StampRequest[]): StampRequest | undefined {
  return requests.find((request) => request.siteId === siteId && request.status === 'pending');
}

// ============================================================================
// Visit dates ('YYYY-MM-DD' in the device's local time)
// ============================================================================

/** Local calendar date as 'YYYY-MM-DD' */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse 'YYYY-MM-DD' as local midnight (new Date('YYYY-MM-DD') would be UTC) */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export interface VisitDateOption {
  key: string;
  label: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Nov 18, 2026" */
export function formatVisitDate(key: string): string {
  const date = fromDateKey(key);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Selectable visit dates, newest first: today back to the promo period's
 * first day (or its last day, if it has already ended).
 * Labelled "Today", "Yesterday", then "Wed, Nov 18".
 */
export function getVisitDateOptions(promoPeriod: PromoPeriod, today = new Date()): VisitDateOption[] {
  const start = new Date(promoPeriod.startDate);
  start.setHours(0, 0, 0, 0);
  const cursor = new Date(Math.min(today.getTime(), new Date(promoPeriod.endDate).getTime()));
  cursor.setHours(0, 0, 0, 0);

  const todayKey = toDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  const options: VisitDateOption[] = [];
  while (cursor.getTime() >= start.getTime()) {
    const key = toDateKey(cursor);
    let label: string;
    if (key === todayKey) label = 'Today';
    else if (key === yesterdayKey) label = 'Yesterday';
    else label = `${WEEKDAYS[cursor.getDay()]}, ${MONTHS[cursor.getMonth()]} ${cursor.getDate()}`;
    options.push({ key, label });
    cursor.setDate(cursor.getDate() - 1);
  }
  return options;
}
