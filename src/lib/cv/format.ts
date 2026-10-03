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

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

/** Timestamp "2026-10-01T14:41:08Z" -> "1 octobre 2026", in the owner's timezone. */
export function formatLongDate(timestamp: string): string {
  return LONG_DATE_FORMAT.format(new Date(timestamp));
}

/** Wording of an ongoing period's end, shared by the page and /llms.txt. */
export const OPEN_END_LABEL = "aujourd'hui";

/** A degree shows its start year only when it differs from the end year. */
export function hasDistinctStartYear(start: number | null, end: number): start is number {
  return start !== null && start !== end;
}

/** "sept. 2025 – sept. 2026", or "… – aujourd'hui" when the end is open. */
export function formatMonthPeriod(start: string, end: string | null): string {
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : OPEN_END_LABEL}`;
}

/** "2023 – 2026", or the end year alone when there is no distinct start. */
export function formatYearPeriod(start: number | null, end: number): string {
  return hasDistinctStartYear(start, end) ? `${start} – ${end}` : String(end);
}
