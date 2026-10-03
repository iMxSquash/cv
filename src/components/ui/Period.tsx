import { formatMonthYear, hasDistinctStartYear, OPEN_END_LABEL } from "@/lib/cv/format";

/** SQL date "2025-09-01" -> <time dateTime="2025-09">sept. 2025</time> */
function MonthTime({ date }: { date: string }) {
  return <time dateTime={date.slice(0, 7)}>{formatMonthYear(date)}</time>;
}

/** "sept. 2025 – sept. 2026", or "… – aujourd'hui" when the end is open. */
export function MonthPeriod({ start, end }: { start: string; end: string | null }) {
  return (
    <>
      <MonthTime date={start} />
      {" – "}
      {end ? <MonthTime date={end} /> : OPEN_END_LABEL}
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
