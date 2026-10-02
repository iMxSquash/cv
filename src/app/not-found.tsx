import type { Metadata } from "next";
import NextLink from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="content" className="section-shell flex min-h-dvh flex-col justify-center">
      <p className="title-display text-accent-display">404</p>
      <h1 className="mt-6 title-section">Page introuvable</h1>
      <p className="mt-4 text-text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
      <NextLink
        href="/"
        className="mt-10 inline-flex min-h-11 w-fit items-center rounded-full bg-accent px-6 py-3 font-medium text-surface"
      >
        Retour au CV
      </NextLink>
    </main>
  );
}
