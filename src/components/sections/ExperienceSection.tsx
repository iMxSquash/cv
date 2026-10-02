import { CvIcon } from "@/components/icons/CvIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatMonthYear, isOngoing } from "@/lib/cv/format";
import type { Education, Experience } from "@/lib/cv/types";

/** SQL date "2025-09-01" -> <time dateTime="2025-09">sept. 2025</time> */
function MonthTime({ date }: { date: string }) {
  return <time dateTime={date.slice(0, 7)}>{formatMonthYear(date)}</time>;
}

interface ExperienceSectionProps {
  experiences: Experience[];
  education: Education[];
  today: Date;
}

export function ExperienceSection({ experiences, education, today }: ExperienceSectionProps) {
  return (
    <section
      id="experiences"
      aria-labelledby="experiences-title"
      data-theme="dark"
      className="section-shell"
    >
      <h2 id="experiences-title" className="title-section">
        Expériences
      </h2>
      <ol className="mt-10 grid gap-4">
        {experiences.map((experience) => (
          <Card key={experience.id} as="li">
            <article className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-text-muted">{experience.role}</p>
                <h3 className="title-card">{experience.company}</h3>
              </div>
              <div className="flex flex-col gap-1 md:items-end">
                <p className="flex items-center gap-2 text-caption">
                  {isOngoing(experience.start_date, experience.end_date, today) && (
                    <Badge>Actuel</Badge>
                  )}
                  <span>
                    <MonthTime date={experience.start_date} />
                    {" – "}
                    {experience.end_date ? <MonthTime date={experience.end_date} /> : "aujourd'hui"}
                  </span>
                </p>
                {experience.location && (
                  <p className="flex items-center gap-1 text-caption text-text-muted">
                    <CvIcon name="location" className="size-4" />
                    {experience.location}
                  </p>
                )}
              </div>
            </article>
          </Card>
        ))}
      </ol>

      <h2 className="mt-20 title-section">Éducation</h2>
      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {education.map((entry) => (
          <Card key={entry.id} as="li">
            <article>
              <p className="text-caption text-text-muted">
                {entry.school}
                {entry.city && `, ${entry.city}`}
              </p>
              <h3 className="mt-1 title-card">{entry.degree}</h3>
              {entry.details && <p className="mt-2">{entry.details}</p>}
              <p className="mt-2 text-caption text-text-muted">
                {entry.start_year !== null && entry.start_year !== entry.end_year && (
                  <>
                    <time>{entry.start_year}</time>
                    {" – "}
                  </>
                )}
                <time>{entry.end_year}</time>
              </p>
            </article>
          </Card>
        ))}
      </ol>
    </section>
  );
}
