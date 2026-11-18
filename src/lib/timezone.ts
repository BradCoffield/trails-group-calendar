/**
 * Event times are wall-clock times in each event's own timezone (stored in
 * the `time_zone` column, defaulting to CALENDAR_TIME_ZONE). The database
 * stores timestamptz instants; naive form strings like "2026-11-18T10:00"
 * are interpreted as wall time in the event's zone, and all display
 * formatting renders instants back into that zone.
 */

export const CALENDAR_TIME_ZONE =
  process.env.NEXT_PUBLIC_CALENDAR_TIME_ZONE || "America/Denver";

/** IANA zones offered in the event form's timezone picker. */
export const TIME_ZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Phoenix", label: "Arizona, no DST (Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska Time (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "UTC", label: "UTC" },
];

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

function wallClockParts(instant: Date | number, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

// Matches strings that already carry an explicit offset, e.g. "...Z" or "...-07:00"
const EXPLICIT_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Parse a form/API datetime string as wall-clock time in the given zone.
 * Strings with an explicit offset or trailing Z are parsed as instants.
 */
export function parseCalendarDateTime(
  value: string,
  timeZone: string = CALENDAR_TIME_ZONE,
): Date {
  const trimmed = value.trim();
  if (EXPLICIT_OFFSET.test(trimmed)) return new Date(trimmed);

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return new Date(trimmed);

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
  const naiveUtcMs = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);

  // zoneOffset(utcMs) = wall-clock fields of utcMs in the zone, as a UTC ms delta
  const zoneOffsetMs = (utcMs: number) => {
    const p = wallClockParts(utcMs, timeZone);
    return (
      Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utcMs
    );
  };

  // Second pass resolves the correct offset across DST transitions
  const utcMs = naiveUtcMs - zoneOffsetMs(naiveUtcMs - zoneOffsetMs(naiveUtcMs));
  return new Date(utcMs);
}

/** Convert an instant to "YYYY-MM-DDTHH:mm" wall time in the given zone. */
export function toZonedDateTimeInput(
  instant: string | Date,
  timeZone: string = CALENDAR_TIME_ZONE,
): string {
  const date =
    typeof instant === "string" ? parseCalendarDateTime(instant, timeZone) : instant;
  const p = wallClockParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** A Date whose local-time fields equal the current wall time in the calendar zone. */
export function calendarNow(): Date {
  return new Date(toZonedDateTimeInput(new Date(), CALENDAR_TIME_ZONE));
}
