import { CvIcon } from "@/components/icons/CvIcon";
import type { Link, Profile } from "@/lib/cv/types";

const LINK_CLASS =
  "inline-flex min-h-11 items-center gap-2 font-medium text-accent underline-offset-4 hover:underline";

export function ContactFooter({ profile, links }: { profile: Profile; links: Link[] }) {
  return (
    <footer id="contact" data-theme="light" className="section-shell">
      <h2 className="title-section">Contact</h2>
      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
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
            <a href={link.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              <CvIcon name={link.platform} />
              {link.label}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </li>
        ))}
      </ul>
      {profile.location && (
        <p className="mt-6 flex items-center gap-2 text-text-muted">
          <CvIcon name="location" />
          {profile.location}
        </p>
      )}
    </footer>
  );
}
