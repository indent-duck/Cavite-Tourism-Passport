import type { Event } from '@/data/types';

/**
 * Compute event status from dates
 * 
 * @param event - Event object with startDate and optional endDate (ISO strings)
 * @returns "happening" if current date is within event dates, "upcoming" if before, "past" if after
 */
export function getEventStatus(event: Event): 'happening' | 'upcoming' | 'past' {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;
  
  // Set times to start of day for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const eventEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  if (today >= eventStart && today <= eventEnd) {
    return 'happening';
  } else if (today < eventStart) {
    return 'upcoming';
  } else {
    return 'past';
  }
}

/**
 * Format event date range
 * 
 * @param startDate - Start date (ISO string)
 * @param endDate - Optional end date (ISO string)
 * @returns Formatted date string (e.g., "February 12, 2027" or "February 12–14, 2027")
 */
export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  if (!endDate) {
    return start.toLocaleDateString('en-US', options);
  }
  
  const end = new Date(endDate);
  
  // Same month and year
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    const monthYear = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    return `${monthYear} ${start.getDate()}–${end.getDate()}`;
  }
  
  // Different months or years
  return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
}

/**
 * Format date badge for event card
 * 
 * @param startDate - Start date (ISO string)
 * @param endDate - Optional end date (ISO string)
 * @returns Short date string (e.g., "FEB 12" or "FEB 12-14")
 */
export function formatDateBadge(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const month = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = start.getDate();
  
  if (!endDate) {
    return `${month} ${day}`;
  }
  
  const end = new Date(endDate);
  
  // Same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${month} ${day}-${end.getDate()}`;
  }
  
  // Different month
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${day}-${endMonth} ${end.getDate()}`;
}
