import { Flag } from "@/components/icons/Flag";
import { AssetImage } from "@/components/ui/AssetImage";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { CvIcon } from "@/components/icons/CvIcon";
import { Constants, type Enums } from "@/lib/database.types";
import type { Language, Link, MobilityItem, Profile, Skill, Tool } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { PORTFOLIO_URL } from "@/lib/site";
import { IconTile } from "./IconTile";

/** A divider, then a titled list of rows; the contact group has no visible title in the Figma. */
function SidebarGroup({
  id,
  title,
  isTitleHidden = false,
  children,
}: {
  id: string;
  title: string;
  isTitleHidden?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <hr className="h-[0.5pt] border-0 bg-line" />
      <section aria-labelledby={id} className="grid gap-[10pt]">
        <h2 id={id} className={isTitleHidden ? "sr-only" : "text-print-caption-1 text-text-muted"}>
          {title}
        </h2>
        <ul className="grid gap-[10pt]">{children}</ul>
      </section>
    </>
  );
}

/** Icon, then a small label above (or below) the value, as in the Figma rows. */
function InfoRow({
  icon,
  label,
  value,
  isLabelFirst = true,
}: {
  icon: React.ReactNode;
  label?: string | null;
  value: React.ReactNode;
  isLabelFirst?: boolean;
}) {
  const caption = label && <span className="text-print-caption-1 text-text-muted">{label}</span>;
  return (
    <li className="flex items-center gap-[8pt]">
      {icon}
      <span className="flex min-w-0 flex-col gap-[2pt] break-words">
        {isLabelFirst && caption}
        <span className="text-print-body-2 font-medium">{value}</span>
        {!isLabelFirst && caption}
      </span>
    </li>
  );
}

function DiscIcon({ name }: { name: string }) {
  return <IconTile name={name} className="size-[16pt] rounded-full" iconClassName="size-[10pt]" />;
}

const PORTFOLIO_HOST = new URL(PORTFOLIO_URL).host;

// The sheet is for recruiters in the Paris area: commute and remote details, and the native
// language, only take room. The site still shows them.
const PRINT_HIDDEN_MOBILITY_ICONS: readonly string[] = ["metro", "home"];
const PRINT_HIDDEN_LANGUAGE_CODES: readonly string[] = ["fr"];

