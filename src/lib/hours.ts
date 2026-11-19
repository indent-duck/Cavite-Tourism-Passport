/**
 * Operating-hours helpers.
 *
 * Sites store hours as free text ("8:00 AM - 5:00 PM", "24 hours",
 * "Open 24 hours"). These helpers understand those two shapes and return null
 * for anything else, so callers can fall back to showing the raw text.
 */

export type OpenStatus =
  | { kind: "always" }
  | { kind: "open"; closesAt: string }
  | { kind: "closed"; opensAt: string };

const ALWAYS_OPEN = /^\s*(open\s+)?24\s*(hours|hrs)\s*$/i;
const TIME = String.raw`(\d{1,2}):(\d{2})\s*(AM|PM)`;
const RANGE = new RegExp(String.raw`^\s*${TIME}\s*[-–—]\s*${TIME}\s*$`, "i");

function toMinutes(hour: string, minute: string, meridiem: string): number {
  const h = Number(hour) % 12;
  return (meridiem.toUpperCase() === "PM" ? h + 12 : h) * 60 + Number(minute);
}

function formatTime(hour: string, minute: string, meridiem: string): string {
  return `${Number(hour)}:${minute} ${meridiem.toUpperCase()}`;
}

/**
 * Whether a site is open at `now`, or null when the hours can't be parsed.
 * Handles ranges that run past midnight (e.g. "6:00 PM - 2:00 AM").
 */
export function getOpenStatus(
  operatingHours: string | undefined,
  now: Date = new Date(),
): OpenStatus | null {
  if (!operatingHours) return null;
  if (ALWAYS_OPEN.test(operatingHours)) return { kind: "always" };

  const match = RANGE.exec(operatingHours);
  if (!match) return null;

  const [, oh, om, omer, ch, cm, cmer] = match;
  const opens = toMinutes(oh, om, omer);
  const closes = toMinutes(ch, cm, cmer);
  const current = now.getHours() * 60 + now.getMinutes();

  const isOpen =
    opens <= closes
      ? current >= opens && current < closes
      : current >= opens || current < closes; // overnight

  return isOpen
    ? { kind: "open", closesAt: formatTime(ch, cm, cmer) }
    : { kind: "closed", opensAt: formatTime(oh, om, omer) };
}

