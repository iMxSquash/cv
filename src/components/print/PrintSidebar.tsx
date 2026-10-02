import { Flag } from "@/components/icons/Flag";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Enums } from "@/lib/database.types";
import type { Language, Link, MobilityItem, Profile } from "@/lib/cv/types";
import { IconTile } from "./IconTile";

// Typed by the Postgres enum: a new platform fails the typecheck until it gets a label.
const PLATFORM_LABELS: Record<Enums<"cv_link_platform">, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  freecodecamp: "FreeCodeCamp",
  website: "Site web",
  other: "Lien",
};

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
      <section aria-labelledby={id} className="grid gap-[12pt]">
        <h2 id={id} className={isTitleHidden ? "sr-only" : "text-print-caption-1 text-text-muted"}>
          {title}
        </h2>
        <ul className="grid gap-[12pt]">{children}</ul>
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

interface PrintSidebarProps {
  profile: Profile;
  links: Link[];
  languages: Language[];
  mobility: MobilityItem[];
}

export function PrintSidebar({ profile, links, languages, mobility }: PrintSidebarProps) {
  return (
    <aside className="relative isolate flex w-[176pt] shrink-0 flex-col gap-[16pt] p-[24pt]">
      <div aria-hidden="true" className="print-halos absolute inset-y-0 left-0 -z-10 w-[184pt]" />

      <header>
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

      <SidebarGroup id="print-contact" title="Contact" isTitleHidden>
        <InfoRow
          icon={<DiscIcon name="mail" />}
          label="Email"
          value={<a href={`mailto:${profile.email}`}>{profile.email}</a>}
        />
        {profile.phone && (
          <InfoRow
            icon={<DiscIcon name="phone" />}
            label="Téléphone"
            value={<a href={`tel:${profile.phone.replaceAll(" ", "")}`}>{profile.phone}</a>}
          />
        )}
        {profile.location && (
          <InfoRow icon={<DiscIcon name="location" />} label="Adresse" value={profile.location} />
        )}
      </SidebarGroup>

      {links.length > 0 && (
        <SidebarGroup id="print-links" title="Réseaux sociaux">
          {links.map((link) => (
            <InfoRow
              key={link.id}
              icon={<DiscIcon name={link.platform} />}
              label={PLATFORM_LABELS[link.platform]}
              value={<ExternalLink href={link.url}>{link.label}</ExternalLink>}
            />
          ))}
        </SidebarGroup>
      )}

      {languages.length > 0 && (
        <SidebarGroup id="print-languages" title="Langues">
          {languages.map((language) => (
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

      {mobility.length > 0 && (
        <SidebarGroup id="print-mobility" title="Mobilité et disponibilité">
          {mobility.map((item) => (
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
