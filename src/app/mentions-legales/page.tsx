import type { Metadata } from "next";
import NextLink from "next/link";
import { LocaleSwitch } from "@/components/ui/LocaleSwitch";
import { getProfile } from "@/lib/cv/queries";
import { buildAlternates } from "@/lib/cv/seo";
import { localePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { getLegalCopy, LINK_CLASS } from "./copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getLegalCopy(locale);
  const profile = await getProfile(locale);
  return {
    title: copy.title,
    description: copy.description(profile.full_name),
    alternates: buildAlternates(locale, "/mentions-legales"),
  };
}

export default async function LegalNoticePage() {
  const locale = await getLocale();
  const copy = getLegalCopy(locale);
  const profile = await getProfile(locale);
  const email = (
    <a href={`mailto:${profile.email}`} className={LINK_CLASS}>
      {profile.email}
    </a>
  );
  return (
    <main id="content" className="section-shell">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <NextLink
          href={localePath(locale, "/")}
          className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}
        >
          {copy.back}
        </NextLink>
        <LocaleSwitch
          locale={locale}
          path="/mentions-legales"
          className={`inline-flex min-h-11 items-center ${LINK_CLASS}`}
        />
      </div>
      <h1 className="mt-8 title-section">{copy.title}</h1>

      {copy.blocks.map((block) => (
        <section key={block.title} className="mt-12">
          <h2 className="title-card">{block.title}</h2>
          <div className="mt-3 grid max-w-3xl gap-3">
            {block
              .paragraphs({ locale, name: profile.full_name, email })
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
