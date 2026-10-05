import { CvIcon } from "@/components/icons/CvIcon";
import { MonthPeriod, YearPeriod } from "@/components/ui/Period";
import { Constants, type Enums } from "@/lib/database.types";
import { isOngoing, parseKeywords } from "@/lib/cv/format";
import type { Education, Experience, Profile, Skill, Tool } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { IconTile } from "./IconTile";

// Typed by the Postgres enum: a new category fails the typecheck until it gets colors.
const SKILL_GROUPS: Record<Enums<"cv_skill_category">, { text: string; tint: string }> = {
  design: {
    text: "text-(--palette-primary-dark)",
    tint: "bg-(--palette-primary-lighter)",
  },
  development: {
    text: "text-(--palette-secondary-dark)",
    tint: "bg-(--palette-secondary-lighter)",
  },
};

const TILE_CLASS = "rounded-[4pt] bg-surface-raised";

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
    <section aria-labelledby={id} className="flex gap-[16pt]">
      <div aria-hidden="true" className="flex shrink-0 flex-col items-center">
        <span className="grid size-[16pt] place-items-center rounded-full bg-white shadow-elevation">
          <span className="size-[4pt] rounded-full bg-text" />
        </span>
        {!isLast && <span className="w-[0.5pt] flex-1 bg-line" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[16pt] pb-[24pt]">
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
      className={`flex items-start gap-[8pt] rounded-[4pt] px-[12pt] py-[8pt] ${isCurrent ? "bg-surface" : "bg-surface-raised"}`}
    >
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
            <MonthPeriod start={experience.start_date} end={experience.end_date} locale={locale} />
          </span>
        </p>
        {experience.location && (
          <p className="flex items-center gap-[2pt] text-print-caption-2 text-text-muted">
            <CvIcon name="location" className="size-[6pt]" />
            {experience.location}
          </p>
        )}
      </div>
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

function SkillGroup({
  category,
  label,
  skills,
}: {
  category: Enums<"cv_skill_category">;
  label: string;
  skills: Skill[];
}) {
  const group = SKILL_GROUPS[category];
  return (
    <div className="min-w-0 flex-1">
      <h3 className="flex items-center gap-[4pt] text-print-body-2 font-medium">
        <span
          className={`grid size-[12pt] place-items-center rounded-full ${group.tint} ${group.text}`}
        >
          <CvIcon name={category} className="size-[8pt]" />
        </span>
        {label}
      </h3>
      <ul className="mt-[8pt] flex flex-wrap gap-[4pt]">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className={`flex grow flex-col items-center justify-center px-[8pt] py-[8pt] text-center ${TILE_CLASS}`}
          >
            <span className={`text-print-body-2 font-medium ${group.text}`}>{skill.label}</span>
            {skill.details.length > 0 && (
              <span className="text-print-caption-2 text-text-muted">
                + {skill.details.join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PrintContentProps {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  tools: Tool[];
  today: Date;
  locale: Locale;
}

export function PrintContent({
  profile,
  experiences,
  education,
  skills,
  tools,
  today,
  locale,
}: PrintContentProps) {
  const t = getMessages(locale);
  return (
    <div className="min-w-0 flex-1 py-[32pt] pr-[24pt]">
      <TimelineSection id="print-about" title={t.about.title}>
        <p className={`p-[12pt] text-print-body-1 font-medium ${TILE_CLASS}`}>
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

      <TimelineSection id="print-education" title={t.experiences.education}>
        <ol className="flex gap-[4pt]">
          {education.map((entry) => (
            <EducationItem key={entry.id} entry={entry} />
          ))}
        </ol>
      </TimelineSection>

      <TimelineSection id="print-skills" title={t.skills.title}>
        <div className="flex gap-[12pt]">
          {Constants.public.Enums.cv_skill_category.map((category) => (
            <SkillGroup
              key={category}
              category={category}
              label={t.skills.categories[category]}
              skills={skills.filter((skill) => skill.category === category)}
            />
          ))}
        </div>
      </TimelineSection>

      <TimelineSection id="print-tools" title={t.print.tools} isLast>
        <ul className="flex gap-[4pt]">
          {tools.map((tool) => (
            <li
              key={tool.id}
              className={`flex h-[64pt] flex-1 flex-col items-center justify-center gap-[4pt] p-[8pt] text-center ${TILE_CLASS}`}
            >
              <CvIcon name={tool.icon_key} className="size-[24pt]" />
              <span className="text-print-body-2 font-medium">{tool.name}</span>
              {tool.purpose && (
                <span className="text-print-caption-2 text-text-muted">{tool.purpose}</span>
              )}
            </li>
          ))}
        </ul>
      </TimelineSection>
    </div>
  );
}
