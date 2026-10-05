import type { CSSProperties } from "react";
import NextLink from "next/link";
import { CvIcon } from "@/components/icons/CvIcon";
import { FooterMotion } from "@/components/layout/FooterMotion";
import { AssetImage } from "@/components/ui/AssetImage";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { formatLongDate } from "@/lib/cv/format";
import type { Link, Profile } from "@/lib/cv/types";
import { type Locale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

const LINK_CLASS = "link-slide inline-flex min-h-11 items-center gap-2 font-medium text-accent";

interface SiteFooterProps {
  profile: Profile;
  links: Link[];
  today: Date;
  locale: Locale;
}

export function SiteFooter({ profile, links, today, locale }: SiteFooterProps) {
  const t = getMessages(locale).footer;
  return (
    <footer id="contact" aria-labelledby="contact-title" data-theme="dark">
      <FooterMotion>
        <div data-footer-content className="section-shell pb-0">
          <div className="flex items-center gap-4">
            {profile.avatar_url && (
              <AssetImage src={profile.avatar_url} className="size-14 rounded-full" />
            )}
            <h2 id="contact-title" className="title-card">
              {t.contact}
            </h2>
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
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
            <p className="mt-4 flex items-center gap-2 text-text-muted">
              <CvIcon name="location" />
              {profile.location}
            </p>
          )}
          <NextLink
            href={localePath(locale, "/print")}
            className="link-slide mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-raised px-5 font-medium text-accent shadow-elevation"
          >
            <CvIcon name="download" />
            {t.downloadPdf}
          </NextLink>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-text-muted/30 pt-6 text-caption text-text-muted">
            <p>
              © {today.getFullYear()} {profile.full_name} · {t.updatedOn}{" "}
              <time dateTime={profile.updated_at}>
                {formatLongDate(profile.updated_at, locale)}
              </time>
            </p>
            <NextLink href={localePath(locale, "/mentions-legales")} className={LINK_CLASS}>
              {t.legal}
            </NextLink>
          </div>
        </div>
        {/* Decorative: the glow and the oversized name carry no information the content above lacks. */}
        <div data-footer-stage aria-hidden="true" className="footer-stage">
          <div data-footer-glow className="absolute inset-0">
            <div className="footer-glow" />
          </div>
          <span
            data-footer-name
            className="footer-name"
            style={{ "--name-length": profile.full_name.length } as CSSProperties}
          >
            {profile.full_name}
          </span>
        </div>
      </FooterMotion>
    </footer>
  );
}
