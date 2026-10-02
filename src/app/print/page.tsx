import type { Metadata } from "next";
import NextLink from "next/link";
import { PrintContent } from "@/components/print/PrintContent";
import { PrintControls } from "@/components/print/PrintControls";
import { PrintSidebar } from "@/components/print/PrintSidebar";
import { getCv } from "@/lib/cv/queries";
import "./print.css";

export const metadata: Metadata = {
  title: "CV imprimable",
  description: "Version A4 imprimable du CV d'Elwen Coussot.",
  robots: { index: false, follow: false },
};

const CONTROL_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-medium text-accent underline-offset-4 hover:underline";

export default async function PrintPage() {
  const cv = await getCv();
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 print:hidden">
        <NextLink href="/" className={CONTROL_CLASS}>
          Retour au CV
        </NextLink>
        <PrintControls className={`${CONTROL_CLASS} bg-surface-raised shadow-sm`} />
      </header>
      {/* The A4 sheet keeps its physical size: narrow windows scroll it, never shrink it. */}
      <main id="content" className="overflow-x-auto px-6 pb-12 print:overflow-visible print:p-0">
        <article
          aria-label={`CV de ${cv.profile.full_name}`}
          data-theme="light"
          className="mx-auto flex min-h-[297mm] w-[210mm] bg-white shadow-elevation [print-color-adjust:exact] print:shadow-none"
        >
          <PrintSidebar {...cv} />
          <PrintContent {...cv} today={new Date()} />
        </article>
      </main>
    </>
  );
}