function ToolList({ label, tools }: { label: string; tools: Tool[] }) {
  return (
    <div>
      <h3 className="text-print-body-2 font-medium">{label}</h3>
      <ul className="mt-[4pt] flex flex-wrap gap-[2pt]">
        {tools.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center gap-[2pt] rounded-[2pt] bg-white px-[4pt] py-[1pt] text-print-caption-1"
          >
            <CvIcon name={tool.icon_key} className="size-[6pt]" />
            {tool.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillList({
  category,
  label,
  skills,
}: {
  category: Enums<"cv_skill_category">;
  label: string;
  skills: Skill[];
}) {
  return (
    <div>
      <h3 className="flex items-center gap-[4pt] text-print-body-2 font-medium">
        <CvIcon name={category} className="size-[8pt]" />
        {label}
      </h3>
      <ul className="mt-[4pt] flex flex-wrap gap-[2pt]">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="rounded-[2pt] bg-white px-[4pt] py-[1pt] text-print-caption-1"
          >
            {skill.label}
            {skill.details.length > 0 && (
              <span className="text-text-muted"> + {skill.details.join(", ")}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PrintSidebarProps {
  profile: Profile;
  links: Link[];
  languages: Language[];
  mobility: MobilityItem[];
  skills: Skill[];
  tools: Tool[];
  /** Null when no birth date is configured: the age row is then left out. */
  age: number | null;
  locale: Locale;
}

export function PrintSidebar({
  profile,
  links,
  languages,
  mobility,
  skills,
  tools,
  age,
  locale,
}: PrintSidebarProps) {
  const t = getMessages(locale);
  const printedLanguages = languages.filter(
    (language) => !PRINT_HIDDEN_LANGUAGE_CODES.includes(language.flag_code),
  );
  const printedMobility = mobility.filter(
    (item) => !PRINT_HIDDEN_MOBILITY_ICONS.includes(item.icon_key),
  );
  // A category without skills is not printed at all.
  const skillGroups = Constants.public.Enums.cv_skill_category
    .map((category) => ({
      category,
      skills: skills.filter((skill) => skill.category === category),
    }))
    .filter((group) => group.skills.length > 0);
  return (
    <aside className="relative isolate flex w-[164pt] shrink-0 flex-col gap-[12pt] py-[32pt] pr-[20pt] pl-[30pt]">
      <div aria-hidden="true" className="print-halos absolute inset-y-0 left-0 -z-10 w-[164pt]" />

      <header>
        {profile.avatar_url && (
          <AssetImage src={profile.avatar_url} className="mb-[12pt] size-[48pt] rounded-full" />
        )}
        <h1 className="font-display text-print-h1 font-medium">{profile.full_name}</h1>
        <p className="mt-[4pt] font-display text-print-h2 font-medium text-accent">
          {profile.headline}
        </p>
      </header>

      {profile.quote && (
        <figure>
          <blockquote className="font-display text-print-h3 font-medium text-text-muted">
            <span aria-hidden="true">“ </span>
            {profile.quote}
            <span aria-hidden="true"> ”</span>
          </blockquote>
          {profile.quote_author && (
            <figcaption className="mt-[2pt] pl-[8pt] text-print-caption-1 text-text-muted">
              {profile.quote_author}
            </figcaption>
          )}
        </figure>
      )}

      <SidebarGroup id="print-contact" title={t.print.contact} isTitleHidden>
        <InfoRow
          icon={<DiscIcon name="mail" />}
          label={t.print.email}
          value={<a href={`mailto:${profile.email}`}>{profile.email}</a>}
        />
        {profile.phone && (
          <InfoRow
            icon={<DiscIcon name="phone" />}
            label={t.print.phone}
            value={<a href={`tel:${profile.phone.replaceAll(" ", "")}`}>{profile.phone}</a>}
          />
        )}
        {age !== null && (
          <InfoRow
            icon={<DiscIcon name="user" />}
            label={t.print.age}
            value={t.print.ageValue(age)}
          />
        )}
        {profile.location && (
          <InfoRow
            icon={<DiscIcon name="location" />}
            label={t.print.address}
            value={profile.location}
          />
        )}
        <InfoRow
          icon={<DiscIcon name="website" />}
          label={t.footer.portfolio}
          value={
            <ExternalLink href={PORTFOLIO_URL} locale={locale}>
              {PORTFOLIO_HOST}
            </ExternalLink>
          }
        />
        {links.map((link) => (
          <InfoRow
            key={link.id}
            icon={<DiscIcon name={link.platform} />}
            label={t.linkPlatforms[link.platform]}
            value={
              <ExternalLink href={link.url} locale={locale}>
                {link.label}
              </ExternalLink>
            }
          />
        ))}
      </SidebarGroup>

      {(skillGroups.length > 0 || tools.length > 0) && (
        <>
          <hr className="h-[0.5pt] border-0 bg-line" />
          <section aria-labelledby="print-skills" className="grid gap-[8pt]">
            <h2 id="print-skills" className="text-print-caption-1 text-text-muted">
              {t.skills.title}
            </h2>
            {skillGroups.map(({ category, skills: groupSkills }) => (
              <SkillList
                key={category}
                category={category}
                label={t.skills.categories[category]}
                skills={groupSkills}
              />
            ))}
            {tools.length > 0 && <ToolList label={t.print.tools} tools={tools} />}
          </section>
        </>
      )}

      {printedLanguages.length > 0 && (
        <SidebarGroup id="print-languages" title={t.print.languages}>
          {printedLanguages.map((language) => (
            <InfoRow
              key={language.id}
              icon={<Flag code={language.flag_code} className="h-[12pt] w-[16pt]" />}
              label={language.level}
              value={language.name}
              isLabelFirst={false}
            />
          ))}
        </SidebarGroup>
      )}

      {printedMobility.length > 0 && (
        <SidebarGroup id="print-mobility" title={t.print.mobility}>
          {printedMobility.map((item) => (
            <InfoRow
              key={item.id}
              icon={<DiscIcon name={item.icon_key} />}
              label={item.detail}
              value={item.label}
              isLabelFirst={false}
            />
          ))}
        </SidebarGroup>
      )}
    </aside>
  );
}
