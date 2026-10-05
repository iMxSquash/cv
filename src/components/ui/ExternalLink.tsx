import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

interface ExternalLinkProps {
  /** Language of the screen reader announcement; the admin is French. */
  locale?: Locale;
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Outgoing link: new tab without opener access, announced to screen readers. */
export function ExternalLink({ href, className, children, locale = "fr" }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {getMessages(locale).newTab}</span>
    </a>
  );
}
