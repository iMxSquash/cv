import type { Education, Experience } from "./types";

/** SQL `date` ("YYYY-MM-DD") to its year, without any timezone shift. */
function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

export interface TrajectoryStep {
  year: number;
  label: string;
}

type ExperienceDates = Pick<Experience, "role" | "start_date" | "end_date">;
type EducationDates = Pick<Education, "degree" | "start_year" | "end_year">;

/**
 * The resume as a chronological journey, oldest step first: one step per
 * distinct role or degree, dated by its first start year.
 */
export function buildTrajectory(
  experiences: ExperienceDates[],
  education: EducationDates[],
): TrajectoryStep[] {
  const entries = [
    ...experiences.map((entry) => ({
      label: entry.role,
      start: yearOf(entry.start_date),
      end: entry.end_date ? yearOf(entry.end_date) : Infinity,
    })),
    ...education.map((entry) => ({
      label: entry.degree,
      start: entry.start_year ?? entry.end_year,
      end: entry.end_year,
    })),
  ].sort((a, b) => a.start - b.start || a.end - b.end);

  const seen = new Set<string>();
  return entries.flatMap(({ label, start }) => {
    if (seen.has(label)) return [];
    seen.add(label);
    return [{ year: start, label }];
  });
}
