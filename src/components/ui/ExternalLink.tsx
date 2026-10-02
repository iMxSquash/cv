interface ExternalLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Outgoing link: new tab without opener access, announced to screen readers. */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  );
}
