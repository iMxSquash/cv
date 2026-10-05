import { formatMonthYear, hasDistinctStartYear } from "@/lib/cv/format";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

/** SQL date "2025-09-01" -> <time dateTime="2025-09">sept. 2025</time> */
function MonthTime({ date, locale }: { date: string; locale: Locale }) {
  return <time dateTime={date.slice(0, 7)}>{formatMonthYear(date, locale)}</time>;
}

/** "sept. 2025 – sept. 2026", or "… – aujourd'hui" when the end is open. */
export function MonthPeriod({
  start,
  end,
  locale,
}: {
  start: string;
  end: string | null;
  locale: Locale;
}) {
  return (
    <>
      <MonthTime date={start} locale={locale} />
      {" – "}
      {end ? <MonthTime date={end} locale={locale} /> : getMessages(locale).openEnd}
    </>
  );
}

/** "2023 – 2026", or the end year alone when there is no distinct start. */
export function YearPeriod({ start, end }: { start: number | null; end: number }) {
  return (
    <>
      {hasDistinctStartYear(start, end) && (
        <>
          <time>{start}</time>
          {" – "}
        </>
      )}
      <time>{end}</time>
    </>
  );
}
