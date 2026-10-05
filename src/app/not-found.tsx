import type { Metadata } from "next";
import NextLink from "next/link";
import { localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getMessages(await getLocale()).notFound.title, robots: { index: false } };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = getMessages(locale).notFound;
  return (
    <main id="content" className="section-shell flex min-h-dvh flex-col justify-center">
      <p className="title-display text-accent-display">404</p>
      <h1 className="mt-6 title-section">{t.title}</h1>
      <p className="mt-4 text-text-muted">{t.text}</p>
      <NextLink
        href={localePath(locale, "/")}
        className="mt-10 inline-flex min-h-11 w-fit items-center rounded-full bg-accent px-6 py-3 font-medium text-surface"
      >
        {t.back}
      </NextLink>
    </main>
  );
}
