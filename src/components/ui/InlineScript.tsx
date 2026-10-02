"use client";

/**
 * A script that runs while the server HTML is parsed, before the first paint.
 * Rendered as `text/plain` on the client: React would warn about (and never
 * run) a script it creates itself, e.g. after a client-side navigation.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
