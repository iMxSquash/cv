import { Flag } from "@/components/icons/Flag";
import { AssetImage } from "@/components/ui/AssetImage";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Language, Link, MobilityItem, Profile } from "@/lib/cv/types";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
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
  locale: Locale;
}

export function PrintSidebar({ profile, links, languages, mobility, locale }: PrintSidebarProps) {
  const t = getMessages(locale);
  return (
    <aside className="relative isolate flex w-[176pt] shrink-0 flex-col gap-[16pt] p-[24pt]">
      <div aria-hidden="true" className="print-halos absolute inset-y-0 left-0 -z-10 w-[184pt]" />

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

      <SidebarGroup id="print-contact" title="Contact" isTitleHidden>
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
        {profile.location && (
          <InfoRow
            icon={<DiscIcon name="location" />}
            label={t.print.address}
            value={profile.location}
          />
        )}
      </SidebarGroup>

      {links.length > 0 && (
        <SidebarGroup id="print-links" title={t.print.socials}>
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
      )}

      {languages.length > 0 && (
        <SidebarGroup id="print-languages" title={t.print.languages}>
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
        <SidebarGroup id="print-mobility" title={t.print.mobility}>
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
