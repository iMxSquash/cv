import type { Education, Experience } from "./types";

/** SQL `date` ("YYYY-MM-DD") to its year, without any timezone shift. */
function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

export interface TrajectoryStep {
  label: string;
  /** Null for a degree dated by its end year only. */
  start: number | null;
  /** Null while the step is still open. */
  end: number | null;
  /** Companies or schools, most recent first. */
  organizations: string[];
}

type ExperienceDates = Pick<Experience, "role" | "company" | "start_date" | "end_date">;
type EducationDates = Pick<Education, "degree" | "school" | "start_year" | "end_year">;

interface Entry {
  label: string;
  organization: string;
  start: number | null;
  end: number | null;
}

const sortKey = (year: number | null, fallback: number) => year ?? fallback;

/**
 * The resume as a journey told backwards, most recent step first: one step
 * per distinct role or degree, spanning all its entries and naming every
 * organization it was held at.
 */
export function buildTrajectory(
  experiences: ExperienceDates[],
  education: EducationDates[],
): TrajectoryStep[] {
  const entries: Entry[] = [
    ...experiences.map((entry) => ({
      label: entry.role,
      organization: entry.company,
      start: yearOf(entry.start_date),
      end: entry.end_date ? yearOf(entry.end_date) : null,
    })),
    ...education.map((entry) => ({
      label: entry.degree,
      organization: entry.school,
      start: entry.start_year,
      end: entry.end_year,
    })),
  ].sort(
    (a, b) =>
      sortKey(a.start, a.end ?? Infinity) - sortKey(b.start, b.end ?? Infinity) ||
      sortKey(a.end, Infinity) - sortKey(b.end, Infinity),
  );

  // Merged in chronological order so a repeated role keeps its first year.
  const steps = new Map<string, TrajectoryStep>();
  for (const { label, organization, start, end } of entries) {
    const step = steps.get(label);
    if (!step) {
      steps.set(label, { label, start, end, organizations: [organization] });
      continue;
    }
    step.end = step.end === null || end === null ? null : Math.max(step.end, end);
    if (!step.organizations.includes(organization)) step.organizations.unshift(organization);
  }
  return [...steps.values()].reverse();
}
