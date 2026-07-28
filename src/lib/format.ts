/** Shared, locale-stable formatting helpers (server and client safe). */

const MS_PER_DAY = 86_400_000;

/** "2026-05-11" -> UTC midnight timestamp. */
function utcMidnight(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** "2026-05-11" -> "May 11, 2026". Locale is pinned so SSR and CSR agree. */
export function formatDate(iso: string): string {
  return new Date(utcMidnight(iso)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Whole days from `from` to the target date, snapped to midnight UTC on both
 * ends so the number never drifts by one partway through the day.
 */
export function daysUntil(iso: string, from: Date = new Date()): number {
  const today = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  );
  return Math.round((utcMidnight(iso) - today) / MS_PER_DAY);
}

/** 12 -> "D-12", 0 -> "D-DAY", -3 -> "D+3". */
export function dDayLabel(days: number): string {
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
}

/** Inline style for the poster gradient used when a project has no image. */
export function accentStyle([from, to]: [string, string]) {
  return {
    backgroundImage: `radial-gradient(120% 120% at 20% 0%, ${from} 0%, ${to} 62%, #08080b 100%)`,
  };
}
