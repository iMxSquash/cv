"use client";

/**
 * A script that runs while the server HTML is parsed, before the first paint.
 * Rendered as `text/plain` on the client: React would warn about (and never
 * run) a script it creates itself, e.g. after a client-side navigation. The
 * nonce lets the server-rendered one pass the Content-Security-Policy.
 */
export function InlineScript({ html, nonce }: { html: string; nonce?: string }) {
  return (
    <script
      nonce={nonce}
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
