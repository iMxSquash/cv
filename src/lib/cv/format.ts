export interface TextSegment {
  text: string;
  isKeyword: boolean;
}

const KEYWORD_PATTERN = /\*\*(.+?)\*\*/g;

/**
 * Splits the `about` light markup (`**word**` = highlighted keyword) into
 * segments rendered as React text nodes: the content never goes through HTML.
 */
export function parseKeywords(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(KEYWORD_PATTERN)) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isKeyword: false });
    }
    segments.push({ text: match[1], isKeyword: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isKeyword: false });
  }
  return segments;
}

/** SQL `date` columns ("YYYY-MM-DD") read as UTC midnight, so the server timezone never shifts them. */
function parseSqlDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

/** True when `today` falls within [start, end]; a null end means ongoing. */
export function isOngoing(startDate: string, endDate: string | null, today: Date): boolean {
  if (parseSqlDate(startDate) > today) return false;
  return endDate === null || parseSqlDate(endDate) >= today;
}

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2025-09-01" -> "sept. 2025" */
export function formatMonthYear(value: string): string {
  return MONTH_YEAR_FORMAT.format(parseSqlDate(value));
}

/** "sept. 2025 – sept. 2026", or "sept. 2025 – aujourd'hui" when ongoing. */
export function formatPeriod(startDate: string, endDate: string | null): string {
  const end = endDate === null ? "aujourd'hui" : formatMonthYear(endDate);
  return `${formatMonthYear(startDate)} – ${end}`;
}

/** "2023 – 2026", or just "2023" for a single-year entry. */
export function formatYearRange(startYear: number | null, endYear: number): string {
  return startYear === null || startYear === endYear ? `${endYear}` : `${startYear} – ${endYear}`;
}
