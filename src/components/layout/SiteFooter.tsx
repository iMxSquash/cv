import NextLink from "next/link";
import { CvIcon } from "@/components/icons/CvIcon";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Link, Profile } from "@/lib/cv/types";

const LINK_CLASS =
  "inline-flex min-h-11 items-center gap-2 font-medium text-accent underline-offset-4 hover:underline";

interface SiteFooterProps {
  profile: Profile;
  links: Link[];
  today: Date;
}

export function SiteFooter({ profile, links, today }: SiteFooterProps) {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-title"
      data-theme="dark"
      className="section-shell"
    >
      <h2 id="contact-title" className="title-card">
        Contact
      </h2>
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
            <ExternalLink href={link.url} className={LINK_CLASS}>
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
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-text-muted/30 pt-6 text-caption text-text-muted">
        <p>
          © {today.getFullYear()} {profile.full_name}
        </p>
        <NextLink href="/mentions-legales" className={LINK_CLASS}>
          Mentions légales
        </NextLink>
      </div>
    </footer>
  );
}
