import { CvIcon } from "@/components/icons/CvIcon";
import { MonthPeriod, YearPeriod } from "@/components/ui/Period";
import { isOngoing, parseKeywords, splitBulletLines } from "@/lib/cv/format";
import type { Education, Experience, Profile, Project } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { IconTile } from "./IconTile";

const TILE_CLASS = "rounded-[4pt] bg-surface-raised";

/** Dash-led list: a hanging dash keeps wrapped lines aligned with the text. */
function DashList({ lines, className = "" }: { lines: string[]; className?: string }) {
  if (lines.length === 0) return null;
  return (
    <ul className={`grid gap-[2pt] text-print-caption-1 ${className}`}>
      {lines.map((line) => (
        <li
          key={line}
          className="relative pl-[6pt] before:absolute before:left-0 before:content-['–']"
        >
          {line}
        </li>
      ))}
    </ul>
  );
}

/** One step of the vertical timeline: a dot on the rail, the title, then the content. */
function TimelineSection({
  id,
  title,
  isLast = false,
  children,
}: {
  id: string;
  title: string;
  isLast?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex gap-[16pt] break-inside-avoid">
      <div aria-hidden="true" className="flex shrink-0 flex-col items-center">
        <span className="grid size-[16pt] place-items-center rounded-full bg-white shadow-elevation">
          <span className="size-[4pt] rounded-full bg-text" />
        </span>
        {!isLast && <span className="w-[0.5pt] flex-1 bg-line" />}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col gap-[8pt] ${isLast ? "" : "pb-[14pt]"}`}>
        <h2 id={id} className="font-display text-print-h2 font-medium">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function ExperienceItem({
  experience,
  today,
  locale,
}: {
  experience: Experience;
  today: Date;
  locale: Locale;
}) {
  const isCurrent = isOngoing(experience.start_date, experience.end_date, today);
  return (
    <li
      className={`rounded-[4pt] px-[12pt] py-[8pt] break-inside-avoid ${isCurrent ? "bg-surface" : "bg-surface-raised"}`}
    >
      <div className="flex items-start gap-[8pt]">
        <IconTile
          name="briefcase"
          imageUrl={experience.logo_url}
          className="size-[20pt] rounded-[5pt]"
          iconClassName="size-[10pt]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-print-body-2 text-text-muted">{experience.role}</p>
          <h3 className="mt-[2pt] text-print-body-1 font-medium">{experience.company}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-[4pt]">
          <p className="flex items-center gap-[4pt] text-print-caption-1 text-text-muted">
            {isCurrent && (
              <span className="rounded-[2pt] bg-badge px-[2pt] text-badge-text">
                {getMessages(locale).experiences.current}
              </span>
            )}
            <span>
              <MonthPeriod
                start={experience.start_date}
                end={experience.end_date}
                locale={locale}
              />
            </span>
          </p>
          {experience.location && (
            <p className="flex items-center gap-[2pt] text-print-caption-2 text-text-muted">
              <CvIcon name="location" className="size-[6pt]" />
              {experience.location}
            </p>
          )}
        </div>
      </div>
      <DashList lines={splitBulletLines(experience.description)} className="mt-[6pt] pl-[28pt]" />
    </li>
  );
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <li className={`flex flex-col gap-[2pt] px-[10pt] py-[8pt] break-inside-avoid ${TILE_CLASS}`}>
      <h3 className="text-print-body-1 font-medium">{project.name}</h3>
      {project.url && (
        <a href={project.url} className="text-print-caption-1 text-accent">
          {project.url.replace(/^https:\/\//, "")}
        </a>
      )}
      {project.stack.length > 0 && (
        <p className="text-print-caption-1 text-text-muted">{project.stack.join(" · ")}</p>
      )}
      <DashList lines={splitBulletLines(project.description)} className="mt-[2pt]" />
    </li>
  );
}

function EducationItem({ entry }: { entry: Education }) {
  return (
    <li className={`flex flex-1 flex-col gap-[4pt] px-[12pt] py-[8pt] ${TILE_CLASS}`}>
      <div className="flex items-center gap-[8pt]">
        <IconTile
          name="school"
          imageUrl={entry.logo_url}
          className="size-[24pt] rounded-[4pt]"
          iconClassName="size-[14pt]"
        />
        <p className="text-print-caption-1 font-medium">
          {entry.school}
          {entry.city && <span className="block">{entry.city}</span>}
        </p>
      </div>
      <h3 className="text-print-body-2 font-medium">
        {entry.degree}
        {entry.details && <span className="block font-normal">{entry.details}</span>}
      </h3>
      <p className="text-print-caption-2 text-text-muted">
        <YearPeriod start={entry.start_year} end={entry.end_year} />
      </p>
    </li>
  );
}

interface PrintContentProps {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  today: Date;
  locale: Locale;
}

export function PrintContent({
  profile,
  experiences,
  education,
  projects,
  today,
  locale,
}: PrintContentProps) {
  const t = getMessages(locale);
  return (
    <div className="min-w-0 flex-1 py-[28pt] pr-[28pt]">
      <TimelineSection id="print-about" title={t.about.title}>
        <p className={`p-[12pt] text-print-body-1 font-medium whitespace-pre-line ${TILE_CLASS}`}>
          {parseKeywords(profile.about).map((segment, index) =>
            segment.isKeyword ? (
              <strong key={index} className="font-medium text-accent">
                {segment.text}
              </strong>
            ) : (
              segment.text
            ),
          )}
        </p>
      </TimelineSection>

      <TimelineSection id="print-experiences" title={t.experiences.title}>
        <ol className="grid gap-[4pt]">
          {experiences.map((experience) => (
            <ExperienceItem
              key={experience.id}
              experience={experience}
              today={today}
              locale={locale}
            />
          ))}
        </ol>
      </TimelineSection>

      {projects.length > 0 && (
        <TimelineSection id="print-projects" title={t.print.projects}>
          <ol className="grid grid-cols-3 gap-[4pt]">
            {projects.map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))}
          </ol>
        </TimelineSection>
      )}

      <TimelineSection id="print-education" title={t.experiences.education} isLast>
        <ol className="flex gap-[4pt]">
          {education.map((entry) => (
            <EducationItem key={entry.id} entry={entry} />
          ))}
        </ol>
      </TimelineSection>
    </div>
  );
}
