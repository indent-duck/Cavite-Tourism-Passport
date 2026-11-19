import type { Event } from '@/data/types';

export type EventStatus = 'happening' | 'upcoming' | 'past';

const DAY_MS = 86_400_000;

/** Local midnight of the given date */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole calendar days from `from` to `to` (negative when `to` is earlier) */
function daysBetween(from: Date, to: Date): number {
  // Rounded so a DST shift (23/25-hour day) still counts as one day
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

function eventEnd(event: Event): Date {
  return new Date(event.endDate ?? event.startDate);
}

/**
 * Compute event status from dates
 *
 * @returns "happening" if today is within the event dates, "upcoming" if
 * before, "past" if after
 */
export function getEventStatus(event: Event, now: Date = new Date()): EventStatus {
  if (daysBetween(now, new Date(event.startDate)) > 0) return 'upcoming';
  if (daysBetween(now, eventEnd(event)) < 0) return 'past';
  return 'happening';
}

/**
 * Format event date range
 *
 * @returns e.g. "February 12, 2027", "February 12–14, 2027",
 * "February 28 – March 2, 2027" or "December 30, 2026 – January 2, 2027"
 */
export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const full: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  if (!endDate) {
    return start.toLocaleDateString('en-US', full);
  }

  const end = new Date(endDate);

  if (start.getFullYear() !== end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', full)} – ${end.toLocaleDateString('en-US', full)}`;
  }

  const month = start.toLocaleDateString('en-US', { month: 'long' });
  if (start.getMonth() === end.getMonth()) {
    return `${month} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }

  const startMonthDay = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const endMonthDay = end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${startMonthDay} – ${endMonthDay}, ${end.getFullYear()}`;
}

/**
 * Short date range for compact rows
 *
 * @returns e.g. "Feb 12", "Feb 12–14" or "Feb 28 – Mar 2"
 */
export function formatShortDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const short: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (!endDate) {
    return start.toLocaleDateString('en-US', short);
  }

  const end = new Date(endDate);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', short)}–${end.getDate()}`;
  }
  return `${start.toLocaleDateString('en-US', short)} – ${end.toLocaleDateString('en-US', short)}`;
}

/**
 * When the event happens, relative to today
 *
 * @returns e.g. "Starts tomorrow", "In 5 days", "In 3 weeks", "In 2 months"
 * for upcoming events; "Today only", "Ends today", "Ends tomorrow",
 * "Until Feb 14" for ongoing ones; "Ended" for past ones
 */
export function getEventTiming(event: Event, now: Date = new Date()): string {
  const status = getEventStatus(event, now);

  if (status === 'past') return 'Ended';

  if (status === 'happening') {
    const daysLeft = daysBetween(now, eventEnd(event));
    if (daysLeft === 0) return event.endDate ? 'Ends today' : 'Today only';
    if (daysLeft === 1) return 'Ends tomorrow';
    return `Until ${eventEnd(event).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const daysUntil = daysBetween(now, new Date(event.startDate));
  if (daysUntil === 1) return 'Starts tomorrow';
  if (daysUntil < 14) return `In ${daysUntil} days`;
  if (daysUntil < 60) return `In ${Math.round(daysUntil / 7)} weeks`;
  return `In ${Math.round(daysUntil / 30)} months`;
}

/** Points the event's festival stamp awards, or undefined when it has none */
export function getEventPoints(event: Event): number | undefined {
  return event.festivalStamp?.available ? event.festivalStamp.pointsBonus : undefined;
}

/**
 * Upcoming and ongoing events, soonest first (past events removed)
 */
export function getUpcomingEvents(events: readonly Event[], now: Date = new Date()): Event[] {
  return events
    .filter((event) => getEventStatus(event, now) !== 'past')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export interface EventSection {
  key: string;
  title: string;
  /** The "Happening now" section, styled as live */
  live: boolean;
  data: Event[];
}

/**
 * Groups events (sorted soonest first) into list sections: "Happening now",
 * "This month", then one per month ("January 2027"). Empty sections are
 * left out.
 */
export function getEventSections(events: readonly Event[], now: Date = new Date()): EventSection[] {
  const sections: EventSection[] = [];
  const byKey = new Map<string, EventSection>();

  const sectionFor = (key: string, title: string, live = false) => {
    let section = byKey.get(key);
    if (!section) {
      section = { key, title, live, data: [] };
      byKey.set(key, section);
      sections.push(section);
    }
    return section;
  };

  for (const event of events) {
    const status = getEventStatus(event, now);
    if (status === 'past') continue;

    if (status === 'happening') {
      sectionFor('happening', 'Happening now', true).data.push(event);
      continue;
    }

    const start = new Date(event.startDate);
    const key = `${start.getFullYear()}-${start.getMonth()}`;
    const isThisMonth =
      start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    const title = isThisMonth
      ? 'This month'
      : start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    sectionFor(key, title).data.push(event);
  }

  // "Happening now" leads; month sections keep the events' (date) order
  return sections.sort((a, b) => Number(b.live) - Number(a.live));
}
