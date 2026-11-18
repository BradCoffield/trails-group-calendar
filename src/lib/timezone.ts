/**
 * All event times in this app are wall-clock times in the calendar's
 * configured timezone (Mountain Time for TRAILS). The database stores
 * timestamptz instants; naive form strings like "2026-11-18T10:00" are
 * interpreted as wall time in CALENDAR_TIME_ZONE, and all display
 * formatting renders instants back into the same zone.
 */

export const CALENDAR_TIME_ZONE =
  process.env.NEXT_PUBLIC_CALENDAR_TIME_ZONE || "America/Denver";

const wallClockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CALENDAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function wallClockParts(instant: Date | number) {
  const parts = wallClockFormatter.formatToParts(new Date(instant));
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
 * Parse a form/API datetime string as wall-clock time in CALENDAR_TIME_ZONE.
 * Strings with an explicit offset or trailing Z are parsed as instants.
 */
export function parseCalendarDateTime(value: string): Date {
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
    const p = wallClockParts(utcMs);
    return (
      Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utcMs
    );
  };

  // Second pass resolves the correct offset across DST transitions
  const utcMs = naiveUtcMs - zoneOffsetMs(naiveUtcMs - zoneOffsetMs(naiveUtcMs));
  return new Date(utcMs);
}

/** Convert an instant to "YYYY-MM-DDTHH:mm" wall time in the calendar zone. */
export function toCalendarDateTimeInput(instant: string | Date): string {
  const date = typeof instant === "string" ? parseCalendarDateTime(instant) : instant;
  const p = wallClockParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** A Date whose local-time fields equal the current wall time in the calendar zone. */
export function calendarNow(): Date {
  return new Date(toCalendarDateTimeInput(new Date()));
}
