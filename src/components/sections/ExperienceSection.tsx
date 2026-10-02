import { CvIcon } from "@/components/icons/CvIcon";
import { Badge } from "@/components/ui/Badge";
import { PinnedStage } from "@/components/scroll/PinnedStage";
import { Card } from "@/components/ui/Card";
import { MonthPeriod, YearPeriod } from "@/components/ui/Period";
import { isOngoing } from "@/lib/cv/format";
import { buildTrajectory } from "@/lib/cv/trajectory";
import type { Education, Experience } from "@/lib/cv/types";
import { ExperienceMotion } from "./ExperienceMotion";

const VISUAL_CLASS =
  "gradient-panel absolute top-1/2 h-[45vmin] w-[clamp(2.5rem,12vmin,11rem)] -translate-y-1/2 rounded-[clamp(1rem,3vmin,2rem)]";

/**
 * The journey told one step at a time, centered between two gradient panels.
 * It only restates the cards below, so it is decorative: hidden from assistive
 * technologies, and not rendered at all when nothing is pinned.
 */
function Trajectory({ experiences, education }: Omit<ExperienceSectionProps, "today">) {
  const steps = buildTrajectory(experiences, education);
  if (steps.length === 0) return null;
  return (
    <div aria-hidden="true" className="hidden pinned:block">
      <PinnedStage screens={8} mobileScreens={5} stageClassName="grid place-items-center px-6">
        <div data-trajectory-visual className={`${VISUAL_CLASS} left-[3vw]`} />
        <div
          data-trajectory-visual
          className={`${VISUAL_CLASS} right-[3vw] [--panel-angle:340deg]`}
        />
        {steps.map((step) => (
          <p
            key={step.label}
            data-trajectory-step
            className="col-start-1 row-start-1 max-w-[min(64vw,52rem)] text-center"
          >
            <span className="mb-4 block font-medium text-accent">{step.year}</span>
            <span className="block title-section text-balance">{step.label}.</span>
          </p>
        ))}
      </PinnedStage>
    </div>
  );
}

interface ExperienceSectionProps {
  experiences: Experience[];
  education: Education[];
  today: Date;
}

export function ExperienceSection({ experiences, education, today }: ExperienceSectionProps) {
  return (
    <section id="experiences" aria-labelledby="experiences-title" data-theme="dark">
      <ExperienceMotion>
        <Trajectory experiences={experiences} education={education} />
        <div className="section-shell">
          <h2 id="experiences-title" className="title-section">
            Expériences
          </h2>
          <ol data-experience-cards className="mt-10 grid gap-4">
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
                        <MonthPeriod start={experience.start_date} end={experience.end_date} />
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
          <ol data-experience-cards className="mt-10 grid gap-4 md:grid-cols-2">
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
                    <YearPeriod start={entry.start_year} end={entry.end_year} />
                  </p>
                </article>
              </Card>
            ))}
          </ol>
        </div>
      </ExperienceMotion>
    </section>
  );
}
