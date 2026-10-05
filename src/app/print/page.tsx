import type { Metadata } from "next";
import NextLink from "next/link";
import { PrintContent } from "@/components/print/PrintContent";
import { PrintControls } from "@/components/print/PrintControls";
import { PrintSidebar } from "@/components/print/PrintSidebar";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { getCv } from "@/lib/cv/queries";
import { localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import "./print.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getMessages(locale).print;
  const { profile } = await getCv(locale);
  return {
    title: t.title,
    description: t.description(profile.full_name),
    robots: { index: false, follow: false },
  };
}

const CONTROL_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-medium text-accent underline-offset-4 hover:underline";

export default async function PrintPage() {
  const locale = await getLocale();
  const t = getMessages(locale).print;
  const cv = await getCv(locale);
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 print:hidden">
        <NextLink href={localePath(locale, "/")} className={CONTROL_CLASS}>
          {t.back}
        </NextLink>
        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} path="/print" className={CONTROL_CLASS} />
          <PrintControls
            label={t.printButton}
            className={`${CONTROL_CLASS} bg-surface-raised shadow-sm`}
          />
        </div>
      </header>
      {/* The A4 sheet keeps its physical size: narrow windows scroll it, never shrink it. */}
      <main id="content" className="overflow-x-auto px-6 pb-12 print:overflow-visible print:p-0">
        <article
          aria-label={t.articleLabel(cv.profile.full_name)}
          data-theme="light"
          className="mx-auto flex min-h-[297mm] w-[210mm] bg-white shadow-elevation [print-color-adjust:exact] print:shadow-none"
        >
          <PrintSidebar {...cv} locale={locale} />
          <PrintContent {...cv} today={new Date()} locale={locale} />
        </article>
      </main>
    </>
  );
}
