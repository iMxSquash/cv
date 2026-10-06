import NextLink from "next/link";
import { CvIcon } from "@/components/icons/CvIcon";
import { AssetImage } from "@/components/ui/AssetImage";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { formatLongDate } from "@/lib/cv/format";
import type { Link, Profile } from "@/lib/cv/types";
import { type Locale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const LINK_CLASS = "link-slide inline-flex min-h-11 items-center gap-2 font-medium text-text";

interface SiteFooterProps {
  profile: Profile;
  links: Link[];
  today: Date;
  locale: Locale;
}

export function SiteFooter({ profile, links, today, locale }: SiteFooterProps) {
  const messages = getMessages(locale);
  const t = messages.footer;
  return (
    // Pinned with motion: a card laid over the bottom of the closing stage, opened from its center by NextMotion.
    <footer
      id="contact"
      aria-labelledby="contact-title"
      data-theme="dark"
      data-theme-solid=""
      data-scroll-end=""
      className="orb-surface m-(--footer-inset) pinned:in-data-[webgl=ready]:bg-transparent pinned:in-data-[webgl=ready]:bg-none overflow-hidden rounded-[18px] [--footer-height:50svh] [--footer-inset:clamp(8px,1.25vw,18px)] max-md:[--footer-height:min(88svh,640px)] pinned:invisible pinned:absolute pinned:inset-x-(--footer-inset) pinned:bottom-(--footer-inset) pinned:z-10 pinned:m-0 pinned:h-[calc(var(--footer-height)-var(--footer-inset))] pinned:overflow-y-auto [@media(max-height:500px)]:[--footer-height:72svh]"
    >
      <div className="grid h-full content-between gap-6 p-[clamp(1rem,3.5vmin,3.5rem)] sm:grid-cols-[1fr_auto] sm:gap-x-[clamp(2rem,6vw,8rem)]">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url && (
              <AssetImage src={profile.avatar_url} className="size-14 rounded-full" />
            )}
            <h2 id="contact-title" className="title-card">
              {t.contact}
            </h2>
          </div>
          {profile.availability_detail && (
            <p className="max-w-xl text-text">{profile.availability_detail}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent-display px-6 py-3 font-medium text-surface"
              >
                <CvIcon name="mail" />
                {messages.next.writeEmail}
              </a>
            </Magnetic>
            <Magnetic>
              <NextLink
                href={localePath(locale, "/print")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-raised px-5 font-medium text-accent shadow-elevation"
              >
                <CvIcon name="download" />
                {t.downloadPdf}
              </NextLink>
            </Magnetic>
          </div>
        </div>
        <div>
          <ul className="flex flex-wrap gap-x-8 sm:flex-col sm:gap-x-0">
            <li>
              <a href={`mailto:${profile.email}`} className={LINK_CLASS}>
                <CvIcon name="mail" />
                {profile.email}
              </a>
            </li>
            {profile.phone && (
              <li>
                <a href={`tel:${profile.phone.replaceAll(" ", "")}`} className={LINK_CLASS}>
                  <CvIcon name="phone" />
                  {profile.phone}
                </a>
              </li>
            )}
            {links.map((link) => (
              <li key={link.id}>
                <ExternalLink href={link.url} className={LINK_CLASS} locale={locale}>
                  <CvIcon name={link.platform} />
                  {link.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
          {profile.location && (
            <p className="mt-2 flex items-center gap-2 text-text">
              <CvIcon name="location" />
              {profile.location}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-t border-text/30 pt-4 text-caption text-text sm:col-span-2">
          <p>
            © {today.getFullYear()} {profile.full_name} · {t.updatedOn}{" "}
            <time dateTime={profile.updated_at}>{formatLongDate(profile.updated_at, locale)}</time>
          </p>
          <NextLink href={localePath(locale, "/mentions-legales")} className={LINK_CLASS}>
            {t.legal}
          </NextLink>
        </div>
      </div>
    </footer>
  );
}
